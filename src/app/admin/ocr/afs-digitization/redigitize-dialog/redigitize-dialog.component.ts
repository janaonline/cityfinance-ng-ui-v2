import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AfsDigitizationService } from '../afs-digitization.service';
import { DigitizationOcrEngine, DigitizationRedigitizeOptions } from '../afs-digitization-models';

export interface RedigitizeDialogData {
  filename: string;
  /** Pre-selected values; anything omitted defaults to on / textract. */
  defaults?: Partial<DigitizationRedigitizeOptions>;
}

/** Asks which OCR engine and Gemini stages to run; closes with the options, or undefined on cancel. */
@Component({
  standalone: true,
  selector: 'app-redigitize-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './redigitize-dialog.component.html',
})
export class RedigitizeDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<MatDialogRef<RedigitizeDialogComponent, DigitizationRedigitizeOptions>>(MatDialogRef);
  readonly data = inject<RedigitizeDialogData>(MAT_DIALOG_DATA);
  readonly ocrEngines = inject(AfsDigitizationService).ocrEngines;

  readonly form = this.fb.nonNullable.group({
    ocr_engine: this.fb.nonNullable.control<DigitizationOcrEngine>(this.data.defaults?.ocr_engine ?? 'textract'),
    enable_validation: this.fb.nonNullable.control(this.data.defaults?.enable_validation ?? true),
    enable_arithmetic_validation: this.fb.nonNullable.control(this.data.defaults?.enable_arithmetic_validation ?? true),
    enable_document_classification: this.fb.nonNullable.control(
      this.data.defaults?.enable_document_classification ?? true,
    ),
  });

  submit(): void {
    this.dialogRef.close(this.form.getRawValue());
  }
}
