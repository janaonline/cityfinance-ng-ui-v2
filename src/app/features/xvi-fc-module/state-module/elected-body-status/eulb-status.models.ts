import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

export type SubmitType = 'saveAsDraft' | 'finalSubmit';

export interface ApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

export type ApiErrorMap = Record<string, ApiFieldError[]>;

export interface ApiErrorResponse {
  statusCode?: number;
  message?: string;
  errors?: ApiErrorMap;
}

export interface EulbFileValue {
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType?: string;
  s3Key?: string;
}

export type EulbValidationStatus = 'NOT_VALIDATED' | 'VALID' | 'INVALID';
export type EulbRowValidationStatus = 'VALID' | 'INVALID';
export type EulbRowType = 'DB_ULB' | 'EXTRA_ULB';
export type EulbBodyStatus = 'Constituted' | 'Not Constituted' | 'Exempt';

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

export interface EulbFormActor {
  action: string | null;
  by: string | null;
  date: string | null;
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
  actors?: EulbFormActor[];
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
  data: {
    ulbCount?: number;
    electedBodyExcelFile?: EulbFileValue;
    checkboxConfirmation?: boolean;
  };
}

export interface EulbFinalSubmitPayload {
  stateId: string;
  yearId: string;
  data: {
    ulbCount: number;
    electedBodyExcelFile: EulbFileValue;
    checkboxConfirmation: boolean;
  };
}

export interface EulbRowsDialogData {
  stateId: string;
  yearId: string;
}

export interface EulbRowsDialogResult {
  updatedSummary?: EulbValidationSummary;
}
