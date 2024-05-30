import { Component, Input } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
import { MaterialModule } from '../../../../material.module';
import { DecimalLimitDirective } from "../../../../features/xvi-fc/directives/decimal-limit.directive";
@Component({
  selector: "app-input",
  standalone: true,
  imports: [MaterialModule, DecimalLimitDirective],
  templateUrl: './input.component.html',
})
export class InputComponent {
  className: string = "box1";
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() item!: FormGroup;

  // textualFormFiledTypes: string[] = ['text', 'url', 'email', 'number'];

  constructor() { }
  ngOnInit() {
    // console.log('----field in --',this.field);
    // console.log('----group in --',this.group);
  }
  getValue(name: string) {
    // console.log('name', name);
    // return this.group.value.get(name).value;
    // return this.group.value.get(name) ? this.group.value.get(name).value : '';
  }
}
