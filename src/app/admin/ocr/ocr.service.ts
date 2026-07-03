import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OcrApiResponse } from './upload-file-ocr/ocr-response';
import { IULB } from '../../core/models/ulb';
import {
  OcrValidationJobSubmitResponse,
  OcrValidationBatchSubmitResponse,
  OcrValidationJobStatusResponse,
  OcrValidationJobResult,
  OcrValidationJobsListResponse,
} from './ocr-validation/ocr-validation-models';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface ModelOption {
  value: string;
  label: string;
  pricing?: { inputPerM: number; outputPerM: number; thinkingPerM: number };
  deprecated?: boolean;
}

export interface OcrTaskListItem {
  job_id?: string;
  filename?: string;
  ocr_method?: string;
  financial_year?: string;
  expected?: string | number | boolean | Record<string, unknown> | null;
  total_pages?: number;
  pdf_quality?: {
    report?: {
      total_pages?: number;
    };
  };
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OcrTaskListResponse {
  items?: OcrTaskListItem[];
  tasks?: OcrTaskListItem[];
  data?: OcrTaskListItem[];
  results?: OcrTaskListItem[];
  records?: OcrTaskListItem[];
  payload?: OcrTaskListItem[] | OcrTaskListResponse;
  total?: number;
  skip?: number;
  limit?: number;
  total_pages?: number;
  count?: number;
  total_count?: number;
}

export interface BenchmarkValueRow {
  ulb_name: string;
  doc_type: string | null;
  financial_year: string | null;
  language: string | null;
  seal_present: boolean | null;
  signature_present: boolean | null;
  table_presence: boolean | null;
}

export interface EvalBenchmark {
  benchmark_id: string;
  name: string;
  job_ids: string[];
  benchmark_values: BenchmarkValueRow[];
  created_at: string;
  updated_at: string;
}

export interface BenchmarkCompareRow {
  ulb_name: string;
  doc_type: string | null;
  financial_year: string | null;
  matched: boolean;
  job_id: string | null;
  filename: string | null;
  benchmark_language: string | null;
  benchmark_seal_present: boolean | null;
  benchmark_signature_present: boolean | null;
  benchmark_table_presence: boolean | null;
  extracted_ulb_name: string | null;
  extracted_doc_type: string | null;
  extracted_financial_year: string | null;
  extracted_language: string | null;
  extracted_seal_present: boolean | null;
  extracted_signature_present: boolean | null;
  extracted_table_presence: boolean | null;
  ulb_name_match: boolean | null;
  doc_type_match: boolean | null;
  financial_year_match: boolean | null;
  language_match: boolean | null;
  seal_present_match: boolean | null;
  signature_present_match: boolean | null;
  table_presence_match: boolean | null;
  overall_match: boolean | null;
  note: string | null;
}

export interface BenchmarkCompareMetrics {
  total: number;
  matched: number;
  unmatched: number;
  ulb_name_accuracy: number | null;
  doc_type_accuracy: number | null;
  financial_year_accuracy: number | null;
  language_accuracy: number | null;
  seal_present_accuracy: number | null;
  signature_present_accuracy: number | null;
  table_presence_accuracy: number | null;
  overall_accuracy: number | null;
}

export interface BenchmarkCompareResponse {
  benchmark_id: string;
  results: BenchmarkCompareRow[];
  metrics: BenchmarkCompareMetrics;
}

export interface EvalRunInfo {
  eval_run_id: string;
  benchmark_id: string;
  status: string;
  extraction_model: string;
  validation_model: string;
  metrics: Record<string, number | null> | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface EvalRunJobResult {
  job_id: string;
  filename: string;
  expected_ulb_name: string;
  expected_financial_year: string;
  expected_doc_type: string;
  // Benchmark: original stored extraction + its match vs expected
  benchmark_ulb_name: string;
  benchmark_financial_year: string;
  benchmark_doc_type: string;
  benchmark_ulb_name_match: boolean | null;
  benchmark_financial_year_match: boolean | null;
  benchmark_doc_type_match: boolean | null;
  benchmark_overall_match: boolean | null;
  // New eval extraction + its match vs expected
  extracted_ulb_name: string;
  extracted_financial_year: string;
  extracted_doc_type: string;
  extracted_language: string;
  seal_present: boolean | null;
  signature_present: boolean | null;
  ulb_name_match: boolean | null;
  financial_year_match: boolean | null;
  doc_type_match: boolean | null;
  overall_match: boolean;
  overall_assessment: string;
  failed_checks: string[];
  error: string | null;
}

export interface EvalRunDetail extends EvalRunInfo {
  results: EvalRunJobResult[];
}

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private readonly http = inject(HttpClient);

  readonly models: ModelOption[] = [
    {
      value: 'gemini-3.5-flash',
      label: 'Gemini 3.5 Flash',
      pricing: { inputPerM: 1.5, outputPerM: 9.0, thinkingPerM: 9.0 },
    },
    {
      value: 'gemini-3.1-flash-lite',
      label: 'Gemini 3.1 Flash Lite',
      pricing: { inputPerM: 0.25, outputPerM: 1.5, thinkingPerM: 1.5 },
    },
    {
      value: 'gemini-3.1-flash-lite-preview',
      label: 'Gemini 3.1 Flash Lite Preview',
      pricing: { inputPerM: 0.25, outputPerM: 1.5, thinkingPerM: 1.5 },
      deprecated: true,
    },
    {
      value: 'gemini-3.1-flash-image-preview',
      label: 'Gemini 3.1 Flash Image Preview',
      pricing: { inputPerM: 0.5, outputPerM: 3.0, thinkingPerM: 3.0 },
    },
    {
      value: 'gemini-3.1-pro-preview',
      label: 'Gemini 3.1 Pro Preview',
      pricing: { inputPerM: 2.0, outputPerM: 12.0, thinkingPerM: 12.0 },
    },
    {
      value: 'gemini-3-pro-image-preview',
      label: 'Gemini 3 Pro Image Preview',
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
    { value: 'UNKNOWN', label: 'Unknown' },
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

  uploadOcrFile(
    file: File,
    documentTypeId: string,
    financialYear: string,
    ocrMethod: string,
    model: string,
    enableOrientationCheck: boolean,
    ulb?: IULB | string | null,
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', documentTypeId);
    formData.append('financial_year', financialYear);
    formData.append('ocr_method', ocrMethod);
    formData.append('model', model);
    formData.append('enable_orientation_check', String(enableOrientationCheck));

    if (ulb && typeof ulb === 'object') {
      const ulbKeys: string[] = [ulb?.name];

      if (ulb?.slug) ulbKeys.push(ulb.slug);
      if (ulb?.keywords) ulbKeys.push(ulb.keywords);
      const ulbKey = ulbKeys.join('|');
      // formData.append('ulb_name', ulbName);
      formData.append('ulb_name', ulbKey);
      formData.append('ulb_id', ulb?._id);
    } else {
      formData.append('ulb_name', ulb ? ulb.trim() : '');
    }
    return this.http.post(environment.api.url3 + 'sarvam-validate/combined-gemini-validate', formData);
  }

  getOcrDetails(params: { jobId?: string; filename?: string; ocrMethod: string }) {
    const queryParams: Record<string, string> = {
      ocr_method: params.ocrMethod,
    };

    if (params.jobId) {
      queryParams['job_id'] = params.jobId;
    }

    if (params.filename) {
      queryParams['filename'] = params.filename;
    }

    return this.http.get<OcrApiResponse>(environment.api.url3 + 'sarvam-validate/tasks/latest', {
      params: queryParams,
    });
  }
  getulb(ulb: IULB | string | null | undefined): string {
    if (ulb && typeof ulb === 'object') {
      const ulbKeys: string[] = [ulb?.name];

      if (ulb?.slug) ulbKeys.push(ulb.slug);
      if (ulb?.keywords) ulbKeys.push(ulb.keywords);
      const ulbKey = ulbKeys.join('|');
      return ulbKey;
    } else {
      return ulb ? ulb.trim() : '';
    }
  }
  submitOcrValidationJob(
    file: File,
    extractionModel: string,
    validationModel: string,
    ulb?: IULB | string | null,
    financialYear?: string | null,
    docType?: string | null,
    tableExists?: boolean | null,
    enableOrientationCheck?: boolean,
    enableFinancialValidation?: boolean,
    enableQualityCheck?: boolean,
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('extraction_model', extractionModel);
    formData.append('validation_model', validationModel);
    const ulbName = this.getulb(ulb);
    if (ulbName) formData.append('ulb_name', ulbName);
    if (financialYear) formData.append('financial_year', financialYear);
    if (docType) formData.append('doc_type', docType);
    if (tableExists !== null && tableExists !== undefined) {
      formData.append('table_exists', String(tableExists));
    }
    if (enableOrientationCheck !== undefined) {
      formData.append('enable_orientation_check', String(enableOrientationCheck));
    }
    if (enableFinancialValidation !== undefined) {
      formData.append('enable_financial_validation', String(enableFinancialValidation));
    }
    if (enableQualityCheck !== undefined) {
      formData.append('enable_quality_check', String(enableQualityCheck));
    }
    return this.http.post<OcrValidationJobSubmitResponse>(environment.api.url3 + 'ocr-validation/jobs', formData);
  }

  submitOcrValidationBatch(
    files: File[],
    extractionModel: string,
    validationModel: string,
    ulb?: IULB | string | null,
    financialYear?: string | null,
    docType?: string | null,
    enableOrientationCheck?: boolean,
    enableFinancialValidation?: boolean,
  ) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('extraction_model', extractionModel);
    formData.append('validation_model', validationModel);
    const ulbName = this.getulb(ulb);
    if (ulbName) formData.append('ulb_name', ulbName);
    if (financialYear) formData.append('financial_year', financialYear);
    if (docType) formData.append('doc_type', docType);
    if (enableOrientationCheck !== undefined) {
      formData.append('enable_orientation_check', String(enableOrientationCheck));
    }
    if (enableFinancialValidation !== undefined) {
      formData.append('enable_financial_validation', String(enableFinancialValidation));
    }
    return this.http.post<OcrValidationBatchSubmitResponse>(
      environment.api.url3 + 'ocr-validation/jobs/batch',
      formData,
    );
  }

  getOcrValidationJobStatus(jobId: string) {
    return this.http.get<OcrValidationJobStatusResponse>(environment.api.url3 + `ocr-validation/jobs/${jobId}/status`);
  }

  getOcrValidationJobResult(jobId: string) {
    return this.http.get<OcrValidationJobResult>(environment.api.url3 + `ocr-validation/jobs/${jobId}/result`);
  }

  retryOcrValidationJob(jobId: string) {
    return this.http.post<OcrValidationJobSubmitResponse>(
      environment.api.url3 + `ocr-validation/jobs/${jobId}/retry`,
      {},
    );
  }

  downloadOcrJobFile(jobId: string) {
    return this.http.get(environment.api.url3 + `ocr-validation/jobs/${jobId}/download`, { responseType: 'blob' });
  }

  listOcrValidationJobs(params?: {
    status?: string;
    batch_id?: string;
    job_id?: string;
    filename?: string;
    ulb_name?: string;
    doc_type?: string;
    progress_step?: string;
    validation_model?: string;
    error_code?: string;
    date_from?: string;
    date_to?: string;
    match_status_overall?: boolean;
    match_ulb_name?: boolean;
    match_financial_year?: boolean;
    match_doc_type?: boolean;
    sort_order?: 'asc' | 'desc';
    skip?: number;
    limit?: number;
  }) {
    const queryParams: Record<string, string | number> = {};
    if (params?.status) queryParams['status'] = params.status;
    if (params?.batch_id) queryParams['batch_id'] = params.batch_id;
    if (params?.job_id) queryParams['job_id'] = params.job_id;
    if (params?.filename) queryParams['filename'] = params.filename;
    if (params?.ulb_name) queryParams['ulb_name'] = params.ulb_name;
    if (params?.doc_type) queryParams['doc_type'] = params.doc_type;
    if (params?.progress_step) queryParams['progress_step'] = params.progress_step;
    if (params?.validation_model) queryParams['validation_model'] = params.validation_model;
    if (params?.error_code) queryParams['error_code'] = params.error_code;
    if (params?.date_from) queryParams['date_from'] = params.date_from;
    if (params?.date_to) queryParams['date_to'] = params.date_to;
    if (params?.match_status_overall !== undefined)
      queryParams['match_status_overall'] = String(params.match_status_overall);
    if (params?.match_ulb_name !== undefined) queryParams['match_ulb_name'] = String(params.match_ulb_name);
    if (params?.match_financial_year !== undefined)
      queryParams['match_financial_year'] = String(params.match_financial_year);
    if (params?.match_doc_type !== undefined) queryParams['match_doc_type'] = String(params.match_doc_type);
    if (params?.sort_order) queryParams['sort_order'] = params.sort_order;
    if (params?.skip !== undefined) queryParams['skip'] = params.skip;
    if (params?.limit !== undefined) queryParams['limit'] = params.limit;
    return this.http.get<OcrValidationJobsListResponse>(environment.api.url3 + 'ocr-validation/jobs', {
      params: queryParams,
    });
  }

  dumpOcrValidationJobs(params?: {
    status?: string;
    batch_id?: string;
    job_id?: string;
    filename?: string;
    ulb_name?: string;
    doc_type?: string;
    progress_step?: string;
    validation_model?: string;
    error_code?: string;
    date_from?: string;
    date_to?: string;
    match_status_overall?: boolean;
    match_ulb_name?: boolean;
    match_financial_year?: boolean;
    match_doc_type?: boolean;
  }) {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams['status'] = params.status;
    if (params?.batch_id) queryParams['batch_id'] = params.batch_id;
    if (params?.job_id) queryParams['job_id'] = params.job_id;
    if (params?.filename) queryParams['filename'] = params.filename;
    if (params?.ulb_name) queryParams['ulb_name'] = params.ulb_name;
    if (params?.doc_type) queryParams['doc_type'] = params.doc_type;
    if (params?.progress_step) queryParams['progress_step'] = params.progress_step;
    if (params?.validation_model) queryParams['validation_model'] = params.validation_model;
    if (params?.error_code) queryParams['error_code'] = params.error_code;
    if (params?.date_from) queryParams['date_from'] = params.date_from;
    if (params?.date_to) queryParams['date_to'] = params.date_to;
    if (params?.match_status_overall !== undefined)
      queryParams['match_status_overall'] = String(params.match_status_overall);
    if (params?.match_ulb_name !== undefined) queryParams['match_ulb_name'] = String(params.match_ulb_name);
    if (params?.match_financial_year !== undefined)
      queryParams['match_financial_year'] = String(params.match_financial_year);
    if (params?.match_doc_type !== undefined) queryParams['match_doc_type'] = String(params.match_doc_type);
    return this.http.get(environment.api.url3 + 'ocr-validation/jobs/dump', {
      params: queryParams,
      responseType: 'blob',
    });
  }

  // ─── Eval Benchmark API ──────────────────────────────────────────────────────

  createEvalBenchmark(name: string, jobIds: string[]) {
    return this.http.post<EvalBenchmark>(environment.api.url3 + 'ocr-validation/evals/benchmark', {
      name,
      job_ids: jobIds,
    });
  }

  listEvalBenchmarks() {
    return this.http.get<EvalBenchmark[]>(environment.api.url3 + 'ocr-validation/evals/benchmark');
  }

  createEvalBenchmarkFromExcel(name: string, file: File) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    return this.http.post<EvalBenchmark>(
      environment.api.url3 + 'ocr-validation/evals/benchmark/from-excel',
      formData,
    );
  }

  compareBenchmark(benchmarkId: string) {
    return this.http.post<BenchmarkCompareResponse>(
      environment.api.url3 + `ocr-validation/evals/benchmark/${benchmarkId}/compare`,
      {},
    );
  }

  runBenchmarkEval(
    benchmarkId: string,
    extractionModel: string,
    validationModel: string,
    enableFinancialValidation = false,
  ) {
    return this.http.post<EvalRunInfo>(
      environment.api.url3 + `ocr-validation/evals/benchmark/${benchmarkId}/run`,
      {
        extraction_model: extractionModel,
        validation_model: validationModel,
        enable_financial_validation: enableFinancialValidation,
      },
    );
  }

  listBenchmarkRuns(benchmarkId: string) {
    return this.http.get<EvalRunInfo[]>(
      environment.api.url3 + `ocr-validation/evals/benchmark/${benchmarkId}/runs`,
    );
  }

  getEvalRunDetail(evalRunId: string) {
    return this.http.get<EvalRunDetail>(environment.api.url3 + `ocr-validation/evals/runs/${evalRunId}`);
  }

  exportEvalRun(evalRunId: string) {
    return this.http.get(environment.api.url3 + `ocr-validation/evals/runs/${evalRunId}/export`, {
      responseType: 'blob',
    });
  }

  getOcrTasks(params: {
    jobId?: string;
    filename?: string;
    ocrMethod?: string;
    status?: string;
    skip: number;
    limit: number;
  }) {
    const queryParams: Record<string, string | number> = {
      skip: params.skip,
      limit: params.limit,
    };

    if (params.jobId) {
      queryParams['job_id'] = params.jobId;
    }

    if (params.filename) {
      queryParams['filename'] = params.filename;
    }

    if (params.ocrMethod) {
      queryParams['ocr_method'] = params.ocrMethod;
    }

    if (params.status) {
      queryParams['status'] = params.status;
    }

    return this.http.get<OcrTaskListResponse>(environment.api.url3 + 'sarvam-validate/tasks', {
      params: queryParams,
    });
  }
}
