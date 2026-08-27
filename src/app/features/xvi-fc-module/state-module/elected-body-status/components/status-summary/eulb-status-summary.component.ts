import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EulbStatusSummary } from '../../eulb-status.models';

export interface EulbStatusSummaryCard {
  readonly count: number;
  readonly label: string;
  readonly borderClass: string;
  readonly textClass: string;
}

/**
 * Read-only "status summary" section: a success alert plus a row of stat cards showing the
 * constituted / not-constituted / exempt (6th Schedule) ULB breakdown. Shared between the main
 * elected-body-status page and the post-submission-update page — both feed it the same
 * `EulbStatusSummary` shape, just from different endpoints. Renders nothing when `summary` is
 * `null`, so consumers can bind unconditionally.
 */
@Component({
  selector: 'app-eulb-status-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eulb-status-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EulbStatusSummaryComponent {
  readonly summary = input<EulbStatusSummary | null>(null);

  readonly cards = computed<EulbStatusSummaryCard[]>(() => {
    const summary = this.summary();
    if (!summary) return [];
    return [
      {
        count: summary.constitutedCount,
        label: 'Eligible - elected body constituted',
        borderClass: 'border-success',
        textClass: 'text-success',
      },
      {
        count: summary.notConstitutedCount,
        label: 'Ineligible - no elected body',
        borderClass: 'border-danger',
        textClass: 'text-danger',
      },
      {
        count: summary.exemptCount,
        label: '6th Schedule',
        borderClass: 'border-secondary',
        textClass: '',
      },
    ];
  });
}
