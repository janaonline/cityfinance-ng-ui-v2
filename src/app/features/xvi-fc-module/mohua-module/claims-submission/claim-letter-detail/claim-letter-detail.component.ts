import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { MohuaPageLoaderComponent } from '../../page-loader/page-loader.component';
import {
  CLAIMS_INSTALLMENT,
  ClaimLetterDetail,
  ClaimLetterReturnedForm,
  ClaimLetterSoDecision,
  ClaimLetterUlbRow,
  ClaimLetterUlbs,
  claimStatusBadgeClass,
  claimStatusLabel,
  formatReceivedOn,
  formatRupeesInCrore,
} from '../claims-submission.models';
import { ClaimsSubmissionService } from '../claims-submission.service';
import {
  RETURN_ROW_FORM_IDS,
  RETURN_ROW_FORM_OPTIONS,
  RETURN_STATE_FORM_OPTIONS,
  RETURN_ULB_FORM_OPTIONS,
  ReturnClaimLetterDialogComponent,
  ReturnClaimLetterDialogData,
  ReturnClaimLetterDialogResult,
  ReturnLetterDialogResult,
  ReturnUlbDialogResult,
  exemptionFormLabel,
} from '../return-dialog/return-claim-letter-dialog.component';

const FORM_LABELS = new Map(
  [...RETURN_ULB_FORM_OPTIONS, ...RETURN_ROW_FORM_OPTIONS, ...RETURN_STATE_FORM_OPTIONS].map((o) => [o.formId, o.label]),
);

function ulbCountText(count: number): string {
  return `${count} ULB${count === 1 ? '' : 's'}`;
}

const FORM_STATUS_UNDER_REVIEW_BY_SO = 15;
const APPROVE_ERROR = 'Could not approve the claim letter. Please try again.';
const RETURN_ERROR = 'Could not return the claim letter. Please try again.';
const DECIDE_ERROR = 'Could not save the decision for this ULB. Please try again.';
const LOAD_ERROR = 'Could not load this claim letter. Please try again.';
const ULBS_LOAD_ERROR = 'Could not load the ULBs. Please try again.';
const ULBS_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/** One claim letter, read-only: the State-signed document, headline figures and the ULBs it covers. */
@Component({
  selector: 'app-mohua-claim-letter-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MohuaPageLoaderComponent],
  templateUrl: './claim-letter-detail.component.html',
  styleUrl: './claim-letter-detail.component.scss',
})
export class ClaimLetterDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ClaimsSubmissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly utilityService = inject(UtilityService);
  private readonly search$ = new Subject<string>();

  /** Parent (MoHUA module) route — links are built from it, so they never depend on how many URL segments this route has. */
  readonly mohuaRoute = this.route.parent;
  readonly installment = CLAIMS_INSTALLMENT;
  readonly formatCrore = formatRupeesInCrore;
  readonly formatDate = formatReceivedOn;
  readonly badgeClass = claimStatusBadgeClass;
  readonly statusLabel = claimStatusLabel;

  readonly stateId = this.route.snapshot.paramMap.get('stateId') ?? '';
  readonly claimLetterId = this.route.snapshot.paramMap.get('claimLetterId') ?? '';

  readonly letter = signal<ClaimLetterDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly approving = signal(false);
  readonly returning = signal(false);

  readonly ulbs = signal<ClaimLetterUlbs | null>(null);
  readonly ulbsLoading = signal(false);
  readonly ulbsError = signal<string | null>(null);
  readonly search = signal('');
  readonly page = signal(1);

  /** Only a letter that is still under MoHUA review can be acted on; returned and acknowledged ones are read-only. */
  readonly canReview = computed(() => this.letter()?.status === FORM_STATUS_UNDER_REVIEW_BY_SO);

  /** The ULB whose mark is being saved; its icons show a spinner meanwhile. */
  readonly decidingUlbId = signal<string | null>(null);

  /** ULBs marked for return across all pages: Approve is blocked while any is. */
  readonly returnedUlbCount = computed(() => this.letter()?.returnedUlbCount ?? 0);
  readonly busy = computed(() => this.approving() || this.returning() || this.decidingUlbId() !== null);

  readonly firstRowNumber = computed(() => ((this.ulbs()?.pagination.page ?? 1) - 1) * ULBS_PAGE_SIZE + 1);

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.search.set(term);
        this.page.set(1);
        this.loadUlbs();
      });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getClaimLetter(this.claimLetterId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (letter) => {
          this.letter.set(letter);
          this.loading.set(false);
          this.loadUlbs();
        },
        error: () => {
          this.error.set(LOAD_ERROR);
          this.loading.set(false);
        },
      });
  }

  /** Asks for confirmation, then approves the whole claim letter; refused while any ULB is marked returned. */
  approve(): void {
    const letter = this.letter();
    if (!letter || this.busy() || this.returnedUlbCount() > 0) return;
    this.confirmDialogService
      .confirm({
        title: 'Approve this claim letter?',
        message:
          `Approve ${letter.number} for ${letter.summary.totalCities} ULB(s), ${this.formatCrore(letter.summary.claimAmountReceived)}? The letter then moves to MoHUA review.` +
          (letter.pendingExemptionCount
            ? ` ${letter.pendingExemptionCount} exemption request(s) still under MoHUA review in this letter will be approved too.`
            : ''),
        confirmText: 'Yes, approve',
        cancelText: 'Cancel',
        confirmButtonColor: 'primary',
        icon: 'bi-check-circle-fill',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.submitApproval(letter);
      });
  }

  private submitApproval(letter: ClaimLetterDetail): void {
    this.approving.set(true);
    this.service
      .approveClaimLetter(letter.id, letter.revision)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.letter.set(updated);
          this.approving.set(false);
          this.utilityService.triggerSnackbar('Claim letter approved.', 'snackbar-success');
          this.loadUlbs();
        },
        error: (err: HttpErrorResponse) => {
          this.approving.set(false);
          const message = err.error?.message;
          this.utilityService.triggerSnackbar(
            typeof message === 'string' ? message : APPROVE_ERROR,
            'snackbar-danger',
          );
          // A conflict means the letter changed or was already decided: show it as it is now.
          if (err.status === 409) this.load();
        },
      });
  }

  /** Opens the letter-level return (State-wide items + remark); the ULBs marked returned go with it. */
  openReturnDialog(): void {
    const letter = this.letter();
    if (!letter || this.busy()) return;
    this.openDialog({ mode: 'letter', returnedUlbCount: this.returnedUlbCount() }).subscribe((result) => {
      if (result) this.submitReturn(letter, result as ReturnLetterDialogResult);
    });
  }

  private submitReturn(letter: ClaimLetterDetail, result: ReturnLetterDialogResult): void {
    this.returning.set(true);
    this.service
      .returnClaimLetter(letter.id, letter.revision, result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.letter.set(updated);
          this.returning.set(false);
          this.utilityService.triggerSnackbar('Claim letter returned for correction.', 'snackbar-success');
          this.loadUlbs();
        },
        error: (err: HttpErrorResponse) => {
          this.returning.set(false);
          const message = err.error?.message;
          this.utilityService.triggerSnackbar(typeof message === 'string' ? message : RETURN_ERROR, 'snackbar-danger');
          if (err.status === 409) this.load();
        },
      });
  }

  formLabel(formId: number): string {
    return FORM_LABELS.get(formId) ?? `Form ${formId}`;
  }

  formLabels(formIds: readonly number[]): string {
    return formIds.map((id) => this.formLabel(id)).join(', ');
  }

  /** A row form reads "Elected Bodies (rows for 2 ULBs)"; any other State form just its name. */
  stateFormLabel(form: ClaimLetterReturnedForm): string {
    const label = this.formLabel(form.formId);
    return RETURN_ROW_FORM_IDS.includes(form.formId) ? `${label} (rows for ${ulbCountText(form.ulbCount)})` : label;
  }

  ulbFormLabel(form: ClaimLetterReturnedForm): string {
    return `${this.formLabel(form.formId)} (${ulbCountText(form.ulbCount)})`;
  }

  /** ↩ on a ULB: opens the return dialog for it (prefilled when already marked); confirming marks it returned. */
  openUlbReturn(row: ClaimLetterUlbRow): void {
    if (this.busy()) return;
    this.openDialog({ mode: 'ulb', ulbName: row.name, decision: row.soDecision, exemptions: row.exemptions }).subscribe((result) => {
      if (result) this.saveDecision(row, { status: 'RETURNED', ...(result as ReturnUlbDialogResult) });
    });
  }

  /** Clears a ULB's returned mark, back to pending. */
  clearDecision(row: ClaimLetterUlbRow): void {
    this.saveDecision(row, { status: 'PENDING' });
  }

  private saveDecision(
    row: ClaimLetterUlbRow,
    decision: { status: 'PENDING' } | ({ status: 'RETURNED' } & ReturnUlbDialogResult),
  ): void {
    if (this.busy()) return;
    this.decidingUlbId.set(row.ulbId);
    this.service
      .decideUlb(this.claimLetterId, row.ulbId, decision)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (soDecision) => {
          this.decidingUlbId.set(null);
          this.applyDecision(row, soDecision);
        },
        error: (err: HttpErrorResponse) => {
          this.decidingUlbId.set(null);
          const message = err.error?.message;
          this.utilityService.triggerSnackbar(typeof message === 'string' ? message : DECIDE_ERROR, 'snackbar-danger');
          // A conflict means the letter is no longer under SO review: show it as it is now.
          if (err.status === 409) this.load();
        },
      });
  }

  /** Puts the saved mark on its row and keeps the letter's all-pages count in step, without reloading. */
  private applyDecision(row: ClaimLetterUlbRow, soDecision: ClaimLetterSoDecision | null): void {
    const ulbs = this.ulbs();
    if (ulbs) {
      this.ulbs.set({
        ...ulbs,
        items: ulbs.items.map((item) => (item.ulbId === row.ulbId ? { ...item, soDecision } : item)),
      });
    }
    const letter = this.letter();
    if (letter) {
      const change = Number(!!soDecision) - Number(!!row.soDecision);
      this.letter.set({ ...letter, returnedUlbCount: letter.returnedUlbCount + change });
    }
  }

  /** The returned ULB's picks, as one line: its forms, then its State-form rows, then exemptions to reject. */
  decisionFormsText(decision: ClaimLetterSoDecision): string {
    return [
      ...[...decision.ulbFormIds, ...decision.rowFormIds].map((id) => this.formLabel(id)),
      ...(decision.rejectExemptionFormIds ?? []).map((id) => `${exemptionFormLabel(id)} (exemption)`),
    ].join(', ');
  }

  private openDialog(data: ReturnClaimLetterDialogData) {
    return this.dialog
      .open<ReturnClaimLetterDialogComponent, ReturnClaimLetterDialogData, ReturnClaimLetterDialogResult | undefined>(
        ReturnClaimLetterDialogComponent,
        { data, width: '640px', maxWidth: '95vw' },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef));
  }

  onSearch(term: string): void {
    this.search$.next(term.trim());
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.loadUlbs();
  }

  loadUlbs(): void {
    this.ulbsLoading.set(true);
    this.ulbsError.set(null);
    this.service
      .getClaimLetterUlbs(this.claimLetterId, { search: this.search(), page: this.page(), limit: ULBS_PAGE_SIZE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ulbs) => {
          this.ulbs.set(ulbs);
          this.page.set(ulbs.pagination.page);
          this.ulbsLoading.set(false);
        },
        error: () => {
          this.ulbsError.set(ULBS_LOAD_ERROR);
          this.ulbsLoading.set(false);
        },
      });
  }
}
