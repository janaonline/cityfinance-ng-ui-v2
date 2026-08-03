import {
  ApiErrorMap,
  ApiErrorResponse,
  ApiFieldError,
  FcUnspentApiResponse,
} from '../../state-module/fc-unspent-declaration/fc-unspent-declaration.models';
import { FORM_STATUS } from '../../common/constants/form-status.constants';

// Generic envelope/error types are the same wire shape the State-side FC Unspent service already
// established (mirrors the backend's shared XviFcApiResponse / XviFcValidationErrorMap) — reused
// here rather than redefined. Nothing else from the State-side models file is imported: those types
// describe the State submitter's own form, not the MoHUA reviewer's read/approve/reject view.
export type { ApiErrorMap, ApiErrorResponse, ApiFieldError, FcUnspentApiResponse };

/**
 * Numeric FORM_STATUS subset — never rename/relabel these; use `ROW_STATUS_LABEL`/
 * `ROW_STATUS_BADGE_CLASS` for display. Sourced from the shared FORM_STATUS constant rather than
 * hand-typed numbers, matching the backend's row-review-status.constants.ts mapping.
 */
export const ROW_STATUS = {
  UPDATE_PENDING: FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
  ACTIVE: FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA,
  REJECTED: FORM_STATUS.RETURNED_BY_MOHUA,
  NEEDS_UPDATE: FORM_STATUS.ACTION_REQUIRED,
} as const;
export type RowStatusType = (typeof ROW_STATUS)[keyof typeof ROW_STATUS];

export interface FcUnspentMohuaRowSummary {
  total: number;
  active: number;
  updatePending: number;
  rejected: number;
  needsUpdate: number;
  eligible: number;
  ineligible: number;
}

export interface FcUnspentMohuaPermissions {
  canView: boolean;
  canApproveForm: boolean;
  canRejectForm: boolean;
  canReviewRows: boolean;
}

export interface FcUnspentMohuaActor {
  action: 'Created by' | 'Updated by' | 'Submitted by';
  by: string | null;
  date: string | null;
  designation: string;
}

/** `GET /:stateId/:yearId` response `data`. */
export interface FcUnspentMohuaReviewData {
  formId: string;
  stateId: string;
  stateName: string;
  yearId: string;
  designYear: string;
  applicableFc: '14TH_FC' | '15TH_FC';
  isFcUnspent: boolean | null;
  fcDeclaration: unknown;
  checkboxConfirmation: boolean;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  threshold: number;
  rowSummary: FcUnspentMohuaRowSummary;
  permissions: FcUnspentMohuaPermissions;
  actors: FcUnspentMohuaActor[];
}

export interface FcUnspentMohuaRowPermissions {
  canApprove: boolean;
  canReject: boolean;
}

/** One row from `GET /:stateId/:yearId/rows`. */
export interface FcUnspentMohuaRow {
  _id: string;
  rowNumber: number;
  ulbId: string;
  censusCode: string | null;
  sbCode: string | null;
  ulbName: string;
  allocationAmount: number;
  unspentAmount: number;
  allocationPerc: number;
  eligibility: boolean;
  rowStatus: RowStatusType | null;
  rejectionRemark: string | null;
  permissions: FcUnspentMohuaRowPermissions;
}

export interface FcUnspentMohuaRowsQuery {
  search?: string;
  page?: number;
  limit?: number;
  rowStatus?: RowStatusType;
  eligibility?: boolean;
}

export interface FcUnspentMohuaRowsResult {
  rows: FcUnspentMohuaRow[];
  page: number;
  limit: number;
  total: number;
}

export interface FcUnspentMohuaBulkApprovePayload {
  stateId: string;
  yearId: string;
  rowIds: string[];
}

export interface FcUnspentRowRejection {
  rowId: string;
  rejectionRemark: string;
}

export interface FcUnspentMohuaBulkRejectPayload {
  stateId: string;
  yearId: string;
  rows: FcUnspentRowRejection[];
}

/** Response `data` shared by both bulk-approve and bulk-reject. */
export interface FcUnspentMohuaBulkActionData {
  updatedRowCount: number;
  rowSummary: FcUnspentMohuaRowSummary;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  /** True when the backend auto-acknowledged the parent form because every active row is now ACTIVE.
   *  Always false for a reject action. The UI only ever reflects this via a reload — never inferred. */
  parentAcknowledged: boolean;
}

/** Response `data` shared by complete-form approve/reject. */
export interface FcUnspentMohuaSubmitData {
  currentFormStatus: number;
  currentFormStatusLabel: string;
}

export interface FcUnspentMohuaRejectFormPayload {
  mohuaRemarks: string;
}
