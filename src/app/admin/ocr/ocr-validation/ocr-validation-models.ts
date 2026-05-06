export type OcrValidationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface OcrValidationJobSubmitResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface OcrValidationBatchSubmitResponse {
  batch_id: string;
  status: string;
  total_files: number;
  job_ids: string[];
  message: string;
}

export interface OcrValidationJobStatusResponse {
  job_id: string;
  batch_id: string | null;
  status: OcrValidationStatus;
  filename: string;
  extraction_model: string;
  validation_model: string;
  progress_step: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  message: string;
}

export interface OcrValidationExtraction {
  ulb_name: string | null;
  original_ulb_name: string | null;
  document_type: string | null;
  financial_year: string | null;
  language_detected: string | null;
  seal_present: boolean | null;
  page_count: number | null;
}

export interface OcrValidationBasicCheck {
  validation_status: string | null;
  validation_details: string | null;
  failed_checks: string[];
}

export interface OcrValidationCheck {
  check: string;
  status: string;
  message: string;
}

export interface OcrValidationResult {
  filename: string;
  doc_id: string | null;
  extraction_model: string | null;
  validation_model: string | null;
  processing_time_seconds: number | null;
  step_timings: Record<string, number> | null;
  extraction: OcrValidationExtraction | null;
  basic_validation: OcrValidationBasicCheck | null;
  financial_figures: Record<string, number | null> | null;
  validations: OcrValidationCheck[] | null;
  overall_assessment: string | null;
  summary: string | null;
  ocr_notes: string | null;
  usage_metadata: Record<string, unknown> | null;
}

export interface OcrValidationJobResult {
  job_id: string;
  status: string;
  filename: string;
  result: OcrValidationResult | null;
  message: string;
}

export interface OcrValidationJobsListResponse {
  jobs: OcrValidationJobStatusResponse[];
  total: number;
  skip: number;
  limit: number;
  total_pages: number;
}

export interface OcrValidationJobTracker {
  jobId: string;
  filename: string;
  status: OcrValidationStatus;
  message: string;
  progressStep: string | null;
  result: OcrValidationResult | null;
  showResult: boolean;
  showRaw: boolean;
  rawResult: OcrValidationJobResult | null;
}
