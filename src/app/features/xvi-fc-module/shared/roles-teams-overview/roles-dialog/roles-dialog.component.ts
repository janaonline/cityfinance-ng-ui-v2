import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DialogField, RolesDialogConfig, RolesDialogResult } from './roles-dialog.types';

@Component({
  selector: 'app-roles-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './roles-dialog.component.html',
  styleUrl: './roles-dialog.component.scss',
})
export class RolesDialogComponent {
  readonly config = inject<RolesDialogConfig>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RolesDialogComponent>);

  readonly formValues: Record<string, string> = Object.fromEntries(
    this.config.fields
      .filter((f) => f.type !== 'confirm-message' && f.type !== 'role-change' && f.type !== 'readonly')
      .map((f) => [f.key, f.initialValue ?? '']),
  );

  get isConfirmDisabled(): boolean {
    return this.config.disabledFn ? this.config.disabledFn(this.formValues) : false;
  }

  get confirmBtnClass(): string {
    return this.config.confirmDanger ? 'send-action send-action--danger' : 'send-action';
  }

  onFieldChange(field: DialogField, value: string): void {
    this.formValues[field.key] = field.sanitize ? field.sanitize(value) : value;
  }

  onConfirm(): void {
    this.dialogRef.close({ ...this.formValues } as RolesDialogResult);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
