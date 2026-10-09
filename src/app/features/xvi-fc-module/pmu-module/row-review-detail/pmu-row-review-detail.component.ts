import { formatDate } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { ReviewAcknowledgmentComponent } from '../../shared/review-acknowledgment/review-acknowledgment.component';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../shared/breadcrumb/breadcrumb.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
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
  hasElectedBodyColumns,
  pmuFormOption,
  pmuStatusBadgeClass,
  pmuStatusLabel,
} from '../pmu-review.config';
import { PmuBulkApprovePayload, PmuBulkRejectPayload, PmuFormReviewData, PmuRow } from '../pmu-review.models';
import { PmuRowReviewService } from '../pmu-row-review.service';
import { extractApiErrorResponse, extractFormLevelErrorMessage } from '../pmu-review.utils';
import { FORM_STATUS } from '../../common/constants/form-status.constants';

/** One UI page == one backend page — matches the backend's own max page size, same "fixed limit
 *  const" style as `request-exemption-list.component.ts`, not a page-size selector. */
const ROWS_PAGE_SIZE = 25;

type SelectionMode = 'explicit' | 'allMatching';

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

/** The 4 *reachable* buckets a row's `rowStatus` can actually be filtered by — "Not Submitted" is
 *  deliberately excluded: a row only ever exists in this table once its parent form has been finally
 *  submitted, which always sets every row's `rowStatus` to at least `UNDER_REVIEW_BY_PMU`, so that
 *  bucket (`null`/unexpected) is a defensive badge fallback, never a real state here. "Approved" maps
 *  to 3 codes since FC Unspent's own MoHUA rows reviewer can move a row on to either terminal MoHUA
 *  status — EULB (no MoHUA reviewer) only ever populates the first of the 3 in practice. */
const STATUS_FILTER_OPTIONS: ReadonlyArray<{ label: Exclude<RowStatusBucket, 'Not Submitted'>; statuses: number[] }> = [
  { label: 'Pending Review', statuses: [FORM_STATUS.UNDER_REVIEW_BY_PMU] },
  {
    label: 'Approved',
    statuses: [
      FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
      FORM_STATUS.RETURNED_BY_MOHUA,
      FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA,
    ],
  },
  { label: 'Returned', statuses: [FORM_STATUS.RETURNED_BY_PMU] },
  { label: 'Needs Update', statuses: [FORM_STATUS.ACTION_REQUIRED] },
];

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
    MatSortModule,
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
  /** Gates the 4 Elected-Body-only columns (Status, the 2 dates, Remarks). */
  readonly showElectedBodyColumns = hasElectedBodyColumns(this.form);
  /** Loading/empty-state row's `colspan` — checkbox + ULB Name + Census Code + Status (4), plus the
   *  3 money columns and/or the Eligibility column and/or the 4 Elected Body columns when shown. */
  readonly colSpan =
    4 + (this.showMoneyColumns ? 3 : 0) + (this.showEligibility ? 1 : 0) + (this.showElectedBodyColumns ? 4 : 0);

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
  readonly isBusy = computed(() => this.isApproving() || this.isRejecting());

  // ─── Rows ────────────────────────────────────────────────────────────────

  /** Only ever holds the current server page (≤`limit`) — not the whole dataset. A state's ULB
   *  count can run into the hundreds, so "fetch everything, paginate client-side" (this
   *  component's old behavior) doesn't scale; see `common/services/CLAUDE.md`'s pagination note
   *  on the backend for the matching server-side change. */
  readonly rows = signal<PmuRow[]>([]);
  readonly isLoadingRows = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  /** Rows matching the current search that are still awaiting PMU review — what "select all
   *  matching" actually resolves to server-side, as opposed to `total()` (every matching row
   *  regardless of status). See `PmuRowsResult.pendingTotal`'s own doc comment. */
  readonly pendingTotal = signal(0);
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
   *  overwrite newer rows/total/pendingTotal. Mirrors `dur.component.ts`'s/
   *  `upload-documents.component.ts`'s own `pollingSub` pattern. */
  private rowsSub: Subscription | null = null;

  /** The 4 reachable status-filter options the template renders as `<option>`s — see
   *  `STATUS_FILTER_OPTIONS`'s own doc comment for why "Not Submitted" is excluded. */
  readonly statusFilterOptions = STATUS_FILTER_OPTIONS;
  readonly statusFilter = signal<Exclude<RowStatusBucket, 'Not Submitted'> | ''>('');
  readonly sort = signal<Sort | null>(null);

  /** Whole-dataset row count, independent of the current search/status filter (a separate backend
   *  query from `total()`/`pendingTotal()`, which both reflect the *filtered* set) — `0` means this
   *  submission genuinely has no rows to review at all (e.g. FC Unspent's No-branch), as opposed to
   *  the current filter simply matching nothing (handled separately, in-table). */
  readonly datasetSize = computed(() => this.review()?.rowSummary?.total ?? 0);

  // ─── Selection — two-tier model, not a client-side id loop across pages ───
  //
  // Per-page explicit checkboxes persist across page navigation (`selectedRowIds`, keyed by id,
  // not by what's currently rendered). Checking every reviewable row on the current page surfaces
  // a "select all N matching" banner (Gmail/GitHub/Linear-style) — accepting it switches to
  // `allMatching` mode, where the bulk action is resolved by filter server-side instead of the
  // frontend enumerating every id across pages first (see `BulkApprovePmuRowsDto`'s own docblock
  // on the backend). `excludeRowIds` only applies in `allMatching` mode — rows manually unchecked
  // after selecting all.
  readonly selectionMode = signal<SelectionMode>('explicit');
  readonly selectedRowIds = signal<ReadonlySet<string>>(new Set());
  readonly excludeRowIds = signal<ReadonlySet<string>>(new Set());
  /** Accumulates display data (name/census code/permissions) for every currently-selected row as
   *  pages are viewed — `rows()` only ever holds the current page, so a row selected on an earlier
   *  page needs its data cached somewhere once that page is no longer loaded. Not a signal: read
   *  only from the computeds below, which already react to `selectedRowIds`/`rows`. */
  private readonly selectedRowsCache = new Map<string, PmuRow>();

  readonly reviewableRows = computed(() =>
    this.rows().filter((r) => r.permissions.canApprove || r.permissions.canReject),
  );
  /** Header checkbox state — "every reviewable row on the current page is selected," not "every
   *  row across the whole dataset" (that's what `allMatching` mode means instead). */
  readonly allReviewableSelected = computed(() => {
    if (this.selectionMode() === 'allMatching') return true;
    const reviewable = this.reviewableRows();
    return reviewable.length > 0 && reviewable.every((r) => this.selectedRowIds().has(r._id));
  });
  /** Shown once a full page is selected and more pending rows exist beyond it — accepting it is
   *  the only way to act on more than one page's worth of rows without enumerating ids. Compares
   *  against `pendingTotal()` (not `total()`) so the banner doesn't appear when every remaining
   *  row elsewhere has already been actioned — nothing left to actually select. */
  readonly showSelectAllMatchingBanner = computed(
    () =>
      this.selectionMode() === 'explicit' &&
      this.allReviewableSelected() &&
      this.pendingTotal() > this.reviewableRows().length,
  );
  readonly selectedCount = computed(() =>
    this.selectionMode() === 'allMatching'
      ? Math.max(0, this.pendingTotal() - this.excludeRowIds().size)
      : this.selectedRowIds().size,
  );
  readonly hasSelection = computed(() => this.selectedCount() > 0);
  readonly canBulkApprove = computed(() => {
    if (this.selectionMode() === 'allMatching') return this.hasSelection();
    const selected = this.selectedRowsSnapshot();
    return selected.length > 0 && selected.every((r) => r.permissions.canApprove);
  });
  readonly canBulkReject = computed(() => {
    if (this.selectionMode() === 'allMatching') return this.hasSelection();
    const selected = this.selectedRowsSnapshot();
    return selected.length > 0 && selected.every((r) => r.permissions.canReject);
  });
  readonly isBulkMutating = signal(false);

  /** Explicit mode only — every selected row this component has seen data for (may include rows
   *  from a page that's no longer the current one). */
  private selectedRowsSnapshot(): PmuRow[] {
    const rows: PmuRow[] = [];
    for (const id of this.selectedRowIds()) {
      const row = this.selectedRowsCache.get(id);
      if (row) rows.push(row);
    }
    return rows;
  }

  constructor() {
    this.loadReview();

    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.currentSearch = value;
        // A filter change redefines what "matching" means, so any in-flight selection (explicit
        // or "select all matching") is no longer a faithful description of the user's intent.
        this.resetSelection();
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
   *  mutation (reloading the same page). Never fetches more than one page at a time; "select all"
   *  across the whole dataset is handled server-side instead (see the selection block above). */
  private loadRows(page: number): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    const statusFilter = this.statusFilter();
    const rowStatus = statusFilter
      ? STATUS_FILTER_OPTIONS.find((o) => o.label === statusFilter)?.statuses
      : undefined;
    const sort = this.sort();

    this.isLoadingRows.set(true);
    this.rowsSub?.unsubscribe();
    this.rowsSub = this.reviewService
      .getRows(this.formOption, this.stateId, yearId, {
        page,
        limit: this.limit,
        search: this.currentSearch || undefined,
        rowStatus,
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
          this.pendingTotal.set(res.pendingTotal);
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
    const page = this.page();
    this.resetSelection();
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.reviewService
      .getReview(this.formOption, this.stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.review.set(data);
          this.applyQuestions(data.questions ?? []);
          this.loadRows(page);
        },
        error: () =>
          this.utilityService.triggerSnackbar('Review data may be stale — please reload the page.', 'snackbar-danger'),
      });
  }

  /** Backs out of whatever selection state exists — both the explicit per-page set and "select all
   *  matching" mode — e.g. after a mutation consumes the current selection, or the search filter
   *  changes underneath it. */
  private resetSelection(): void {
    this.selectionMode.set('explicit');
    this.selectedRowIds.set(new Set());
    this.excludeRowIds.set(new Set());
    this.selectedRowsCache.clear();
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

  /** Template checkbox binding — mode-aware: in `allMatching` mode every row is selected by
   *  default except ones explicitly excluded afterward. */
  isRowSelected(row: PmuRow): boolean {
    if (this.selectionMode() === 'allMatching') return !this.excludeRowIds().has(row._id);
    return this.selectedRowIds().has(row._id);
  }

  toggleRow(row: PmuRow): void {
    if (!row.permissions.canApprove && !row.permissions.canReject) return;

    if (this.selectionMode() === 'allMatching') {
      const nextExcluded = new Set(this.excludeRowIds());
      if (nextExcluded.has(row._id)) nextExcluded.delete(row._id);
      else nextExcluded.add(row._id);
      this.excludeRowIds.set(nextExcluded);
      return;
    }

    const next = new Set(this.selectedRowIds());
    if (next.has(row._id)) {
      next.delete(row._id);
      this.selectedRowsCache.delete(row._id);
    } else {
      next.add(row._id);
      this.selectedRowsCache.set(row._id, row);
    }
    this.selectedRowIds.set(next);
  }

  /** Header checkbox — toggles only the rows on the *current page*, not every page's selection
   *  (those persist independently; see the selection block's own doc comment). Re-clicking while
   *  in `allMatching` mode backs all the way out of it, matching Gmail's own "clear selection". */
  toggleSelectAll(): void {
    if (this.selectionMode() === 'allMatching') {
      this.cancelSelectAllMatching();
      return;
    }

    const reviewable = this.reviewableRows();
    const deselecting = this.allReviewableSelected();
    const next = new Set(this.selectedRowIds());
    for (const row of reviewable) {
      if (deselecting) {
        next.delete(row._id);
        this.selectedRowsCache.delete(row._id);
      } else {
        next.add(row._id);
        this.selectedRowsCache.set(row._id, row);
      }
    }
    this.selectedRowIds.set(next);
  }

  /** Accepts the "select all {total} matching" banner — switches from per-page explicit ids to a
   *  server-resolved filter (the same search the reviewer already sees) covering every matching row
   *  regardless of how many pages it spans. No extra fetch: the filter is resolved at submit time. */
  selectAllMatching(): void {
    this.selectionMode.set('allMatching');
    this.selectedRowIds.set(new Set());
    this.excludeRowIds.set(new Set());
    this.selectedRowsCache.clear();
  }

  cancelSelectAllMatching(): void {
    this.resetSelection();
  }

  approveSelectedRows(): void {
    if (!this.canBulkApprove() || this.isBulkMutating()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.mutationError.set(null);
    const payload: PmuBulkApprovePayload =
      this.selectionMode() === 'allMatching'
        ? {
            stateId: this.stateId,
            yearId,
            selectAllMatching: { search: this.currentSearch || undefined },
            excludeRowIds: [...this.excludeRowIds()],
          }
        : { stateId: this.stateId, yearId, rowIds: [...this.selectedRowIds()] };

    this.isBulkMutating.set(true);
    this.reviewService
      .bulkApproveRows(this.formOption, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isBulkMutating.set(false);
          this.utilityService.triggerSnackbar(`${res.updatedRowCount} row(s) approved.`);
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isBulkMutating.set(false);
          this.applyMutationError(err, 'Unable to approve the selected rows. Please try again.');
        },
      });
  }

  /** Explicit mode: lists every selected row's census code before the reject finalizes (selection
   *  can span pages). "Select all matching" mode: no per-row list is meaningful (could be
   *  hundreds) — the dialog shows a count-based summary instead (see its own doc comment). */
  startRejectSelectedRows(): void {
    if (!this.hasSelection() || this.isBulkMutating()) return;

    const dialogData: PmuBulkRejectRowsDialogData =
      this.selectionMode() === 'allMatching'
        ? { matchingCount: this.selectedCount() }
        : { rows: this.selectedRowsSnapshot() };

    this.dialog
      .open<PmuBulkRejectRowsDialogComponent, PmuBulkRejectRowsDialogData, string | undefined>(
        PmuBulkRejectRowsDialogComponent,
        { data: dialogData, ...this.dialogConfig },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((remarks) => {
        if (!remarks) return;
        this.rejectSelectedRows(remarks);
      });
  }

  private rejectSelectedRows(rejectionRemark: string): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.mutationError.set(null);
    const payload: PmuBulkRejectPayload =
      this.selectionMode() === 'allMatching'
        ? {
            stateId: this.stateId,
            yearId,
            selectAllMatching: { search: this.currentSearch || undefined },
            excludeRowIds: [...this.excludeRowIds()],
            rejectionRemark,
          }
        : {
            stateId: this.stateId,
            yearId,
            rows: this.selectedRowsSnapshot().map((r) => ({ rowId: r._id, rejectionRemark })),
          };

    this.isBulkMutating.set(true);
    this.reviewService
      .bulkRejectRows(this.formOption, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isBulkMutating.set(false);
          this.utilityService.triggerSnackbar(`${res.updatedRowCount} row(s) rejected.`);
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isBulkMutating.set(false);
          this.applyMutationError(err, 'Unable to reject the selected rows. Please try again.');
        },
      });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInputValue.set(value);
    this.searchInput$.next(value);
  }

  /** A changed filter redefines "what's matching", same as the search input's own subscriber. */
  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as Exclude<RowStatusBucket, 'Not Submitted'> | '';
    this.statusFilter.set(value);
    this.resetSelection();
    this.loadRows(1);
  }

  /** `sort.direction === ''` is Material's native 3rd-click state (back to unsorted) — clears back
   *  to the backend's default row order. Sorting doesn't change which rows match, only their order,
   *  but resetting selection anyway keeps this control's behavior consistent with every other
   *  filter/search control here. */
  onSortChange(sort: Sort): void {
    this.sort.set(sort.direction ? sort : null);
    this.resetSelection();
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
          this.isApproving.set(false);
          this.utilityService.triggerSnackbar('Form approved.');
          this.reloadAfterMutation();
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
          this.isRejecting.set(false);
          ack.resetReject();
          this.utilityService.triggerSnackbar('Form rejected.', 'snackbar-danger');
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isRejecting.set(false);
          this.applyMutationError(err, 'Unable to reject the form. Please try again.');
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
    this.utilityService.triggerSnackbar(message, 'snackbar-danger');
  }
}
