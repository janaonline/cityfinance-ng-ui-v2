import { ConditionalFieldConfig } from '../dynamic-form-visibility.service';

// Generic envelope/error types mirror the backend's shared XviFcApiResponse / XviFcValidationErrorMap
// — declared fresh here rather than imported from another module's models file, matching this
// codebase's own established convention (every xvi-fc submodule locally redeclares this same wire
// shape; there is no single shared Angular-side envelope type).
export interface PmuApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

export type PmuApiErrorMap = Record<string, PmuApiFieldError[]>;

export interface PmuApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: PmuApiErrorMap;
  meta?: Record<string, unknown>;
  timestamp?: string;
  requestId?: string;
}

/** Normalizes either an Angular `HttpErrorResponse.error` body or a thrown `success:false` response
 *  object (the shape the PMU services throw on `success:false`) into one type. */
export interface PmuApiErrorResponse {
  success?: false;
  statusCode?: number;
  message?: string;
  errors?: PmuApiErrorMap;
  timestamp?: string;
  path?: string;
  data?: unknown;
}

export interface PmuActor {
  action: 'Created by' | 'Updated by' | 'Submitted by';
  by: string | null;
  date: string | null;
  designation: string;
}

export interface PmuPermissions {
  canView: boolean;
  canApproveForm: boolean;
  canRejectForm: boolean;
  /** Only present for Elected Body / FC Unspent (row-level forms). */
  canReviewRows?: boolean;
}

export interface PmuRowSummary {
  total: number;
  active: number;
  updatePending: number;
  rejected: number;
  needsUpdate: number;
  /** Only present for FC Unspent — Elected Body has no eligibility concept. */
  eligible?: number;
  ineligible?: number;
}

/** `GET worklist/:yearId` response row — identical shape across all 5 PMU modules. */
export interface PmuWorklistRow {
  stateId: string;
  stateName: string;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  /** `null` for a state with no document at all for this form yet (synthesized `NOT_STARTED` row —
   *  there is no real timestamp to report). */
  updatedAt: string | null;
  /** Only present for GTC / Devolution Formula rows — one worklist row per installment. */
  installment?: 1 | 2;
}

/** `GET :stateId/:yearId[/:installment]` response `data`, covering all 5 PMU modules — `questions`
 *  is absent for Devolution Formula (its real data lives in its row collection, snapshotted at
 *  FINAL_SUBMIT; PMU only does whole-form approve/reject for it), `rowSummary` only exists for
 *  Elected Body/FC Unspent. One concrete type with optional fields, not a type parameter, since no
 *  consumer ever needs the forms' shapes kept genuinely distinct. */
export interface PmuFormReviewData {
  formId: string;
  stateId: string;
  stateName: string;
  yearId: string;
  installment?: 1 | 2;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  /** Set on PMU reject, never cleared until the next transition overwrites it. */
  pmuRemarks: string | null;
  questions?: ConditionalFieldConfig[];
  rowSummary?: PmuRowSummary;
  /** Only present for Elected Body — the Excel upload's validation status ('VALID'/'INVALID'/
   *  'NOT_VALIDATED'), needed to bridge the synthetic `electedBodyExcelValidationStatus` form
   *  control that `signedElectedbodyFile`'s `visibleWhen` condition gates on (same mechanism
   *  `ElectedBodyStatusComponent`'s own State-side page already uses). */
  validationStatus?: string;
  permissions: PmuPermissions;
  actors: PmuActor[];
}

/** Response `data` shared by complete-form approve/reject. */
export interface PmuFormSubmitData {
  currentFormStatus: number;
  currentFormStatusLabel: string;
}

export interface PmuRejectFormPayload {
  pmuRemarks: string;
}

export interface PmuRowPermissions {
  canApprove: boolean;
  canReject: boolean;
}

/** One row from `GET :stateId/:yearId/rows` — covers both Elected Body and FC Unspent (confirmed
 *  field-for-field identical for everything the shared UI actually renders). */
export interface PmuRow {
  _id: string;
  rowNumber: number;
  ulbId: string | null;
  censusCode: string | null;
  ulbName: string;
  rowStatus: number | null;
  rejectionRemark: string | null;
  /** Only present for FC Unspent rows. */
  eligibility?: boolean;
  /** Only present for FC Unspent rows — already returned by the backend today, just not
   *  previously surfaced on this type. */
  allocationAmount?: number;
  unspentAmount?: number;
  previousFcUnspentBalance?: number;
  permissions: PmuRowPermissions;
}

/** Read-only — Devolution Formula's PMU reviewer never mutates row data (whole-form reject only).
 *  Mirrors the columns the State's own read side already shows (censusCode/ulbName/the 3 amount
 *  fields/devolutionFormula), just view-only. */
export interface PmuDevolutionRow {
  rowNumber: number;
  censusCode: string;
  ulbName: string;
  totalGrantAllocation: number;
  installment1Amount: number;
  installment2Amount: number;
  devolutionFormula: string;
}

export interface PmuRowsQuery {
  search?: string;
  page?: number;
  limit?: number;
  rowStatus?: number;
  /** Only meaningful for FC Unspent — silently ignored by Elected Body's endpoint. */
  eligibility?: boolean;
}

export interface PmuRowsResult {
  rows: PmuRow[];
  page: number;
  limit: number;
  total: number;
}

export interface PmuBulkApprovePayload {
  stateId: string;
  yearId: string;
  rowIds: string[];
}

export interface PmuRowRejection {
  rowId: string;
  rejectionRemark: string;
}

export interface PmuBulkRejectPayload {
  stateId: string;
  yearId: string;
  rows: PmuRowRejection[];
}

/** Response `data` shared by both bulk-approve and bulk-reject. */
export interface PmuBulkActionData {
  updatedRowCount: number;
  rowSummary?: PmuRowSummary;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  parentAcknowledged: boolean;
}
