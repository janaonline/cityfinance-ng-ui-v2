import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
import { MaterialModule } from '../../../../material.module';
import { NoUpDownDirective } from "../../../../core/directives/no-up-down.directive";
import { DecimalLimitDirective } from "../../../../core/directives/decimal-limit.directive";
// import { DecimalLimitDirective } from "../../../../features/xvi-fc/directives/decimal-limit.directive";
@Component({
  selector: "app-input",
  standalone: true,
  imports: [MaterialModule,
    DecimalLimitDirective,
    NoUpDownDirective
  ],
  templateUrl: './input.component.html',
})
export class InputComponent {
  className: string = "box1";
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() displayLabel: boolean = true;
  @Input() displayInlineLabel: boolean = false;
  @Input() readonly: boolean | undefined = false;
  @Input() parentField: any;
  validations: any[] = [];

  // textualFormFiledTypes: string[] = ['text', 'url', 'email', 'number'];

  constructor() { }
  ngOnInit() {
    // console.log('----field in --',this.field);
    // console.log('----group in --',this.group);
    // this.readonly = this.field.readonly || this.readonly;
    this.readonly = this.parentField?.readonly || this.field?.readonly;
    this.validations = this.parentField?.validations || this.field?.validations;
  }
  hasError(key: string, name: string) {
    return (this.group.get(key) as FormControl).hasError(name)
  }
  getValue(name: string) {
    // console.log('name', name);
    // return this.group.value.get(name).value;
    // return this.group.value.get(name) ? this.group.value.get(name).value : '';
  }

  onKeypressNumber() {

  }

}
