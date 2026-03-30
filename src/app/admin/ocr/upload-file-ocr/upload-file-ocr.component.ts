import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';
import { CommonService } from '../../../core/services/common.service';
import { IULB } from '../../../core/models/ulb';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../core/services/utility.service';
import { MaterialModule } from '../../../material.module';
import { OcrComparisonTableComponent } from '../ocr-comparison-table/ocr-comparison-table.component';
import { OcrService } from '../ocr.service';
import {
  isErroredOcrJobResponse,
  FailedOcrResponse,
  failedOcrResponse,
  isFailedOcrResponse,
  isSuccessfulOcrResponse,
  OcrApiResponse,
  OcrResponse,
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

interface OcrMethodOption {
  value: string;
  label: string;
}

interface GeminiModelOption {
  value: string;
  label: string;
}

interface BooleanOption {
  value: boolean;
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

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly ocrService = inject(OcrService);
  private readonly commonService = inject(CommonService);
  readonly globalLoader = inject(GlobalLoaderService);
  private readonly utilityService = inject(UtilityService);

  readonly maxFileSizeMb = 50;
  // readonly documentTypes: OcrDocumentType[] = [
  //   { value: 'bal_sheet', label: 'Balance Sheet' },
  //   { value: 'bal_sheet_schedules', label: 'Balance Sheet Schedule' },
  //   { value: 'inc_exp', label: 'Income and Expenditure' },
  //   { value: 'inc_exp_schedules', label: 'Income and Expenditure Schedule' },
  //   { value: 'cash_flow', label: 'Cash Flow Statement' },
  //   { value: 'auditor_report', label: 'Auditors Report' },

  // ];
  // DOCUMENT_TYPE_MAPPING_FULL = {
  //   "BALANCE_SHEET": "Balance Sheet",
  //   "BALANCE_SHEET_SCHEDULE": "Balance Sheet Schedule",
  //   "INCOME_EXPENDITURE": "Income and Expenditure",
  //   "INCOME_EXPENDITURE_SCHEDULE": "Income and Expenditure Schedule",
  //   "CASH_FLOW": "Cash Flow Statement",
  //   "AUDITOR_REPORT": "Auditors Report",
  //   "UNKNOWN": "Unknown",
  // }
  readonly documentTypes: OcrDocumentType[] = [
    { value: 'BALANCE_SHEET', label: 'Balance Sheet' },
    { value: 'BALANCE_SHEET_SCHEDULE', label: 'Balance Sheet Schedule' },
    { value: 'INCOME_EXPENDITURE', label: 'Income and Expenditure' },
    { value: 'INCOME_EXPENDITURE_SCHEDULE', label: 'Income and Expenditure Schedule' },
    { value: 'CASH_FLOW', label: 'Cash Flow Statement' },
    { value: 'AUDITOR_REPORT', label: 'Auditors Report' },
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
  readonly ocrMethods: OcrMethodOption[] = [
    { value: 'combined', label: 'Combined' },
    { value: 'sarvam', label: 'Sarvam' },
    { value: 'textract', label: 'Textract' },
    { value: 'tesseract', label: 'Tesseract' },
    { value: 'gemini_vision', label: 'Gemini Vision' },
  ];
  readonly geminiModels: GeminiModelOption[] = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite Preview' },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
    { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
  ];
  readonly orientationCheckOptions: BooleanOption[] = [
    { value: false, label: 'False' },
    { value: true, label: 'True' },
  ];

  readonly uploadForm = this.fb.group({
    documentTypeId: this.fb.nonNullable.control('BALANCE_SHEET_SCHEDULE', Validators.required),
    financialYear: this.fb.nonNullable.control('2024-25', Validators.required),
    ocrMethod: this.fb.nonNullable.control('combined', Validators.required),
    model: this.fb.nonNullable.control('gemini-2.5-flash', Validators.required),
    enableOrientationCheck: this.fb.nonNullable.control(false),
    ulb: this.fb.control<IULB | string | null>(null, this.ulbSelectionValidator()),
  });

  readonly filteredUlbs = signal<IULB[]>([]);
  readonly ulbSearchInProgress = signal(false);
  selectedFile: File | null = null;
  readonly uploadState = signal<'idle' | 'success' | 'error'>('idle');
  readonly responseData = signal<OcrApiResponse | null>(null);
  readonly showResponseDetails = signal(true);
  readonly showRawResponse = signal(false);
  readonly successfulResponse = computed<OcrResponse | null>(() => {
    const response = this.responseData();
    return isSuccessfulOcrResponse(response) && !isErroredOcrJobResponse(response)
      ? response
      : null;
  });
  readonly failedResponse = computed<FailedOcrResponse | null>(() => {
    const response = this.responseData();
    return isFailedOcrResponse(response) ? response : null;
  });
  readonly failedJobResponse = computed<OcrResponse | null>(() => {
    const response = this.responseData();
    return isErroredOcrJobResponse(response) ? response : null;
  });

  constructor() {
    this.globalLoader.hideLayout();
  }

  ngOnInit(): void {
    this.setupUlbAutocomplete();

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

    this.ocrService
      .uploadOcrFile(
        this.selectedFile,
        this.uploadForm.getRawValue().documentTypeId ?? 'BALANCE_SHEET_SCHEDULE',
        this.uploadForm.getRawValue().financialYear ?? '2024-25',
        this.uploadForm.getRawValue().ocrMethod ?? 'combined',
        this.uploadForm.getRawValue().model ?? 'gemini-2.5-flash',
        this.uploadForm.getRawValue().enableOrientationCheck ?? false,
        this.uploadForm.getRawValue().ulb,
      )
      .pipe(finalize(() => this.globalLoader.stopLoader()))
      .subscribe({
        next: (response) => {
          const normalizedResponse = response as OcrApiResponse;

          this.responseData.set(normalizedResponse);
          this.showResponseDetails.set(true);
          this.showRawResponse.set(false);

          if (isErroredOcrJobResponse(normalizedResponse)) {
            this.uploadState.set('error');
            this.utilityService.swalPopup(
              'Upload failed',
              normalizedResponse.error || 'The OCR job finished with a failed status.',
              'error',
            );
            return;
          }

          this.uploadState.set('success');
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

  onUlbSelected(event: MatAutocompleteSelectedEvent): void {
    this.uploadForm.controls.ulb.setValue(event.option.value as IULB);
  }

  displayUlbName(ulb: IULB | string | null): string {
    if (!ulb) {
      return '';
    }

    return typeof ulb === 'string' ? ulb : ulb.name;
  }

  isTreeObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  isTreeArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  getObjectEntries(value: Record<string, unknown>): Array<{ key: string; value: unknown }> {
    return Object.entries(value).map(([key, entryValue]) => ({ key, value: entryValue }));
  }

  formatTreeValue(value: unknown): string {
    if (value === null) {
      return 'null';
    }

    if (value === undefined) {
      return 'undefined';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return '';
  }

  readonly selectedUlb = computed<IULB | undefined>(() => {
    const value = this.uploadForm.controls.ulb.value;
    return value && typeof value !== 'string' ? value : undefined;
  });

  private setupUlbAutocomplete(): void {
    this.uploadForm.controls.ulb.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((value) => (typeof value === 'string' ? value : value?.name || '').trim()),
        tap((searchText) => {
          if (!searchText) {
            this.filteredUlbs.set([]);
            this.ulbSearchInProgress.set(false);
          }
        }),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchText) => {
          if (!searchText || searchText.length < 2) {
            return of<IULB[]>([]);
          }

          this.ulbSearchInProgress.set(true);

          return this.commonService.searchUlb({ matchingWord: searchText }, 'ulb').pipe(
            map((response: any) => this.extractUlbs(response).slice(0, 50)),
            catchError(() => of<IULB[]>([])),
            finalize(() => this.ulbSearchInProgress.set(false)),
          );
        }),
      )
      .subscribe((ulbs) => this.filteredUlbs.set(ulbs));
  }

  private resetFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private ulbSelectionValidator(): ValidatorFn {
    return (control) => {
      const value = control.value;
      if (!value) {
        return null;
      }

      return typeof value === 'object' ? null : { invalidUlb: true };
    };
  }

  private extractUlbs(response: any): IULB[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.ulbs)) {
      return response.ulbs;
    }

    if (Array.isArray(response?.data?.ulbs)) {
      return response.data.ulbs;
    }

    return [];
  }
}
