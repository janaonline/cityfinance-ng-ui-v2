import { CommonModule, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { finalize } from 'rxjs';
import { saveAs } from 'file-saver';
import { MaterialModule } from '../../../material.module';
import { UtilityService } from '../../../core/services/utility.service';
import { EvalRunDetail, EvalRunJobResult, OcrService } from '../ocr.service';

type Change = 'improved' | 'regressed' | 'same-pass' | 'same-fail' | 'na';

interface ResultRow {
  jobId: string;
  filename: string;
  expectedUlb: string;
  expectedFy: string;
  expectedDocType: string;
  // Benchmark (original stored extraction)
  bmkUlb: string;
  bmkFy: string;
  bmkDocType: string;
  bmkUlbMatch: boolean | null;
  bmkFyMatch: boolean | null;
  bmkDocTypeMatch: boolean | null;
  bmkOverallMatch: boolean | null;
  // New extraction
  newUlb: string;
  newFy: string;
  newDocType: string;
  newUlbMatch: boolean | null;
  newFyMatch: boolean | null;
  newDocTypeMatch: boolean | null;
  newOverallMatch: boolean;
  // Change indicators
  ulbChange: Change;
  fyChange: Change;
  docTypeChange: Change;
  overallChange: Change;
  error: string;
}

@Component({
  standalone: true,
  selector: 'app-ocr-eval-run-detail',
  imports: [CommonModule, MaterialModule, MatTableModule, MatPaginatorModule],
  templateUrl: './ocr-eval-run-detail.component.html',
  styleUrl: './ocr-eval-run-detail.component.scss',
})
export class OcrEvalRunDetailComponent implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly run = signal<EvalRunDetail | null>(null);
  readonly loading = signal(false);
  readonly exporting = signal(false);

  readonly dataSource = new MatTableDataSource<ResultRow>([]);
  readonly displayedColumns = ['jobFile', 'expected', 'benchmark', 'newRun', 'change', 'error'];

  ngOnInit(): void {
    const runId = this.route.snapshot.queryParamMap.get('runId');
    if (runId) this.loadRun(runId);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator ?? null;
  }

  loadRun(runId: string): void {
    this.loading.set(true);
    this.ocrService
      .getEvalRunDetail(runId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (detail) => {
          this.run.set(detail);
          this.dataSource.data = (detail.results || []).map((r) => this.mapRow(r));
        },
        error: (err) =>
          this.utilityService.swalPopup('Failed to load run', err?.error?.detail || 'Please try again.', 'error'),
      });
  }

  downloadDump(): void {
    const runId = this.run()?.eval_run_id;
    if (!runId) return;
    this.exporting.set(true);
    this.ocrService
      .exportEvalRun(runId)
      .pipe(finalize(() => this.exporting.set(false)))
      .subscribe({
        next: (blob) => saveAs(blob as Blob, `eval_run_${runId.slice(0, 8)}.xlsx`),
        error: (err) =>
          this.utilityService.swalPopup('Export failed', err?.error?.detail || 'Please try again.', 'error'),
      });
  }

  refresh(): void {
    const runId = this.run()?.eval_run_id ?? this.route.snapshot.queryParamMap.get('runId');
    if (runId) this.loadRun(runId);
  }

  matchIcon(v: boolean | null): string {
    if (v === null) return 'remove';
    return v ? 'check_circle' : 'cancel';
  }

  matchClass(v: boolean | null): string {
    if (v === null) return 'match-na';
    return v ? 'match-yes' : 'match-no';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'status-badge--completed';
      case 'failed':
        return 'status-badge--failed';
      case 'running':
        return 'status-badge--processing';
      default:
        return 'status-badge--queued';
    }
  }

  acc(value: number | null | undefined): string {
    return value != null ? `${(value as number).toFixed(1)}%` : '—';
  }

  formatDate(value?: string | null): string {
    if (!value) return '—';
    try {
      const normalized = /[Z+]/.test(value.slice(-6)) ? value : value + 'Z';
      return formatDate(normalized, 'dd/MM/yyyy, hh:mm:ss a', 'en-IN', 'Asia/Kolkata');
    } catch {
      return value;
    }
  }

  truncate(value: string, max = 22): string {
    if (!value || value === '—' || value.length <= max) return value;
    return `${value.slice(0, 9)}...${value.slice(-9)}`;
  }

  changeIcon(c: Change): string {
    switch (c) {
      case 'improved':
        return 'trending_up';
      case 'regressed':
        return 'trending_down';
      case 'same-pass':
        return 'check_circle';
      case 'same-fail':
        return 'cancel';
      default:
        return 'remove';
    }
  }

  changeClass(c: Change): string {
    switch (c) {
      case 'improved':
        return 'change-improved';
      case 'regressed':
        return 'change-regressed';
      case 'same-pass':
        return 'change-pass';
      case 'same-fail':
        return 'change-fail';
      default:
        return 'change-na';
    }
  }

  private computeChange(before: boolean | null, after: boolean | null | undefined): Change {
    const a = after ?? null;
    if (before === null && a === null) return 'na';
    if (a === true && before !== true) return 'improved';
    if (a === false && before === true) return 'regressed';
    if (a === true && before === true) return 'same-pass';
    return 'same-fail';
  }

  private mapRow(r: EvalRunJobResult): ResultRow {
    const bmkUlb = r.benchmark_ulb_name_match ?? null;
    const bmkFy = r.benchmark_financial_year_match ?? null;
    const bmkDt = r.benchmark_doc_type_match ?? null;
    const bmkOvr = r.benchmark_overall_match ?? null;
    const newUlb = r.ulb_name_match ?? null;
    const newFy = r.financial_year_match ?? null;
    const newDt = r.doc_type_match ?? null;
    const newOvr = r.overall_match ?? false;

    return {
      jobId: r.job_id || '—',
      filename: r.filename || '—',
      expectedUlb: r.expected_ulb_name || '—',
      expectedFy: r.expected_financial_year || '—',
      expectedDocType: r.expected_doc_type || '—',
      bmkUlb: r.benchmark_ulb_name || '—',
      bmkFy: r.benchmark_financial_year || '—',
      bmkDocType: r.benchmark_doc_type || '—',
      bmkUlbMatch: bmkUlb,
      bmkFyMatch: bmkFy,
      bmkDocTypeMatch: bmkDt,
      bmkOverallMatch: bmkOvr,
      newUlb: r.extracted_ulb_name || '—',
      newFy: r.extracted_financial_year || '—',
      newDocType: r.extracted_doc_type || '—',
      newUlbMatch: newUlb,
      newFyMatch: newFy,
      newDocTypeMatch: newDt,
      newOverallMatch: newOvr,
      ulbChange: this.computeChange(bmkUlb, newUlb),
      fyChange: this.computeChange(bmkFy, newFy),
      docTypeChange: this.computeChange(bmkDt, newDt),
      overallChange: this.computeChange(bmkOvr, newOvr),
      error: r.error || '—',
    };
  }
}
