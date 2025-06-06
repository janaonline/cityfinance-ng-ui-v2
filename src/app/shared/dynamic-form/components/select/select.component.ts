import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
@Component({
    selector: 'app-select',
    imports: [MaterialModule],
    template: ` @if (displayLabel && !displayInlineLabel) {
  <label class="fw-bold"
    >{{ field.position ? field.position + '. ' : '' }}{{ field.label }}
    <!-- <span class="text-danger" *ngIf="field.required">*&nbsp;</span> -->
  </label>
}
<mat-form-field appearance="outline" class="demo-full-width mt-2" [formGroup]="group">
  @if (displayInlineLabel) {
    <mat-label>{{ field.label }}</mat-label>
  }
  <mat-select
    [formControlName]="field.key"
    [multiple]="field.multiple"
    placeholder="Select an Option"
    panelClass="example-panel-blue"
    [panelWidth]="parentField ? 400 : 'auto'"
    >
    <!-- <mat-option value="">Select an Option</mat-option> -->
    @if (parentField?.options) {
      @for (item of parentField?.options; track $index; let last = $last) {
        <mat-option [value]="item">{{ item }}</mat-option>
        @if (!last) {
          <mat-divider></mat-divider>
        }
      }
    } @else {
      @for (item of field.options; track $index; let last = $last) {
        <mat-option [value]="item">{{ item }}</mat-option>
        @if (!last) {
          <mat-divider></mat-divider>
        }
      }
    }
  </mat-select>
  @for (validation of this.validations; track validation) {
    <ng-container ngProjectAs="mat-error">
      @if (hasError(field.key, validation.name)) {
        <mat-error>{{ validation.message }}</mat-error>
      }
    </ng-container>
  }
</mat-form-field>
<!-- <mat-form-field class="demo-full-width margin-top" [formGroup]="group.value"><mat-label class="com-style">{{ getValue('label') }}
<span *ngIf="getValue('required')" class="text-danger">*</span><mat-icon style="font-size: 18px" *ngIf="getValue('info')" [matTooltip]="getValue('info')">info_outline
</mat-icon></mat-label><mat-select formControlName="value"><mat-option *ngFor="let opt of getValue('options')" [value]="opt">{{opt}}</mat-option></mat-select></mat-form-field> -->`,
    styles: []
})
export class SelectComponent {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() options!: any[];
  @Input() displayLabel: boolean = true;
  @Input() displayInlineLabel: boolean = false;

  @Input() parentField: any;
  validations: any[] = [];
  readonly: any = false;

  constructor() {}
  ngOnInit() {
    // console.log('----group sel --',this.group);
    this.options = this.options || this.field.options;
    // console.log('this.options---',this.options);
    this.validations = this.parentField?.validations || this.field.validations;
    this.readonly = this.parentField?.readonly || this.field?.readonly;
  }
  // getValue(name: string) {
  //   return this.group.value.get(name).value;
  // }

  hasError(key: string, name: string) {
    return (this.group.get(key) as FormControl).hasError(name);
  }
}
