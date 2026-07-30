import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface NoteDialogData {
  title?: string;
  message?: string;
  /** Distinct red callout for a consequence the user should notice before confirming (e.g. "this will also affect N other items"). */
  warning?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  /** When true, a non-empty note is required to confirm. Defaults to false. */
  required?: boolean;
}

const NOTE_DIALOG_DEFAULTS: Required<NoteDialogData> = {
  title: 'Add a note',
  message: '',
  warning: '',
  placeholder: 'Type your note here...',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  required: false,
};

/**
 * Generic single-textarea prompt, replacing ad-hoc `window.prompt()` calls for
 * review/return reasons. Closes with the trimmed note string on confirm, or
 * `undefined` on cancel/dismiss. When `required` is true the confirm button is
 * disabled until the note is non-empty.
 */
@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ resolved.title }}</h2>
    <mat-dialog-content>
      @if (resolved.message) {
        <p class="mb-2">{{ resolved.message }}</p>
      }
      @if (resolved.warning) {
        <p class="note-dialog-warning mb-2">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ resolved.warning }}
        </p>
      }
      <mat-form-field appearance="outline" class="w-100" subscriptSizing="dynamic">
        <textarea
          matInput
          rows="4"
          [formControl]="noteControl"
          [placeholder]="resolved.placeholder"
          [attr.aria-label]="resolved.title"
        ></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton (click)="close(undefined)">{{ resolved.cancelText }}</button>
      <button matButton="filled" [disabled]="noteControl.invalid" (click)="close(noteControl.value)">
        {{ resolved.confirmText }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .note-dialog-warning {
      color: #c62828;
      background: #fdecea;
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
    }
  `,
})
export class NoteDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<NoteDialogComponent, string | undefined>>(MatDialogRef);

  readonly resolved: Required<NoteDialogData> = {
    ...NOTE_DIALOG_DEFAULTS,
    ...inject<NoteDialogData>(MAT_DIALOG_DATA),
  };

  readonly noteControl = new FormControl('', {
    nonNullable: true,
    validators: this.resolved.required ? [Validators.required, Validators.pattern(/\S/)] : [],
  });

  close(note: string | undefined): void {
    this.dialogRef.close(note?.trim() || undefined);
  }
}
