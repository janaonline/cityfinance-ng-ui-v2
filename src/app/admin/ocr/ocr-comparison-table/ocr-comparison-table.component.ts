import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { OcrEngineConfidence, OcrResponse } from '../upload-file-ocr/ocr-response';

interface OcrComparisonRow {
  engine: string;
  status: string;
  docType: string;
  financialYear: string;
  asOnDate: string;
  ulbName: string;
  pageCount: string;
  confidence: string;
  issues: string;
  ocrDuration: string;
  validationDuration: string;
  excelDuration: string;
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

  readonly summaryItems = computed<OcrSummaryItem[]>(() => {
    const response = this.response();

    return [
      { label: 'File Name', value: this.formatValue(response.filename), fullWidth: true },
      { label: 'Job ID', value: this.formatValue(response.job_id) },
      { label: 'Overall Status', value: this.formatValue(response.status) },
      { label: 'OCR Method', value: this.formatValue(response.ocr_method) },
      { label: 'Created At', value: this.formatDateTime(response.created_at) },
      { label: 'Updated At', value: this.formatDateTime(response.updated_at) },
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
      docType: this.formatValue(engine.result?.doc_type),
      financialYear: this.formatValue(engine.result?.fy),
      asOnDate: this.formatValue(engine.result?.as_on_date),
      ulbName: this.formatValue(engine.result?.ulb_name),
      pageCount: this.formatValue(engine.page_count),
      confidence: this.formatConfidence(engine.result?.confidence),
      issues: this.formatIssues(engine.result?.issues),
      ocrDuration: this.formatDuration(engine.timing?.ocr_duration_seconds),
      validationDuration: this.formatDuration(engine.timing?.validation_duration_seconds),
      excelDuration: this.formatDuration(engine.timing?.excel_duration_seconds),
      ocrUrl: engine.ocr_url ?? null,
      excelUrl: engine.excel_url ?? null,
    }));
  });

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

  private formatPercent(value?: number | null): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return `${(value * 100).toFixed(0)}%`;
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
