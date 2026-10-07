import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { IUlbSummary } from '../../../../core/models/ulb-summary';
import { UlbService } from '../../../../core/services/ulb.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { AfsDigitizationService, GeminiPricing } from '../afs-digitization.service';
import {
  AfsDocumentType,
  ArithmeticCheck,
  DigitizationJobTracker,
  DigitizationOcrEngine,
  DigitizationResult,
  DigitizationStatus,
  GeminiFieldCheck,
  GeminiValidation,
} from '../afs-digitization-models';

const USD_TO_INR = 96.28; // Example conversion rate, should be updated with real-time data in production

interface UsageStep {
  name: string;
  model: string | null;
  promptTokens: number | null;
  candidatesTokens: number | null;
  thoughtsTokens: number | null;
  totalTokens: number | null;
  promptDetails: Array<{ modality: string; token_count: number }>;
  estimatedCostUsd: number | null;
  estimatedCostInr: number | null;
  pricing: GeminiPricing | null;
}

@Component({
  standalone: true,
  selector: 'app-afs-digitization',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './afs-digitization.component.html',
  styleUrl: './afs-digitization.component.scss',
})
export class AfsDigitizationComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly digitizationService = inject(AfsDigitizationService);
  private readonly ulbService = inject(UlbService);
  private readonly utilityService = inject(UtilityService);

  readonly maxFileSizeMb = 50;

  readonly geminiModels = this.digitizationService.geminiModels;
  readonly ocrEngines = this.digitizationService.ocrEngines;
  readonly documentTypes = this.digitizationService.documentTypes;
  readonly financialYears = this.digitizationService.financialYears;

  readonly form = this.fb.group({
    ocrEngine: this.fb.nonNullable.control<DigitizationOcrEngine>('textract', Validators.required),
    geminiModel: this.fb.nonNullable.control('gemini-3-flash-preview', Validators.required),
    ulbName: this.fb.control<IUlbSummary | string | null>(null),
    financialYear: this.fb.control<string | null>(null),
    docType: this.fb.control<string | null>(null),
    enableValidation: this.fb.nonNullable.control(true, Validators.required),
    enableArithmeticValidation: this.fb.nonNullable.control(true, Validators.required),
    enableDocumentClassification: this.fb.nonNullable.control(true, Validators.required),
  });

  private readonly arithmeticRuleLabels: Partial<Record<string, string>> = {
    TOTAL_TALLY: 'Totals tally with components',
    ASSETS_EQUAL_LIABILITIES: 'Total Assets = Total Liabilities',
    TOTAL_INCOME_NON_NEGATIVE: 'Total Income not negative',
    TAX_REVENUE_NON_NEGATIVE: 'Tax Revenue not negative',
    KEY_TOTAL_NON_ZERO: 'Key totals not zero',
    NUMERIC_AMOUNTS: 'Amounts are numeric',
  };

  selectedFile: File | null = null;
  readonly isSubmitting = signal(false);
  readonly jobs = signal<DigitizationJobTracker[]>([]);
  readonly hasJobs = computed(() => this.jobs().length > 0);
  readonly downloadingJobId = signal<string | null>(null);
  readonly downloadingPdfJobId = signal<string | null>(null);
  readonly revalidatingJobId = signal<string | null>(null);
  readonly revalidatingArithmeticJobId = signal<string | null>(null);
  readonly regeneratingJobId = signal<string | null>(null);
  readonly copiedKey = signal<string | null>(null);
  readonly filteredUlbs = signal<IUlbSummary[]>([]);
  readonly ulbSearchInProgress = signal(false);
  readonly selectedUlb = toSignal(
    this.form.controls.ulbName.valueChanges.pipe(
      startWith(this.form.controls.ulbName.value),
      map((value) => (value && typeof value !== 'string' ? value : undefined)),
    ),
  );

  ngOnInit(): void {
    this.setupUlbAutocomplete();
    const jobId = this.route.snapshot.queryParamMap.get('jobId');
    if (jobId) {
      this.loadJobById(jobId);
    }
  }

  onUlbSelected(event: MatAutocompleteSelectedEvent): void {
    this.form.controls.ulbName.setValue(event.option.value as IUlbSummary);
  }

  displayUlbName(ulb: IUlbSummary | string | null): string {
    if (!ulb) return '';
    return typeof ulb === 'string' ? ulb : ulb.name;
  }

  private setupUlbAutocomplete(): void {
    this.form.controls.ulbName.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((value) => (typeof value === 'string' ? value : (value?.name ?? '')).trim()),
        tap((searchText) => {
          if (!searchText) {
            this.filteredUlbs.set([]);
            this.ulbSearchInProgress.set(false);
          }
        }),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchText) => {
          if (!searchText || searchText.length < 2) return of<IUlbSummary[]>([]);
          this.ulbSearchInProgress.set(true);
          return this.ulbService.searchAutocomplete(searchText).pipe(
            catchError(() => of<IUlbSummary[]>([])),
            finalize(() => this.ulbSearchInProgress.set(false)),
          );
        }),
      )
      .subscribe((ulbs) => this.filteredUlbs.set(ulbs));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.utilityService.swalPopup('Invalid file', 'Only PDF files are accepted.', 'error');
      return;
    }
    if (file.size / 1024 / 1024 > this.maxFileSizeMb) {
      this.utilityService.swalPopup(
        'File too large',
        `The PDF must be smaller than ${this.maxFileSizeMb} MB.`,
        'error',
      );
      return;
    }
    this.selectedFile = file;
  }

  clearFile(): void {
    this.selectedFile = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  submit(): void {
    if (!this.selectedFile) {
      this.utilityService.swalPopup('File required', 'Please choose a PDF file.', 'error');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      ocrEngine,
      geminiModel,
      ulbName,
      financialYear,
      docType,
      enableValidation,
      enableArithmeticValidation,
      enableDocumentClassification,
    } = this.form.getRawValue();
    const ulbNameValue = this.selectedUlb()?.name ?? (typeof ulbName === 'string' ? ulbName : null);
    const file = this.selectedFile;
    this.isSubmitting.set(true);

    this.digitizationService
      .submitDigitizationJob(
        file,
        geminiModel,
        ulbNameValue,
        financialYear,
        docType,
        enableValidation,
        enableArithmeticValidation,
        ocrEngine,
        enableDocumentClassification,
      )
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.addJob({
            jobId: response.job_id,
            filename: file.name,
            status: 'queued',
            message: response.message,
            progressStep: null,
            result: null,
            excelS3Key: null,
            showResult: true,
          });
          this.startPolling(response.job_id);
          this.clearFile();
        },
        error: (err) => {
          this.utilityService.swalPopup('Submission failed', this.parseApiError(err), 'error', true);
        },
      });
  }

  toggleResult(jobId: string): void {
    this.patchJob(jobId, (j) => ({ showResult: !j.showResult }));
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  getStatusLabel(status: DigitizationStatus): string {
    return { queued: 'Queued', processing: 'Processing', completed: 'Completed', failed: 'Failed' }[status];
  }

  getAssessmentClass(assessment: string | null): string {
    switch (assessment?.toUpperCase()) {
      case 'PASS':
        return 'assessment--pass';
      case 'PARTIAL':
        return 'assessment--warning';
      case 'FAIL':
        return 'assessment--fail';
      default:
        return 'assessment--skipped';
    }
  }

  getScoreClass(score: number | null): string {
    if (score === null) return 'text-secondary';
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  }

  mismatchedChecks(checks: GeminiFieldCheck[]): GeminiFieldCheck[] {
    return checks.filter((c) => !c.matched);
  }

  failedArithmeticChecks(checks: ArithmeticCheck[]): ArithmeticCheck[] {
    return checks.filter((c) => c.status === 'fail');
  }

  ruleResultEntries(ruleResults: Record<string, string>): Array<{ rule: string; label: string; result: string }> {
    return Object.entries(ruleResults).map(([rule, result]) => ({ rule, label: this.ruleLabel(rule), result }));
  }

  errorSourceLabel(check: ArithmeticCheck): string {
    switch (check.error_source) {
      case 'source_document':
        return 'Source document';
      case 'digitization':
        return 'Digitization';
      default:
        return '—';
    }
  }

  documentTypeLabel(type: AfsDocumentType | null | undefined): string {
    return type ? (this.digitizationService.detectedDocumentTypeLabels[type] ?? type) : 'NOT RUN';
  }

  /** Multiple documents -> warning; unknown -> fail; a single known type -> pass. */
  getDocumentTypeClass(type: AfsDocumentType | null | undefined): string {
    switch (type) {
      case null:
      case undefined:
        return 'assessment--skipped';
      case 'MULTIPLE_DOCUMENTS':
        return 'assessment--warning';
      case 'UNKNOWN':
        return 'assessment--fail';
      default:
        return 'assessment--pass';
    }
  }

  formatPageRange(start: number, end: number): string {
    return start === end ? `${start}` : `${start}–${end}`;
  }

  ruleLabel(rule: string): string {
    return this.arithmeticRuleLabels[rule] ?? rule;
  }

  ocrEngineLabel(engine: DigitizationOcrEngine | null | undefined): string {
    return engine === 'sarvam' ? 'Sarvam' : engine === 'gemini' ? 'Gemini' : 'Textract';
  }

  getTaskTimings(result: DigitizationResult): Array<{ label: string; seconds: number | null }> {
    const extractionSeconds = result.ocr_extraction.extraction_seconds;
    const validationSeconds = result.gemini_validation?.validation_seconds ?? null;
    const arithmeticSeconds = result.arithmetic_validation?.validation_seconds ?? null;
    const classificationSeconds = result.document_classification?.classification_seconds ?? null;
    const totalSeconds = result.processing_time_seconds;

    // The Gemini stages run in parallel, so only the longest one adds to wall time.
    const geminiWallSeconds = Math.max(validationSeconds ?? 0, arithmeticSeconds ?? 0, classificationSeconds ?? 0);
    let excelSeconds: number | null = null;
    if (extractionSeconds !== null && totalSeconds !== null) {
      const remainder = totalSeconds - extractionSeconds - geminiWallSeconds;
      excelSeconds = remainder >= 0 ? remainder : null;
    }

    return [
      { label: `${this.ocrEngineLabel(result.ocr_engine)} Extraction`, seconds: extractionSeconds },
      { label: 'Gemini Cross-check', seconds: validationSeconds },
      { label: 'Gemini Arithmetic', seconds: arithmeticSeconds },
      { label: 'Gemini Classification', seconds: classificationSeconds },
      { label: 'Excel Build & Upload', seconds: excelSeconds },
      { label: 'Total', seconds: totalSeconds },
    ];
  }

  /** One usage card per Gemini call that reported token usage. */
  getUsageSteps(result: DigitizationResult): UsageStep[] {
    const steps: UsageStep[] = [];
    if (result.gemini_validation?.usage_metadata) {
      steps.push(this.getUsageStep('gemini_cross_check', result.gemini_validation));
    }
    if (result.arithmetic_validation?.usage_metadata) {
      steps.push(this.getUsageStep('gemini_arithmetic_validation', result.arithmetic_validation));
    }
    if (result.document_classification?.usage_metadata) {
      steps.push(this.getUsageStep('gemini_document_classification', result.document_classification));
    }
    return steps;
  }

  /** Combined Gemini tokens/cost; cost is null if any step lacks pricing. */
  getUsageTotal(steps: UsageStep[]): {
    thoughtsTokens: number;
    totalTokens: number;
    costUsd: number | null;
    costInr: number | null;
  } {
    const thoughtsTokens = steps.reduce((sum, s) => sum + (s.thoughtsTokens ?? 0), 0);
    const totalTokens = steps.reduce((sum, s) => sum + (s.totalTokens ?? 0), 0);
    const costUsd = steps.every((s) => s.estimatedCostUsd !== null)
      ? steps.reduce((sum, s) => sum + s.estimatedCostUsd!, 0)
      : null;
    return { thoughtsTokens, totalTokens, costUsd, costInr: costUsd !== null ? costUsd * USD_TO_INR : null };
  }

  /**
   * OCR + all Gemini calls in INR. `complete` is false when a part has no
   * pricing, in which case `inr` covers only the priced parts.
   */
  getJobTotalCost(result: DigitizationResult): { inr: number; complete: boolean; parts: string } {
    const ocrInr = result.ocr_extraction.price_inr;
    const geminiInr = this.getUsageTotal(this.getUsageSteps(result)).costInr;
    const parts = [
      `${this.ocrEngineLabel(result.ocr_engine)} ${ocrInr !== null ? '₹' + ocrInr.toFixed(2) : 'N/A'}`,
      `Gemini ${geminiInr !== null ? '₹' + geminiInr.toFixed(4) : 'N/A'}`,
    ].join(' + ');
    return {
      inr: (ocrInr ?? 0) + (geminiInr ?? 0),
      complete: ocrInr !== null && geminiInr !== null,
      parts,
    };
  }

  private getUsageStep(
    name: string,
    validation: Pick<GeminiValidation, 'model' | 'usage_metadata'>,
  ): UsageStep {
    const s = (validation.usage_metadata ?? {}) as Record<string, unknown>;
    const pricing = this.geminiModels.find((m) => m.value === validation.model)?.pricing ?? null;
    const prompt = (s['prompt_token_count'] as number) ?? 0;
    const output = (s['candidates_token_count'] as number) ?? 0;
    const thoughts = (s['thoughts_token_count'] as number) ?? 0;
    const estimatedCostUsd = pricing
      ? (prompt * pricing.inputPerM + output * pricing.outputPerM + thoughts * pricing.thinkingPerM) / 1_000_000
      : null;
    const estimatedCostInr = estimatedCostUsd !== null ? estimatedCostUsd * USD_TO_INR : null;
    return {
      name,
      model: validation.model,
      promptTokens: (s['prompt_token_count'] as number) ?? null,
      candidatesTokens: (s['candidates_token_count'] as number) ?? null,
      thoughtsTokens: (s['thoughts_token_count'] as number) ?? null,
      totalTokens: (s['total_token_count'] as number) ?? null,
      promptDetails: (s['prompt_tokens_details'] as Array<{ modality: string; token_count: number }> | null) ?? [],
      estimatedCostUsd,
      estimatedCostInr,
      pricing,
    };
  }

  formatFileSize(bytes: number | null): string {
    return bytes === null ? '—' : `${(bytes / 1024).toFixed(1)} KB`;
  }

  formatDateTime(d: string | null): string {
    if (!d) return '—';
    const normalized = /[Z+]/.test(d.slice(-6)) ? d : d + 'Z';
    return new Date(normalized).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
      timeZoneName: 'short',
    } as Intl.DateTimeFormatOptions);
  }

  downloadExcel(job: DigitizationJobTracker): void {
    this.downloadingJobId.set(job.jobId);
    this.digitizationService
      .downloadDigitizationExcel(job.jobId)
      .pipe(finalize(() => this.downloadingJobId.set(null)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${job.filename.replace(/\.pdf$/i, '')}_digitized.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          this.utilityService.swalPopup('Download failed', 'Could not download the Excel file.', 'error');
        },
      });
  }

  downloadPdf(job: DigitizationJobTracker): void {
    this.downloadingPdfJobId.set(job.jobId);
    this.digitizationService
      .downloadDigitizationPdf(job.jobId)
      .pipe(finalize(() => this.downloadingPdfJobId.set(null)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = job.filename;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          this.utilityService.swalPopup('Download failed', 'Could not download the source PDF.', 'error');
        },
      });
  }

  revalidateJob(job: DigitizationJobTracker): void {
    if (this.revalidatingJobId()) return;
    this.revalidatingJobId.set(job.jobId);
    this.digitizationService
      .revalidateDigitizationJob(job.jobId)
      .pipe(finalize(() => this.revalidatingJobId.set(null)))
      .subscribe({
        next: (response) => {
          this.updateJob(job.jobId, {
            status: 'processing',
            message: response.message,
            progressStep: 'revalidation_queued',
            result: null,
          });
          this.startPolling(job.jobId);
        },
        error: (err) => {
          this.utilityService.swalPopup('Revalidate failed', this.parseApiError(err), 'error');
        },
      });
  }

  revalidateArithmetic(job: DigitizationJobTracker): void {
    if (this.revalidatingArithmeticJobId()) return;
    this.revalidatingArithmeticJobId.set(job.jobId);
    this.digitizationService
      .revalidateDigitizationArithmetic(job.jobId)
      .pipe(finalize(() => this.revalidatingArithmeticJobId.set(null)))
      .subscribe({
        next: (response) => {
          this.updateJob(job.jobId, {
            status: 'processing',
            message: response.message,
            progressStep: 'arithmetic_revalidation_queued',
            result: null,
          });
          this.startPolling(job.jobId);
        },
        error: (err) => {
          this.utilityService.swalPopup('Arithmetic revalidation failed', this.parseApiError(err), 'error');
        },
      });
  }

  regenerateExcel(job: DigitizationJobTracker): void {
    if (this.regeneratingJobId()) return;
    this.regeneratingJobId.set(job.jobId);
    this.digitizationService
      .regenerateDigitizationExcel(job.jobId)
      .pipe(finalize(() => this.regeneratingJobId.set(null)))
      .subscribe({
        next: (response) => {
          this.updateJob(job.jobId, {
            result: response.result,
            excelS3Key: response.result?.excel_s3_key ?? null,
          });
          this.utilityService.swalPopup(
            'Excel regenerated',
            'The workbook has been rebuilt from the stored extraction and re-uploaded.',
            'success',
          );
        },
        error: (err) => {
          this.utilityService.swalPopup('Regenerate failed', this.parseApiError(err), 'error');
        },
      });
  }

  copyValue(label: string, value: string): void {
    if (!value) return;

    navigator.clipboard
      .writeText(value)
      .then(() => {
        const copyKey = `${label}:${value}`;
        this.copiedKey.set(copyKey);
        window.setTimeout(() => {
          if (this.copiedKey() === copyKey) {
            this.copiedKey.set(null);
          }
        }, 1500);
      })
      .catch(() => {
        this.utilityService.swalPopup(
          'Copy failed',
          `Unable to copy ${label.toLowerCase()}. Please try again.`,
          'error',
        );
      });
  }

  isCopied(label: string, value: string): boolean {
    return this.copiedKey() === `${label}:${value}`;
  }

  getJobLink(jobId: string): string {
    return `${window.location.origin}/ocr/afs-digitization/upload?jobId=${jobId}`;
  }

  private addJob(job: DigitizationJobTracker): void {
    this.jobs.update((jobs) => [job, ...jobs]);
  }

  private patchJob(jobId: string, patcher: (job: DigitizationJobTracker) => Partial<DigitizationJobTracker>): void {
    this.jobs.update((jobs) => jobs.map((j) => (j.jobId === jobId ? { ...j, ...patcher(j) } : j)));
  }

  private updateJob(jobId: string, patch: Partial<DigitizationJobTracker>): void {
    this.jobs.update((jobs) => jobs.map((j) => (j.jobId === jobId ? { ...j, ...patch } : j)));
  }

  private startPolling(jobId: string): void {
    timer(0, 5000)
      .pipe(
        switchMap(() => this.digitizationService.getDigitizationJobStatus(jobId)),
        tap((status) => {
          this.updateJob(jobId, {
            status: status.status,
            message: status.message,
            progressStep: status.progress_step,
            excelS3Key: status.excel_s3_key,
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
    this.digitizationService.getDigitizationJobResult(jobId).subscribe({
      next: (jobResult) => {
        this.updateJob(jobId, { result: jobResult.result, excelS3Key: jobResult.result?.excel_s3_key ?? null });
      },
      error: () => {
        this.updateJob(jobId, { message: 'Job completed but result could not be fetched.' });
      },
    });
  }

  private parseApiError(err: unknown): string {
    const error = (err as any)?.error;
    const detail = error?.detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((e: any) => e.msg ?? JSON.stringify(e)).join('; ');
    }
    if (typeof detail === 'string') return detail;
    return error?.message ?? 'An unexpected error occurred.';
  }

  private loadJobById(jobId: string): void {
    this.digitizationService.getDigitizationJobStatus(jobId).subscribe({
      next: (status) => {
        this.addJob({
          jobId: status.job_id,
          filename: status.filename,
          status: status.status,
          message: status.message,
          progressStep: status.progress_step,
          result: null,
          excelS3Key: status.excel_s3_key,
          showResult: true,
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
