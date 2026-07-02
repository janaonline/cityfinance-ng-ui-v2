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
];
