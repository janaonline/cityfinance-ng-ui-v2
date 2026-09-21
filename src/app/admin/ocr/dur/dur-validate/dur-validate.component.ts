import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
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
import { IULB } from '../../../../core/models/ulb';
import { CommonService } from '../../../../core/services/common.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { OcrService, SelectOption } from '../../ocr.service';
import { DurGrantType, DurJobTracker, DurValidationResult } from '../dur-models';

interface GeminiPricing {
  inputPerM: number;
  outputPerM: number;
  thinkingPerM: number;
}

interface UsageInfo {
  promptTokens: number | null;
  candidatesTokens: number | null;
  thoughtsTokens: number | null;
  totalTokens: number | null;
  promptDetails: Array<{ modality: string; token_count: number }>;
  estimatedCostUsd: number | null;
  estimatedCostInr: number | null;
  pricing: GeminiPricing | null;
}

const USD_TO_INR = 96.28; // Example conversion rate, should be updated with real-time data in production

@Component({
  standalone: true,
  selector: 'app-dur-validate',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dur-validate.component.html',
  styleUrl: './dur-validate.component.scss',
})
export class DurValidateComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly ocrService = inject(OcrService);
  private readonly commonService = inject(CommonService);
  private readonly utilityService = inject(UtilityService);

  readonly maxFileSizeMb = 50;
  readonly models = this.ocrService.models;

  readonly financialYears: SelectOption[] = [
    { value: '2027-28', label: '2027-28' },
    { value: '2026-27', label: '2026-27' },
    { value: '2025-26', label: '2025-26' },
    { value: '2024-25', label: '2024-25' },
    { value: '2023-24', label: '2023-24' },
  ];

  readonly grantTypes: Array<{ value: DurGrantType; label: string }> = [
    { value: 'tied', label: 'Tied' },
    { value: 'untied', label: 'Untied' },
  ];

  readonly form = this.fb.group({
    model: this.fb.nonNullable.control('gemini-3.5-flash-lite'),
    financialYear: this.fb.control<string | null>(null),
    grantType: this.fb.control<DurGrantType | null>(null, Validators.required),
    ulb: this.fb.control<IULB | string | null>(null, this.ulbSelectionValidator()),
  });

  selectedFile: File | null = null;
  readonly isSubmitting = signal(false);
  readonly jobs = signal<DurJobTracker[]>([]);
  readonly hasJobs = computed(() => this.jobs().length > 0);
  readonly filteredUlbs = signal<IULB[]>([]);
  readonly ulbSearchInProgress = signal(false);
  readonly selectedUlb = toSignal(
    this.form.controls.ulb.valueChanges.pipe(
      startWith(this.form.controls.ulb.value),
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
      this.utilityService.swalPopup('File too large', `PDF must be smaller than ${this.maxFileSizeMb} MB.`, 'error');
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
      this.utilityService.swalPopup('File required', 'Please choose a scanned DUR PDF.', 'error');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { model, financialYear, grantType } = this.form.getRawValue();
    const file = this.selectedFile;
    this.isSubmitting.set(true);
    this.ocrService
      .submitDurValidationJob(file, this.selectedUlb(), financialYear, model, grantType)
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
            showResult: true,
            showRaw: false,
            rawResult: null,
          });
          this.startPolling(response.job_id);
          this.clearFile();
        },
        error: (err) => {
          this.utilityService.swalPopup('Submission failed', this.parseApiError(err), 'error', true);
        },
      });
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

  getStatusLabel(status: DurJobTracker['status']): string {
    return { queued: 'Queued', processing: 'Processing', completed: 'Completed', failed: 'Failed' }[status];
  }

  getMatchClass(matched: boolean | null): string {
    if (matched === true) return 'text-success';
    if (matched === false) return 'text-danger';
    return 'text-secondary';
  }

  getMatchIcon(matched: boolean | null): string {
    if (matched === true) return 'bi-check-circle-fill';
    if (matched === false) return 'bi-x-circle-fill';
    return 'bi-dash-circle';
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

  toJsonString(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  getUsageInfo(result: DurValidationResult): UsageInfo | null {
    const meta = result.usage_metadata;
    if (!meta) return null;

    const pricing = this.models.find((m) => m.value === result.model)?.pricing ?? null;
    const prompt = (meta['prompt_token_count'] as number) ?? 0;
    const output = (meta['candidates_token_count'] as number) ?? 0;
    const thoughts = (meta['thoughts_token_count'] as number) ?? 0;
    const estimatedCostUsd = pricing
      ? (prompt * pricing.inputPerM + output * pricing.outputPerM + thoughts * pricing.thinkingPerM) / 1_000_000
      : null;
    const estimatedCostInr = estimatedCostUsd !== null ? estimatedCostUsd * USD_TO_INR : null;

    return {
      promptTokens: (meta['prompt_token_count'] as number) ?? null,
      candidatesTokens: (meta['candidates_token_count'] as number) ?? null,
      thoughtsTokens: (meta['thoughts_token_count'] as number) ?? null,
      totalTokens: (meta['total_token_count'] as number) ?? null,
      promptDetails: (meta['prompt_tokens_details'] as Array<{ modality: string; token_count: number }> | null) ?? [],
      estimatedCostUsd,
      estimatedCostInr,
      pricing,
    };
  }

  onUlbSelected(event: MatAutocompleteSelectedEvent): void {
    this.form.controls.ulb.setValue(event.option.value as IULB);
  }

  displayUlbName(ulb: IULB | string | null): string {
    if (!ulb) return '';
    return typeof ulb === 'string' ? ulb : ulb.name;
  }

  private setupUlbAutocomplete(): void {
    this.form.controls.ulb.valueChanges
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
          if (!searchText || searchText.length < 2) return of<IULB[]>([]);
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

  private ulbSelectionValidator(): ValidatorFn {
    return (control) => {
      const value = control.value;
      if (!value) return null;
      return typeof value === 'object' ? null : { invalidUlb: true };
    };
  }

  private extractUlbs(response: any): IULB[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.ulbs)) return response.ulbs;
    if (Array.isArray(response?.data?.ulbs)) return response.data.ulbs;
    return [];
  }

  private addJob(job: DurJobTracker): void {
    this.jobs.update((jobs) => [job, ...jobs]);
  }

  private patchJob(jobId: string, patcher: (job: DurJobTracker) => Partial<DurJobTracker>): void {
    this.jobs.update((jobs) => jobs.map((j) => (j.jobId === jobId ? { ...j, ...patcher(j) } : j)));
  }

  private updateJob(jobId: string, patch: Partial<DurJobTracker>): void {
    this.jobs.update((jobs) => jobs.map((j) => (j.jobId === jobId ? { ...j, ...patch } : j)));
  }

  private startPolling(jobId: string): void {
    timer(0, 5000)
      .pipe(
        switchMap(() => this.ocrService.getDurJobStatus(jobId)),
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
    this.ocrService.getDurJobResult(jobId).subscribe({
      next: (jobResult) => {
        this.updateJob(jobId, { result: jobResult.result, rawResult: jobResult });
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
    this.ocrService.getDurJobStatus(jobId).subscribe({
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
