import { Component, input } from '@angular/core';
import { StatusSummaryCard } from './status-summary-cards.models';

/**
 * Read-only status overview cards (a heading plus one card per `StatusSummaryCard`). Role-neutral: the
 * page supplies the heading and the cards, nothing here knows about PMU/MoHUA. Deliberately not
 * interactive: no click, hover or focus behaviour.
 */
@Component({
  selector: 'app-status-summary-cards',
  standalone: true,
  templateUrl: './status-summary-cards.component.html',
  styleUrl: './status-summary-cards.component.scss',
})
export class StatusSummaryCardsComponent {
  readonly heading = input('');
  readonly cards = input.required<StatusSummaryCard[]>();
  /** Shows placeholder cards instead of numbers while the first response is on its way. */
  readonly loading = input(false);

  /** One placeholder per card (5 today), so the layout doesn't jump when data arrives. */
  readonly placeholders = [0, 1, 2, 3, 4];
}
