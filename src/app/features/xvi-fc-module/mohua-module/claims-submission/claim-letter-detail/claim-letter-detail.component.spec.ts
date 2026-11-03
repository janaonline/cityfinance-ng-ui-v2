import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
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
  summary: { claimAmountReceived: 1_880_000_000, totalCities: 10, exemptionsApplied: 2 },
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
    await TestBed.configureTestingModule({
      imports: [ClaimLetterDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ClaimsSubmissionService, useValue: service },
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

  it('shows the title, the State-signed document with a View PDF link, and the headline tiles', () => {
    const host = create();

    expect(service.getClaimLetter).toHaveBeenCalledWith('c3');
    expect(host.querySelector('h1')?.textContent).toContain('AP-CL-003 — Andhra Pradesh');
    expect(host.querySelector('.cl-doc')?.textContent).toContain('AP-CL-003.pdf');
    const pdf = host.querySelector('.cl-doc a') as HTMLAnchorElement;
    expect(pdf.textContent).toContain('View PDF');
    expect(pdf.getAttribute('href')).toBe('https://signed/file');
    const tiles = host.querySelector('.cl-tiles')?.textContent ?? '';
    expect(tiles).toContain('₹188 cr');
    expect(tiles).toContain('Total cities');
    expect(tiles).toContain('Exemptions applied');
  });

  it('has no View PDF link when the State attached no signed letter', () => {
    service.getClaimLetter.and.returnValue(of({ ...detail, signedClaimFile: null }));

    const host = create();

    expect(host.querySelector('.cl-doc')?.textContent).toContain('No signed claim letter attached');
    expect(host.querySelector('.cl-doc a')).toBeNull();
  });

  it('lists the ULBs with their share in crore and an eligibility badge, numbered from 1', () => {
    const rows = Array.from(create().querySelectorAll('tbody tr'));

    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Visakhapatnam');
    expect(rows[0].textContent).toContain('₹112.3 cr');
    expect(rows[0].textContent).toContain('Eligible');
    expect(rows[0].querySelector('.cs-badge--bad')).toBeNull();
    expect(rows[1].textContent).toContain('Eligible via exemption');
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
      fixture.detectChanges();

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
        jasmine.objectContaining({ message: jasmine.stringContaining('2 exemption request(s) still under MoHUA review') }),
      );
    });

    it("opens the return dialog for that one ULB from its return icon", () => {
      const host = create();

      returnIcon(host, 1).click();
      fixture.detectChanges();

      const dialog = document.querySelector('app-mohua-return-claim-letter-dialog');
      expect(dialog?.textContent).toContain('Return Vizianagaram for correction?');
      expect(dialog?.textContent).toContain("this ULB's row only");
    });

    it('shows a returned ULB with its picks and remark, and blocks Approve while any ULB is returned', () => {
      service.getClaimLetter.and.returnValue(of({ ...detail, returnedUlbCount: 1 }));
      service.getClaimLetterUlbs.and.returnValue(returnedRow());
      const host = create();

      const row = host.querySelectorAll('tbody tr')[0].textContent ?? '';
      expect(row).toContain('Returned: PFMS Bank Account, Elected Bodies — Wrong IFSC');
      expect(actionButton(host, 'Approve').disabled).toBeTrue();
      expect(actionButton(host, 'Return for correction').textContent).toContain('(1)');
    });

    it('opens the letter-level return with the State-wide items from Return for correction', () => {
      const host = create();

      actionButton(host, 'Return for correction').click();
      fixture.detectChanges();

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
        jasmine.objectContaining({ title: 'Approve this claim letter?', message: jasmine.stringContaining('AP-CL-003') }),
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
    service.getClaimLetterUlbs.and.returnValue(of({ ...ulbs, pagination: { page: 1, limit: 20, total: 45, totalPages: 3 } }));
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
