import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
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
  /** Emits when a status button is pressed, so the page can filter the states section. */
  readonly statusPick = output<StateStatus>();

  readonly formatCrore = formatCrore;

  readonly claimTiles = [
    { label: 'Under review', icon: 'bi-hourglass-split' },
    { label: 'Returned', icon: 'bi-arrow-return-left' },
    { label: 'Approved', icon: 'bi-shield-check' },
  ];

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
