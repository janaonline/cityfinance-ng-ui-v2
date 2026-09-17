import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

export interface RequestExemptionPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

export interface RequestExemptionData {
  stateId: string;
  yearId: string;
  stateName: string;
  fields: ConditionalFieldConfig[];
  permissions: RequestExemptionPermissions;
}

export interface RequestExemptionSaveData {
  ulb?: string | null;
  reasonForExemption?: number[];
  supportingDetails?: string;
  supportingFile?: unknown;
}

/** No `requestId` field — the backend transparently resolves the right document by `{ulb, year}`
 *  and merges each submitted `formId` into it (a fresh `formId` is added, a rejected one is
 *  wholesale-replaced in place, a still-pending/approved one blocks the submission). See
 *  `RequestExemptionService.finalSubmit`'s own doc-comment on the backend. */
export interface RequestExemptionSavePayload {
  stateId: string;
  yearId: string;
  data: RequestExemptionSaveData;
}

/** `final-submit` response body — mirrors the backend's own `RequestExemptionSaveResponseData`
 *  (`request-exemption.types.ts`). */
export interface RequestExemptionSaveResponseData {
  _id: string;
  currentFormStatus: number;
  currentFormStatusLabel: string;
}

/** Query params for the "Exemption Status" list — mirrors the backend's
 *  `GetRequestExemptionListQueryDto`. */
export interface RequestExemptionListQuery {
  page?: number;
  limit?: number;
}

/**
 * One row of the "Exemption Status" table — mirrors the backend's own `RequestExemptionListItem`.
 * One row per `(document, formId)` pair, not one row per document — a ULB with two requested
 * reasons shows as two rows. `_id` is a stable synthetic key; `requestId`+`formId` is the real
 * addressable pair for any future decide/resume action.
 */
export interface RequestExemptionListItem {
  _id: string;
  requestId: string;
  formId: number;
  /** `censusCode` falls back to `sbCode` server-side when the census code isn't set. */
  ulb: { _id: string; name: string; censusCode: string | null } | null;
  /** Server-computed display label for `formId` — no client-side formId->label map needed. */
  reasonForExemptionLabel: string;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  submittedAt: string | null;
  createdAt: string;
}

export interface RequestExemptionListResponseData {
  stateName: string;
  items: RequestExemptionListItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  canCreate: boolean;
}

// ─── API response / error shapes (mirrors XviFcApiResponse / XviFcValidationErrorMap on the backend) ───

export interface ApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

export type ApiErrorMap = Record<string, ApiFieldError[]>;

export interface RequestExemptionApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiErrorMap;
  meta?: Record<string, unknown>;
  timestamp?: string;
}
