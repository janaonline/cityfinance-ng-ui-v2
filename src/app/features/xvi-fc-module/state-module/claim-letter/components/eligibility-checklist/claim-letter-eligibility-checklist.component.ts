import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ClaimLetterEligibilitySource, ClaimLetterUlbReadiness } from '../../claim-letter.models';
import { describeEligibilitySourceLabel, describeEligibilitySourceRequirement } from '../../claim-letter.utils';

/**
 * Built only from the sources the backend returns, so a new criterion needs no UI change. Each group
 * shows a one-line summary while it passes and opens itself when anything fails. The ULB group's
 * pass/fail is `ulbReadiness`, the figure the list page uses for "New Claim", so the two agree.
 */
@Component({
  selector: 'app-claim-letter-eligibility-checklist',
  imports: [NgTemplateOutlet],
  templateUrl: './claim-letter-eligibility-checklist.component.html',
  styleUrl: './claim-letter-eligibility-checklist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterEligibilityChecklistComponent {
  readonly sources = input.required<readonly ClaimLetterEligibilitySource[]>();
  readonly ulbReadiness = input.required<ClaimLetterUlbReadiness>();

  private readonly manuallyExpanded = signal(false);
  private readonly ulbManuallyExpanded = signal(false);

  readonly stateSources = computed(() => this.sources().filter((source) => source.result !== undefined));
  readonly ulbOnlySources = computed(() => this.sources().filter((source) => source.result === undefined));
  readonly rowLevelSources = computed(() => this.stateSources().filter((source) => source.ulbBreakdown));

  readonly allPassing = computed(() => this.stateSources().every((source) => source.result !== 'FAILED'));
  readonly expanded = computed(() => !this.allPassing() || this.manuallyExpanded());

  readonly ulbAllPassing = computed(() => this.ulbReadiness().eligible > 0);
  readonly ulbExpanded = computed(() => !this.ulbAllPassing() || this.ulbManuallyExpanded());

  readonly describeLabel = describeEligibilitySourceLabel;
  readonly describeRequirement = describeEligibilitySourceRequirement;

  toggleExpanded(): void {
    this.manuallyExpanded.update((value) => !value);
  }

  toggleUlbExpanded(): void {
    this.ulbManuallyExpanded.update((value) => !value);
  }
}
