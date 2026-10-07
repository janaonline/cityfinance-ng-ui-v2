export type DigitizationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type DigitizationOcrEngine = 'textract' | 'sarvam' | 'gemini';

export interface DigitizationExpectedFields {
  ulb_name: string | null;
  financial_year: string | null;
  doc_type: string | null;
}

export interface DigitizationJobSubmitResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface DigitizationJobStatusResponse {
  job_id: string;
  status: DigitizationStatus;
  filename: string;
  file_size_bytes: number | null;
  ocr_engine: DigitizationOcrEngine;
  gemini_model: string;
  enable_validation: boolean;
  enable_arithmetic_validation: boolean;
  expected: DigitizationExpectedFields | null;
  progress_step: string | null;
  error_message: string | null;
  confidence_score: number | null;
  accuracy_score: number | null;
  arithmetic_assessment: string | null;
  enable_document_classification: boolean;
  detected_document_type: AfsDocumentType | null;
  multiple_documents_detected: boolean | null;
  page_count: number | null;
  ocr_cost_usd: number | null;
  ocr_price_inr: number | null;
  excel_s3_key: string | null;
  created_at: string | null;
  updated_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  message: string;
}

export interface OcrCell {
  row_index: number;
  column_index: number;
  row_span: number;
  column_span: number;
  text: string;
  confidence: number | null;
  is_header: boolean;
}

export interface OcrTable {
  table_index: number;
  page_number: number;
  row_count: number;
  column_count: number;
  confidence: number | null;
  cells: OcrCell[];
}

export interface OcrKeyValuePair {
  page_number: number;
  key: string;
  value: string;
  confidence: number | null;
}

export interface OcrExtraction {
  ocr_job_id: string | null;
  page_count: number;
  tables: OcrTable[];
  key_value_pairs: OcrKeyValuePair[];
  confidence_score: number | null;
  low_confidence_block_count: number;
  total_block_count: number;
  extraction_seconds: number | null;
  feature_types: string[];
  cost_usd: number | null;
  price_inr: number | null;
}

export interface GeminiFieldCheck {
  location: string;
  extracted_value: string | null;
  source_value: string | null;
  matched: boolean;
  note: string | null;
}

export interface GeminiValidation {
  model: string;
  total_fields_checked: number;
  matched_fields: number;
  mismatched_fields: number;
  field_checks: GeminiFieldCheck[];
  accuracy_score: number | null;
  overall_assessment: string | null;
  summary: string | null;
  usage_metadata: Record<string, unknown> | null;
  validation_seconds: number | null;
}

export type ArithmeticCheckStatus = 'pass' | 'fail' | 'not_applicable';

/** source_document: digitized figures match the PDF, the statement itself is off. */
export type ArithmeticErrorSource = 'source_document' | 'digitization';

export interface DigitizationMismatch {
  table_index: number;
  row_index: number;
  column_index: number;
  digitized_value: string | null;
  pdf_value: string | null;
}

export interface ArithmeticCheck {
  rule: string;
  location: string;
  description: string | null;
  table_index: number | null;
  row_index: number | null;
  column_index: number | null;
  reported_value: number | null;
  component_values: number[] | null;
  component_rows: number[] | null;
  compare_value: number | null;
  compare_row_index: number | null;
  compare_column_index: number | null;
  computed_value: number | null;
  difference: number | null;
  raw_value: string | null;
  status: ArithmeticCheckStatus;
  gemini_status: string | null;
  error_source: ArithmeticErrorSource | null;
  mismatched_cells: DigitizationMismatch[];
  note: string | null;
}

export interface ArithmeticValidation {
  model: string;
  detected_doc_type: string | null;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  not_applicable_checks: number;
  /** Per rule: PASS / FAIL / NOT_APPLICABLE / NOT_CHECKED. */
  rule_results: Record<string, string>;
  checks: ArithmeticCheck[];
  arithmetic_score: number | null;
  assessment: string;
  pdf_used: boolean;
  source_document_failures: number;
  digitization_failures: number;
  digitization_mismatches: DigitizationMismatch[];
  summary: string | null;
  usage_metadata: Record<string, unknown> | null;
  validation_seconds: number | null;
}

export type AfsDocumentType =
  | 'BALANCE_SHEET'
  | 'BALANCE_SHEET_SCHEDULE'
  | 'INCOME_EXPENDITURE'
  | 'INCOME_EXPENDITURE_SCHEDULE'
  | 'CASH_FLOW'
  | 'AUDITOR_REPORT'
  | 'UNKNOWN'
  /** Only ever the overall type of a PDF holding more than one document. */
  | 'MULTIPLE_DOCUMENTS';

/** One document found inside the uploaded PDF (1-based, inclusive pages). */
export interface DocumentSegment {
  document_type: AfsDocumentType;
  start_page: number;
  end_page: number;
  pages: number[];
  title: string | null;
  is_duplicate: boolean;
  confidence: number | null;
}

export interface DocumentClassification {
  model: string;
  document_type: AfsDocumentType;
  multiple_documents_detected: boolean;
  duplicate_documents_detected: boolean;
  document_count: number;
  document_types: AfsDocumentType[];
  segments: DocumentSegment[];
  unclassified_pages: number[];
  page_count: number;
  summary: string | null;
  usage_metadata: Record<string, unknown> | null;
  classification_seconds: number | null;
}

export interface DigitizationResult {
  filename: string;
  doc_id: string;
  file_size_bytes: number | null;
  processing_time_seconds: number;
  expected: DigitizationExpectedFields | null;
  ocr_engine: DigitizationOcrEngine;
  ocr_extraction: OcrExtraction;
  gemini_validation: GeminiValidation | null;
  confidence_score: number | null;
  accuracy_score: number | null;
  overall_assessment: string | null;
  arithmetic_validation: ArithmeticValidation | null;
  arithmetic_assessment: string | null;
  document_classification: DocumentClassification | null;
  detected_document_type: AfsDocumentType | null;
  error_messages: string[];
  excel_s3_key: string | null;
}

export interface DigitizationJobResultResponse {
  job_id: string;
  status: DigitizationStatus;
  filename: string;
  expected: DigitizationExpectedFields | null;
  progress_step: string | null;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  result: DigitizationResult | null;
  message: string;
}

export interface DigitizationJobsListResponse {
  jobs: DigitizationJobStatusResponse[];
  total: number;
  skip: number;
  limit: number;
  total_pages: number;
}

/** Client-side tracker for a job shown on the upload/tracking page. */
export interface DigitizationJobTracker {
  jobId: string;
  filename: string;
  status: DigitizationStatus;
  message: string;
  progressStep: string | null;
  result: DigitizationResult | null;
  excelS3Key: string | null;
  showResult: boolean;
}
