import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { FormActor } from '../../shared/form-progress/form-progress.component';

export type SubmitType = 'saveAsDraft' | 'finalSubmit';

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

export interface EulbFileValue {
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string;
  s3Key?: string;
}

export type EulbValidationStatus = 'NOT_VALIDATED' | 'VALID' | 'INVALID';
export type EulbRowValidationStatus = 'VALID' | 'INVALID';
export type EulbRowType = 'DB_ULB' | 'EXTRA_ULB';
export type EulbBodyStatus = 'Constituted' | 'Not Constituted' | 'Exempt';
export const EULB_EDITABLE_FIELDS = ['electedBodyStatus', 'dateOfConstitution', 'dateOfExpiry', 'remarks'] as const;
export type EulbEditableFieldKey = (typeof EULB_EDITABLE_FIELDS)[number];

export interface EulbValidationSummary {
  dbUlbCount: number;
  maxAllowedExcelRows: number;
  excelRowCount: number;
  matchedDbUlbCount: number;
  missingDbUlbCount: number;
  extraExcelRowCount: number;
  errorRowCount: number;
  validationStatus: EulbValidationStatus;
  activeDatasetVersion: number;
}

export interface EulbPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

export interface EulbFormResponseData {
  _id: string | null;
  formName: string;
  stateId: string;
  yearId: string;
  stateName: string;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  questions: ConditionalFieldConfig[];
  permissions: EulbPermissions;
  actors?: FormActor[];
  rowEditFields?: ConditionalFieldConfig[];
  validationSummary?: EulbValidationSummary;
  errorExcelFile?: EulbFileValue;
  /** Some backend versions nest errorExcelFile here; normalised in loadForm(). */
  response?: { errorExcelFile?: EulbFileValue; [key: string]: unknown };
  instructions?: unknown[];
  meta?: { version: number };
}

export interface EulbFormApiResponse {
  success: boolean;
  message: string;
  data: EulbFormResponseData;
}

export interface EulbMutationApiResponse {
  success?: boolean;
  message?: string;
  errors?: ApiErrorMap;
  data?: unknown;
}

export interface EulbValidateExcelPayload {
  stateId: string;
  yearId: string;
  ulbCount: number;
  electedBodyExcelFile: EulbFileValue;
}

export interface EulbValidateExcelResponse {
  data: {
    validationStatus: 'VALID' | 'INVALID';
    summary: EulbValidationSummary;
    errorExcelFile?: EulbFileValue;
    errors?: EulbRowError[];
  };
  message?: string;
}

export interface EulbRowError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

export interface EulbRow {
  _id: string;
  rowNumber: number;
  censusCode?: string;
  ulbName: string;
  electedBodyStatus?: EulbBodyStatus;
  dateOfConstitution?: string;
  dateOfExpiry?: string;
  remarks?: string;
  rowType: EulbRowType;
  validationStatus: EulbRowValidationStatus;
  errors: EulbRowError[];
}

export interface EulbRowsQuery {
  page?: number;
  limit?: number;
  search?: string;
  validationStatus?: EulbRowValidationStatus | '';
  rowType?: EulbRowType | '';
  errorField?: string;
}

export interface EulbRowsApiResponse {
  data: {
    rows: EulbRow[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface EulbUpdateRowPayload {
  electedBodyStatus?: EulbBodyStatus;
  dateOfConstitution?: string;
  dateOfExpiry?: string;
  remarks?: string;
}

export interface EulbRowEditFormValue {
  electedBodyStatus?: EulbBodyStatus | '';
  dateOfConstitution?: string;
  dateOfExpiry?: string;
  remarks?: string;
}

export interface EulbRowUpdateApiError {
  rowId?: string;
  rowNumber?: number;
  censusCode?: string;
  ulbName?: string;
  field: string;
  code?: string;
  message: string;
  value?: unknown;
}

export interface EulbUpdateRowResponse {
  data: {
    row: EulbRow;
    validationSummary?: EulbValidationSummary;
  };
  message?: string;
}

export interface EulbSaveDraftPayload {
  stateId: string;
  yearId: string;
  data: EulbFormPayloadData;
}

export interface EulbFinalSubmitPayload {
  stateId: string;
  yearId: string;
  data: EulbFinalSubmitPayloadData;
}

export interface EulbFormPayloadData {
  ulbCount?: number;
  electedBodyExcelFile?: EulbFileValue;
  checkboxConfirmation?: boolean;
}

export interface EulbFinalSubmitPayloadData {
  ulbCount: number;
  electedBodyExcelFile: EulbFileValue;
  checkboxConfirmation: boolean;
}

export interface EulbRowsDialogData {
  stateId: string;
  yearId: string;
  rowEditFields?: ConditionalFieldConfig[];
  canEdit: boolean;
}

export interface EulbRowsDialogResult {
  updatedSummary?: EulbValidationSummary;
}

export interface EulbDeleteUploadedExcelResponse {
  success: boolean;
  message: string;
  data?: {
    validationSummary?: EulbValidationSummary;
  };
}

export interface EulbRevalidateExcelResponse {
  success: boolean;
  message: string;
  data: {
    validationSummary: EulbValidationSummary;
    errors?: EulbRowError[];
  };
}
