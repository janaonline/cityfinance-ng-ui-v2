import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Navigation, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ClaimLettersStates, UlbEligibility, UlbEligibilityRow } from '../claims-submission.models';
import { ClaimsSubmissionService } from '../claims-submission.service';
import { UlbEligibilityComponent } from './ulb-eligibility.component';

const row = (overrides: Partial<UlbEligibilityRow>): UlbEligibilityRow => ({
  slNo: 1,
  ulbId: 'u1',
  name: 'Agra',
  censusCode: '802001',
  sbCode: null,
  tied: 1_000_000,
  untied: 1_000_000,
  cells: ['Yes', 'Elected'],
  eligible: true,
  failedConditions: [],
  batch: null,
  ...overrides,
});

const page = (overrides: Partial<UlbEligibility> = {}): UlbEligibility => ({
  asOn: '2026-11-23T05:12:00.000Z',
  stateName: 'Uttar Pradesh',
  designYearLabel: '2026-27',
  installment: 1,
  stateGate: { passed: true, failedConditions: [] },
  noneStarted: false,
  columns: [
    { key: 'AUDITED', label: 'Audited accounts', header: 'Audited', kind: 'yesNo' },
    { key: 'ELECTED_BODY', label: 'Elected body', header: 'Elected body', kind: 'value' },
  ],
  conditions: [
    { key: 'AUDITED', label: 'Audited accounts' },
    { key: 'NO_ALLOCATION', label: 'No devolution allocation' },
  ],
  counts: {
    total: 3,
    eligible: 1,
    ineligible: 2,
    inLetter: 2,
    notInLetter: 1,
    eligibleNotInLetter: 0,
    batches: [
      { batchNumber: 1, count: 1 },
      { batchNumber: 3, count: 1 },
    ],
    letterStatuses: [
      { status: 2, count: 1 },
      { status: 15, count: 1 },
    ],
  },
  totals: { tied: 2_500_000, untied: 2_500_000 },
  items: [
    row({
      batch: { claimLetterId: 'c1', batchNumber: 1, status: 15, statusLabel: 'Under Review by SO', linkable: true },
    }),
    row({
      slNo: 2,
      ulbId: 'u2',
      name: 'Etah',
      cells: ['In Progress', 'Elected'],
      eligible: false,
      failedConditions: ['AUDITED'],
      batch: { claimLetterId: 'c3', batchNumber: 3, status: 2, statusLabel: 'Draft', linkable: false },
    }),
    row({
      slNo: 3,
      ulbId: 'u3',
      name: 'Hapur',
      // No census code: the Code column shows the SB code.
      censusCode: null,
      sbCode: 'SB20',
      tied: null,
      untied: null,
      eligible: false,
      failedConditions: ['NO_ALLOCATION'],
    }),
  ],
  pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
  ...overrides,
});

describe('UlbEligibilityComponent', () => {
  let fixture: ComponentFixture<UlbEligibilityComponent>;
  let service: jasmine.SpyObj<ClaimsSubmissionService>;
  let query$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let params$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  /** Mutable, so a test can move it to a new State the way the router does. */
  let routeSnapshot: { paramMap: ReturnType<typeof convertToParamMap>; queryParamMap: unknown; parent: null };
  let navigate: jasmine.Spy;

  const create = (): HTMLElement => {
    fixture = TestBed.createComponent(UlbEligibilityComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };
  const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const lastQuery = () => service.getUlbEligibility.calls.mostRecent().args[2];

  beforeEach(async () => {
    service = jasmine.createSpyObj<ClaimsSubmissionService>('ClaimsSubmissionService', [
      'getUlbEligibility',
      'getStates',
    ]);
    service.getUlbEligibility.and.returnValue(of(page()));
    service.getStates.and.returnValue(
      of({ states: [{ stateId: 's1', name: 'Uttar Pradesh' }] } as unknown as ClaimLettersStates),
    );
    query$ = new BehaviorSubject(convertToParamMap({}));
    params$ = new BehaviorSubject(convertToParamMap({ stateId: 's1' }));
    routeSnapshot = {
      paramMap: convertToParamMap({ stateId: 's1', yearId: 'y1' }),
      queryParamMap: convertToParamMap({}),
      parent: null,
    };
    await TestBed.configureTestingModule({
      imports: [UlbEligibilityComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ClaimsSubmissionService, useValue: service },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: params$,
            queryParamMap: query$,
            snapshot: routeSnapshot,
            parent: null,
          },
        },
      ],
    }).compileComponents();
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
  });

  it('loads the State for the URL year, 10 rows a page', () => {
    create();
    expect(service.getUlbEligibility).toHaveBeenCalledWith(
      's1',
      'y1',
      jasmine.objectContaining({ page: 1, limit: 10 }),
    );
    expect(lastQuery().refresh).toBeFalse();
  });

  it("shows the letter's condition columns, amounts, eligibility and batch", () => {
    const host = create();
    expect(text(host.querySelector('h1'))).toContain('Claim Eligibility');
    expect(text(host.querySelector('.cs-year'))).toBe('2026-27 · 1st installment');
    const headers = Array.from(host.querySelectorAll('thead th')).map(text);
    expect(headers).toEqual([
      'S.No',
      'ULB',
      'Code',
      'Eligibility',
      'Batch',
      'Audited',
      'Elected body',
      'Tied grant',
      'Untied grant',
    ]);

    const rows = host.querySelectorAll('tbody tr');
    expect(text(rows[0])).toContain('Agra');
    expect(text(rows[0])).toContain('₹ 10 Lakh');
    expect(rows[0].querySelector('.ue-batch-cell a')?.textContent).toContain('Batch 1');
    // The letter's status is an icon; its label is the tooltip and the accessible name.
    expect(rows[0].querySelector('.ue-status')?.getAttribute('aria-label')).toBe('Under Review by MoHUA');
    expect(rows[0].querySelector('.ue-status--review')).not.toBeNull();

    // A draft is plain text, and a ULB in a letter that is now ineligible is flagged.
    expect(rows[1].querySelector('.ue-batch-cell a')).toBeNull();
    expect(text(rows[1].querySelector('.ue-batch-cell'))).toContain('Batch 3');
    expect(rows[1].querySelector('.ue-status')?.getAttribute('aria-label')).toBe('Draft');
    expect(rows[1].querySelector('.ue-warn')).not.toBeNull();
    expect(rows[1].querySelector('.ue-cell--failed')?.textContent).toContain('In Progress');

    expect(text(rows[0].querySelector('.ue-code'))).toBe('802001');
    expect(text(rows[2].querySelector('.ue-code'))).toBe('SB20');
    expect(text(rows[2])).toContain('No devolution allocation');
    expect(text(host.querySelector('tfoot'))).toContain('Total (3 ULBs)');
  });

  it("links the ULB to its forms page and hands it this page's URL for its breadcrumb", () => {
    const host = create();
    const link = host.querySelector('.ue-name a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('review-state-submissions/s1/ulb/u1');
    expect(link.getAttribute('href')).not.toContain('claimLetter');

    const navigateByUrl = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    link.click();
    expect(navigateByUrl.calls.mostRecent().args[1]).toEqual(
      jasmine.objectContaining({ state: { ulbEligibilityUrl: jasmine.any(String) } }),
    );
  });

  it("hands the claim letter page this page's URL from the Batch link too", () => {
    const host = create();
    const navigateByUrl = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    (host.querySelector('.ue-batch-cell a') as HTMLAnchorElement).click();
    expect(navigateByUrl.calls.mostRecent().args[1]).toEqual(
      jasmine.objectContaining({ state: { ulbEligibilityUrl: jasmine.any(String) } }),
    );
  });

  it('shows the 14th FC unspent amount in the page units, like Tied and Untied', () => {
    service.getUlbEligibility.and.returnValue(
      of(
        page({
          columns: [{ key: 'FC_UNSPENT_STATE', label: '14th FC unspent', header: '14th FC unspent', kind: 'amount' }],
          items: [
            row({ cells: [''], amounts: [1_212_000] }),
            row({ slNo: 2, ulbId: 'u2', name: 'Etah', cells: ['Exempted'], amounts: [500_000] }),
            row({ slNo: 3, ulbId: 'u3', name: 'Hapur', cells: [''], amounts: [0] }),
          ],
        }),
      ),
    );
    const host = create();
    const cells = Array.from(host.querySelectorAll('tbody td.ue-cond')).map(text);
    expect(cells).toEqual(['₹ 12.12 Lakh', '₹ 5 Lakh (Exempted)', 'Nil']);
  });

  it('picks a filter from its menu, shows it on the pill and goes back to page 1', () => {
    const host = create();
    const batchPill = Array.from(host.querySelectorAll<HTMLButtonElement>('.ue-pill')).find((b) =>
      text(b).startsWith('Batch:'),
    )!;
    expect(text(batchPill)).toBe('Batch: All');
    batchPill.click();
    fixture.detectChanges();

    const option = Array.from(document.querySelectorAll<HTMLButtonElement>('.mat-mdc-menu-item')).find((b) =>
      text(b).startsWith('Batch 3'),
    )!;
    option.click();
    expect(navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { batch: '3', page: null } }));

    query$.next(convertToParamMap({ batch: '3' }));
    fixture.detectChanges();
    expect(text(batchPill)).toBe('Batch: Batch 3');
    expect(batchPill.classList).toContain('ue-pill--on');
  });

  it("goes Back to the State's letters when the page was opened directly", () => {
    const host = create();
    const back = spyOn(TestBed.inject(Location), 'back');
    const link = host.querySelector('a.cs-back') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('claims-submission/s1');
    spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    link.click();
    expect(back).not.toHaveBeenCalled();
  });

  it('goes Back in history when the user came from another page of the app', () => {
    spyOn(TestBed.inject(Router), 'getCurrentNavigation').and.returnValue({
      previousNavigation: {},
    } as unknown as Navigation);
    const host = create();
    const back = spyOn(TestBed.inject(Location), 'back');
    const navigateByUrl = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    expect(host.querySelector('a.cs-back')).toBeNull();
    (host.querySelector('button.cs-back') as HTMLButtonElement).click();
    expect(back).toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('sends a filter change to the URL and goes back to page 1', () => {
    create();
    fixture.componentInstance.setFilter('batch', '3');
    expect(navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({ queryParams: { batch: '3', page: null }, queryParamsHandling: 'merge' }),
    );
  });

  it('requests again with the filters in the URL', () => {
    create();
    query$.next(convertToParamMap({ batch: 'NONE', eligibility: 'INELIGIBLE', letterStatus: '2', page: '2' }));
    expect(lastQuery()).toEqual(
      jasmine.objectContaining({ batch: 'NONE', eligibility: 'INELIGIBLE', letterStatus: 2, page: 2 }),
    );
  });

  it('debounces the search', fakeAsync(() => {
    create();
    fixture.componentInstance.onSearch('agr');
    tick(100);
    expect(navigate).not.toHaveBeenCalled();
    tick(300);
    expect(navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { search: 'agr', page: null } }));
  }));

  it('searches the same word again after a Reset', fakeAsync(() => {
    create();
    const cmp = fixture.componentInstance;
    cmp.onSearch('agr');
    tick(300);
    query$.next(convertToParamMap({ search: 'agr' }));
    cmp.resetFilters();
    query$.next(convertToParamMap({}));
    navigate.calls.reset();

    cmp.onSearch('agr');
    tick(300);
    expect(navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { search: 'agr', page: null } }));
  }));

  it('drops a search still waiting on the debounce when Reset is pressed', fakeAsync(() => {
    query$.next(convertToParamMap({ batch: '1' }));
    create();
    const cmp = fixture.componentInstance;
    cmp.onSearch('agr');
    tick(100);
    cmp.resetFilters();
    query$.next(convertToParamMap({}));
    tick(300);
    expect(navigate.calls.allArgs().some(([, extras]) => extras?.queryParams?.['search'] === 'agr')).toBeFalse();
    expect(cmp.searchText()).toBe('');
  }));

  it('does not carry a search still waiting on the debounce to a new State', fakeAsync(() => {
    create();
    const cmp = fixture.componentInstance;
    cmp.onSearch('agr');
    tick(100);
    cmp.changeState('s2');
    routeSnapshot.paramMap = convertToParamMap({ stateId: 's2', yearId: 'y1' });
    query$.next(convertToParamMap({}));
    params$.next(convertToParamMap({ stateId: 's2' }));
    tick(300);
    expect(navigate.calls.allArgs().some(([, extras]) => extras?.queryParams?.['search'] === 'agr')).toBeFalse();
  }));

  it('never overwrites what the user is typing when the URL catches up', fakeAsync(() => {
    create();
    const cmp = fixture.componentInstance;
    cmp.onSearch('Agra ');
    tick(300);
    expect(navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({ queryParams: { search: 'Agra', page: null } }),
    );
    // More typed while that navigation runs, then the URL lands with the trimmed term.
    cmp.onSearch('Agra N');
    query$.next(convertToParamMap({ search: 'Agra' }));
    expect(cmp.searchText()).toBe('Agra N');
    tick(300);
  }));

  it('drops a batch the API would reject', () => {
    query$.next(convertToParamMap({ batch: 'abc' }));
    create();
    expect(lastQuery().batch).toBeUndefined();
    query$.next(convertToParamMap({ batch: '11' }));
    expect(lastQuery().batch).toBeUndefined();
    query$.next(convertToParamMap({ batch: '10' }));
    expect(lastQuery().batch).toBe('10');
  });

  it('offers Reset filters when a filtered first load fails', () => {
    service.getUlbEligibility.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Bad filter' } })),
    );
    query$.next(convertToParamMap({ condition: 'AUDITED' }));
    const host = create();
    expect(text(host.querySelector('.cs-error'))).toContain('Bad filter');
    (host.querySelector('.ue-error-reset') as HTMLButtonElement).click();
    expect(navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: { search: null, eligibility: null, batch: null, letterStatus: null, condition: null, page: null },
      }),
    );
  });

  it('sends one request, for the new State, when the State changes with filters on', () => {
    query$.next(convertToParamMap({ batch: '1' }));
    create();
    service.getUlbEligibility.calls.reset();
    // The router moves the snapshot first, then emits the query params, then the State id.
    routeSnapshot.paramMap = convertToParamMap({ stateId: 's2', yearId: 'y1' });
    query$.next(convertToParamMap({}));
    params$.next(convertToParamMap({ stateId: 's2' }));
    expect(service.getUlbEligibility).toHaveBeenCalledTimes(1);
    expect(service.getUlbEligibility.calls.mostRecent().args[0]).toBe('s2');
  });

  it("never shows the old State's rows under the new State, while loading or after a failure", () => {
    const host = create();
    expect(host.querySelectorAll('tbody tr').length).toBeGreaterThan(0);

    const next$ = new Subject<UlbEligibility>();
    service.getUlbEligibility.and.returnValue(next$);
    routeSnapshot.paramMap = convertToParamMap({ stateId: 's2', yearId: 'y1' });
    query$.next(convertToParamMap({}));
    params$.next(convertToParamMap({ stateId: 's2' }));
    fixture.detectChanges();
    expect(host.querySelectorAll('tbody tr').length).toBe(0);
    expect(host.querySelector('app-mohua-page-loader')).not.toBeNull();

    next$.error(new HttpErrorResponse({ status: 500 }));
    fixture.detectChanges();
    expect(host.querySelector('.cs-error')).not.toBeNull();
    expect(host.querySelectorAll('tbody tr').length).toBe(0);
  });

  it('rebuilds the check on Refresh', () => {
    create();
    fixture.componentInstance.refresh();
    expect(lastQuery().refresh).toBeTrue();
  });

  it('explains an empty search with the XVI FC cutoff', () => {
    service.getUlbEligibility.and.returnValue(
      of(page({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } })),
    );
    query$.next(convertToParamMap({ search: 'xyz' }));
    const host = create();
    const empty = text(host.querySelector('tbody'));
    expect(empty).toContain("No ULB matches 'xyz'.");
    expect(empty).toContain('formed after 31 March 2027');
    expect(host.querySelector('tfoot')).toBeNull();
  });

  describe('summary', () => {
    const summary = (host: HTMLElement) => [
      text(host.querySelector('.ue-summary__lead')),
      ...Array.from(host.querySelectorAll('.ue-summary__list li')).map(text),
    ];
    const withCounts = (counts: Partial<UlbEligibility['counts']>) =>
      service.getUlbEligibility.and.returnValue(of(page({ counts: { ...page().counts, ...counts } })));

    it('says how many are eligible, which batches hold ULBs, and whether eligible ULBs are left', () => {
      expect(summary(create())).toEqual([
        '1 of 3 ULBs is eligible; 2 are ineligible.',
        '2 ULBs are in claim letters: Batch 1 (1 ULB), Batch 3 (1 ULB).',
        'Every eligible ULB is in a claim letter.',
      ]);
    });

    it('reads well when every ULB is eligible and none is in a letter', () => {
      withCounts({ total: 20, eligible: 20, ineligible: 0, inLetter: 0, eligibleNotInLetter: 20, batches: [] });
      expect(summary(create())).toEqual([
        'All 20 ULBs are eligible.',
        'No ULB is in a claim letter yet.',
        '20 eligible ULBs are not in any claim letter yet.',
      ]);
    });

    it('drops the eligible bullet when no ULB is eligible', () => {
      withCounts({ total: 5, eligible: 0, ineligible: 5, inLetter: 0, eligibleNotInLetter: 0, batches: [] });
      expect(summary(create())).toEqual(['None of the 5 ULBs is eligible yet.', 'No ULB is in a claim letter yet.']);
    });

    it('uses the singular for one ULB', () => {
      withCounts({ inLetter: 1, eligibleNotInLetter: 1, batches: [{ batchNumber: 2, count: 1 }] });
      expect(summary(create()).slice(1)).toEqual([
        '1 ULB is in claim letters: Batch 2 (1 ULB).',
        '1 eligible ULB is not in any claim letter yet.',
      ]);
    });
  });

  it('shows the State banner and the none-started note', () => {
    service.getUlbEligibility.and.returnValue(
      of(
        page({
          noneStarted: true,
          stateGate: { passed: false, failedConditions: [{ label: 'SFC Status', statusLabel: 'Returned by PMU' }] },
        }),
      ),
    );
    const host = create();
    expect(text(host.querySelector('.alert-warning'))).toContain('SFC Status (Returned by PMU)');
    expect(text(host.querySelector('.alert-info'))).toContain('No ULB in this State has started its forms yet.');
  });
});
