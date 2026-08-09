import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';

import { IUserLoggedInDetails } from '../../../../core/models/login/userLoggedInDetails';
import { AuthService } from '../../../../core/services/auth.service';
import { StateDashboardComponent } from './state-dashboard.component';
import { StateDashboardApiResponse, StateDashboardData } from './state-dashboard.models';
import { StateDashboardService } from './state-dashboard.service';

describe('StateDashboardComponent', () => {
  const stateId = '000000000000000000000001';
  const yearId = '000000000000000000000002';

  let component: StateDashboardComponent;
  let fixture: ComponentFixture<StateDashboardComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let dashboardService: jasmine.SpyObj<StateDashboardService>;
  let yearParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    router.navigate.and.resolveTo(true);
    router.navigateByUrl.and.resolveTo(true);

    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUserSnapshot']);
    authService.getCurrentUserSnapshot.and.returnValue({ state: stateId } as IUserLoggedInDetails);

    dashboardService = jasmine.createSpyObj<StateDashboardService>('StateDashboardService', ['getDashboard']);
    yearParamMap$ = new BehaviorSubject(convertToParamMap({ yearId }));

    activatedRoute = {
      pathFromRoot: [{ paramMap: yearParamMap$.asObservable() }],
      snapshot: {
        paramMap: convertToParamMap({}),
        parent: {
          paramMap: convertToParamMap({ yearId }),
          parent: null,
        },
      },
    } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, StateDashboardComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: AuthService, useValue: authService },
        { provide: StateDashboardService, useValue: dashboardService },
      ],
    }).compileComponents();
  });

  it('creates', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('reads yearId from the route', () => {
    createComponent();
    expect(component.yearId).toBe(yearId);
  });

  it('reads stateId from the authenticated user context', () => {
    createComponent();
    expect(authService.getCurrentUserSnapshot).toHaveBeenCalled();
    expect(component.stateId).toBe(stateId);
  });

  it('calls getDashboard with the State and year IDs', () => {
    createComponent();
    expect(dashboardService.getDashboard).toHaveBeenCalledOnceWith(stateId, yearId);
  });

  it('does not call the API when the State ID is missing', () => {
    authService.getCurrentUserSnapshot.and.returnValue(null);
    createComponent();

    expect(dashboardService.getDashboard).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('State context is unavailable for the current user.');
  });

  it('does not call the API when the year ID is missing', () => {
    yearParamMap$.next(convertToParamMap({}));
    createComponent();

    expect(dashboardService.getDashboard).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('State or financial-year context is unavailable.');
  });

  it('shows the loading state while the request is pending', () => {
    const pending$ = new Subject<StateDashboardApiResponse>();
    createComponent(pending$);

    expect(component.isLoading).toBeTrue();
    expect(fixture.debugElement.query(By.css('[data-cy="dashboard-loading"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-cy="dashboard-content"]'))).toBeNull();
  });

  it('hides the loading state on success', () => {
    createComponent();
    expect(component.isLoading).toBeFalse();
    expect(fixture.debugElement.query(By.css('[data-cy="dashboard-loading"]'))).toBeNull();
  });

  it('hides the loading state on error', () => {
    createComponent(httpError(500));
    expect(component.isLoading).toBeFalse();
    expect(fixture.debugElement.query(By.css('[data-cy="dashboard-error"]'))).toBeTruthy();
  });

  it('stores response data unchanged', () => {
    createComponent();
    expect(component.dashboardData).toEqual(apiResponse.data);
  });

  it('renders the State name from the API', () => {
    createComponent();
    expect(textContent()).toContain('Test State');
  });

  it('renders the financial year from the API', () => {
    createComponent();
    expect(textContent()).toContain('2026-27');
  });

  it('renders the total ULB count', () => {
    createComponent();
    expect(metricValue('total-ulbs')).toBe('123');
  });

  it('renders the allocated amount', () => {
    createComponent();
    expect(metricValue('allocated')).toContain('15,62,00,00,000');
  });

  it('renders the claimed amount', () => {
    createComponent();
    expect(metricValue('claimed')).toBe('₹0 crore');
  });

  it('renders the compliance rate', () => {
    createComponent();
    expect(metricValue('compliance-rate')).toBe('18%');
  });

  it('renders the compliant ULB count', () => {
    createComponent();
    expect(textContent()).toContain('22 of 123 cities · all conditions met');
  });

  it('renders three State tasks', () => {
    createComponent();
    expect(fixture.debugElement.queryAll(By.css('.state-task-row')).length).toBe(3);
  });

  it('renders five ULB summary items', () => {
    createComponent();
    expect(fixture.debugElement.queryAll(By.css('.status-tile')).length).toBe(5);
  });

  it('renders five form-completion rows', () => {
    createComponent();
    expect(fixture.debugElement.queryAll(By.css('.completion-row')).length).toBe(5);
  });

  it('renders two claim-letter rows', () => {
    createComponent();
    expect(fixture.debugElement.queryAll(By.css('.claim-letter-row')).length).toBe(2);
  });

  it('formats 15620000000 without converting its numeric scale', () => {
    createComponent();
    expect(component.formatAmount(15_620_000_000, 'INR', 'CRORE')).toBe('₹15,62,00,00,000 crore');
  });

  it('displays CRORE as the amount unit label', () => {
    createComponent();
    expect(metricValue('allocated')).toContain('crore');
  });

  it('displays INR with the rupee symbol', () => {
    createComponent();
    expect(metricValue('allocated')).toContain('₹');
  });

  it('does not mutate the API allocated amount', () => {
    createComponent();
    expect(apiResponse.data.metrics.allocatedAmount).toBe(15_620_000_000);
    expect(component.dashboardData?.metrics.allocatedAmount).toBe(15_620_000_000);
  });

  it('calculates completion percentage from completed and total', () => {
    createComponent();
    expect(component.getCompletionPercentage(57, 123)).toBe(46);
  });

  it('returns zero completion percentage when total is zero', () => {
    createComponent();
    expect(component.getCompletionPercentage(10, 0)).toBe(0);
  });

  it('clamps progress percentage to the range 0–100', () => {
    createComponent();
    expect(component.getCompletionPercentage(-5, 10)).toBe(0);
    expect(component.getCompletionPercentage(15, 10)).toBe(100);
  });

  for (const [status, message] of [
    [401, 'Your session has expired. Please sign in again.'],
    [403, 'You are not authorised to view this State dashboard.'],
    [404, 'Dashboard data is unavailable for the selected State and financial year.'],
    [500, 'The State dashboard could not be loaded. Please try again.'],
  ] as const) {
    it(`displays the controlled HTTP ${status} message`, () => {
      createComponent(httpError(status));
      expect(component.errorMessage).toBe(message);
      expect(textContent()).toContain(message);
    });
  }

  it('displays the controlled network error message', () => {
    createComponent(httpError(0));
    expect(component.errorMessage).toBe('Unable to connect to the server. Please try again.');
  });

  it('does not render raw backend error objects', () => {
    const rawMessage = 'MongoServerError: secret internal path';
    createComponent(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: rawMessage, stack: 'internal stack' },
          }),
      ),
    );

    expect(textContent()).not.toContain(rawMessage);
    expect(textContent()).not.toContain('internal stack');
  });

  it('retry calls the dashboard service again', () => {
    createComponent(httpError(500));
    dashboardService.getDashboard.and.returnValue(of(apiResponse));

    component.retryDashboard();
    fixture.detectChanges();

    expect(dashboardService.getDashboard).toHaveBeenCalledTimes(2);
  });

  it('retry clears the previous error', () => {
    createComponent(httpError(500));
    dashboardService.getDashboard.and.returnValue(of(apiResponse));

    component.retryDashboard();
    fixture.detectChanges();

    expect(component.errorMessage).toBeNull();
    expect(component.dashboardData).toEqual(apiResponse.data);
  });

  it('retry reuses the component without reloading the browser page', () => {
    createComponent(httpError(500));
    const originalComponent = component;
    dashboardService.getDashboard.and.returnValue(of(apiResponse));

    component.retryDashboard();
    fixture.detectChanges();

    expect(component).toBe(originalComponent);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('shows the empty state when a successful response has no data', () => {
    const emptyResponse = { ...apiResponse, data: null } as unknown as StateDashboardApiResponse;
    createComponent(of(emptyResponse));

    expect(component.isEmpty).toBeTrue();
    expect(fixture.debugElement.query(By.css('[data-cy="dashboard-empty"]'))).toBeTruthy();
  });

  it('does not show the empty state for valid zero-valued data', () => {
    const zeroResponse: StateDashboardApiResponse = {
      ...apiResponse,
      data: {
        ...apiResponse.data,
        metrics: {
          ...apiResponse.data.metrics,
          totalUlbs: 0,
          allocatedAmount: 0,
          claimedAmount: 0,
          compliance: { rate: 0, compliantUlbs: 0, totalUlbs: 0 },
        },
      },
    };
    createComponent(of(zeroResponse));

    expect(component.isEmpty).toBeFalse();
    expect(component.dashboardData).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="dashboard-content"]'))).toBeTruthy();
  });

  it('shows the Start action for an available claim letter', () => {
    createComponent();
    const availableRow = fixture.debugElement.query(By.css('[data-claim-key="installment-1-batch-1"]'));
    expect((availableRow.nativeElement as HTMLElement).textContent).toContain('Start');
  });

  it('does not show an active CTA for a locked claim letter', () => {
    createComponent();
    const lockedRow = fixture.debugElement.query(By.css('[data-claim-key="installment-2"]'));
    expect(lockedRow.query(By.css('button'))).toBeNull();
    expect((lockedRow.nativeElement as HTMLElement).textContent).toContain('Locked');
  });

  it('keeps Instalment 2 locked according to the API status', () => {
    createComponent();
    const lockedRow = fixture.debugElement.query(By.css('[data-claim-key="installment-2"]'));
    expect(lockedRow.classes['claim-letter-row--locked']).toBeTrue();
    expect((lockedRow.nativeElement as HTMLElement).textContent).toContain(
      'The first Instalment 1 Claim Letter has not been generated.',
    );
  });

  it('cancels the pending dashboard subscription when destroyed', () => {
    const pending$ = new Subject<StateDashboardApiResponse>();
    createComponent(pending$);
    expect(pending$.observed).toBeTrue();

    fixture.destroy();
    expect(pending$.observed).toBeFalse();
  });

  it('reloads once with the changed route year ID', () => {
    createComponent();
    const changedYearId = '000000000000000000000003';

    yearParamMap$.next(convertToParamMap({ yearId: changedYearId }));

    expect(component.yearId).toBe(changedYearId);
    expect(dashboardService.getDashboard).toHaveBeenCalledWith(stateId, changedYearId);
    expect(dashboardService.getDashboard).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the route emits the same year ID again', () => {
    createComponent();

    yearParamMap$.next(convertToParamMap({ yearId }));

    expect(dashboardService.getDashboard).toHaveBeenCalledOnceWith(stateId, yearId);
  });

  function createComponent(response$: Observable<StateDashboardApiResponse> = of(apiResponse)): void {
    dashboardService.getDashboard.and.returnValue(response$);
    fixture = TestBed.createComponent(StateDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function httpError(status: number): Observable<StateDashboardApiResponse> {
    return throwError(() => new HttpErrorResponse({ status, statusText: 'Error' }));
  }

  function metricValue(key: string): string {
    const metric = fixture.debugElement.query(By.css(`[data-metric-key="${key}"] .metric-card__value`));
    return (metric.nativeElement as HTMLElement).textContent?.trim() ?? '';
  }

  function textContent(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }
});

const dashboardData: StateDashboardData = {
  context: {
    stateId: '000000000000000000000001',
    stateName: 'Test State',
    yearId: '000000000000000000000002',
    financialYear: '2026-27',
    userRole: 'STATE',
    grantType: null,
  },
  metrics: {
    totalUlbs: 123,
    allocatedAmount: 15_620_000_000,
    claimedAmount: 0,
    amountUnit: 'CRORE',
    currency: 'INR',
    compliance: { rate: 18, compliantUlbs: 22, totalUlbs: 123 },
  },
  stateDataTasks: [
    {
      key: 'ulb-registration',
      title: 'Register new ULBs',
      subtitle: 'Keep the state master list of 123 ULBs up to date',
      status: 'DONE',
      actionLabel: null,
      route: null,
    },
    {
      key: 'devolution-formula',
      title: 'Fill in the ULB-wise allocation',
      subtitle: 'Allocation and instalment split for each ULB',
      status: 'PENDING',
      actionLabel: 'Continue',
      route: null,
    },
    {
      key: 'state-conditions',
      title: 'Submit other state conditions',
      subtitle: 'SFC status and elected body confirmation',
      status: 'PENDING',
      actionLabel: 'Continue',
      route: null,
    },
  ],
  ulbSubmissionSummary: [
    { key: 'NOT_STARTED', label: 'Not Started', count: 1, description: 'No forms submitted yet' },
    { key: 'IN_PROGRESS', label: 'In Progress', count: 100, description: 'Some forms remain incomplete' },
    { key: 'UNDER_REVIEW', label: 'Under Review', count: 10, description: 'Awaiting review' },
    { key: 'ELIGIBLE', label: 'Eligible', count: 12, description: 'All forms cleared' },
    { key: 'EXEMPTION_REQUESTED', label: 'Exemption Requested', count: 0, description: 'Pending review' },
  ],
  formCompletion: [
    { key: 'annual-accounts', label: 'Annual Accounts', completed: 67, total: 123 },
    { key: 'provisional-accounts', label: 'Provisional Accounts', completed: 57, total: 123 },
    { key: 'pfms-bank-account', label: 'PFMS Bank Account', completed: 59, total: 123 },
    { key: 'fc-unspent-balance', label: 'FC Unspent Balance', completed: 0, total: 123 },
    { key: 'service-level-benchmarks', label: 'Service Level Benchmarks', completed: 0, total: 123 },
  ],
  claimLetters: [
    {
      key: 'installment-1-batch-1',
      title: 'Generate the first Claim Letter',
      subtitle: 'Instalment 1 · Batch 1 — 12 approved ULBs ready to include',
      installment: 1,
      status: 'AVAILABLE',
      actionLabel: 'Start',
      lockReason: null,
      route: null,
    },
    {
      key: 'installment-2',
      title: 'Instalment 2 Claim Letter',
      subtitle: 'Opens after the first Instalment 1 Claim Letter is generated',
      installment: 2,
      status: 'LOCKED',
      actionLabel: null,
      lockReason: 'The first Instalment 1 Claim Letter has not been generated.',
      route: null,
    },
  ],
};

const apiResponse: StateDashboardApiResponse = {
  success: true,
  message: 'State dashboard fetched successfully',
  data: dashboardData,
  timestamp: '2026-07-14T10:00:00.000Z',
  requestId: 'req-test',
};
