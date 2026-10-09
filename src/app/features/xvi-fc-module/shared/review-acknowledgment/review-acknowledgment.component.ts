import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ConfirmDialogData,
  themedDialogConfig,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';

const DEFAULT_APPROVE_CONFIRM_DIALOG: ConfirmDialogData = {
  title: 'Approve submission?',
  message: 'Please confirm you want to approve this submission.',
  confirmText: 'Yes, approve',
  cancelText: 'No, go back',
  confirmButtonColor: 'primary',
  icon: 'bi-check-circle-fill',
};

/**
 * Generic approve/reject action bar for any reviewer role (PMU, MoHUA, ...) reviewing any of the
 * 5 state-level forms. Approve is confirmed via the same `ConfirmDialogService` pattern SFC's own
 * finalSubmit uses; reject's existing inline textarea + "Confirm Reject" button already IS the
 * confirmation gesture. Neither emits a success/failure toast itself — the parent owns the actual
 * approve/reject HTTP call and shows the real toast once its result is known (a toast fired here,
 * before that result exists, previously claimed success even when the call then failed). This
 * component only gates/confirms the user's intent and emits.
 */
@Component({
  selector: 'app-review-acknowledgment',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './review-acknowledgment.component.html',
  styleUrl: './review-acknowledgment.component.scss',
})
export class ReviewAcknowledgmentComponent {
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  /** Must be resolved in this field-initializer injection context — see themedDialogConfig's own doc. */
  private readonly dialogConfig = themedDialogConfig();

  readonly canApprove = input(false);
  readonly canReject = input(false);
  readonly busy = input(false);
  readonly approveLabel = input('Approve');
  readonly rejectLabel = input('Reject');
  readonly approveConfirmDialog = input<ConfirmDialogData>(DEFAULT_APPROVE_CONFIRM_DIALOG);

  readonly approveClicked = output<void>();
  /** Emits the trimmed remarks once the reviewer confirms the inline reject textarea. */
  readonly rejectConfirmed = output<string>();

  readonly showRejectInput = signal(false);
  readonly rejectRemarks = signal('');

  readonly canConfirmReject = computed(() => this.rejectRemarks().trim().length > 0);

  onApprove(): void {
    if (!this.canApprove() || this.busy()) return;
    this.confirmDialogService
      .confirm(this.approveConfirmDialog(), this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        // No optimistic snackbar here — the parent's own HTTP result (not yet known at this point)
        // decides success/failure and shows the real toast; an optimistic one here could claim
        // success on a call that then fails, and visually stomp the real error toast that follows.
        this.approveClicked.emit();
      });
  }

  onRejectStart(): void {
    if (!this.canReject() || this.busy()) return;
    this.showRejectInput.set(true);
  }

  onRejectCancel(): void {
    this.showRejectInput.set(false);
    this.rejectRemarks.set('');
  }

  onRejectConfirm(): void {
    const remarks = this.rejectRemarks().trim();
    if (!remarks || this.busy()) return;
    // No optimistic snackbar here — see onApprove()'s own comment; the parent's HTTP result decides
    // the real success/failure toast.
    this.rejectConfirmed.emit(remarks);
    this.showRejectInput.set(false);
    this.rejectRemarks.set('');
  }

  onRemarksInput(event: Event): void {
    this.rejectRemarks.set((event.target as HTMLTextAreaElement).value);
  }
}
