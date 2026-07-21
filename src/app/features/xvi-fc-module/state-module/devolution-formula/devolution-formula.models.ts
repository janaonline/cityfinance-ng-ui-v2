import { UploadedFileMetadata } from '../../../../shared/dynamic-form/components/file/file-metadata.types';
import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { FormActor } from '../../shared/form-progress/form-progress.component';

// ─── Global API wrappers ──────────────────────────────────────────────────────

export interface XviFcApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

export type ApiErrorMap = Record<string, ApiFieldError[]>;

export interface ApiErrorResponse {
  success?: false;
  statusCode?: number;
  message?: string;
  errors?: ApiErrorMap;
  timestamp?: string;
  path?: string;
  data?: unknown;
}

export interface ApiValidationError {
  statusCode: number;
  message: string;
  errors: ApiErrorMap;
  data?: { validationSummary?: DevolutionValidationSummary; rowErrors?: DfRowValidationError[] };
  timestamp: string;
  path: string;
}

/**
 * One per-row validation failure from the backend's validate-excel/revalidate-excel `rowErrors`
 * array. Distinct from `DevolutionRowError` (which lacks row identity) — this is the shape the
 * backend actually sends at the top level of `response.data.rowErrors` / the thrown error's
 * `data.rowErrors`.
 */
export interface DfRowValidationError {
  rowNumber: number;
  censusCode?: string;
  ulbName?: string;
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

// ─── Devolution-specific scalar types ────────────────────────────────────────

export type SubmitType = 'saveAsDraft' | 'finalSubmit';

export type DfValidationStatus = 'NOT_VALIDATED' | 'VALID' | 'INVALID';
export type DfRowValidationStatus = 'VALID' | 'INVALID';
export type DfInstallment = 1 | 2;

// ─── Domain objects ───────────────────────────────────────────────────────────

export interface DevolutionPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

export interface DevolutionGrantAllocationSummary {
  grantAllocationId: string;
  basic: number;
  performance: number;
  total: number;
}

export interface DevolutionInstallmentAccessItem {
  canSelect: boolean;
  locked: boolean;
  lockReason: string | null;
}

export interface DevolutionInstallmentAccess {
  installment1: DevolutionInstallmentAccessItem;
  installment2: DevolutionInstallmentAccessItem;
}

export interface DevolutionValidationSummary {
  validationStatus: DfValidationStatus;
  excelRowCount: number;
  validRowCount: number;
  errorRowCount: number;
  missingUlbCount: number;
  totalMoHUAAllocation: number;
  totalAllocatedSum: number;
  allUlbsCovered: boolean;
  allocationBalanced: boolean;
  activeDatasetVersion: number;
  newUlbCount?: number;
}

// ─── Field / form types ───────────────────────────────────────────────────────

/** String action ID emitted by supporting-content action buttons. */
export type SupportingContentAction = string;

export interface Validator {
  name: string;
  validator: unknown;
  message: string;
}

/** Canonical dynamic-form uploaded-file shape sent to and returned by the devolution APIs. */
export type DevolutionFileValue = UploadedFileMetadata;

/** Same shape as DevolutionFileValue; used when sending a file reference in a payload. */
export type DevolutionFileRef = DevolutionFileValue;

/** Alias for ConditionalFieldConfig; used in Devolution form fields. */
export type DevolutionQuestion = ConditionalFieldConfig;

// ─── Form GET response ────────────────────────────────────────────────────────

export interface DevolutionFormResponseData {
  _id: string | null;
  formName: string;
  stateId: string;
  yearId: string;
  installment: DfInstallment;
  stateName: string;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  questions: ConditionalFieldConfig[];
  permissions: DevolutionPermissions;
  actors?: FormActor[];
  validationSummary?: DevolutionValidationSummary;
  grantAllocationSummary?: DevolutionGrantAllocationSummary;
  errorExcelFile?: DevolutionFileRef;
  rowEditFields?: ConditionalFieldConfig[];
  installmentAccess?: DevolutionInstallmentAccess;
  instructions?: unknown[];
  meta?: { version: number };
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface SaveDraftDevolutionPayload {
  stateId: string;
  yearId: string;
  installment: DfInstallment;
  data?: {
    excelFile?: DevolutionFileRef;
    checkboxConfirmation?: boolean;
  };
}

export interface FinalSubmitDevolutionPayload {
  stateId: string;
  yearId: string;
  installment: DfInstallment;
  data: {
    excelFile: DevolutionFileRef;
    checkboxConfirmation: boolean;
  };
}

export interface ValidateExcelDevolutionPayload {
  stateId: string;
  yearId: string;
  installment: DfInstallment;
  excelFile: DevolutionFileRef;
}

export interface UpdateDevolutionRowPayload {
  totalGrantAllocation?: number;
  installment1Amount?: number;
  installment2Amount?: number;
  devolutionFormula?: string;
}

export interface DevolutionDumpQuery {
  stateId?: string;
  yearId?: string;
  installment?: DfInstallment;
}

export interface DevolutionRowsQuery {
  page?: number;
  limit?: number;
  search?: string;
  validationStatus?: DfRowValidationStatus | '';
}

// ─── Row types ────────────────────────────────────────────────────────────────

export interface DevolutionRowError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

export interface DevolutionRow {
  _id: string;
  rowNumber: number;
  ulbId: string | null;
  censusCode: string;
  ulbName: string;
  totalGrantAllocation: number;
  installment1Amount: number;
  installment2Amount: number;
  devolutionFormula: string;
  validationStatus: DfRowValidationStatus;
  errors: DevolutionRowError[];
  datasetVersion: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DevolutionRowsResponseData {
  rows: DevolutionRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  validationSummary: DevolutionValidationSummary;
}

export interface DevolutionRowsDialogData {
  stateId: string;
  yearId: string;
  installment: DfInstallment;
  canEdit: boolean;
  rowEditFields: ConditionalFieldConfig[];
  /** Pre-sets the dialog's validation-status filter on open (e.g. to jump straight to the rows a
   *  failed validate-excel call just flagged), instead of the default "All" filter. */
  initialValidationStatusFilter?: DfRowValidationStatus;
}

export interface DevolutionRowsDialogResult {
  updatedSummary?: DevolutionValidationSummary;
}

export interface DevolutionRowValidationError {
  rowId: string;
  rowNumber: number;
  errors: DevolutionRowError[];
}

export interface DfRowUpdateApiError {
  field: string;
  code?: string;
  message: string;
  value?: unknown;
}

// ─── Mutation response data types ─────────────────────────────────────────────

export interface ValidateExcelDevolutionResponseData {
  validationStatus: DfValidationStatus;
  validationSummary: DevolutionValidationSummary;
  errorExcelFile?: DevolutionFileRef;
  errors?: DevolutionRowError[];
  rowErrors: DfRowValidationError[];
}

export interface RevalidateDevolutionResponseData {
  validationSummary: DevolutionValidationSummary;
  errors?: DevolutionRowError[];
  rowErrors: DfRowValidationError[];
}

export interface UpdateRowDevolutionResponseData {
  row: DevolutionRow;
  validationSummary?: DevolutionValidationSummary;
}

export interface SaveDraftDevolutionResponseData {
  currentFormStatus?: number;
  currentFormStatusLabel?: string;
}

export interface FinalSubmitDevolutionResponseData {
  currentFormStatus?: number;
  currentFormStatusLabel?: string;
}

export interface DeleteUploadedExcelResponseData {
  validationSummary?: DevolutionValidationSummary;
}
