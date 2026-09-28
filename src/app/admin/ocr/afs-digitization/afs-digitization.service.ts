import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  DigitizationJobResultResponse,
  DigitizationJobStatusResponse,
  DigitizationJobSubmitResponse,
  DigitizationJobsListResponse,
} from './afs-digitization-models';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface GeminiPricing {
  inputPerM: number;
  outputPerM: number;
  thinkingPerM: number;
}

export interface ModelOption {
  value: string;
  label: string;
  pricing?: GeminiPricing;
}

@Injectable({
  providedIn: 'root',
})
export class AfsDigitizationService {
  private readonly http = inject(HttpClient);

  readonly geminiModels: ModelOption[] = [
    {
      value: 'gemini-3.1-pro-preview',
      label: 'Gemini 3.1 Pro Preview',
      pricing: { inputPerM: 2.0, outputPerM: 12.0, thinkingPerM: 12.0 },
    },
    {
      value: 'gemini-3-flash-preview',
      label: 'Gemini 3 Flash Preview',
      pricing: { inputPerM: 0.5, outputPerM: 3.0, thinkingPerM: 3.0 },
    },
    {
      value: 'gemini-2.5-pro',
      label: 'Gemini 2.5 Pro',
      pricing: { inputPerM: 1.25, outputPerM: 10.0, thinkingPerM: 10.0 },
    },
    {
      value: 'gemini-2.5-flash',
      label: 'Gemini 2.5 Flash',
      pricing: { inputPerM: 0.15, outputPerM: 0.6, thinkingPerM: 3.5 },
    },
  ];

  readonly documentTypes: SelectOption[] = [
    { value: 'BALANCE_SHEET', label: 'Balance Sheet' },
    { value: 'BALANCE_SHEET_SCHEDULE', label: 'Balance Sheet Schedule' },
    { value: 'INCOME_EXPENDITURE', label: 'Income and Expenditure' },
    { value: 'INCOME_EXPENDITURE_SCHEDULE', label: 'Income and Expenditure Schedule' },
    { value: 'CASH_FLOW', label: 'Cash Flow Statement' },
    { value: 'AUDITOR_REPORT', label: 'Auditors Report' },
    { value: 'RECEIPTS_AND_PAYMENTS', label: 'Receipts and Payments' },
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

  submitDigitizationJob(
    file: File,
    geminiModel: string,
    ulbName?: string | null,
    financialYear?: string | null,
    docType?: string | null,
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('gemini_model', geminiModel);
    if (ulbName) formData.append('ulb_name', ulbName);
    if (financialYear) formData.append('financial_year', financialYear);
    if (docType) formData.append('doc_type', docType);
    return this.http.post<DigitizationJobSubmitResponse>(
      environment.api.url3 + 'afs-digitization/jobs',
      formData,
    );
  }

  getDigitizationJobStatus(jobId: string) {
    return this.http.get<DigitizationJobStatusResponse>(
      environment.api.url3 + `afs-digitization/jobs/${jobId}/status`,
    );
  }

  getDigitizationJobResult(jobId: string) {
    return this.http.get<DigitizationJobResultResponse>(
      environment.api.url3 + `afs-digitization/jobs/${jobId}/result`,
    );
  }

  downloadDigitizationExcel(jobId: string) {
    return this.http.get(environment.api.url3 + `afs-digitization/jobs/${jobId}/excel`, {
      responseType: 'blob',
    });
  }

  downloadDigitizationPdf(jobId: string) {
    return this.http.get(environment.api.url3 + `afs-digitization/jobs/${jobId}/pdf`, {
      responseType: 'blob',
    });
  }

  listDigitizationJobs(params?: {
    status?: string;
    filename?: string;
    ulb_name?: string;
    financial_year?: string;
    date_from?: string;
    date_to?: string;
    sort_order?: 'asc' | 'desc';
    skip?: number;
    limit?: number;
  }) {
    const queryParams: Record<string, string | number> = {};
    if (params?.status) queryParams['status'] = params.status;
    if (params?.filename) queryParams['filename'] = params.filename;
    if (params?.ulb_name) queryParams['ulb_name'] = params.ulb_name;
    if (params?.financial_year) queryParams['financial_year'] = params.financial_year;
    if (params?.date_from) queryParams['date_from'] = params.date_from;
    if (params?.date_to) queryParams['date_to'] = params.date_to;
    if (params?.sort_order) queryParams['sort_order'] = params.sort_order;
    if (params?.skip !== undefined) queryParams['skip'] = params.skip;
    if (params?.limit !== undefined) queryParams['limit'] = params.limit;
    return this.http.get<DigitizationJobsListResponse>(environment.api.url3 + 'afs-digitization/jobs', {
      params: queryParams,
    });
  }
}
