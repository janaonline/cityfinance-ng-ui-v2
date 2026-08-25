import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';

export interface ClaimLetterSummaryTile {
  label: string;
  value: number;
  /** Renders this tile with visual emphasis (larger value, accent border) — for the one figure that
   *  most directly answers "can I act right now" on a given page (e.g. "Available to Claim"), so a
   *  row of otherwise-equal tiles doesn't bury the number a user is most likely scanning for. */
  emphasized?: boolean;
}

/** Small, reusable stat-tile row for the claim-letter feature's financial summary — used on the
 *  list ("Generate Claim Letter"), create ("New Claim Letter"), and detail ("Batch #n") pages with
 *  a different tile set on each, per the summary-placement plan (each page only shows the figures
 *  that make sense for it). */
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
