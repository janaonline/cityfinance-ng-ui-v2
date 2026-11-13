import { formatDate } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { ReviewAcknowledgmentComponent } from '../../shared/review-acknowledgment/review-acknowledgment.component';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../shared/breadcrumb/breadcrumb.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { MatSortModule, Sort } from '@angular/material/sort';
import { themedDialogConfig } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { AmountDisplayToggleComponent } from '../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { TruncatedTextComponent } from '../../../../shared/components/truncated-text/truncated-text.component';
import { AmountDisplayModeService } from '../../../../core/services/amount-display-mode.service';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import {
  PmuReviewFormId,
  hasEligibilityColumn,
  hasElectedBodyColumns,
  pmuFormOption,
  pmuStatusBadgeClass,
  pmuStatusLabel,
} from '../pmu-review.config';
import { PmuFormReviewData, PmuRow } from '../pmu-review.models';
import { PmuRowReviewService } from '../pmu-row-review.service';
import {
  buildPmuUndoConfirm,
  extractApiErrorResponse,
  extractFormLevelErrorMessage,
  isLongSnackbarMessage,
} from '../pmu-review.utils';
import { FORM_STATUS } from '../../common/constants/form-status.constants';

/** One UI page == one backend page — matches the backend's own max page size, same "fixed limit
 *  const" style as `request-exemption-list.component.ts`, not a page-size selector. */
const ROWS_PAGE_SIZE = 25;

/** A row's own `rowStatus` is a different domain than a form's `currentFormStatus` (never
 *  NOT_STARTED/IN_PROGRESS, but can be `null` for a never-touched/pre-PMU row, or `ACTION_REQUIRED`
 *  — neither of which a form-level status grouping handles; reusing one here silently
 *  collapsed both into "Approved", which was the bug. This is deliberately its own exhaustive
 *  mapping, not a form-level reuse — mirrors the bucket names the backend's own
 *  `getRowSummary`/`EulbPmuRowSummary` already established (`active`/`updatePending`/`rejected`/
 *  `needsUpdate`, plus the implicit "uncounted" null case). */
type RowStatusBucket = 'Pending Review' | 'Approved' | 'Returned' | 'Needs Update' | 'Not Submitted';

function rowStatusBucket(rowStatus: number | null): RowStatusBucket {
  switch (rowStatus) {
    case FORM_STATUS.UNDER_REVIEW_BY_PMU:
      return 'Pending Review';
    case FORM_STATUS.UNDER_REVIEW_BY_MOHUA:
    case FORM_STATUS.RETURNED_BY_MOHUA:
    case FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA:
      return 'Approved';
    case FORM_STATUS.RETURNED_BY_PMU:
      return 'Returned';
    case FORM_STATUS.ACTION_REQUIRED:
      return 'Needs Update';
    default:
      // null (never submitted for PMU row review, or stale pre-PMU data) or any unexpected value —
      // never silently shown as "Approved".
      return 'Not Submitted';
  }
}

const ROW_STATUS_BADGE_CLASS: Record<RowStatusBucket, string> = {
  'Pending Review': 'bg-warning-subtle text-warning-emphasis',
  Approved: 'bg-success-subtle text-success-emphasis',
  Returned: 'bg-danger-subtle text-danger-emphasis',
  'Needs Update': 'bg-warning-subtle text-warning-emphasis',
  'Not Submitted': 'bg-secondary-subtle text-secondary-emphasis',
};

/**
 * One generic row-level PMU review detail, serving Elected Body Status / FC Unspent Declaration —
 * read-only form-level fields (same mechanism as the form-level detail) plus a per-ULB row table
 * (read-only; the decision is made on the whole form). Only `route.data.form` differs per form, never this component's
 * own code (Component-reuse architecture, Option C).
 */
@Component({
  selector: 'app-pmu-row-review-detail',
  standalone: true,
  imports: [
    DynamicFormComponent,
    ReviewAcknowledgmentComponent,
    XvifcBreadcrumbComponent,
    MatSortModule,
    LoaderComponent,
    PreLoaderComponent,
    AmountDisplayToggleComponent,
    TruncatedTextComponent,
  ],
  templateUrl: './pmu-row-review-detail.component.html',
  styleUrl: './pmu-row-review-detail.component.scss',
})
export class PmuRowReviewDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly dynamicFormService = inject(DynamicFormService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly reviewService = inject(PmuRowReviewService);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly amountDisplay = inject(AmountDisplayModeService);
  /** Must be resolved in this field-initializer injection context — see themedDialogConfig's own doc. */
  private readonly dialogConfig = themedDialogConfig();
  /** Emitted right before each `bindVisibility()` rebuild — see the form-level detail component's
   *  own doc comment for why this is needed across reloads. */
  private readonly formSubscriptionsTeardown$ = new Subject<void>();
  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

  private readonly form = this.route.snapshot.data['form'] as PmuReviewFormId;
  /** Set by the MoHUA routes: the same screen, read-only (MoHUA views these forms, it never approves or returns them). */
  readonly viewOnly = this.route.snapshot.data['viewOnly'] === true;
  private readonly stateId = this.route.snapshot.paramMap.get('stateId') ?? '';
  readonly installment = this.route.snapshot.paramMap.get('installment');

  readonly formOption = pmuFormOption(this.form);
  readonly showEligibility = hasEligibilityColumn(this.form);
  /** Gates the 3 money columns (Allocation/Unspent/Previous Balance) — same FC-Unspent-only
   *  condition as `showEligibility` today, kept as its own named flag since the two are
   *  conceptually distinct (eligibility vs. money), not because the underlying check differs. */
  readonly showMoneyColumns = this.showEligibility;
  /** The 16th FC Allocation column only has data for Devolution-linked design years; for independent
   *  (14th FC) years the backend stores no allocation, so the column is left out. */
  readonly showAllocationColumn = computed(
    () => this.showMoneyColumns && this.rows().some((r) => r.allocationAmount != null),
  );
  /** Gates the 4 Elected-Body-only columns (Status, the 2 dates, Remarks). */
  readonly showElectedBodyColumns = hasElectedBodyColumns(this.form);
  /** Loading/empty-state row's `colspan` — ULB Name + Census Code + Status, plus the
   *  3 money columns and/or the Eligibility column and/or the 4 Elected Body columns when shown. */
  readonly colSpan = computed(
    () =>
      3 +
      (this.showMoneyColumns ? 2 : 0) +
      (this.showAllocationColumn() ? 1 : 0) +
      (this.showEligibility ? 1 : 0) +
      (this.showElectedBodyColumns ? 4 : 0),
  );

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);
  readonly unitSuffix = () => this.amountDisplay.unitSuffix('inr');

  /** Mirrors the State-side `eulb-editable-field-cell.component.ts`'s own `formatDateValue` for
   *  display consistency with the form these rows originate from. */
  formatRowDate(value: string | null | undefined): string {
    if (!value) return '-';
    try {
      return formatDate(value, 'dd MMM yyyy', 'en-IN', '+0530');
    } catch {
      return '-';
    }
  }

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => {
    const yearId = this.moduleService.yearId();
    if (this.viewOnly) {
      return [
        { label: 'All States', routerLink: ['/xvifc', yearId, 'overview'] },
        { label: this.stateName(), routerLink: ['/xvifc', yearId, 'review-state-submissions', this.stateId] },
        { label: this.formOption.label },
      ];
    }
    return [
      {
        label: 'Review State Submissions',
        routerLink: ['/xvifc', yearId, 'review-state-submissions'],
        queryParams: { ...this.route.snapshot.queryParams, form: this.form },
      },
      { label: this.formOption.label },
    ];
  });

  readonly review = signal<PmuFormReviewData | null>(null);
  readonly stateName = computed(() => this.review()?.stateName ?? 'Selected State');
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly isApproving = signal(false);
  readonly isRejecting = signal(false);
  readonly isUndoing = signal(false);
  /** Set when a mutating action (approve/reject, row-level or form-level) fails — distinct from
   *  `loadError`, which blocks the whole page on the initial GET and would hide the very rows/
   *  buttons the user needs to retry or fix. Cleared at the start of the next attempt. */
  readonly mutationError = signal<string | null>(null);

  /** Writable (not `computed`) — see the form-level detail component's own doc comment for why
   *  `bindVisibility()` requires this. */
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  /** Rebuilt whenever `review` loads/reloads — see the form-level detail component's own doc
   *  comment for why this can't just be built once from the initial (empty) `fields()`. */
  readonly formGroup = signal<FormGroup>(this.dynamicFormService.toFormGroup([]));
  /** The only array templates should ever iterate — see the form-level detail component's own
   *  doc comment. */
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly statusLabel = computed(() => pmuStatusLabel(this.review()?.currentFormStatus ?? 0));
  readonly statusBadgeClass = computed(() => pmuStatusBadgeClass(this.review()?.currentFormStatus ?? 0));
  /** Only shown while the form is currently Returned — see the form-level detail component's own
   *  doc comment for why a plain truthy check on `pmuRemarks` isn't enough. */
  readonly rejectionRemarks = computed(() =>
    this.review()?.currentFormStatus === FORM_STATUS.RETURNED_BY_PMU ? (this.review()?.pmuRemarks ?? null) : null,
  );

  readonly canApprove = computed(() => this.review()?.permissions.canApproveForm ?? false);
  readonly canReject = computed(() => this.review()?.permissions.canRejectForm ?? false);
  readonly canUndo = computed(() => !this.viewOnly && (this.review()?.permissions.canUndo ?? false));
  readonly undoLabel = computed(() =>
    this.review()?.currentFormStatus === FORM_STATUS.RETURNED_BY_PMU ? 'Undo return' : 'Undo approval',
  );
  readonly isBusy = computed(() => this.isApproving() || this.isRejecting() || this.isUndoing());

  // ─── Rows ────────────────────────────────────────────────────────────────

  /** Only ever holds the current server page (≤`limit`) — not the whole dataset. A state's ULB
   *  count can run into the hundreds, so "fetch everything, paginate client-side" (this
   *  component's old behavior) doesn't scale; see `common/services/CLAUDE.md`'s pagination note
   *  on the backend for the matching server-side change. */
  readonly rows = signal<PmuRow[]>([]);
  readonly isLoadingRows = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = ROWS_PAGE_SIZE;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  readonly startIndex = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.limit + 1));
  readonly endIndex = computed(() => Math.min((this.page() - 1) * this.limit + this.rows().length, this.total()));

  /** Raw input value (updates every keystroke, for display) vs. the debounced value actually sent
   *  to the server — mirrors `request-exemption-list.component.ts`'s own search pattern. */
  readonly searchInputValue = signal('');
  private currentSearch = '';
  private readonly searchInput$ = new Subject<string>();

  /** Tracks the in-flight rows request so a search/status/sort/page change or mutation reload that
   *  arrives before the previous one resolves can cancel it — otherwise an older response can
   *  overwrite newer rows/total. Mirrors `dur.component.ts`'s/
   *  `upload-documents.component.ts`'s own `pollingSub` pattern. */
  private rowsSub: Subscription | null = null;

  readonly sort = signal<Sort | null>(null);

  /** Whole-dataset row count, independent of the current search (a separate backend
   *  query from `total()`, which reflects the *filtered* set) — `0` means this
   *  submission genuinely has no rows to review at all (e.g. FC Unspent's No-branch), as opposed to
   *  the current filter simply matching nothing (handled separately, in-table). */
  readonly datasetSize = computed(() => this.review()?.rowSummary?.total ?? 0);

  constructor() {
    this.loadReview();

    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.currentSearch = value;
        this.loadRows(1);
      });
  }

  private loadReview(): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) {
      this.loadError.set('Missing year context. Please navigate here from the PMU menu.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    this.reviewService
      .getReview(this.formOption, this.stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.review.set(data);
          this.applyQuestions(data.questions ?? []);
          this.isLoading.set(false);
          this.loadRows(1);
        },
        error: (err: unknown) => {
          this.isLoading.set(false);
          const response = extractApiErrorResponse(err);
          this.loadError.set(response?.message ?? 'Unable to load the review data. Please try again.');
          this.utilityService.triggerSnackbar('Unable to load the review data.', 'snackbar-danger');
        },
      });
  }

  /** The single fetch path — called on init, on debounced search, on `goToPage()`, and after a
   *  mutation (reloading the same page). Never fetches more than one page at a time. */
  private loadRows(page: number): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    const sort = this.sort();

    this.isLoadingRows.set(true);
    this.rowsSub?.unsubscribe();
    this.rowsSub = this.reviewService
      .getRows(this.formOption, this.stateId, yearId, {
        page,
        limit: this.limit,
        search: this.currentSearch || undefined,
        sortBy: sort?.direction ? (sort.active as 'ulbName' | 'rowStatus') : undefined,
        sortDir: sort?.direction ? sort.direction : undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoadingRows.set(false);
          if (res.rows.length === 0 && page > 1) {
            // A mutation emptied what used to be the last page (e.g. every row on it just got
            // approved) — fall back a page instead of showing a confusing blank table.
            this.loadRows(page - 1);
            return;
          }
          this.rows.set(res.rows);
          this.page.set(res.page);
          this.total.set(res.total);
        },
        error: () => {
          this.isLoadingRows.set(false);
          this.utilityService.triggerSnackbar('Unable to load rows.', 'snackbar-danger');
        },
      });
  }

  /** Reloads metadata + rows after a mutation — never locally patches status/rows; the reloaded
   *  response is the only source of truth (mirrors mohua-module/fc-unspent-review's own discipline). */
  private reloadAfterMutation(onDone?: () => void): void {
    const page = this.page();
    const yearId = this.moduleService.yearId();
    if (!yearId) {
      onDone?.();
      return;
    }

    this.reviewService
      .getReview(this.formOption, this.stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.review.set(data);
          this.applyQuestions(data.questions ?? []);
          this.loadRows(page);
          onDone?.();
        },
        error: () => {
          this.utilityService.triggerSnackbar('Review data may be stale — please reload the page.', 'snackbar-danger');
          onDone?.();
        },
      });
  }

  /** Rebuilds the form group + re-applies `visibleWhen` visibility for a freshly (re)loaded
   *  question set — see the form-level detail component's own doc comment. */
  private applyQuestions(questions: ConditionalFieldConfig[]): void {
    this.formSubscriptionsTeardown$.next();

    this.formGroup.set(this.dynamicFormService.toFormGroup(questions));
    this.fields.set(questions);

    // Synthetic control, not part of the backend's FieldConfig[] — same pattern as
    // ElectedBodyStatusComponent's own (state-side) `createFormControls()`. Bridges
    // `review().validationStatus` (a plain field, sibling to `questions`, only ever present for
    // Elected Body) into the reactive form so signedElectedbodyFile's `visibleWhen` can gate on
    // Excel *validity*, not just presence. Harmless no-op for FC Unspent, whose response never
    // includes `validationStatus`.
    const validationStatus = this.review()?.validationStatus;
    if (validationStatus !== undefined) {
      this.formGroup().addControl('electedBodyExcelValidationStatus', new FormControl(validationStatus));
    }

    // Synthetic control, same pattern as electedBodyExcelValidationStatus above. Bridges
    // `review().rowSummary.total` into the reactive form so fcUnspentDeclaration's second
    // visibleWhen condition (`savedUnspentUlbData` isNotEmpty) can evaluate — on the State side this
    // is a real array of per-ULB row data; here only its *presence* matters, so an array sized to
    // the already-known row count is enough. Harmless no-op for Elected Body, whose `rowSummary`
    // (when present) isn't checked by any visibleWhen condition.
    const rowTotal = this.review()?.rowSummary?.total;
    if (rowTotal !== undefined) {
      this.formGroup().addControl('savedUnspentUlbData', new FormControl(Array.from({ length: rowTotal })));
    }

    this.dependencyIndex = this.visibilityService.createDependencyIndex(questions);
    this.visibilityService.bindVisibility({
      form: this.formGroup(),
      fieldsSignal: this.fields,
      dependencyIndex: this.dependencyIndex,
      destroyRef: this.destroyRef,
      preserveHiddenValue: true,
      formTeardown$: this.formSubscriptionsTeardown$,
    });
  }

  rowBadgeClass(row: PmuRow): string {
    return ROW_STATUS_BADGE_CLASS[rowStatusBucket(row.rowStatus)];
  }

  rowStatusLabel(row: PmuRow): string {
    return rowStatusBucket(row.rowStatus);
  }

  eligibilityLabel(row: PmuRow): string {
    return row.eligibility ? 'Eligible' : 'Not Eligible';
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInputValue.set(value);
    this.searchInput$.next(value);
  }

  /** `sort.direction === ''` is Material's native 3rd-click state (back to unsorted) — clears back
   *  to the backend's default row order. */
  onSortChange(sort: Sort): void {
    this.sort.set(sort.direction ? sort : null);
    this.loadRows(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || this.isLoadingRows()) return;
    this.loadRows(page);
  }

  onApprove(): void {
    if (!this.canApprove() || this.isBusy()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.mutationError.set(null);
    this.isApproving.set(true);
    this.reviewService
      .approveForm(this.formOption, this.stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.utilityService.triggerSnackbar('Form approved. Ready to generate claim letter.');
          // Keep the page loader up until the refreshed review is in, so the old status never flashes back.
          this.reloadAfterMutation(() => this.isApproving.set(false));
        },
        error: (err: unknown) => {
          this.isApproving.set(false);
          this.applyMutationError(err, 'Unable to approve the form. Please try again.');
        },
      });
  }

  onReject(remarks: string, ack: ReviewAcknowledgmentComponent): void {
    if (!this.canReject() || this.isBusy()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.mutationError.set(null);
    this.isRejecting.set(true);
    this.reviewService
      .rejectForm(this.formOption, this.stateId, yearId, remarks)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          ack.resetReject();
          this.utilityService.triggerSnackbar('Form rejected.', 'snackbar-danger');
          // Keep the page loader up until the refreshed review is in, so the old status never flashes back.
          this.reloadAfterMutation(() => this.isRejecting.set(false));
        },
        error: (err: unknown) => {
          this.isRejecting.set(false);
          this.applyMutationError(err, 'Unable to reject the form. Please try again.');
        },
      });
  }

  /** Reverses PMU's own approve/return — the form and every ULB row go back to Under Review by PMU —
   *  after an explicit confirmation that states the outcome. The button only shows when the backend says
   *  `canUndo` (status 5/14, no claim letter started, and for FC Unspent no row decided by MoHUA). */
  onUndo(): void {
    if (!this.canUndo() || this.isBusy()) return;
    const yearId = this.moduleService.yearId();
    const status = this.review()?.currentFormStatus;
    if (!yearId || status === undefined) return;

    this.confirmDialog
      .confirm(
        buildPmuUndoConfirm({ formLabel: this.formOption.label, stateName: this.stateName(), status, hasRows: true }),
        this.dialogConfig,
      )
      .pipe(
        filter((confirmed) => confirmed),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.runUndo(yearId));
  }

  private runUndo(yearId: string): void {
    this.mutationError.set(null);
    this.isUndoing.set(true);
    this.reviewService
      .undoForm(this.formOption, this.stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.utilityService.triggerSnackbar('Decision undone. The form and all its rows are back under review.');
          // Keep the loader up until the refreshed review is in, so the old status never flashes back.
          this.reloadAfterMutation(() => this.isUndoing.set(false));
        },
        error: (err: unknown) => {
          this.isUndoing.set(false);
          this.applyMutationError(err, 'Unable to undo the decision. Please try again.');
        },
      });
  }

  /** Reads the `_form`-keyed error message off the response (falling back to the generic
   *  `message`) and surfaces it both as a persistent banner (`mutationError`, rendered above the
   *  rows/actions so it survives past a toast's auto-dismiss) and a toast — see
   *  `extractFormLevelErrorMessage`'s own doc comment for why `_form` specifically was being lost
   *  before this fix. */
  private applyMutationError(err: unknown, fallbackMessage: string): void {
    const message = extractFormLevelErrorMessage(err, fallbackMessage);
    this.mutationError.set(message);

    // Long validation messages (e.g. "rowsAlreadyApproved", "rowsNotApprovable", "notPending")
    // need more than 3s to read, so keep them open until manually closed.
    // See isLongSnackbarMessage for the threshold.
    const persistent = isLongSnackbarMessage(message);
    this.utilityService.triggerSnackbar(message, 'snackbar-danger', { persistent });
  }
}
