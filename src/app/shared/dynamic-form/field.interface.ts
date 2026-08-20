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
      /** Text color for `description`. Defaults to the muted `text-body-secondary` when unset. */
      descriptionTone?: FieldSupportingActionTone;
      actions: FieldSupportingAction[];
      badges?: FieldSupportingBadge[];
    };

export type { UploadedFileMetadata } from './components/file/file-metadata.types';

export interface FieldLookupConfig {
  /** Relative API path; `:value` is replaced with this field's current (validated) value. */
  endpoint: string;
  /** Maps response keys (dot-path into the JSON body) to the target field `key` they populate. */
  populates: Record<string, string>;
}

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
  /** Max decimal places allowed; `0` means whole numbers only. Feeds both `DecimalLimitDirective`
   *  (keystroke-blocking on the rendered input) and, via a `{ name: 'decimal', validator: N }`
   *  entry in `validations`, a real `decimalPlacesValidator` FormControl error. */
  decimal?: number;
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
  /** Bootstrap column class controlling this field's width within a `FormSectionGridComponent` row, e.g. 'col-12', 'col-md-6'. */
  grid?: string;
  /** Free-form, non-functional annotations (e.g. grouping/reporting metadata) — never read by validation or rendering logic. */
  meta?: Record<string, unknown>;
  /** Muted text rendered inline next to the field label, e.g. "(if available)". */
  labelHint?: string;
  /** Muted helper text rendered below the field control. */
  hintText?: string;
  displayInlineLabel?: boolean;
  /** On a valid value, calls `endpoint` and patches sibling fields from the response per `populates`. */
  lookup?: FieldLookupConfig;
  /** This field's value must equal the named sibling field's value (e.g. confirm-account-number). */
  matchesField?: string;
  /** Strips non-digit characters live as the user types; pairs with named `validations` entries
   *  (`hasSpaces`/`hasAlphabets`/`hasSpecialChars`/`tooShort`/`tooLong`) for granular messages. */
  digitsOnly?: boolean;
}

/** One card-sectioned group of fields, rendered by `FormSectionGridComponent`. */
export interface FormSectionConfig {
  title: string;
  icon?: string;
  /** Muted text rendered inline next to the section title, e.g. "— will be the first login for this ULB". */
  subtitle?: string;
  fields: FieldConfig[];
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
