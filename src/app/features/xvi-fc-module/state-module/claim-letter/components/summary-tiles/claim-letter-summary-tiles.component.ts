import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { formatCrore } from '../../claim-letter.utils';

export interface ClaimLetterSummaryTile {
  label: string;
  value: number;
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

  readonly formatCrore = formatCrore;
}
