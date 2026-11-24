import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StateClaimLetters } from '../claims-submission.models';
import { ClaimsSubmissionService } from '../claims-submission.service';
import { StateClaimLettersComponent } from './state-claim-letters.component';

const letters: StateClaimLetters = {
  state: { id: 's1', name: 'Andhra Pradesh' },
  installment: 1,
  summary: {
    claimedUlbs: 72,
    pendingUlbs: 51,
    approvedUlbs: 40,
    underReviewUlbs: 22,
    returnedUlbs: 10,
    amountClaimed: 4_320_000_000,
    balance: 3_490_000_000,
  },
  claimLetters: [
    {
      id: 'c3',
      number: 'AP-CL-003',
      batchNumber: 3,
      receivedOn: '2026-07-22T00:00:00.000Z',
      ulbCount: 10,
      amount: 1_880_000_000,
      status: 15,
      statusLabel: 'Under Review by SO',
    },
    {
      id: 'c1',
      number: 'AP-CL-001',
      batchNumber: 1,
      receivedOn: '2026-07-01T00:00:00.000Z',
      ulbCount: 4,
      amount: 500_000_000,
      status: 7,
      statusLabel: 'Acknowledged by MoHUA',
    },
  ],
};

describe('StateClaimLettersComponent', () => {
  let fixture: ComponentFixture<StateClaimLettersComponent>;
  let service: jasmine.SpyObj<ClaimsSubmissionService>;

  const create = (): HTMLElement => {
    fixture = TestBed.createComponent(StateClaimLettersComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj<ClaimsSubmissionService>('ClaimsSubmissionService', ['getStateClaimLetters']);
    service.getStateClaimLetters.and.returnValue(of(letters));
    await TestBed.configureTestingModule({
      imports: [StateClaimLettersComponent],
      providers: [
        provideRouter([]),
        { provide: ClaimsSubmissionService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['stateId', 's1']]) }, parent: null } },
      ],
    }).compileComponents();
  });

  it("loads the state's letters for the right state and shows number, ULBs, amount and status", () => {
    const host = create();

    expect(service.getStateClaimLetters).toHaveBeenCalledWith('s1', jasmine.any(String));
    expect(host.querySelector('h1')?.textContent).toContain('Andhra Pradesh — Claim Letters');
    const card = host.querySelector('.cl-letter-card') as HTMLElement;
    expect(card.querySelector('.cl-letter-card__no')?.textContent).toContain('AP-CL-003');
    const facts = Array.from(card.querySelectorAll('.cl-letter-card__facts > div')).map(
      (fact) => `${fact.querySelector('dt')?.textContent?.trim()} ${fact.querySelector('dd')?.textContent?.trim()}`,
    );
    expect(facts).toEqual(['ULBs Included 10', 'Amount Claimed ₹188 cr']);
    expect(card.querySelector('.cl-letter-card__ribbon')?.textContent).toContain('Under Review by MoHUA');
    expect(card.querySelector('a')?.textContent).toContain('View');
  });

  it("links to the State's Claim Eligibility from the header", () => {
    const link = create().querySelector('[data-cy="state-claim-letters-eligibility-link"]') as HTMLAnchorElement;

    expect(link.textContent).toContain('Claim eligibility');
    expect(link.getAttribute('href')).toBe('/claims-submission/s1/ulb-eligibility');
  });

  it('lists approved letters too, with their status on the ribbon and a View link', () => {
    const cards = Array.from(create().querySelectorAll('.cl-letter-card'));

    expect(cards.length).toBe(2);
    expect(cards[1].querySelector('.cl-letter-card__ribbon')?.textContent).toContain('Acknowledged by MoHUA');
    expect(cards[1].querySelector('a')?.textContent).toContain('View');
  });

  it('shows the claim progress as two rings above the letters: ULBs and amount', () => {
    const host = create();

    const progress = host.querySelector('.cl-progress') as HTMLElement;
    const letters = host.querySelector('.cl-letter-grid') as HTMLElement;
    expect(progress.compareDocumentPosition(letters) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const names = Array.from(progress.querySelectorAll('.cl-ring-card__name')).map((n) => n.textContent?.trim());
    expect(names).toEqual(['ULBs', 'Amount']);
    // 72 of 123 claimable ULBs claimed: 40 approved, 22 under review, 51 pending; ₹432 cr of ₹781 cr claimed.
    expect(fixture.componentInstance.progress()).toEqual({
      ulbs: {
        total: 123,
        claimed: 72,
        approved: 40,
        underReview: 22,
        pending: 51,
        returned: 10,
        claimedPct: 59,
        approvedPct: 33,
        underReviewPct: 18,
      },
      amount: { total: 7_810_000_000, claimed: 4_320_000_000, balance: 3_490_000_000, claimedPct: 55 },
    });

    const [ulbs, amount] = Array.from(progress.querySelectorAll<HTMLElement>('.cl-ring-card'));
    const ulbLegend = ulbs.querySelector('.cl-legend')?.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(ulbLegend).toContain('40 Approved');
    expect(ulbLegend).toContain('22 Under review by MoHUA');
    expect(ulbLegend).toContain('51 Pending');
    expect(ulbs.querySelector('.cl-ring-card__note')?.textContent).toContain('10 ULBs were returned earlier');
    expect(ulbs.querySelector('.cl-ring')?.getAttribute('aria-label')).toBe(
      '72 of 123 ULBs claimed: 40 approved, 22 under review by MoHUA, 51 pending',
    );
    const amountLegend = amount.querySelector('.cl-legend')?.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(amountLegend).toContain('₹432 cr Claimed');
    expect(amountLegend).toContain('₹349 cr Balance');
  });

  it('draws the under-review segment right after the approved one, and none for an empty stage', () => {
    service.getStateClaimLetters.and.returnValue(of({ ...letters, summary: { ...letters.summary, approvedUlbs: 0 } }));

    const ring = create().querySelector('.cl-ring') as HTMLElement;

    expect(ring.querySelector('.cl-ring__seg--good')).toBeNull();
    const review = ring.querySelector('.cl-ring__seg--review') as SVGElement;
    expect(review.style.getPropertyValue('--s')).toBe('0');
  });

  it('shows each letter as a card in one colour, its status told by the ribbon icon and text', () => {
    service.getStateClaimLetters.and.returnValue(
      of({ ...letters, claimLetters: [...letters.claimLetters, { ...letters.claimLetters[0], id: 'c2', status: 16 }] }),
    );

    const host = create();

    expect(host.querySelector('#cl-letters-heading')?.textContent).toContain('Claim letters');
    expect(host.querySelector('.cl-letters__count')?.textContent).toContain('3 letters');
    const cards = Array.from(host.querySelectorAll<HTMLElement>('.cl-letter-card'));
    // No per-status colour classes on the cards: every card looks the same...
    expect(cards.every((c) => !Array.from(c.classList).some((k) => k.startsWith('cl-letter-card--')))).toBeTrue();
    // ...only the status chip is coloured: orange under review, green verified, red returned.
    expect(cards.map((c) => c.querySelector('.cl-letter-card__ribbon')?.classList.contains('cs-badge'))).toEqual([
      true,
      true,
      true,
    ]);
    expect(cards[0].querySelector('.cl-letter-card__ribbon')?.classList).toContain('cs-badge--review');
    expect(cards[1].querySelector('.cl-letter-card__ribbon')?.classList).toContain('cs-badge--good');
    expect(cards[2].querySelector('.cl-letter-card__ribbon')?.classList).toContain('cs-badge--bad');
    expect(cards[0].querySelector('.cl-letter-card__ribbon i.bi-hourglass-split')).not.toBeNull();
    expect(cards[1].querySelector('.cl-letter-card__ribbon i.bi-check-circle-fill')).not.toBeNull();
    expect(cards[2].querySelector('.cl-letter-card__ribbon i.bi-arrow-return-left')).not.toBeNull();
    // The icon's stamp, as on the dashboard's State Form Completion cards.
    expect(cards.map((c) => c.querySelector('.cl-letter-card__stamp i')?.className)).toEqual([
      'bi bi-hourglass-split',
      'bi bi-check-lg',
      'bi bi-arrow-return-left',
    ]);
    expect(cards[0].querySelector('a')?.getAttribute('aria-label')).toBe('View claim letter AP-CL-003');
  });

  it('has a Back to Claim Letters link', () => {
    expect(create().querySelector('.cs-back')?.textContent).toContain('Back to Claim Letters');
  });

  it('says so when the state has no claim letters yet', () => {
    service.getStateClaimLetters.and.returnValue(of({ ...letters, claimLetters: [] }));

    const host = create();

    expect(host.querySelector('.cl-letter-grid')).toBeNull();
    expect(host.querySelector('.cl-letters__empty')?.textContent).toContain('No claim letters have been submitted');
    expect(host.querySelector('.cl-progress')).toBeNull();
  });

  it('shows an error with a retry when the load fails', () => {
    service.getStateClaimLetters.and.returnValue(throwError(() => new Error('boom')));

    expect(create().querySelector('[role="alert"]')?.textContent).toContain('Could not load');
  });
});
