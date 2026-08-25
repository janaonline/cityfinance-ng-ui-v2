import { CommonModule, formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { UtilityService } from '../../../core/services/utility.service';
import { EvalBenchmark, EvalRunInfo, OcrService } from '../ocr.service';

@Component({
  standalone: true,
  selector: 'app-ocr-eval-benchmarks',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MaterialModule, MatTableModule],
  templateUrl: './ocr-eval-benchmarks.component.html',
  styleUrl: './ocr-eval-benchmarks.component.scss',
})
export class OcrEvalBenchmarksComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);
  private readonly router = inject(Router);

  @ViewChild('excelFileInput') excelFileInput?: ElementRef<HTMLInputElement>;

  readonly benchmarks = signal<EvalBenchmark[]>([]);
  readonly loading = signal(false);
  readonly creating = signal(false);

  readonly createMode = signal<'jobs' | 'excel'>('excel');
  readonly excelFile = signal<File | null>(null);
  readonly excelName = signal('');

  readonly selectedBenchmark = signal<EvalBenchmark | null>(null);
  readonly runsDataSource = new MatTableDataSource<EvalRunInfo>([]);
  readonly runsLoading = signal(false);
  readonly runSubmitting = signal(false);
  readonly showRunForm = signal(false);

  /** Up to 2 completed run IDs picked for "Compare Runs" navigation. */
  readonly selectedRunIds = signal<string[]>([]);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    jobIds: ['', Validators.required],
  });

  readonly runForm = this.fb.nonNullable.group({
    extractionModel: ['gemini-3-flash-preview'],
    validationModel: ['gemini-2.5-pro'],
    enableFinancialValidation: [false],
  });

  readonly models = this.ocrService.models.filter((m) => !m.deprecated);

  readonly benchmarkColumns = ['name', 'jobCount', 'createdAt', 'action'];
  readonly runColumns = ['select', 'evalRunId', 'models', 'status', 'metrics', 'createdAt', 'action'];

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

  onExcelFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) {
      this.clearExcelFile();
      return;
    }
    const isExcel =
      /\.(xlsx|xls)$/i.test(file.name) ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';
    if (!isExcel) {
      this.resetExcelFileInput();
      this.utilityService.swalPopup('Invalid file', 'Please select an Excel (.xlsx/.xls) file.', 'error');
      return;
    }
    this.excelFile.set(file);
  }

  openExcelFilePicker(): void {
    this.excelFileInput?.nativeElement.click();
  }

  clearExcelFile(): void {
    this.excelFile.set(null);
    this.resetExcelFileInput();
  }

  private resetExcelFileInput(): void {
    if (this.excelFileInput?.nativeElement) {
      this.excelFileInput.nativeElement.value = '';
    }
  }

  createBenchmarkFromExcel(): void {
    const name = this.excelName().trim();
    const file = this.excelFile();
    if (!name) {
      this.utilityService.swalPopup('Name required', 'Give this benchmark a name.', 'warning');
      return;
    }
    if (!file) {
      this.utilityService.swalPopup('File required', 'Please choose an Excel file first.', 'warning');
      return;
    }
    this.creating.set(true);
    this.ocrService
      .createEvalBenchmarkFromExcel(name, file)
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe({
        next: (res) => {
          this.excelName.set('');
          this.clearExcelFile();
          this.loadBenchmarks();
          const skippedDetail = res.skipped
            ? ' ' +
              res.row_results
                .filter((r) => !r.accepted)
                .map((r) => `Row ${r.row_number}: ${r.error}`)
                .join('; ')
            : '';
          this.utilityService.swalPopup(
            'Benchmark created',
            `${res.accepted} row(s) added.${res.skipped ? ` ${res.skipped} row(s) skipped.${skippedDetail}` : ''}`,
            res.skipped ? 'warning' : 'success',
          );
        },
        error: (err) =>
          this.utilityService.swalPopup(
            'Create failed',
            err?.error?.detail || 'Please try again.',
            'error',
          ),
      });
  }

  selectBenchmark(b: EvalBenchmark): void {
    this.selectedBenchmark.set(b);
    this.showRunForm.set(false);
    this.selectedRunIds.set([]);
    if (b.job_ids?.length) {
      this.loadRuns(b.benchmark_id);
    }
  }

  back(): void {
    this.selectedBenchmark.set(null);
    this.runsDataSource.data = [];
    this.showRunForm.set(false);
    this.selectedRunIds.set([]);
  }

  isRunSelectable(r: EvalRunInfo): boolean {
    return r.status === 'completed';
  }

  isRunSelected(r: EvalRunInfo): boolean {
    return this.selectedRunIds().includes(r.eval_run_id);
  }

  toggleRunSelection(r: EvalRunInfo): void {
    if (!this.isRunSelectable(r)) return;
    const current = this.selectedRunIds();
    if (current.includes(r.eval_run_id)) {
      this.selectedRunIds.set(current.filter((id) => id !== r.eval_run_id));
      return;
    }
    if (current.length >= 2) {
      this.utilityService.swalPopup('Two runs max', 'Deselect a run before picking another to compare.', 'warning');
      return;
    }
    this.selectedRunIds.set([...current, r.eval_run_id]);
  }

  compareSelectedRuns(): void {
    const [runIdA, runIdB] = this.selectedRunIds();
    if (!runIdA || !runIdB) return;
    this.router.navigate(['/ocr/eval-run-compare'], { queryParams: { runIdA, runIdB } });
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
