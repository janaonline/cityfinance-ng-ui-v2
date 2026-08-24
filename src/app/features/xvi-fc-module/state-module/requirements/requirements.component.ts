import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AmountDisplayModeService } from '../../../../core/services/amount-display-mode.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AmountDisplayToggleComponent } from '../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { StateDashboardService } from '../state-dashboard/state-dashboard.service';
import { ClaimLetterService } from '../claim-letter/claim-letter.service';
import { CLAIM_LETTER_INSTALLMENT, ClaimLetterEligibilitySource } from '../claim-letter/claim-letter.models';
import { describeEligibilitySourceDescription, describeEligibilitySourceLabel } from '../claim-letter/claim-letter.utils';
import { PreLoaderComponent } from "../../../../shared/components/pre-loader/pre-loader.component";

interface RequirementCondition {
  label: string;
  desc: string;
  /** Backend's own technical eligibility copy shown in the info tooltip.*/
  info: string;
  iconClass: string;
  buttonLabel: string;
  routerLink: string;
  passed: boolean;
}

@Component({
  selector: 'app-requirements',
  imports: [MatButtonModule, MatTooltipModule, RouterLink, AmountDisplayToggleComponent, PreLoaderComponent],
  templateUrl: './requirements.component.html',
  styleUrl: './requirements.component.scss',
})
export class RequirementsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly stateDashboardService = inject(StateDashboardService);
  private readonly claimLetterService = inject(ClaimLetterService);
  private readonly amountDisplay = inject(AmountDisplayModeService);
  private readonly destroyRef = inject(DestroyRef);

  /** V1 only supports Installment 1 — same "static for now, dynamic later" constant the
   *  claim-letter feature already uses (`CLAIM_LETTER_INSTALLMENT`). */
  readonly installment = CLAIM_LETTER_INSTALLMENT;
  readonly installmentOrdinal = this.installment === 1 ? '1st' : '2nd';

  financialYear = signal('');
  totalAllocation = signal<number | null>(null);
  stateName = signal('');
  eligibleUlbCount = signal<number | null>(null);
  conditionsToBeMet = signal<RequirementCondition[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  readonly totalCount = computed(() => this.conditionsToBeMet().length);
  readonly submittedCount = computed(() => this.conditionsToBeMet().filter((c) => c.passed).length);
  readonly progressPercent = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.submittedCount() / total) * 100);
  });
  readonly formattedAllocation = computed(() => {
    const value = this.totalAllocation();
    return value === null ? '—' : this.amountDisplay.format(value, 'auto');
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const stateId = this.resolveStateId();
    const yearId = this.moduleService.yearId() ?? '';

    if (!stateId || !yearId) {
      this.errorMessage.set('State or financial-year context is unavailable.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      dashboard: this.stateDashboardService.getDashboard(stateId, yearId),
      eligibility: this.claimLetterService.getEligibilitySummary(stateId, yearId, this.installment),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ dashboard, eligibility }) => {
          this.financialYear.set(dashboard.data.context.financialYear);
          this.totalAllocation.set(dashboard.data.metrics.allocatedAmount);
          this.stateName.set(eligibility.stateName);
          this.eligibleUlbCount.set(eligibility.expectedUlbCount);
          this.conditionsToBeMet.set(this.buildConditions(eligibility.stateLevelGate.sources));
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to load state requirements', error);
          this.errorMessage.set('Failed to load state requirements.');
          this.isLoading.set(false);
        },
      });
  }

  /** Route and primary-line copy are both DB-driven (`source.checklistRoute`/`checklistSummary`,
   *  from `formjsons.claimEligibility` — see claim-letter.models.ts) with generic fallbacks, so a
   *  new STATE-level claim-eligibility source added next year renders here with zero frontend
   *  changes, same as `label`/`info` below already do. */
  private buildConditions(sources: ClaimLetterEligibilitySource[]): RequirementCondition[] {
    return sources.map((source) => {
      const passed = source.result === 'PASSED' || source.result === 'EXEMPTED';
      return {
        label: describeEligibilitySourceLabel(source),
        desc: source.checklistSummary ?? describeEligibilitySourceDescription(source),
        info: describeEligibilitySourceDescription(source),
        iconClass: passed ? 'bi bi-check-circle text-success' : 'bi bi-record-circle text-cfPrimary',
        buttonLabel: 'View',
        routerLink: source.checklistRoute ?? '../requirements',
        passed,
      };
    });
  }

  private resolveStateId(): string {
    const stateId = this.authService.getCurrentUserSnapshot()?.state;
    return typeof stateId === 'string' ? stateId.trim() : '';
  }
}
