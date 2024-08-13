import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
import { NoUpDownDirective } from '../../../../core/directives/no-up-down.directive';
import { DecimalLimitDirective } from '../../../../core/directives/decimal-limit.directive';
import { RestrictEInputDirective } from '../../../../core/directives/restrict-e-input.directive';
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [MaterialModule, DecimalLimitDirective, NoUpDownDirective, RestrictEInputDirective],
  templateUrl: './input.component.html',
  styles: [
    `
      .warning-hint {
        display: block;
        color: orange;
      }
    `,
  ],
})
export class InputComponent {
  className: string = 'box1';
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() displayLabel: boolean = true;
  @Input() displayInlineLabel: boolean = false;
  @Input() readonly: boolean | undefined = false;
  @Input() parentField: any;
  validations: any[] = [];
  warnings: any[] = [];
  decimal: number = 0;
  // textualFormFiledTypes: string[] = ['text', 'url', 'email', 'number'];

  constructor() {}
  ngOnInit() {
    this.readonly = this.parentField?.readonly || this.field?.readonly;
    this.validations = this.parentField?.validations || this.field?.validations;
    this.decimal =
      this.parentField?.decimal || this.parentField?.decimal === 0
        ? this.parentField?.decimal
        : this.field?.decimal;
    this.warnings = this.parentField?.warning;
  }
  hasError(key: string, name: string) {
    return (this.group.get(key) as FormControl).hasError(name);
  }

  hasWarning(key: string, warning: any) {
    const errors: any = this.group.get(key)?.errors;

    if (errors && errors.length) {
      return true;
    }
    const val = parseInt(this.group.get(key)?.value);

    let res = false;
    switch (warning.condition) {
      case 'equalTo':
        res = val === warning.value;
        break;
      case 'greaterThan':
        res = val > warning.value;
        break;
    }
    return res;
  }

  onKeypressNumber() {}
}
