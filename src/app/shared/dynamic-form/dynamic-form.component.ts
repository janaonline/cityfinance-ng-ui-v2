import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { ButtonComponent } from './components/button/button.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { ChildFormComponent } from './components/child-form/child-form.component';
import { DateComponent } from './components/date/date.component';
import { DynamicFieldSupportingContentComponent } from './components/field-supporting-content/field-supporting-content.component';
import { FileComponent } from './components/file/file.component';
import { InputCardComponent } from './components/input-card/input-card.component';
import { InputComponent } from './components/input/input.component';
import { RadiobuttonComponent } from './components/radiobutton/radiobutton.component';
import { SelectComponent } from './components/select/select.component';
import { TableComponent } from './components/table/table.component';
import { TextareaComponent } from './components/textarea/textarea.component';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  imports: [
    NgTemplateOutlet,
    MaterialModule,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    ChildFormComponent,
    TableComponent,
    FileComponent,
    InputCardComponent,
    TextareaComponent,
    DynamicFieldSupportingContentComponent,
  ],
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent implements OnInit, OnChanges {
  // @Input() field!: FieldConfig;
  @Input() field!: any;
  @Input() group!: FormGroup;
  @Input() formArray!: FormArray;

  formFieldType!: string;
  fieldForRenderer!: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formFieldType = this.resolveFormFieldType();
    this.fieldForRenderer = this.buildFieldForRenderer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field']) {
      this.formFieldType = this.resolveFormFieldType();
      this.fieldForRenderer = this.buildFieldForRenderer();
    }
  }

  get isInlineLayout(): boolean {
    return this.field?.layout?.variant === 'inline';
  }

  get labelColClass(): string {
    const map: Record<string, string> = { sm: 'col-md-3', md: 'col-md-4', lg: 'col-md-5' };
    return map[this.field?.layout?.labelWidth ?? 'md'] ?? 'col-md-4';
  }

  get controlColClass(): string {
    const map: Record<string, string> = { sm: 'col-md-9', md: 'col-md-8', lg: 'col-md-7' };
    return map[this.field?.layout?.labelWidth ?? 'md'] ?? 'col-md-8';
  }

  private resolveFormFieldType(): string {
    return ['text', 'url', 'email', 'number', 'amount'].includes(this.field?.formFieldType)
      ? 'input'
      : this.field?.formFieldType;
  }

  private buildFieldForRenderer(): any {
    return this.isInlineLayout ? { ...this.field, hideLabel: true } : this.field;
  }
}
