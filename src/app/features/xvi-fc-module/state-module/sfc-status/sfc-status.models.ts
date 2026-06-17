import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

export type SubmitType = 'saveAsDraft' | 'finalSubmit';

export interface ApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

export type ApiErrorMap = Record<string, ApiFieldError[]>;

export interface SfcStatusPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

export interface SfcStatusFormMeta {
  version: number;
}

export interface SfcStatusFormData {
  _id: string | null;
  formKey: string;
  formName: string;
  formType: string;
  stateId: string;
  yearId: string;
  stateName: string;
  actors: SfcFormActor[];
  currentFormStatus: number;
  currentFormStatusLabel: string;
  questions: ConditionalFieldConfig[];
  permissions: SfcStatusPermissions;
  instructions: unknown[];
  meta: SfcStatusFormMeta;
}

export interface SfcFormActor {
  action: string | null;
  by: string | null;
  date: string | null;
}

export interface SfcStatusApiResponse {
  success: boolean;
  message: string;
  data: SfcStatusFormData;
  timestamp: string;
}

export interface SfcStatusDraftPayload {
  stateId: string;
  yearId: string;
  data: Record<string, unknown>;
}

export interface SfcStatusFinalSubmitPayload {
  stateId: string;
  yearId: string;
  data: Record<string, unknown>;
}

export interface SfcStatusSubmitData {
  currentFormStatus?: number;
  currentFormStatusLabel?: string;
}

export interface SfcStatusSubmitResponse {
  success: boolean;
  message: string;
  data?: SfcStatusSubmitData;
  errors?: ApiErrorMap;
  timestamp?: string;
}

export interface ApiErrorResponse {
  statusCode?: number;
  message?: string;
  errors?: ApiErrorMap;
  timestamp?: string;
  path?: string;
}
