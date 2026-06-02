import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import {
  formatDateForValidationMessage,
  normalizeDateValue,
} from '../../../../core/validators/date-range.validator';
import { FieldConfig, Validator } from '../../field.interface';
import { UTC_ISO_DATE_FORMATS, UtcIsoDateAdapter } from './utc-iso-date-adapter';

type DateValidationMessage = Pick<Validator, 'name' | 'message'>;
type DateConstraintKey = 'minDate' | 'maxDate';

@Component({
  selector: 'app-date',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  template: `
    <label [for]="field.key" class="fw-bold">{{ field.label }}</label>

    <mat-form-field class="margin-top" [appearance]="appearance" [formGroup]="group">
      <input
        [id]="field.key"
        matInput
        [matDatepicker]="picker"
        [formControlName]="field.key"
        [readonly]="isReadonly"
        [min]="minDate"
        [max]="maxDate"
      />

      <mat-datepicker-toggle
        matSuffix
        [for]="picker"
        [disabled]="isReadonly"
      ></mat-datepicker-toggle>

      <mat-datepicker
        #picker
        [panelClass]="materialThemeClass"
        [disabled]="isReadonly"
      ></mat-datepicker>

      <!-- <mat-hint></mat-hint> -->

      @for (validation of activeErrors; track validation.name) {
        <mat-error>{{ validation.message }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [],
  providers: [
    { provide: DateAdapter, useClass: UtcIsoDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: UTC_ISO_DATE_FORMATS },
  ],
})
export class DateComponent implements OnChanges {
  readonly materialThemeClass: string | string[] =
    inject(MATERIAL_THEME_CLASS, { optional: true }) ?? '';

  @Input({ required: true }) field!: FieldConfig;
  @Input({ required: true }) group!: FormGroup;

  minDate: Date | null = null;
  maxDate: Date | null = null;
  validationMessages: DateValidationMessage[] = [];

  /** Recompute derived field config when the input metadata changes. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field']) {
      this.minDate = this.resolveDateConstraint('minDate');
      this.maxDate = this.resolveDateConstraint('maxDate');
      this.validationMessages = this.buildValidationMessages();
    }
  }

  get control(): AbstractControl | null {
    return this.group?.get(this.field?.key) ?? null;
  }

  get isReadonly(): boolean {
    return !!this.field?.readonly;
  }

  get appearance(): MatFormFieldAppearance {
    return this.isReadonly ? 'fill' : 'outline';
  }

  get activeErrors(): DateValidationMessage[] {
    const control = this.control;
    if (!control) {
      return [];
    }

    return this.validationMessages.filter(({ name }) => this.hasError(control, name));
  }

  /** Builds default parse/min/max messages when they are not provided in config. */
  private buildValidationMessages(): DateValidationMessage[] {
    const messages = (this.field.validations ?? []).map(({ name, message }) => ({
      name,
      message,
    }));

    const names = new Set(messages.map(({ name }) => name));
    const minDateLabel = formatDateForValidationMessage(this.minDate);
    const maxDateLabel = formatDateForValidationMessage(this.maxDate);

    if (!names.has('matDatepickerParse')) {
      messages.unshift({
        name: 'matDatepickerParse',
        message: 'Enter a valid date.',
      });
    }

    if (this.minDate && !names.has('minDate')) {
      messages.push({
        name: 'minDate',
        message: minDateLabel
          ? `Date must be on or after ${minDateLabel}.`
          : 'Date is earlier than the allowed minimum.',
      });
    }

    if (this.maxDate && !names.has('maxDate')) {
      messages.push({
        name: 'maxDate',
        message: maxDateLabel
          ? `Date must be on or before ${maxDateLabel}.`
          : 'Date is later than the allowed maximum.',
      });
    }

    return messages;
  }

  /** Resolves a date boundary from direct field config or validation fallback config. */
  private resolveDateConstraint(key: DateConstraintKey): Date | null {
    const validation = this.field.validations?.find(({ name }) => name === key);
    return normalizeDateValue(this.field[key] ?? validation?.validator);
  }

  /** Normalizes custom and Angular Material error keys for the same validation rule. */
  private hasError(control: AbstractControl, name: string): boolean {
    if (name === 'minDate') {
      return control.hasError('minDate') || control.hasError('matDatepickerMin');
    }

    if (name === 'maxDate') {
      return control.hasError('maxDate') || control.hasError('matDatepickerMax');
    }

    return control.hasError(name);
  }
}
