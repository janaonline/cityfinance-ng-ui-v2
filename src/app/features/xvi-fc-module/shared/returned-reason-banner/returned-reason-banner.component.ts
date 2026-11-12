import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FORM_STATUS } from '../../common/constants/form-status.constants';

/** Statuses at which the form is back with the State: returned by PMU, the SO or MoHUA. */
const RETURNED_STATUSES: readonly number[] = [
  FORM_STATUS.RETURNED_BY_PMU,
  FORM_STATUS.RETURNED_BY_MOHUA,
  FORM_STATUS.RETURNED_BY_SO,
];

@Component({
  selector: 'app-returned-reason-banner',
  standalone: true,
  templateUrl: './returned-reason-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnedReasonBannerComponent {
  readonly currentFormStatus = input<number | null>(null);
  /** The latest return's reason, whoever returned it; only shown while the form is returned. */
  readonly rejectionRemarks = input<string | null>(null);

  readonly reason = computed(() =>
    RETURNED_STATUSES.includes(this.currentFormStatus() ?? -1) ? this.rejectionRemarks() : null,
  );
}
