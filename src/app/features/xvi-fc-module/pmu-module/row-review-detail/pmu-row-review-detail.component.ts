import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { ReviewAcknowledgmentComponent } from '../../shared/review-acknowledgment/review-acknowledgment.component';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../shared/breadcrumb/breadcrumb.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { themedDialogConfig } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { AmountDisplayToggleComponent } from '../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { AmountDisplayModeService } from '../../../../core/services/amount-display-mode.service';
import {
  PmuBulkRejectRowsDialogComponent,
  PmuBulkRejectRowsDialogData,
} from './dialogs/pmu-bulk-reject-rows-dialog/pmu-bulk-reject-rows-dialog.component';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import {
  PmuReviewFormId,
  hasEligibilityColumn,
  pmuFormOption,
  pmuStatusBadgeClass,
  pmuStatusLabel,
} from '../pmu-review.config';
import { PmuFormReviewData, PmuRow } from '../pmu-review.models';
import { PmuRowReviewService } from '../pmu-row-review.service';
import { extractApiErrorResponse } from '../pmu-review.utils';
import { FORM_STATUS } from '../../common/constants/form-status.constants';

const ROWS_PAGE_SIZE = 5;

/** A row's own `rowStatus` is a different domain than a form's `currentFormStatus` (never
 *  NOT_STARTED/IN_PROGRESS, but can be `null` for a never-touched/pre-PMU row, or `ACTION_REQUIRED`
 *  — neither of which `pmuStatusBucket` (form-level) was built to handle; reusing it here silently
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
 * with bulk select/approve/reject. Only `route.data.form` differs per form, never this component's
 * own code (Component-reuse architecture, Option C).
 */
@Component({
  selector: 'app-pmu-row-review-detail',
  standalone: true,
  imports: [
    DynamicFormComponent,
    ReviewAcknowledgmentComponent,
    XvifcBreadcrumbComponent,
    MatButtonModule,
    PreLoaderComponent,
    AmountDisplayToggleComponent,
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
  private readonly dialog = inject(MatDialog);
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
  private readonly stateId = this.route.snapshot.paramMap.get('stateId') ?? '';

  readonly formOption = pmuFormOption(this.form);
  readonly showEligibility = hasEligibilityColumn(this.form);
  /** Gates the 3 money columns (Allocation/Unspent/Previous Balance) — same FC-Unspent-only
   *  condition as `showEligibility` today, kept as its own named flag since the two are
   *  conceptually distinct (eligibility vs. money), not because the underlying check differs. */
  readonly showMoneyColumns = this.showEligibility;
  /** Loading/empty-state row's `colspan` — checkbox + ULB Name + Census Code + Status (4), plus the
   *  3 money columns and/or the Eligibility column when shown. */
  readonly colSpan = 4 + (this.showMoneyColumns ? 3 : 0) + (this.showEligibility ? 1 : 0);

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);
  readonly unitSuffix = () => this.amountDisplay.unitSuffix('inr');

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => [
    {
      label: 'Review State Submissions',
      routerLink: ['/xvifc', this.moduleService.yearId(), 'review-state-submissions'],
      queryParams: { ...this.route.snapshot.queryParams, form: this.form },
    },
    { label: this.formOption.label },
  ]);

  readonly review = signal<PmuFormReviewData | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly isApproving = signal(false);
  readonly isRejecting = signal(false);

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
  readonly isBusy = computed(() => this.isApproving() || this.isRejecting());

  // ─── Rows ────────────────────────────────────────────────────────────────

  readonly rows = signal<PmuRow[]>([]);
  readonly isLoadingRows = signal(false);
  readonly selectedRowIds = signal<ReadonlySet<string>>(new Set());

  readonly searchQuery = signal('');
  readonly page = signal(1);
  readonly limit = ROWS_PAGE_SIZE;

  /** Filters by ULB name/census code — "Select all"/bulk actions below are scoped to this (every
   *  matching row across all pages), while `pagedRows` further slices it for display only. */
  readonly filteredRows = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.rows();
    return this.rows().filter(
      (r) => r.ulbName.toLowerCase().includes(query) || (r.censusCode ?? '').toLowerCase().includes(query),
    );
  });

  readonly total = computed(() => this.filteredRows().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  readonly startIndex = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.limit + 1));
  readonly endIndex = computed(() => Math.min(this.page() * this.limit, this.total()));
  readonly pagedRows = computed(() => this.filteredRows().slice((this.page() - 1) * this.limit, this.page() * this.limit));

  readonly reviewableRows = computed(() => this.filteredRows().filter((r) => r.permissions.canApprove || r.permissions.canReject));
  readonly allReviewableSelected = computed(
    () => this.reviewableRows().length > 0 && this.reviewableRows().every((r) => this.selectedRowIds().has(r._id)),
  );
  readonly hasSelection = computed(() => this.selectedRowIds().size > 0);
  readonly canBulkApprove = computed(() => {
    const selected = this.selectedRows;
    return selected.length > 0 && selected.every((r) => r.permissions.canApprove);
  });
  readonly canBulkReject = computed(() => {
    const selected = this.selectedRows;
    return selected.length > 0 && selected.every((r) => r.permissions.canReject);
  });
  readonly isBulkMutating = signal(false);

  private get selectedRows(): PmuRow[] {
    const ids = this.selectedRowIds();
    return this.rows().filter((r) => ids.has(r._id));
  }

  constructor() {
    this.loadReview();
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
          this.loadRows();
        },
        error: (err: unknown) => {
          this.isLoading.set(false);
          const response = extractApiErrorResponse(err);
          this.loadError.set(response?.message ?? 'Unable to load the review data. Please try again.');
          this.utilityService.triggerSnackbar('Unable to load the review data.', 'snackbar-danger');
        },
      });
  }

  private loadRows(): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.isLoadingRows.set(true);
    // Both EULB's and FC Unspent's backend GET /rows endpoints cap `limit` at 200 (their own
    // constants). Fetching the max in one call preserves the already-approved mockup's UX — search
    // and pagination are entirely client-side, including cross-page "Select all" — without
    // rearchitecting into server-side pagination.
    this.reviewService
      .getRows(this.formOption, this.stateId, yearId, { limit: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.rows);
          this.isLoadingRows.set(false);
        },
        error: () => {
          this.isLoadingRows.set(false);
          this.utilityService.triggerSnackbar('Unable to load rows.', 'snackbar-danger');
        },
      });
  }

  /** Reloads metadata + rows after a mutation — never locally patches status/rows; the reloaded
   *  response is the only source of truth (mirrors mohua-module/fc-unspent-review's own discipline). */
  private reloadAfterMutation(): void {
    this.selectedRowIds.set(new Set());
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.reviewService
      .getReview(this.formOption, this.stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.review.set(data);
          this.applyQuestions(data.questions ?? []);
          this.loadRows();
        },
        error: () => this.utilityService.triggerSnackbar('Review data may be stale — please reload the page.', 'snackbar-danger'),
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

  toggleRow(row: PmuRow): void {
    if (!row.permissions.canApprove && !row.permissions.canReject) return;
    const next = new Set(this.selectedRowIds());
    if (next.has(row._id)) next.delete(row._id);
    else next.add(row._id);
    this.selectedRowIds.set(next);
  }

  toggleSelectAll(): void {
    if (this.allReviewableSelected()) {
      this.selectedRowIds.set(new Set());
      return;
    }
    this.selectedRowIds.set(new Set(this.reviewableRows().map((r) => r._id)));
  }

  approveSelectedRows(): void {
    if (!this.canBulkApprove() || this.isBulkMutating()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    const rowIds = this.selectedRows.map((r) => r._id);
    this.isBulkMutating.set(true);
    this.reviewService
      .bulkApproveRows(this.formOption, { stateId: this.stateId, yearId, rowIds })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isBulkMutating.set(false);
          this.utilityService.triggerSnackbar(`${rowIds.length} row(s) approved.`);
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isBulkMutating.set(false);
          this.applyMutationError(err, 'Unable to approve the selected rows. Please try again.');
        },
      });
  }

  /** Lists every selected row's census code (selection can span pages) before the reject finalizes. */
  startRejectSelectedRows(): void {
    if (!this.hasSelection() || this.isBulkMutating()) return;
    const selectedRows = this.selectedRows;

    this.dialog
      .open<PmuBulkRejectRowsDialogComponent, PmuBulkRejectRowsDialogData, string | undefined>(
        PmuBulkRejectRowsDialogComponent,
        { data: { rows: selectedRows }, ...this.dialogConfig },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((remarks) => {
        if (!remarks) return;
        this.rejectSelectedRows(selectedRows, remarks);
      });
  }

  private rejectSelectedRows(selectedRows: PmuRow[], rejectionRemark: string): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.isBulkMutating.set(true);
    this.reviewService
      .bulkRejectRows(this.formOption, {
        stateId: this.stateId,
        yearId,
        rows: selectedRows.map((r) => ({ rowId: r._id, rejectionRemark })),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isBulkMutating.set(false);
          this.utilityService.triggerSnackbar('Selected rows rejected.');
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isBulkMutating.set(false);
          this.applyMutationError(err, 'Unable to reject the selected rows. Please try again.');
        },
      });
  }

  onSearchInput(event: Event): void {
    this.page.set(1);
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
  }

  onApprove(): void {
    if (!this.canApprove() || this.isBusy()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.isApproving.set(true);
    this.reviewService
      .approveForm(this.formOption, this.stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isApproving.set(false);
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isApproving.set(false);
          this.applyMutationError(err, 'Unable to approve the form. Please try again.');
        },
      });
  }

  onReject(remarks: string): void {
    if (!this.canReject() || this.isBusy()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.isRejecting.set(true);
    this.reviewService
      .rejectForm(this.formOption, this.stateId, yearId, remarks)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isRejecting.set(false);
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isRejecting.set(false);
          this.applyMutationError(err, 'Unable to reject the form. Please try again.');
        },
      });
  }

  private applyMutationError(err: unknown, fallbackMessage: string): void {
    const response = extractApiErrorResponse(err);
    this.utilityService.triggerSnackbar(response?.message ?? fallbackMessage, 'snackbar-danger');
  }
}
