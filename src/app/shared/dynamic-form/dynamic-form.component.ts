import {
  Component,
  Input,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { FieldConfig } from "./field.interface";
import { ButtonComponent } from "./components/button/button.component";
import { CheckboxComponent } from "./components/checkbox/checkbox.component";
import { ChildFormComponent } from "./components/child-form/child-form.component";
import { DateComponent } from "./components/date/date.component";
import { InputComponent } from "./components/input/input.component";
import { RadiobuttonComponent } from "./components/radiobutton/radiobutton.component";
import { SelectComponent } from "./components/select/select.component";
import { TableComponent } from "./components/table/table.component";
import { MaterialModule } from "../../material.module";

@Component({
  // exportAs: "dynamicForm",
  // selector: "dynamic-form",
  selector: 'app-dynamic-form',
  standalone: true,
  templateUrl: './dynamic-form.component.html',
  imports: [
    // DynamicFieldDirective,
    MaterialModule,

    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    ChildFormComponent,
    TableComponent
  ],
  // styles: []
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent {

  // @Input() field!: FieldConfig;
  @Input() field!: any;
  @Input() group!: FormGroup;
  @Input() formArray!: FormArray;

  formFieldType!: string;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // console.log('group---',this.group);
    // console.log('group---', this.group.value.get('formFieldType').value);
    // const formFieldType = this.group.value.get('formFieldType').value;
    this.formFieldType = ['text', 'url', 'email', 'number','amount'].includes(this.field.formFieldType) ? 'input' : this.field.formFieldType;
  }

}
