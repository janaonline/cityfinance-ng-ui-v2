// Mirrors src/module/xv-fc/xv-fc-review/admin/xv-fc-review-admin.service.ts (cf-nest-api-v2) response shapes 1:1.

// Mirrors XV_FC_REVIEWABLE_YEARS in cf-nest-api-v2's common/xv-fc-review.constants.ts — the AFS
// review window is a fixed 5-year business range, not derived from data.
export const XV_FC_ADMIN_REVIEWABLE_YEARS = ['2019-20', '2020-21', '2021-22', '2022-23', '2023-24'] as const;

export type XvFcAdminReviewStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'LOCKED'
  | 'VERIFYING'
  | 'APPROVED'
  | 'REJECTED';

export type XvFcAdminDecisionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface XvFcAdminFileRef {
  url: string;
  name: string;
  uploadedAt: string | null;
}

export interface XvFcAdminDeclaration {
  file: XvFcAdminFileRef;
  declaredBy?: string | null;
  declaredAt?: string | null;
}

// ── List (GET /admin/xv-fc-review) ──────────────────────────────────────────

export interface XvFcAdminReviewRow {
  ulbId: string;
  ulbName: string;
  ulbCode: string;
  censusCode: string | null;
  state: string;
  stateCode: string;
  financialYear: string;
  reviewStatus: XvFcAdminReviewStatus;
  submittedAt: string | null;
  flaggedCount: number;
  pendingCount: number;
}

export interface XvFcAdminReviewListResponse {
  rows: XvFcAdminReviewRow[];
  total: number;
  page: number;
  limit: number;
}

export interface XvFcAdminReviewListQuery {
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

// ── Years summary (GET /admin/xv-fc-review/:ulbId/years) ───────────────────

export interface XvFcAdminYearSummary {
  financialYear: string;
  yearId: string | null;
  status: XvFcAdminReviewStatus;
}

// ── Detail (GET /admin/xv-fc-review/:ulbId/:yearId) ─────────────────────────

export interface XvFcAdminDecision {
  status: XvFcAdminDecisionStatus;
  reason: string;
  correctedValue: number | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export interface XvFcAdminLineItem {
  code: string;
  name: string | null;
  headOfAccount: string | null;
  section: string | null;
  subSection: string | null;
  originalValue: number | null;
  flagged: boolean;
  proposedValue: number | null;
  comment: string;
  adminDecision: XvFcAdminDecision | null;
}

export interface XvFcAdminAuditEntry {
  action: 'ULB_FLAG' | 'ULB_SUBMIT' | 'ADMIN_ACCEPT' | 'ADMIN_REJECT' | 'SUBMISSION_APPROVED' | 'SUBMISSION_REJECTED' | 'REOPENED';
  lineItemCode: string | null;
  previousValue: number | null;
  newValue: number | null;
  performedBy: string;
  performedByRole: string;
  reason: string;
  createdAt: string;
}

export interface XvFcAdminReviewDetail {
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
  lineItems: XvFcAdminLineItem[];
  auditTrail: XvFcAdminAuditEntry[];
}

// ── Decision (POST .../line-items/:code/decision) ──────────────────────────

export interface XvFcAdminLineItemDecisionPayload {
  decision: 'ACCEPTED' | 'REJECTED';
  reason?: string;
  correctedValue?: number;
}

export const XV_FC_ADMIN_DECLARATION_TARGET_CODE = 'DECLARATION';
export const XV_FC_ADMIN_SUPPORTING_DOCUMENT_TARGET_CODE = 'SUPPORTING_DOCUMENT';

/** Best-effort classification of the combined AFS+Ptax review status set — the API doesn't publish a fixed enum shared across both. */
export function isXvFcAdminFinalized(status: XvFcAdminReviewStatus | string | null | undefined): boolean {
  return status === 'APPROVED' || status === 'REJECTED';
}
