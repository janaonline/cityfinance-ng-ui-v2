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
import { OcrService } from '../../ocr.service';
import { DurGrantType, DurJobStatusResponse } from '../dur-models';

interface DurListRow {
  jobId: string;
  filename: string;
  status: string;
  model: string;
  ulbName: string;
  financialYear: string;
  grantType: string;
  ulbMatch: boolean | null;
  financialYearMatch: boolean | null;
  grantTypeMatch: boolean | null;
  formatValid: boolean | null;
  signaturePresent: boolean | null;
  overallValid: boolean | null;
  errorMessage: string;
  createdAt: string;
}

@Component({
  standalone: true,
  selector: 'app-dur-list',
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
  templateUrl: './dur-list.component.html',
  styleUrl: './dur-list.component.scss',
})
export class DurListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly displayedColumns: string[] = ['file', 'ulbAndYear', 'checks', 'status', 'createdAt', 'action'];

  readonly filterForm = this.fb.nonNullable.group({
    status: [''],
    filename: [''],
    ulbName: [''],
    financialYear: [''],
    grantType: this.fb.nonNullable.control<DurGrantType | ''>(''),
    dateFrom: this.fb.control<Date | null>(null),
    dateTo: this.fb.control<Date | null>(null),
  });

  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly dataSource = new MatTableDataSource<DurListRow>([]);
  readonly loading = signal(false);

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
      status: '',
      filename: '',
      ulbName: '',
      financialYear: '',
      grantType: '',
      dateFrom: null,
      dateTo: null,
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

  matchChipClass(matched: boolean | null): string {
    if (matched === true) return 'chip chip--good';
    if (matched === false) return 'chip chip--bad';
    return 'chip chip--neutral';
  }

  truncate(value: string, max = 24): string {
    if (!value || value === '—' || value.length <= max) return value;
    return `${value.slice(0, 9)}...${value.slice(-9)}`;
  }

  private loadJobs(): void {
    const { status, filename, ulbName, financialYear, grantType, dateFrom, dateTo } = this.filterForm.getRawValue();
    this.loading.set(true);

    this.ocrService
      .listDurValidationJobs({
        status: status || undefined,
        filename: filename.trim() || undefined,
        ulb_name: ulbName.trim() || undefined,
        financial_year: financialYear || undefined,
        grant_type: grantType || undefined,
        sort_order: this.sortOrder(),
        date_from: dateFrom ? this.toStartOfDay(dateFrom) : undefined,
        date_to: dateTo ? this.toEndOfDay(dateTo) : undefined,
        skip: this.pageIndex * this.pageSize,
        limit: this.pageSize,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.dataSource.data = (response.jobs ?? []).map((item) => this.mapRow(item));
          this.totalItems = response.total ?? this.dataSource.data.length;
        },
        error: (err) => {
          this.dataSource.data = [];
          this.totalItems = 0;
          this.utilityService.swalPopup(
            'Failed to load DUR validation jobs',
            err?.error?.detail || err?.error?.message || 'Please try again.',
            'error',
          );
        },
      });
  }

  private mapRow(item: DurJobStatusResponse): DurListRow {
    return {
      jobId: item.job_id || '—',
      filename: item.filename || '—',
      status: item.status || '—',
      model: item.model || '—',
      ulbName: item.expected?.ulb_name || '—',
      financialYear: item.expected?.financial_year || '—',
      grantType: item.expected?.grant_type || '—',
      ulbMatch: item.checks?.ulb_name_match ?? null,
      financialYearMatch: item.checks?.financial_year_match ?? null,
      grantTypeMatch: item.checks?.grant_type_match ?? null,
      formatValid: item.checks?.format_valid ?? null,
      signaturePresent: item.checks?.signature_present ?? null,
      overallValid: item.checks?.overall_valid ?? null,
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
