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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, startWith, switchMap, takeWhile, tap, timer } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { IULB } from '../../../core/models/ulb';
import { CommonService } from '../../../core/services/common.service';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../core/services/utility.service';
import { OcrService } from '../ocr.service';
import {
  OcrFinancialSummary,
  OcrValidationJobTracker,
  OcrValidationResult,
  OcrValidationStatus,
} from './ocr-validation-models';

interface ModelOption {
  value: string;
  label: string;
}

interface SelectOption<T = string> {
  value: T;
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
  private readonly commonService = inject(CommonService);
  private readonly utilityService = inject(UtilityService);
  readonly globalLoader = inject(GlobalLoaderService);

  readonly maxFileSizeMb = 50;

  readonly models: ModelOption[] = [
    { value: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite Preview' },
    { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ];

  readonly documentTypes: SelectOption[] = [
    { value: 'BALANCE_SHEET', label: 'Balance Sheet' },
    { value: 'BALANCE_SHEET_SCHEDULE', label: 'Balance Sheet Schedule' },
    { value: 'INCOME_EXPENDITURE', label: 'Income and Expenditure' },
    { value: 'INCOME_EXPENDITURE_SCHEDULE', label: 'Income and Expenditure Schedule' },
    { value: 'CASH_FLOW', label: 'Cash Flow Statement' },
    { value: 'AUDITOR_REPORT', label: 'Auditors Report' },
  ];

  readonly financialYears: SelectOption[] = [
    { value: '2025-26', label: '2025-26' },
    { value: '2024-25', label: '2024-25' },
    { value: '2023-24', label: '2023-24' },
    { value: '2022-23', label: '2022-23' },
    { value: '2021-22', label: '2021-22' },
    { value: '2020-21', label: '2020-21' },
    { value: '2019-20', label: '2019-20' },
  ];

  readonly orientationCheckOptions: SelectOption<boolean>[] = [
    { value: false, label: 'False' },
    { value: true, label: 'True' },
  ];

  readonly form = this.fb.group({
    extractionModel: this.fb.nonNullable.control(
      'gemini-3.1-flash-lite-preview',
      Validators.required,
    ),
    validationModel: this.fb.nonNullable.control('gemini-3.1-pro-preview', Validators.required),
    docType: this.fb.control<string | null>(null),
    financialYear: this.fb.control<string | null>(null),
    ulb: this.fb.control<IULB | string | null>(null, this.ulbSelectionValidator()),
    enableOrientationCheck: this.fb.control<boolean | null>(null),
  });

  selectedFiles: File[] = [];
  readonly isSubmitting = signal(false);
  readonly jobs = signal<OcrValidationJobTracker[]>([]);
  readonly hasJobs = computed(() => this.jobs().length > 0);
  readonly filteredUlbs = signal<IULB[]>([]);
  readonly ulbSearchInProgress = signal(false);
  readonly selectedUlb = toSignal(
    this.form.controls.ulb.valueChanges.pipe(
      startWith(this.form.controls.ulb.value),
      map((value) => (value && typeof value !== 'string' ? value : undefined)),
    ),
  );

  constructor() {
    this.globalLoader.hideLayout();
  }

  ngOnInit(): void {
    this.setupUlbAutocomplete();
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

    const { extractionModel, validationModel, docType, financialYear, ulb, enableOrientationCheck } =
      this.form.getRawValue();
    const ulbName = this.selectedUlb()?.name ?? (typeof ulb === 'string' ? ulb : null);
    this.isSubmitting.set(true);
    if (this.selectedFiles.length === 1) {
      this.ocrService
        .submitOcrValidationJob(
          this.selectedFiles[0],
          extractionModel,
          validationModel,
          this.selectedUlb(),
          financialYear,
          docType,
          null,
          enableOrientationCheck ?? undefined,
        )
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
        .submitOcrValidationBatch(
          files,
          extractionModel,
          validationModel,
          ulbName,
          financialYear,
          docType,
          enableOrientationCheck ?? undefined,
        )
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

  getSummaryEntries(summary: OcrFinancialSummary): Array<{ key: string; value: number | null }> {
    return Object.entries(summary).map(([key, value]) => ({ key, value: value as number | null }));
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
    return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' } as Intl.DateTimeFormatOptions);
  }

  toJsonString(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  hasFinancialFigures(result: OcrValidationResult | null): boolean {
    if (!result?.financial_figures) return false;
    const ff = result.financial_figures;
    if (ff.extracted_items?.length > 0) return true;
    return Object.values(ff.summary ?? {}).some((v) => v !== null);
  }

  downloadHtml(job: OcrValidationJobTracker): void {
    const html = this.buildReportHtml(job);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.filename.replace(/\.pdf$/i, '')}_validation_report.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private buildReportHtml(job: OcrValidationJobTracker): string {
    const r = job.result!;
    const esc = (s: unknown): string =>
      String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmt = (n: number | null | undefined, decimals = 2): string =>
      n == null ? '—' : n.toLocaleString('en-IN', { maximumFractionDigits: decimals });
    const fmtKey = (k: string): string =>
      k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const assessmentColor: Record<string, string> = {
      PASS: '#166534', WARNING: '#92400e', FAIL: '#9f1239',
      ERROR: '#9f1239', FAILED_EXTRACTION: '#9a3412',
    };
    const assessmentBg: Record<string, string> = {
      PASS: '#dcfce7', WARNING: '#fef9c3', FAIL: '#fee2e2',
      ERROR: '#fee2e2', FAILED_EXTRACTION: '#ffedd5',
    };
    const assessmentBorder: Record<string, string> = {
      PASS: '#22c55e', WARNING: '#f59e0b', FAIL: '#f43f5e',
      ERROR: '#f43f5e', FAILED_EXTRACTION: '#f97316',
    };
    const checkBadge: Record<string, string> = {
      PASS: 'background:#dcfce7;color:#166534',
      WARNING: 'background:#fef9c3;color:#92400e',
      FAIL: 'background:#fee2e2;color:#b91c1c',
    };

    const renderVal = (v: unknown): string => {
      if (v == null) return '<span style="color:#94a3b8">—</span>';
      if (Array.isArray(v)) {
        if (v.length === 0) return '<span style="color:#94a3b8">—</span>';
        if (typeof v[0] === 'object' && v[0] !== null) {
          const headers = Object.keys(v[0] as object);
          const th = headers
            .map((h) => `<th style="padding:.35rem .6rem;text-align:left;background:#f1f5f9;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap">${esc(fmtKey(h))}</th>`)
            .join('');
          const rows = (v as Record<string, unknown>[])
            .map(
              (row, ri) =>
                `<tr style="background:${ri % 2 === 0 ? '#fff' : '#f8fafc'}">${headers.map((h) => `<td style="padding:.35rem .6rem;border-top:1px solid #e2e8f0;vertical-align:top">${renderVal(row[h])}</td>`).join('')}</tr>`,
            )
            .join('');
          return `<table style="width:100%;border-collapse:collapse;font-size:.85rem;margin:.25rem 0"><thead><tr>${th}</tr></thead><tbody>${rows}</tbody></table>`;
        }
        return (v as unknown[]).map((item) => esc(item)).join(', ');
      }
      if (typeof v === 'object') {
        return Object.entries(v as Record<string, unknown>)
          .map(
            ([k, val]) =>
              `<div style="display:flex;gap:.5rem;padding:.15rem 0"><span style="color:#64748b;white-space:nowrap;min-width:120px">${esc(fmtKey(k))}:</span><span style="font-weight:600">${renderVal(val)}</span></div>`,
          )
          .join('');
      }
      if (typeof v === 'number') return fmt(v, 2);
      if (typeof v === 'boolean') return v ? 'Yes' : 'No';
      return esc(String(v));
    };

    const assessment = r.overall_assessment?.toUpperCase() ?? '';
    const bannerColor = assessmentColor[assessment] ?? '#475569';
    const bannerBg = assessmentBg[assessment] ?? '#f8fafc';
    const bannerBorder = assessmentBorder[assessment] ?? '#94a3b8';

    const metaRows = r.extraction
      ? [
        ['ULB Name', r.extraction.ulb_name],
        ['Original ULB Name', r.extraction.original_ulb_name],
        ['Document Type', r.extraction.document_type],
        ['Financial Year', r.extraction.financial_year],
        ['Language', r.extraction.language_detected],
        ['Seal Present', r.extraction.seal_present == null ? null : r.extraction.seal_present ? 'Yes' : 'No'],
        ['Page Count', r.extraction.page_count],
      ]
        .filter(([, v]) => v != null)
        .map(([l, v]) => `<tr><td style="color:#64748b;width:45%">${esc(l)}</td><td style="font-weight:600">${esc(v)}</td></tr>`)
        .join('')
      : '';

    const procRows = [
      ['Total Time', r.processing_time_seconds != null ? `${fmt(r.processing_time_seconds, 1)} s` : null],
      ...(r.step_timings ? Object.entries(r.step_timings).map(([k, v]) => [fmtKey(k), v != null ? `${fmt(v as number, 1)} s` : '—']) : []),
      ['Extraction Model', r.extraction_model],
      ['Validation Model', r.validation_model],
    ]
      .filter(([, v]) => v != null)
      .map(([l, v]) => `<tr><td style="color:#64748b;width:45%">${esc(l)}</td><td style="font-weight:600;font-family:monospace">${esc(v)}</td></tr>`)
      .join('');

    const basicValidation = r.basic_validation
      ? (() => {
        const isPass = r.basic_validation.validation_status === 'PASS';
        const bc = isPass ? '#22c55e' : '#f43f5e';
        const bbg = isPass ? '#f0fdf4' : '#fff1f2';
        const btxt = isPass ? '#166534' : '#991b1b';
        const failedItems = r.basic_validation.failed_checks?.length
          ? `<ul style="margin:.5rem 0 0;padding-left:1.25rem;color:#991b1b">${r.basic_validation.failed_checks.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`
          : '';
        const detail = r.basic_validation.validation_details
          ? `<p style="margin:.25rem 0 0;color:#374151">${esc(r.basic_validation.validation_details)}</p>`
          : '';
        return `<section>
            <h5 style="color:#1e3a5f;margin:0 0 .5rem">Basic Validation</h5>
            <div style="padding:.85rem 1rem;border-radius:10px;border-left:4px solid ${bc};background:${bbg}">
              <span style="font-weight:800;font-size:.82rem;letter-spacing:.04em;color:${btxt}">${esc(r.basic_validation.validation_status)}</span>
              ${detail}${failedItems}
            </div>
          </section>`;
      })()
      : '';

    const financialSection = r.financial_figures
      ? (() => {
          const ff = r.financial_figures!;
          const summaryEntries = (
            Object.entries(ff.summary ?? {}) as [string, number | null][]
          ).filter(([, v]) => v != null) as [string, number][];
          const summaryTable =
            summaryEntries.length > 0
              ? `<table style="width:100%;border-collapse:collapse;font-size:.88rem;margin-bottom:1rem">
                <thead><tr style="background:#f1f5f9">
                  <th style="padding:.5rem .75rem;text-align:left;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em">Summary</th>
                  <th style="padding:.5rem .75rem;text-align:right;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em">Amount</th>
                </tr></thead>
                <tbody>${summaryEntries
                  .map(
                    ([k, v], i) =>
                      `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
                        <td style="padding:.45rem .75rem;border-top:1px solid #e2e8f0;color:#1e3a5f">${esc(fmtKey(k))}</td>
                        <td style="padding:.45rem .75rem;border-top:1px solid #e2e8f0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums">${fmt(v)}</td>
                      </tr>`,
                  )
                  .join('')}</tbody>
              </table>`
              : '';
          const itemsTable =
            ff.extracted_items?.length > 0
              ? `<div style="font-weight:700;color:#1e3a5f;margin-bottom:.4rem;font-size:.9rem">Extracted Line Items</div>
               <table style="width:100%;border-collapse:collapse;font-size:.85rem">
                <thead><tr style="background:#f1f5f9">
                  <th style="padding:.4rem .6rem;text-align:left;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em">Line Item</th>
                  <th style="padding:.4rem .6rem;text-align:left;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em">Category</th>
                  <th style="padding:.4rem .6rem;text-align:right;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em">Amount</th>
                </tr></thead>
                <tbody>${ff.extracted_items
                  .map(
                    (item, i) =>
                      `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
                        <td style="padding:.35rem .6rem;border-top:1px solid #e2e8f0;color:#1e3a5f">${esc(item.line_item)}</td>
                        <td style="padding:.35rem .6rem;border-top:1px solid #e2e8f0;color:#64748b">${esc(item.category ?? '')}</td>
                        <td style="padding:.35rem .6rem;border-top:1px solid #e2e8f0;text-align:right;font-weight:600;font-variant-numeric:tabular-nums">${item.amount != null ? fmt(item.amount) : '<span style="color:#94a3b8">—</span>'}</td>
                      </tr>`,
                  )
                  .join('')}</tbody>
              </table>`
              : '';
          return summaryTable || itemsTable
            ? `<section>
                <h5 style="color:#1e3a5f;margin:0 0 .75rem">Financial Figures</h5>
                ${summaryTable}${itemsTable}
              </section>`
            : '';
        })()
      : '';

    const validationsSection = r.validations?.length
      ? `<section>
        <h5 style="color:#1e3a5f;margin:0 0 .75rem">Validation Checks</h5>
        <table style="width:100%;border-collapse:collapse;font-size:.88rem">
          <thead><tr style="background:#f1f5f9">
            <th style="padding:.5rem .85rem;text-align:left;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em">Check</th>
            <th style="padding:.5rem .85rem;text-align:left;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em">Status</th>
            <th style="padding:.5rem .85rem;text-align:left;color:#475569;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em">Message</th>
          </tr></thead>
          <tbody>${r.validations
        .map((v) => {
          const bs = checkBadge[v.status?.toUpperCase()] ?? 'background:#f1f5f9;color:#475569';
          return `<tr>
                <td style="padding:.5rem .85rem;border-top:1px solid #e2e8f0;color:#1e3a5f;font-weight:500;min-width:180px">${esc(v.check)}</td>
                <td style="padding:.5rem .85rem;border-top:1px solid #e2e8f0">
                  <span style="display:inline-block;padding:.2rem .55rem;border-radius:6px;font-size:.78rem;font-weight:700;${bs}">${esc(v.status)}</span>
                </td>
                <td style="padding:.5rem .85rem;border-top:1px solid #e2e8f0;color:#374151;line-height:1.5">${esc(v.message)}</td>
              </tr>`;
        })
        .join('')}</tbody>
        </table>
      </section>`
      : '';

    const ocrNotes = r.ocr_notes
      ? `<section>
        <h5 style="color:#1e3a5f;margin:0 0 .5rem">OCR Notes</h5>
        <p style="margin:0;padding:.75rem 1rem;background:#f8fafc;border-left:3px solid #94a3b8;border-radius:0 8px 8px 0;color:#475569;line-height:1.6">${esc(r.ocr_notes)}</p>
      </section>`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Validation Report — ${esc(job.filename)}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#0f172a;margin:0;padding:2rem;background:#f8fbff}
    h1,h2,h3,h4,h5,h6{margin:0}
    section{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.04)}
    table{border-collapse:collapse}
    @media print{body{padding:0}section{box-shadow:none;break-inside:avoid}}
  </style>
</head>
<body>
<div style="max-width:960px;margin:0 auto;display:grid;gap:1.5rem">

  <!-- Header -->
  <header style="background:linear-gradient(135deg,#123b69,#2563eb);border-radius:16px;padding:1.75rem;color:#fff">
    <h1 style="font-size:1.4rem;margin:0 0 .5rem">OCR Validation Report</h1>
    <p style="margin:0;opacity:.85;font-size:.92rem">${esc(job.filename)}</p>
    <p style="margin:.25rem 0 0;opacity:.65;font-size:.8rem;font-family:monospace">Job ID: ${esc(job.jobId)} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')}</p>
  </header>

  ${r.overall_assessment
        ? `<section style="background:${bannerBg};border-left:5px solid ${bannerBorder};color:${bannerColor}">
      <div style="display:flex;align-items:flex-start;gap:.75rem">
        <span style="display:inline-block;padding:.25rem .65rem;border-radius:6px;font-size:.82rem;font-weight:800;letter-spacing:.04em;background:${bannerColor};color:#fff;flex-shrink:0">${esc(r.overall_assessment)}</span>
        ${r.summary ? `<p style="margin:0;font-size:.92rem;line-height:1.5">${esc(r.summary)}</p>` : ''}
      </div>
    </section>`
        : ''
      }

  <!-- Metadata + Processing side by side -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
    ${metaRows
        ? `<section>
        <h5 style="color:#1e3a5f;margin:0 0 .75rem">Document Metadata</h5>
        <table style="width:100%;font-size:.88rem"><tbody>${metaRows}</tbody></table>
      </section>`
        : ''
      }
    <section>
      <h5 style="color:#1e3a5f;margin:0 0 .75rem">Processing Info</h5>
      <table style="width:100%;font-size:.88rem"><tbody>${procRows}</tbody></table>
    </section>
  </div>

  ${basicValidation}
  ${financialSection}
  ${validationsSection}
  ${ocrNotes}

</div>
</body>
</html>`;
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
        map((value) => (typeof value === 'string' ? value : value?.name ?? '').trim()),
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
