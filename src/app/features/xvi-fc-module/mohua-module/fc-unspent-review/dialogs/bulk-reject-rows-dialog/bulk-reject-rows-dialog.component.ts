import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FcUnspentMohuaRow } from '../../fc-unspent-review.models';
import { FcUnspentMohuaReviewService } from '../../fc-unspent-review.service';
import { collectAllErrors, extractApiErrorResponse, matchIndexedRowsField } from '../../fc-unspent-review.utils';

export interface BulkRejectRowsDialogData {
  stateId: string;
  yearId: string;
  rows: FcUnspentMohuaRow[];
}

type RejectRowFormGroup = FormGroup<{
  rowId: FormControl<string>;
  rejectionRemark: FormControl<string>;
}>;

/**
 * Self-contained bulk-reject dialog: one required `rejectionRemark` per selected row. Calls
 * `POST rows/reject` itself and stays open on failure, mapping indexed backend errors
 * (`rows.<i>.rejectionRemark` / `rows.<i>.rowId`, matched via each error's own `field`) back onto
 * the corresponding row control without losing any already-typed remarks.
 */
@Component({
  selector: 'app-bulk-reject-rows-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './bulk-reject-rows-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkRejectRowsDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FcUnspentMohuaReviewService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<BulkRejectRowsDialogComponent, boolean>);
  readonly data = inject<BulkRejectRowsDialogData>(MAT_DIALOG_DATA);

  readonly rows = this.data.rows;
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    rows: this.fb.array(
      this.rows.map((row) =>
        this.fb.group({
          rowId: this.fb.control(row._id, { nonNullable: true }),
          rejectionRemark: this.fb.control('', { nonNullable: true }),
        }),
      ),
    ),
  });

  get rowsArray(): FormArray<RejectRowFormGroup> {
    return this.form.get('rows') as FormArray<RejectRowFormGroup>;
  }

  rowGroupAt(index: number): RejectRowFormGroup {
    return this.rowsArray.at(index);
  }

  isRemarkMissing(index: number): boolean {
    return this.submitted() && !this.rowGroupAt(index).controls.rejectionRemark.value.trim();
  }

  onRemarkInput(index: number): void {
    const control = this.rowGroupAt(index).controls.rejectionRemark;
    if (control.errors?.['apiError']) control.setErrors(null);
  }

  submit(): void {
    if (this.isSubmitting()) return;
    this.submitted.set(true);

    const rows = this.rowsArray.controls.map((group) => ({
      rowId: group.controls.rowId.value,
      rejectionRemark: group.controls.rejectionRemark.value.trim(),
    }));

    if (rows.some((r) => !r.rejectionRemark)) return;

    // Defensive de-dupe: the opener guarantees unique rowIds, but never send duplicates regardless.
    const uniqueRows = Array.from(new Map(rows.map((r) => [r.rowId, r])).values());

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.service
      .bulkRejectRows({ stateId: this.data.stateId, yearId: this.data.yearId, rows: uniqueRows })
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
      this.formError.set(response?.message ?? 'Unable to reject the selected rows. Please try again.');
      return;
    }

    const unrouted: string[] = [];
    for (const error of all) {
      const remarkIndex = matchIndexedRowsField(error.field, 'rejectionRemark');
      const rowIdIndex = matchIndexedRowsField(error.field, 'rowId');
      const index = remarkIndex ?? rowIdIndex;

      if (index !== null && this.rowsArray.at(index)) {
        const control =
          remarkIndex !== null ? this.rowGroupAt(index).controls.rejectionRemark : this.rowGroupAt(index).controls.rowId;
        control.setErrors({ apiError: error.message });
        control.markAsTouched();
        continue;
      }
      unrouted.push(error.message);
    }
    if (unrouted.length) this.formError.set(unrouted.join(' '));
  }
}
