import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';

export interface ClaimLetterSummaryTile {
  label: string;
  value: number;
  /** Highlights the one figure the page is about (e.g. "Available to Claim"). */
  emphasized?: boolean;
}

/** Stat-tile row; the list, create and detail pages each pass their own tiles. */
@Component({
  selector: 'app-claim-letter-summary-tiles',
  templateUrl: './claim-letter-summary-tiles.component.html',
  styleUrl: './claim-letter-summary-tiles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterSummaryTilesComponent {
  readonly tiles = input.required<readonly ClaimLetterSummaryTile[]>();

  private readonly amountDisplay = inject(AmountDisplayModeService);
  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'auto');
}
