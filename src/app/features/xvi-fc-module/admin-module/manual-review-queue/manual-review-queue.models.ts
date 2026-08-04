/** Generic response envelope produced by the backend's ResponseTransformInterceptor. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export type AnnualAccountSectionKey = 'auditedData' | 'unauditedData';

/** One row of GET /xvi-fc/annual-account/manual-review-queue. */
export interface ManualReviewQueueRow {
  annualAccountId: string;
  ulbId: string;
  ulbName: string | null;
  ulbCode: string | null;
  stateName: string | null;
  section: AnnualAccountSectionKey;
  year: string;
  docId: string;
  uploadId: string;
  jobId: string | null;
  fileName: string | null;
  sizeKb: number | null;
  validationStatus: string | null;
  validationDetails: string | null;
  failedChecks: string[];
  manualReviewRequestedAt: string | null;
}

export interface ManualReviewQueueQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface ManualReviewQueueResult {
  total: number;
  page: number;
  pageSize: number;
  rows: ManualReviewQueueRow[];
}

export interface ManualReviewDecisionPayload {
  decision: 'APPROVED' | 'RETURNED';
  note?: string;
}
