import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { SlbPreviewContentComponent } from './slb-preview-content.component';

export interface SlbPreviewDialogData {
  form: FormGroup;
  fields: ConditionalFieldConfig[];
  ulbName: string;
  formStatusLabel: string;
  actualYearLabel: string | null;
  targetYearLabel: string | null;
}

/** Read-only "SLB Preview" modal opened from the SLB form's Preview button. */
@Component({
  selector: 'app-slb-preview-dialog',
  imports: [MatDialogModule, SlbPreviewContentComponent],
  templateUrl: './slb-preview-dialog.component.html',
  styleUrl: './slb-preview-dialog.component.scss',
})
export class SlbPreviewDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SlbPreviewDialogComponent>);
  readonly data = inject<SlbPreviewDialogData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
