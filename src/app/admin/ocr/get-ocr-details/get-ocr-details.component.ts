import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../core/services/utility.service';
import { MaterialModule } from '../../../material.module';
import { OcrComparisonTableComponent } from '../ocr-comparison-table/ocr-comparison-table.component';
import { OcrService } from '../ocr.service';
import {
  isErroredOcrJobResponse,
  FailedOcrResponse,
  isFailedOcrResponse,
  isSuccessfulOcrResponse,
  OcrApiResponse,
  OcrResponse,
} from '../upload-file-ocr/ocr-response';

interface OcrMethodOption {
  value: string;
  label: string;
}

@Component({
  standalone: true,
  selector: 'app-get-ocr-details',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, OcrComparisonTableComponent],
  templateUrl: './get-ocr-details.component.html',
  styleUrl: './get-ocr-details.component.scss',
})
export class GetOcrDetailsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly ocrService = inject(OcrService);
  readonly globalLoader = inject(GlobalLoaderService);
  private readonly utilityService = inject(UtilityService);

  readonly ocrMethods: OcrMethodOption[] = [
    { value: 'combined', label: 'Combined' },
    { value: 'sarvam', label: 'Sarvam' },
    { value: 'textract', label: 'Textract' },
    { value: 'tesseract', label: 'Tesseract' },
    { value: 'gemini_vision', label: 'Gemini Vision' },
  ];

  readonly detailsForm = this.fb.nonNullable.group({
    jobId: [''],
    filename: [''],
    ocrMethod: ['combined', Validators.required],
  });

  readonly responseData = signal<OcrApiResponse | null>(null);
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
    this.route.queryParams.subscribe((params) => {
      const jobId = params['jobId'] || '';
      const filename = params['filename'] || '';
      const ocrMethod = params['ocrMethod'] || 'combined';

      if (!jobId && !filename) {
        return;
      }

      this.detailsForm.patchValue({
        jobId,
        filename,
        ocrMethod,
      });

      this.fetchOcrDetails();
    });
  }

  fetchOcrDetails(): void {
    const { jobId, filename, ocrMethod } = this.detailsForm.getRawValue();

    if (!jobId.trim() && !filename.trim()) {
      this.utilityService.swalPopup(
        'Search value required',
        'Please enter either Job ID or File Name.',
        'error',
      );
      return;
    }

    this.responseData.set(null);
    this.showRawResponse.set(false);
    this.globalLoader.showLoader();

    this.ocrService
      .getOcrDetails({
        jobId: jobId.trim() || undefined,
        filename: filename.trim() || undefined,
        ocrMethod,
      })
      .pipe(finalize(() => this.globalLoader.stopLoader()))
      .subscribe({
        next: (response) => {
          this.responseData.set(response);

          // console.log('OCR Details Response:---', response); // Debug log
          // if (isErroredOcrJobResponse(response)) {
          //   this.utilityService.swalPopup(
          //     'OCR job failed',
          //     response.error || 'The OCR job finished with a failed status.',
          //     'error',
          //   );
          //   return;
          // }

          // this.utilityService.swalPopup('Success', 'OCR details fetched successfully.');
        },
        error: (error) => {
          this.responseData.set((error?.error ?? error) as OcrApiResponse);
          this.utilityService.swalPopup(
            'Fetch failed',
            error?.error?.message || error?.error?.detail || 'Unable to fetch OCR details.',
            'error',
          );
        },
      });
  }

  resetForm(): void {
    this.detailsForm.reset({
      jobId: '',
      filename: '',
      ocrMethod: 'combined',
    });
    this.responseData.set(null);
    this.showRawResponse.set(false);
  }

  toggleRawResponse(): void {
    this.showRawResponse.update((value) => !value);
  }
}
