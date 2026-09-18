export type DurJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface DurJobSubmitResponse {
  job_id: string;
  status: DurJobStatus;
  message: string;
}

export interface DurExpectedFields {
  ulb_name: string | null;
  financial_year: string | null;
}

export interface DurExtraction {
  state_name: string | null;
  ulb_name: string | null;
  financial_year: string | null;
  grant_financial_year: string | null;
  is_dur_format: boolean | null;
  format_issues: string[];
  signature_present: boolean | null;
  seal_present: boolean | null;
  extraction_notes: string | null;
}

export interface DurChecks {
  ulb_name_match: boolean | null;
  financial_year_match: boolean | null;
  format_valid: boolean | null;
  signature_present: boolean | null;
  seal_present: boolean | null;
  overall_valid: boolean;
}

export interface DurValidationResult {
  filename: string;
  doc_id: string;
  model: string;
  processing_time_seconds: number;
  expected: DurExpectedFields | null;
  extraction: DurExtraction;
  checks: DurChecks;
  failed_checks: string[];
  usage_metadata: Record<string, unknown> | null;
  total_tokens: number | null;
}

export interface DurJobStatusResponse {
  job_id: string;
  status: DurJobStatus;
  filename: string;
  model: string;
  expected: DurExpectedFields | null;
  progress_step: string | null;
  error_message: string | null;
  checks: DurChecks | null;
  created_at: string | null;
  updated_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  message: string;
}

export interface DurJobResultResponse {
  job_id: string;
  status: DurJobStatus;
  filename: string;
  expected: DurExpectedFields | null;
  progress_step: string | null;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  result: DurValidationResult | null;
  message: string;
}

export interface DurJobListResponse {
  jobs: DurJobStatusResponse[];
  total: number;
  skip: number;
  limit: number;
  total_pages: number;
}

export interface DurJobTracker {
  jobId: string;
  filename: string;
  status: DurJobStatus;
  message: string;
  progressStep: string | null;
  result: DurValidationResult | null;
  showResult: boolean;
  showRaw: boolean;
  rawResult: DurJobResultResponse | null;
}
