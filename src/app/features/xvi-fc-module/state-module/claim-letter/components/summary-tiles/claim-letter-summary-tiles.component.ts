import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';
import { CLAIM_LETTER_INSTALLMENT, ClaimLetterInstallment } from '../../claim-letter.models';

export interface ClaimLetterSummaryTile {
  label: string;
  value: number;
  /** Highlights the one figure the page is about (e.g. "Balance Available for Claim"). */
  emphasized?: boolean;
}

const INSTALLMENT_ORDINAL: Record<ClaimLetterInstallment, string> = { 1: '1st', 2: '2nd' };

/** Tile labels shared by the list and detail pages. */
export const CLAIM_LETTER_TILE_LABELS = {
  available: 'Balance Available for Claim',
  total: `Total Allocation for ${INSTALLMENT_ORDINAL[CLAIM_LETTER_INSTALLMENT]} Installment`,
  underReview: 'Claims Under Review by MoHUA',
  draft: 'Claims in Draft',
} as const;

/** Acknowledged batches are still with MoHUA for the State, so the tile adds them in. */
export function claimsUnderReviewTotal(s: { totalAlreadyAcknowledged: number; totalClaimInProgress: number }): number {
  return s.totalAlreadyAcknowledged + s.totalClaimInProgress;
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
