import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { EulbRowValidationStatus } from '../../eulb-status.models';
import { getEulbValidationStatusLabel } from '../../shared/eulb-row-edit.utils';

@Component({
  selector: 'span[app-eulb-validation-badge]',
  template: `{{ label }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EulbValidationBadgeComponent {
  @Input({ required: true }) validationStatus!: EulbRowValidationStatus;

  @HostBinding('class.text-bg-success')
  get isValid(): boolean {
    return this.validationStatus === 'VALID';
  }

  @HostBinding('class.text-bg-danger')
  get isInvalid(): boolean {
    return this.validationStatus !== 'VALID';
  }

  get label(): string {
    return getEulbValidationStatusLabel(this.validationStatus);
  }
}
