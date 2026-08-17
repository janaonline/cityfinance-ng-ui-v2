import { SelectionModel } from '@angular/cdk/collections';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MaterialModule } from '../../../../material.module';
import {
  ConfirmDialogData,
  themedDialogConfig,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import {
  BulkReviewAction,
  FORM_OPTIONS,
  FORM_TO_TAB,
  ReviewFormId,
  ReviewStatus,
  SLB_UNAVAILABLE_BUCKET_KEYS,
  STATUS_BUCKETS,
  UlbSubmissionRow,
  UlbSubmissionSortField,
  UlbSubmissionsQuery,
} from './ulb-submissions.models';
import { UlbSubmissionsService } from './ulb-submissions.service';
import { daysPending, getRowActionLabel, getStatusBadgeClass, getStatusLabel, isRowReviewable } from './ulb-submissions.utils';

const EMPTY_COUNTS: Record<ReviewStatus, number> = {
  NOT_STARTED: 0,
  IN_PROGRESS: 0,
  UNDER_REVIEW_BY_STATE: 0,
  RETURNED_BY_STATE: 0,
  UNDER_REVIEW_BY_MOHUA: 0,
  RETURNED_BY_MOHUA: 0,
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 0,
  APPROVED_BY_STATE: 0,
  AWAITING_CLAIM_LETTER: 0,
};

const BULK_APPROVE_CONFIRM: ConfirmDialogData = {
  title: 'Approve selected ULBs?',
  message: 'The selected ULBs will be marked as approved for this form.',
  confirmText: 'Yes, approve',
  cancelText: 'Cancel',
  confirmButtonColor: 'primary',
  icon: 'bi-check-circle-fill',
};

const PAGE_SIZE = 15;

/** Slides the table left/right when the selected stat-card bucket changes, direction matching card order. */
const BUCKET_SLIDE = trigger('bucketSlide', [
  transition(':increment', [
    style({ transform: 'translateX(40px)', opacity: 0 }),
    animate('420ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
  transition(':decrement', [
    style({ transform: 'translateX(-40px)', opacity: 0 }),
    animate('420ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);

interface FilterSelectConfig {
  readonly key: 'form';
  readonly id: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly options: ReadonlyArray<{ readonly value: string; readonly label: string; readonly live?: boolean }>;
}

const FILTER_SELECTS: readonly FilterSelectConfig[] = [
  { key: 'form', id: 'ulb-submissions-form', label: 'Select Form', ariaLabel: 'Select Form', options: FORM_OPTIONS },
];

@Component({
  selector: 'app-ulb-submissions',
  imports: [MaterialModule, MatTableModule, MatSortModule],
  templateUrl: './ulb-submissions.component.html',
  styleUrl: './ulb-submissions.component.scss',
  animations: [BUCKET_SLIDE],
})
export class UlbSubmissionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly ulbSubmissionsService = inject(UlbSubmissionsService);
  /** Applies the feature's current theme to all confirm dialogs opened by this component. */
  private readonly dialogConfig = themedDialogConfig();
  private readonly http = inject(HttpClient);

  readonly filterSelects = FILTER_SELECTS;
  readonly pageSize = signal(PAGE_SIZE);
  readonly pageSizeOptions = [10, 15, 25, 50];

  readonly filterForm = this.fb.nonNullable.group({
    form: this.fb.nonNullable.control<ReviewFormId>(FORM_OPTIONS[0].value),
    search: this.fb.nonNullable.control(''),
  });

  private readonly selectedFormId = toSignal(this.filterForm.controls.form.valueChanges, {
    initialValue: this.filterForm.controls.form.value,
  });
  readonly selectedFormLabel = computed(
    () => FORM_OPTIONS.find((opt) => opt.value === this.selectedFormId())?.label ?? '',
  );
  readonly isSelectedFormLive = computed(
    () => FORM_OPTIONS.find((opt) => opt.value === this.selectedFormId())?.live ?? false,
  );
  /** SLB is deemed approved on submission — no approve/return workflow, so bulk actions and
   *  row-selection checkboxes don't apply to it, unlike the other three live forms. */
  readonly isBulkReviewable = computed(() => this.selectedFormId() !== 'SERVICE_LEVEL_BENCHMARKS');
  private readonly isSlbSelected = computed(() => this.selectedFormId() === 'SERVICE_LEVEL_BENCHMARKS');

  readonly selection = new SelectionModel<UlbSubmissionRow>(true, []);

  readonly rows = signal<UlbSubmissionRow[]>([]);
  readonly total = signal(0);
  readonly stateName = signal(this.resolveStateName());
  readonly counts = signal<Record<ReviewStatus, number>>(EMPTY_COUNTS);

  readonly isLoading = signal(false);
  readonly isBulkActionPending = signal(false);

  readonly yearLabel = signal(this.resolveYearLabel());

  readonly page = signal(1);
  readonly sortField = signal<UlbSubmissionSortField>('ulbName');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  /** Key of the currently selected stat-card bucket, or null when no bucket filter is applied. */
  readonly selectedBucketKey = signal<string>('UNDER_STATE_REVIEW');

  /** Position of the selected bucket among the stat cards — drives the slide direction. */
  readonly selectedBucketIndex = computed(() =>
    STATUS_BUCKETS.findIndex((bucket) => bucket.key === this.selectedBucketKey()),
  );

  readonly grandTotal = computed(() => Object.values(this.counts()).reduce((sum, n) => sum + n, 0));

  readonly statCards = computed(() => {
    const counts = this.counts();
    const grandTotal = this.grandTotal();
    return STATUS_BUCKETS.map((bucket) => {
      const count = bucket.statuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
      return { ...bucket, count, percent: grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0 };
    });
  });

  /** NOT_STARTED and IN_PROGRESS ULBs have nothing for the state to review yet — no pending duration, no action, no bulk approve. */
  readonly hasNothingToReviewYet = computed(() =>
    ['NOT_STARTED', 'IN_PROGRESS'].includes(this.selectedBucketKey()),
  );

  readonly displayedColumns = computed(() => {
    const base = this.hasNothingToReviewYet()
      ? ['select', 'ulbName', 'censusCode', 'formStatus']
      : ['select', 'ulbName', 'censusCode', 'daysPending', 'formStatus', 'action'];
    return this.isBulkReviewable() ? base : base.filter((column) => column !== 'select');
  });

  readonly reviewableRows = computed(() => this.rows().filter(isRowReviewable));

  readonly getStatusLabel = getStatusLabel;
  readonly getStatusBadgeClass = getStatusBadgeClass;
  readonly getRowActionLabel = getRowActionLabel;
  readonly isRowReviewable = isRowReviewable;
  readonly daysPending = daysPending;

  constructor() {
    if (this.isSelectedFormLive()) this.loadRows();

    // The FY label cached in localStorage can be stale/empty (e.g. this session never went
    // through years-selection) — resolve it authoritatively from the route's yearId instead.
    const designYearId = this.resolveDesignYearId();
    if (designYearId) {
      this.http
        .get<unknown>(`${environment.api.url2}xvi-fc/years`)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            const r = response as { data?: Array<{ _id: string; year: string }> };
            const items = Array.isArray(response) ? response : (r?.data ?? []);
            const match = (items as Array<{ _id: string; year: string }>).find((y) => y._id === designYearId);
            if (match) this.yearLabel.set(`FY ${match.year}`);
          },
          error: () => undefined,
        });
    }

    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.page.set(1);
        this.selection.clear();
        if (this.isSelectedFormLive()) this.loadRows();
        else this.rows.set([]);
      });

    // Switching to SLB can leave the currently-selected bucket (e.g. the default "Under Review
    // by State") pointing at one of the three buckets SLB doesn't have — fall back to a bucket
    // that's always valid, synchronously (not debounced like the reload above) so the stat cards
    // never show a disabled bucket as still "active" even briefly.
    effect(() => {
      if (this.isBucketDisabled(this.selectedBucketKey())) this.selectedBucketKey.set('NOT_STARTED');
    });
  }

  /** Exactly one bucket is always selected — there's no "show all statuses" state. */
  selectBucket(key: string): void {
    if (this.selectedBucketKey() === key || this.isBucketDisabled(key)) return;
    this.selectedBucketKey.set(key);
    this.page.set(1);
    this.selection.clear();
    if (this.isSelectedFormLive()) this.loadRows();
  }

  /** SLB has no STATE approve/return workflow — the review/returned/MoHUA buckets never apply. */
  isBucketDisabled(key: string): boolean {
    return this.isSlbSelected() && SLB_UNAVAILABLE_BUCKET_KEYS.has(key);
  }

  isAllSelected(): boolean {
    return this.selection.hasValue() && this.selection.selected.length === this.reviewableRows().length;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.reviewableRows().forEach((row) => this.selection.select(row));
  }

  onSortChange(sort: Sort): void {
    this.sortField.set((sort.direction ? sort.active : 'ulbName') as UlbSubmissionSortField);
    this.sortDirection.set(sort.direction || 'asc');
    this.page.set(1);
    this.loadRows();
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadRows();
  }

  approveSelected(): void {
    if (!this.selection.hasValue()) {
      this.utilityService.triggerSnackbar('Select at least one ULB to approve.', 'snackbar-danger');
      return;
    }

    this.confirmDialogService
      .confirm(BULK_APPROVE_CONFIRM, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.submitBulkReview('APPROVE');
      });
  }

  onRowAction(row: UlbSubmissionRow): void {
    if (!row.recordId) return;
    const section = FORM_TO_TAB[this.filterForm.controls.form.value];
    this.router.navigate([row.ulbId, 'review'], {
      relativeTo: this.route,
      queryParams: section ? { section } : {},
    });
  }

  private submitBulkReview(action: BulkReviewAction, reason?: string): void {
    const recordIds = this.selection.selected
      .map((row) => row.recordId)
      .filter((id): id is string => !!id);
    this.isBulkActionPending.set(true);

    this.ulbSubmissionsService
      .bulkReview({ recordIds, form: this.filterForm.controls.form.value, action, reason })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isBulkActionPending.set(false);
          this.selection.clear();
          const verb = action === 'APPROVE' ? 'approved' : 'returned';
          this.utilityService.triggerSnackbar(
            res.failed > 0 ? `${res.succeeded} ${verb}, ${res.failed} failed.` : `${res.succeeded} ULB(s) ${verb}.`,
            res.failed > 0 ? 'snackbar-warn' : undefined,
          );
          this.loadRows();
        },
        error: () => {
          this.isBulkActionPending.set(false);
          this.utilityService.triggerSnackbar('Something went wrong. Please try again.', 'snackbar-danger');
        },
      });
  }

  private loadRows(): void {
    this.isLoading.set(true);

    this.ulbSubmissionsService
      .list(this.buildQuery())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set([...res.rows]);
          this.total.set(res.total);
          this.counts.set(res.counts);
          this.selection.clear();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.utilityService.triggerSnackbar('Unable to load ULB submissions.', 'snackbar-danger');
        },
      });
  }

  private buildQuery(): UlbSubmissionsQuery {
    const value = this.filterForm.getRawValue();
    const bucket = STATUS_BUCKETS.find((b) => b.key === this.selectedBucketKey());
    return {
      designYearId: this.resolveDesignYearId(),
      form: value.form,
      search: value.search,
      status: bucket?.statuses ?? null,
      page: this.page(),
      pageSize: this.pageSize(),
      sortField: this.sortField(),
      sortDirection: this.sortDirection(),
    };
  }

  // The design year lives on the route as :yearId (see xvi-fc-module.routes.ts), a few levels
  // up from this component's own route — not in this component's own paramMap directly.
  private resolveDesignYearId(): string {
    let snapshot: ActivatedRouteSnapshot | null = this.route.snapshot;
    while (snapshot) {
      const value = snapshot.paramMap.get('yearId')?.trim();
      if (value) return value;
      snapshot = snapshot.parent;
    }
    return (typeof localStorage !== 'undefined' ? localStorage.getItem(XVIFC_LS_KEYS.selectedYearId) : null) ?? '';
  }

  private resolveYearLabel(): string {
    const stored =
      typeof localStorage !== 'undefined' ? localStorage.getItem(XVIFC_LS_KEYS.selectedYearString) : null;
    return stored ? stored.replace(/^FY-/, 'FY ') : 'FY —';
  }

  private resolveStateName(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      if (!raw) return '';
      return (JSON.parse(raw) as { stateName?: string }).stateName ?? '';
    } catch {
      return '';
    }
  }
}
