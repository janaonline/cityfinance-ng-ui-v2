import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ConfirmDialogData,
  themedDialogConfig,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { UtilityService } from '../../../../core/services/utility.service';

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
 * confirmation gesture, so reject gets a snackbar only, no dialog. The parent still owns the
 * actual approve/reject HTTP calls and passes back `canApprove`/`canReject` from its own
 * permissions response — this component only gates/confirms the user's intent and notifies.
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
  private readonly utilityService = inject(UtilityService);
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
        this.approveClicked.emit();
        this.utilityService.triggerSnackbar('Approved successfully');
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
    this.rejectConfirmed.emit(remarks);
    this.utilityService.triggerSnackbar('Rejected', 'snackbar-danger');
    this.showRejectInput.set(false);
    this.rejectRemarks.set('');
  }

  onRemarksInput(event: Event): void {
    this.rejectRemarks.set((event.target as HTMLTextAreaElement).value);
  }
}
