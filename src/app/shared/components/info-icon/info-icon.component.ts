import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

/** Default text is the one message this component was introduced for — every amount input in the
 *  xvi-fc-module forms expects a whole Rupee figure — but any caller can override it for reuse. */
export const WHOLE_NUMBER_INFO_TEXT = 'The amount filled by user must be whole number.';

/**
 * Small reusable info icon with a `matTooltip`. Intended for a column header/label that needs a
 * quick explanatory note (e.g. next to an editable amount input) without a full help panel.
 */
@Component({
  selector: 'app-info-icon',
  imports: [MatTooltipModule],
  template: `
    <i
      class="bi bi-info-circle"
      [matTooltip]="text"
      matTooltipPosition="above"
      tabindex="0"
      [attr.aria-label]="text"
    ></i>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoIconComponent {
  @Input() text: string = WHOLE_NUMBER_INFO_TEXT;
}
