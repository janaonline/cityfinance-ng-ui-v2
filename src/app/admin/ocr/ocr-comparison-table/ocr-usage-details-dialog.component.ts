import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface OcrUsageDialogDetail {
  label: string;
  value: string;
  status?: string | null;
}

interface OcrUsageDialogData {
  title: string;
  engine: string;
  details: OcrUsageDialogDetail[];
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

  getStatusClass(status?: string | null): string {
    const normalizedStatus = `${status || ''}`.toUpperCase();

    if (normalizedStatus === 'PASS') {
      return 'usage-status-badge usage-status-badge--pass';
    }

    if (normalizedStatus === 'WARNING') {
      return 'usage-status-badge usage-status-badge--warning';
    }

    if (normalizedStatus === 'FAIL' || normalizedStatus === 'FAILED' || normalizedStatus === 'ERROR') {
      return 'usage-status-badge usage-status-badge--fail';
    }

    return 'usage-status-badge usage-status-badge--neutral';
  }

  getRowClass(status?: string | null): string {
    const normalizedStatus = `${status || ''}`.toUpperCase();

    if (normalizedStatus === 'PASS') {
      return 'usage-details-row usage-details-row--pass';
    }

    if (normalizedStatus === 'WARNING') {
      return 'usage-details-row usage-details-row--warning';
    }

    if (normalizedStatus === 'FAIL' || normalizedStatus === 'FAILED' || normalizedStatus === 'ERROR') {
      return 'usage-details-row usage-details-row--fail';
    }

    return 'usage-details-row';
  }

  close(): void {
    this.dialogRef.close();
  }
}
