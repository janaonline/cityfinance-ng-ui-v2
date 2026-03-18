import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, computed, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../core/services/utility.service';
import { MaterialModule } from '../../../material.module';
import { AfsService } from '../../afs-dashboard/afs.service';
import { OcrComparisonTableComponent } from '../ocr-comparison-table/ocr-comparison-table.component';
import {
  FailedOcrResponse,
  failedOcrResponse,
  isFailedOcrResponse,
  isSuccessfulOcrResponse,
  OcrApiResponse,
  ocrResponse,
} from './ocr-response';

interface OcrDocumentType {
  value: string;
  label: string;
}

interface FinancialYearOption {
  value: string;
  label: string;
}

@Component({
  standalone: true,
  selector: 'app-upload-file-ocr',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, OcrComparisonTableComponent],
  templateUrl: './upload-file-ocr.component.html',
  styleUrl: './upload-file-ocr.component.scss',
})
export class UploadFileOcrComponent implements OnInit {
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
  ];
  readonly financialYears: FinancialYearOption[] = [
    { value: '2025-26', label: '2025-26' },
    { value: '2024-25', label: '2024-25' },
    { value: '2023-24', label: '2023-24' },
    { value: '2022-23', label: '2022-23' },
    { value: '2021-22', label: '2021-22' },
    { value: '2020-21', label: '2020-21' },
    { value: '2019-20', label: '2019-20' },
  ];

  readonly uploadForm = this.fb.nonNullable.group({
    documentTypeId: ['bal_sheet_schedules', Validators.required],
    financialYear: ['2024-25', Validators.required],
  });

  selectedFile: File | null = null;
  readonly uploadState = signal<'idle' | 'success' | 'error'>('idle');
  readonly responseData = signal<OcrApiResponse | null>(null);
  readonly showResponseDetails = signal(true);
  readonly showRawResponse = signal(false);
  readonly successfulResponse = computed(() => {
    const response = this.responseData();
    return isSuccessfulOcrResponse(response) ? response : null;
  });
  readonly failedResponse = computed<FailedOcrResponse | null>(() => {
    const response = this.responseData();
    return isFailedOcrResponse(response) ? response : null;
  });

  constructor() {
    this.globalLoader.hideLayout();
  }

  ngOnInit(): void {
    // For testing purpose - to be removed
    this.setSampleResponse();
    // this.setFailedSampleResponse();
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
    this.showResponseDetails.set(true);
    this.showRawResponse.set(false);
    this.globalLoader.showLoader();

    this.afsService
      .uploadOcrFile(
        this.selectedFile,
        this.uploadForm.getRawValue().documentTypeId,
        this.uploadForm.getRawValue().financialYear,
      )
      .pipe(finalize(() => this.globalLoader.stopLoader()))
      .subscribe({
        next: (response) => {
          this.responseData.set(response as OcrApiResponse);
          this.uploadState.set('success');
          this.showResponseDetails.set(true);
          this.showRawResponse.set(false);
          this.utilityService.swalPopup(
            'Upload complete',
            'The OCR request has been submitted successfully.',
          );
        },
        error: (error) => {
          this.responseData.set((error?.error ?? error) as OcrApiResponse);
          this.uploadState.set('error');
          this.showResponseDetails.set(true);
          this.showRawResponse.set(false);
          this.utilityService.swalPopup(
            'Upload failed',
            error?.error?.message || 'OCR upload failed. Please try again.',
            'error',
          );
        },
      });
  }

  setSampleResponse(): void {
    this.responseData.set(ocrResponse);
    this.uploadState.set('success');
    this.showResponseDetails.set(true);
    this.showRawResponse.set(false);
  }

  setFailedSampleResponse(): void {
    this.responseData.set(failedOcrResponse);
    this.uploadState.set('error');
    this.showResponseDetails.set(true);
    this.showRawResponse.set(false);
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.uploadState.set('idle');
    this.responseData.set(null);
    this.showResponseDetails.set(true);
    this.showRawResponse.set(false);
    this.resetFileInput();
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  toggleResponseDetails(): void {
    this.showResponseDetails.update((value) => !value);
  }

  toggleRawResponse(): void {
    this.showRawResponse.update((value) => !value);
  }

  private resetFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
