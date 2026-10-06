import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface PmuBulkRejectRowsDialogRow {
  ulbName: string;
  censusCode: string;
}

export interface PmuBulkRejectRowsDialogData {
  rows: PmuBulkRejectRowsDialogRow[];
}

/**
 * Lists every selected row's census code before a bulk row-level reject finalizes — selection can
 * span pages (review-worklist.component's own pagination), so without this the user may not be able
 * to see every row they're about to reject. Closes with the trimmed remarks string on confirm,
 * `undefined` on cancel; the caller performs the actual status change. Modeled on
 * mohua-module/fc-unspent-review's `MohuaRemarksDialogComponent` shape (title + description +
 * remarks textarea + Cancel/Submit) since the generic `ConfirmDialogService` has no slot for a row
 * list or a form control.
 */
@Component({
  selector: 'app-pmu-bulk-reject-rows-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './pmu-bulk-reject-rows-dialog.component.html',
  styleUrl: './pmu-bulk-reject-rows-dialog.component.scss',
})
export class PmuBulkRejectRowsDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<PmuBulkRejectRowsDialogComponent, string | undefined>>(MatDialogRef);
  readonly data = inject<PmuBulkRejectRowsDialogData>(MAT_DIALOG_DATA);

  readonly remarks = new FormControl('', { nonNullable: true });
  readonly submitted = signal(false);

  /** True once Confirm has been clicked and the trimmed value is still empty — drives the inline "required" message. */
  get showRequiredError(): boolean {
    return this.submitted() && !this.remarks.value.trim();
  }

  confirm(): void {
    this.submitted.set(true);
    const value = this.remarks.value.trim();
    if (!value) return;
    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
