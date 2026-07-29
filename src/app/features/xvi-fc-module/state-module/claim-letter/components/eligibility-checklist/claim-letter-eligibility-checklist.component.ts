import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ClaimLetterEligibilitySource } from '../../claim-letter.models';
import { describeEligibilitySourceDescription, describeEligibilitySourceLabel } from '../../claim-letter.utils';

/**
 * Dynamic eligibility checklist — driven entirely by whatever `stateLevelGate.sources` the backend
 * returns, with no hardcoded criteria names, so a new source wired up on the backend (e.g. SFC,
 * Elected Body) appears here automatically with zero frontend changes.
 *
 * Two independent groups, each collapsing/expanding on the exact same pattern: a single summary
 * line + manual Show/Hide toggle while everything in that group passes, auto-expanded with no
 * toggle the moment anything in it fails — a returning user shouldn't have to re-verify N criteria
 * on every visit, but the detail must never be one click away from a reassuring summary once
 * something is actually blocking.
 *
 * - State-level items (`stateSources`, those with a `result`): SFC, Devolution, Elected Body/FC
 *   Unspent form status — pass/fail per `result`.
 * - ULB-only items (`ulbOnlySources`, no `result`): SLB, Provisional, Audited — rendered with a
 *   neutral info icon (no per-item pass/fail signal). The group's own pass/fail instead comes from
 *   the `ulbReadiness` input — the true intersection across every ULB-bulk criterion, not just
 *   these 3 — mirroring the same threshold `claim-letter-list.component.ts` uses to disable "New
 *   Claim", so this section and that button always agree on whether ULBs are actually pickable.
 */
@Component({
  selector: 'app-claim-letter-eligibility-checklist',
  templateUrl: './claim-letter-eligibility-checklist.component.html',
  styleUrl: './claim-letter-eligibility-checklist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterEligibilityChecklistComponent {
  readonly sources = input.required<readonly ClaimLetterEligibilitySource[]>();
  readonly ulbReadiness = input.required<{ eligible: number; total: number }>();

  private readonly manuallyExpanded = signal(false);
  private readonly ulbManuallyExpanded = signal(false);

  readonly stateSources = computed(() => this.sources().filter((source) => source.result !== undefined));
  readonly ulbOnlySources = computed(() => this.sources().filter((source) => source.result === undefined));

  readonly allPassing = computed(() => this.stateSources().every((source) => source.result !== 'FAILED'));
  readonly expanded = computed(() => !this.allPassing() || this.manuallyExpanded());

  readonly ulbAllPassing = computed(() => this.ulbReadiness().eligible > 0);
  readonly ulbExpanded = computed(() => !this.ulbAllPassing() || this.ulbManuallyExpanded());

  readonly describeLabel = describeEligibilitySourceLabel;
  readonly describeDescription = describeEligibilitySourceDescription;

  toggleExpanded(): void {
    this.manuallyExpanded.update((value) => !value);
  }

  toggleUlbExpanded(): void {
    this.ulbManuallyExpanded.update((value) => !value);
  }
}
