import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ManualReviewQueueService } from '../../manual-review-queue.service';
import type { AnnualAccountSectionKey } from '../../manual-review-queue.models';

export interface ManualReviewRejectDialogData {
  annualAccountId: string;
  section: AnnualAccountSectionKey;
  docId: string;
  ulbName: string | null;
  fileName: string | null;
}

/**
 * Self-contained "Reject manual review" dialog — calls the decision endpoint itself (RETURNED,
 * required note) and stays open showing the backend's error message on failure, so the admin's
 * typed note is never lost. Closes with `true` only after a confirmed successful reject.
 */
@Component({
  selector: 'app-manual-review-reject-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './manual-review-reject-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualReviewRejectDialogComponent {
  private readonly service = inject(ManualReviewQueueService);
  private readonly dialogRef = inject(MatDialogRef<ManualReviewRejectDialogComponent, boolean>);
  readonly data = inject<ManualReviewRejectDialogData>(MAT_DIALOG_DATA);

  readonly note = new FormControl('', { nonNullable: true });
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly submitted = signal(false);

  get showRequiredError(): boolean {
    return this.submitted() && !this.note.value.trim();
  }

  submit(): void {
    if (this.isSubmitting()) return;
    this.submitted.set(true);
    const value = this.note.value.trim();
    if (!value) return;

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.service.decide(this.data.annualAccountId, this.data.section, this.data.docId, { decision: 'RETURNED', note: value }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        const message = (err as { error?: { message?: string } })?.error?.message;
        this.formError.set(message ?? 'Unable to reject this document. Please try again.');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
