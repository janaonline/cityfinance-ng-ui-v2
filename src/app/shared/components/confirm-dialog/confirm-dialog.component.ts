import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MATERIAL_THEME_CLASS } from '../../../core/theming/material-theme.providers';

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

export const SAVE_AS_DRAFT_DIALOG_DEFAULTS: Required<ConfirmDialogData> = {
  title: 'Save as draft?',
  message: 'Your progress will be saved. You can return to complete and submit this form later.',
  confirmText: 'Yes, save draft',
  cancelText: 'No, continue editing',
  confirmButtonColor: 'primary',
  icon: 'bi-floppy-fill',
};

/** Shown by {@link unsavedChangesGuard} when navigating away from a page with unsaved edits. */
export const LEAVE_PAGE_CONFIRM_DIALOG_DEFAULTS: Required<ConfirmDialogData> = {
  title: 'Leave without saving?',
  message: 'You have unsaved changes on this page. If you leave now, your changes will be lost.',
  confirmText: 'Leave page',
  cancelText: 'Stay on page',
  confirmButtonColor: 'warn',
  icon: 'bi-exclamation-triangle-fill',
};

/**
 * Resolves the ambient `MATERIAL_THEME_CLASS` for the caller's DI scope (e.g. `'xvifc-theme'`),
 * or `null` outside a themed scope.
 *
 * Neither this nor {@link themedDialogConfig} can be centralized inside `ConfirmDialogService`
 * or `MatDialog` themselves: both are `providedIn: 'root'`, so `inject()` calls inside their own
 * constructors would resolve from the root injector, never a caller's feature-scoped one
 * (component tree or route `providers`). The theme must be read from the caller's own injection
 * context every time — this is the one shared way to do that.
 *
 * Must be called from an active injection context: a component constructor/field initializer, a
 * route guard body, `effect()`, etc. In a component, cache the result in a field at construction
 * time and reuse it — methods invoked later (e.g. from a template click binding) run outside any
 * injection context, so calling this directly inside one throws.
 *
 * Prefer {@link themedDialogConfig} when opening a dialog through `ConfirmDialogService`. Use
 * this directly only when building a custom `MatDialog.open()` panelClass alongside other fixed
 * classes.
 */
export function resolveThemeClass(): string | null {
  return inject(MATERIAL_THEME_CLASS, { optional: true });
}

/**
 * Resolves the ambient theme (see {@link resolveThemeClass}) into a `MatDialogConfig` ready to
 * pass as `ConfirmDialogService.confirm()`'s second argument, so the dialog's panel picks up the
 * caller's feature theme instead of the Material default. Same injection-context rules apply.
 */
export function themedDialogConfig(): MatDialogConfig | undefined {
  const themeClass = resolveThemeClass();
  return themeClass ? { panelClass: themeClass } : undefined;
}

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
    <h2 mat-dialog-title class="confirm-dialog-title d-flex align-items-center gap-2">
      @if (resolved.icon) {
        <i [class]="'bi fs-5 ' + iconColorClass + ' ' + resolved.icon" aria-hidden="true"></i>
      }
      <span>{{ resolved.title }}</span>
    </h2>
    <mat-dialog-content class="confirm-dialog-content">
      <p class="mb-0">{{ resolved.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="confirm-dialog-actions">
      <button matButton class="confirm-dialog-btn" (click)="close(false)">{{ resolved.cancelText }}</button>
      <button
        matButton="filled"
        class="confirm-dialog-btn"
        [class.confirm-dialog-btn--warn]="resolved.confirmButtonColor === 'warn'"
        [class.confirm-dialog-btn--accent]="resolved.confirmButtonColor === 'accent'"
        (click)="close(true)"
      >
        {{ resolved.confirmText }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .confirm-dialog-title {
      font-size: 1.05rem;
      font-weight: 600;
      padding-top: 1rem;

      i {
        font-size: 1.1rem;
      }
    }

    .confirm-dialog-content {
      font-size: 0.85rem;
      color: var(--mat-sys-on-surface-variant, #5f6368);
      padding-bottom: 0.5rem;
    }

    .confirm-dialog-actions {
      padding-bottom: 0.75rem;
    }

    .confirm-dialog-btn {
      --mat-button-filled-container-height: 34px;
      --mat-button-outlined-container-height: 34px;
      height: 34px;
      font-size: 0.82rem;
    }

    .confirm-dialog-icon--primary {
      color: var(--color-primary, var(--mat-sys-primary));
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
