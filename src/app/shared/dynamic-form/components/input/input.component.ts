import { Component, Input } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
import { MaterialModule } from '../../../../material.module';
@Component({
  selector: "app-input",
  standalone: true,
  imports: [MaterialModule],
  template: `
    <mat-form-field class="demo-full-width margin-top" [formGroup]="group">
    	<mat-label>{{field.label}}</mat-label>
    	<input matInput [formControlName]="field.name" [placeholder]="field.label" [type]="field.inputType">
    		<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
    			<mat-error *ngIf="group.get(field.name)?.hasError(validation.name)">{{validation.message}}</mat-error>
    		</ng-container>
    	</mat-form-field>`,

})
export class InputComponent {
  className: string = "box1";
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  constructor() { }
  ngOnInit() { }
}
