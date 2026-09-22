import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { environment } from '../../../../../environments/environment';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import {
  ManualReviewDecisionDialogComponent,
  ManualReviewDecisionDialogData,
} from './dialogs/manual-review-decision-dialog/manual-review-decision-dialog.component';
import { ManualReviewFormType, ManualReviewQueueRow } from './manual-review-queue.models';
import { ManualReviewQueueService } from './manual-review-queue.service';

const ROWS_PAGE_SIZE = 20;

const SECTION_LABEL: Record<string, string> = {
  auditedData: 'Audited',
  unauditedData: 'Provisional',
};

const DUR_DOC_LABEL: Record<string, string> = {
  tiedGrant: 'Tied Grant',
  untiedGrant: 'Untied Grant',
};

const FORM_TYPE_LABEL: Record<ManualReviewQueueRow['formType'], string> = {
  ANNUAL_ACCOUNT: 'Annual Account',
  DUR: 'DUR',
};

@Component({
  selector: 'app-manual-review-queue',
  imports: [ReactiveFormsModule, MaterialModule, MatTableModule, PreLoaderComponent, DatePipe, RouterLink],
  templateUrl: './manual-review-queue.component.html',
  styleUrl: './manual-review-queue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualReviewQueueComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(ManualReviewQueueService);
  private readonly utilityService = inject(UtilityService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['serialNo', 'details', 'validationIssues', 'requestedAt', 'sla', 'actions'];

  readonly rows = signal<ManualReviewQueueRow[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(ROWS_PAGE_SIZE);
  readonly pageSizeOptions = [10, 20, 50];
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  /** Non-empty when one backend (Annual Account and/or DUR) failed to load this time — the rows
   *  shown are still whatever the other backend(s) returned successfully, not a full failure. */
  readonly failedSources = signal<ManualReviewFormType[]>([]);

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
    return `${row.formType}:${row.formId}:${row.section ?? ''}:${row.docId}`;
  }

  isDeciding(row: ManualReviewQueueRow): boolean {
    return this.decidingRowKey() === this.rowKey(row);
  }

  srNo(index: number): number {
    return (this.page() - 1) * this.pageSize() + index + 1;
  }

  formLabel(row: ManualReviewQueueRow): string {
    return FORM_TYPE_LABEL[row.formType];
  }

  failedSourcesLabel(): string {
    return this.failedSources()
      .map((f) => FORM_TYPE_LABEL[f])
      .join(' and ');
  }

  docLabel(row: ManualReviewQueueRow): string {
    if (row.formType === 'DUR') return DUR_DOC_LABEL[row.docId] ?? row.docId;
    return row.section ? SECTION_LABEL[row.section] : row.docId;
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
          this.failedSources.set(result.failedSources);
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
    this.openDecisionDialog(row, 'APPROVED');
  }

  onReject(row: ManualReviewQueueRow): void {
    this.openDecisionDialog(row, 'RETURNED');
  }

  private openDecisionDialog(row: ManualReviewQueueRow, decision: 'APPROVED' | 'RETURNED'): void {
    if (this.decidingRowKey()) return;

    const dialogData: ManualReviewDecisionDialogData = {
      formType: row.formType,
      formId: row.formId,
      section: row.section,
      docId: row.docId,
      ulbName: row.ulbName,
      fileName: row.fileName,
      decision,
    };

    this.dialog
      .open(ManualReviewDecisionDialogComponent, { data: dialogData, width: '480px' })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (!succeeded) return;
        this.removeRow(row);
        const message = decision === 'APPROVED' ? 'Document approved.' : 'Document rejected and returned to the ULB.';
        this.utilityService.triggerSnackbar(message, 'snackbar-success');
      });
  }

  private removeRow(row: ManualReviewQueueRow): void {
    const key = this.rowKey(row);
    this.rows.update((rows) => rows.filter((r) => this.rowKey(r) !== key));
    this.total.update((t) => Math.max(0, t - 1));
  }

  /** Direct download link for the OCR job's source file — a plain URL, no auth header needed. */
  ocrDownloadUrl(jobId: string): string {
    return `${environment.api.url3}ocr-validation/jobs/${jobId}/download`;
  }
}
