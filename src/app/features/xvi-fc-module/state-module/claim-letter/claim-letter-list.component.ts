import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { EMPTY, Subject, catchError, distinctUntilChanged, filter, forkJoin, map, switchMap } from 'rxjs';
import { AmountDisplayModeService } from '../../../../core/services/amount-display-mode.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { AmountDisplayToggleComponent } from '../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import {
  CLAIM_LETTER_INSTALLMENT,
  ClaimLetterBatchSummary,
  ClaimLetterEligibilitySource,
  ClaimLetterEligibilitySummary,
  ClaimLetterHistoryQuery,
  ClaimLetterHistorySortField,
  ClaimLetterHistoryStatusFilter,
} from './claim-letter.models';
import { ClaimLetterEligibilityChecklistComponent } from './components/eligibility-checklist/claim-letter-eligibility-checklist.component';
import {
  CLAIM_LETTER_TILE_LABELS,
  ClaimLetterSummaryTile,
  ClaimLetterSummaryTilesComponent,
  claimsUnderReviewTotal,
} from './components/summary-tiles/claim-letter-summary-tiles.component';
import { ClaimLetterService } from './claim-letter.service';
import { formatClaimLetterBatchLabel } from './claim-letter.utils';
const CLAIM_LETTER_HISTORY_PAGE_SIZE = 10;
const FORM_STATUS_UNDER_REVIEW_BY_SO = 15;

/** The history's default order: Last activity, newest first (the API's default too). */
const DEFAULT_HISTORY_SORT: { active: ClaimLetterHistorySortField; direction: 'asc' | 'desc' } = {
  active: 'updatedAt',
  direction: 'desc',
};
/** The filter and sort a history page was loaded with. */
interface HistoryView {
  status: ClaimLetterHistoryStatusFilter | null;
  batchNumber: number | null;
  sortActive: ClaimLetterHistorySortField;
  sortDirection: 'asc' | 'desc';
}

const HISTORY_SORT_FIELDS: readonly ClaimLetterHistorySortField[] = [
  'updatedAt',
  'submittedAt',
  'batchNumber',
  'ulbCount',
  'claimedTotal',
];

/** Status filter options, in the labels the table shows. */
export const CLAIM_LETTER_HISTORY_STATUS_OPTIONS: readonly { value: ClaimLetterHistoryStatusFilter; label: string }[] =
  [
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'UNDER_REVIEW', label: 'Under Review by MoHUA' },
    { value: 'RETURNED', label: 'Returned for Correction' },
    { value: 'ACKNOWLEDGED', label: 'Acknowledged by MoHUA' },
    { value: 'DISCARDED', label: 'Discarded' },
  ];

@Component({
  selector: 'app-claim-letter-list',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSortModule,
    PreLoaderComponent,
    ClaimLetterSummaryTilesComponent,
    ClaimLetterEligibilityChecklistComponent,
    AmountDisplayToggleComponent,
  ],
  templateUrl: './claim-letter-list.component.html',
  styleUrl: './claim-letter-list.component.scss',
})
export class ClaimLetterListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly utilityService = inject(UtilityService);
  private readonly claimLetterService = inject(ClaimLetterService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly amountDisplay = inject(AmountDisplayModeService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isHistoryLoading = signal(false);

  readonly eligibility = signal<ClaimLetterEligibilitySummary | null>(null);
  readonly stateName = computed(() => this.eligibility()?.stateName ?? '');
  readonly claims = signal<readonly ClaimLetterBatchSummary[]>([]);
  /** Collapsed by default, so returning users reach "New Claim" without the walkthrough. */
  readonly showInstructions = signal(false);

  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = CLAIM_LETTER_HISTORY_PAGE_SIZE;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  /** "Showing 11-20 of 23". */
  readonly rangeStart = computed(() => (this.total() ? (this.page() - 1) * this.limit + 1 : 0));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.limit, this.total()));

  readonly statusOptions = CLAIM_LETTER_HISTORY_STATUS_OPTIONS;
  readonly filterForm = this.fb.group({
    status: this.fb.control<ClaimLetterHistoryStatusFilter | null>(null),
    batchNumber: this.fb.control<number | null>(null),
  });
  private readonly filterValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.getRawValue(),
  });
  readonly hasActiveFilters = computed(() => {
    const { status, batchNumber } = this.filterValue();
    return status != null || batchNumber != null;
  });
  /** Batch 1 to the cap; "Batch 2" also lists 2-R1, 2-R2. */
  readonly batchOptions = computed(() =>
    Array.from({ length: this.eligibility()?.batchSlotsMax ?? 0 }, (_, index) => index + 1),
  );

  readonly sortActive = signal<ClaimLetterHistorySortField>(DEFAULT_HISTORY_SORT.active);
  readonly sortDirection = signal<SortDirection>(DEFAULT_HISTORY_SORT.direction);

  /** One request at a time: a newer page, filter or sort cancels the one in flight. */
  private readonly historyRequest$ = new Subject<number>();
  /** The filter and sort of the rows on screen; a failed request puts the controls back to these. */
  private appliedView: HistoryView = {
    status: null,
    batchNumber: null,
    sortActive: DEFAULT_HISTORY_SORT.active,
    sortDirection: DEFAULT_HISTORY_SORT.direction,
  };
  /** Set while a failed request's filters are put back, so that change does not load again. */
  private restoringFilters = false;

  /** The State gate sources plus the ULB-only criteria as one list; ULB-only items have no `result`. */
  readonly checklistItems = computed<ClaimLetterEligibilitySource[]>(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return [];

    const ulbOnlyItems: ClaimLetterEligibilitySource[] = eligibility.ulbLevelCriteria.map((criterion, index) => ({
      formType: criterion.displayLabel ?? `ULB_LEVEL_CRITERION_${index}`,
      reasonCode: 'ULB_LEVEL_ONLY',
      displayLabel: criterion.displayLabel,
      displayDescription: criterion.displayDescription,
      ulbBreakdown: criterion.tally,
    }));

    return [...eligibility.stateLevelGate.sources, ...ulbOnlyItems];
  });

  /** No ULB passes every ULB-bulk criterion at once, though each may look fine alone. The checklist
   *  reads the same `ulbReadiness`, so the two always agree. */
  readonly ulbReadinessBlocked = computed(() => (this.eligibility()?.ulbReadiness.eligible ?? 0) === 0);

  readonly isEligible = computed(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return false;
    return eligibility.stateLevelGate.passed && !this.ulbReadinessBlocked();
  });

  /** The SO review is internal to MoHUA, so the State sees a letter under SO review as under MoHUA review. */
  statusLabel(claim: ClaimLetterBatchSummary): string {
    return claim.currentFormStatus === FORM_STATUS_UNDER_REVIEW_BY_SO
      ? 'Under Review by MoHUA'
      : claim.currentFormStatusLabel;
  }

  /** "2", or "2-R1" for a letter built after a return. */
  batchLabel(claim: ClaimLetterBatchSummary): string {
    return formatClaimLetterBatchLabel(claim.batchNumber, claim.resubmissionNumber);
  }

  readonly canCreateNewClaim = computed(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return false;
    // Several letters may be in draft or under review at once, up to the cap.
    return this.isEligible() && eligibility.batchSlotsUsed < eligibility.batchSlotsMax;
  });

  /** Why "New Claim" is disabled, checked in the same order as `canCreateNewClaim`; null when enabled. */
  readonly newClaimDisabledReason = computed<string | null>(() => {
    const eligibility = this.eligibility();
    if (!eligibility || this.canCreateNewClaim()) return null;

    if (!eligibility.stateLevelGate.passed) {
      return 'Your state has not yet met all eligibility conditions - see the checklist below.';
    }
    if (this.ulbReadinessBlocked()) {
      return 'No ULBs currently meet every eligibility criterion, so there is nothing to include in a new claim yet.';
    }
    if (eligibility.batchSlotsUsed >= eligibility.batchSlotsMax) {
      return `All ${eligibility.batchSlotsMax} claim letters for this installment are in use. A letter that is discarded or returned frees its place.`;
    }
    return 'New claims are currently unavailable.';
  });

  /** One place left or none, and ULBs in no letter: a ULB left out of the last letter cannot be claimed this
   *  installment. */
  readonly showFinalBatchWarning = computed(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return false;
    return eligibility.batchSlotsMax - eligibility.batchSlotsUsed <= 1 && eligibility.remainingUlbCount > 0;
  });

  /** State-wide figures only (no batch in view); the full four-figure breakdown appears only here. */
  readonly summaryTiles = computed<ClaimLetterSummaryTile[]>(() => {
    const overview = this.eligibility()?.financialOverview;
    if (!overview) return [];
    return [
      { label: CLAIM_LETTER_TILE_LABELS.available, value: overview.availableToClaim, emphasized: true },
      { label: CLAIM_LETTER_TILE_LABELS.total, value: overview.totalInstallmentAllocation },
      { label: CLAIM_LETTER_TILE_LABELS.underReview, value: claimsUnderReviewTotal(overview) },
      { label: CLAIM_LETTER_TILE_LABELS.draft, value: overview.totalClaimInDraft },
    ];
  });

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'auto');
  readonly installment = CLAIM_LETTER_INSTALLMENT;

  toggleInstructions(): void {
    this.showInstructions.update((value) => !value);
  }

  get stateId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  constructor() {
    this.historyRequest$
      .pipe(
        switchMap((page) => {
          const stateId = this.stateId;
          const yearId = this.yearId;
          if (!stateId || !yearId) return EMPTY;
          const view = this.currentView();
          this.isHistoryLoading.set(true);
          return this.claimLetterService.listHistory(stateId, yearId, this.historyQuery(page, view)).pipe(
            map((history) => ({ history, view })),
            catchError((err: unknown) => {
              console.error('Failed to load Claim Letter history', err);
              this.isHistoryLoading.set(false);
              // The rows on screen stay, so the filter and sort go back to the ones they were loaded with.
              this.restoreView(this.appliedView);
              this.utilityService.triggerSnackbar(
                'Unable to load Claim Letter history. Please try again.',
                'snackbar-danger',
              );
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ history, view }) => {
        this.claims.set(history.claims);
        this.total.set(history.total);
        this.page.set(history.page);
        this.appliedView = view;
        this.isHistoryLoading.set(false);
      });

    // A filter change starts again from page 1. The duplicate check comes first, so picking a value whose request
    // failed (and was put back) sends it again.
    this.filterForm.valueChanges
      .pipe(
        distinctUntilChanged((a, b) => a.status === b.status && a.batchNumber === b.batchNumber),
        filter(() => !this.restoringFilters),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.historyRequest$.next(1));
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.loadError.set(true);
      this.utilityService.triggerSnackbar('Unable to load Claim Letters. Please try again.', 'snackbar-danger');
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(false);

    const view = this.currentView();
    forkJoin({
      eligibility: this.claimLetterService.getEligibilitySummary(stateId, yearId, CLAIM_LETTER_INSTALLMENT),
      history: this.claimLetterService.listHistory(stateId, yearId, this.historyQuery(1, view)),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ eligibility, history }) => {
          this.eligibility.set(eligibility);
          this.claims.set(history.claims);
          this.total.set(history.total);
          this.page.set(history.page);
          this.appliedView = view;
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load Claim Letters', err);
          this.loadError.set(true);
          this.isLoading.set(false);
          this.utilityService.triggerSnackbar('Unable to load Claim Letters. Please try again.', 'snackbar-danger');
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page() || this.isHistoryLoading()) return;
    this.historyRequest$.next(page);
  }

  /**
   * A column header click. The table never clears a sort (`matSortDisableClear`), so a header only flips between
   * ascending and descending; Last activity is the way back to the default. An unknown column falls back to it too.
   */
  onSort(sort: Sort): void {
    const field = HISTORY_SORT_FIELDS.find((f) => f === sort.active);
    if (field && sort.direction) {
      this.sortActive.set(field);
      this.sortDirection.set(sort.direction);
    } else {
      this.sortActive.set(DEFAULT_HISTORY_SORT.active);
      this.sortDirection.set(DEFAULT_HISTORY_SORT.direction);
    }
    this.historyRequest$.next(1);
  }

  resetFilters(): void {
    if (!this.hasActiveFilters()) return;
    this.filterForm.reset({ status: null, batchNumber: null });
  }

  private currentView(): HistoryView {
    const { status, batchNumber } = this.filterForm.getRawValue();
    return {
      status,
      batchNumber,
      sortActive: this.sortActive(),
      sortDirection: this.sortDirection() === 'asc' ? 'asc' : 'desc',
    };
  }

  /** Puts the filter and sort controls back without loading again. */
  private restoreView(view: HistoryView): void {
    this.sortActive.set(view.sortActive);
    this.sortDirection.set(view.sortDirection);
    this.restoringFilters = true;
    this.filterForm.setValue({ status: view.status, batchNumber: view.batchNumber });
    this.restoringFilters = false;
  }

  /** The default filter and sort are left out, so the API applies its own defaults. */
  private historyQuery(page: number, view: HistoryView): ClaimLetterHistoryQuery {
    const { status, batchNumber, sortActive: sortBy, sortDirection: sortOrder } = view;
    const isDefaultSort = sortBy === DEFAULT_HISTORY_SORT.active && sortOrder === DEFAULT_HISTORY_SORT.direction;
    return {
      installment: CLAIM_LETTER_INSTALLMENT,
      page,
      limit: this.limit,
      ...(status ? { status } : {}),
      ...(batchNumber != null ? { batchNumber } : {}),
      ...(isDefaultSort ? {} : { sortBy, sortOrder }),
    };
  }

  createNewClaim(): void {
    if (!this.canCreateNewClaim()) return;
    this.router.navigate(['/xvifc', this.yearId, 'claim-letter', 'new']);
  }

  viewClaim(claimLetterId: string): void {
    this.router.navigate(['/xvifc', this.yearId, 'claim-letter', claimLetterId]);
  }
}
