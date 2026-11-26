import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthPermissionService } from '../../../../core/auth/auth-permission.service';
import { StateClaimLetters } from '../claims-submission/claims-submission.models';
import { ClaimsSubmissionService } from '../claims-submission/claims-submission.service';
import { MohuaStateDetailService } from './mohua-state-detail.service';
import { MohuaStateUlbsService } from './mohua-state-ulbs.service';
import { StateDetailComponent } from './state-detail.component';
import { StateDetailData, StateUlbsPage } from './state-detail.models';

const detail: StateDetailData = {
  year: { id: 'year-1', label: '2026-27' },
  state: { id: 'state-1', code: 'TR', name: 'Tripura', status: 'progress' },
  allocation: 130,
  formsDone: 1,
  forms: [
    {
      key: 'SFC_STATUS',
      label: 'SFC Status',
      statusCode: 5,
      statusLabel: 'Under Review by MoHUA',
      completed: true,
      approved: true,
      canView: true,
    },
    {
      key: 'GTC',
      label: 'Grant Transfer Certificate',
      statusCode: 0,
      statusLabel: 'Not Started',
      completed: false,
      approved: false,
      canView: false,
    },
    {
      key: 'DEVOLUTION',
      label: 'Devolution',
      statusCode: 2,
      statusLabel: 'In Progress',
      completed: false,
      approved: false,
      canView: true,
    },
  ],
  ulbForms: {
    totalUlbs: 21,
    items: [
      { key: 'AUDITED', label: 'Annual Accounts', completed: 0 },
      { key: 'DUR', label: 'DUR', completed: 20 },
    ],
  },
};

const ulbs: StateUlbsPage = {
  items: [
    {
      ulbId: 'ulb-1',
      name: 'Agartala Municipal Corporation',
      censusCode: '800001',
      allocation: 12.5,
      unspentAmount: 3.4,
      electedBody: 'Constituted',
      forms: { audited: false, unaudited: false, pfms: true, slb: false, dur: true },
    },
  ],
  pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
};

const letter = (id: string, status: number, amount: number, ulbCount: number) => ({
  id,
  number: `CL/TR/2026-27/1-${id}`,
  batchNumber: 1,
  receivedOn: '2026-11-17T00:00:00.000Z',
  ulbCount,
  amount,
  status,
  statusLabel: '',
});

const stateClaims: StateClaimLetters = {
  state: { id: 'state-1', name: 'Tripura' },
  installment: 1,
  summary: {
    claimedUlbs: 5,
    pendingUlbs: 16,
    approvedUlbs: 2,
    underReviewUlbs: 3,
    returnedUlbs: 2,
    amountClaimed: 0,
    balance: 0,
  },
  claimLetters: [letter('3', 15, 93_000_000, 3), letter('2', 16, 62_000_000, 2), letter('1', 5, 62_000_000, 2)],
};

describe('StateDetailComponent', () => {
  let detailService: { getDetail: jasmine.Spy };
  let claimsService: { getStateClaimLetters: jasmine.Spy };
  let isMohuaUser: boolean;
  let isPmuUser: boolean;
  let ulbsService: { getUlbs: jasmine.Spy };

  const create = () => {
    const paramMap = convertToParamMap({ stateId: 'state-1', yearId: 'year-1' });
    TestBed.configureTestingModule({
      imports: [StateDetailComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MohuaStateDetailService, useValue: detailService },
        { provide: MohuaStateUlbsService, useValue: ulbsService },
        { provide: ClaimsSubmissionService, useValue: claimsService },
        { provide: AuthPermissionService, useValue: { isMohuaUser: () => isMohuaUser, isPmuUser: () => isPmuUser } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap, parent: null }, paramMap: of(paramMap), parent: null },
        },
      ],
    });
    const fixture = TestBed.createComponent(StateDetailComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    detailService = { getDetail: jasmine.createSpy('getDetail').and.returnValue(of(detail)) };
    ulbsService = { getUlbs: jasmine.createSpy('getUlbs').and.returnValue(of(ulbs)) };
    claimsService = {
      getStateClaimLetters: jasmine.createSpy('getStateClaimLetters').and.returnValue(of(stateClaims)),
    };
    isMohuaUser = true;
    isPmuUser = false;
  });

  it('loads the state and its first page of ULBs for the ids in the route', () => {
    const fixture = create();

    expect(detailService.getDetail).toHaveBeenCalledOnceWith('state-1', 'year-1');
    expect(ulbsService.getUlbs).toHaveBeenCalledOnceWith('state-1', 'year-1', {
      page: 1,
      limit: 15,
      search: '',
      sortBy: 'ulbName',
      sortDir: 'asc',
    });
    expect(fixture.componentInstance.stateName()).toBe('Tripura');
    expect(fixture.componentInstance.ulbs().length).toBe(1);
    expect(fixture.componentInstance.ulbTotal()).toBe(1);
  });

  it("shows each ULB's unspent balance beside its allocation", () => {
    const fixture = create();
    const el: HTMLElement = fixture.nativeElement;

    const headers = Array.from(el.querySelectorAll('.sd-table th')).map((th) => th.textContent?.trim());
    expect(headers.indexOf('Unspent balance')).toBe(headers.indexOf('Allocation') + 1);

    const cells = Array.from(el.querySelectorAll('.sd-table tbody tr:first-child td')).map((td) =>
      td.textContent?.trim(),
    );
    expect(cells).toContain('₹12.5 cr'); // allocation
    expect(cells).toContain('₹3.4 cr'); // unspent balance
  });

  it('adds up the claim letters by stage; Recommended to DoE stays "Coming soon"', () => {
    const fixture = create();
    const stats = fixture.componentInstance.stats();

    expect(claimsService.getStateClaimLetters).toHaveBeenCalledOnceWith('state-1', 'year-1');
    expect(stats.map((stat) => [stat.label, stat.value, stat.note])).toEqual([
      ['Annual Allocation', '₹130 cr', ''],
      ['Eligible Amount', '--', ''],
      ['Under Review by MoHUA', '₹9.3 cr', '1 letter · 3 ULBs'],
      ['Returned by MoHUA', '₹6.2 cr', '1 letter · 2 ULBs'],
      ['Approved by MoHUA', '₹6.2 cr', '1 letter · 2 ULBs'],
      ['Recommended to DoE', 'Coming soon', ''],
    ]);
  });

  it('lists the claim letters with View links for MoHUA and PMU (PMU read-only), and without them for DoE', () => {
    let host = create().nativeElement as HTMLElement;
    expect(host.querySelectorAll('.sd-claim').length).toBe(3);
    expect(host.querySelector('.sd-claim a')?.getAttribute('aria-label')).toBe('View claim letter CL/TR/2026-27/1-3');

    TestBed.resetTestingModule();
    isMohuaUser = false;
    isPmuUser = true;
    host = create().nativeElement as HTMLElement;
    expect(host.querySelector('.sd-claim a')).not.toBeNull();

    TestBed.resetTestingModule();
    isPmuUser = false; // DoE
    host = create().nativeElement as HTMLElement;
    expect(host.querySelectorAll('.sd-claim').length).toBe(3);
    expect(host.querySelector('.sd-claim a')).toBeNull();
  });

  it('links to Claim Eligibility beside "See all claims" for MoHUA and PMU, even before the first letter, and not for DoE', () => {
    const actions = (host: HTMLElement) =>
      Array.from(host.querySelectorAll('.sd-claims__actions a')).map((a) => a.textContent?.trim());
    let host = create().nativeElement as HTMLElement;
    expect(actions(host)).toEqual(['Claim eligibility', 'See all claims']);
    expect(host.querySelector('[data-cy="state-detail-eligibility-link"]')?.getAttribute('href')).toBe(
      '/claims-submission/state-1/ulb-eligibility',
    );

    TestBed.resetTestingModule();
    claimsService.getStateClaimLetters.and.returnValue(of({ ...stateClaims, claimLetters: [] }));
    isMohuaUser = false;
    isPmuUser = true;
    host = create().nativeElement as HTMLElement;
    expect(actions(host)).toEqual(['Claim eligibility']);

    TestBed.resetTestingModule();
    isPmuUser = false; // DoE
    host = create().nativeElement as HTMLElement;
    expect(host.querySelector('[data-cy="state-detail-eligibility-link"]')).toBeNull();
  });

  it('shows the real allocation, "--" for eligible, and "Coming soon" for every claim figure when claims fail to load', () => {
    claimsService.getStateClaimLetters.and.returnValue(throwError(() => new Error('boom')));
    const stats = create().componentInstance.stats();

    expect(stats.map((stat) => [stat.label, stat.value])).toEqual([
      ['Annual Allocation', '₹130 cr'],
      ['Eligible Amount', '--'],
      ['Under Review by MoHUA', 'Coming soon'],
      ['Returned by MoHUA', 'Coming soon'],
      ['Approved by MoHUA', 'Coming soon'],
      ['Recommended to DoE', 'Coming soon'],
    ]);
  });

  it('links a state form to its read-only screen only when the API says MoHUA can open it', () => {
    const fixture = create();
    const conditions = fixture.componentInstance.conditions();

    expect(conditions[0].viewLink).toEqual(['review-state-submissions', 'state-1', 'sfc-status']);
    expect(conditions[1].viewLink).toBeNull();
    expect(conditions[2].viewLink).toEqual(['review-state-submissions', 'state-1', 'devolution-formula', '1']);
    expect(fixture.nativeElement.querySelectorAll('.sd-cond .sd-cond__pdf').length).toBe(2);
  });

  it('shows the status of a form that is not submitted instead of a tick', () => {
    const text: string = create().nativeElement.querySelector('.sd-cond')?.textContent ?? '';

    expect(text).toContain('Not Started');
    expect(text).toContain('In Progress');
  });

  it('ticks a form only once PMU approved it; one still with PMU (13) shows "Under Review by PMU" instead', () => {
    detailService.getDetail.and.returnValue(
      of({
        ...detail,
        forms: [
          { ...detail.forms[0], statusCode: 15, statusLabel: 'Under Review by MoHUA', completed: true, approved: true },
          { ...detail.forms[1], statusCode: 13, statusLabel: 'Under Review by PMU', completed: true, approved: false },
        ],
      }),
    );
    const items = Array.from(create().nativeElement.querySelectorAll('.sd-cond__item')) as HTMLElement[];

    expect(items[0].querySelector('.sd-cond__stamp')).not.toBeNull();
    expect(items[1].querySelector('.sd-cond__stamp')).toBeNull();
    expect(items[1].textContent).toContain('Under Review by PMU');
  });

  it('sorts and pages through the API, always from page 1 after a sort', () => {
    const fixture = create();
    ulbsService.getUlbs.calls.reset();

    fixture.componentInstance.onPage({ pageIndex: 2, pageSize: 15, length: 50 });
    expect(ulbsService.getUlbs.calls.mostRecent().args[2]).toEqual(jasmine.objectContaining({ page: 3 }));

    fixture.componentInstance.onSort({ active: 'allocation', direction: 'desc' });
    expect(ulbsService.getUlbs.calls.mostRecent().args[2]).toEqual(
      jasmine.objectContaining({ page: 1, sortBy: 'allocation', sortDir: 'desc' }),
    );

    fixture.componentInstance.onSort({ active: 'allocation', direction: '' });
    expect(ulbsService.getUlbs.calls.mostRecent().args[2]).toEqual(
      jasmine.objectContaining({ sortBy: 'ulbName', sortDir: 'asc' }),
    );
  });

  it('waits for a pause in typing before searching', fakeAsync(() => {
    const fixture = create();
    ulbsService.getUlbs.calls.reset();

    const type = (value: string) => fixture.componentInstance.onSearch({ target: { value } } as unknown as Event);
    type('chi');
    tick(100);
    type('chirala');
    tick(299);
    expect(ulbsService.getUlbs).not.toHaveBeenCalled();

    tick(1);
    expect(ulbsService.getUlbs).toHaveBeenCalledTimes(1);
    expect(ulbsService.getUlbs.calls.mostRecent().args[2]).toEqual(
      jasmine.objectContaining({ search: 'chirala', page: 1 }),
    );
  }));
});
