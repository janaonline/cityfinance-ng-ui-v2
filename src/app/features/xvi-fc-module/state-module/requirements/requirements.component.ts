import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { StateDashboardService } from '../state-dashboard/state-dashboard.service';
import { ClaimLetterService } from '../claim-letter/claim-letter.service';
import {
  CLAIM_LETTER_INSTALLMENT,
  ClaimLetterEligibilitySource,
  ClaimLetterPriorFcCycleLabel,
} from '../claim-letter/claim-letter.models';
import { describeEligibilitySourceDescription, describeEligibilitySourceLabel } from '../claim-letter/claim-letter.utils';

/** Sibling route (relative to this page) for each STATE-level `claimEligibility` source. */
const CONDITION_ROUTE_BY_FORM_TYPE: Record<string, string> = {
  SFC: '../sfc-status',
  ELECTED_BODY: '../elected-body-status',
  DEVOLUTION_FORMULA: '../ulb-wise-allocation',
  FC_UNSPENT_STATE: '../fc-unspent-declaration',
};

/** Curated, plain-language requirement copy for the primary checklist line — deliberately not the
 *  backend's own `displayDescription` (that's still shown, verbatim, via the info tooltip). A
 *  future STATE-level source with no entry here falls back to `describeEligibilitySourceDescription`
 *  so it still renders sensible text without a frontend code change. `FC_UNSPENT_STATE`'s copy takes
 *  the backend-resolved `priorFcCycleLabel` ("14th FC"/"15th FC") so that text is never a hardcoded
 *  literal here — it comes straight off `ClaimLetterEligibilitySummary`, the same value the actual
 *  Claim Letter document itself uses, so the two can never disagree. */
const CONDITION_DESC_BY_FORM_TYPE: Record<string, (priorFcCycleLabel: ClaimLetterPriorFcCycleLabel) => string> = {
  SFC: () => 'Confirm that the State Finance Commission has been constituted',
  ELECTED_BODY: () => 'Upload confirmation that ULBs have duly-elected bodies in place',
  DEVOLUTION_FORMULA: () => 'Upload the Excel file showing grant amounts and devolution formula for each ULB',
  FC_UNSPENT_STATE: (priorFcCycleLabel) =>
    `Confirm that all ULBs in the state have submitted their ${priorFcCycleLabel} unspent balance disclosures`,
};

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
  imports: [MatButtonModule, MatTooltipModule, RouterLink],
  templateUrl: './requirements.component.html',
  styleUrl: './requirements.component.scss',
})
export class RequirementsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly stateDashboardService = inject(StateDashboardService);
  private readonly claimLetterService = inject(ClaimLetterService);
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
    return value === null ? '—' : this.formatAllocation(value);
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
          this.conditionsToBeMet.set(
            this.buildConditions(eligibility.stateLevelGate.sources, eligibility.priorFcCycleLabel),
          );
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to load state requirements', error);
          this.errorMessage.set('Failed to load state requirements.');
          this.isLoading.set(false);
        },
      });
  }

  private buildConditions(
    sources: ClaimLetterEligibilitySource[],
    priorFcCycleLabel: ClaimLetterPriorFcCycleLabel,
  ): RequirementCondition[] {
    return sources.map((source) => {
      const passed = source.result === 'PASSED' || source.result === 'EXEMPTED';
      const descBuilder = CONDITION_DESC_BY_FORM_TYPE[source.formType];
      return {
        label: describeEligibilitySourceLabel(source),
        desc: descBuilder ? descBuilder(priorFcCycleLabel) : describeEligibilitySourceDescription(source),
        info: describeEligibilitySourceDescription(source),
        iconClass: passed ? 'bi bi-check-circle text-success' : 'bi bi-record-circle text-cfPrimary',
        buttonLabel: 'View',
        routerLink: CONDITION_ROUTE_BY_FORM_TYPE[source.formType] ?? '../requirements',
        passed,
      };
    });
  }

  private resolveStateId(): string {
    const stateId = this.authService.getCurrentUserSnapshot()?.state;
    return typeof stateId === 'string' ? stateId.trim() : '';
  }

  /** Matches the existing static markup's "₹1,562 crore" style — same `Intl.NumberFormat('en-IN')`
   *  approach as `StateDashboardComponent.formatAmount()`, kept local since that method isn't shared. */
  private formatAllocation(value: number): string {
    const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
    return `₹${formatted} crore`;
  }
}
