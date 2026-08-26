import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AmountDisplayModeService } from '../../../core/services/amount-display-mode.service';
import type { InrFormat } from '../../../core/pipes/inr-format.pipe';

interface AmountDisplayOption {
  value: InrFormat | null;
  label: string;
  shortKey: string;
}

const AMOUNT_DISPLAY_OPTIONS: readonly AmountDisplayOption[] = [
  { value: 'cr', label: 'Crore', shortKey: 'Cr' },
  { value: 'lakh', label: 'Lakh', shortKey: 'L' },
  { value: 'k', label: 'Thousand (K)', shortKey: 'K' },
  { value: 'inr', label: 'Rupees', shortKey: '₹' },
];

/**
 * Global control over `AmountDisplayModeService`'s override — one shared setting. Placing this on a
 * page doesn't scope the effect to that page; a change here is visible on every page reading through
 * the service, including ones this component hasn't been added to yet.
 *
 * The 4 pills only ever set a concrete unit (`'cr' | 'lakh' | 'k' | 'inr'`) — none of them can get
 * `override` back to `null` ("no override, defer to each page's own default"). That's the separate
 * reset icon button in the template (`onChange(null)`), not a labeled "Default"/"Auto" pill.
 */
@Component({
  selector: 'app-amount-display-toggle',
  imports: [MatButtonModule, MatTooltipModule],
  templateUrl: './amount-display-toggle.component.html',
  styleUrl: './amount-display-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountDisplayToggleComponent {
  private readonly amountDisplay = inject(AmountDisplayModeService);

  readonly options = AMOUNT_DISPLAY_OPTIONS;
  readonly override = this.amountDisplay.override;

  onChange(value: InrFormat | null): void {
    this.amountDisplay.setOverride(value);
  }
}
