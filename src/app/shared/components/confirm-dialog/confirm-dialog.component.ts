import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'primary' | 'warn' | 'accent';
  icon?: string;
}

export const CANCEL_CONFIRM_DIALOG_DEFAULTS: Required<ConfirmDialogData> = {
  title: 'Discard changes?',
  message: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
  confirmText: 'Yes, cancel',
  cancelText: 'No, continue editing',
  confirmButtonColor: 'warn',
  icon: 'bi-exclamation-triangle-fill',
};

export const SUBMIT_CONFIRM_DIALOG_DEFAULTS: Required<ConfirmDialogData> = {
  title: 'Submit form?',
  message: 'Please confirm that you want to submit this form. You may not be able to edit it after submission.',
  confirmText: 'Yes, submit',
  cancelText: 'No, review again',
  confirmButtonColor: 'primary',
  icon: 'bi-check-circle-fill',
};

/**
 * Generic confirmation dialog for guarding destructive or irreversible actions.
 *
 * Closes with `true` when the user confirms, or `false`/`undefined` when they
 * cancel or dismiss (e.g. via Escape). All text and the confirm-button color are
 * driven by `ConfirmDialogData`; `CANCEL_CONFIRM_DIALOG_DEFAULTS` fill any omitted fields.
 *
 * Not signal-based: `MAT_DIALOG_DATA` is injected once and is immutable, so
 * signals would add no reactive value over a plain readonly property.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="d-flex align-items-center gap-2">
      @if (resolved.icon) {
        <i [class]="'bi fs-5 ' + iconColorClass + ' ' + resolved.icon" aria-hidden="true"></i>
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
  styles: `
    .confirm-dialog-icon--primary {
      color: var(--mat-sys-primary);
    }

    .confirm-dialog-icon--warn {
      color: var(--mat-sys-error, #ba1a1a);
    }

    .confirm-dialog-icon--accent {
      color: var(--mat-sys-tertiary);
    }
  `,
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ConfirmDialogComponent, boolean>>(MatDialogRef);

  /** Injected dialog data merged with defaults for any omitted fields. */
  readonly resolved: Required<ConfirmDialogData> = {
    ...CANCEL_CONFIRM_DIALOG_DEFAULTS,
    ...inject<ConfirmDialogData>(MAT_DIALOG_DATA),
  };

  /**
   * Closes the dialog with the given result.
   * @param result `true` if the user confirmed, `false` if they cancelled.
   */
  /** Returns the icon color class that matches the configured confirm button color. */
  get iconColorClass(): string {
    const map: Record<Required<ConfirmDialogData>['confirmButtonColor'], string> = {
      primary: 'confirm-dialog-icon--primary',
      warn: 'confirm-dialog-icon--warn',
      accent: 'confirm-dialog-icon--accent',
    };
    return map[this.resolved.confirmButtonColor];
  }

  /**
   * Closes the dialog with the given result.
   * @param result `true` if the user confirmed, `false` if they cancelled.
   */
  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
