import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CountUpDirective, RevealDirective } from '../../state-detail/state-detail.directives';
import { OVERVIEW_FIGURES, formatCrore } from '../overview.placeholder';
import { StateRow, StateStatus } from '../overview-states.placeholder';

interface ClaimTile {
  label: string;
  icon: string;
  amount: number;
  claims: string;
  note: string;
  needsAction: boolean;
}

type DotKind = 'review' | 'progress' | 'other';

interface StatButton {
  status: StateStatus;
  label: string;
  count: number;
  dot: string;
}

const CLAIMS = OVERVIEW_FIGURES.claims;

/** Dark briefing band: allocation and claim totals on the left, how many states are moving towards a claim on the right. */
@Component({
  selector: 'app-ov-briefing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountUpDirective, RevealDirective, MatCardModule, MatChipsModule],
  templateUrl: './overview-briefing.component.html',
  styleUrl: './overview-briefing.component.scss',
})
export class OverviewBriefingComponent {
  readonly rows = input.required<StateRow[]>();
  /** Emits when a status button is pressed, so the page can filter the states section. */
  readonly statusPick = output<StateStatus>();

  readonly figures = OVERVIEW_FIGURES;
  readonly formatCrore = formatCrore;

  readonly tiles: ClaimTile[] = [
    { label: 'Under review', icon: 'bi-hourglass-split', amount: CLAIMS.underReview.amount, claims: `${CLAIMS.underReview.count} claims`, note: 'Awaiting a MoHUA decision', needsAction: true },
    { label: 'Returned', icon: 'bi-arrow-return-left', amount: CLAIMS.returned.amount, claims: `${CLAIMS.returned.count} claim`, note: 'To be fixed and resubmitted', needsAction: false },
    { label: 'Approved', icon: 'bi-shield-check', amount: CLAIMS.approved.amount, claims: `${CLAIMS.approved.count} claims`, note: 'Approved by MoHUA', needsAction: true },
  ];

  private readonly counts = computed(() => {
    const counts: Record<StateStatus, number> = { review: 0, progress: 0, notStarted: 0, ineligible: 0 };
    for (const row of this.rows()) counts[row.status]++;
    return counts;
  });

  readonly total = computed(() => this.rows().length);
  readonly moving = computed(() => this.counts().review + this.counts().progress);

  readonly dots = computed<DotKind[]>(() => {
    const order: StateStatus[] = ['review', 'progress', 'notStarted', 'ineligible'];
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
