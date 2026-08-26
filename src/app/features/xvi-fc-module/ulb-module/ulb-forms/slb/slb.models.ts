import { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import { FormActor } from '../../../shared/form-progress/form-progress.component';

export type SubmitType = 'saveAsDraft' | 'finalSubmit';

export interface ApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

export type ApiErrorMap = Record<string, ApiFieldError[]>;

export interface SlbPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

export interface SlbFormMeta {
  version: number;
}

export interface SlbFormData {
  _id: string | null;
  formName: string;
  formId: number;
  ulbId: string;
  yearId: string;
  designYear: string;
  /** FY immediately before `designYear` (e.g. "2025-26" when designYear is "2026-27") — the
   *  authoritative source for the "Actual Indicator" column header. Null if `designYear` is
   *  the earliest known year. */
  actualYearLabel: string | null;
  ulbName: string;
  actors: FormActor[];
  currentFormStatus: number;
  currentFormStatusLabel: string;
  questions: ConditionalFieldConfig[];
  permissions: SlbPermissions;
  meta: SlbFormMeta;
}

export interface SlbApiResponse {
  success: boolean;
  message: string;
  data: SlbFormData;
  timestamp: string;
}

export interface SlbDraftPayload {
  ulbId: string;
  yearId: string;
  data: Record<string, unknown>;
}

export interface SlbFinalSubmitPayload {
  ulbId: string;
  yearId: string;
  data: Record<string, unknown>;
}

export interface SlbSubmitData {
  currentFormStatus?: number;
  currentFormStatusLabel?: string;
}

export interface SlbSubmitResponse {
  success: boolean;
  message: string;
  data?: SlbSubmitData;
  errors?: ApiErrorMap;
  timestamp?: string;
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
