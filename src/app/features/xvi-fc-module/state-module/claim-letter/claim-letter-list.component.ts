import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
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
} from './claim-letter.models';
import { ClaimLetterEligibilityChecklistComponent } from './components/eligibility-checklist/claim-letter-eligibility-checklist.component';
import {
  ClaimLetterSummaryTile,
  ClaimLetterSummaryTilesComponent,
} from './components/summary-tiles/claim-letter-summary-tiles.component';
import { ClaimLetterService } from './claim-letter.service';
const CLAIM_LETTER_HISTORY_PAGE_SIZE = 10;

@Component({
  selector: 'app-claim-letter-list',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
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

  readonly canCreateNewClaim = computed(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return false;
    return (
      this.isEligible() &&
      eligibility.batchSlotsUsed < eligibility.batchSlotsMax &&
      eligibility.activeBatchNumber === null
    );
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
      return `You've used all ${eligibility.batchSlotsMax} claim batch slots for this installment. Resolve or wait on an existing batch before starting another.`;
    }
    if (eligibility.activeBatchNumber !== null) {
      return `Only one claim batch can be processed at a time. Batch ${eligibility.activeBatchNumber} is still in progress or under MoHUA review.`;
    }
    return 'New claims are currently unavailable.';
  });

  /** One slot left and ULBs in no batch: a ULB left out of the last batch cannot be claimed this installment. */
  readonly showFinalBatchWarning = computed(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return false;
    return eligibility.batchSlotsMax - eligibility.batchSlotsUsed === 1 && eligibility.remainingUlbCount > 0;
  });

  /** State-wide figures only (no batch in view); the full five-figure breakdown appears only here. */
  readonly summaryTiles = computed<ClaimLetterSummaryTile[]>(() => {
    const overview = this.eligibility()?.financialOverview;
    if (!overview) return [];
    return [
      { label: 'Available to Claim', value: overview.availableToClaim, emphasized: true },
      { label: 'Total Allocation', value: overview.totalInstallmentAllocation },
      { label: 'Already Claimed (Acknowledged)', value: overview.totalAlreadyAcknowledged },
      { label: 'Claim in Progress (Under Review)', value: overview.totalClaimInProgress },
      { label: 'Claim in Draft', value: overview.totalClaimInDraft },
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

    forkJoin({
      eligibility: this.claimLetterService.getEligibilitySummary(stateId, yearId, CLAIM_LETTER_INSTALLMENT),
      history: this.claimLetterService.listHistory(stateId, yearId, {
        installment: CLAIM_LETTER_INSTALLMENT,
        page: 1,
        limit: this.limit,
      }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ eligibility, history }) => {
          this.eligibility.set(eligibility);
          this.claims.set(history.claims);
          this.total.set(history.total);
          this.page.set(history.page);
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

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.isHistoryLoading.set(true);

    this.claimLetterService
      .listHistory(stateId, yearId, { installment: CLAIM_LETTER_INSTALLMENT, page, limit: this.limit })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (history) => {
          this.claims.set(history.claims);
          this.total.set(history.total);
          this.page.set(history.page);
          this.isHistoryLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load Claim Letter history', err);
          this.isHistoryLoading.set(false);
          this.utilityService.triggerSnackbar(
            'Unable to load Claim Letter history. Please try again.',
            'snackbar-danger',
          );
        },
      });
  }

  createNewClaim(): void {
    if (!this.canCreateNewClaim()) return;
    this.router.navigate(['/xvifc', this.yearId, 'claim-letter', 'new']);
  }

  viewClaim(claimLetterId: string): void {
    this.router.navigate(['/xvifc', this.yearId, 'claim-letter', claimLetterId]);
  }
}
