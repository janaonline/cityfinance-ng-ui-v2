import { FieldConfig } from '../../../../shared/dynamic-form/field.interface';

/**
 * Mirrors the backend's DEFAULT_ULB_FIELDS (cf-nest-api-v2 src/master/ulb/constants/ulb-form.constants.ts).
 * `state` and `ulbType` are handled as dedicated mat-selects in the dialog (populated from live
 * State/ULB-type lists) rather than through this generic template.
 */
export const ULB_TEMPLATE: FieldConfig[] = [
  {
    key: 'code',
    required: true,
    label: 'ULB Code',
    formFieldType: 'input',
    validations: [
      { name: 'required', validator: null, message: 'ULB code is required.' },
      { name: 'maxlength', validator: 20, message: 'Must not exceed 20 characters.' },
    ],
  },
  {
    key: 'name',
    required: true,
    label: 'ULB Name',
    formFieldType: 'input',
    validations: [
      { name: 'required', validator: null, message: 'ULB name is required.' },
      { name: 'maxlength', validator: 200, message: 'Must not exceed 200 characters.' },
    ],
  },
  {
    key: 'district',
    required: true,
    label: 'District',
    formFieldType: 'input',
    validations: [
      { name: 'required', validator: null, message: 'District is required.' },
      { name: 'maxlength', validator: 100, message: 'Must not exceed 100 characters.' },
    ],
  },
  {
    key: 'censusCode',
    required: false,
    label: '2011 Census Code',
    formFieldType: 'input',
    validations: [{ name: 'maxlength', validator: 20, message: 'Must not exceed 20 characters.' }],
  },
  {
    key: 'sbCode',
    required: false,
    label: 'SB Code',
    formFieldType: 'input',
    validations: [],
  },
  {
    key: 'population',
    required: false,
    label: 'Population',
    formFieldType: 'number',
    validations: [{ name: 'min', validator: 0, message: 'Must be 0 or greater.' }],
  },
  {
    key: 'area',
    required: false,
    label: 'Area',
    formFieldType: 'number',
    validations: [{ name: 'min', validator: 0, message: 'Must be 0 or greater.' }],
  },
  {
    key: 'wards',
    required: false,
    label: 'Wards',
    formFieldType: 'number',
    validations: [{ name: 'min', validator: 0, message: 'Must be 0 or greater.' }],
  },
  {
    key: 'natureOfUlb',
    required: false,
    label: 'Nature of ULB',
    formFieldType: 'input',
    validations: [],
  },
  {
    key: 'isUA',
    required: false,
    label: 'Is Urban Agglomeration',
    formFieldType: 'select',
    options: ['YES', 'No'],
    validations: [],
  },
  {
    key: 'isMillionPlus',
    required: false,
    label: 'Is Million Plus',
    formFieldType: 'select',
    options: ['YES', 'No'],
    validations: [],
  },
  {
    key: 'amrut',
    required: false,
    label: 'AMRUT',
    formFieldType: 'input',
    validations: [],
  },
  {
    key: 'lgdCode',
    required: false,
    label: 'LGD Code',
    formFieldType: 'input',
    validations: [],
  },
  {
    key: 'regionalName',
    required: false,
    label: 'Regional Name',
    formFieldType: 'input',
    validations: [],
  },
  {
    key: 'dateOfConstitution',
    required: true,
    label: 'Date of Constitution',
    formFieldType: 'date',
    validations: [{ name: 'required', validator: null, message: 'Date of constitution is required.' }],
  },
  {
    key: 'gazetteNotificationNumber',
    required: false,
    label: 'Gazette Notification Number',
    formFieldType: 'input',
    validations: [{ name: 'maxlength', validator: 100, message: 'Must not exceed 100 characters.' }],
  },
  {
    key: 'gazetteNotificationFile',
    required: true,
    label: 'Gazette Notification',
    formFieldType: 'file',
    allowedFileTypes: ['pdf'],
    maxFileSize: 5,
    folderPath: 'ulb/gazette-notification',
    validations: [{ name: 'required', validator: null, message: 'Gazette notification PDF is required.' }],
  },
];

/** Per-field grid width and hint text for one field on the Register ULB page. Resolved against
 *  ULB_TEMPLATE (or a page-supplied field, e.g. `ulbType`) by `key` — this constant carries only
 *  layout, not field definitions, so ULB_TEMPLATE stays the single source of truth for those. */
export interface RegisterUlbFieldLayout {
  key: string;
  grid: string;
  labelHint?: string;
  hintText?: string;
}

export interface RegisterUlbSectionLayout {
  title: string;
  icon: string;
  fields: RegisterUlbFieldLayout[];
}

export const REGISTER_ULB_SECTIONS: RegisterUlbSectionLayout[] = [
  {
    title: 'ULB Identity',
    icon: 'bi-bank',
    fields: [
      { key: 'name', grid: 'col-12' },
      { key: 'ulbType', grid: 'col-md-6' },
      { key: 'district', grid: 'col-md-6' },
      {
        key: 'censusCode',
        grid: 'col-md-6',
        labelHint: '(if available)',
        hintText: 'Not available? Enter 999999 as a 6-digit placeholder.',
      },
    ],
  },
  {
    title: 'Constitution & Legal Basis',
    icon: 'bi-journal-text',
    fields: [
      { key: 'dateOfConstitution', grid: 'col-md-6' },
      { key: 'gazetteNotificationNumber', grid: 'col-md-6', labelHint: '(if available)' },
      {
        key: 'gazetteNotificationFile',
        grid: 'col-12',
        labelHint: '— upload the PDF of the gazette notifying constitution',
      },
    ],
  },
];
