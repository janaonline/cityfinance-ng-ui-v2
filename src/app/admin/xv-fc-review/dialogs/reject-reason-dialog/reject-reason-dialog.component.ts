import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';

export interface RejectReasonDialogData {
  code: string;
  label: string;
}

@Component({
  selector: 'app-reject-reason-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './reject-reason-dialog.component.html',
})
export class RejectReasonDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RejectReasonDialogComponent, string | undefined>);
  readonly data = inject<RejectReasonDialogData>(MAT_DIALOG_DATA);

  readonly reason = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  cancel() {
    this.dialogRef.close(undefined);
  }

  confirm() {
    this.reason.markAsTouched();
    if (this.reason.invalid) return;
    this.dialogRef.close(this.reason.value.trim());
  }
}
