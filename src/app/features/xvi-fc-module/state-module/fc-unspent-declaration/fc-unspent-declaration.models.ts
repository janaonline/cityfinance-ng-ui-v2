import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { FormActor, FormStatusValue } from '../../shared/form-progress/form-progress.component';

/** Canonical Finance Commission cycle identifiers. Never render these raw — use the page's computed display label instead. */
export type FcUnspentApplicableFc = '14TH_FC' | '15TH_FC';

/**
 * Authoritative UI gates. The component must read these directly — never infer `canFinalSubmit`
 * (or any other gate) from `currentFormStatus` or from `dependency` locally. `canSaveDraft` is a
 * new gate introduced for this feature (sibling forms — sfc-status/devolution-formula — only have
 * canView/canEdit/canFinalSubmit); see FC_UNSPENT_UI_API_CONTRACT.md, "CONTRACT DECISION REQUIRED".
 */
export interface FcUnspentPermissions {
  canView: boolean;
  canEdit: boolean;
  canSaveDraft: boolean;
  canFinalSubmit: boolean;
}

/**
 * Devolution-Formula dependency info, for DISPLAY/EXPLANATION only — `devolutionStatus`,
 * `devolutionDatasetExists`, and `editableDueToDevolutionReturn` describe *why* the top-level
 * `permissions` above are what they are; the backend has already folded the Devolution dependency
 * into `permissions`. The component must never re-derive gating from these fields — only use them
 * to render the status label and `blockingMessage`. No cross-form dependency concept exists
 * anywhere else in this codebase yet, so this shape is a new proposal — see
 * FC_UNSPENT_UI_API_CONTRACT.md, "CONTRACT DECISION REQUIRED".
 */
export interface FcUnspentDevolutionDependency {
  /** `null` when the State has no Devolution Formula submission yet for this state/year. */
  devolutionStatus: FormStatusValue | null;
  /** Whether an active Installment-1 Devolution allocation dataset exists at all. */
  devolutionDatasetExists: boolean;
  /** True when Devolution being RETURNED_BY_MOHUA is why FC Unspent is currently editable again
   *  (a reopened-for-correction edit, not a normal in-progress first edit). */
  editableDueToDevolutionReturn: boolean;
  /** Backend-composed explanation to show the State when something is blocked. The UI displays
   *  this verbatim in a warning banner; it must never compose its own message from raw status. */
  blockingMessage: string | null;
}

/**
 * One selectable ULB option, sourced from a dedicated, lazily-loaded lookup call
 * (`FcUnspentDeclarationService.getUlbOptions`) — never part of the form-preview response. States
 * can have hundreds of ULBs (e.g. UP), so this list must only be requested when the user actually
 * needs to pick or change a ULB, not on every page load.
 */
export interface FcUnspentUlbOption {
  ulbId: string;
  censusCode: string | null;
  sbCode: string | null;
  ulbName: string;
  allocationAmount: number;
}

/**
 * Query parameters for the lazy/searchable ULB-options endpoint. `stateId`/`yearId` are path
 * parameters on the real endpoint (`GET .../:stateId/:yearId/ulb-options`), passed as separate
 * `FcUnspentDeclarationService.getUlbOptions` arguments — not part of this query object.
 */
export interface FcUnspentUlbOptionsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

/** Paginated ULB-options result — mirrors the backend's `{data, meta: {page, limit, total}}` shape. */
export interface FcUnspentUlbOptionsResult {
  options: FcUnspentUlbOption[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Declaration-template file metadata, sourced from a dedicated lazy endpoint — never bundled into
 * the main GET preview response. `url` is always the application's own private signed download link
 * (`/file/download?signature=...`); the UI never receives or constructs a raw S3 path.
 */
export interface FcUnspentDeclarationTemplate {
  fileName: string;
  mimeType: string;
  url: string;
}

/**
 * One row of the unspent-ULB table. Only `ulbId` and `unspentAmount` are State-editable — the
 * rest, including `allocationPerc`/`eligibility`, are backend-owned. The frontend recomputes
 * `allocationPerc`/`eligibility` for preview only; the backend calculation remains authoritative.
 * `ulbName`/`censusCode`/`sbCode`/`allocationAmount` are a snapshot taken at save time — already-saved
 * rows must render from this snapshot directly, never by joining against `FcUnspentUlbOption[]`.
 *
 * Row-level MoHUA review data (review state, rejection remarks, per-row editability, whether the
 * allocation changed after a Devolution resubmission, whether the row requires re-review) is
 * deliberately NOT modeled here — no such naming exists anywhere in this codebase to reuse, and
 * inventing it would violate the "don't guess enum/field names" constraint. See
 * FC_UNSPENT_UI_API_CONTRACT.md, "CONTRACT DECISION REQUIRED" for the itemized list.
 */
export interface FcUnspentUlbData {
  slNo: number;
  ulbId: string;
  censusCode: string | null;
  sbCode: string | null;
  ulbName: string;
  allocationAmount: number;
  unspentAmount: number;
  allocationPerc: number;
  eligibility: boolean;
}

/**
 * Form-preview response payload. Deliberately excludes `ulbOptions` — the full ULB lookup list is
 * fetched separately and lazily (see `FcUnspentUlbOption`), only on real edit intent, so a No-branch
 * or read-only session never pulls a state's entire ULB list into memory.
 */
export interface FcUnspentDeclarationData {
  stateName: string;
  applicableFc: FcUnspentApplicableFc;
  threshold: number;
  currentFormStatus: FormStatusValue;
  permissions: FcUnspentPermissions;
  dependency: FcUnspentDevolutionDependency;
  actors: FormActor[];
  questions: ConditionalFieldConfig[];
  unspentUlbData: FcUnspentUlbData[];
}

/**
 * Test-fixture envelope only — kept for `fc-unspent-declaration.mock.ts`/`.mock-scenarios.ts`, which
 * are no longer used at runtime but still back component unit tests. Never imported by the real
 * `FcUnspentDeclarationService`, which talks to the backend directly via `HttpClient`.
 */
export interface FcUnspentDeclarationPreviewResponse {
  success: boolean;
  message: string;
  data: FcUnspentDeclarationData & { ulbOptions: FcUnspentUlbOption[] };
}

/**
 * Save-draft/final-submit request body — matches the `{ stateId, yearId, data }` envelope used by
 * `SfcStatusDraftPayload`/`SfcStatusFinalSubmitPayload` (see `sfc-status.models.ts`) and
 * `SaveDraftDevolutionPayload`/`FinalSubmitDevolutionPayload` (see `devolution-formula.models.ts`).
 *
 * `isFcUnspent` is a real boolean (`null` only while the State hasn't chosen a branch yet, allowed on
 * draft save) — the backend DTO (`SaveFcUnspentDeclarationDto`) accepts boolean/null only and rejects
 * a `'yes'|'no'` string with a 400. The radio control itself still holds `'yes'|'no'` for the UI; the
 * component converts at the API boundary in `buildPayload()`.
 */
export interface FcUnspentSaveData {
  isFcUnspent: boolean | null;
  /** No-branch only. Shape owned by the shared dynamic-form file control (`UploadedFileMetadata`). */
  fcDeclaration?: unknown;
  /** Yes-branch only. Rows with an incomplete selection (no `ulbId` or no `unspentAmount`) are
   *  dropped before sending — see buildPayload(). */
  unspentUlbData?: { ulbId: string; unspentAmount: number }[];
  /** Yes-branch only. */
  checkboxConfirmation?: boolean;
}

export interface FcUnspentSavePayload {
  stateId: string;
  yearId: string;
  data: FcUnspentSaveData;
}

// ─── API response / error shapes (mirrors XviFcApiResponse / XviFcValidationErrorMap on the backend) ───

export interface ApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

/** Keyed by field name; `_form` for non-field errors; `unspentUlbData.<index>.<ulbId|unspentAmount>`
 *  for indexed row errors; bare `unspentUlbData` for whole-array errors (e.g. duplicate/empty). */
export type ApiErrorMap = Record<string, ApiFieldError[]>;

export interface FcUnspentApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiErrorMap;
  meta?: Record<string, unknown>;
  timestamp?: string;
}

/** Normalized shape extracted from either an `HttpErrorResponse.error` body or a thrown `success:false` response. */
export interface ApiErrorResponse {
  success?: false;
  statusCode?: number;
  message?: string;
  errors?: ApiErrorMap;
  timestamp?: string;
  path?: string;
  data?: unknown;
}
