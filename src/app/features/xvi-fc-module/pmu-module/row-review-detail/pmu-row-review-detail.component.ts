import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { ReviewAcknowledgmentComponent } from '../../shared/review-acknowledgment/review-acknowledgment.component';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../shared/breadcrumb/breadcrumb.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { themedDialogConfig } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import {
  PmuBulkRejectRowsDialogComponent,
  PmuBulkRejectRowsDialogData,
} from './dialogs/pmu-bulk-reject-rows-dialog/pmu-bulk-reject-rows-dialog.component';
import {
  findReviewRow,
  hasEligibilityColumn,
  PMU_REVIEW_STATUS_BADGE_CLASS,
  PmuDummyRow,
  PmuReviewFormId,
  PmuReviewStatus,
  pmuFormOption,
  rowLevelFormQuestionsFor,
  rowsFor,
} from '../pmu-review.dummy-data';

/**
 * One generic row-level PMU review detail, serving Elected Body Status / FC Unspent Declaration —
 * read-only form-level fields (same mechanism as the form-level detail) plus a per-ULB row table
 * with bulk select/approve/reject. Only `route.data.form` and the dummy row/question sets differ
 * per form, never this component's own code (Component-reuse architecture, Option C).
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
  ],
  templateUrl: './pmu-row-review-detail.component.html',
  styleUrl: './pmu-row-review-detail.component.scss',
})
export class PmuRowReviewDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly dynamicFormService = inject(DynamicFormService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  /** Must be resolved in this field-initializer injection context — see themedDialogConfig's own doc. */
  private readonly dialogConfig = themedDialogConfig();

  private readonly form = this.route.snapshot.data['form'] as PmuReviewFormId;
  private readonly stateId = this.route.snapshot.paramMap.get('stateId') ?? '';

  readonly formOption = pmuFormOption(this.form);
  readonly stateName = findReviewRow(this.stateId, this.form)?.stateName ?? 'Selected State';
  readonly showEligibility = hasEligibilityColumn(this.form);

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => [
    {
      label: 'Review State Submissions',
      routerLink: ['/xvifc', this.moduleService.yearId(), 'review-state-submissions'],
      queryParams: { ...this.route.snapshot.queryParams, form: this.form },
    },
    { label: this.formOption.label },
  ]);

  readonly fields = signal(rowLevelFormQuestionsFor(this.form));
  readonly formGroup: FormGroup = this.dynamicFormService.toFormGroup(this.fields());

  /** Simulated — this is still the static dummy-data mockup, so there's no real fetch to await yet.
   *  Phase 9.3 replaces this timer with a real HTTP subscribe; the template/signal shape stays the same. */
  readonly isLoading = signal(true);

  readonly rows = signal<PmuDummyRow[]>(rowsFor(this.form));
  readonly selectedRowIds = signal<ReadonlySet<string>>(new Set());

  constructor() {
    setTimeout(() => this.isLoading.set(false), 500);
  }

  readonly searchQuery = signal('');
  readonly page = signal(1);
  readonly limit = 5;

  /** Filters by ULB name/census code — "Select all"/bulk actions below are scoped to this (every
   *  matching row across all pages), while `pagedRows` further slices it for display only. */
  readonly filteredRows = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.rows();
    return this.rows().filter(
      (r) => r.ulbName.toLowerCase().includes(query) || r.censusCode.toLowerCase().includes(query),
    );
  });

  readonly total = computed(() => this.filteredRows().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  readonly startIndex = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.limit + 1));
  readonly endIndex = computed(() => Math.min(this.page() * this.limit, this.total()));
  readonly pagedRows = computed(() =>
    this.filteredRows().slice((this.page() - 1) * this.limit, this.page() * this.limit),
  );

  readonly reviewableRows = computed(() => this.filteredRows().filter((r) => r.status === 'Pending Review'));
  readonly allReviewableSelected = computed(
    () => this.reviewableRows().length > 0 && this.reviewableRows().every((r) => this.selectedRowIds().has(r.rowId)),
  );
  readonly hasSelection = computed(() => this.selectedRowIds().size > 0);

  readonly status = signal<PmuReviewStatus>(findReviewRow(this.stateId, this.form)?.status ?? 'Pending Review');
  readonly rejectionRemarks = signal<string | null>(null);
  readonly statusBadgeClass = computed(() => PMU_REVIEW_STATUS_BADGE_CLASS[this.status()]);
  readonly canApprove = computed(() => this.status() === 'Pending Review');
  readonly canReject = computed(() => this.status() === 'Pending Review');

  rowBadgeClass(row: PmuDummyRow): string {
    return PMU_REVIEW_STATUS_BADGE_CLASS[row.status];
  }

  toggleRow(rowId: string): void {
    const next = new Set(this.selectedRowIds());
    if (next.has(rowId)) next.delete(rowId);
    else next.add(rowId);
    this.selectedRowIds.set(next);
  }

  toggleSelectAll(): void {
    if (this.allReviewableSelected()) {
      this.selectedRowIds.set(new Set());
      return;
    }
    this.selectedRowIds.set(new Set(this.reviewableRows().map((r) => r.rowId)));
  }

  approveSelectedRows(): void {
    this.updateSelectedRows('Approved');
  }

  /** Lists every selected row's census code (selection can span pages) before the reject finalizes. */
  startRejectSelectedRows(): void {
    if (!this.hasSelection()) return;
    const selectedIds = this.selectedRowIds();
    const selectedRows = this.rows().filter((r) => selectedIds.has(r.rowId));

    this.dialog
      .open<PmuBulkRejectRowsDialogComponent, PmuBulkRejectRowsDialogData, string | undefined>(
        PmuBulkRejectRowsDialogComponent,
        { data: { rows: selectedRows }, ...this.dialogConfig },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((remarks) => {
        if (!remarks) return;
        this.updateSelectedRows('Returned');
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

  private updateSelectedRows(newStatus: PmuDummyRow['status']): void {
    const selected = this.selectedRowIds();
    this.rows.update((rows) => rows.map((r) => (selected.has(r.rowId) ? { ...r, status: newStatus } : r)));
    this.selectedRowIds.set(new Set());
  }

  onApprove(): void {
    this.status.set('Approved');
    this.rejectionRemarks.set(null);
  }

  onReject(remarks: string): void {
    this.status.set('Returned');
    this.rejectionRemarks.set(remarks);
  }
}
