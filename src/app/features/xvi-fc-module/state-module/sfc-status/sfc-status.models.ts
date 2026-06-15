import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

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
  currentFormStatus: number;
  currentFormStatusLabel: string;
  questions: ConditionalFieldConfig[];
  permissions: SfcStatusPermissions;
  instructions: unknown[];
  meta: SfcStatusFormMeta;
}

export interface SfcStatusApiResponse {
  success: boolean;
  message: string;
  data: SfcStatusFormData;
  timestamp: string;
}
