export type DialogFieldType = 'select' | 'text' | 'tel' | 'readonly' | 'confirm-message' | 'role-change';

export interface RoleChangeMeta {
  memberName: string;
  fromRole: string;
  toRole: string;
}

export interface DialogField {
  type: DialogFieldType;
  key: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  options?: { value: string; label: string }[];
  maxlength?: number;
  content?: string;
  initialValue?: string;
  sanitize?: (value: string) => string;
  roleChange?: RoleChangeMeta;
}

export interface RolesDialogConfig {
  title: string;
  subtitle?: string;
  fields: DialogField[];
  confirmLabel: string;
  confirmIcon?: string;
  cancelLabel?: string;
  confirmDanger?: boolean;
  disabledFn?: (values: Record<string, string>) => boolean;
}

export type RolesDialogResult = Record<string, string> | null;
