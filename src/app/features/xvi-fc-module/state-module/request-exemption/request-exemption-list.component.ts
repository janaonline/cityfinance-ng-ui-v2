import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { FORM_STATUS } from '../../common/constants/form-status.constants';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { RequestExemptionListItem } from './request-exemption.models';
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

@Component({
  selector: 'app-request-exemption-list',
  imports: [DatePipe, MatButtonModule, MatCardModule, PreLoaderComponent],
  templateUrl: './request-exemption-list.component.html',
  styleUrl: './request-exemption-list.component.scss',
})
export class RequestExemptionListComponent implements OnInit {
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
  }

  /** If exemption table is empty, redirects straight to the fill-in form. */
  loadFirstPage(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.loadError.set(true);
      this.isLoading.set(false);
      this.utilityService.triggerSnackbar('Unable to load Exemption Status. Please try again.', 'snackbar-danger');
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(false);

    this.requestExemptionService
      .list(stateId, yearId, { page: 1, limit: this.limit })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.total === 0) {
            this.router.navigate(['/xvifc', yearId, 'request-exemption', 'new'], { replaceUrl: true });
            return;
          }
          this.stateName.set(result.stateName);
          this.items.set(result.items);
          this.total.set(result.total);
          this.page.set(result.page);
          this.canCreate.set(result.canCreate);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load Exemption Status', err);
          this.loadError.set(true);
          this.isLoading.set(false);
          this.utilityService.triggerSnackbar('Unable to load Exemption Status. Please try again.', 'snackbar-danger');
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page() || this.isPageLoading()) return;

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.isPageLoading.set(true);

    this.requestExemptionService
      .list(stateId, yearId, { page, limit: this.limit })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.total.set(result.total);
          this.page.set(result.page);
          this.canCreate.set(result.canCreate);
          this.isPageLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load Exemption Status page', err);
          this.isPageLoading.set(false);
          this.utilityService.triggerSnackbar('Unable to load that page. Please try again.', 'snackbar-danger');
        },
      });
  }

  createNewRequest(): void {
    if (!this.canCreate()) return;
    this.router.navigate(['/xvifc', this.yearId, 'request-exemption', 'new']);
  }
}
