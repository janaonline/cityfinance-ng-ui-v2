import { CommonModule, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { UtilityService } from '../../../core/services/utility.service';
import { EvalRunDetail, EvalRunJobResult, OcrService } from '../ocr.service';

interface ResultRow {
  jobId: string;
  filename: string;
  expectedUlb: string;
  expectedFy: string;
  expectedDocType: string;
  extractedUlb: string;
  extractedFy: string;
  extractedDocType: string;
  ulbMatch: boolean | null;
  fyMatch: boolean | null;
  docTypeMatch: boolean | null;
  overallMatch: boolean;
  error: string;
}

@Component({
  standalone: true,
  selector: 'app-ocr-eval-run-detail',
  imports: [CommonModule, RouterLink, MaterialModule, MatTableModule, MatPaginatorModule],
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

  readonly dataSource = new MatTableDataSource<ResultRow>([]);
  readonly displayedColumns = ['jobFile', 'expected', 'extracted', 'match', 'error'];

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
          this.utilityService.swalPopup(
            'Failed to load run',
            err?.error?.detail || 'Please try again.',
            'error',
          ),
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
      return formatDate(normalized, 'dd/MM/yyyy, hh:mm:ss a', 'en-IN', 'Asia/Kolkata');
    } catch {
      return value;
    }
  }

  truncate(value: string, max = 22): string {
    if (!value || value === '—' || value.length <= max) return value;
    return `${value.slice(0, 9)}...${value.slice(-9)}`;
  }

  private mapRow(r: EvalRunJobResult): ResultRow {
    return {
      jobId: r.job_id || '—',
      filename: r.filename || '—',
      expectedUlb: r.expected_ulb_name || '—',
      expectedFy: r.expected_financial_year || '—',
      expectedDocType: r.expected_doc_type || '—',
      extractedUlb: r.extracted_ulb_name || '—',
      extractedFy: r.extracted_financial_year || '—',
      extractedDocType: r.extracted_doc_type || '—',
      ulbMatch: r.ulb_name_match ?? null,
      fyMatch: r.financial_year_match ?? null,
      docTypeMatch: r.doc_type_match ?? null,
      overallMatch: r.overall_match ?? false,
      error: r.error || '—',
    };
  }
}
