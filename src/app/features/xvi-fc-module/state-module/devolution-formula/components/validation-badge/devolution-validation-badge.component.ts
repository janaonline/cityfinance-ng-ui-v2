import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { DfRowValidationStatus } from '../../devolution-formula.models';

@Component({
  selector: 'span[app-df-validation-badge]',
  template: `{{ validationStatus === 'VALID' ? 'Valid' : 'Invalid' }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevolutionValidationBadgeComponent {
  @Input({ required: true }) validationStatus!: DfRowValidationStatus;

  @HostBinding('class.text-bg-success')
  get isValid(): boolean {
    return this.validationStatus === 'VALID';
  }

  @HostBinding('class.text-bg-danger')
  get isInvalid(): boolean {
    return this.validationStatus !== 'VALID';
  }
}
