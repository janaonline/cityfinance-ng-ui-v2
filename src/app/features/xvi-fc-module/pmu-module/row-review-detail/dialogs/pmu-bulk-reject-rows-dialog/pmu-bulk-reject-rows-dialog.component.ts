import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface PmuBulkRejectRowsDialogRow {
  ulbName: string;
  censusCode: string | null;
  /** Only present for FC Unspent rows — fallback display when `censusCode` is absent, same as
   *  `unspent-ulb-table.component.html`'s own Census Code column. */
  sbCode?: string | null;
}

export interface PmuBulkRejectRowsDialogData {
  /** Explicit selection mode: the actual rows about to be rejected, listed by name/census code. */
  rows?: PmuBulkRejectRowsDialogRow[];
  /** "Select all matching" mode: no individual row list is available/meaningful (could be
   *  hundreds) — show a count-based summary instead. Mutually exclusive with `rows`. */
  matchingCount?: number;
}

/**
 * Lists every selected row's census code before a bulk row-level reject finalizes — selection
 * persists across pages (`pmu-row-review-detail.component.ts`'s own `selectedRowIds`/row cache), so
 * without this the user may not be able to see every row they're about to reject. In "select all
 * matching" mode there's no per-row list to show (every row matching the filter, server-resolved at
 * submit time) — `matchingCount` renders a count-based summary instead. Closes with the trimmed
 * remarks string on confirm, `undefined` on cancel; the caller performs the actual status change.
 * Modeled on mohua-module/fc-unspent-review's `MohuaRemarksDialogComponent` shape (title +
 * description + remarks textarea + Cancel/Submit) since the generic `ConfirmDialogService` has no
 * slot for a row list or a form control.
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

  /** Title/count source — `data.rows.length` in explicit mode, `data.matchingCount` in
   *  "select all matching" mode. Exactly one of the two is ever set by the caller. */
  get rejectCount(): number {
    return this.data.matchingCount ?? this.data.rows?.length ?? 0;
  }

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
