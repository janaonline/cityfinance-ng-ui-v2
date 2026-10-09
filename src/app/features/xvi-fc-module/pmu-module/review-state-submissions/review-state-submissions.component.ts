import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { Sort } from '@angular/material/sort';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { StateService } from '../../../../core/services/state/state.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { IState } from '../../../../core/models/state/state';
import { FORM_STATUS } from '../../common/constants/form-status.constants';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import {
  // TODO: Clean up card — restore `ReviewWorklistBucket` once the bucket cards come back (see the
  // commented-out `buckets`/`activeBucketKey`/`onBucketSelected` below).
  ReviewWorklistColumn,
  ReviewWorklistComponent,
  ReviewWorklistServerPage,
} from '../../shared/review-worklist/review-worklist.component';
import {
  PMU_FORM_OPTIONS,
  PMU_FORM_STATUS_OPTIONS,
  PmuReviewFormId,
  pmuFormOption,
  pmuStatusBadgeClass,
  // TODO: Clean up card — restore `pmuStatusBucket` once the bucket cards come back.
  pmuStatusLabel,
} from '../pmu-review.config';
import { PmuWorklistRow } from '../pmu-review.models';
import { PmuWorklistService } from '../pmu-worklist.service';

/** The worklist's own row shape uses `updatedAt`, but the `mat-sort-header` for that column is
 *  keyed `submittedOn` (the column key, chosen for its header label) — this maps a clicked column
 *  back to the real backend field name `sortBy` expects. Only the 2 columns with `sortValue` set
 *  below are ever sortable at all. */
const WORKLIST_SORT_FIELD: Partial<Record<string, string>> = {
  stateName: 'stateName',
  submittedOn: 'updatedAt',
};

/** Capped at the backend's own worklist page-size ceiling (`PMU_WORKLIST_PAGINATION_MAX_LIMIT`) —
 *  deliberately not `ReviewWorklistComponent`'s own default `[10, 15, 25, 50]` choices, since `50`
 *  would 400 against this endpoint (the global `ValidationPipe` rejects an out-of-bound `limit`
 *  rather than clamping it). */
const WORKLIST_PAGE_SIZE_OPTIONS = [10, 20, 25];
const WORKLIST_DEFAULT_PAGE_SIZE = 20;

// TODO: Clean up card — the 4 bucket cards (Total/Pending Review/Approved/Returned) are disabled
// for now (causing more confusion than clarity once the Form Status dropdown went granular). The
// type/maps/wiring below are commented out, not deleted, so this is a quick revert once revisited.
// type PmuBucketKey = 'ALL' | 'PENDING' | 'APPROVED' | 'RETURNED' | 'NONE';
//
// /** Exhaustive, precise bidirectional map between the Form Status dropdown's raw numeric values and
//  *  the 4 bucket cards — each card now corresponds to exactly one specific status, not a group of
//  *  statuses. Only 3 of the 7 dropdown values have a card counterpart at all; the other 4 (Not
//  *  Started/In Progress/Returned by MoHUA/Acknowledged by MoHUA) deliberately select no card. */
// const STATUS_TO_BUCKET: Partial<Record<number, PmuBucketKey>> = {
//   [FORM_STATUS.UNDER_REVIEW_BY_PMU]: 'PENDING',
//   [FORM_STATUS.UNDER_REVIEW_BY_MOHUA]: 'APPROVED',
//   [FORM_STATUS.RETURNED_BY_PMU]: 'RETURNED',
// };
//
// const BUCKET_TO_STATUS: Record<PmuBucketKey, number | null> = {
//   ALL: null,
//   PENDING: FORM_STATUS.UNDER_REVIEW_BY_PMU,
//   APPROVED: FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
//   RETURNED: FORM_STATUS.RETURNED_BY_PMU,
//   NONE: null,
// };

@Component({
  selector: 'app-review-state-submissions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReviewWorklistComponent,
    PreLoaderComponent,
  ],
  templateUrl: './review-state-submissions.component.html',
  styleUrl: './review-state-submissions.component.scss',
})
export class ReviewStateSubmissionsComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly stateService = inject(StateService);
  private readonly utilityService = inject(UtilityService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly worklistService = inject(PmuWorklistService);

  readonly formOptions = PMU_FORM_OPTIONS;
  readonly formStatusOptions = PMU_FORM_STATUS_OPTIONS;

  /** Built from the same `PMU_FORM_OPTIONS` the Forms dropdown reads, so a future 6th form updates
   *  this sentence automatically instead of needing a second, hand-synced copy. */
  readonly formNamesList = this.joinWithAnd(PMU_FORM_OPTIONS.map((o) => o.label));

  readonly states = signal<IState[]>([]);
  readonly isPageLoading = signal(true);
  readonly isTableLoading = signal(false);

  private readonly initialFilters = this.resolveInitialFilters();

  readonly filterForm = this.fb.group({
    state: this.fb.control(this.initialFilters.state),
    form: this.fb.nonNullable.control<PmuReviewFormId>(this.initialFilters.form),
    status: this.fb.control<number | null>(this.initialFilters.status),
  });

  private readonly stateQuery = toSignal(this.filterForm.controls.state.valueChanges, { initialValue: '' });
  private readonly selectedForm = toSignal(this.filterForm.controls.form.valueChanges, {
    initialValue: this.filterForm.controls.form.value,
  });
  private readonly selectedStatus = toSignal(this.filterForm.controls.status.valueChanges, {
    initialValue: this.filterForm.controls.status.value,
  });

  /** Exactly one server page — never the whole worklist (a form's cross-state row count can be
   *  large once installment-scoped forms are counted; see `pmu-worklist.util.ts`'s own doc comment
   *  on the backend). Public: bound directly as `<app-review-worklist>`'s `[rows]`. */
  readonly rows = signal<PmuWorklistRow[]>([]);
  private readonly page = signal(1);
  private readonly limit = signal(WORKLIST_DEFAULT_PAGE_SIZE);
  private readonly total = signal(0);
  /** Latest-updated states shown first until the user clicks a different column header themselves. */
  readonly defaultSort: Sort = { active: 'submittedOn', direction: 'desc' };
  private readonly sort = signal<Sort>(this.defaultSort);

  /** Tracks the in-flight worklist request so a filter/sort/page change that arrives before the
   *  previous one resolves can cancel it — otherwise an older response can overwrite newer rows/
   *  pagination/totals. Mirrors `dur.component.ts`'s/`upload-documents.component.ts`'s own
   *  `pollingSub` pattern. */
  private worklistSub: Subscription | null = null;

  /** Drives `<app-review-worklist>`'s server-driven paginator — see its own `serverPage` doc. */
  readonly serverPage = computed<ReviewWorklistServerPage>(() => ({
    pageIndex: this.page() - 1,
    pageSize: this.limit(),
    pageSizeOptions: WORKLIST_PAGE_SIZE_OPTIONS,
    total: this.total(),
  }));

  constructor() {
    this.loadStates();

    // Refetches the worklist whenever Form/State/Status changes — all three are now server-side
    // query params, not a client-side filter over an already-fetched list (the underlying dataset
    // can be large). Deliberately reads `limit`/`sort` through `untracked()`: they're passed as the
    // *current* page size/sort to use, not as something this effect should itself react to — a
    // page-size or sort change is handled by its own dedicated handler below (`onWorklistPageChange`/
    // `onWorklistSortChange`), and letting this effect also track them would make it incorrectly
    // reset back to page 1 every time either one changes instead of just Form/State/Status.
    effect(() => {
      this.selectedForm();
      this.selectedStateId();
      this.selectedStatus();
      this.page.set(1);
      untracked(() => this.loadWorklist(1, this.limit(), this.sort()));
    });
  }

  private loadStates(): void {
    this.stateService
      .getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.states.set(res.data ?? []),
        error: () => this.utilityService.triggerSnackbar('Unable to load the list of states.', 'snackbar-danger'),
      });
  }

  private loadWorklist(page: number, limit: number, sort: Sort): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    // isPageLoading is already true on the very first call (its initial signal value) — only a
    // later, filter/page/sort-changed call needs to flip the in-table spinner on instead.
    if (!this.isPageLoading()) this.isTableLoading.set(true);

    const basePath = pmuFormOption(this.selectedForm()).basePath;
    const sortField = sort.direction ? WORKLIST_SORT_FIELD[sort.active] : undefined;
    this.worklistSub?.unsubscribe();
    this.worklistSub = this.worklistService
      .getWorklist(basePath, yearId, {
        stateId: this.selectedStateId() ?? undefined,
        status: this.selectedStatus() ?? undefined,
        sortBy: sortField,
        sortDir: sortField ? (sort.direction as 'asc' | 'desc') : undefined,
        page,
        limit,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.rows);
          this.page.set(res.page);
          this.limit.set(res.limit);
          this.total.set(res.total);
          this.isPageLoading.set(false);
          this.isTableLoading.set(false);
        },
        error: () => {
          this.isPageLoading.set(false);
          this.isTableLoading.set(false);
          this.utilityService.triggerSnackbar('Unable to load the worklist.', 'snackbar-danger');
        },
      });
  }

  onWorklistPageChange(event: PageEvent): void {
    this.loadWorklist(event.pageIndex + 1, event.pageSize, this.sort());
  }

  onWorklistSortChange(sort: Sort): void {
    this.sort.set(sort);
    this.page.set(1);
    this.loadWorklist(1, this.limit(), sort);
  }

  readonly filteredStates = computed(() => {
    const query = (this.stateQuery() ?? '').trim().toLowerCase();
    if (!query) return this.states();
    return this.states().filter((s) => s.name.toLowerCase().includes(query));
  });

  /** Resolves the autocomplete's free-text query to a selected state, only once it exactly
   *  matches an option (mat-autocomplete always emits the raw text on every keystroke too). */
  private readonly selectedStateId = computed(() => {
    const query = (this.stateQuery() ?? '').trim().toLowerCase();
    return this.states().find((s) => s.name.toLowerCase() === query)?._id ?? null;
  });

  displayState = (stateId: string | IState | null): string => {
    if (!stateId) return '';
    if (typeof stateId === 'object') return stateId.name;
    return this.states().find((s) => s._id === stateId)?.name ?? '';
  };

  onStateSelected(stateId: string): void {
    this.filterForm.controls.state.setValue(this.displayState(stateId), { emitEvent: true });
  }

  readonly isInstallmentScoped = computed(() => pmuFormOption(this.selectedForm()).installmentScoped);

  readonly columns = computed<ReviewWorklistColumn<PmuWorklistRow>[]>(() => {
    const base: ReviewWorklistColumn<PmuWorklistRow>[] = [
      { key: 'stateName', header: 'State', cell: (r) => r.stateName, sortValue: (r) => r.stateName },
    ];
    if (this.isInstallmentScoped()) {
      base.push({ key: 'installment', header: 'Installment', cell: (r) => `Installment ${r.installment}` });
    }
    base.push(
      {
        key: 'submittedOn',
        header: 'Last Updated',
        cell: (r) => this.formatDate(r.updatedAt),
        sortValue: (r) => r.updatedAt ?? '',
      },
      { key: 'daysPending', header: 'Pending Since', cell: (r) => this.daysPendingLabel(r) },
      {
        key: 'status',
        header: 'Status',
        cell: (r) => pmuStatusLabel(r.currentFormStatus),
        badgeClass: (r) => pmuStatusBadgeClass(r.currentFormStatus),
      },
    );
    return base;
  });

  // TODO: Clean up card — see the top-of-file note; restore alongside `STATUS_TO_BUCKET`.
  // readonly buckets: ReviewWorklistBucket<PmuWorklistRow>[] = [
  //   { key: 'ALL', label: 'Total', predicate: () => true },
  //   { key: 'PENDING', label: 'Pending Review', predicate: (r) => pmuStatusBucket(r.currentFormStatus) === 'Pending Review' },
  //   { key: 'APPROVED', label: 'Approved', predicate: (r) => pmuStatusBucket(r.currentFormStatus) === 'Approved' },
  //   { key: 'RETURNED', label: 'Returned', predicate: (r) => pmuStatusBucket(r.currentFormStatus) === 'Returned' },
  // ];

  /** Only a form still awaiting PMU action is actionable ("Review"); Approved/Returned rows are
   *  view-only ("View") — nothing further can be done on them. */
  readonly canActOn = (row: PmuWorklistRow): boolean => row.currentFormStatus === FORM_STATUS.UNDER_REVIEW_BY_PMU;

  /** `NOT_STARTED` is never a real, persisted status (every form service falls back to it only when
   *  no document exists at all) — so a synthesized Not Started row has nothing to open at all. */
  readonly canOpenRow = (row: PmuWorklistRow): boolean => row.currentFormStatus !== FORM_STATUS.NOT_STARTED;

  readonly selectedFormOption = computed(() => pmuFormOption(this.selectedForm()));
  readonly worklistTitle = computed(() => {
    const stateId = this.selectedStateId();
    const stateName = stateId ? this.displayState(stateId) : null;
    return `${this.selectedFormOption().label} — ${stateName || 'All States'}`;
  });

  // TODO: Clean up card — see the top-of-file note; restore alongside `buckets`.
  // /** Purely derived, no independent state — each dropdown value maps to exactly one card (or none),
  //  *  per `STATUS_TO_BUCKET`. `'NONE'` matches no real bucket key, so no card highlights at all. */
  // readonly activeBucketKey = computed(() => {
  //   const status = this.selectedStatus();
  //   if (status === null) return 'ALL';
  //   return STATUS_TO_BUCKET[status] ?? 'NONE';
  // });
  //
  // /** Each card maps to exactly one specific dropdown value — clicking a card simply writes that
  //  *  value into the status control (the dropdown and the cards are two views of one filter). */
  // onBucketSelected(key: string): void {
  //   this.filterForm.controls.status.setValue(BUCKET_TO_STATUS[key as PmuBucketKey] ?? null);
  // }

  onReview(row: PmuWorklistRow): void {
    const formOption = pmuFormOption(this.selectedForm());
    const { state, form, status } = this.filterForm.getRawValue();
    const segments: (string | number)[] = ['..', formOption.routeSegment, row.stateId];
    if (formOption.installmentScoped && row.installment) segments.push(row.installment);
    this.router.navigate(segments, {
      relativeTo: this.route,
      queryParams: { form, state: state || null, status: status ?? null },
    });
  }

  resetFilters(): void {
    this.filterForm.reset({ state: '', form: PMU_FORM_OPTIONS[0].value, status: null });
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  /** Restores the filter the user had set before drilling into a Review — the breadcrumb's "Review
   *  State Submissions" link carries these back as query params (set in `onReview` above), so
   *  returning from a review doesn't reset the list to its defaults (mirrors
   *  ulb-submissions.component.ts's own `resolveInitialFormId()`). No default Form Status — a fresh
   *  visit shows every status until the user explicitly narrows it. */
  private resolveInitialFilters(): { state: string; form: PmuReviewFormId; status: number | null } {
    const params = this.route.snapshot.queryParamMap;
    const form = params.get('form');
    const statusParam = params.get('status');
    const status = PMU_FORM_STATUS_OPTIONS.some((o) => String(o.value) === statusParam) ? Number(statusParam) : null;
    return {
      state: params.get('state') ?? '',
      form: PMU_FORM_OPTIONS.some((o) => o.value === form) ? (form as PmuReviewFormId) : PMU_FORM_OPTIONS[0].value,
      status,
    };
  }

  /** Only meaningful while still pending PMU action — once PMU has acted, there's nothing left
   *  "pending", mirroring the original mockup's own "—" for non-pending rows. `UNDER_REVIEW_BY_PMU`
   *  only ever occurs on a row with a real document, so `updatedAt` is never actually null here —
   *  the check is just a type-safe guard, not a real fallback path. */
  private daysPendingLabel(row: PmuWorklistRow): string {
    if (row.currentFormStatus !== FORM_STATUS.UNDER_REVIEW_BY_PMU || !row.updatedAt) return '—';
    const days = Math.floor((Date.now() - new Date(row.updatedAt).getTime()) / 86400000);
    return days > 0 ? `${days} days` : '—';
  }

  private formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private joinWithAnd(items: string[]): string {
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }
}
