import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'primary' | 'warn' | 'accent';
  icon?: string;
}

export const CONFIRM_DIALOG_DEFAULTS: Required<ConfirmDialogData> = {
  title: 'Discard changes?',
  message: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
  confirmText: 'Yes, cancel',
  cancelText: 'No, continue editing',
  confirmButtonColor: 'warn',
  icon: 'warning',
};

/**
 * Generic confirmation dialog for guarding destructive or irreversible actions.
 *
 * Closes with `true` when the user confirms, or `false`/`undefined` when they
 * cancel or dismiss (e.g. via Escape). All text and the confirm-button color are
 * driven by `ConfirmDialogData`; `CONFIRM_DIALOG_DEFAULTS` fill any omitted fields.
 *
 * Not signal-based: `MAT_DIALOG_DATA` is injected once and is immutable, so
 * signals would add no reactive value over a plain readonly property.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="d-flex align-items-center gap-2">
      @if (resolved.icon) {
        <mat-icon>{{ resolved.icon }}</mat-icon>
      }
      <span>{{ resolved.title }}</span>
    </h2>
    <mat-dialog-content>
      <p class="mb-0">{{ resolved.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton (click)="close(false)">{{ resolved.cancelText }}</button>
      <button
        matButton="filled"
        [class.confirm-dialog-btn--warn]="resolved.confirmButtonColor === 'warn'"
        [class.confirm-dialog-btn--accent]="resolved.confirmButtonColor === 'accent'"
        (click)="close(true)"
      >
        {{ resolved.confirmText }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ConfirmDialogComponent, boolean>>(MatDialogRef);

  /** Injected dialog data merged with defaults for any omitted fields. */
  readonly resolved: Required<ConfirmDialogData> = {
    ...CONFIRM_DIALOG_DEFAULTS,
    ...inject<ConfirmDialogData>(MAT_DIALOG_DATA),
  };

  /**
   * Closes the dialog with the given result.
   * @param result `true` if the user confirmed, `false` if they cancelled.
   */
  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
