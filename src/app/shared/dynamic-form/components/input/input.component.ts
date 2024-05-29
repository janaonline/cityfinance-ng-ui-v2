import { Component, Input } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
import { MaterialModule } from '../../../../material.module';
@Component({
  selector: "app-input",
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './input.component.html',

})
export class InputComponent {
  className: string = "box1";
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() item!: FormGroup;

  textualFormFiledTypes: string[] = ['text', 'url', 'email', 'number'];

  constructor() { }
  ngOnInit() {
    console.log('----group in --', this.item.value);

  }
}
