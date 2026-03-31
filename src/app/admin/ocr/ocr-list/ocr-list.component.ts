import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import {
  OcrTaskListItem,
  OcrTaskListResponse,
  OcrService,
} from '../ocr.service';
import { UtilityService } from '../../../core/services/utility.service';
import { MaterialModule } from '../../../material.module';

interface OcrMenuItem {
  title: string;
  description: string;
  route: string;
  buttonLabel: string;
}

interface OcrListRow {
  jobId: string;
  filename: string;
  ocrMethod: string;
  expected: string;
  totalPages: string;
  status: string;
  createdAt: string;
}

@Component({
  standalone: true,
  selector: 'app-ocr-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MaterialModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './ocr-list.component.html',
  styleUrl: './ocr-list.component.scss',
})
export class OcrListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly menuItems: OcrMenuItem[] = [
    {
      title: 'Create New OCR',
      description: 'Upload a PDF and start a new OCR validation flow.',
      route: '/ocr/upload',
      buttonLabel: 'Create New',
    },
    {
      title: 'Get OCR Details',
      description: 'Search an existing OCR result by job ID or file name and OCR method.',
      route: '/ocr/details',
      buttonLabel: 'View Details',
    },
  ];

  readonly displayedColumns: string[] = [
    'jobAndFile',
    'ocrMethod',
    'expected',
    'totalPages',
    'status',
    'createdAt',
    'action',
  ];

  readonly filterForm = this.fb.nonNullable.group({
    jobId: [''],
    filename: [''],
    ocrMethod: [''],
    status: [''],
  });

  readonly dataSource = new MatTableDataSource<OcrListRow>([]);
  readonly loading = signal(false);
  readonly copiedKey = signal<string | null>(null);

  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadTasks();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadTasks();
  }

  resetFilters(): void {
    this.filterForm.reset({
      jobId: '',
      filename: '',
      ocrMethod: '',
      status: '',
    });
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadTasks();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  copyValue(label: string, value: string): void {
    if (!value || value === '-') {
      return;
    }

    navigator.clipboard
      .writeText(value)
      .then(() => {
        const copyKey = `${label}:${value}`;
        this.copiedKey.set(copyKey);
        window.setTimeout(() => {
          if (this.copiedKey() === copyKey) {
            this.copiedKey.set(null);
          }
        }, 1500);
      })
      .catch(() => {
        this.utilityService.swalPopup(
          'Copy failed',
          `Unable to copy ${label.toLowerCase()}. Please try again.`,
          'error',
        );
      });
  }

  isCopied(label: string, value: string): boolean {
    return this.copiedKey() === `${label}:${value}`;
  }

  getCompactFilename(filename: string): string {
    if (!filename || filename === '-' || filename.length <= 24) {
      return filename;
    }

    return `${filename.slice(0, 10)}...${filename.slice(-10)}`;
  }

  private loadTasks(): void {
    const { jobId, filename, ocrMethod, status } = this.filterForm.getRawValue();

    this.loading.set(true);

    this.ocrService
      .getOcrTasks({
        jobId: jobId.trim() || undefined,
        filename: filename.trim() || undefined,
        ocrMethod: ocrMethod || undefined,
        status: status || undefined,
        skip: this.pageIndex * this.pageSize,
        limit: this.pageSize,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const rows = this.extractRows(response).map((item) => this.mapRow(item));
          this.dataSource.data = rows;
          this.totalItems = this.extractTotal(response, rows.length);
        },
        error: (error) => {
          this.dataSource.data = [];
          this.totalItems = 0;
          this.utilityService.swalPopup(
            'Unable to fetch OCR tasks',
            error?.error?.message || error?.error?.detail || 'Please try again.',
            'error',
          );
        },
      });
  }

  private extractRows(response: OcrTaskListResponse | OcrTaskListItem[] | null | undefined): OcrTaskListItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    if (Array.isArray(response?.tasks)) {
      return response.tasks;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    if (Array.isArray(response?.records)) {
      return response.records;
    }

    if (response?.payload) {
      return this.extractRows(response.payload);
    }

    return [];
  }

  private extractTotal(
    response: OcrTaskListResponse | OcrTaskListItem[] | null | undefined,
    fallback: number,
  ): number {
    if (Array.isArray(response)) {
      return response.length;
    }

    if (typeof response?.total === 'number') {
      return response.total;
    }

    if (typeof response?.total_count === 'number') {
      return response.total_count;
    }

    if (typeof response?.count === 'number') {
      return response.count;
    }

    if (response?.payload && !Array.isArray(response.payload)) {
      return this.extractTotal(response.payload, fallback);
    }

    return fallback;
  }

  private mapRow(item: OcrTaskListItem): OcrListRow {
    return {
      jobId: item.job_id || '-',
      filename: item.filename || '-',
      ocrMethod: item.ocr_method || '-',
      expected: this.formatExpected(item.expected),
      totalPages: this.formatCount(item.pdf_quality?.report?.total_pages ?? item.total_pages),
      status: this.normalizeStatus(item.status),
      createdAt: this.formatCreatedAt(item.created_at || item.updated_at),
    };
  }

  private normalizeStatus(status?: string): string {
    if (!status) {
      return '-';
    }

    return status.toLowerCase();
  }

  private formatCreatedAt(value?: string): string {
    if (!value) {
      return '-';
    }

    try {
      return formatDate(value, 'dd/MM/yyyy, hh:mm a', 'en-IN');
    } catch {
      return value;
    }
  }

  private formatExpected(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.formatExpectedValue(item)).join('\n');
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);

      if (entries.length === 0) {
        return '-';
      }

      return entries
        .map(([key, entryValue]) => `${this.formatFieldLabel(key)}: ${this.formatExpectedValue(entryValue)}`)
        .join('\n');
    }

    return '-';
  }

  private formatCount(value?: number): string {
    return typeof value === 'number' ? String(value) : '-';
  }

  private formatExpectedValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.formatExpectedValue(item)).join(', ');
    }

    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>)
        .map(([key, entryValue]) => `${this.formatFieldLabel(key)}: ${this.formatExpectedValue(entryValue)}`)
        .join(', ');
    }

    return '-';
  }

  private formatFieldLabel(value: string): string {
    return value
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
