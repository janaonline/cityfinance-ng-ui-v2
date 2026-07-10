import { SelectionModel } from '@angular/cdk/collections';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import FileSaver from 'file-saver';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import {
  BulkReviewAction,
  FORM_OPTIONS,
  OVERALL_STATUS_OPTIONS,
  ReviewFormId,
  STATUS_OPTIONS,
  UlbSubmissionRow,
  UlbSubmissionSortField,
  UlbSubmissionsQuery,
} from './ulb-submissions.models';
import { UlbSubmissionsService } from './ulb-submissions.service';
import {
  formatOverallStatus,
  getElectedBodyLabel,
  getRowActionLabel,
  getStatusBadgeClass,
  getStatusLabel,
  isRowReviewable,
} from './ulb-submissions.utils';

const BULK_APPROVE_CONFIRM: ConfirmDialogData = {
  title: 'Approve selected ULBs?',
  message: 'The selected ULBs will be marked as approved for this form.',
  confirmText: 'Yes, approve',
  cancelText: 'Cancel',
  confirmButtonColor: 'primary',
  icon: 'bi-check-circle-fill',
};

const PAGE_SIZE = 15;

interface FilterSelectConfig {
  readonly key: 'form' | 'status' | 'overallStatus';
  readonly id: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
}

const FILTER_SELECTS: readonly FilterSelectConfig[] = [
  { key: 'form', id: 'ulb-submissions-form', label: 'Select Form', ariaLabel: 'Select Form', options: FORM_OPTIONS },
  {
    key: 'status',
    id: 'ulb-submissions-status',
    label: 'Form Status',
    ariaLabel: 'Filter by form status',
    options: STATUS_OPTIONS,
  },
  {
    key: 'overallStatus',
    id: 'ulb-submissions-overall-status',
    label: 'Overall Status',
    ariaLabel: 'Filter by overall status',
    options: OVERALL_STATUS_OPTIONS,
  },
];

@Component({
  selector: 'app-ulb-submissions',
  imports: [MaterialModule, MatTableModule, MatSortModule],
  templateUrl: './ulb-submissions.component.html',
  styleUrl: './ulb-submissions.component.scss',
})
export class UlbSubmissionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly ulbSubmissionsService = inject(UlbSubmissionsService);

  readonly filterSelects = FILTER_SELECTS;
  readonly pageSize = signal(PAGE_SIZE);
  readonly pageSizeOptions = [10, 15, 25, 50];

  readonly filterForm = this.fb.nonNullable.group({
    form: this.fb.nonNullable.control<ReviewFormId>(FORM_OPTIONS[0].value),
    search: this.fb.nonNullable.control(''),
    status: this.fb.nonNullable.control<(typeof STATUS_OPTIONS)[number]['value']>('ALL'),
    overallStatus: this.fb.nonNullable.control<(typeof OVERALL_STATUS_OPTIONS)[number]['value']>('ALL'),
  });

  private readonly selectedFormId = toSignal(this.filterForm.controls.form.valueChanges, {
    initialValue: this.filterForm.controls.form.value,
  });
  readonly selectedFormLabel = computed(
    () => FORM_OPTIONS.find((opt) => opt.value === this.selectedFormId())?.label ?? '',
  );

  readonly selection = new SelectionModel<UlbSubmissionRow>(true, []);

  readonly rows = signal<UlbSubmissionRow[]>([]);
  readonly total = signal(0);
  readonly stateName = signal('');
  readonly grantName = signal('');
  readonly totalUlbCount = signal(0);

  readonly isLoading = signal(false);
  readonly isBulkActionPending = signal(false);
  readonly isDownloading = signal(false);

  readonly yearLabel = signal(this.resolveYearLabel());
  readonly isFiltersOpen = signal(false);

  readonly page = signal(1);
  readonly sortField = signal<UlbSubmissionSortField>('ulbName');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  readonly displayedColumns = [
    'select',
    'ulbName',
    'electedBodyStatus',
    'fcUnspentStatus',
    'formStatus',
    'overallStatus',
    'action',
  ];

  readonly reviewableRows = computed(() => this.rows().filter(isRowReviewable));

  readonly getStatusLabel = getStatusLabel;
  readonly getStatusBadgeClass = getStatusBadgeClass;
  readonly getElectedBodyLabel = getElectedBodyLabel;
  readonly getRowActionLabel = getRowActionLabel;
  readonly formatOverallStatus = formatOverallStatus;
  readonly isRowReviewable = isRowReviewable;

  constructor() {
    this.loadRows();

    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.page.set(1);
        this.loadRows();
      });
  }

  toggleFilters(): void {
    this.isFiltersOpen.update((open) => !open);
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
      .confirm(BULK_APPROVE_CONFIRM)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.submitBulkReview('APPROVE');
      });
  }

  returnSelected(): void {
    if (!this.selection.hasValue()) {
      this.utilityService.triggerSnackbar('Select at least one ULB to return.', 'snackbar-danger');
      return;
    }

    const reason = window.prompt('Reason for returning the selected ULBs:');
    if (!reason?.trim()) return;
    this.submitBulkReview('RETURN', reason.trim());
  }

  onRowAction(row: UlbSubmissionRow): void {
    this.utilityService.triggerSnackbar(`Detailed review for ${row.ulbName} is not wired up yet.`, 'snackbar-warn');
  }

  downloadExport(): void {
    this.isDownloading.set(true);

    this.ulbSubmissionsService
      .exportList(this.buildQuery())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          FileSaver.saveAs(blob, `ulb-submissions-${this.filterForm.controls.form.value}.csv`);
          this.isDownloading.set(false);
        },
        error: () => {
          this.isDownloading.set(false);
          this.utilityService.triggerSnackbar('Failed to download. Please try again.', 'snackbar-danger');
        },
      });
  }

  private submitBulkReview(action: BulkReviewAction, reason?: string): void {
    const ulbIds = this.selection.selected.map((row) => row.ulbId);
    this.isBulkActionPending.set(true);

    this.ulbSubmissionsService
      .bulkReview({ ulbIds, form: this.filterForm.controls.form.value, action, reason })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isBulkActionPending.set(false);
          this.selection.clear();
          this.utilityService.triggerSnackbar(action === 'APPROVE' ? 'Selected ULBs approved.' : 'Selected ULBs returned.');
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
          this.stateName.set(res.stateName);
          this.grantName.set(res.grantName);
          this.totalUlbCount.set(res.totalUlbCount);
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
    return {
      form: value.form,
      search: value.search,
      status: value.status,
      overallStatus: value.overallStatus,
      page: this.page(),
      pageSize: this.pageSize(),
      sortField: this.sortField(),
      sortDirection: this.sortDirection(),
    };
  }

  private resolveYearLabel(): string {
    const stored =
      typeof localStorage !== 'undefined' ? localStorage.getItem(XVIFC_LS_KEYS.selectedYearString) : null;
    return stored ? stored.replace(/^FY-/, 'FY ') : 'FY —';
  }
}
