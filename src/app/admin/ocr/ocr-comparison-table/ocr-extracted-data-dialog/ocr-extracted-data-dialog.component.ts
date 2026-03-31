import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  OcrExtractedSection,
  OcrValidationRule,
} from '../../upload-file-ocr/ocr-response';

interface OcrExtractedDataDialogData {
  engine: string;
  ocrNotes: string[];
  validations: OcrValidationRule[];
  extractedData: OcrExtractedSection[];
}

@Component({
  standalone: true,
  selector: 'app-ocr-extracted-data-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './ocr-extracted-data-dialog.component.html',
  styleUrl: './ocr-extracted-data-dialog.component.scss',
})
export class OcrExtractedDataDialogComponent {
  readonly dialogRef = inject(MatDialogRef<OcrExtractedDataDialogComponent>);
  readonly data = inject<OcrExtractedDataDialogData>(MAT_DIALOG_DATA);

  getStatusClass(status?: string | null): string {
    const normalizedStatus = `${status || ''}`.toUpperCase();

    if (normalizedStatus === 'PASS') {
      return 'validation-status-badge validation-status-badge--pass';
    }

    if (normalizedStatus === 'WARNING') {
      return 'validation-status-badge validation-status-badge--warning';
    }

    if (
      normalizedStatus === 'FAIL' ||
      normalizedStatus === 'FAILED' ||
      normalizedStatus === 'ERROR'
    ) {
      return 'validation-status-badge validation-status-badge--fail';
    }

    return 'validation-status-badge validation-status-badge--neutral';
  }

  formatValue(value: string | number | boolean | null | undefined): string {
    return value === null || value === undefined || value === '' ? '-' : String(value);
  }

  formatAffectedItems(items?: string[] | null): string {
    return items && items.length > 0 ? items.join(', ') : '-';
  }

  getSubtotalMatchClass(
    stated?: number | null,
    computed?: number | null,
  ): string {
    if (stated === null || stated === undefined || computed === null || computed === undefined) {
      return 'subtotal-grid__value-row subtotal-grid__value-row--neutral';
    }

    const difference = Math.abs(stated - computed);

    if (difference < 0.000001) {
      return 'subtotal-grid__value-row subtotal-grid__value-row--match';
    }

    return 'subtotal-grid__value-row subtotal-grid__value-row--mismatch';
  }

  close(): void {
    this.dialogRef.close();
  }
}
