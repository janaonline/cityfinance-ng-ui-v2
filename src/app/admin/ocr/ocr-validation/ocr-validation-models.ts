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
  file_info: OcrFileInfo | null;
  expected: OcrExpectedFields | null;
  progress_step: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  detail_page_url: string | null;
  message: string;
}

export interface OcrValidationExtraction {
  ulb_name: string | null;
  original_ulb_name: string | null;
  document_type: string | null;
  financial_year: string | null;
  as_on_date: string | null;
  language_detected: string | null;
  seal_present: boolean | null;
  auditor_name: string | null;
  auditor_firm: string | null;
  audited_date: string | null;
}

export interface OcrValidationBasicCheck {
  validation_status: string | null;
  validation_details: string | null;
  failed_checks: string[];
  pdf_readability_status: string | null;
  pdf_quality_status: string | null;
  quality_issues: string[];
  table_present: boolean | null;
  table_required: boolean | null;
  table_detection_status: string | null;
  table_issues: string[];
  multiple_documents_detected: boolean | null;
  detected_document_types: string[];
}

export interface OcrValidationCheck {
  check: string;
  status: string;
  message: string;
}

export interface OcrFinancialItem {
  line_item: string;
  amount: number | null;
  category: string | null;
}

export interface OcrFinancialSummary {
  total_assets: number | null;
  total_liabilities: number | null;
  total_income: number | null;
  total_expenditure: number | null;
  tax_revenue: number | null;
}

export interface OcrFinancialFigures {
  extracted_items: OcrFinancialItem[];
  summary: OcrFinancialSummary;
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
  financial_figures: OcrFinancialFigures | null;
  validations: OcrValidationCheck[] | null;
  overall_assessment: string | null;
  summary: string | null;
  ocr_notes: string | null;
  usage_metadata: Record<string, unknown> | null;
}

export interface OcrExpectedFields {
  ulb_name: string | null;
  financial_year: string | null;
  doc_type: string | null;
  table_exists: boolean | null;
}

export interface OcrFileInfo {
  filename: string;
  size_kb: number;
  file_type: string;
  page_count: number;
}

export interface OcrMatchStatus {
  ulb_name: boolean | null;
  financial_year: boolean | null;
  doc_type: boolean | null;
  overall: boolean;
}

export interface OcrValidationJobResult {
  job_id: string;
  batch_id: string | null;
  status: string;
  filename: string;
  extraction_model: string | null;
  validation_model: string | null;
  expected: OcrExpectedFields | null;
  enable_orientation_check: boolean | null;
  file_info: OcrFileInfo | null;
  progress_step: string | null;
  match_status: OcrMatchStatus | null;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  s3_key: string | null;
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
