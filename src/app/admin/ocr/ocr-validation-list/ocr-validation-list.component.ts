import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { finalize } from 'rxjs';
import { saveAs } from 'file-saver';
import { MaterialModule } from '../../../material.module';
import { UtilityService } from '../../../core/services/utility.service';
import { OcrService } from '../ocr.service';
import { OcrValidationJobStatusResponse } from '../ocr-validation/ocr-validation-models';

interface OcrValidationListRow {
  jobId: string;
  batchId: string;
  filename: string;
  extractionModel: string;
  validationModel: string;
  status: string;
  progressStep: string;
  errorMessage: string;
  createdAt: string;
  completedAt: string;
  fileSizeKb: string;
  filePageCount: string;
  fileType: string;
  expectedUlbName: string;
  expectedFinancialYear: string;
  expectedDocType: string;
  expectedTableExists: string;
}


const ERROR_CODE_OPTIONS = [
  { value: '429', label: '429 — Rate Limited' },
  { value: '503', label: '503 — Service Unavailable' },
];

const PROGRESS_STEP_OPTIONS = [
  { value: 'uploading_to_gemini', label: 'Uploading to Gemini' },
  { value: 'extracting_metadata', label: 'Extracting Metadata' },
  { value: 'validating_financials', label: 'Validating Financials' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'extracting_metadata_failed', label: 'Extraction Failed' },
  { value: 'financial_validation_failed', label: 'Financial Validation Failed' },
];

@Component({
  standalone: true,
  selector: 'app-ocr-validation-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MaterialModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './ocr-validation-list.component.html',
  styleUrl: './ocr-validation-list.component.scss',
})
export class OcrValidationListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly displayedColumns: string[] = [
    'jobAndFile',
    'batchId',
    'models',
    'status',
    'expected',
    'dates',
    'action',
  ];

  readonly docTypeOptions = this.ocrService.documentTypes;
  readonly errorCodeOptions = ERROR_CODE_OPTIONS;
  readonly progressStepOptions = PROGRESS_STEP_OPTIONS;
  readonly validationModelOptions = this.ocrService.models.map((m) => m.value);

  readonly filterForm = this.fb.nonNullable.group({
    status: [''],
    batchId: [''],
    jobId: [''],
    filename: [''],
    ulbName: [''],
    docType: [''],
    progressStep: [''],
    validationModel: [''],
    matchStatus: [''],
    dateFrom: this.fb.control<Date | null>(null),
    dateTo: this.fb.control<Date | null>(null),
  });

  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  readonly dataSource = new MatTableDataSource<OcrValidationListRow>([]);
  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly copiedKey = signal<string | null>(null);
  readonly retryingJobId = signal<string | null>(null);

  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadJobs();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadJobs();
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '', batchId: '', jobId: '', filename: '', ulbName: '',
      docType: '', progressStep: '', validationModel: '',
      matchStatus: '', dateFrom: null, dateTo: null,
    });
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadJobs();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadJobs();
  }

  refresh(): void {
    this.loadJobs();
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'desc' ? 'asc' : 'desc');
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadJobs();
  }

  exportToExcel(): void {
    const { status, batchId, jobId, filename, ulbName, docType, progressStep, validationModel,
      matchStatus, dateFrom, dateTo } =
      this.filterForm.getRawValue();

    this.exporting.set(true);

    this.ocrService.dumpOcrValidationJobs({
      batch_id: batchId.trim() || undefined,
      job_id: jobId.trim() || undefined,
      filename: filename.trim() || undefined,
      ulb_name: ulbName.trim() || undefined,
      doc_type: docType || undefined,
      progress_step: progressStep || undefined,
      validation_model: validationModel || undefined,
      ...this.parseStatusField(status),
      ...this.parseMatchFilter(matchStatus),
      date_from: dateFrom ? this.toStartOfDay(dateFrom) : undefined,
      date_to: dateTo ? this.toEndOfDay(dateTo) : undefined,
    })
      .pipe(finalize(() => this.exporting.set(false)))
      .subscribe({
        next: (blob) => {
          const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmmss', 'en-IN', 'Asia/Kolkata');
          saveAs(blob, `ocr_validation_jobs_${timestamp}.xlsx`);
        },
        error: (err) => {
          this.utilityService.swalPopup(
            'Export failed',
            err?.error?.detail || err?.error?.message || 'Please try again.',
            'error',
          );
        },
      });
  }

  copyValue(label: string, value: string): void {
    if (!value || value === '—') return;

    navigator.clipboard
      .writeText(value)
      .then(() => {
        const key = `${label}:${value}`;
        this.copiedKey.set(key);
        window.setTimeout(() => {
          if (this.copiedKey() === key) this.copiedKey.set(null);
        }, 1500);
      })
      .catch(() => {
        this.utilityService.swalPopup('Copy failed', `Unable to copy ${label}.`, 'error');
      });
  }

  isCopied(label: string, value: string): boolean {
    return this.copiedKey() === `${label}:${value}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-badge--completed';
      case 'failed': return 'status-badge--failed';
      case 'processing': return 'status-badge--processing';
      default: return 'status-badge--queued';
    }
  }

  truncate(value: string, max = 22): string {
    if (!value || value === '—' || value.length <= max) return value;
    return `${value.slice(0, 9)}...${value.slice(-9)}`;
  }

  retryJob(row: OcrValidationListRow): void {
    if (this.retryingJobId()) return;
    this.retryingJobId.set(row.jobId);
    this.ocrService.retryOcrValidationJob(row.jobId).subscribe({
      next: () => {
        this.retryingJobId.set(null);
        this.loadJobs();
      },
      error: (err) => {
        this.retryingJobId.set(null);
        this.utilityService.swalPopup(
          'Retry failed',
          err?.error?.detail || err?.error?.message || 'Could not retry job. The original file may not be available.',
          'error',
        );
      },
    });
  }

  private parseStatusField(value: string): { status?: string; error_code?: string } {
    if (!value) return {};
    const [status, errorCode] = value.split(':');
    return { status, ...(errorCode ? { error_code: errorCode } : {}) };
  }

  private parseMatchFilter(value: string): {
    match_status_overall?: boolean;
    match_ulb_name?: boolean;
    match_financial_year?: boolean;
    match_doc_type?: boolean;
  } {
    if (!value) return {};
    const [field, boolStr] = value.split(':');
    const bool = boolStr === 'true';
    switch (field) {
      case 'overall': return { match_status_overall: bool };
      case 'ulb_name': return { match_ulb_name: bool };
      case 'financial_year': return { match_financial_year: bool };
      case 'doc_type': return { match_doc_type: bool };
      default: return {};
    }
  }

  private loadJobs(): void {
    const { status, batchId, jobId, filename, ulbName, docType, progressStep, validationModel,
      matchStatus, dateFrom, dateTo } =
      this.filterForm.getRawValue();
    this.loading.set(true);

    this.ocrService
      .listOcrValidationJobs({
        batch_id: batchId.trim() || undefined,
        job_id: jobId.trim() || undefined,
        filename: filename.trim() || undefined,
        ulb_name: ulbName.trim() || undefined,
        doc_type: docType || undefined,
        progress_step: progressStep || undefined,
        validation_model: validationModel || undefined,
        ...this.parseStatusField(status),
        ...this.parseMatchFilter(matchStatus),
        sort_order: this.sortOrder(),
        date_from: dateFrom ? this.toStartOfDay(dateFrom) : undefined,
        date_to: dateTo ? this.toEndOfDay(dateTo) : undefined,
        skip: this.pageIndex * this.pageSize,
        limit: this.pageSize,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.dataSource.data = (response.jobs ?? []).map((j) => this.mapRow(j));
          this.totalItems = response.total ?? this.dataSource.data.length;
        },
        error: (err) => {
          this.dataSource.data = [];
          this.totalItems = 0;
          this.utilityService.swalPopup(
            'Failed to load jobs',
            err?.error?.detail || err?.error?.message || 'Please try again.',
            'error',
          );
        },
      });
  }

  private mapRow(job: OcrValidationJobStatusResponse): OcrValidationListRow {
    return {
      jobId: job.job_id || '—',
      batchId: job.batch_id || '—',
      filename: job.filename || '—',
      extractionModel: job.extraction_model || '—',
      validationModel: job.validation_model || '—',
      status: job.status || '—',
      progressStep: job.progress_step || '—',
      errorMessage: job.error_message || '—',
      createdAt: this.formatDate(job.created_at),
      completedAt: this.formatDate(job.completed_at),
      fileSizeKb: job.file_info ? `${job.file_info.size_kb.toFixed(1)} KB` : '—',
      filePageCount: job.file_info ? `${job.file_info.page_count}` : '—',
      fileType: job.file_info?.file_type || '—',
      expectedUlbName: job.expected?.ulb_name || '—',
      expectedFinancialYear: job.expected?.financial_year || '—',
      expectedDocType: job.expected?.doc_type || '—',
      expectedTableExists: job.expected?.table_exists != null ? (job.expected.table_exists ? 'Yes' : 'No') : '—',
    };
  }

  private formatDate(value?: string | null): string {
    if (!value) return '—';
    try {
      // Append 'Z' if no timezone info so the string is parsed as UTC, not local time
      const normalized = /[Z+]/.test(value.slice(-6)) ? value : value + 'Z';
      return formatDate(normalized, 'dd/MM/yyyy, hh:mm:ss a', 'en-IN', 'Asia/Kolkata');
    } catch {
      return value;
    }
  }

  private toStartOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  private toEndOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }
}
