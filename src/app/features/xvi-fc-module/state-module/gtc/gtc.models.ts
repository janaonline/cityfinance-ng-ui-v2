import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { FormActor } from '../../shared/form-progress/form-progress.component';

export type SubmitType = 'saveAsDraft' | 'finalSubmit';

export type GtcInstallment = 1 | 2;

export interface ApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

export type ApiErrorMap = Record<string, ApiFieldError[]>;

export interface GtcPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

export interface GtcInstallmentAccessItem {
  canSelect: boolean;
  locked: boolean;
  lockReason: string | null;
}

export interface GtcInstallmentAccess {
  installment1: GtcInstallmentAccessItem;
  installment2: GtcInstallmentAccessItem;
}

export interface GtcFormData {
  _id: string | null;
  formName: string;
  formId: number;
  stateName: string;
  stateId: string;
  yearId: string;
  installment: GtcInstallment;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  questions: ConditionalFieldConfig[];
  permissions: GtcPermissions;
  actors: FormActor[];
  instructions: unknown[];
  installmentAccess?: GtcInstallmentAccess;
}

export interface GtcApiResponse {
  success: boolean;
  message: string;
  data: GtcFormData;
  timestamp: string;
}

export interface GtcDraftPayload {
  stateId: string;
  yearId: string;
  installment: GtcInstallment;
  data: Record<string, unknown>;
}

export interface GtcFinalSubmitPayload {
  stateId: string;
  yearId: string;
  installment: GtcInstallment;
  data: Record<string, unknown>;
}

export interface GtcSubmitData {
  currentFormStatus?: number;
  currentFormStatusLabel?: string;
}

export interface GtcSubmitResponse {
  success: boolean;
  message: string;
  data?: GtcSubmitData;
  errors?: ApiErrorMap;
  timestamp?: string;
}

/** Signed download URL for the static GTC template - only meaningful for a design
 *  year/installment configured for one (e.g. 2026-27 installment 1). */
export interface GtcTemplateData {
  fileName: string;
  mimeType: string;
  url: string;
}

export interface GtcTemplateResponse {
  success: boolean;
  message: string;
  data: GtcTemplateData;
  timestamp: string;
}

export interface ApiErrorResponse {
  success?: false;
  statusCode?: number;
  message?: string;
  errors?: ApiErrorMap;
  timestamp?: string;
  path?: string;
  data?: unknown;
}
