import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MaterialModule } from '../../../../material.module';
import { FieldConfig } from '../../field.interface';

@Component({
  selector: 'app-radiobutton',
  imports: [MaterialModule],
  template: `
    <fieldset class="radio-field" [formGroup]="group">
      @if (field.label && !field.hideLabel) {
        <legend class="radio-field__label fw-semibold custom-font-size-6">
          {{ field.position ? field.position + '. ' : '' }}{{ field.label }}
        </legend>
      }

      <mat-radio-group
        class="radio-field__group"
        [class.radio-field__group--vertical]="field.radioLayout === 'vertical'"
        [class.radio-field__group--horizontal]="field.radioLayout !== 'vertical'"
        [formControlName]="field.key"
        [attr.data-cy]="field.key ? field.key + '-test' : null"
      >
        @for (opt of options; track opt.id || opt) {
          <mat-radio-button
            [value]="opt.id || opt"
            color="primary"
            [attr.data-cy]="field.key && opt.id ? field.key + '-' + opt.id + '-test' : null"
          >
            {{ opt.label || opt }}
          </mat-radio-button>
        }
      </mat-radio-group>

      @for (validation of field.validations ?? []; track validation.name) {
        @if (hasError(field.key, validation.name)) {
          <div class="text-danger small mt-1" role="alert" [attr.data-cy]="field.key + '-error-test'">
            {{ validation.message }}
          </div>
        }
      }
    </fieldset>
  `,
  styles: `
    .radio-field {
      border: 0;
      margin: 0;
      padding: 0;
    }

    .radio-field__label {
      display: block;
      margin-bottom: 0.5rem;
    }

    .radio-field__group {
      width: 100%;
    }

    .radio-field__group--horizontal {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }

    .radio-field__group--vertical {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
  `,
})
export class RadiobuttonComponent implements OnInit {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() item!: FormGroup;
  @Input() options!: any[];

  ngOnInit(): void {
    this.options = this.options || this.field.options || [];
  }

  hasError(key: string, name: string): boolean {
    const control = this.group.get(key) as FormControl | null;

    if (!control) {
      return false;
    }

    return control.hasError(name) && (control.touched || control.dirty);
  }
}
