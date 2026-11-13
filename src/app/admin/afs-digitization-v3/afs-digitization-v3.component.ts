import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EMPTY, Subject, catchError, filter, switchMap } from 'rxjs';
import { FileService } from '../../shared/dynamic-form/components/file/file.service';
import {
  AFS_FILTER_KEY,
  AfsFilterComponent,
  DEFAULT_AUDIT_STATUS,
  DEFAULT_DOC_TYPE,
  DEFAULT_YEAR,
} from '../afs-dashboard/afs-filter/afs-filter.component';
import { environment } from '../../../environments/environment';
import { AfsService, FilterValues } from '../afs-dashboard/afs.service';
import { AfsDigitizationV3LogDialogComponent } from './afs-digitization-v3-log-dialog.component';
import { AfsLogModalComponent } from '../afs-dashboard/afs-log-modal/afs-log-modal.component';
import {
  AfsDigitizationV3ResultDialogComponent,
  DigitizationV3ResultDialogData,
} from './afs-digitization-v3-result-dialog.component';
import {
  AfsDigitizationV3Service,
  DigitizationV3Metrics,
  DigitizationV3OverallMetrics,
  DigitizationV3Query,
  DigitizationV3Info,
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

/** How long the presigned S3 upload URL stays valid */
const SIGNED_URL_EXPIRES_IN_SECONDS = 300;

type OverallKey = 'total' | 'digitized' | 'queued' | 'failed';

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
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSortModule,
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
  private readonly fileService = inject(FileService);
  private readonly afsService = inject(AfsService);

  readonly displayedColumns = ['select', 'state', 'city', 'pdf', 'status', 'digitizedAt', 'elapsed', 'contents', 'flags', 'actions'];

  readonly cards: MetricCard[] = [
    { key: 'total', title: 'ULBs', icon: 'bi bi-buildings', class: 'text-info' },
    { key: 'withPdf', title: 'With PDF', icon: 'bi bi-file-earmark-pdf', class: 'text-info' },
    { key: 'digitized', title: 'Digitized', icon: 'bi bi-check-circle', class: 'text-success' },
    { key: 'queued', title: 'Queued', icon: 'bi bi-hourglass-split', class: 'text-warning' },
    { key: 'failed', title: 'Failed', icon: 'bi bi-x-circle', class: 'text-danger' },
    { key: 'consolidated', title: 'Consolidated', icon: 'bi bi-files', class: 'text-primary' },
    { key: 'mismatch', title: 'Mismatch', icon: 'bi bi-exclamation-triangle', class: 'text-danger' },
  ];

  /** Overall cards: every year, audit type and doc type, whatever the filters say */
  readonly overallCards: { key: OverallKey; title: string; icon: string; class: string }[] = [
    { key: 'total', title: 'Total files', icon: 'bi bi-collection', class: 'text-info' },
    { key: 'digitized', title: 'Digitized', icon: 'bi bi-check-circle', class: 'text-success' },
    { key: 'queued', title: 'Queued', icon: 'bi bi-hourglass-split', class: 'text-warning' },
    { key: 'failed', title: 'Failed', icon: 'bi bi-x-circle', class: 'text-danger' },
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
  overall = signal<DigitizationV3OverallMetrics | null>(null);
  totalCount = signal(0);
  loading = signal(false);
  queueing = signal(false);
  showSideBar = signal(false);

  pageIndex = 0;
  pageSize = 25;
  /** The shared sidebar filter: its option lists turn the ids in `filters` into names */
  @ViewChild(AfsFilterComponent) private sidebarFilter?: AfsFilterComponent;

  /** Chips for the filters currently applied, shown above the metrics. `clear` is set for the ones this page owns. */
  activeFilters(): { label: string; value: string; clear?: () => void }[] {
    const f = this.filters;
    const opts = this.sidebarFilter?.filters;
    const chips: { label: string; value: string; clear?: () => void }[] = [];

    const year = opts?.years?.find((y) => y._id === f.yearId)?.year;
    if (f.yearId) chips.push({ label: 'Year', value: year ?? '…' });
    if (f.docType) chips.push({ label: 'Document', value: opts?.documentTypes?.find((d) => d.key === f.docType)?.name ?? this.docLabel(f.docType) });
    if (f.auditType) chips.push({ label: 'Audit', value: opts?.auditTypes?.find((a) => a.key === f.auditType)?.name ?? f.auditType });
    if (f.populationCategory) chips.push({ label: 'Population', value: f.populationCategory });

    if (f.stateId?.length) {
      const names = f.stateId.map((id) => this.sidebarFilter?.states.find((s) => s._id === id)?.name).filter(Boolean) as string[];
      chips.push({ label: 'State', value: f.stateId.length <= 3 && names.length === f.stateId.length ? names.join(', ') : `${f.stateId.length} selected` });
    }
    if (f.ulbId?.length) {
      const names = f.ulbId.map((id) => this.sidebarFilter?.cities.find((c) => c._id === id)?.name).filter(Boolean) as string[];
      chips.push({ label: 'City', value: f.ulbId.length <= 3 && names.length === f.ulbId.length ? names.join(', ') : `${f.ulbId.length} selected` });
    }

    const status = this.digitizationV3Status || f.digitizationStatus;
    if (status) {
      const label = this.statusOptions.find((o) => o.value === status)?.label ?? status;
      chips.push({ label: 'Status', value: label, clear: this.digitizationV3Status ? () => this.clearPageFilter('status') : undefined });
    }
    if (this.contentFilter) {
      chips.push({ label: 'Contents', value: this.contentFilter === 'consolidated' ? 'Consolidated' : 'Single type', clear: () => this.clearPageFilter('content') });
    }
    if (this.mismatchFilter) {
      chips.push({ label: 'Uploaded type', value: this.mismatchFilter === 'mismatch' ? 'Mismatch' : 'Matches', clear: () => this.clearPageFilter('mismatch') });
    }
    if (this.digitizedFrom || this.digitizedTo) {
      const fmt = (d: Date | null) => (d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '…');
      chips.push({ label: 'Digitized', value: `${fmt(this.digitizedFrom)} – ${fmt(this.digitizedTo)}`, clear: () => this.clearDigitizedRange() });
    }
    return chips;
  }

  private clearPageFilter(which: 'status' | 'content' | 'mismatch'): void {
    if (which === 'status') this.digitizationV3Status = '';
    else if (which === 'content') this.contentFilter = '';
    else this.mismatchFilter = '';
    this.onPageFilterChanged();
  }

  /** Digitized date range from the picker; null = no limit on that side */
  digitizedFrom: Date | null = null;
  digitizedTo: Date | null = null;
  readonly today = new Date();

  /** Fires on every start / end pick; the list only reloads once the range is complete (or fully cleared). */
  onDigitizedRangeChange(): void {
    if (this.digitizedFrom && !this.digitizedTo) return;
    this.onPageFilterChanged();
  }

  clearDigitizedRange(): void {
    this.digitizedFrom = null;
    this.digitizedTo = null;
    this.onPageFilterChanged();
  }
  sortBy: 'digitizedAt' | 'pages' | '' = '';
  sortDir: 'asc' | 'desc' | '' = '';

  onSort(sort: Sort): void {
    this.sortBy = sort.direction ? (sort.active as 'digitizedAt' | 'pages') : '';
    this.sortDir = sort.direction;
    this.pageIndex = 0;
    this.reload();
  }

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
    this.loadOverall();
  }

  /** The overall cards do not depend on the filters, but are refreshed with every list load so they track the queue. */
  private loadOverall(): void {
    this.api
      .getOverallMetrics()
      .pipe(
        // The cards are secondary: a failure leaves the last numbers (or dashes) and does not interrupt the page
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((overall) => this.overall.set(overall));
  }

  overallValue(key: OverallKey): number | string {
    const o = this.overall();
    if (!o) return '–';
    // Same as the per-selection cards: "Queued" includes files being processed
    return (key === 'queued' ? o.queued + o.processing : o[key]).toLocaleString('en-IN');
  }

  overallHint(key: OverallKey): string {
    const o = this.overall();
    if (key === 'total' && o?.totalPages != null) return `${o.totalPages.toLocaleString('en-IN')} pages`;
    return '';
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
      `Digitize all ${total} filtered file(s)?\n\n` + 'Files with no PDF, or already queued or digitized, are skipped.',
    );
    if (!confirmed) return;

    this.enqueue(this.buildQuery({ paged: false, pageFilters: true }));
  }

  private enqueue(query: DigitizationV3Query, which: 'ulb' | 'afs' = 'ulb'): void {
    this.queueing.set(true);
    (which === 'afs' ? this.api.enqueueAfs(query) : this.api.enqueueByFilter(query))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.queueing.set(false);
          this.selection.clear();
          this.showResult({ summary: res });
          this.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.queueing.set(false);
          this.showResult({ error: this.errorMessage(err, 'Could not queue files') });
        },
      });
  }

  /** A modal, not a toast: it stays until the user closes it (no backdrop or Escape dismissal). */
  private showResult(data: DigitizationV3ResultDialogData): void {
    this.dialog.open(AfsDigitizationV3ResultDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      disableClose: true,
      data,
    });
  }

  // ---------------------------------------------------------------------------
  // AFS PDF upload (same flow as the AFS dashboard: presigned S3 PUT, then save on afs_xl_files)
  // ---------------------------------------------------------------------------

  /** ULB ids with an upload in flight */
  readonly uploading = signal<ReadonlySet<string>>(new Set());

  isUploading(row: DigitizationV3Row): boolean {
    return this.uploading().has(row.ulb);
  }

  private setUploading(ulb: string, on: boolean): void {
    this.uploading.update((current) => {
      const next = new Set(current);
      if (on) next.add(ulb);
      else next.delete(ulb);
      return next;
    });
  }

  @ViewChild('afsFileInput') private afsFileInput?: ElementRef<HTMLInputElement>;
  /** The row whose menu opened the file picker */
  private uploadTarget: DigitizationV3Row | null = null;

  /** "Upload AFS PDF" in the row menu */
  pickAfsPdf(row: DigitizationV3Row): void {
    this.uploadTarget = row;
    this.afsFileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const row = this.uploadTarget;
    // Reset so picking the same file again still fires `change`
    input.value = '';
    this.uploadTarget = null;
    if (!file || !row) return;

    if (file.type !== 'application/pdf') {
      this.notify('Please upload a valid PDF file.');
      return;
    }
    if (this.isUploading(row)) return;

    const folder = `afs/uploads/${row.ulbCode}/${this.filters.docType}`;
    this.setUploading(row.ulb, true);

    this.fileService
      .getSignedUrls([
        { fileName: file.name, folder, mimeType: file.type, fileSize: file.size, expiresIn: SIGNED_URL_EXPIRES_IN_SECONDS },
      ])
      .pipe(
        switchMap(([signed]) => {
          const { url, path } = signed ?? {};
          if (!url || !path) throw new Error('No upload URL was returned');
          return this.fileService.newUploadFileToS3(file, url).pipe(
            filter((event) => event.type === HttpEventType.Response),
            switchMap(() =>
              this.afsService.uploadAfsFile({
                pdfUrl: path,
                ulb: row.ulb,
                year: this.filters.yearId,
                auditType: this.filters.auditType,
                docType: this.filters.docType,
                uploadedBy: 'AFS',
              }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.setUploading(row.ulb, false);
          this.notify(`Uploaded ${file.name} for ${row.ulbName}`);
          // The list carries the signed link and page count of the new PDF
          this.reload();
        },
        error: (err: HttpErrorResponse | Error) => {
          this.setUploading(row.ulb, false);
          this.notify(err instanceof HttpErrorResponse ? this.errorMessage(err, 'Could not upload the PDF') : err.message);
        },
      });
  }

  /** The AFS upload can be digitized unless it is already queued, processing or digitized */
  canDigitizeAfs(row: DigitizationV3Row): boolean {
    if (!row.afsPdfUrl) return false;
    const status = row.afsDigitization?.status;
    return status !== 'queued' && status !== 'processing' && status !== 'digitized';
  }

  /** "Digitize" in the AFS half's menu: queues the uploaded PDF of this row only */
  digitizeAfs(row: DigitizationV3Row): void {
    if (!this.canDigitizeAfs(row) || this.queueing()) return;
    this.enqueue({ ...this.buildQuery({ paged: false, pageFilters: false }), ulbId: [row.ulb] }, 'afs');
  }

  /** The digitization info of one half of the row: the ULB's PDF, or the uploaded AFS PDF */
  private infoOf(row: DigitizationV3Row, which: 'ulb' | 'afs'): DigitizationV3Info | null | undefined {
    return which === 'afs' ? row.afsDigitization : row.digitization;
  }

  /** The existing OCR digitization page for the job saved on the file; null until a job exists. */
  jobUrl(row: DigitizationV3Row, which: 'ulb' | 'afs' = 'ulb'): string | null {
    const afsDigitizationJobId = this.infoOf(row, which)?.jobId;
    if (!afsDigitizationJobId) return null;
    const base = environment.ui.urlV2.replace(/\/+$/, '');
    return `${base}/ocr/afs-digitization/upload?jobId=${encodeURIComponent(afsDigitizationJobId)}`;
  }

  /** "View log" in the row's three-dot menu: FastAPI's log for the job saved on the file. */
  viewLog(row: DigitizationV3Row, which: 'ulb' | 'afs' = 'ulb'): void {
    const info = this.infoOf(row, which);
    const afsDigitizationJobId = info?.jobId;
    if (!info || !afsDigitizationJobId) return;
    // Old-flow jobs have no FastAPI job: their id is the old request id, so use the afs-dashboard request log
    if (info.isLegacy) {
      this.dialog.open(AfsLogModalComponent, { data: { requestId: afsDigitizationJobId }, panelClass: 'col-8' });
      return;
    }
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

  /** 850 → "850 ms", 12_300 → "12.3 s", 125_000 → "2m 5s", 3_900_000 → "1h 5m" */
  formatElapsed(ms: number | null | undefined): string {
    if (ms == null || ms < 0) return '–';
    if (ms < 1000) return `${Math.round(ms)} ms`;
    const totalSec = ms / 1000;
    if (totalSec < 60) return `${totalSec.toFixed(1)} s`;
    const totalMin = Math.floor(totalSec / 60);
    if (totalMin < 60) return `${totalMin}m ${Math.round(totalSec % 60)}s`;
    return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
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
      // The shared sidebar's "Digitization Status" (same values as v3 minus 'processing') applies unless the page's own Status is set
      const sidebarStatus = f.digitizationStatus as DigitizationV3Status | '' | undefined;
      const status = this.digitizationV3Status || sidebarStatus;
      if (status) query.digitizationV3Status = status;
      if (this.contentFilter) query.isConsolidated = this.contentFilter === 'consolidated';
      if (this.mismatchFilter) query.isMismatch = this.mismatchFilter === 'mismatch';
    }
    if (opts.pageFilters) {
      // Whole local days: from 00:00:00.000 of the first day to 23:59:59.999 of the last
      if (this.digitizedFrom) {
        const from = new Date(this.digitizedFrom);
        from.setHours(0, 0, 0, 0);
        query.digitizedFrom = from.toISOString();
      }
      if (this.digitizedTo) {
        const to = new Date(this.digitizedTo);
        to.setHours(23, 59, 59, 999);
        query.digitizedTo = to.toISOString();
      }
    }
    if (opts.pageFilters && this.sortBy && this.sortDir) {
      query.sortColumn = this.sortBy;
      query.sortDirection = this.sortDir;
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
