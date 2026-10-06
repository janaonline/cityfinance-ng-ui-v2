import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import {
  ReviewWorklistBucket,
  ReviewWorklistColumn,
  ReviewWorklistComponent,
} from '../../shared/review-worklist/review-worklist.component';
import {
  PMU_DUMMY_STATES,
  PMU_FORM_OPTIONS,
  PMU_REVIEW_DUMMY_ROWS,
  PMU_REVIEW_STATUS_BADGE_CLASS,
  PmuDummyState,
  PmuReviewFormId,
  PmuReviewStatus,
  PmuReviewSubmissionRow,
  pmuFormOption,
} from '../pmu-review.dummy-data';

const STATUS_OPTIONS: ReadonlyArray<{ value: PmuReviewStatus; label: string }> = [
  { value: 'Pending Review', label: 'Pending Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Returned', label: 'Returned' },
];

type PmuBucketKey = 'ALL' | 'PENDING' | 'APPROVED' | 'RETURNED';

/** Bridges the Form Status dropdown's domain (`PmuReviewStatus | null`) and the worklist's bucket
 *  cards' domain (`PmuBucketKey`) — both edit the same underlying filter, kept in sync. */
const STATUS_TO_BUCKET_KEY: Record<'ALL' | PmuReviewStatus, PmuBucketKey> = {
  ALL: 'ALL',
  'Pending Review': 'PENDING',
  Approved: 'APPROVED',
  Returned: 'RETURNED',
};

const BUCKET_KEY_TO_STATUS: Record<PmuBucketKey, PmuReviewStatus | null> = {
  ALL: null,
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  RETURNED: 'Returned',
};

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

  readonly states = PMU_DUMMY_STATES;
  readonly formOptions = PMU_FORM_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  /** Built from the same `PMU_FORM_OPTIONS` the Forms dropdown reads, so a future 6th form updates
   *  this sentence automatically instead of needing a second, hand-synced copy. */
  readonly formNamesList = this.joinWithAnd(PMU_FORM_OPTIONS.map((o) => o.label));

  /** Simulated — this is still the static dummy-data mockup, so there's no real fetch to await yet.
   *  Phase 9.3 replaces this timer with a real HTTP subscribe; the template/signal shape stays the same. */
  readonly isPageLoading = signal(true);
  readonly isTableLoading = signal(false);
  private isFirstFilterRun = true;

  private readonly initialFilters = this.resolveInitialFilters();

  readonly filterForm = this.fb.group({
    state: this.fb.control(this.initialFilters.state),
    form: this.fb.nonNullable.control<PmuReviewFormId>(this.initialFilters.form),
    status: this.fb.control<PmuReviewStatus | null>(this.initialFilters.status),
  });

  private readonly stateQuery = toSignal(this.filterForm.controls.state.valueChanges, { initialValue: '' });
  private readonly selectedForm = toSignal(this.filterForm.controls.form.valueChanges, {
    initialValue: this.filterForm.controls.form.value,
  });
  private readonly selectedStatus = toSignal(this.filterForm.controls.status.valueChanges, { initialValue: null });

  constructor() {
    setTimeout(() => this.isPageLoading.set(false), 500);

    // Simulates a brief reload whenever State/Form/Status changes — skips its first run since
    // isPageLoading already covers the initial paint.
    effect(() => {
      this.stateQuery();
      this.selectedForm();
      this.selectedStatus();
      if (this.isFirstFilterRun) {
        this.isFirstFilterRun = false;
        return;
      }
      this.isTableLoading.set(true);
      setTimeout(() => this.isTableLoading.set(false), 400);
    });
  }

  readonly filteredStates = computed(() => {
    const query = (this.stateQuery() ?? '').trim().toLowerCase();
    if (!query) return this.states;
    return this.states.filter((s) => s.stateName.toLowerCase().includes(query));
  });

  /** Resolves the autocomplete's free-text query to a selected state, only once it exactly
   *  matches an option (mat-autocomplete always emits the raw text on every keystroke too). */
  private readonly selectedStateId = computed(() => {
    const query = (this.stateQuery() ?? '').trim().toLowerCase();
    return this.states.find((s) => s.stateName.toLowerCase() === query)?.stateId ?? null;
  });

  displayState = (stateId: string | PmuDummyState | null): string => {
    if (!stateId) return '';
    if (typeof stateId === 'object') return stateId.stateName;
    return this.states.find((s) => s.stateId === stateId)?.stateName ?? '';
  };

  onStateSelected(stateId: string): void {
    this.filterForm.controls.state.setValue(this.displayState(stateId), { emitEvent: true });
  }

  /** State + Form narrow the dataset handed to the worklist; Status does NOT narrow here — it's
   *  synced with the worklist's own bucket cards (see `activeBucketKey`/`onBucketSelected` below)
   *  and applied entirely inside `ReviewWorklistComponent`, so the bucket counts always reflect
   *  the full state+form-scoped distribution across all statuses, not just the active one. */
  readonly filteredRows = computed<PmuReviewSubmissionRow[]>(() => {
    let rows = PMU_REVIEW_DUMMY_ROWS.filter((r) => r.form === this.selectedForm());
    const stateId = this.selectedStateId();
    if (stateId) rows = rows.filter((r) => r.stateId === stateId);
    return rows;
  });

  readonly columns: ReviewWorklistColumn<PmuReviewSubmissionRow>[] = [
    { key: 'stateName', header: 'State', cell: (r) => r.stateName, sortValue: (r) => r.stateName },
    {
      key: 'submittedOn',
      header: 'Submitted On',
      cell: (r) => this.formatDate(r.submittedOn),
      sortValue: (r) => r.submittedOn,
    },
    { key: 'daysPending', header: 'Pending Since', cell: (r) => (r.daysPending > 0 ? `${r.daysPending} days` : '—') },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => r.status,
      badgeClass: (r) => PMU_REVIEW_STATUS_BADGE_CLASS[r.status],
    },
  ];

  readonly buckets: ReviewWorklistBucket<PmuReviewSubmissionRow>[] = [
    { key: 'ALL', label: 'Total', predicate: () => true },
    { key: 'PENDING', label: 'Pending Review', predicate: (r) => r.status === 'Pending Review' },
    { key: 'APPROVED', label: 'Approved', predicate: (r) => r.status === 'Approved' },
    { key: 'RETURNED', label: 'Returned', predicate: (r) => r.status === 'Returned' },
  ];

  /** Only a form still awaiting PMU action is actionable ("Review"); Approved/Returned rows are
   *  view-only ("View") — nothing further can be done on them. */
  readonly canActOn = (row: PmuReviewSubmissionRow): boolean => row.status === 'Pending Review';

  readonly selectedFormOption = computed(() => pmuFormOption(this.selectedForm()));
  readonly worklistTitle = computed(() => {
    const stateId = this.selectedStateId();
    const stateName = stateId ? this.displayState(stateId) : null;
    return `${this.selectedFormOption().label} — ${stateName || 'All States'}`;
  });

  readonly activeBucketKey = computed(() => STATUS_TO_BUCKET_KEY[this.selectedStatus() ?? 'ALL']);

  onBucketSelected(key: string): void {
    this.filterForm.controls.status.setValue(BUCKET_KEY_TO_STATUS[key as PmuBucketKey] ?? null);
  }

  onReview(row: PmuReviewSubmissionRow): void {
    const routeSegment = pmuFormOption(row.form).routeSegment;
    const { state, form, status } = this.filterForm.getRawValue();
    this.router.navigate(['..', routeSegment, row.stateId], {
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
   *  ulb-submissions.component.ts's own `resolveInitialFormId()`). */
  private resolveInitialFilters(): { state: string; form: PmuReviewFormId; status: PmuReviewStatus | null } {
    const params = this.route.snapshot.queryParamMap;
    const form = params.get('form');
    const status = params.get('status');
    return {
      state: params.get('state') ?? '',
      form: PMU_FORM_OPTIONS.some((o) => o.value === form) ? (form as PmuReviewFormId) : PMU_FORM_OPTIONS[0].value,
      status: STATUS_OPTIONS.some((o) => o.value === status) ? (status as PmuReviewStatus) : null,
    };
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private joinWithAnd(items: string[]): string {
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }
}
