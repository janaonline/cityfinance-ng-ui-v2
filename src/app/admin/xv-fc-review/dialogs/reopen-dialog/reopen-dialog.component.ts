import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';

export interface ReopenDialogData {
  ulbName: string;
  formLabel: string;
}

@Component({
  selector: 'app-reopen-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './reopen-dialog.component.html',
})
export class ReopenDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ReopenDialogComponent, string | undefined>);
  readonly data = inject<ReopenDialogData>(MAT_DIALOG_DATA);

  readonly reason = new FormControl('', { nonNullable: true });

  cancel() {
    this.dialogRef.close(undefined);
  }

  confirm() {
    // Closing with `''` (not undefined) distinguishes "reopen, no reason given" from "cancelled".
    this.dialogRef.close(this.reason.value.trim());
  }
}
