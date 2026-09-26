import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { UtilityService } from '../../../../core/services/utility.service';
import { AfsDigitizationService } from '../afs-digitization.service';
import { DigitizationJobStatusResponse } from '../afs-digitization-models';

interface DigitizationListRow {
  jobId: string;
  filename: string;
  fileSizeLabel: string;
  geminiModel: string;
  status: string;
  progressStep: string;
  errorMessage: string;
  confidenceScore: number | null;
  accuracyScore: number | null;
  pageCount: number | null;
  textractPriceInr: number | null;
  hasExcel: boolean;
  expectedUlbName: string;
  expectedFinancialYear: string;
  expectedDocType: string;
  createdAt: string;
  completedAt: string;
}

@Component({
  standalone: true,
  selector: 'app-afs-digitization-list',
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
  templateUrl: './afs-digitization-list.component.html',
  styleUrl: './afs-digitization-list.component.scss',
})
export class AfsDigitizationListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly digitizationService = inject(AfsDigitizationService);
  private readonly utilityService = inject(UtilityService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly displayedColumns: string[] = [
    'jobAndFile',
    'model',
    'status',
    'scores',
    'cost',
    'expected',
    'dates',
    'action',
  ];

  readonly statusOptions = [
    { value: '', label: 'All' },
    { value: 'queued', label: 'Queued' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  readonly filterForm = this.fb.nonNullable.group({
    status: [''],
    filename: [''],
    ulbName: [''],
    financialYear: [''],
    dateFrom: this.fb.control<Date | null>(null),
    dateTo: this.fb.control<Date | null>(null),
  });

  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly dataSource = new MatTableDataSource<DigitizationListRow>([]);
  readonly loading = signal(false);
  readonly downloadingJobId = signal<string | null>(null);
  readonly downloadingPdfJobId = signal<string | null>(null);
  readonly revalidatingJobId = signal<string | null>(null);

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
    this.filterForm.reset({ status: '', filename: '', ulbName: '', financialYear: '', dateFrom: null, dateTo: null });
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'status-badge--completed';
      case 'failed':
        return 'status-badge--failed';
      case 'processing':
        return 'status-badge--processing';
      default:
        return 'status-badge--queued';
    }
  }

  getScoreClass(score: number | null): string {
    if (score === null) return 'text-secondary';
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  }

  downloadExcel(row: DigitizationListRow): void {
    if (!row.hasExcel) return;
    this.downloadingJobId.set(row.jobId);
    this.digitizationService
      .downloadDigitizationExcel(row.jobId)
      .pipe(finalize(() => this.downloadingJobId.set(null)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${row.filename.replace(/\.pdf$/i, '')}_digitized.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          this.utilityService.swalPopup('Download failed', 'Could not download the Excel file.', 'error');
        },
      });
  }

  downloadPdf(row: DigitizationListRow): void {
    this.downloadingPdfJobId.set(row.jobId);
    this.digitizationService
      .downloadDigitizationPdf(row.jobId)
      .pipe(finalize(() => this.downloadingPdfJobId.set(null)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = row.filename !== '—' ? row.filename : `${row.jobId}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          this.utilityService.swalPopup('Download failed', 'Could not download the source PDF.', 'error');
        },
      });
  }

  revalidateJob(row: DigitizationListRow): void {
    if (this.revalidatingJobId()) return;
    this.revalidatingJobId.set(row.jobId);
    this.digitizationService
      .revalidateDigitizationJob(row.jobId)
      .pipe(finalize(() => this.revalidatingJobId.set(null)))
      .subscribe({
        next: () => {
          this.utilityService.swalPopup(
            'Revalidation queued',
            'Gemini validation is re-running for this job; the Textract extraction is reused unchanged.',
            'success',
          );
          this.loadJobs();
        },
        error: (err) => {
          this.utilityService.swalPopup(
            'Revalidate failed',
            err?.error?.detail || err?.error?.message || 'Please try again.',
            'error',
          );
        },
      });
  }

  private loadJobs(): void {
    const { status, filename, ulbName, financialYear, dateFrom, dateTo } = this.filterForm.getRawValue();
    this.loading.set(true);

    this.digitizationService
      .listDigitizationJobs({
        status: status || undefined,
        filename: filename.trim() || undefined,
        ulb_name: ulbName.trim() || undefined,
        financial_year: financialYear.trim() || undefined,
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

  private mapRow(job: DigitizationJobStatusResponse): DigitizationListRow {
    return {
      jobId: job.job_id || '—',
      filename: job.filename || '—',
      fileSizeLabel: this.formatFileSize(job.file_size_bytes),
      geminiModel: job.gemini_model || '—',
      status: job.status || '—',
      progressStep: job.progress_step || '—',
      errorMessage: job.error_message || '—',
      confidenceScore: job.confidence_score,
      accuracyScore: job.accuracy_score,
      pageCount: job.page_count,
      textractPriceInr: job.textract_price_inr,
      hasExcel: !!job.excel_s3_key,
      expectedUlbName: job.expected?.ulb_name || '—',
      expectedFinancialYear: job.expected?.financial_year || '—',
      expectedDocType: job.expected?.doc_type || '—',
      createdAt: this.formatDate(job.created_at),
      completedAt: this.formatDate(job.completed_at),
    };
  }

  private formatFileSize(bytes: number | null): string {
    return bytes === null ? '—' : `${(bytes / 1024).toFixed(1)} KB`;
  }

  private formatDate(value?: string | null): string {
    if (!value) return '—';
    try {
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
