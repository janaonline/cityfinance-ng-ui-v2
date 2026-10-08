import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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

  private readonly worklistRows = signal<PmuWorklistRow[]>([]);

  constructor() {
    this.loadStates();

    // Re-fetches the worklist whenever the selected Form changes — State/Status narrow the
    // already-fetched rows client-side (see `filteredRows` below), so neither triggers a re-fetch.
    effect(() => {
      this.selectedForm();
      this.loadWorklist();
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

  private loadWorklist(): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    // isPageLoading is already true on the very first call (its initial signal value) — only a
    // later, form-changed call needs to flip the in-table spinner on instead.
    if (!this.isPageLoading()) this.isTableLoading.set(true);

    const basePath = pmuFormOption(this.selectedForm()).basePath;
    this.worklistService
      .getWorklist(basePath, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          this.worklistRows.set(rows);
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

  /** State + the granular Form Status dropdown both narrow the dataset handed to the worklist —
   *  same composable mechanism for both, mirroring how picking a specific State already works. */
  readonly filteredRows = computed<PmuWorklistRow[]>(() => {
    const stateId = this.selectedStateId();
    const status = this.selectedStatus();
    return this.worklistRows().filter(
      (r) => (!stateId || r.stateId === stateId) && (status === null || r.currentFormStatus === status),
    );
  });

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

  /** Latest-updated states shown first until the user clicks a different column header themselves. */
  readonly defaultSort: Sort = { active: 'submittedOn', direction: 'desc' };

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
