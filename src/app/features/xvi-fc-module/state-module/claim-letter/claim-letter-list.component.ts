import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
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
import { formatCrore } from './claim-letter.utils';
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

  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isHistoryLoading = signal(false);

  readonly eligibility = signal<ClaimLetterEligibilitySummary | null>(null);
  readonly claims = signal<readonly ClaimLetterBatchSummary[]>([]);
  /** Collapsed by default — a returning user doesn't need the full walkthrough re-shown on every
   *  visit just to reach "New Claim"; one click away for anyone who does. */
  readonly showInstructions = signal(false);

  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = CLAIM_LETTER_HISTORY_PAGE_SIZE;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());

  /** Unified 7-item checklist: the 4 state-level gate sources (SFC, Devolution, Elected Body, FC
   *  Unspent) plus the 3 ULB-only criteria (SLB, Provisional, Audited) from `ulbLevelCriteria`,
   *  mapped into the same item shape with `result` left `undefined` — the checklist component
   *  renders those with a neutral icon and excludes them from "all passing" (plan: one unified
   *  list, not a separate informational block). */
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

  /** True exactly when zero ULBs meet every ULB-bulk requirement at once — the true intersection
   *  across SLB/Provisional/Audited plus the Elected Body/FC Unspent row tallies, not just whether
   *  any single criterion individually hits 0 (a criterion can each look fine on its own while no
   *  ULB passes all of them, e.g. different ULBs failing different criteria). Same `ulbReadiness`
   *  stat shown in the top banner and passed into the checklist component, so this button, the top
   *  badge, and the checklist's ULB section always agree on whether ULBs are actually pickable. */
  readonly ulbReadinessBlocked = computed(() => (this.eligibility()?.ulbReadiness.eligible ?? 0) === 0);

  readonly isEligible = computed(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return false;
    return eligibility.stateLevelGate.passed && !this.ulbReadinessBlocked();
  });

  readonly canCreateNewClaim = computed(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return false;
    return this.isEligible() && eligibility.batchSlotsUsed < eligibility.batchSlotsMax;
  });

  /** Proactive "last call" warning — fires once exactly one batch slot remains (this state's
   *  penultimate batch already exists) and at least one expected ULB still has no home in any
   *  batch. Any ULB left out of the final batch becomes permanently unclaimable for this
   *  installment, so this is shown well before that batch is even opened. */
  readonly showFinalBatchWarning = computed(() => {
    const eligibility = this.eligibility();
    if (!eligibility) return false;
    return eligibility.batchSlotsMax - eligibility.batchSlotsUsed === 1 && eligibility.remainingUlbCount > 0;
  });

  /** State-wide context only — "claimed in current batch"/"remaining after batch" don't mean
   *  anything here since no specific batch is in view (only on the Batch #n detail page). The full
   *  5-figure breakdown lives here (not on the create/edit pages, which stay leaner and let their
   *  narrative bullets carry the "in progress"/"in draft" nuance in prose instead) — "Available to
   *  Claim" is visually emphasized since it's the one number that most directly answers "can I act
   *  right now." */
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

  readonly formatCrore = formatCrore;
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
