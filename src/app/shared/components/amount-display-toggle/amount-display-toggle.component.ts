import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AmountDisplayModeService } from '../../../core/services/amount-display-mode.service';
import type { InrFormat } from '../../../core/pipes/inr-format.pipe';
import { MaterialModule } from '../../../material.module';

interface AmountDisplayOption {
  value: InrFormat | null;
  label: string;
}

const AMOUNT_DISPLAY_OPTIONS: readonly AmountDisplayOption[] = [
  { value: null, label: 'Default' },
  { value: 'cr', label: 'Crore' },
  { value: 'lakh', label: 'Lakh' },
  { value: 'k', label: 'Thousand (K)' },
  { value: 'inr', label: 'Rupees' },
];

/**
 * Global control over `AmountDisplayModeService`'s override — one shared setting. Placing this on a
 * page doesn't scope the effect to that page; a change here is visible on every page reading through
 * the service, including ones this component hasn't been added to yet.
 */
@Component({
  selector: 'app-amount-display-toggle',
  imports: [MaterialModule],
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
