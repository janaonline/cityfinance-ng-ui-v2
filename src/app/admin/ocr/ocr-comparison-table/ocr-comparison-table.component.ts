import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import {
  OcrEngineConfidence,
  OcrMatchSummaryField,
  OcrResponse,
} from '../upload-file-ocr/ocr-response';

interface OcrMatchCell {
  expected: string;
  extracted: string;
  matched: string;
  extra?: string;
}

interface OcrComparisonRow {
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
  pageCount: string;
  confidence: string;
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
      { label: 'File Name', value: this.formatValue(response.filename), fullWidth: true },
      { label: 'Job ID', value: this.formatValue(response.job_id) },
      { label: 'Job Status', value: this.formatValue(response.status) },
      { label: 'OCR Method', value: this.formatValue(response.ocr_method) },
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
      table: this.toMatchCell(engine.match_summary?.table_exists, true),
      pageCount: this.formatValue(engine.page_count),
      confidence: this.formatConfidence(engine.result?.confidence),
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

  readonly agreementSummary = computed(() => {
    const agreement = this.response()?.agreement;

    if (!agreement) {
      return [];
    }

    return [
      { label: 'Doc type match', value: agreement.doc_type_match },
      { label: 'FY match', value: agreement.fy_match },
      { label: 'ULB name match', value: agreement.ulb_name_match },
    ];
  });

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

  private formatValue(value: string | number | boolean | null | undefined): string {
    return value === null || value === undefined || value === '' ? '-' : String(value);
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
}
