import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../core/services/utility.service';
import { MaterialModule } from '../../../material.module';
import { AfsService } from '../../afs-dashboard/afs.service';

interface OcrDocumentType {
  value: string;
  label: string;
}

@Component({
  standalone: true,
  selector: 'app-upload-file-ocr',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './upload-file-ocr.component.html',
  styleUrl: './upload-file-ocr.component.scss',
})
export class UploadFileOcrComponent {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly afsService = inject(AfsService);
  readonly globalLoader = inject(GlobalLoaderService);
  private readonly utilityService = inject(UtilityService);

  readonly maxFileSizeMb = 50;
  readonly documentTypes: OcrDocumentType[] = [
    { value: 'bal_sheet', label: 'Balance Sheet' },
    { value: 'bal_sheet_schedules', label: 'Schedules To Balance Sheet' },
    { value: 'inc_exp', label: 'Income And Expenditure' },
    { value: 'inc_exp_schedules', label: 'Schedules To Income And Expenditure' },
    { value: 'cash_flow', label: 'Cash Flow Statement' },
    { value: 'auditor_report', label: 'Auditors Report' },
    { value: '16th_fc', label: '16th FC' },
  ];

  readonly uploadForm = this.fb.nonNullable.group({
    documentTypeId: ['bal_sheet_schedules', Validators.required],
  });

  selectedFile: File | null = null;
  readonly uploadState = signal<'idle' | 'success' | 'error'>('idle');
  readonly responseData = signal<any | null>(null);

  constructor() {
    this.globalLoader.hideLayout();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;

    if (!file) {
      this.clearSelectedFile();
      return;
    }

    if (file.type !== 'application/pdf') {
      this.resetFileInput();
      this.utilityService.swalPopup('Invalid file', 'Please select a PDF file only.', 'error');
      return;
    }

    if (file.size / 1024 / 1024 > this.maxFileSizeMb) {
      this.resetFileInput();
      this.utilityService.swalPopup(
        'File too large',
        `Please upload a PDF smaller than ${this.maxFileSizeMb} MB.`,
        'error',
      );
      return;
    }

    this.selectedFile = file;
    this.uploadState.set('idle');
    this.responseData.set(null);
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.utilityService.swalPopup('File required', 'Please choose a PDF file first.', 'error');
      return;
    }

    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    this.uploadState.set('idle');
    this.responseData.set(null);
    this.globalLoader.showLoader();

    this.afsService
      .uploadOcrFile(this.selectedFile, this.uploadForm.getRawValue().documentTypeId)
      .pipe(finalize(() => this.globalLoader.stopLoader()))
      .subscribe({
        next: (response) => {
          this.responseData.set(response);
          this.uploadState.set('success');
          this.utilityService.swalPopup(
            'Upload complete',
            'The OCR request has been submitted successfully.',
          );
        },
        error: (error) => {
          this.responseData.set(error?.error ?? error);
          this.uploadState.set('error');
          this.utilityService.swalPopup(
            'Upload failed',
            error?.error?.message || 'OCR upload failed. Please try again.',
            'error',
          );
        },
      });
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.uploadState.set('idle');
    this.responseData.set(null);
    this.resetFileInput();
  }

  private resetFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
