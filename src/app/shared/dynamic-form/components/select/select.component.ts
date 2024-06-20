import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
import { MaterialModule } from '../../../../material.module';
@Component({
  selector: "app-select",
  standalone: true,
  imports: [MaterialModule],
  template: `
    <label class="fw-bold" *ngIf="displayLabel && !displayInlineLabel">{{field.position ? field.position+'. ':''}}{{field.label}}
      <span class="text-danger" *ngIf="field.required">*&nbsp;</span>
    </label>
    <mat-form-field appearance="outline" class="demo-full-width mt-2" [formGroup]="group">
    <mat-label *ngIf="displayInlineLabel">{{field.label}}</mat-label>
    	<mat-select [formControlName]="field.key" [multiple]="field.multiple"
      placeholder="Select an Option" panelClass="example-panel-blue">
    		<!-- <mat-option value="">Select an Option</mat-option> -->
         @if(parentField?.options) {
          @for (item of parentField?.options; track $index; let last = $last) {
            <mat-option [value]="item">{{item}}</mat-option>
            <mat-divider *ngIf="!last"></mat-divider>
          }
         } @else {
          @for (item of field.options; track $index; let last = $last) {
            <mat-option [value]="item">{{item}}</mat-option>
            <mat-divider *ngIf="!last"></mat-divider>
          }
         }
        
    	</mat-select>
    	<ng-container *ngFor="let validation of this.validations;" ngProjectAs="mat-error">
    		<mat-error *ngIf="hasError(field.key, validation.name)">{{validation.message}}</mat-error>
    	</ng-container>
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

  constructor() { }
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
    return (this.group.get(key) as FormControl).hasError(name)
  }
}
