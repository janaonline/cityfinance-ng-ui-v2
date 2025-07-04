import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
@Component({
    selector: 'app-date',
    imports: [MaterialModule],
    template: `
    <!-- <mat-form-field class="demo-full-width margin-top" [formGroup]="group">
    	<input matInput [matDatepicker]="picker" [formControlName]="field.name" [placeholder]="field.label">
    		<mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
    		<mat-datepicker #picker></mat-datepicker>
    		<mat-hint></mat-hint>
    		<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
    			<mat-error *ngIf="group.get(field.name)?.hasError(validation.name)">{{validation.message}}</mat-error>
    		</ng-container>
    	</mat-form-field> -->
    <mat-form-field class="demo-full-width margin-top" [formGroup]="group">
      <mat-label>{{ field.label }}</mat-label>
      <input matInput [matDatepicker]="picker" [formControlName]="field.key" />
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
      <mat-hint></mat-hint>
      <!-- <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
    			<mat-error *ngIf="group.get(field.name)?.hasError(validation.name)">{{validation.message}}</mat-error>
    		</ng-container> -->
    </mat-form-field>
  `,
    styles: []
})
export class DateComponent implements OnInit {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  constructor() {}
  ngOnInit() {}
}
