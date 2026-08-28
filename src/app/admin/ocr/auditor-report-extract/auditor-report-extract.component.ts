import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../core/services/utility.service';
import { MaterialModule } from '../../../material.module';
import { AuditorReportExtractResponse, OcrService, SelectOption } from '../ocr.service';

@Component({
  standalone: true,
  selector: 'app-auditor-report-extract',
  imports: [CommonModule, MaterialModule],
  templateUrl: './auditor-report-extract.component.html',
  styleUrl: './auditor-report-extract.component.scss',
})
export class AuditorReportExtractComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly ocrService = inject(OcrService);
  readonly globalLoader = inject(GlobalLoaderService);
  private readonly utilityService = inject(UtilityService);

  readonly maxFileSizeMb = 50;
  readonly geminiModels: SelectOption[] = this.ocrService.models.map(({ value, label }) => ({ value, label }));
  selectedModel = 'gemini-3.1-pro-preview';

  selectedFile: File | null = null;
  readonly extractState = signal<'idle' | 'success' | 'error'>('idle');
  readonly result = signal<AuditorReportExtractResponse | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly showRawResponse = signal(false);
  readonly viewingStoredRecord = signal(false);

  ngOnInit(): void {
    const docId = this.route.snapshot.queryParamMap.get('docId');
    if (docId) {
      this.loadStoredRecord(docId);
    }
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
    this.extractState.set('idle');
    this.result.set(null);
    this.errorMessage.set(null);
    this.viewingStoredRecord.set(false);
  }

  extractFile(): void {
    if (!this.selectedFile) {
      this.utilityService.swalPopup('File required', 'Please choose a PDF file first.', 'error');
      return;
    }

    this.extractState.set('idle');
    this.result.set(null);
    this.errorMessage.set(null);
    this.showRawResponse.set(false);
    this.viewingStoredRecord.set(false);
    this.globalLoader.showLoader();

    this.ocrService
      .extractAuditorReport(this.selectedFile, this.selectedModel)
      .pipe(finalize(() => this.globalLoader.stopLoader()))
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.extractState.set('success');
          this.utilityService.swalPopup('Extraction complete', 'The auditor report has been processed.');
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.detail || error?.message || 'Auditor report extraction failed.');
          this.extractState.set('error');
          this.utilityService.swalPopup(
            'Extraction failed',
            error?.error?.detail || 'Auditor report extraction failed. Please try again.',
            'error',
          );
        },
      });
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.extractState.set('idle');
    this.result.set(null);
    this.errorMessage.set(null);
    this.showRawResponse.set(false);
    this.viewingStoredRecord.set(false);
    this.resetFileInput();
  }

  private loadStoredRecord(docId: string): void {
    this.viewingStoredRecord.set(true);
    this.extractState.set('idle');
    this.result.set(null);
    this.errorMessage.set(null);
    this.globalLoader.showLoader();

    this.ocrService
      .getAuditorReportExtraction(docId)
      .pipe(finalize(() => this.globalLoader.stopLoader()))
      .subscribe({
        next: (record) => {
          if (record.status === 'COMPLETED' && record.extraction) {
            this.result.set({
              filename: record.filename,
              doc_id: record.doc_id,
              model: record.model,
              processing_time_seconds: record.processing_time_seconds ?? 0,
              extraction: record.extraction,
              usage_metadata: record.usage_metadata,
              total_tokens: record.total_tokens,
              price_inr: record.price_inr,
            });
            this.extractState.set('success');
          } else {
            this.errorMessage.set(record.error_message || 'This extraction failed.');
            this.extractState.set('error');
          }
        },
        error: (error) => {
          this.utilityService.swalPopup(
            'Not found',
            error?.error?.detail || `Could not load extraction ${docId}.`,
            'error',
          );
        },
      });
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  toggleRawResponse(): void {
    this.showRawResponse.update((value) => !value);
  }

  opinionChipClass(opinionType: string | null): string {
    switch (opinionType) {
      case 'UNQUALIFIED':
        return 'chip chip--good';
      case 'QUALIFIED':
        return 'chip chip--warn';
      case 'ADVERSE':
      case 'DISCLAIMER':
        return 'chip chip--bad';
      default:
        return 'chip chip--neutral';
    }
  }

  private resetFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
