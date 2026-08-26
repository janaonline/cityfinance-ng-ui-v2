import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FcUnspentMohuaReviewService } from '../../fc-unspent-review.service';
import { collectAllErrors, extractApiErrorResponse } from '../../fc-unspent-review.utils';

export interface MohuaRemarksDialogData {
  stateId: string;
  yearId: string;
  title: string;
  description: string;
  submitLabel: string;
}

/**
 * Self-contained "Reject form" dialog for FC Unspent Declaration MoHUA review — calls
 * `POST /:stateId/:yearId/reject` (required `mohuaRemarks`) itself, staying open and showing
 * backend validation errors inline on failure so the user's typed remarks are never lost.
 * Closes with `true` only after a confirmed successful reject.
 */
@Component({
  selector: 'app-mohua-remarks-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './mohua-remarks-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MohuaRemarksDialogComponent {
  private readonly service = inject(FcUnspentMohuaReviewService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<MohuaRemarksDialogComponent, boolean>);
  readonly data = inject<MohuaRemarksDialogData>(MAT_DIALOG_DATA);

  readonly remarks = new FormControl('', { nonNullable: true });
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly submitted = signal(false);

  constructor() {
    this.remarks.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.remarks.errors?.['apiError']) return;
      const remainingErrors = { ...this.remarks.errors };
      delete remainingErrors['apiError'];
      this.remarks.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    });
  }

  /** True once Submit has been clicked and the trimmed value is still empty — drives the inline "required" message. */
  get showRequiredError(): boolean {
    return this.submitted() && !this.remarks.value.trim();
  }

  submit(): void {
    if (this.isSubmitting()) return;
    this.submitted.set(true);
    const value = this.remarks.value.trim();
    if (!value) return;

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.service
      .rejectForm(this.data.stateId, this.data.yearId, { mohuaRemarks: value })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.dialogRef.close(true);
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          this.applyErrors(err);
        },
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private applyErrors(err: unknown): void {
    const response = extractApiErrorResponse(err);
    const all = collectAllErrors(response);

    if (all.length === 0) {
      this.formError.set(response?.message ?? 'Unable to reject the form. Please try again.');
      return;
    }

    const unrouted: string[] = [];
    for (const error of all) {
      if (error.field === 'mohuaRemarks' || !error.field) {
        this.remarks.setErrors({ ...this.remarks.errors, apiError: error.message });
      } else {
        unrouted.push(error.message);
      }
    }
    if (unrouted.length) this.formError.set(unrouted.join(' '));
  }
}
