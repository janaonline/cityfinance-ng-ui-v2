import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ManualReviewQueueService } from '../../manual-review-queue.service';
import type { AnnualAccountSectionKey } from '../../manual-review-queue.models';

export interface ManualReviewDecisionDialogData {
  annualAccountId: string;
  section: AnnualAccountSectionKey;
  docId: string;
  ulbName: string | null;
  fileName: string | null;
  decision: 'APPROVED' | 'RETURNED';
}

/**
 * Self-contained approve/reject dialog for a manual-review request — calls the decision
 * endpoint itself and stays open showing the backend's error message on failure, so an
 * admin's typed note is never lost. Closes with `true` only after a confirmed successful
 * decision. The note is required for RETURNED (explaining what needs to be fixed) and
 * optional for APPROVED.
 */
@Component({
  selector: 'app-manual-review-decision-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './manual-review-decision-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualReviewDecisionDialogComponent {
  private readonly service = inject(ManualReviewQueueService);
  private readonly dialogRef = inject(MatDialogRef<ManualReviewDecisionDialogComponent, boolean>);
  readonly data = inject<ManualReviewDecisionDialogData>(MAT_DIALOG_DATA);

  readonly isReject = this.data.decision === 'RETURNED';

  readonly note = new FormControl('', { nonNullable: true });
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly showRequiredError = computed(() => this.isReject && this.submitted() && !this.note.value.trim());

  submit(): void {
    if (this.isSubmitting()) return;
    this.submitted.set(true);

    const value = this.note.value.trim();
    if (this.isReject && !value) return;

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.service
      .decide(this.data.annualAccountId, this.data.section, this.data.docId, {
        decision: this.data.decision,
        note: value || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.dialogRef.close(true);
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          const message = (err as { error?: { message?: string } })?.error?.message;
          this.formError.set(
            message ?? `Unable to ${this.isReject ? 'reject' : 'approve'} this document. Please try again.`,
          );
        },
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
