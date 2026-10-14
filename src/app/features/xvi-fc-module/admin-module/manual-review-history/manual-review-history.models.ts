import { AnnualAccountSectionKey, ApiResponse, ManualReviewFormType } from '../manual-review-queue/manual-review-queue.models';

export type ManualReviewRequestStatus = 'PENDING' | 'APPROVED' | 'RETURNED';

export interface ManualReviewActorInfo {
  role: string;
  name: string | null;
}

/** One row, merged from GET /xvi-fc/annual-account/manual-review-history and
 *  GET /xvi-fc/dur/manual-review-history — same shape, tagged by formType. `formId` is the
 *  Annual Account or DUR document's own _id (renamed from the backends' annualAccountId/durId at
 *  the point they're fetched, see ManualReviewHistoryService). Unlike the queue, this covers every
 *  status, not just PENDING. */
export interface ManualReviewHistoryRow {
  requestId: string;
  formType: ManualReviewFormType;
  formId: string;
  ulbId: string;
  ulbName: string | null;
  ulbCode: string | null;
  stateName: string | null;
  /** null for DUR rows — DUR has no audited/unaudited section concept. */
  section: AnnualAccountSectionKey | null;
  year: string | null;
  docId: string;
  uploadId: string;
  ocrJobId: string | null;
  fileName: string | null;
  fileUrl: string | null;
  sizeKb: number | null;
  validationStatus: string | null;
  validationDetails: string | null;
  failedChecks: string[];
  status: ManualReviewRequestStatus;
  requestedAt: string;
  requestedBy: ManualReviewActorInfo;
  dueAt: string;
  isBreached: boolean;
  decidedAt: string | null;
  decidedBy: ManualReviewActorInfo | null;
  decisionNote: string | null;
}

/** Raw shape returned by each backend before it's tagged with formType/formId here. */
export interface RawManualReviewHistoryRow extends Omit<ManualReviewHistoryRow, 'formType' | 'formId' | 'section'> {
  annualAccountId?: string;
  durId?: string;
  section?: AnnualAccountSectionKey;
}

export interface ManualReviewHistoryQuery {
  page: number;
  pageSize: number;
  formType?: ManualReviewFormType;
  search?: string;
  status?: ManualReviewRequestStatus;
  stateId?: string;
  requestedFrom?: string;
  requestedTo?: string;
  decidedFrom?: string;
  decidedTo?: string;
  breachedOnly?: boolean;
}

export interface ManualReviewHistoryResult {
  total: number;
  page: number;
  pageSize: number;
  rows: ManualReviewHistoryRow[];
  /** Form types whose rows are incomplete this call — either the backend failed outright, or it
   *  had more matching rows than the client's page cap could fetch (see
   *  ManualReviewHistoryService.fetchAllRows). */
  failedSources: ManualReviewFormType[];
}

export type ManualReviewHistoryStatsRange = 'today' | 'week' | 'all';

/** GET .../manual-review-history/stats — summary counts for the history page's REQUESTED
 *  time-range tabs. `overturnRateWarning` is computed from the same >=5-decided threshold the
 *  backend uses, so the frontend's "All types" merge (summing both backends' counts) stays
 *  consistent with what either backend would report alone (see
 *  ManualReviewHistoryService.mergeStats). */
export interface ManualReviewHistoryStats {
  range: ManualReviewHistoryStatsRange;
  received: number;
  pending: number;
  approved: number;
  rejected: number;
  over48hCount: number;
  avgResponseHours: number | null;
  overturnRatePercent: number | null;
  overturnRateWarning: boolean;
}

export type { ApiResponse, ManualReviewFormType };
