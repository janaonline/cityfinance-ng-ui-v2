// Mirrors src/module/xv-fc/xv-fc-review/admin/overview/xv-fc-review-overview.service.ts (cf-nest-api-v2) response shapes 1:1.

export const XV_FC_OVERVIEW_OVERALL_STATUS = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'VERIFYING',
  'PARTIAL',
  'APPROVED',
  'REJECTED',
] as const;
export type XvFcOverviewOverallStatus = (typeof XV_FC_OVERVIEW_OVERALL_STATUS)[number];

export interface XvFcOverviewFormStatus {
  status: string;
  /** The reviewable year this status actually came from (each ULB, each form, independently
   *  picks whichever of the 5 years is most worth an admin's attention) — null when the ULB
   *  hasn't touched this form on any reviewable year yet. Use this, not a locally-guessed year,
   *  when navigating this row into the Detail screen. */
  financialYear: string | null;
  flaggedCount: number;
  pendingCount: number;
  acceptedPct: number;
  rejectedPct: number;
}

export interface XvFcOverviewRow {
  ulbId: string;
  ulbName: string;
  ulbCode: string;
  censusCode: string | null;
  state: string;
  stateCode: string;
  overallStatus: XvFcOverviewOverallStatus;
  afs: XvFcOverviewFormStatus;
  ptax: XvFcOverviewFormStatus;
}

export interface XvFcOverviewListResponse {
  rows: XvFcOverviewRow[];
  total: number;
  page: number;
  limit: number;
}

export interface XvFcOverviewListQuery {
  page?: number;
  limit?: number;
  stateName?: string;
  censusCode?: string;
  search?: string;
  overallStatus?: XvFcOverviewOverallStatus;
  sortBy?: 'ulb' | 'state' | 'censusCode';
  sortOrder?: 'asc' | 'desc';
}

export interface XvFcOverviewAnalytics {
  totalUlbs: number;
  awaitingVerification: number;
  approved: number;
  rejected: number;
}

export interface XvFcOverviewAnalyticsQuery {
  form?: 'afs' | 'ptax';
}

export interface XvFcOverviewExportQuery {
  stateName?: string;
  censusCode?: string;
  search?: string;
  overallStatus?: XvFcOverviewOverallStatus;
}
