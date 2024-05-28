import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { formJson } from './formJson';
import { MaterialModule } from '../../material.module';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ 
    // CommonModule,
    // FormsModule,
    // ReactiveFormsModule, 
    DynamicFormComponent, 
    MaterialModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {

  fields: FieldConfig[] = formJson;

  // @Input() fields: FieldConfig[] = [];
  form!: FormGroup;
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  @Output() childFG: EventEmitter<any> = new EventEmitter<any>();
  //form: FormGroup;

  get value() {
    return this.form.value;
  }
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.createControl(this.fields);
    this.form.valueChanges.subscribe(x => {
      this.submit.emit(x);
      // this.childFG.emit(this.form);
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  createControl(fields: any[]) {
    console.log("fields", fields)
    const group = this.fb.group({});
    fields.forEach((field: { type: string; formArrays: any[]; name: string; value: any; validations: any; }) => {
      if (field.type === "button") return;
      if (field.type === "childform") {
        let items: any[] = [];
        field.formArrays.forEach((fields: any) => {
          items.push(this.createControl(fields));
        });
        let controlArray = this.fb.array(items);
        group.addControl(field.name, controlArray);
      } else {
        const control = this.fb.control(
          field.value,
          this.bindValidations(field.validations || [])
        );
        group.addControl(field.name, control);
      }
    });
    console.log(group);
    return group;
  }

  bindValidations(validations: any) {
    if (validations.length > 0) {
      const validList: any[] = [];
      validations.forEach((valid: { validator: any; }) => {
        validList.push(valid.validator);
      });
      return Validators.compose(validList);
    }
    return null;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // submit(value: any) { }

}
