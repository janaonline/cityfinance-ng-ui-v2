import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, switchMap, takeWhile, tap, timer } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../core/services/utility.service';
import { OcrService } from '../ocr.service';
import {
  OcrValidationJobTracker,
  OcrValidationResult,
  OcrValidationStatus,
} from './ocr-validation-models';

interface ModelOption {
  value: string;
  label: string;
}

@Component({
  standalone: true,
  selector: 'app-ocr-validation',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './ocr-validation.component.html',
  styleUrl: './ocr-validation.component.scss',
})
export class OcrValidationComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);
  readonly globalLoader = inject(GlobalLoaderService);

  readonly maxFileSizeMb = 50;

  readonly models: ModelOption[] = [
    { value: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite Preview' },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ];

  readonly form = this.fb.group({
    extractionModel: this.fb.nonNullable.control(
      'gemini-3.1-flash-lite-preview',
      Validators.required,
    ),
    validationModel: this.fb.nonNullable.control('gemini-3.1-pro-preview', Validators.required),
  });

  selectedFiles: File[] = [];
  readonly isSubmitting = signal(false);
  readonly jobs = signal<OcrValidationJobTracker[]>([]);
  readonly hasJobs = computed(() => this.jobs().length > 0);

  constructor() {
    this.globalLoader.hideLayout();
  }

  ngOnInit(): void {
    const jobId = this.route.snapshot.queryParamMap.get('jobId');
    if (jobId) {
      this.loadJobById(jobId);
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    const invalid = files.filter((f) => f.type !== 'application/pdf');
    if (invalid.length > 0) {
      this.utilityService.swalPopup('Invalid files', 'Only PDF files are accepted.', 'error');
      return;
    }

    const oversize = files.filter((f) => f.size / 1024 / 1024 > this.maxFileSizeMb);
    if (oversize.length > 0) {
      this.utilityService.swalPopup(
        'File too large',
        `Each PDF must be smaller than ${this.maxFileSizeMb} MB.`,
        'error',
      );
      return;
    }

    this.selectedFiles = [...this.selectedFiles, ...files];
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  clearFiles(): void {
    this.selectedFiles = [];
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  submit(): void {
    if (this.selectedFiles.length === 0) {
      this.utilityService.swalPopup(
        'Files required',
        'Please choose at least one PDF file.',
        'error',
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { extractionModel, validationModel } = this.form.getRawValue();
    this.isSubmitting.set(true);

    if (this.selectedFiles.length === 1) {
      this.ocrService
        .submitOcrValidationJob(this.selectedFiles[0], extractionModel, validationModel)
        .pipe(finalize(() => this.isSubmitting.set(false)))
        .subscribe({
          next: (response) => {
            this.addJob({
              jobId: response.job_id,
              filename: this.selectedFiles[0].name,
              status: 'queued',
              message: response.message,
              progressStep: null,
              result: null,
              showResult: true,
              showRaw: false,
              rawResult: null,
            });
            this.startPolling(response.job_id);
            this.clearFiles();
          },
          error: (err) => {
            this.utilityService.swalPopup(
              'Submission failed',
              err?.error?.detail || err?.error?.message || 'Failed to submit job.',
              'error',
            );
          },
        });
    } else {
      const files = [...this.selectedFiles];
      this.ocrService
        .submitOcrValidationBatch(files, extractionModel, validationModel)
        .pipe(finalize(() => this.isSubmitting.set(false)))
        .subscribe({
          next: (response) => {
            response.job_ids.forEach((jobId, index) => {
              this.addJob({
                jobId,
                filename: files[index]?.name ?? `File ${index + 1}`,
                status: 'queued',
                message: response.message,
                progressStep: null,
                result: null,
                showResult: true,
                showRaw: false,
                rawResult: null,
              });
              this.startPolling(jobId);
            });
            this.clearFiles();
          },
          error: (err) => {
            this.utilityService.swalPopup(
              'Submission failed',
              err?.error?.detail || err?.error?.message || 'Failed to submit batch.',
              'error',
            );
          },
        });
    }
  }

  resetJobs(): void {
    this.jobs.set([]);
  }

  toggleResult(jobId: string): void {
    this.patchJob(jobId, (j) => ({ showResult: !j.showResult }));
  }

  toggleRaw(jobId: string): void {
    this.patchJob(jobId, (j) => ({ showRaw: !j.showRaw }));
  }

  getStatusLabel(status: OcrValidationStatus): string {
    return { queued: 'Queued', processing: 'Processing', completed: 'Completed', failed: 'Failed' }[
      status
    ];
  }

  getAssessmentClass(assessment: string | null): string {
    switch (assessment?.toUpperCase()) {
      case 'PASS':
        return 'assessment--pass';
      case 'WARNING':
        return 'assessment--warning';
      case 'FAIL':
      case 'ERROR':
        return 'assessment--fail';
      case 'FAILED_EXTRACTION':
        return 'assessment--extraction-fail';
      default:
        return 'assessment--skipped';
    }
  }

  getCheckStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PASS':
        return 'check-status--pass';
      case 'WARNING':
        return 'check-status--warning';
      case 'FAIL':
        return 'check-status--fail';
      default:
        return 'check-status--unknown';
    }
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  getFinancialFigureEntries(
    figures: Record<string, number | null>,
  ): Array<{ key: string; value: number | null }> {
    return Object.entries(figures).map(([key, value]) => ({ key, value }));
  }

  toJsonString(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  hasFinancialFigures(result: OcrValidationResult | null): boolean {
    if (!result?.financial_figures) return false;
    return Object.values(result.financial_figures).some((v) => v !== null);
  }

  private addJob(job: OcrValidationJobTracker): void {
    this.jobs.update((jobs) => [job, ...jobs]);
  }

  private patchJob(
    jobId: string,
    patcher: (job: OcrValidationJobTracker) => Partial<OcrValidationJobTracker>,
  ): void {
    this.jobs.update((jobs) =>
      jobs.map((j) => (j.jobId === jobId ? { ...j, ...patcher(j) } : j)),
    );
  }

  private updateJob(jobId: string, patch: Partial<OcrValidationJobTracker>): void {
    this.jobs.update((jobs) => jobs.map((j) => (j.jobId === jobId ? { ...j, ...patch } : j)));
  }

  private startPolling(jobId: string): void {
    timer(0, 3000)
      .pipe(
        switchMap(() => this.ocrService.getOcrValidationJobStatus(jobId)),
        tap((status) => {
          this.updateJob(jobId, {
            status: status.status,
            message: status.message,
            progressStep: status.progress_step,
          });
        }),
        takeWhile((s) => s.status === 'queued' || s.status === 'processing', true),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        complete: () => {
          const job = this.jobs().find((j) => j.jobId === jobId);
          if (job?.status === 'completed') {
            this.fetchResult(jobId);
          }
        },
        error: () => {
          this.updateJob(jobId, {
            status: 'failed',
            message: 'An error occurred while polling job status.',
          });
        },
      });
  }

  private fetchResult(jobId: string): void {
    this.ocrService.getOcrValidationJobResult(jobId).subscribe({
      next: (jobResult) => {
        this.updateJob(jobId, { result: jobResult.result, rawResult: jobResult });
      },
      error: () => {
        this.updateJob(jobId, { message: 'Job completed but result could not be fetched.' });
      },
    });
  }

  private loadJobById(jobId: string): void {
    this.ocrService.getOcrValidationJobStatus(jobId).subscribe({
      next: (status) => {
        this.addJob({
          jobId: status.job_id,
          filename: status.filename,
          status: status.status,
          message: status.message,
          progressStep: status.progress_step,
          result: null,
          showResult: true,
          showRaw: false,
          rawResult: null,
        });

        if (status.status === 'queued' || status.status === 'processing') {
          this.startPolling(jobId);
        } else if (status.status === 'completed') {
          this.fetchResult(jobId);
        }
      },
      error: () => {
        this.utilityService.swalPopup('Not found', `No job found with ID: ${jobId}`, 'error');
      },
    });
  }
}
