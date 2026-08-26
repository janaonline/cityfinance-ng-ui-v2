import { Component, computed, inject } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
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
  /** Bounds on the trimmed note length (matching this component's other length-gated note fields,
   *  e.g. the per-document return-reason box) — enforced client-side so a caller's own backend
   *  length rule can never reject a note the confirm button already let through. Omit either for
   *  no bound in that direction. */
  minLength?: number;
  maxLength?: number;
}

const NOTE_DIALOG_DEFAULTS: Required<NoteDialogData> = {
  title: 'Add a note',
  message: '',
  warning: '',
  placeholder: 'Type your note here...',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  required: false,
  minLength: 0,
  maxLength: Infinity,
};

/** Bounds the note's *trimmed* length — Validators.minLength/maxLength count the raw value, which
 *  would let e.g. 10 spaces pass a minLength(10) check. */
function trimmedLengthValidator(min: number, max: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = ((control.value as string) ?? '').trim().length;
    if (length === 0) return null; // required (if any) already owns the empty case
    if (length < min) return { trimmedMinlength: { requiredLength: min, actualLength: length } };
    if (length > max) return { trimmedMaxlength: { requiredLength: max, actualLength: length } };
    return null;
  };
}

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
      @if (resolved.maxLength < Infinity) {
        <p class="note-dialog-char-count" [class.note-dialog-char-count--invalid]="noteLength() < resolved.minLength">
          {{ noteLength() }} / {{ resolved.maxLength }} &middot; minimum {{ resolved.minLength }} characters
        </p>
      }
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

    .note-dialog-char-count {
      margin: 0.35rem 0 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .note-dialog-char-count--invalid {
      color: #c62828;
      font-weight: 600;
    }
  `,
})
export class NoteDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<NoteDialogComponent, string | undefined>>(MatDialogRef);

  readonly Infinity = Infinity;

  readonly resolved: Required<NoteDialogData> = {
    ...NOTE_DIALOG_DEFAULTS,
    ...inject<NoteDialogData>(MAT_DIALOG_DATA),
  };

  readonly noteControl = new FormControl('', {
    nonNullable: true,
    validators: [
      ...(this.resolved.required ? [Validators.required, Validators.pattern(/\S/)] : []),
      trimmedLengthValidator(this.resolved.minLength, this.resolved.maxLength),
    ],
  });

  private readonly noteValue = toSignal(this.noteControl.valueChanges, { initialValue: this.noteControl.value });
  readonly noteLength = computed(() => this.noteValue().trim().length);

  close(note: string | undefined): void {
    this.dialogRef.close(note?.trim() || undefined);
  }
}
