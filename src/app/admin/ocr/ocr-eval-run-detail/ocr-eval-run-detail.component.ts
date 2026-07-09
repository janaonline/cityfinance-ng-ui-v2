import { CommonModule, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { finalize } from 'rxjs';
import { saveAs } from 'file-saver';
import { MaterialModule } from '../../../material.module';
import { UtilityService } from '../../../core/services/utility.service';
import { EvalRunDetail, EvalRunRowResult, OcrService } from '../ocr.service';

interface FieldCell {
  label: string;
  benchmark: string;
  extracted: string;
  match: boolean | null;
}

interface ResultRow {
  jobId: string;
  sourceJobId: string;
  filename: string;
  status: string;
  inputUlb: string;
  inputFy: string;
  inputDocType: string;
  fields: FieldCell[];
  overallMatch: boolean;
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
  readonly displayedColumns = ['jobFile', 'input', 'benchmark', 'error'];

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

  private boolText(value: boolean | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return value ? 'Yes' : 'No';
  }

  private mapRow(r: EvalRunRowResult): ResultRow {
    const bmk = r.benchmark_value || {};
    const ext = r.extracted || {};
    const match = r.match || ({} as EvalRunRowResult['match']);

    const fields: FieldCell[] = [
      { label: 'ULB', benchmark: bmk.ulb_name || '—', extracted: ext.ulb_name || '—', match: match.ulb_name ?? null },
      { label: 'FY', benchmark: bmk.financial_year || '—', extracted: ext.financial_year || '—', match: match.financial_year ?? null },
      { label: 'Doc Type', benchmark: bmk.doc_type || '—', extracted: ext.document_type || '—', match: match.doc_type ?? null },
      { label: 'Language', benchmark: bmk.language || '—', extracted: ext.language_detected || '—', match: match.language ?? null },
      { label: 'Seal', benchmark: this.boolText(bmk.seal_present), extracted: this.boolText(ext.seal_present), match: match.seal_present ?? null },
      { label: 'Signature', benchmark: this.boolText(bmk.signature_present), extracted: this.boolText(ext.signature_present), match: match.signature_present ?? null },
      { label: 'Table', benchmark: this.boolText(bmk.table_present), extracted: this.boolText(ext.table_present), match: match.table_present ?? null },
    ];

    return {
      jobId: r.job_id || '—',
      sourceJobId: r.source_job_id || '—',
      filename: r.filename || '—',
      status: r.status || '—',
      inputUlb: r.input_value?.ulb_name || '—',
      inputFy: r.input_value?.financial_year || '—',
      inputDocType: r.input_value?.doc_type || '—',
      fields,
      overallMatch: match.overall ?? false,
      error: r.error || '—',
    };
  }
}
