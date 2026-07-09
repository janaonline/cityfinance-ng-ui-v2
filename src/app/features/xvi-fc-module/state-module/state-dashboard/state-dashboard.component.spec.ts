import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { StateDashboardComponent } from './state-dashboard.component';

describe('StateDashboardComponent', () => {
  const yearId = '67d7d136d3d038946a5239e9';

  let component: StateDashboardComponent;
  let fixture: ComponentFixture<StateDashboardComponent>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-id', stateName: 'Kerala' }));
    localStorage.setItem('xvifc_selectedYearString', 'FY-2027-28');

    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);

    activatedRoute = {
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StateDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('userData');
    localStorage.removeItem('xvifc_selectedYearString');
  });

  it('creates successfully', () => {
    expect(component).toBeTruthy();
  });

  it('reads yearId from route ancestors', () => {
    expect(component.yearId).toBe(yearId);
  });

  it('renders the state name', () => {
    expect(textContent()).toContain('Kerala');
  });

  it('renders the selected financial year from stored year context', () => {
    expect(textContent()).toContain('FY 2027-28');
  });

  it('updates metric descriptions with stored state and year context', () => {
    const metricDescriptions = fixture.debugElement
      .queryAll(By.css('.metric-card__description'))
      .map((debugElement) => (debugElement.nativeElement as HTMLElement).textContent?.trim());

    expect(metricDescriptions).toContain('Kerala · FY 2027-28');
    expect(metricDescriptions).toContain('Basic Grants · FY 2027-28');
  });

  it('renders 4 metric cards', () => {
    expect(fixture.debugElement.queryAll(By.css('.metric-card')).length).toBe(4);
  });

  it('renders an icon badge for each metric card', () => {
    expect(fixture.debugElement.queryAll(By.css('.metric-card__icon')).length).toBe(4);
  });

  it('renders 3 state data task rows', () => {
    expect(component.dashboardData.stateDataTasks.length).toBe(3);
    expect(fixture.debugElement.queryAll(By.css('.state-task-row')).length).toBe(3);
  });

  it('renders 5 ULB submission status tiles', () => {
    expect(fixture.debugElement.queryAll(By.css('.status-tile')).length).toBe(5);
  });

  it('renders an icon badge for each ULB submission status tile', () => {
    expect(fixture.debugElement.queryAll(By.css('.status-tile__icon')).length).toBe(5);
  });

  it('renders 5 form completion rows', () => {
    expect(fixture.debugElement.queryAll(By.css('.completion-row')).length).toBe(5);
  });

  it('renders a progress line for each form completion row', () => {
    expect(fixture.debugElement.queryAll(By.css('.completion-progress')).length).toBe(5);
  });

  it('renders 2 claim letter rows', () => {
    expect(component.dashboardData.claimLetters.length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('.claim-letter-row')).length).toBe(2);
    expect(textContent()).toContain('Generate the first Claim Letter');
    expect(textContent()).toContain('Instalment 2 Claim Letter');
  });

  it('Continue action calls the expected handler', () => {
    spyOn(component, 'onSubmitOtherStateConditions');

    fixture.debugElement.query(By.css('[data-cy="state-dashboard-continue"]')).nativeElement.click();

    expect(component.onSubmitOtherStateConditions).toHaveBeenCalledTimes(1);
  });

  it('View ULB Submissions action calls the expected handler', () => {
    spyOn(component, 'onViewUlbSubmissions');

    fixture.debugElement.query(By.css('[data-cy="state-dashboard-view-ulb-submissions"]')).nativeElement.click();

    expect(component.onViewUlbSubmissions).toHaveBeenCalledTimes(1);
  });

  it('navigates to requirements for other state conditions', () => {
    component.onSubmitOtherStateConditions();

    expect(router.navigate).toHaveBeenCalledOnceWith(['../requirements'], { relativeTo: activatedRoute });
  });

  it('navigates to existing ULB submissions route', () => {
    component.onViewUlbSubmissions();

    expect(router.navigate).toHaveBeenCalledOnceWith(['../ulb-submissions'], { relativeTo: activatedRoute });
  });

  function textContent(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }
});
