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
    const row = host.querySelector('tbody tr') as HTMLElement;
    expect(row.textContent).toContain('AP-CL-003');
    expect(row.textContent).toContain('10');
    expect(row.textContent).toContain('₹188 cr');
    expect(row.textContent).toContain('Under Review by MoHUA');
    expect(row.querySelector('a')?.textContent).toContain('View');
  });

  it('lists approved letters too, with a View link and a green badge', () => {
    const rows = Array.from(create().querySelectorAll('tbody tr'));

    expect(rows.length).toBe(2);
    expect(rows[1].textContent).toContain('Acknowledged by MoHUA');
    expect(rows[1].querySelector('.cs-badge--good')).not.toBeNull();
    expect(rows[1].querySelector('a')?.textContent).toContain('View');
  });

  it('shows the summary band under the table: ULBs claimed / pending, per status, and amount claimed / balance', () => {
    const band = create().querySelector('.cl-band')?.textContent?.replace(/\s+/g, ' ') ?? '';

    expect(band).toContain('72 ULBs claimed / 51 pending');
    expect(band).toContain('40 approved');
    expect(band).toContain('22 under review');
    expect(band).toContain('10 returned');
    expect(band).toContain('₹432 cr claimed / ₹349 cr balance');
  });

  it('has a Back to Claim Letters link', () => {
    expect(create().querySelector('.cs-back')?.textContent).toContain('Back to Claim Letters');
  });

  it('says so when the state has no claim letters yet', () => {
    service.getStateClaimLetters.and.returnValue(of({ ...letters, claimLetters: [] }));

    const host = create();

    expect(host.querySelector('tbody')?.textContent).toContain('No claim letters have been submitted');
    expect(host.querySelector('.cl-band')).toBeNull();
  });

  it('shows an error with a retry when the load fails', () => {
    service.getStateClaimLetters.and.returnValue(throwError(() => new Error('boom')));

    expect(create().querySelector('[role="alert"]')?.textContent).toContain('Could not load');
  });
});
