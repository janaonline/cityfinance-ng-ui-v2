import { Component, computed, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from '../../../../material.module';
import { FieldConfig } from '../../field.interface';
@Component({
  selector: 'app-checkbox',
  imports: [MaterialModule],
  template: `
    <div class="demo-full-width margin-top" [formGroup]="group">
      <mat-checkbox [formControlName]="field.key" [attr.data-cy]="field.key ? field.key + '-test' : null">{{
        !field.hideLabel ? field.label : ''
      }}</mat-checkbox>
      @for (validation of validations(); track $index) {
        <ng-container ngProjectAs="mat-error">
          @if (hasError(field.key, validation.name)) {
            <mat-error data-testid="field-error">{{ validation.message }}</mat-error>
          }
        </ng-container>
      }
    </div>
  `,
  styles: [],
})
export class CheckboxComponent {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  constructor() {}

  validations = computed(() => this.field.validations);

  hasError(key: string, name: string) {
    // Validators.requiredTrue sets error key 'required', not 'requiredTrue'
    const errorKey = name === 'requiredTrue' ? 'required' : name;
    const control = this.group.get(key) as FormControl;
    return control.touched && control.hasError(errorKey);
  }
}
