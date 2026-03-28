import { Component, Input, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import { MaterialModule } from '../../../../material.module';
import { FieldConfig } from '../../field.interface';
@Component({
  selector: 'app-date',
  imports: [MaterialModule],
  template: `
    <mat-label class="fw-bold">{{ field.label }}</mat-label>
    <mat-form-field class="demo-full-width margin-top" appearance="outline" [formGroup]="group">
      <input matInput [matDatepicker]="picker" [formControlName]="field.key" />
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker [panelClass]="materialThemeClass"></mat-datepicker>

      <mat-hint></mat-hint>

      @for (validation of field.validations; track validation.name) {
        <ng-container ngProjectAs="mat-error">
          @if (group.get(field.key)?.hasError(validation.name)) {
            <mat-error>{{ validation.message }}</mat-error>
          }
        </ng-container>
      }
    </mat-form-field>
  `,
  styles: [],
})
export class DateComponent {
  readonly materialThemeClass: string | string[] =
    inject(MATERIAL_THEME_CLASS, { optional: true }) ?? '';

  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  constructor() {}
}
