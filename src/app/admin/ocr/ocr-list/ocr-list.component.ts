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
  financialYear: string;
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
    'jobId',
    'filename',
    'ocrMethod',
    'financialYear',
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
      financialYear: item.financial_year || '-',
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
}
