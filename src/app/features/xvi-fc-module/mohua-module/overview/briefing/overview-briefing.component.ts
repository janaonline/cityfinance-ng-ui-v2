import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ClaimLettersOverview, formatRupeesInCrore } from '../../claims-submission/claims-submission.models';
import { CountUpDirective, RevealDirective } from '../../state-detail/state-detail.directives';
import { OverviewTotals, StateRow, StateStatus, formatCrore } from '../overview.models';

type DotKind = 'review' | 'progress' | 'other';

interface StatButton {
  status: StateStatus;
  label: string;
  count: number;
  dot: string;
}

/** Dark briefing band: allocation on the left, how many states are moving towards a claim on the right. */
@Component({
  selector: 'app-ov-briefing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountUpDirective, RevealDirective, MatCardModule],
  templateUrl: './overview-briefing.component.html',
  styleUrl: './overview-briefing.component.scss',
})
export class OverviewBriefingComponent {
  readonly rows = input.required<StateRow[]>();
  readonly totals = input.required<OverviewTotals>();
  /** National claim-letter figures; null shows the claim tiles as "Coming soon". */
  readonly claims = input<ClaimLettersOverview | null>(null);
  /** Emits when a status button is pressed, so the page can filter the states section. */
  readonly statusPick = output<StateStatus>();

  readonly formatCrore = formatCrore;

  /** Claim letters by stage: under SO review (15), returned (16/6), approved (5/7). `value` is null until loaded. */
  readonly claimTiles = computed(() => {
    const c = this.claims();
    const tile = (label: string, icon: string, stage: ClaimLettersOverview['underReview'] | undefined) => ({
      label,
      icon,
      value: stage ? `${stage.claims} ${stage.claims === 1 ? 'claim' : 'claims'}` : null,
      sub: stage ? `${formatRupeesInCrore(stage.amount)} · ${stage.states} ${stage.states === 1 ? 'state' : 'states'}` : '',
    });
    return [
      tile('Under review by MoHUA', 'bi-hourglass-split', c?.underReview),
      tile('Returned', 'bi-arrow-return-left', c?.returned),
      tile('Approved', 'bi-shield-check', c?.approved),
    ];
  });

  /** Later stages of a state's journey that have no data yet — shown as "Coming soon" cards beside the status counts. */
  readonly upcomingStages = ['Recommended to DoE', 'Released by DoE'];

  private readonly counts = computed(() => {
    const counts: Record<StateStatus, number> = { review: 0, progress: 0, notStarted: 0 };
    for (const row of this.rows()) counts[row.status]++;
    return counts;
  });

  readonly total = computed(() => this.rows().length);
  readonly moving = computed(() => this.counts().review + this.counts().progress);

  readonly dots = computed<DotKind[]>(() => {
    const order: StateStatus[] = ['review', 'progress', 'notStarted'];
    return [...this.rows()]
      .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
      .map((r): DotKind => (r.status === 'review' ? 'review' : r.status === 'progress' ? 'progress' : 'other'));
  });

  readonly buttons = computed<StatButton[]>(() => [
    { status: 'review', label: 'Under Review by MoHUA', count: this.counts().review, dot: 'review' },
    { status: 'progress', label: 'In Progress', count: this.counts().progress, dot: 'progress' },
    { status: 'notStarted', label: 'Not Started', count: this.counts().notStarted, dot: 'other' },
  ]);

  text(value: number): string {
    return String(value);
  }
}
