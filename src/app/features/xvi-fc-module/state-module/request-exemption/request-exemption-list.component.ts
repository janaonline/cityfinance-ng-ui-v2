import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { FORM_STATUS } from '../../common/constants/form-status.constants';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { RequestExemptionListItem, RequestExemptionReasonOption } from './request-exemption.models';
import { RequestExemptionService } from './request-exemption.service';

const REQUEST_EXEMPTION_LIST_PAGE_SIZE = 10;

const STATUS_BADGE_CLASS: Readonly<Record<number, string>> = {
  [FORM_STATUS.UNDER_REVIEW_BY_MOHUA]: 'text-bg-secondary',
  [FORM_STATUS.RETURNED_BY_MOHUA]: 'text-bg-danger',
  [FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA]: 'text-bg-success',
};

export function getRequestExemptionStatusBadgeClass(status: number): string {
  return STATUS_BADGE_CLASS[status] ?? 'text-bg-secondary';
}

/** Uses the exact same labels the table's own status pill already shows (getFormStatusLabel(5/6/7)
 *  on the backend), not an informal "Pending/Rejected/Approved" vocabulary — so the filter and the
 *  badge the user sees directly correlate. Only these 3 statuses are ever reachable for this form. */
export const STATUS_FILTER_OPTIONS: ReadonlyArray<{ id: number; label: string }> = [
  { id: FORM_STATUS.UNDER_REVIEW_BY_MOHUA, label: 'Under Review by MoHUA' },
  { id: FORM_STATUS.RETURNED_BY_MOHUA, label: 'Returned by MoHUA' },
  { id: FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA, label: 'Acknowledged by MoHUA' },
];

@Component({
  selector: 'app-request-exemption-list',
  imports: [DatePipe, MatButtonModule, MatCardModule, PreLoaderComponent, ReactiveFormsModule],
  templateUrl: './request-exemption-list.component.html',
  styleUrl: './request-exemption-list.component.scss',
})
export class RequestExemptionListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly utilityService = inject(UtilityService);
  private readonly requestExemptionService = inject(RequestExemptionService);
  private readonly moduleService = inject(XvifcModuleService);

  readonly isLoading = signal(true);
  readonly loadError = signal(false);
  readonly isPageLoading = signal(false);

  readonly stateName = signal('');
  readonly items = signal<readonly RequestExemptionListItem[]>([]);
  readonly canCreate = signal(true);
  readonly getStatusBadgeClass = getRequestExemptionStatusBadgeClass;
  /** Sourced from the backend's `formjsons`-driven reason-options endpoint, not hardcoded - see
   *  `loadReasonOptions()`. Starts empty; the dropdown just shows "All Reasons" until it resolves. */
  readonly reasonFilterOptions = signal<readonly RequestExemptionReasonOption[]>([]);
  readonly statusFilterOptions = STATUS_FILTER_OPTIONS;

  readonly filterForm = this.fb.nonNullable.group({
    search: '',
    reasonForExemption: null as number | null,
    status: null as number | null,
  });

  // Bridges the FormGroup's plain (non-signal) value changes into the signal graph - a computed()
  // reading filterForm.getRawValue() directly would never re-run, since Angular has no way to see
  // FormGroup mutations as a signal dependency. Same toSignal(valueChanges) pattern
  // ulb-submissions.component.ts already uses for its own filter form.
  private readonly filterFormValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.getRawValue(),
  });

  readonly hasActiveFilters = computed(() => {
    const value = this.filterFormValue();
    return !!value.search?.trim() || value.reasonForExemption != null || value.status != null;
  });

  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = REQUEST_EXEMPTION_LIST_PAGE_SIZE;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());

  private get stateId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  private get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  ngOnInit(): void {
    this.loadFirstPage();
    this.loadReasonOptions();

    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.loadRows(1, { isFirstLoad: false }));
  }

  /** Non-critical to the page's main table load - a failure here just leaves the Reason dropdown
   *  showing "All Reasons" only, so it's fetched independently rather than blocking/erroring the
   *  whole page alongside loadFirstPage(). */
  private loadReasonOptions(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.requestExemptionService
      .getReasonOptions(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => this.reasonFilterOptions.set(options),
        error: (err: unknown) => console.error('Failed to load Reason for Exemption options', err),
      });
  }

  /** Single fetch path for the initial load, a filter/search change, and page navigation.
   *  `isFirstLoad` gates the "table is empty → redirect to the new-request form" behavior: that
   *  redirect must only ever fire for the genuinely-never-filed case (no search/filter active, on
   *  page 1) — a search/filter that matches nothing instead just renders the table's empty row. */
  private loadRows(page: number, options: { isFirstLoad: boolean }): void {
    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.loadError.set(true);
      this.isLoading.set(false);
      this.utilityService.triggerSnackbar('Unable to load Exemption Status. Please try again.', 'snackbar-danger');
      return;
    }

    if (options.isFirstLoad) {
      this.isLoading.set(true);
      this.loadError.set(false);
    } else {
      this.isPageLoading.set(true);
    }

    const { search, reasonForExemption, status } = this.filterForm.getRawValue();

    this.requestExemptionService
      .list(stateId, yearId, { page, limit: this.limit, search, reasonForExemption, status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (options.isFirstLoad && result.total === 0 && !this.hasActiveFilters()) {
            this.router.navigate(['/xvifc', yearId, 'request-exemption', 'new'], { replaceUrl: true });
            return;
          }
          this.stateName.set(result.stateName);
          this.items.set(result.items);
          this.total.set(result.total);
          this.page.set(result.page);
          this.canCreate.set(result.canCreate);
          this.isLoading.set(false);
          this.isPageLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load Exemption Status', err);
          this.loadError.set(true);
          this.isLoading.set(false);
          this.isPageLoading.set(false);
          this.utilityService.triggerSnackbar('Unable to load Exemption Status. Please try again.', 'snackbar-danger');
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page() || this.isPageLoading()) return;
    this.loadRows(page, { isFirstLoad: false });
  }

  /** Bound to the error-state Retry button in the template. */
  loadFirstPage(): void {
    this.loadRows(1, { isFirstLoad: true });
  }

  createNewRequest(): void {
    if (!this.canCreate()) return;
    this.router.navigate(['/xvifc', this.yearId, 'request-exemption', 'new']);
  }

  resetFilters(): void {
    if (!this.hasActiveFilters()) return;
    this.filterForm.reset({ search: '', reasonForExemption: null, status: null });
  }
}
