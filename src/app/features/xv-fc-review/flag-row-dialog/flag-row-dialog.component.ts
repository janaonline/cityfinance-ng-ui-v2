import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';

export interface FlagRowDialogValidation {
  min: number;
  max: number;
  decimalLimit: number;
  isRupee: boolean;
}

/** A pairwise ordering constraint against a sibling metric, e.g. "1.10 cannot be greater than 1.9". */
export interface FlagRowDialogOrderConstraint {
  type: 'max' | 'min';
  limit: number;
  otherCode: string;
}

export interface FlagRowDialogData {
  code: string;
  label: string;
  /** Existing flag state for this row, if any — `proposedValue` and `comment` are separate API fields. */
  existing: { flagged: boolean; proposedValue: number | null; comment: string | null } | null;
  /** Value constraints for the "correct value" field — Ptax metrics carry this; AFS line items don't (yet). */
  validation?: FlagRowDialogValidation | null;
  /** Cross-field ordering constraint against a sibling metric's current effective value, if any applies to this row. */
  orderConstraint?: FlagRowDialogOrderConstraint | null;
}

export type FlagRowDialogResult =
  | { code: string; proposedValue: number; comment: string }
  | 'unflag'
  | undefined;

function decimalLimitValidator(limit: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || control.value === '') return null;
    const decimals = String(control.value).split('.')[1];
    return decimals && decimals.length > limit ? { decimalLimit: { limit } } : null;
  };
}

function orderConstraintValidator(constraint: FlagRowDialogOrderConstraint): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || control.value === '') return null;
    const value = Number(control.value);
    if (constraint.type === 'max' && value > constraint.limit) {
      return { orderMax: constraint };
    }
    if (constraint.type === 'min' && value < constraint.limit) {
      return { orderMin: constraint };
    }
    return null;
  };
}

@Component({
  selector: 'app-flag-row-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './flag-row-dialog.component.html',
  styleUrl: './flag-row-dialog.component.scss',
})
export class FlagRowDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FlagRowDialogComponent, FlagRowDialogResult>);
  readonly data = inject<FlagRowDialogData>(MAT_DIALOG_DATA);

  readonly validation = this.data.validation ?? null;

  readonly orderConstraint = this.data.orderConstraint ?? null;

  private readonly correctedValueValidators = [
    Validators.required,
    ...(this.validation
      ? [
          Validators.min(this.validation.min),
          Validators.max(this.validation.max),
          decimalLimitValidator(this.validation.decimalLimit),
        ]
      : []),
    ...(this.orderConstraint ? [orderConstraintValidator(this.orderConstraint)] : []),
  ];

  form = this.fb.group({
    correctedValue: [this.data.existing?.proposedValue ?? null, this.correctedValueValidators],
    comment: [this.data.existing?.comment ?? null, Validators.required],
  });

  readonly correctedValuePlaceholder =
    this.validation && !this.validation.isRupee
      ? 'Enter the correct count'
      : 'Enter the correct amount (₹ lakhs)';

  readonly correctedValueStep = this.validation
    ? this.validation.decimalLimit > 0
      ? (1 / 10 ** this.validation.decimalLimit).toString()
      : '1'
    : 'any';

  cancel() {
    this.dialogRef.close(undefined);
  }

  unflag() {
    this.dialogRef.close('unflag');
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close({
      code: this.data.code,
      proposedValue: this.form.value.correctedValue as number,
      comment: this.form.value.comment as string,
    });
  }
}
