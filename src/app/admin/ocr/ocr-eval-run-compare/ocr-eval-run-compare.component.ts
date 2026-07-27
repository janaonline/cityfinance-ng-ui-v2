import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { UtilityService } from '../../../core/services/utility.service';
import { EvalExtractedValue, EvalRowCompare, EvalRunCompareResponse, MetricDelta, OcrService } from '../ocr.service';

interface FieldCompareCell {
  label: string;
  runAValue: string;
  runBValue: string;
  change: string;
}

interface CompareRow {
  sourceJobId: string;
  filename: string;
  bmkUlb: string;
  bmkFy: string;
  bmkDocType: string;
  bmkSeal: string;
  bmkSignature: string;
  bmkTable: string;
  bmkAuditDate: string;
  bmkDocQuality: string;
  bmkFinalStatus: string;
  fields: FieldCompareCell[];
  overallChange: string;
  runAError: string | null;
  runBError: string | null;
}

const FIELD_DEFS: { label: string; key: string }[] = [
  { label: 'ULB', key: 'ulb_name' },
  { label: 'FY', key: 'financial_year' },
  { label: 'Doc Type', key: 'doc_type' },
  { label: 'Seal', key: 'seal_present' },
  { label: 'Signature', key: 'signature_present' },
  { label: 'Table', key: 'table_present' },
  { label: 'Audit Date', key: 'audit_date_present' },
  { label: 'Doc Quality', key: 'doc_quality_good' },
  { label: 'Final Status', key: 'final_status' },
];

const METRIC_LABELS: Record<string, string> = {
  total: 'Total',
  errored: 'Errored',
  successful: 'Successful',
  ulb_name_accuracy: 'ULB Accuracy',
  financial_year_accuracy: 'FY Accuracy',
  doc_type_accuracy: 'Doc Type Accuracy',
  seal_present_accuracy: 'Seal Accuracy',
  signature_present_accuracy: 'Signature Accuracy',
  table_present_accuracy: 'Table Accuracy',
  audit_date_present_accuracy: 'Audit Date Accuracy',
  doc_quality_good_accuracy: 'Doc Quality Accuracy',
  final_status_accuracy: 'Final Status Accuracy',
};

const HIDDEN_METRIC_KEYS = new Set(['language_accuracy', 'overall_accuracy']);

@Component({
  standalone: true,
  selector: 'app-ocr-eval-run-compare',
  imports: [CommonModule, FormsModule, MaterialModule, MatTableModule],
  templateUrl: './ocr-eval-run-compare.component.html',
  styleUrl: './ocr-eval-run-compare.component.scss',
})
export class OcrEvalRunCompareComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ocrService = inject(OcrService);
  private readonly utilityService = inject(UtilityService);

  readonly runIdAInput = signal('');
  readonly runIdBInput = signal('');
  readonly loading = signal(false);
  readonly comparison = signal<EvalRunCompareResponse | null>(null);

  readonly dataSource = new MatTableDataSource<CompareRow>([]);
  readonly displayedColumns = ['jobFile', 'benchmark', 'fields', 'change'];

  readonly metricEntries = signal<{ key: string; label: string; delta: MetricDelta }[]>([]);

  ngOnInit(): void {
    const a = this.route.snapshot.queryParamMap.get('runIdA') || '';
    const b = this.route.snapshot.queryParamMap.get('runIdB') || '';
    this.runIdAInput.set(a);
    this.runIdBInput.set(b);
    if (a && b) this.loadComparison(a, b);
  }

  compare(): void {
    const a = this.runIdAInput().trim();
    const b = this.runIdBInput().trim();
    if (!a || !b) {
      this.utilityService.swalPopup('Both run IDs required', 'Enter Run A and Run B IDs to compare.', 'warning');
      return;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: { runIdA: a, runIdB: b } });
    this.loadComparison(a, b);
  }

  private loadComparison(runIdA: string, runIdB: string): void {
    this.loading.set(true);
    this.ocrService
      .compareEvalRuns(runIdA, runIdB)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.comparison.set(res);
          this.dataSource.data = res.rows.map((r) => this.mapRow(r));
          this.metricEntries.set(
            Object.entries(res.metrics_delta)
              .filter(([key]) => !HIDDEN_METRIC_KEYS.has(key))
              .map(([key, delta]) => ({
                key,
                label: METRIC_LABELS[key] || key,
                delta,
              })),
          );
        },
        error: (err) =>
          this.utilityService.swalPopup('Compare failed', err?.error?.detail || 'Please try again.', 'error'),
      });
  }

  changeIcon(c: string): string {
    switch (c) {
      case 'Improved':
        return 'trending_up';
      case 'Regressed':
        return 'trending_down';
      case 'Same (Pass)':
        return 'check_circle';
      case 'Same (Fail)':
        return 'cancel';
      default:
        return 'remove';
    }
  }

  changeClass(c: string): string {
    switch (c) {
      case 'Improved':
        return 'change-improved';
      case 'Regressed':
        return 'change-regressed';
      case 'Same (Pass)':
        return 'change-pass';
      case 'Same (Fail)':
        return 'change-fail';
      default:
        return 'change-na';
    }
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

  deltaText(d: MetricDelta): string {
    if (d.delta === null || d.delta === undefined) return '—';
    const sign = d.delta > 0 ? '+' : '';
    return `${sign}${d.delta}`;
  }

  deltaClass(d: MetricDelta): string {
    if (d.delta === null || d.delta === undefined || d.delta === 0) return 'delta-flat';
    return d.delta > 0 ? 'delta-up' : 'delta-down';
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

  truncate(value: string, max = 22): string {
    if (!value || value === '—' || value.length <= max) return value;
    return `${value.slice(0, 9)}...${value.slice(-9)}`;
  }

  private boolText(value: boolean | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return value ? 'Yes' : 'No';
  }

  private extractedText(ext: EvalExtractedValue | undefined | null, label: string): string {
    if (!ext) return '—';
    switch (label) {
      case 'ULB':
        return ext.ulb_name || '—';
      case 'FY':
        return ext.financial_year || '—';
      case 'Doc Type':
        return ext.document_type || '—';
      case 'Seal':
        return this.boolText(ext.seal_present);
      case 'Signature':
        return this.boolText(ext.signature_present);
      case 'Table':
        return this.boolText(ext.table_present);
      case 'Audit Date':
        return ext.audited_date || '—';
      case 'Doc Quality':
        return ext.pdf_quality_status || '—';
      case 'Final Status':
        return ext.document_status || '—';
      default:
        return '—';
    }
  }

  private mapRow(r: EvalRowCompare): CompareRow {
    const bmk = r.benchmark_value || {};
    const fields: FieldCompareCell[] = FIELD_DEFS.map(({ label, key }) => ({
      label,
      runAValue: this.extractedText(r.run_a?.extracted, label),
      runBValue: this.extractedText(r.run_b?.extracted, label),
      change: r.field_changes[key] || 'N/A',
    }));

    return {
      sourceJobId: r.source_job_id || '—',
      filename: r.filename || '—',
      bmkUlb: bmk.ulb_name || '—',
      bmkFy: bmk.financial_year || '—',
      bmkDocType: bmk.doc_type || '—',
      bmkSeal: this.boolText(bmk.seal_present),
      bmkSignature: this.boolText(bmk.signature_present),
      bmkTable: this.boolText(bmk.table_present),
      bmkAuditDate: this.boolText(bmk.audit_date_present),
      bmkDocQuality: this.boolText(bmk.doc_quality_good),
      bmkFinalStatus: bmk.final_status || '—',
      fields,
      overallChange: r.overall_change,
      runAError: r.run_a?.error ?? null,
      runBError: r.run_b?.error ?? null,
    };
  }
}
