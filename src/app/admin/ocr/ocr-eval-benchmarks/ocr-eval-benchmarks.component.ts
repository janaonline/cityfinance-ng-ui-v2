import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { UtilityService } from '../../../core/services/utility.service';
import { EvalBenchmark, EvalRunInfo, OcrService } from '../ocr.service';

@Component({
  standalone: true,
  selector: 'app-ocr-eval-benchmarks',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MaterialModule, MatTableModule],
  templateUrl: './ocr-eval-benchmarks.component.html',
  styleUrl: './ocr-eval-benchmarks.component.scss',
})
export class OcrEvalBenchmarksComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);

  readonly benchmarks = signal<EvalBenchmark[]>([]);
  readonly loading = signal(false);
  readonly creating = signal(false);

  readonly selectedBenchmark = signal<EvalBenchmark | null>(null);
  readonly runsDataSource = new MatTableDataSource<EvalRunInfo>([]);
  readonly runsLoading = signal(false);
  readonly runSubmitting = signal(false);
  readonly showRunForm = signal(false);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    jobIds: ['', Validators.required],
  });

  readonly runForm = this.fb.nonNullable.group({
    extractionModel: ['gemini-2.5-flash'],
    validationModel: ['gemini-2.5-pro'],
    enableFinancialValidation: [false],
  });

  readonly models = this.ocrService.models.filter((m) => !m.deprecated);

  readonly benchmarkColumns = ['name', 'jobCount', 'createdAt', 'action'];
  readonly runColumns = ['evalRunId', 'models', 'status', 'metrics', 'createdAt', 'action'];

  ngOnInit(): void {
    this.loadBenchmarks();
  }

  loadBenchmarks(): void {
    this.loading.set(true);
    this.ocrService
      .listEvalBenchmarks()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => this.benchmarks.set(items),
        error: (err) =>
          this.utilityService.swalPopup(
            'Failed to load benchmarks',
            err?.error?.detail || 'Please try again.',
            'error',
          ),
      });
  }

  createBenchmark(): void {
    if (this.createForm.invalid) return;
    const { name, jobIds } = this.createForm.getRawValue();
    const ids = jobIds
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!ids.length) {
      this.utilityService.swalPopup('No job IDs', 'Enter at least one job ID, one per line.', 'warning');
      return;
    }
    this.creating.set(true);
    this.ocrService
      .createEvalBenchmark(name, ids)
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe({
        next: () => {
          this.createForm.reset({ name: '', jobIds: '' });
          this.loadBenchmarks();
        },
        error: (err) =>
          this.utilityService.swalPopup('Create failed', err?.error?.detail || 'Please try again.', 'error'),
      });
  }

  selectBenchmark(b: EvalBenchmark): void {
    this.selectedBenchmark.set(b);
    this.showRunForm.set(false);
    this.loadRuns(b.benchmark_id);
  }

  back(): void {
    this.selectedBenchmark.set(null);
    this.runsDataSource.data = [];
    this.showRunForm.set(false);
  }

  loadRuns(benchmarkId: string): void {
    this.runsLoading.set(true);
    this.ocrService
      .listBenchmarkRuns(benchmarkId)
      .pipe(finalize(() => this.runsLoading.set(false)))
      .subscribe({
        next: (items) => (this.runsDataSource.data = items),
        error: (err) =>
          this.utilityService.swalPopup(
            'Failed to load runs',
            err?.error?.detail || 'Please try again.',
            'error',
          ),
      });
  }

  triggerRun(): void {
    const b = this.selectedBenchmark();
    if (!b) return;
    const { extractionModel, validationModel, enableFinancialValidation } = this.runForm.getRawValue();
    this.runSubmitting.set(true);
    this.ocrService
      .runBenchmarkEval(b.benchmark_id, extractionModel, validationModel, enableFinancialValidation)
      .pipe(finalize(() => this.runSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.showRunForm.set(false);
          this.loadRuns(b.benchmark_id);
        },
        error: (err) =>
          this.utilityService.swalPopup('Run failed', err?.error?.detail || 'Please try again.', 'error'),
      });
  }

  getRunStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-badge--completed';
      case 'failed': return 'status-badge--failed';
      case 'running': return 'status-badge--processing';
      default: return 'status-badge--queued';
    }
  }

  acc(value: number | null | undefined): string {
    return value != null ? `${(value as number).toFixed(1)}%` : '—';
  }

  formatDate(value?: string | null): string {
    if (!value) return '—';
    try {
      const normalized = /[Z+]/.test(value.slice(-6)) ? value : value + 'Z';
      return formatDate(normalized, 'dd/MM/yyyy, hh:mm a', 'en-IN', 'Asia/Kolkata');
    } catch {
      return value;
    }
  }

  truncate(value: string, max = 18): string {
    if (!value || value.length <= max) return value;
    return `${value.slice(0, 8)}...${value.slice(-7)}`;
  }
}
