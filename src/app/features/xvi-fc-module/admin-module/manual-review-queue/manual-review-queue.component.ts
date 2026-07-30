import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { UtilityService } from '../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import {
  ManualReviewRejectDialogComponent,
  ManualReviewRejectDialogData,
} from './dialogs/manual-review-reject-dialog/manual-review-reject-dialog.component';
import { AnnualAccountSectionKey, ManualReviewQueueRow } from './manual-review-queue.models';
import { ManualReviewQueueService } from './manual-review-queue.service';

const ROWS_PAGE_SIZE = 20;

const SECTION_LABEL: Record<AnnualAccountSectionKey, string> = {
  auditedData: 'Audited',
  unauditedData: 'Provisional',
};

@Component({
  selector: 'app-manual-review-queue',
  imports: [ReactiveFormsModule, MaterialModule, MatTableModule, PreLoaderComponent, DatePipe],
  templateUrl: './manual-review-queue.component.html',
  styleUrl: './manual-review-queue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualReviewQueueComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(ManualReviewQueueService);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['serialNo', 'details', 'validationIssues', 'requestedAt', 'actions'];

  readonly rows = signal<ManualReviewQueueRow[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(ROWS_PAGE_SIZE);
  readonly pageSizeOptions = [10, 20, 50];
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  /** Row currently mid-decision (approve or reject in flight) — disables its own buttons only. */
  readonly decidingRowKey = signal<string | null>(null);

  readonly filterForm = this.fb.group({ search: [''] });

  ngOnInit(): void {
    this.loadRows();
    this.filterForm.controls.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.loadRows();
      });
  }

  rowKey(row: ManualReviewQueueRow): string {
    return `${row.annualAccountId}:${row.section}:${row.docId}`;
  }

  isDeciding(row: ManualReviewQueueRow): boolean {
    return this.decidingRowKey() === this.rowKey(row);
  }

  srNo(index: number): number {
    return (this.page() - 1) * this.pageSize() + index + 1;
  }

  sectionLabel(section: AnnualAccountSectionKey): string {
    return SECTION_LABEL[section];
  }

  loadRows(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    const search = this.filterForm.getRawValue().search?.trim() || undefined;

    this.service
      .getQueue({ page: this.page(), pageSize: this.pageSize(), search })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.rows.length === 0 && this.page() > 1) {
            this.page.update((p) => p - 1);
            this.loadRows();
            return;
          }
          this.rows.set(result.rows);
          this.total.set(result.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Unable to load the manual-review queue. Please try again.');
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadRows();
  }

  onApprove(row: ManualReviewQueueRow): void {
    if (this.decidingRowKey()) return;

    this.confirmDialogService
      .confirm({
        title: 'Approve this document?',
        message: `This overrides the failed OCR validation and marks "${row.fileName ?? row.docId}" as passed. This cannot be undone.`,
        confirmText: 'Yes, approve',
        cancelText: 'Cancel',
        confirmButtonColor: 'primary',
        icon: 'bi-check-circle-fill',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.submitApprove(row);
      });
  }

  private submitApprove(row: ManualReviewQueueRow): void {
    const key = this.rowKey(row);
    this.decidingRowKey.set(key);

    this.service
      .decide(row.annualAccountId, row.section, row.docId, { decision: 'APPROVED' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.decidingRowKey.set(null);
          this.removeRow(row);
          this.utilityService.triggerSnackbar('Document approved.', 'snackbar-success');
        },
        error: (err: unknown) => {
          this.decidingRowKey.set(null);
          const message = (err as { error?: { message?: string } })?.error?.message;
          this.utilityService.triggerSnackbar(message ?? 'Unable to approve this document.', 'snackbar-danger');
        },
      });
  }

  onReject(row: ManualReviewQueueRow): void {
    if (this.decidingRowKey()) return;

    const dialogData: ManualReviewRejectDialogData = {
      annualAccountId: row.annualAccountId,
      section: row.section,
      docId: row.docId,
      ulbName: row.ulbName,
      fileName: row.fileName,
    };

    this.dialog
      .open(ManualReviewRejectDialogComponent, { data: dialogData, width: '480px' })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (!succeeded) return;
        this.removeRow(row);
        this.utilityService.triggerSnackbar('Document rejected and returned to the ULB.', 'snackbar-success');
      });
  }

  private removeRow(row: ManualReviewQueueRow): void {
    const key = this.rowKey(row);
    this.rows.update((rows) => rows.filter((r) => this.rowKey(r) !== key));
    this.total.update((t) => Math.max(0, t - 1));
  }
}
