export interface Validator {
  name: string;
  validator: any;
  message: string;
}

export type DateConfigValue = Date | string | null;

export interface InputCardConfig {
  title?: string;
  description?: string;
  prefixText?: string;
  suffixText?: string;
}

export type FieldAppearanceColor = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
export type FieldAppearanceVariant = 'default' | 'soft' | 'outlined';

export interface FieldAppearanceConfig {
  color?: FieldAppearanceColor;
  variant?: FieldAppearanceVariant;
  icon?: string;
}

export type FieldLayoutVariant = 'stacked' | 'inline';
export type FieldLayoutLabelWidth = 'sm' | 'md' | 'lg';

export interface FieldLayoutConfig {
  variant?: FieldLayoutVariant;
  labelWidth?: FieldLayoutLabelWidth;
}

export type FieldSupportingContentPosition = 'before' | 'after';

export type FieldSupportingContent =
  | {
      type: 'template-download';
      position?: FieldSupportingContentPosition;
      label: string;
      url: string;
      description?: string;
    }
  | {
      type: 'info';
      position?: FieldSupportingContentPosition;
      title?: string;
      description: string;
    }
  | {
      type: 'warning';
      position?: FieldSupportingContentPosition;
      title?: string;
      description: string;
    }
  | {
      type: 'sample-columns';
      position?: FieldSupportingContentPosition;
      title?: string;
      columns: string[];
    }
  | {
      type: 'readonly-card';
      position?: FieldSupportingContentPosition;
      title?: string;
      description?: string;
      rows?: { label: string; value: string }[];
    };

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
  fileViewType?: 'button' | 'dropzone';
  folderPath?: string;
  maxFileSize?: number;
  minDate?: DateConfigValue;
  maxDate?: DateConfigValue;
  placeholder?: string;
  supportingContent?: FieldSupportingContent[];
  layout?: FieldLayoutConfig;
  hideLabel?: boolean;
  appearance?: FieldAppearanceConfig;
  inputCardConfig?: InputCardConfig;
  radioLayout?: 'horizontal' | 'vertical';
  /** When `false`, the field is excluded from UI rendering but its form control still exists. Defaults to `true`. */
  render?: boolean;
  /** When `false`, the field is excluded from the visible payload on submit. Defaults to `true`. */
  includeInPayload?: boolean;
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
  readonly?: boolean;
  minDate?: DateConfigValue;
  maxDate?: DateConfigValue;
}
