export interface Validator {
  name: string;
  validator: any;
  message: string;
}

export type UploadedFileValue = {
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType?: string;
} | null;

export interface LegacyFileValue {
  name: string;
  size: string | number | null;
  url: string;
  mimeType?: string;
}

export interface FieldConfig {
  required?: any;
  label: string;
  // name: string;
  key: string;
  formFieldType: string;
  tableRow?: any[];
  data?: any[];
  // inputType: string;
  options?: any[];
  collections?: any;
  // type: string;
  value?: any;
  validations?: Validator[];
  formArrays?: any[];
  uploading?: boolean;
  position?: number;
  readonly?: boolean;
  showAsterisk?: boolean;
  fileAlreadyOnCf?: any[];
  multiple?: boolean;
  verifyStatus?: number;
  allowedFileTypes?: string[];
  fileRejectOptions?: string[];
  decimal?: 0;
  file?: LegacyFileValue;
}

export interface JsonFieldConfig {
  label: string;
  name?: string;
  inputType?: string;
  options?: string[];
  collections?: any;
  type: string;
  value?: any;
  validations?: Validator[];
  formArrays?: any[];
}
