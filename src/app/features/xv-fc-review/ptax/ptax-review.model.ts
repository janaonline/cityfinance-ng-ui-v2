/**
 * Ptax (Property Tax) review — backed by the real `/xv-fc-review/ptax` API.
 * Mirrors the main XV-FC review's document model: a declaration (always required) and a
 * separate shared supporting document (only required once a metric is flagged), each with
 * its own `targetCode`-scoped upload/confirm/signed-url endpoint.
 */
export type PtaxReviewStatus = string;

/** Best-effort classification — the API doesn't publish a fixed status enum. */
export function isPtaxSubmittedStatus(status: PtaxReviewStatus | null | undefined): boolean {
  const s = (status ?? '').toUpperCase();
  return (
    s.includes('SUBMIT') ||
    s.includes('COMPLETE') ||
    s.includes('LOCK') ||
    s.includes('ACCEPT') ||
    s.includes('APPROV')
  );
}

/** A rejected review must stay editable so the ULB can resubmit — see the `submit` endpoint's "or resubmit after rejection". */
export function isPtaxRejectedStatus(status: PtaxReviewStatus | null | undefined): boolean {
  return (status ?? '').toUpperCase().includes('REJECT');
}

export function isPtaxLockedStatus(status: PtaxReviewStatus | null | undefined): boolean {
  return isPtaxSubmittedStatus(status) && !isPtaxRejectedStatus(status);
}

// ── FY tabs (GET /xv-fc-review/ptax/:ulbId/summary) ──────────────────────────

export interface PtaxFySummary {
  financialYear: string;
  /** Backend-generated id for this FY — used in place of `financialYear` in all API paths. */
  yearId: string;
  hasData: boolean;
  reviewStatus: PtaxReviewStatus;
  submissionCount: number;
  flaggedCount: number;
}

// ── FY detail (GET /xv-fc-review/ptax/:ulbId/:financialYear) ────────────────
// Also the payload shape used for the preview screen.

/** Per-metric constraints for the "correct value" input, sent by the API on each metric. */
export interface PtaxMetricValidation {
  min: number;
  max: number;
  decimalLimit: number;
  /** true for the 4 currency metrics (always ₹ Lakhs); false for the 2 count metrics. */
  isRupee: boolean;
}

export interface PtaxMetric {
  code: string;
  label: string;
  /**
   * Standardised value — ₹ Lakhs for 'amount' metrics, a plain count for 'count' metrics.
   * The API returns this as a numeric string (e.g. "3.50"), not a number.
   */
  value: string | null;
  flagged: boolean;
  /** The ULB-entered correct value for a flagged metric, always in ₹ Lakhs — a separate field from `comment`. */
  proposedValue: number | null;
  comment: string;
  validation: PtaxMetricValidation | null;
  /** Shape not yet surfaced in the UI — typed loosely until confirmed. */
  adminDecision: Record<string, unknown> | null;
}

/** Shape of an uploaded document as embedded in the FY detail response — matches AFS's `XvFcUploadedFile`. */
export interface PtaxDocument {
  url: string | null;
  name: string;
  uploadedAt: string | null;
}

/** The signed declaration is wrapped with who/when it was declared, unlike the flat supporting document — matches AFS's `XvFcDeclaration`. */
export interface PtaxDeclaration {
  file: PtaxDocument;
  declaredBy?: string | null;
  declaredAt?: string | null;
}

export type PtaxFinalAction = 'ACCEPT_NO_CHANGES' | 'SUBMIT_WITH_COMMENTS';

/** Shape of each `history` entry is unconfirmed — not yet surfaced in the UI. */
export type PtaxHistoryEntry = Record<string, unknown>;

/** Cross-field constraint: the `lesser` metric's effective value must not exceed the `greater` metric's. */
export interface PtaxMetricOrderRule {
  greater: string;
  lesser: string;
}

export interface PtaxFyDetail {
  financialYear: string;
  status: PtaxReviewStatus;
  metrics: PtaxMetric[];
  /** Pairwise ordering constraints across metrics, e.g. 1.10 (lesser) must not exceed 1.9 (greater). */
  metricOrderRules?: PtaxMetricOrderRule[];
  declaration: PtaxDeclaration | null;
  /** One shared supporting document for the whole FY — covers every flagged metric. */
  supportingDocument: PtaxDocument | null;
  submittedAt?: string | null;
  finalAction?: PtaxFinalAction | null;
  history?: PtaxHistoryEntry[];
}

// ── Save as draft (PUT /xv-fc-review/ptax/:ulbId/:financialYear/draft) ──────

export interface PtaxDraftMetricPayload {
  code: string;
  flagged: boolean;
  proposedValue?: number;
  comment?: string;
}

// ── Document upload (presign / confirm) — targetCode-scoped, matching AFS ───

export const PTAX_DECLARATION_TARGET_CODE = 'DECLARATION';
export const PTAX_SUPPORTING_DOCUMENT_TARGET_CODE = 'SUPPORTING_DOCUMENT';

export interface PtaxPresignRequest {
  targetCode: string;
  fileName: string;
  fileSize: number;
}

export interface PtaxPresignResponse {
  uploadId: string;
  presignedUrl: string;
  s3Key: string;
  expiresIn?: number;
}

export interface PtaxConfirmUploadRequest {
  uploadId: string;
  s3Key: string;
  targetCode: string;
  originalName: string;
  fileSize: number;
}

// ── Submit (POST /xv-fc-review/ptax/:ulbId/:financialYear/submit) ───────────

export interface PtaxSubmitPayload {
  finalAction: PtaxFinalAction;
}
