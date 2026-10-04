// Mirrors src/module/xv-fc/xv-fc-review/admin/ptax/ptax-review-admin.service.ts (cf-nest-api-v2) response shapes 1:1.
import { XvFcAdminDecision, XvFcAdminDeclaration, XvFcAdminFileRef, XvFcAdminReviewStatus } from './xv-fc-review-admin.model';

// Mirrors PTAX_REVIEWABLE_YEARS in cf-nest-api-v2's common/ptax.constants.ts — Ptax's review
// window starts a year earlier (2018-19) than AFS's (XV_FC_ADMIN_REVIEWABLE_YEARS, 2019-20),
// since real Ptax review activity genuinely goes back that far.
export const XV_FC_PTAX_ADMIN_REVIEWABLE_YEARS = [
  '2018-19',
  '2019-20',
  '2020-21',
  '2021-22',
  '2022-23',
  '2023-24',
] as const;

export interface PtaxAdminReviewRow {
  ulbId: string;
  ulbName: string;
  ulbCode: string;
  censusCode: string | null;
  state: string;
  stateCode: string;
  financialYear: string;
  reviewStatus: XvFcAdminReviewStatus;
  submittedAt: string | null;
  submissionCount: number;
  flaggedCount: number;
  pendingCount: number;
}

export interface PtaxAdminReviewListResponse {
  rows: PtaxAdminReviewRow[];
  total: number;
  page: number;
  limit: number;
}

export interface PtaxAdminReviewListQuery {
  page?: number;
  limit?: number;
  search?: string;
  stateId?: string;
  censusCode?: string;
  financialYear?: string;
  reviewStatus?: XvFcAdminReviewStatus;
  sortBy?: 'ulb' | 'financialYear' | 'state' | 'submittedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PtaxAdminMetricValidation {
  min: number;
  max: number;
  decimalLimit: number;
  isRupee: boolean;
}

export interface PtaxAdminMetric {
  code: string;
  label: string;
  value: string | null;
  flagged: boolean;
  proposedValue: number | null;
  comment: string;
  adminDecision: XvFcAdminDecision | null;
  validation: PtaxAdminMetricValidation | null;
}

export interface PtaxAdminMetricOrderRule {
  greater: string;
  lesser: string;
}

export interface PtaxAdminHistoryEntry {
  action: 'ULB_FLAG' | 'ULB_SUBMIT' | 'ADMIN_ACCEPT' | 'ADMIN_REJECT' | 'SUBMISSION_APPROVED' | 'SUBMISSION_REJECTED' | 'REOPENED';
  metricCode: string | null;
  previousValue: number | null;
  newValue: number | null;
  performedBy: string;
  performedByRole: string;
  reason: string;
  createdAt: string;
}

export interface PtaxAdminReviewDetail {
  ulbId: string;
  ulbName: string | null;
  ulbCode: string | null;
  state: string | null;
  yearId: string;
  financialYear: string;
  status: XvFcAdminReviewStatus;
  finalAction: 'ACCEPT_NO_CHANGES' | 'SUBMIT_WITH_COMMENTS' | null;
  declaration: XvFcAdminDeclaration | null;
  supportingDocument: XvFcAdminFileRef | null;
  submissionCount: number;
  metrics: PtaxAdminMetric[];
  metricOrderRules: PtaxAdminMetricOrderRule[];
  history: PtaxAdminHistoryEntry[];
}

export interface PtaxAdminMetricDecisionPayload {
  decision: 'ACCEPTED' | 'REJECTED';
  reason?: string;
  correctedValue?: number;
}
