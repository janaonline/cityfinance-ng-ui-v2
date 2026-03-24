import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import {
  OcrEngineConfidence,
  OcrFinancialFigures,
  OcrEngineResult,
  OcrMatchSummaryField,
  OcrResponse,
  OcrUsageMetadata,
} from '../upload-file-ocr/ocr-response';
import { OcrUsageDetailsDialogComponent } from './ocr-usage-details-dialog.component';

interface OcrMatchCell {
  expected: string;
  extracted: string;
  matched: string;
  extra?: string;
}

interface OcrComparisonRow {
  engineKey: string;
  engine: string;
  status: string;
  overallMatch: string;
  docType: OcrMatchCell;
  financialYear: OcrMatchCell;
  languageTag: string;
  auditorInfo: string[];
  asOnDate: string;
  ulbName: OcrMatchCell;
  table: OcrMatchCell;
  confidence: string;
  usageMetadata: OcrUsageMetadata | null;
  financialFigures: OcrFinancialFigures | null;
  issues: string;
  timings: string[];
  ocrUrl: string | null;
  excelUrl: string | null;
}

interface OcrSummaryItem {
  label: string;
  value: string;
  fullWidth?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-ocr-comparison-table',
  imports: [CommonModule, MaterialModule],
  templateUrl: './ocr-comparison-table.component.html',
  styleUrl: './ocr-comparison-table.component.scss',
})
export class OcrComparisonTableComponent {
  response = input.required<OcrResponse>();
  readonly dialog = inject(MatDialog);
  readonly copiedSummaryLabel = signal<string | null>(null);

  readonly showAuditorInfo = computed(() => {
    const response = this.response();
    const expectedDocType = `${response.expected?.doc_type || ''}`.toLowerCase();

    if (expectedDocType.includes('auditor')) {
      return true;
    }

    return Object.values(response.engines || {}).some((engine) =>
      `${engine.match_summary?.doc_type?.extracted || engine.result?.doc_type || ''}`
        .toLowerCase()
        .includes('auditor'),
    );
  });

  readonly summaryItems = computed<OcrSummaryItem[]>(() => {
    const response = this.response();

    return [
      {
        label: 'File Name',
        value: this.formatValue(response.file_info?.filename ?? response.filename),
        fullWidth: true,
      },
      { label: 'Job ID', value: this.formatValue(response.job_id) },
      { label: 'Job Status', value: this.formatValue(response.status) },
      { label: 'OCR Method', value: this.formatValue(response.ocr_method) },
      {
        label: 'Page Count',
        value: this.formatValue(response.file_info?.page_count),
      },
      {
        label: 'File Size',
        value: this.formatFileSize(response.file_info?.uploaded_file_size_kb),
      },
      { label: 'Created At', value: this.formatDateTime(response.created_at) },
      // { label: 'Updated At', value: this.formatDateTime(response.updated_at) },
      {
        label: 'Total Duration',
        value: this.formatDuration(response.timing?.total_duration_seconds),
      },
      {
        label: 'PDF Quality',
        value: this.formatValue(response.pdf_quality?.report?.status),
      },
    ];
  });

  readonly comparisonRows = computed<OcrComparisonRow[]>(() => {
    const response = this.response();

    if (!response?.engines) {
      return [];
    }

    return Object.entries(response.engines).map(([engineName, engine]) => ({
      engineKey: engineName,
      engine: this.toTitleCase(engineName),
      status: this.formatValue(engine.status),
      overallMatch: this.formatMatchValue(engine.match_summary?.overall_match),
      docType: this.toMatchCell(engine.match_summary?.doc_type),
      financialYear: this.toMatchCell(engine.match_summary?.fy),
      languageTag: this.formatValue(engine.language_tag),
      auditorInfo: this.formatAuditorInfo(
        engine.result?.auditor_info?.auditor_name,
        engine.result?.auditor_info?.auditor_firm,
        engine.result?.auditor_info?.seal_present,
      ),
      asOnDate: this.formatValue(engine.result?.as_on_date),
      ulbName: this.toMatchCell(engine.match_summary?.ulb_name),
      table: this.toTableMatchCell(engine),
      confidence: this.formatConfidence(engine.result?.confidence),
      usageMetadata: engine.result?.usage_metadata ?? engine.extracted?.usage_metadata ?? null,
      financialFigures: engine.result?.financial_figures ?? engine.extracted?.financial_figures ?? null,
      issues: this.formatIssues(engine.result?.issues),
      timings: this.formatTimings(
        engine.timing?.ocr_duration_seconds,
        engine.timing?.validation_duration_seconds,
        engine.timing?.excel_duration_seconds,
      ),
      ocrUrl: engine.ocr_url ? this.removeSignedInfo(engine.ocr_url) : null,
      excelUrl: engine.excel_url ? this.removeSignedInfo(engine.excel_url) : null,
    }));
  });

  removeSignedInfo(url: string): string {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'succeeded'
      ? 'badge rounded-pill text-bg-success text-capitalize fw-semibold px-2 py-1 small'
      : 'badge rounded-pill text-bg-danger text-capitalize fw-semibold px-2 py-1 small';
  }

  getMatchClass(value: string): string {
    if (value === 'Matched') {
      return 'match-badge match-badge--success';
    }

    if (value === 'Not Matched') {
      return 'match-badge match-badge--danger';
    }

    return 'match-badge match-badge--neutral';
  }

  formatMiddleEllipsis(value: string, keepChars = 6): string {
    if (!value || value.length <= keepChars * 2 + 3) {
      return value;
    }

    return `${value.slice(0, keepChars)}...${value.slice(-keepChars)}`;
  }

  async copySummaryValue(label: string, value: string): Promise<void> {
    if (!value || value === '-') {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      this.copiedSummaryLabel.set(label);
      window.setTimeout(() => {
        if (this.copiedSummaryLabel() === label) {
          this.copiedSummaryLabel.set(null);
        }
      }, 1500);
    } catch {
      this.copiedSummaryLabel.set(null);
    }
  }

  openUsageDetails(engine: string, usageMetadata?: OcrUsageMetadata | null): void {
    if (!usageMetadata) {
      return;
    }

    this.dialog.open(OcrUsageDetailsDialogComponent, {
      width: '680px',
      maxWidth: '96vw',
      data: {
        title: 'Usage Metadata',
        engine,
        details: this.getUsageDetailItems(usageMetadata),
      },
    });
  }

  openFinancialFigures(engine: string, financialFigures?: OcrFinancialFigures | null): void {
    if (!financialFigures) {
      return;
    }

    this.dialog.open(OcrUsageDetailsDialogComponent, {
      width: '680px',
      maxWidth: '96vw',
      data: {
        title: 'Financial Figures',
        engine,
        details: this.getFinancialFigureItems(financialFigures),
      },
    });
  }

  getUsageSummaryItems(usageMetadata?: OcrUsageMetadata | null): Array<{ label: string; value: string }> {
    if (!usageMetadata) {
      return [
        { label: 'Prompt', value: '-' },
        { label: 'Candidates', value: '-' },
        { label: 'Total', value: '-' },
      ];
    }

    const items: Array<{ label: string; value: string }> = [
      { label: 'Prompt', value: this.formatValue(usageMetadata.prompt_token_count) },
      { label: 'Candidates', value: this.formatValue(usageMetadata.candidates_token_count) },
    ];

    if (
      usageMetadata.cached_content_token_count !== null &&
      usageMetadata.cached_content_token_count !== undefined
    ) {
      items.push({
        label: 'Cached',
        value: this.formatValue(usageMetadata.cached_content_token_count),
      });
    }

    items.push({ label: 'Total', value: this.formatValue(usageMetadata.total_token_count) });

    return items;
  }

  getUsageDetailItems(usageMetadata?: OcrUsageMetadata | null): Array<{ label: string; value: string }> {
    if (!usageMetadata) {
      return [];
    }

    return [
      { label: 'Prompt Tokens', value: this.formatValue(usageMetadata.prompt_token_count) },
      { label: 'Candidate Tokens', value: this.formatValue(usageMetadata.candidates_token_count) },
      { label: 'Cached Content Tokens', value: this.formatValue(usageMetadata.cached_content_token_count) },
      { label: 'Thoughts Tokens', value: this.formatValue(usageMetadata.thoughts_token_count) },
      { label: 'Tool Use Prompt Tokens', value: this.formatValue(usageMetadata.tool_use_prompt_token_count) },
      { label: 'Traffic Type', value: this.formatValue(usageMetadata.traffic_type) },
      {
        label: 'Prompt Token Details',
        value: this.formatTokenDetails(usageMetadata.prompt_tokens_details),
      },
      { label: 'Total Tokens', value: this.formatValue(usageMetadata.total_token_count) },
    ];
  }

  getFinancialFigureItems(
    financialFigures?: OcrFinancialFigures | null,
  ): Array<{ label: string; value: string }> {
    if (!financialFigures) {
      return [];
    }

    return [
      { label: 'Total Assets', value: this.formatValue(financialFigures.total_assets) },
      { label: 'Total Liabilities', value: this.formatValue(financialFigures.total_liabilities) },
      { label: 'Total Income', value: this.formatValue(financialFigures.total_income) },
      { label: 'Total Expenditure', value: this.formatValue(financialFigures.total_expenditure) },
      { label: 'Opening Balance', value: this.formatValue(financialFigures.opening_balance) },
      { label: 'Closing Balance', value: this.formatValue(financialFigures.closing_balance) },
    ];
  }

  private formatValue(value: string | number | boolean | null | undefined): string {
    return value === null || value === undefined || value === '' ? '-' : String(value);
  }

  private formatFileSize(sizeInKb?: number | null): string {
    if (sizeInKb === null || sizeInKb === undefined) {
      return '-';
    }

    if (sizeInKb >= 1024) {
      return `${(sizeInKb / 1024).toFixed(2)} MB`;
    }

    return `${sizeInKb.toFixed(2)} KB`;
  }

  private formatConfidence(confidence?: OcrEngineConfidence): string {
    if (!confidence) {
      return '-';
    }

    return `Doc: ${this.formatPercent(confidence.doc_type)} | FY: ${this.formatPercent(confidence.fy)} | ULB: ${this.formatPercent(confidence.ulb)}`;
  }

  private formatIssues(issues?: string[]): string {
    return issues && issues.length > 0 ? issues.join(', ') : 'None';
  }

  private formatDuration(duration?: number): string {
    return duration === null || duration === undefined ? '-' : `${duration.toFixed(2)} s`;
  }

  private formatAuditorInfo(
    auditorName?: string | null,
    auditorFirm?: string | null,
    sealPresent?: boolean | null,
  ): string[] {
    return [
      `Name: ${this.formatValue(auditorName)}`,
      `Firm: ${this.formatValue(auditorFirm)}`,
      `Seal: ${this.formatValue(sealPresent)}`,
    ];
  }

  private formatTimings(
    ocrDuration?: number,
    validationDuration?: number,
    excelDuration?: number,
  ): string[] {
    return [
      `OCR: ${this.formatDuration(ocrDuration)}`,
      `Validation: ${this.formatDuration(validationDuration)}`,
      `Excel: ${this.formatDuration(excelDuration)}`,
    ];
  }

  private formatPercent(value?: number | null): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return `${(value * 100).toFixed(0)}%`;
  }

  private formatMatchValue(value?: boolean | null): string {
    if (value === true) {
      return 'Matched';
    }

    if (value === false) {
      return 'Not Matched';
    }

    return '-';
  }

  private toMatchCell(
    field?: OcrMatchSummaryField,
    includeTableCount = false,
  ): OcrMatchCell {
    return {
      expected: this.formatValue(field?.expected),
      extracted: this.formatValue(field?.extracted),
      matched: this.formatMatchValue(field?.match),
      extra:
        includeTableCount && field?.table_count !== null && field?.table_count !== undefined
          ? `Count: ${field.table_count}`
          : undefined,
    };
  }

  private toTableMatchCell(engine: OcrEngineResult): OcrMatchCell {
    const field = engine.match_summary?.table_exists;
    const tableCount = field?.table_count ?? engine.extracted?.table_count;
    const extractedValue =
      field?.extracted ?? engine.extracted?.table_exists ?? engine.expected?.table_exists ?? null;

    return {
      expected: this.formatValue(field?.expected ?? engine.expected?.table_exists),
      extracted: this.formatValue(extractedValue),
      matched: this.formatMatchValue(field?.match),
      extra:
        tableCount !== null && tableCount !== undefined ? `Count: ${tableCount}` : undefined,
    };
  }

  private formatDateTime(value?: string | null): string {
    if (!value) {
      return '-';
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleString();
  }

  private toTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private formatTokenDetails(
    tokenDetails?: OcrUsageMetadata['prompt_tokens_details'],
  ): string {
    if (!tokenDetails || tokenDetails.length === 0) {
      return '-';
    }

    return tokenDetails
      .map((detail) => `${detail.modality}: ${this.formatValue(detail.token_count)}`)
      .join(', ');
  }
}
