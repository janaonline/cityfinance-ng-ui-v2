import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface DigitizationV3ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
}

/** Yes / no prompt before queueing. Closes with `true` only when the user confirms. */
@Component({
  standalone: true,
  selector: 'app-afs-digitization-v3-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="mb-0">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="primary" type="button" [mat-dialog-close]="true" cdkFocusInitial>
        {{ data.confirmLabel || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class AfsDigitizationV3ConfirmDialogComponent {
  readonly data = inject<DigitizationV3ConfirmDialogData>(MAT_DIALOG_DATA);
}
