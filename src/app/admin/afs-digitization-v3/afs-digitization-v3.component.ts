import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';
import {
  AFS_FILTER_KEY,
  AfsFilterComponent,
  DEFAULT_AUDIT_STATUS,
  DEFAULT_DOC_TYPE,
  DEFAULT_YEAR,
} from '../afs-dashboard/afs-filter/afs-filter.component';
import { environment } from '../../../environments/environment';
import { FilterValues } from '../afs-dashboard/afs.service';
import { AfsDigitizationV3LogDialogComponent } from './afs-digitization-v3-log-dialog.component';
import {
  AfsDigitizationV3Service,
  DigitizationV3Metrics,
  DigitizationV3Query,
  DigitizationV3Row,
  DigitizationV3Status,
} from './afs-digitization-v3.service';

const DOC_TYPE_LABELS: Record<string, string> = {
  bal_sheet: 'Balance Sheet',
  bal_sheet_schedules: 'Balance Sheet Schedules',
  inc_exp: 'Income & Expenditure',
  inc_exp_schedules: 'Income & Expenditure Schedules',
  cash_flow: 'Cash Flow',
  auditor_report: "Auditor's Report",
  unknown: 'Unidentified',
};

interface MetricCard {
  key: keyof DigitizationV3Metrics;
  title: string;
  icon: string;
  class: string;
}

@Component({
  standalone: true,
  selector: 'app-afs-digitization-v3',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    AfsFilterComponent,
  ],
  templateUrl: './afs-digitization-v3.component.html',
  styleUrl: './afs-digitization-v3.component.scss',
})
export class AfsDigitizationV3Component implements OnInit {
  private readonly api = inject(AfsDigitizationV3Service);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayedColumns = ['select', 'state', 'city', 'pdf', 'status', 'contents', 'flags', 'actions'];

  readonly cards: MetricCard[] = [
    { key: 'total', title: 'ULBs', icon: 'bi bi-buildings', class: 'text-info' },
    { key: 'withPdf', title: 'With PDF', icon: 'bi bi-file-earmark-pdf', class: 'text-info' },
    { key: 'digitized', title: 'Digitized', icon: 'bi bi-check-circle', class: 'text-success' },
    { key: 'queued', title: 'Queued', icon: 'bi bi-hourglass-split', class: 'text-warning' },
    { key: 'failed', title: 'Failed', icon: 'bi bi-x-circle', class: 'text-danger' },
    { key: 'consolidated', title: 'Consolidated', icon: 'bi bi-files', class: 'text-primary' },
    { key: 'mismatch', title: 'Mismatch', icon: 'bi bi-exclamation-triangle', class: 'text-danger' },
  ];

  readonly statusOptions: { value: DigitizationV3Status | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'not-digitized', label: 'Not digitized' },
    { value: 'queued', label: 'Queued' },
    { value: 'processing', label: 'Processing' },
    { value: 'digitized', label: 'Digitized' },
    { value: 'failed', label: 'Failed' },
  ];

  // Filters coming from the shared AFS filter sidebar
  filters: FilterValues = {
    docType: DEFAULT_DOC_TYPE,
    yearId: DEFAULT_YEAR,
    auditType: DEFAULT_AUDIT_STATUS,
    populationCategory: '',
    stateId: [],
    ulbId: [],
  };

  // Filters specific to this page
  digitizationV3Status: DigitizationV3Status | '' = '';
  contentFilter: '' | 'consolidated' | 'single' = '';
  mismatchFilter: '' | 'mismatch' | 'match' = '';

  rows = signal<DigitizationV3Row[]>([]);
  metrics = signal<DigitizationV3Metrics | null>(null);
  totalCount = signal(0);
  loading = signal(false);
  queueing = signal(false);
  showSideBar = signal(false);

  pageIndex = 0;
  pageSize = 25;

  /** Selected ULB ids. Kept across pages, cleared when the filters change. */
  readonly selection = new SelectionModel<string>(true, []);

  ngOnInit(): void {
    this.listenForLoads();

    // The filter sidebar re-emits the saved filters on init, which loads the list. Only load here when
    // there is nothing saved, otherwise the list is requested twice.
    let hasSavedFilters = false;
    try {
      hasSavedFilters = !!localStorage.getItem(AFS_FILTER_KEY);
    } catch {
      // storage unavailable: the sidebar cannot restore anything either
    }
    if (!hasSavedFilters) this.reload();
  }

  toggleSideBar(open: boolean = !this.showSideBar()) {
    this.showSideBar.set(open);
  }

  onFiltersChanged(filters: FilterValues): void {
    this.filters = { ...filters };
    this.pageIndex = 0;
    this.selection.clear();
    this.showSideBar.set(false);
    this.reload();
  }

  onPageFilterChanged(): void {
    this.pageIndex = 0;
    this.selection.clear();
    this.reload();
  }

  // ---------------------------------------------------------------------------
  // Row selection
  // ---------------------------------------------------------------------------

  /** Only files that have a PDF and are not already queued, processing or digitized can be queued. */
  isSelectable(row: DigitizationV3Row): boolean {
    const status = row.digitization?.status;
    return !!row.pdfUrl && status !== 'queued' && status !== 'processing' && status !== 'digitized';
  }

  disabledReason(row: DigitizationV3Row): string {
    if (!row.pdfUrl) return 'No PDF uploaded';
    const status = row.digitization?.status;
    return status === 'queued' || status === 'processing' || status === 'digitized' ? `Already ${status}` : '';
  }

  allPageSelected(): boolean {
    const selectable = this.rows().filter((r) => this.isSelectable(r));
    return selectable.length > 0 && selectable.every((r) => this.selection.isSelected(r.ulb));
  }

  somePageSelected(): boolean {
    return this.rows().some((r) => this.selection.isSelected(r.ulb)) && !this.allPageSelected();
  }

  toggleAllOnPage(): void {
    const selectable = this.rows().filter((r) => this.isSelectable(r));
    if (this.allPageSelected()) this.selection.deselect(...selectable.map((r) => r.ulb));
    else this.selection.select(...selectable.map((r) => r.ulb));
  }

  queueSelected(): void {
    const ulbIds = this.selection.selected;
    if (!ulbIds.length || this.queueing()) return;

    this.enqueue({ ...this.buildQuery({ paged: false, pageFilters: false }), ulbId: ulbIds });
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.load$.next();
  }

  /** One list request at a time: a newer request cancels the one still in flight, so old responses never win. */
  private readonly load$ = new Subject<void>();

  private listenForLoads(): void {
    this.load$
      .pipe(
        switchMap(() =>
          this.api.list(this.buildQuery({ paged: true, pageFilters: true })).pipe(
            catchError((err: HttpErrorResponse) => {
              this.loading.set(false);
              this.notify(this.errorMessage(err, 'Could not load the AFS digitization list'));
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.rows.set(res.data);
        this.totalCount.set(res.totalCount);
        this.metrics.set(res.metrics);
        this.loading.set(false);
      });
  }

  queueAllMatching(): void {
    const total = this.totalCount();
    if (!total || this.queueing()) return;

    const confirmed = confirm(
      `Queue all ${total} matching file(s) for AFS digitization?\n\n` +
        'Files with no PDF, or already queued or digitized, are skipped.',
    );
    if (!confirmed) return;

    this.enqueue(this.buildQuery({ paged: false, pageFilters: true }));
  }

  private enqueue(query: DigitizationV3Query): void {
    this.queueing.set(true);
    this.api
      .enqueueByFilter(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.queueing.set(false);
          this.selection.clear();
          const skipped = res.skippedNoPdf + res.skippedAlreadyQueued + res.skippedAlreadyDigitized;
          const failed = res.failedToQueue ? `, ${res.failedToQueue} could not be queued` : '';
          this.notify(`Queued ${res.queued} of ${res.matched}. Skipped ${skipped}${failed}.`);
          this.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.queueing.set(false);
          this.notify(this.errorMessage(err, 'Could not queue files'));
        },
      });
  }

  /** The existing OCR digitization page for the job saved on the file; null until a job exists. */
  jobUrl(row: DigitizationV3Row): string | null {
    const afsDigitizationJobId = row.digitization?.jobId;
    if (!afsDigitizationJobId) return null;
    const base = environment.ui.urlV2.replace(/\/+$/, '');
    return `${base}/ocr/afs-digitization/upload?jobId=${encodeURIComponent(afsDigitizationJobId)}`;
  }

  /** "View log" in the row's three-dot menu: FastAPI's log for the job saved on the file. */
  viewLog(row: DigitizationV3Row): void {
    const afsDigitizationJobId = row.digitization?.jobId;
    if (!afsDigitizationJobId) return;
    this.dialog.open(AfsDigitizationV3LogDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { ulbName: row.ulbName, afsDigitizationJobId },
    });
  }

  docLabel(key: string): string {
    return DOC_TYPE_LABELS[key] ?? key;
  }

  formatBytes(bytes: number | null | undefined): string {
    if (bytes == null) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  pageRange(start: number, end: number): string {
    return start === end ? `p${start}` : `p${start}–${end}`;
  }

  metricValue(key: keyof DigitizationV3Metrics): number | string {
    const m = this.metrics();
    if (!m) return '–';
    // The "Queued" card includes files currently being processed
    return key === 'queued' ? m.queued + m.processing : m[key];
  }

  private buildQuery(opts: { paged: boolean; pageFilters: boolean }): DigitizationV3Query {
    const f = this.filters;
    const query: DigitizationV3Query = {
      yearId: f.yearId,
      docType: f.docType,
      auditType: f.auditType,
    };
    if (f.stateId?.length) query.stateId = f.stateId;
    if (f.ulbId?.length) query.ulbId = f.ulbId;
    if (f.populationCategory) query.populationCategory = f.populationCategory;

    if (opts.pageFilters) {
      if (this.digitizationV3Status) query.digitizationV3Status = this.digitizationV3Status;
      if (this.contentFilter) query.isConsolidated = this.contentFilter === 'consolidated';
      if (this.mismatchFilter) query.isMismatch = this.mismatchFilter === 'mismatch';
    }
    if (opts.paged) {
      query.page = this.pageIndex + 1;
      query.limit = this.pageSize;
    }
    return query;
  }

  private errorMessage(err: HttpErrorResponse, fallback: string): string {
    const message = err.error?.message;
    return Array.isArray(message) ? message.join(', ') : (message ?? fallback);
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 6000 });
  }
}
