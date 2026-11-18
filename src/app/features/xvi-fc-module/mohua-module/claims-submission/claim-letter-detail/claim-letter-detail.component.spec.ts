import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthPermissionService } from '../../../../../core/auth/auth-permission.service';
import { UtilityService } from '../../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { ClaimLetterDetail, ClaimLetterUlbs } from '../claims-submission.models';
import { ClaimsSubmissionService } from '../claims-submission.service';
import { ClaimLetterDetailComponent } from './claim-letter-detail.component';

const detail: ClaimLetterDetail = {
  id: 'c3',
  revision: 3,
  number: 'AP-CL-003',
  state: { id: 's1', name: 'Andhra Pradesh' },
  yearId: 'y1',
  installment: 1,
  receivedOn: '2026-07-22T00:00:00.000Z',
  status: 15,
  statusLabel: 'Under Review by SO',
  signedClaimFile: { name: 'AP-CL-003.pdf', url: 'https://signed/file', sizeKb: 67 },
  summary: {
    claimAmountReceived: 1_880_000_000,
    totalCities: 10,
    exemptionsApplied: 2,
    exemptionAmount: 310_000_000,
    submittedClaimAmount: 4_200_000_000,
    submittedUlbs: 24,
  },
  returnDetails: null,
  returnedUlbCount: 0,
  pendingExemptionCount: 0,
};

const ulbs: ClaimLetterUlbs = {
  items: [
    {
      ulbId: 'u1',
      name: 'Visakhapatnam',
      censusCode: '1',
      installmentShare: 1_123_000_000,
      claimedAmount: 1_123_000_000,
      ulbStatus: 'ELIGIBLE',
      reviewStatus: 5,
      reviewStatusLabel: 'Under Review by MoHUA',
      returnedFormIds: [],
      soDecision: null,
      exemptions: [],
    },
    {
      ulbId: 'u2',
      name: 'Vizianagaram',
      censusCode: '2',
      installmentShare: 146_000_000,
      claimedAmount: 146_000_000,
      ulbStatus: 'ELIGIBLE_VIA_EXEMPTION',
      reviewStatus: 5,
      reviewStatusLabel: 'Under Review by MoHUA',
      returnedFormIds: [],
      soDecision: null,
      exemptions: [],
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

describe('ClaimLetterDetailComponent', () => {
  let fixture: ComponentFixture<ClaimLetterDetailComponent>;
  let service: jasmine.SpyObj<ClaimsSubmissionService>;

  /** MoHUA acts on this page; PMU only monitors it. */
  let isMohuaUser: boolean;

  const create = (): HTMLElement => {
    fixture = TestBed.createComponent(ClaimLetterDetailComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj<ClaimsSubmissionService>('ClaimsSubmissionService', [
      'getClaimLetter',
      'getClaimLetterUlbs',
      'approveClaimLetter',
      'decideUlb',
    ]);
    service.getClaimLetter.and.returnValue(of(detail));
    service.getClaimLetterUlbs.and.returnValue(of(ulbs));
    isMohuaUser = true;
    await TestBed.configureTestingModule({
      imports: [ClaimLetterDetailComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ClaimsSubmissionService, useValue: service },
        { provide: AuthPermissionService, useValue: { isMohuaUser: () => isMohuaUser } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: new Map([
                ['stateId', 's1'],
                ['claimLetterId', 'c3'],
              ]),
            },
            parent: null,
          },
        },
      ],
    }).compileComponents();
  });

  it('is read-only for PMU: no review actions on a letter under SO review, and no Generate OM once verified', () => {
    isMohuaUser = false;
    let host = create();

    expect(fixture.componentInstance.canReview()).toBeFalse();
    expect(host.querySelector('.cl-actions')).toBeNull();
    expect(host.querySelector('.cl-icon-btn')).toBeNull();
    expect(host.querySelectorAll('tbody tr').length).toBe(2);

    fixture.destroy();
    service.getClaimLetter.and.returnValue(of({ ...detail, status: 5, statusLabel: 'Verified' }));
    host = create();
    expect(host.querySelector('.cl-om-btn')).toBeNull();
  });

  it('shows the title with the letter status and the two review bars', () => {
    const host = create();

    expect(service.getClaimLetter).toHaveBeenCalledWith('c3');
    const title = host.querySelector('h1');
    expect(title?.textContent).toContain('AP-CL-003 — Andhra Pradesh');
    expect(title?.querySelector('.cs-badge')).not.toBeNull();
    const titles = Array.from(host.querySelectorAll('.cl-review__title')).map((t) => t.textContent?.trim());
    expect(titles).toEqual(['Claim Letter', 'State Forms']);
    // The letter bar shows when it was signed and the file; the signer is on hover, and it no longer repeats
    // the ULB count or the amount.
    const letterMeta = host.querySelector('.cl-review__row--letter .cl-review__meta') as HTMLElement;
    expect(letterMeta.textContent).toContain('Received');
    expect(letterMeta.textContent).not.toContain('Signed');
    expect(letterMeta.textContent).toContain('AP-CL-003.pdf');
    expect(letterMeta.textContent).not.toContain('₹');
    const tooltip = (selector: string) =>
      fixture.debugElement.query(By.css(selector)).injector.get(MatTooltip).message;
    // The forms bar counts the five State forms (named on hover) and says they are read-only.
    const formsMeta = host.querySelector('.cl-review__row--forms .cl-review__meta') as HTMLElement;
    expect(formsMeta.textContent).toContain('5 conditions');
    expect(formsMeta.textContent).toContain('Read-only');
    expect(tooltip('.cl-review__forms')).toBe(
      'SFC Status, Elected Body, ULB-wise Allocation, FC Unspent, GTC',
    );
  });

  it('shows the four headline cards above the review bars, Grant Released last', () => {
    const host = create();

    const labels = Array.from(host.querySelectorAll('.cl-stats .cl-stat__label')).map((l) => l.textContent?.trim());
    expect(labels).toEqual(['Amount Claimed', 'Claims Submitted', 'Exemption Requested', 'Grant Released']);
    const stats = host.querySelector('.cl-stats') as HTMLElement;
    const review = host.querySelector('.cl-review') as HTMLElement;
    expect(stats.compareDocumentPosition(review) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Figures come from the letter (they count up on screen, so they are read from the model, not the DOM).
    expect(fixture.componentInstance.stats().map((s) => [s.amount, s.ulbs])).toEqual([
      [1_880_000_000, 10],
      [4_200_000_000, 24],
      [310_000_000, 2],
      [null, null],
    ]);
  });

  it('shows Grant Released as "Coming soon" until the release step exists', () => {
    const host = create();

    const released = Array.from(host.querySelectorAll<HTMLElement>('.cl-stats .cl-stat')).at(-1) as HTMLElement;
    // Same order as the dashboard's stat cards: the value, then the label.
    expect(released.querySelector('.cl-stat__value')?.textContent).toContain('Coming soon');
    expect(released.querySelector('.cl-stat__value + .cl-stat__label')?.textContent).toContain('Grant Released');
  });

  it('shows "None" in grey, not ₹0, on a card with nothing in it', () => {
    service.getClaimLetter.and.returnValue(
      of({ ...detail, summary: { ...detail.summary, exemptionAmount: 0, exemptionsApplied: 0 } }),
    );

    const host = create();

    const exemption = Array.from(host.querySelectorAll<HTMLElement>('.cl-stats .cl-stat'))[2];
    expect(exemption.classList).toContain('cl-stat--empty');
    expect(exemption.querySelector('.cl-stat__value')?.textContent).toContain('None');
    expect(exemption.querySelector('.cl-stat__note')?.textContent).toContain('No exemption requests');
  });

  it('offers the signed Claim Letter in a new tab and the read-only State Forms', () => {
    const host = create();

    const letter = host.querySelector('.cl-review__row--letter .cl-review__letter') as HTMLAnchorElement;
    expect(letter.textContent).toContain('View letter');
    expect(letter.getAttribute('href')).toBe('https://signed/file');
    expect(letter.getAttribute('target')).toBe('_blank');
    expect(letter.querySelector('i.bi-eye')).not.toBeNull();

    const forms = host.querySelector('.cl-review__row--forms .cl-review__forms-link') as HTMLAnchorElement;
    expect(forms.textContent).toContain('View forms');
    expect(forms.getAttribute('href')).toContain('review-state-submissions/s1');
    expect(forms.getAttribute('aria-label')).toBe('View State forms (read-only)');
    expect(forms.querySelector('i.bi-eye')).not.toBeNull();
  });

  it('has no Claim Letter button when the State attached no signed letter, but State Forms stays', () => {
    service.getClaimLetter.and.returnValue(of({ ...detail, signedClaimFile: null }));

    const host = create();

    expect(host.querySelector('.cl-review__row--letter')?.textContent).toContain('No signed claim letter attached');
    expect(host.querySelector('.cl-review__letter')).toBeNull();
    expect(host.querySelector('.cl-review__forms-link')).not.toBeNull();
  });

  it('lists the ULBs with their share in crore and an eligibility badge, numbered from 1', () => {
    const rows = Array.from(create().querySelectorAll('tbody tr'));

    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Visakhapatnam');
    expect(rows[0].textContent).toContain('₹112.3 cr');
    expect(rows[0].textContent).toContain('Eligible');
    expect(rows[0].querySelector('.cs-badge--bad')).toBeNull();
    expect(rows[1].textContent).toContain('Exemption sought');
    expect(rows[0].querySelectorAll('td')[0].textContent?.trim()).toBe('1');
  });

  it('links each ULB to its page, remembering this claim letter so Back returns here', () => {
    const link = create().querySelector('tbody tr a.cl-ulb-link') as HTMLAnchorElement;

    expect(link.textContent).toContain('Visakhapatnam');
    expect(link.getAttribute('href')).toContain('review-state-submissions/s1/ulb/u1');
    expect(link.getAttribute('href')).toContain('claimLetter=c3');
  });

  describe('per-ULB return marks', () => {
    const returnIcon = (host: HTMLElement, row: number) =>
      host.querySelectorAll<HTMLButtonElement>('tbody tr .cl-icon-btn--return')[row];
    const actionButton = (host: HTMLElement, text: string) =>
      Array.from(host.querySelectorAll<HTMLButtonElement>('.cl-actions button')).find((b) =>
        b.textContent?.includes(text),
      ) as HTMLButtonElement;
    const returnedRow = () =>
      of({
        ...ulbs,
        items: [
          {
            ...ulbs.items[0],
            soDecision: {
              status: 'RETURNED' as const,
              ulbFormIds: [33],
              rowFormIds: [23],
              rejectExemptionFormIds: [],
              remark: 'Wrong IFSC',
              decidedAt: '2026-11-03T00:00:00.000Z',
            },
          },
          ulbs.items[1],
        ],
      });

    afterEach(() => TestBed.inject(MatDialog).closeAll());

    it('shows only a return icon on each ULB of a letter under SO review, and no badge while unmarked', () => {
      const host = create();

      expect(host.querySelectorAll('tbody tr .cl-icon-btn--return').length).toBe(2);
      expect(host.querySelectorAll('tbody tr .cl-icon-btn').length).toBe(2);
      expect(host.querySelector('tbody .cs-badge--bad')).toBeNull();
      expect(host.querySelector('.cl-hint__counts')?.textContent).toContain('0 of 10 ULBs marked for return');
    });

    it('says what happens to an unmarked ULB, and flags a marked one and the count in red', () => {
      service.getClaimLetter.and.returnValue(of({ ...detail, returnedUlbCount: 1 }));
      service.getClaimLetterUlbs.and.returnValue(returnedRow());
      const host = create();

      expect(host.querySelector('#cl-ulbs-heading')?.textContent).toContain('ULBs in this claim letter');
      const [marked, unmarked] = Array.from(host.querySelectorAll<HTMLElement>('tbody tr'));
      expect(marked.classList).toContain('cl-row--returned');
      expect(marked.querySelector('.cl-icon-btn--active')).not.toBeNull();
      expect(unmarked.querySelector('.cl-pending')?.textContent).toContain('Approves with the letter');
      expect(host.querySelector('.cl-hint__counts')?.classList).toContain('cl-hint__counts--some');
    });

    it('clears a return mark, updating the row and the count without reloading', () => {
      service.getClaimLetter.and.returnValue(of({ ...detail, returnedUlbCount: 1 }));
      service.getClaimLetterUlbs.and.returnValue(returnedRow());
      service.decideUlb.and.returnValue(of(null));
      const host = create();
      service.getClaimLetter.calls.reset();

      (host.querySelector('tbody .cl-link-btn') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(service.decideUlb).toHaveBeenCalledOnceWith('c3', 'u1', { status: 'PENDING' });
      expect(host.querySelector('tbody .cs-badge--bad')).toBeNull();
      expect(host.querySelector('.cl-hint__counts')?.textContent).toContain('0 of 10');
      expect(service.getClaimLetter).not.toHaveBeenCalled();
    });

    it('lists only the exemptions in the return dialog of an "Eligible via exemption" ULB', () => {
      service.getClaimLetterUlbs.and.returnValue(
        of({
          ...ulbs,
          items: [ulbs.items[0], { ...ulbs.items[1], exemptions: [{ formId: 23, exemptionId: 'e1', status: 5 }] }],
        }),
      );
      const host = create();

      returnIcon(host, 1).click();
      TestBed.tick(); // the dialog lives in the overlay, outside the fixture

      const dialog = document.querySelector('app-mohua-return-claim-letter-dialog')?.textContent ?? '';
      expect(dialog).toContain('Elected Bodies (exemption under review)');
      expect(dialog).not.toContain('PFMS Bank Account');
    });

    it('mentions the pending exemptions in the Approve confirmation', () => {
      const confirm = spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(false));
      service.getClaimLetter.and.returnValue(of({ ...detail, pendingExemptionCount: 2 }));
      const host = create();

      actionButton(host, 'Approve').click();

      expect(confirm).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: jasmine.stringContaining('2 exemption request(s) still under MoHUA review'),
        }),
      );
    });

    it('opens the return dialog for that one ULB from its return icon', () => {
      const host = create();

      returnIcon(host, 1).click();
      TestBed.tick(); // the dialog lives in the overlay, outside the fixture

      const dialog = document.querySelector('app-mohua-return-claim-letter-dialog');
      expect(dialog?.textContent).toContain('Return Vizianagaram for correction?');
      expect(dialog?.textContent).toContain("this ULB's row only");
    });

    it('shows a returned ULB with its picks and remark, and blocks Approve while any ULB is returned', () => {
      service.getClaimLetter.and.returnValue(of({ ...detail, returnedUlbCount: 1 }));
      service.getClaimLetterUlbs.and.returnValue(returnedRow());
      const host = create();

      const row = host.querySelectorAll('tbody tr')[0].textContent ?? '';
      expect(row).toContain('Returned');
      expect(row).toContain('PFMS Bank Account, Elected Bodies — Wrong IFSC');
      expect(actionButton(host, 'Approve').disabled).toBeTrue();
      expect(actionButton(host, 'Return Claim Letter').textContent).toContain('(1)');
    });

    it('opens the letter-level return with the State-wide items from Return Claim Letter', () => {
      const host = create();

      actionButton(host, 'Return Claim Letter').click();
      TestBed.tick(); // the dialog lives in the overlay, outside the fixture

      const dialog = document.querySelector('app-mohua-return-claim-letter-dialog');
      expect(dialog?.textContent).toContain('Return this claim letter for correction?');
      expect(dialog?.textContent).toContain('Grant Transfer Certificate');
      expect(dialog?.textContent).not.toContain('Elected Bodies');
    });
  });

  describe('Approve', () => {
    let confirmDialog: jasmine.SpyObj<ConfirmDialogService>;
    let snackbar: jasmine.Spy;
    const approved: ClaimLetterDetail = { ...detail, revision: 4, status: 5, statusLabel: 'Under Review by MoHUA' };

    const approveButton = (host: HTMLElement) =>
      Array.from(host.querySelectorAll<HTMLButtonElement>('.cl-actions button')).find((b) =>
        b.textContent?.includes('Approve'),
      ) as HTMLButtonElement;

    beforeEach(() => {
      confirmDialog = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
      confirmDialog.confirm.and.returnValue(of(true));
      TestBed.overrideProvider(ConfirmDialogService, { useValue: confirmDialog });
      snackbar = spyOn(TestBed.inject(UtilityService), 'triggerSnackbar');
      service.approveClaimLetter.and.returnValue(of(approved));
    });

    it('asks for confirmation, approves with the revision the page showed, then shows the letter as under MoHUA review and read-only', () => {
      const host = create();

      approveButton(host).click();
      fixture.detectChanges();

      expect(confirmDialog.confirm).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Approve this claim letter?',
          message: jasmine.stringContaining('AP-CL-003'),
        }),
      );
      expect(service.approveClaimLetter).toHaveBeenCalledOnceWith('c3', 3);
      expect(snackbar).toHaveBeenCalledWith('Claim letter approved.', 'snackbar-success');
      expect(host.querySelector('.cl-actions')).toBeNull();
      expect(host.querySelector('.cs-badge')?.textContent).toContain('Verified');
    });

    it('does nothing when the confirmation is cancelled', () => {
      confirmDialog.confirm.and.returnValue(of(false));
      const host = create();

      approveButton(host).click();

      expect(service.approveClaimLetter).not.toHaveBeenCalled();
    });

    it('shows the server message and reloads the letter when it changed meanwhile (409)', () => {
      service.approveClaimLetter.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'The claim letter changed.' } })),
      );
      const host = create();
      service.getClaimLetter.calls.reset();

      approveButton(host).click();
      fixture.detectChanges();

      expect(snackbar).toHaveBeenCalledWith('The claim letter changed.', 'snackbar-danger');
      expect(service.getClaimLetter).toHaveBeenCalledTimes(1);
      expect(approveButton(host).disabled).toBeFalse();
    });
  });

  it('is read-only once the letter is past SO review: no decision icons and no approve or return buttons', () => {
    service.getClaimLetter.and.returnValue(of({ ...detail, status: 5, statusLabel: 'Under Review by MoHUA' }));

    const host = create();

    expect(host.querySelector('.cl-icon-btn')).toBeNull();
    expect(host.querySelector('.cl-actions')).toBeNull();
    expect(host.querySelector('tbody tr a.cl-ulb-link')).not.toBeNull();
  });

  it('searches the ULBs after a short pause, from page 1', fakeAsync(() => {
    const host = create();
    service.getClaimLetterUlbs.calls.reset();

    const input = host.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Vizia';
    input.dispatchEvent(new Event('input'));
    tick(299);
    expect(service.getClaimLetterUlbs).not.toHaveBeenCalled();
    tick(1);

    expect(service.getClaimLetterUlbs).toHaveBeenCalledOnceWith('c3', { search: 'Vizia', page: 1, limit: 20 });
  }));

  it('pages through the ULBs', () => {
    service.getClaimLetterUlbs.and.returnValue(
      of({ ...ulbs, pagination: { page: 1, limit: 20, total: 45, totalPages: 3 } }),
    );
    const host = create();
    service.getClaimLetterUlbs.calls.reset();

    const next = Array.from(host.querySelectorAll('.cl-pager button')).find((b) => b.textContent?.includes('Next'));
    (next as HTMLButtonElement).click();

    expect(service.getClaimLetterUlbs).toHaveBeenCalledWith('c3', { search: '', page: 2, limit: 20 });
  });

  it('shows an error with a retry when the letter cannot be loaded', () => {
    service.getClaimLetter.and.returnValue(throwError(() => new Error('boom')));

    expect(create().querySelector('[role="alert"]')?.textContent).toContain('Could not load this claim letter');
  });
});
