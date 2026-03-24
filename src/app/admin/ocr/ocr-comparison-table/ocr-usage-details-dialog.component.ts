import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
interface OcrUsageDialogData {
  title: string;
  engine: string;
  details: Array<{ label: string; value: string }>;
}

@Component({
  standalone: true,
  selector: 'app-ocr-usage-details-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './ocr-usage-details-dialog.component.html',
  styleUrl: './ocr-usage-details-dialog.component.scss',
})
export class OcrUsageDetailsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<OcrUsageDetailsDialogComponent>);
  readonly data = inject<OcrUsageDialogData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
