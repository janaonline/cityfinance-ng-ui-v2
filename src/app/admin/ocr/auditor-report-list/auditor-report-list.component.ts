import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { UtilityService } from '../../../core/services/utility.service';
import { AuditorReportListItem, OcrService } from '../ocr.service';

interface AuditorReportListRow {
  docId: string;
  filename: string;
  status: string;
  model: string;
  ulbName: string;
  financialYear: string;
  auditorName: string;
  auditorFirm: string;
  opinionType: string;
  isAuditorReport: boolean | null;
  qualifiedCertIssued: boolean | null;
  totalTokens: number | null;
  priceInr: number | null;
  errorMessage: string;
  createdAt: string;
}

const OPINION_TYPE_OPTIONS = [
  { value: 'UNQUALIFIED', label: 'Unqualified' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'ADVERSE', label: 'Adverse' },
  { value: 'DISCLAIMER', label: 'Disclaimer' },
  { value: 'NOT_STATED', label: 'Not Stated' },
];

@Component({
  standalone: true,
  selector: 'app-auditor-report-list',
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
  templateUrl: './auditor-report-list.component.html',
  styleUrl: './auditor-report-list.component.scss',
})
export class AuditorReportListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly displayedColumns: string[] = [
    'file',
    'ulbAndYear',
    'auditor',
    'opinion',
    'usage',
    'status',
    'createdAt',
    'action',
  ];

  readonly opinionTypeOptions = OPINION_TYPE_OPTIONS;

  readonly filterForm = this.fb.nonNullable.group({
    status: [''],
    filename: [''],
    ulbName: [''],
    financialYear: [''],
    opinionType: [''],
    isAuditorReport: [''],
    dateFrom: this.fb.control<Date | null>(null),
    dateTo: this.fb.control<Date | null>(null),
  });

  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly dataSource = new MatTableDataSource<AuditorReportListRow>([]);
  readonly loading = signal(false);

  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadExtractions();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadExtractions();
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      filename: '',
      ulbName: '',
      financialYear: '',
      opinionType: '',
      isAuditorReport: '',
      dateFrom: null,
      dateTo: null,
    });
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadExtractions();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExtractions();
  }

  refresh(): void {
    this.loadExtractions();
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'desc' ? 'asc' : 'desc');
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadExtractions();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-badge--completed';
      case 'FAILED':
        return 'status-badge--failed';
      default:
        return 'status-badge--queued';
    }
  }

  opinionChipClass(opinionType: string): string {
    switch (opinionType) {
      case 'UNQUALIFIED':
        return 'chip chip--good';
      case 'QUALIFIED':
        return 'chip chip--warn';
      case 'ADVERSE':
      case 'DISCLAIMER':
        return 'chip chip--bad';
      default:
        return 'chip chip--neutral';
    }
  }

  truncate(value: string, max = 24): string {
    if (!value || value === '—' || value.length <= max) return value;
    return `${value.slice(0, 9)}...${value.slice(-9)}`;
  }

  private loadExtractions(): void {
    const { status, filename, ulbName, financialYear, opinionType, isAuditorReport, dateFrom, dateTo } =
      this.filterForm.getRawValue();
    this.loading.set(true);

    this.ocrService
      .listAuditorReportExtractions({
        status: (status as 'COMPLETED' | 'FAILED') || undefined,
        filename: filename.trim() || undefined,
        ulb_name: ulbName.trim() || undefined,
        financial_year: financialYear || undefined,
        opinion_type: opinionType || undefined,
        is_auditor_report: isAuditorReport === '' ? undefined : isAuditorReport === 'true',
        sort_order: this.sortOrder(),
        date_from: dateFrom ? this.toStartOfDay(dateFrom) : undefined,
        date_to: dateTo ? this.toEndOfDay(dateTo) : undefined,
        skip: this.pageIndex * this.pageSize,
        limit: this.pageSize,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.dataSource.data = (response.items ?? []).map((item) => this.mapRow(item));
          this.totalItems = response.total ?? this.dataSource.data.length;
        },
        error: (err) => {
          this.dataSource.data = [];
          this.totalItems = 0;
          this.utilityService.swalPopup(
            'Failed to load extractions',
            err?.error?.detail || err?.error?.message || 'Please try again.',
            'error',
          );
        },
      });
  }

  private mapRow(item: AuditorReportListItem): AuditorReportListRow {
    return {
      docId: item.doc_id || '—',
      filename: item.filename || '—',
      status: item.status || '—',
      model: item.model || '—',
      ulbName: item.ulb_name || '—',
      financialYear: item.financial_year || '—',
      auditorName: item.auditor_name || '—',
      auditorFirm: item.auditor_firm || '—',
      opinionType: item.opinion_type || '—',
      isAuditorReport: item.is_auditor_report,
      qualifiedCertIssued: item.qualified_audit_certificate_issued,
      totalTokens: item.total_tokens,
      priceInr: item.price_inr,
      errorMessage: item.error_message || '—',
      createdAt: this.formatDate(item.created_at),
    };
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
