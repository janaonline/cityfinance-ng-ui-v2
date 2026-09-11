import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { saveAs } from 'file-saver';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { environment } from '../../../../../environments/environment';
import { StateService } from '../../../../core/services/state/state.service';
import { IState } from '../../../../core/models/state/state';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { AnnualAccountSectionKey } from '../manual-review-queue/manual-review-queue.models';
import { ManualReviewHistoryRow, ManualReviewRequestStatus } from './manual-review-history.models';
import { ManualReviewHistoryService } from './manual-review-history.service';

const ROWS_PAGE_SIZE = 20;

const SECTION_LABEL: Record<AnnualAccountSectionKey, string> = {
  auditedData: 'Audited',
  unauditedData: 'Provisional',
};

const STATUS_LABEL: Record<ManualReviewRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  RETURNED: 'Returned',
};

/** Soft rounded-pill treatment per decision, matching the reference "Decision" chip style. */
const STATUS_PILL_CLASS: Record<ManualReviewRequestStatus, string> = {
  PENDING: 'badge rounded-pill bg-secondary-subtle text-secondary-emphasis',
  APPROVED: 'badge rounded-pill bg-success-subtle text-success-emphasis',
  RETURNED: 'badge rounded-pill bg-danger-subtle text-danger-emphasis',
};

const MS_PER_HOUR = 60 * 60 * 1000;

export interface ResponseInfo {
  label: string;
  overSla: boolean;
}

@Component({
  selector: 'app-manual-review-history',
  imports: [ReactiveFormsModule, MaterialModule, MatTableModule, PreLoaderComponent, DatePipe, RouterLink],
  templateUrl: './manual-review-history.component.html',
  styleUrl: './manual-review-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualReviewHistoryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(ManualReviewHistoryService);
  private readonly stateService = inject(StateService);
  private readonly utilityService = inject(UtilityService);

  readonly displayedColumns = ['ulbDocument', 'requestedAt', 'decision', 'message', 'reviewedBy', 'response', 'actions'];

  readonly rows = signal<ManualReviewHistoryRow[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(ROWS_PAGE_SIZE);
  readonly pageSizeOptions = [10, 20, 50];
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly states = signal<IState[]>([]);
  readonly isExporting = signal(false);

  /** Bumped on every loadRows() call so a late-arriving stale response can be told apart from the latest one. */
  private requestId = 0;

  readonly statusOptions: Array<{ value: ManualReviewRequestStatus; label: string }> = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'RETURNED', label: 'Returned' },
  ];

  readonly filterForm = this.fb.group({
    search: [''],
    status: [''],
    stateId: [''],
    requestedFrom: [''],
    requestedTo: [''],
    breachedOnly: [false],
  });

  ngOnInit(): void {
    this.loadRows();
    this.stateService.getStates().subscribe((response) => this.states.set(response.data ?? []));

    this.filterForm.controls.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());

    ['status', 'stateId', 'requestedFrom', 'requestedTo', 'breachedOnly'].forEach((controlName) => {
      this.filterForm.get(controlName)?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilters());
    });
  }

  private applyFilters(): void {
    this.page.set(1);
    this.loadRows();
  }

  sectionLabel(section: AnnualAccountSectionKey): string {
    return SECTION_LABEL[section];
  }

  statusLabel(status: ManualReviewRequestStatus): string {
    return STATUS_LABEL[status];
  }

  statusPillClass(status: ManualReviewRequestStatus): string {
    return STATUS_PILL_CLASS[status];
  }

  /**
   * Turnaround-time readout for the Response column: elapsed time since the request while it's
   * still within SLA (muted, informational), or how far past the 48h due date once it's blown —
   * measured against `decidedAt` once decided, `now` while still PENDING.
   */
  responseInfo(row: ManualReviewHistoryRow): ResponseInfo {
    const requestedAt = new Date(row.requestedAt).getTime();
    const dueAt = new Date(row.dueAt).getTime();
    const endAt = row.decidedAt ? new Date(row.decidedAt).getTime() : Date.now();

    if (endAt <= dueAt) {
      const hrs = Math.max(0, Math.round((endAt - requestedAt) / MS_PER_HOUR));
      return { label: `${hrs} hrs`, overSla: false };
    }

    const overHrs = Math.round((endAt - dueAt) / MS_PER_HOUR);
    return { label: `${overHrs} hrs over SLA`, overSla: true };
  }

  private currentFilters() {
    const raw = this.filterForm.getRawValue();
    return {
      search: raw.search?.trim() || undefined,
      status: (raw.status as ManualReviewRequestStatus) || undefined,
      stateId: raw.stateId || undefined,
      requestedFrom: raw.requestedFrom || undefined,
      requestedTo: raw.requestedTo || undefined,
      breachedOnly: raw.breachedOnly || undefined,
    };
  }

  loadRows(): void {
    const requestId = ++this.requestId;
    this.isLoading.set(true);
    this.loadError.set(null);

    this.service
      .getHistory({ page: this.page(), pageSize: this.pageSize(), ...this.currentFilters() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (requestId !== this.requestId) return;
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
          if (requestId !== this.requestId) return;
          this.isLoading.set(false);
          this.loadError.set('Unable to load the manual-review history. Please try again.');
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadRows();
  }

  /** Excel dump of every row matching the current filters, ignoring pagination. */
  exportToExcel(): void {
    if (this.isExporting()) return;
    this.isExporting.set(true);

    this.service
      .downloadDump(this.currentFilters())
      .pipe(finalize(() => this.isExporting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmmss', 'en-IN', 'Asia/Kolkata');
          saveAs(blob, `manual-review-history_${timestamp}.xlsx`);
        },
        error: () => {
          this.utilityService.triggerSnackbar('Unable to export the manual-review history. Please try again.', 'snackbar-danger');
        },
      });
  }

  /** Direct download link for the OCR job's source file — a plain URL, no auth header needed. */
  ocrDownloadUrl(ocrJobId: string): string {
    return `${environment.api.url3}ocr-validation/jobs/${ocrJobId}/download`;
  }
}
