import { AnnualAccountSectionKey, ApiResponse } from '../manual-review-queue/manual-review-queue.models';

export type ManualReviewRequestStatus = 'PENDING' | 'APPROVED' | 'RETURNED';

export interface ManualReviewActorInfo {
  role: string;
  name: string | null;
}

/** One row of GET /xvi-fc/annual-account/manual-review-history — sourced from
 *  xvifc_ac_manual_review_requests, so unlike the queue it covers every status, not just PENDING. */
export interface ManualReviewHistoryRow {
  requestId: string;
  annualAccountId: string;
  ulbId: string;
  ulbName: string | null;
  ulbCode: string | null;
  stateName: string | null;
  section: AnnualAccountSectionKey;
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

export interface ManualReviewHistoryQuery {
  page: number;
  pageSize: number;
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
}

export type ManualReviewHistoryStatsRange = 'today' | 'week' | 'all';

/** GET /xvi-fc/annual-account/manual-review-history/stats — summary counts for the history page's
 *  REQUESTED time-range tabs. `overturnRateWarning` is computed server-side (needs >=5 decided
 *  requests) so the frontend never has to duplicate that sample-size threshold. */
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

export type { ApiResponse };
