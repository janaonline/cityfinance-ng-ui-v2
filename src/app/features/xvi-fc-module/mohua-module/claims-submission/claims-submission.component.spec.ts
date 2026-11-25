import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClaimsSubmissionComponent } from './claims-submission.component';
import { ClaimLettersStates } from './claims-submission.models';
import { ClaimsSubmissionService } from './claims-submission.service';

const states: ClaimLettersStates = {
  year: { id: 'y1', label: '2026-27' },
  installment: 1,
  overview: {
    totalAllocation: 9_900_000_000,
    stateCount: 2,
    submitted: { claims: 3, states: 1, amount: 4_320_000_000 },
    underReview: { claims: 1, states: 1, amount: 1_880_000_000 },
    approved: { claims: 2, states: 1, amount: 2_440_000_000 },
    returned: { claims: 0, states: 0, amount: 0 },
  },
  states: [
    {
      stateId: 's1',
      name: 'Andhra Pradesh',
      code: 'AP',
      firstClaimStatus: 'RECEIVED',
      installmentAllocation: 7_810_000_000,
      amountClaimed: 4_320_000_000,
      ulbsIncluded: 72,
      totalUlbs: 123,
      claimLetterCount: 3,
      latestClaimNumber: 3,
    },
    {
      stateId: 's2',
      name: 'Assam',
      code: 'AS',
      firstClaimStatus: 'PENDING',
      installmentAllocation: 2_090_000_000,
      amountClaimed: null,
      ulbsIncluded: null,
      totalUlbs: 98,
      claimLetterCount: 0,
      latestClaimNumber: null,
    },
  ],
};

describe('ClaimsSubmissionComponent', () => {
  let fixture: ComponentFixture<ClaimsSubmissionComponent>;
  let service: jasmine.SpyObj<ClaimsSubmissionService>;

  const create = (): HTMLElement => {
    fixture = TestBed.createComponent(ClaimsSubmissionComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj<ClaimsSubmissionService>('ClaimsSubmissionService', [
      'getStates',
      'getStateClaimLetters',
    ]);
    service.getStates.and.returnValue(of(states));
    await TestBed.configureTestingModule({
      imports: [ClaimsSubmissionComponent],
      providers: [provideRouter([]), provideNoopAnimations(), { provide: ClaimsSubmissionService, useValue: service }],
    }).compileComponents();
  });

  it('lists every state, with figures in crore and a dash where a state has nothing claimed', () => {
    const rows = Array.from(create().querySelectorAll('tbody tr'));

    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Andhra Pradesh');
    expect(rows[0].textContent).toContain('3rd');
    expect(rows[0].textContent).toContain('₹781 cr');
    expect(rows[0].textContent).toContain('₹432 cr');
    expect(rows[0].textContent).toContain('72');
    expect(rows[1].textContent).toContain('—');
  });

  it('has no first-claim status column; the status only decides the action', () => {
    const host = create();
    const headers = Array.from(host.querySelectorAll('thead th')).map((th) => th.textContent?.trim());

    expect(headers).toEqual([
      'State',
      'Claim no.',
      'Allocation for Installment 1',
      'Amount claimed',
      'ULBs included',
      'Action',
    ]);
    expect(host.querySelector('tbody .cs-badge')).toBeNull();
    expect(host.querySelector('tbody')?.textContent).not.toContain('Received');
    expect(host.querySelector('tbody')?.textContent).not.toContain('Pending');
  });

  it("shows the amount claimed as a share of the allocation, and ULBs included out of the State's ULBs", () => {
    const rows = Array.from(create().querySelectorAll<HTMLElement>('tbody tr'));

    // ₹432 cr of ₹781 cr = 55%; a State with no claim has no percentage.
    expect(rows[0].querySelector('.cl-pct')?.textContent?.trim()).toBe('55% of allocation');
    expect(rows[1].querySelector('.cl-pct')).toBeNull();
    const ulbs = (row: HTMLElement) => row.querySelector('.cl-ulbs-of')?.textContent?.replace(/\s+/g, ' ').trim();
    expect(ulbs(rows[0])).toBe('72 / 123');
    expect(ulbs(rows[1])).toBe('0 / 98');
  });

  it('shows "<1%" for a claim under one percent, and no percentage without an allocation', () => {
    create();
    const row = states.states[0];

    expect(fixture.componentInstance.claimedPercent({ ...row, amountClaimed: 62_000_000 })).toBe('<1%'); // 0.79%
    expect(fixture.componentInstance.claimedPercent({ ...row, installmentAllocation: null })).toBeNull();
    expect(fixture.componentInstance.claimedPercent({ ...row, installmentAllocation: 0 })).toBeNull();
  });

  it('offers View claims only for a state whose claim letter has arrived; Pending states get a disabled Track', () => {
    const rows = Array.from(create().querySelectorAll('tbody tr'));

    expect(rows[0].querySelector('a')?.textContent).toContain('View claims');
    expect(rows[0].querySelector('button:not(.cl-expand)')).toBeNull();
    const track = rows[1].querySelector('button') as HTMLButtonElement;
    expect(track.textContent).toContain('Track');
    expect(track.disabled).toBeTrue();
    expect(rows[1].querySelector('a')).toBeNull();
  });

  describe('national overview', () => {
    it('shows the total allocation, then the claims pipeline above the States table', () => {
      const host = create();

      const overview = host.querySelector('.cl-overview') as HTMLElement;
      const table = host.querySelector('.cl-states') as HTMLElement;
      expect(overview.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(overview.querySelector('.cl-overview__hero-sub')?.textContent).toContain('across 2 states');

      const labels = Array.from(overview.querySelectorAll('.cl-pipeline__label')).map((l) => l.textContent?.trim());
      expect(labels).toEqual(['Submitted', 'Under review by MoHUA', 'Approved', 'Released']);

      // Values count up on screen, so they are read from the model; subs and amounts are plain text.
      const p = fixture.componentInstance.pipeline();
      expect(p?.allocation).toBe('₹990 cr');
      expect(p?.steps.map((s) => s.value)).toEqual(['3 claims', '1 claim', '2 claims', null]);
      const subs = Array.from(overview.querySelectorAll('.cl-pipeline__sub')).map((s) => s.textContent?.trim());
      expect(subs).toEqual(['from 1 of 2 states', 'of 3 claims', 'of 3 claims', 'by DoE']);
      const amounts = Array.from(overview.querySelectorAll('.cl-pipeline__amount')).map((a) => a.textContent?.trim());
      expect(amounts).toEqual(['₹432 cr', '₹188 cr', '₹244 cr']);
    });

    it('shows Released as "Coming soon" until the DoE release step exists, and notes returned claims', () => {
      service.getStates.and.returnValue(
        of({ ...states, overview: { ...states.overview, returned: { claims: 1, states: 1, amount: 0 } } }),
      );

      const host = create();

      const steps = Array.from(host.querySelectorAll<HTMLElement>('.cl-pipeline__step'));
      expect(steps[3].classList).toContain('cl-pipeline__step--soon');
      expect(steps[3].querySelector('.cl-pipeline__value')?.textContent).toContain('Coming soon');
      expect(steps[0].querySelector('.cl-pipeline__note')?.textContent).toContain('1 returned for correction');
    });
  });

  describe('search and filter', () => {
    const names = (host: HTMLElement) =>
      Array.from(host.querySelectorAll('tbody tr .cl-state-row__name')).map((n) =>
        n.textContent?.replace(/\s+/g, ' ').trim(),
      );
    const filterButton = (host: HTMLElement, label: string) =>
      Array.from(host.querySelectorAll<HTMLButtonElement>('[aria-label="Show states"] mat-button-toggle button')).find((b) =>
        b.textContent?.includes(label),
      ) as HTMLButtonElement;

    it('counts the states that sent a claim, on the heading pill and the filter buttons', () => {
      const host = create();

      expect(host.querySelector('.cl-states__count')?.textContent?.replace(/\s+/g, ' ')).toContain(
        '1 of 2 states have claimed',
      );
      expect(filterButton(host, 'All').textContent).toContain('2');
      expect(filterButton(host, 'Claim received').textContent).toContain('1');
      expect(filterButton(host, 'Awaiting claim').textContent).toContain('1');
    });

    it('filters by claim received / awaiting, marking the chosen button pressed', () => {
      const host = create();

      filterButton(host, 'Awaiting claim').click();
      fixture.detectChanges();
      expect(names(host)).toEqual(['AS Assam']);
      expect(filterButton(host, 'Awaiting claim').getAttribute('aria-checked')).toBe('true');

      filterButton(host, 'Claim received').click();
      fixture.detectChanges();
      expect(names(host)).toEqual(['AP Andhra Pradesh']);
    });

    it('searches by State name, and offers to clear when nothing matches', () => {
      const host = create();
      const search = host.querySelector('input[type="search"]') as HTMLInputElement;

      search.value = 'ass';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(names(host)).toEqual(['AS Assam']);

      search.value = 'kerala';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(host.querySelector('tbody')?.textContent).toContain('No states match your search.');

      (host.querySelector('tbody .cl-link-btn') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(names(host).length).toBe(2);
    });
  });

  it('shows an error with a retry when the load fails', () => {
    service.getStates.and.returnValue(throwError(() => new Error('boom')));

    const host = create();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Could not load the claim letters');
    service.getStates.and.returnValue(of(states));
    (host.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.querySelectorAll('tbody tr').length).toBe(2);
  });

  describe('claim letters per State', () => {
    const letter = (id: string, batchNumber: number, status: number, statusLabel: string) => ({
      id,
      number: `CF_AP_2026-27_1-${batchNumber}`,
      batchNumber,
      receivedOn: '2026-11-04T00:00:00.000Z',
      ulbCount: 10,
      amount: 1_000_000_000,
      status,
      statusLabel,
    });
    const withLetters: ClaimLettersStates = {
      ...states,
      states: [
        {
          ...states.states[0],
          claimLetters: [
            letter('l3', 3, 15, 'Under Review by SO'),
            letter('l2', 2, 5, 'Under Review by MoHUA'),
            letter('l1', 1, 16, 'Returned for Correction'),
          ],
        },
        { ...states.states[1], claimLetters: [] },
      ],
    };
    const letterNumbers = (host: HTMLElement) =>
      Array.from(host.querySelectorAll('.cl-letter-line__main .fw-semibold')).map((el) => el.textContent?.trim());

    beforeEach(() => service.getStates.and.returnValue(of(withLetters)));

    it("expands a State's row to list its letters and collapses it again; a State with none has no toggle", () => {
      const host = create();
      const toggle = () => host.querySelector<HTMLButtonElement>('button.cl-expand')!;

      expect(host.querySelectorAll('button.cl-expand').length).toBe(1);
      expect(toggle().getAttribute('aria-expanded')).toBe('false');

      toggle().click();
      fixture.detectChanges();
      expect(toggle().getAttribute('aria-expanded')).toBe('true');
      expect(letterNumbers(host)).toEqual(['CF_AP_2026-27_1-3', 'CF_AP_2026-27_1-2', 'CF_AP_2026-27_1-1']);
      expect(host.querySelector('a[aria-label="View claim letter CF_AP_2026-27_1-2"]')).not.toBeNull();

      toggle().click();
      fixture.detectChanges();
      expect(host.querySelector('.cl-letters')).toBeNull();
    });

    /** The chip the stage toggle group shows as selected, by its label. */
    const selectedChip = (host: HTMLElement) =>
      host.querySelector('[aria-label="Show claim letters by stage"] .mat-button-toggle-checked')?.textContent?.trim();

    const chip = (host: HTMLElement, label: string) =>
      Array.from(host.querySelectorAll<HTMLButtonElement>('[aria-label="Show claim letters by stage"] button')).find(
        (b) => b.textContent?.includes(label),
      )!;

    it('a stage chip narrows the table to its letters, with their States open; All letters shows every State', () => {
      const host = create();
      expect(selectedChip(host)).toContain('All letters');

      chip(host, 'Approved').click();
      fixture.detectChanges();
      // Only the State with an approved (5) letter, opened, showing just that letter; its chevron is hidden.
      expect(host.querySelectorAll('tbody tr.cl-state-open').length).toBe(1);
      expect(letterNumbers(host)).toEqual(['CF_AP_2026-27_1-2']);
      expect(host.querySelector('button.cl-expand')).toBeNull();

      chip(host, 'Under review by MoHUA').click();
      fixture.detectChanges();
      expect(letterNumbers(host)).toEqual(['CF_AP_2026-27_1-3']);

      chip(host, 'Returned').click();
      fixture.detectChanges();
      expect(letterNumbers(host)).toEqual(['CF_AP_2026-27_1-1']);

      chip(host, 'All letters').click();
      fixture.detectChanges();
      expect(host.querySelector('.cl-letters')).toBeNull();
      expect(host.querySelectorAll('tbody > tr').length).toBe(2);
    });

    it('the summary cards only show figures: they are not buttons', () => {
      const host = create();

      expect(host.querySelectorAll('.cl-pipeline button, .cl-hero button').length).toBe(0);
    });
  });
});
