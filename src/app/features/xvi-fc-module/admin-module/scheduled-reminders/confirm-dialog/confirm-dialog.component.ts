import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'warn' | 'accent';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="p-4" style="min-width:320px;max-width:440px;">
      @if (data.title) {
        <h6 class="fw-bold mb-2">{{ data.title }}</h6>
      }
      <p class="text-muted small mb-4" [innerHTML]="data.message"></p>
      <div class="d-flex justify-content-end gap-2">
        <button mat-stroked-button [mat-dialog-close]="false">
          {{ data.cancelText ?? 'Cancel' }}
        </button>
        <button mat-flat-button [color]="data.confirmColor ?? 'primary'" [mat-dialog-close]="true">
          {{ data.confirmText ?? 'Confirm' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
