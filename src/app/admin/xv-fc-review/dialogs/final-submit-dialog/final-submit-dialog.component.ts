import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';

export interface FinalSubmitDialogData {
  ulbName: string;
  formLabel: string;
  acceptedCount: number;
  rejectedCount: number;
  total: number;
}

@Component({
  selector: 'app-final-submit-dialog',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './final-submit-dialog.component.html',
})
export class FinalSubmitDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<FinalSubmitDialogComponent, boolean>);
  readonly data = inject<FinalSubmitDialogData>(MAT_DIALOG_DATA);

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
