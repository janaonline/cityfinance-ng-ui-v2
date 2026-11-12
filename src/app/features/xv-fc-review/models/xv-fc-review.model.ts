// ── FY tabs (GET /xv-fc-review/:ulbId/summary) ──────────────────────────────

/** Raw backend status string for a FY's review, e.g. NOT_STARTED / IN_PROGRESS / SUBMITTED. */
export type XvFcReviewStatus = string;

export interface XvFcFySummary {
  financialYear: string;
  /** Backend-generated id for this FY — used in place of `financialYear` in all API paths. */
  yearId: string;
  status: XvFcReviewStatus;
  flaggedCount: number;
}

/** Best-effort classification of a backend status string — the API doesn't publish a fixed enum. */
export function isXvFcSubmittedStatus(status: XvFcReviewStatus | null | undefined): boolean {
  const s = (status ?? '').toUpperCase();
  return (
    s.includes('SUBMIT') ||
    s.includes('COMPLETE') ||
    s.includes('LOCK') ||
    s.includes('ACCEPT') ||
    s.includes('APPROV')
  );
}

// ── FY detail (GET /xv-fc-review/:ulbId/:financialYear) ─────────────────────
// Also the payload shape used for the preview screen.

/** Shape of an uploaded file as it comes back embedded in the FY detail response. */
export interface XvFcUploadedFile {
  url: string | null;
  name: string;
  uploadedAt: string | null;
}

/** The signed declaration is wrapped with who/when it was declared, unlike the flat supporting document. */
export interface XvFcDeclaration {
  file: XvFcUploadedFile;
  declaredBy?: string | null;
  declaredAt?: string | null;
}

export interface XvFcLineItem {
  code: string;
  name: string;
  section: string;
  /** Further breakdown within a section — not every item has one. */
  subSection?: string | null;
  /** Standardised amount — AFS's backend always stores/returns this in whole ₹ (unlike Ptax, which uses ₹ Lakhs). Can be null. */
  standardizedAmount: number | null;
  flagged: boolean;
  /** The ULB-entered correct value for a flagged row, always in whole ₹ — a separate field from `comment`. */
  proposedValue: number | null;
  comment: string;
  /** Shape not yet surfaced in the UI — typed loosely until the backend contract is confirmed. */
  adminDecision: Record<string, unknown> | null;
}

/** UI sub-grouping of a section's items by `subSection`, when present. */
export interface XvFcLineItemSubGroup {
  subSection: string | null;
  items: XvFcLineItem[];
}

/** UI grouping of line items by `section`, further split into `subSection`s where available. */
export interface XvFcLineItemGroup {
  section: string;
  subGroups: XvFcLineItemSubGroup[];
}

export interface XvFcSourceDocument {
  name: string;
  targetCode: string;
  url: string | null;
}

export type XvFcFinalAction = 'ACCEPT_NO_CHANGES' | 'SUBMIT_WITH_COMMENTS';

export interface XvFcFyDetail {
  ulbId?: string;
  ulbName?: string;
  financialYear: string;
  status: XvFcReviewStatus;
  lineItems: XvFcLineItem[];
  /** Not present on a NOT_STARTED FY — defensively defaulted to `[]` where read. */
  sourceDocuments?: XvFcSourceDocument[];
  declaration: XvFcDeclaration | null;
  /** One shared supporting document for the whole FY — covers every flagged line item. */
  supportingDocument: XvFcUploadedFile | null;
  submittedAt?: string | null;
  finalAction: XvFcFinalAction | null;
}

// ── Save as draft (PUT /xv-fc-review/:ulbId/:financialYear/draft) ───────────

export interface XvFcDraftLineItemPayload {
  code: string;
  flagged: boolean;
  proposedValue?: number;
  comment?: string;
}

export interface XvFcDraftPayload {
  lineItems: XvFcDraftLineItemPayload[];
}

// ── Document upload (presign / confirm) ──────────────────────────────────────
// The API confirms targetCode is a strict two-value enum — there is no per-line-item
// upload slot despite each line item's shape having room for one.

export const XV_FC_DECLARATION_TARGET_CODE = 'DECLARATION';
export const XV_FC_SUPPORTING_DOCUMENT_TARGET_CODE = 'SUPPORTING_DOCUMENT';

export interface XvFcPresignRequest {
  targetCode: string;
  fileName: string;
  fileSize: number;
}

export interface XvFcPresignResponse {
  uploadId: string;
  presignedUrl: string;
  s3Key: string;
  expiresIn?: number;
}

export interface XvFcConfirmUploadRequest {
  uploadId: string;
  s3Key: string;
  targetCode: string;
  originalName: string;
  fileSize: number;
}

// ── Submit (POST /xv-fc-review/:ulbId/:financialYear/submit) ────────────────

export interface XvFcSubmitPayload {
  finalAction: XvFcFinalAction;
}

// ── Currency / unit display ──────────────────────────────────────────────────

export type XvFcCurrencyUnit = 'whole' | 'lakhs' | 'crores';

export const XV_FC_CURRENCY_UNIT_LABELS: Record<XvFcCurrencyUnit, string> = {
  whole: 'Whole ₹',
  lakhs: '₹ Lakhs',
  crores: '₹ Crores',
};

/** Maps our display unit to the `pdf?currency=` query value the API expects. */
export const XV_FC_CURRENCY_UNIT_TO_API: Record<XvFcCurrencyUnit, 'INR' | 'LAKH' | 'CRORE'> = {
  whole: 'INR',
  lakhs: 'LAKH',
  crores: 'CRORE',
};
