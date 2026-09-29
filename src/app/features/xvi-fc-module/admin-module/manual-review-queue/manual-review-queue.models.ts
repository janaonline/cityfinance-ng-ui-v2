/** Generic response envelope produced by the backend's ResponseTransformInterceptor. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export type AnnualAccountSectionKey = 'auditedData' | 'unauditedData';

/** Which form a queue row belongs to — decides which backend endpoint decide() calls and how
 *  the row's document is labeled, since DUR has no audited/unaudited "section" concept. */
export type ManualReviewFormType = 'ANNUAL_ACCOUNT' | 'DUR';

/** One row, merged from GET /xvi-fc/annual-account/manual-review-queue and
 *  GET /xvi-fc/dur/manual-review-queue — same shape, tagged by formType. `formId` is the
 *  Annual Account or DUR document's own _id (renamed from the backends' annualAccountId/durId
 *  at the point they're fetched, see ManualReviewQueueService). */
export interface ManualReviewQueueRow {
  formType: ManualReviewFormType;
  formId: string;
  ulbId: string;
  ulbName: string | null;
  ulbCode: string | null;
  stateName: string | null;
  section: AnnualAccountSectionKey | null;
  year: string;
  docId: string;
  uploadId: string;
  jobId: string | null;
  fileName: string | null;
  fileUrl: string | null;
  sizeKb: number | null;
  validationStatus: string | null;
  validationDetails: string | null;
  failedChecks: string[];
  manualReviewRequestedAt: string | null;
  dueAt: string | null;
  isBreached: boolean;
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
  /** Form types whose rows are incomplete this call — either the backend failed outright, or it
   *  had more matching rows than the client's page cap could fetch. Either way the missing rows
   *  are simply absent from `rows`/`total`, not an error for the whole call (see
   *  ManualReviewQueueService.fetchAllRows). */
  failedSources: ManualReviewFormType[];
}

export interface ManualReviewDecisionPayload {
  decision: 'APPROVED' | 'RETURNED';
  note?: string;
}
