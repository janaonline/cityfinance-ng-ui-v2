export type DigitizationStatus = 'queued' | 'processing' | 'completed' | 'failed';

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
  gemini_model: string;
  expected: DigitizationExpectedFields | null;
  progress_step: string | null;
  error_message: string | null;
  confidence_score: number | null;
  accuracy_score: number | null;
  excel_s3_key: string | null;
  created_at: string | null;
  updated_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  message: string;
}

export interface TextractCell {
  row_index: number;
  column_index: number;
  row_span: number;
  column_span: number;
  text: string;
  confidence: number | null;
  is_header: boolean;
}

export interface TextractTable {
  table_index: number;
  page_number: number;
  row_count: number;
  column_count: number;
  confidence: number | null;
  cells: TextractCell[];
}

export interface TextractKeyValuePair {
  page_number: number;
  key: string;
  value: string;
  confidence: number | null;
}

export interface TextractExtraction {
  textract_job_id: string | null;
  page_count: number;
  tables: TextractTable[];
  key_value_pairs: TextractKeyValuePair[];
  confidence_score: number | null;
  low_confidence_block_count: number;
  total_block_count: number;
  extraction_seconds: number | null;
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

export interface DigitizationResult {
  filename: string;
  doc_id: string;
  processing_time_seconds: number;
  expected: DigitizationExpectedFields | null;
  textract_extraction: TextractExtraction;
  gemini_validation: GeminiValidation | null;
  confidence_score: number | null;
  accuracy_score: number | null;
  overall_assessment: string | null;
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
