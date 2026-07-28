import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ClaimLetterEligibilitySource } from '../../claim-letter.models';
import { describeEligibilitySourceDescription, describeEligibilitySourceLabel } from '../../claim-letter.utils';

/**
 * Dynamic eligibility checklist — driven entirely by whatever `stateLevelGate.sources` the backend
 * returns, with no hardcoded criteria names, so a new source wired up on the backend (e.g. SFC,
 * Elected Body) appears here automatically with zero frontend changes.
 *
 * Collapses to a single summary line when every source passes — a returning user shouldn't have to
 * re-verify N criteria on every visit — and auto-expands the itemized list the moment anything is
 * failing, since that's exactly when the detail is actually needed to explain a block. A manual
 * toggle keeps the full list available on demand either way (only meaningful while everything is
 * passing; there's nothing to collapse away while something is genuinely blocking).
 */
@Component({
  selector: 'app-claim-letter-eligibility-checklist',
  templateUrl: './claim-letter-eligibility-checklist.component.html',
  styleUrl: './claim-letter-eligibility-checklist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterEligibilityChecklistComponent {
  readonly sources = input.required<readonly ClaimLetterEligibilitySource[]>();

  private readonly manuallyExpanded = signal(false);

  readonly allPassing = computed(() => this.sources().every((source) => source.result !== 'FAILED'));
  readonly expanded = computed(() => !this.allPassing() || this.manuallyExpanded());

  readonly describeLabel = describeEligibilitySourceLabel;
  readonly describeDescription = describeEligibilitySourceDescription;

  toggleExpanded(): void {
    this.manuallyExpanded.update((value) => !value);
  }
}
