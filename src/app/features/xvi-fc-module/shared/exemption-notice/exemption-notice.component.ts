import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const DEFAULT_MESSAGE = 'your ULB is exempted from this requirement and does not need to submit anything for it.';

/**
 * Inline "this requirement doesn't apply to you" notice — styled after shared/not-eligible's
 * icon-ring pattern (same theme tokens, recolored from error to a neutral/positive tone since
 * exemption isn't a bad thing), but sized for inline placement inside a form page instead of a
 * full-page takeover.
 *
 * Reusable across any form wired into the Dynamic Year Access exemption mechanism (today: SLB
 * only — see xvi-fc-module/ulb-forms/slb). All inputs are signals with sensible defaults, so a
 * future caller can drop in `<app-exemption-notice />` with no inputs at all, pass just
 * `ulbName` for a personalized "Dear <name>," greeting ahead of the default body text, or
 * override `title`/`message` with form-specific copy.
 */
@Component({
  selector: 'app-exemption-notice',
  standalone: true,
  templateUrl: './exemption-notice.component.html',
  styleUrl: './exemption-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExemptionNoticeComponent {
  readonly title = input('Exempted');
  readonly ulbName = input('');
  readonly message = input(DEFAULT_MESSAGE);

  readonly greeting = computed(() => `Dear ${this.ulbName().trim() || 'ULB'},`);
}
