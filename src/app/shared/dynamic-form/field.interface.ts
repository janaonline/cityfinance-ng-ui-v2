/** Rendering mode for dynamic form fields: full editing UI or readonly value display. */
export type DynamicFormMode = 'edit' | 'view';

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

export type FieldSupportingActionLayout = 'inline' | 'stacked';
export type FieldSupportingActionSeparator = 'dot' | 'none';
export type FieldSupportingActionVariant = 'link' | 'button';
export type FieldSupportingActionTone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

export interface FieldSupportingAction {
  id: string;
  label: string;
  /** Static href only. For API downloads, dialogs, or app actions use `id` and handle the emitted event. */
  url?: string;
  icon?: string;
  tone?: FieldSupportingActionTone;
  className?: string;
  iconClassName?: string;
  variant?: FieldSupportingActionVariant;
  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  meta?: Record<string, unknown>;
}

export interface FieldSupportingBadge {
  label: string;
  icon?: string;
  tone?: FieldSupportingActionTone;
  className?: string;
  visible?: boolean;
}

export interface FieldSupportingActionEvent {
  fieldKey: string;
  actionId: string;
  meta?: Record<string, unknown>;
}

export type FieldSupportingContent =
  | {
      type: 'template-download';
      className?: string;
      position?: FieldSupportingContentPosition;
      label: string;
      url: string;
      description?: string;
    }
  | {
      type: 'info';
      className?: string;
      position?: FieldSupportingContentPosition;
      title?: string;
      description: string;
    }
  | {
      type: 'warning';
      className?: string;
      position?: FieldSupportingContentPosition;
      title?: string;
      description: string;
    }
  | {
      type: 'sample-columns';
      className?: string;
      position?: FieldSupportingContentPosition;
      title?: string;
      columns: string[];
    }
  | {
      type: 'readonly-card';
      className?: string;
      position?: FieldSupportingContentPosition;
      title?: string;
      description?: string;
      rows?: { label: string; value: string }[];
    }
  | {
      type: 'actions';
      className?: string;
      position?: FieldSupportingContentPosition;
      layout?: FieldSupportingActionLayout;
      separator?: FieldSupportingActionSeparator;
      description?: string;
      actions: FieldSupportingAction[];
      badges?: FieldSupportingBadge[];
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
  /** When `true`, the FormControl is created disabled (backend-computed field). */
  disabled?: boolean;
  /** Explanatory text shown as a hint when the field is disabled by the backend. */
  disabledReason?: string;
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
