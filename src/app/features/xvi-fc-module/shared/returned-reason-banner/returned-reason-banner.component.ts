import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FORM_STATUS } from '../../common/constants/form-status.constants';

@Component({
  selector: 'app-returned-reason-banner',
  standalone: true,
  templateUrl: './returned-reason-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnedReasonBannerComponent {
  readonly currentFormStatus = input<number | null>(null);
  readonly pmuRemarks = input<string | null>(null);
  readonly mohuaRemarks = input<string | null>(null);

  readonly reason = computed(() => {
    switch (this.currentFormStatus()) {
      case FORM_STATUS.RETURNED_BY_PMU:
        return this.pmuRemarks();
      case FORM_STATUS.RETURNED_BY_MOHUA:
        return this.mohuaRemarks();
      default:
        return null;
    }
  });
}
