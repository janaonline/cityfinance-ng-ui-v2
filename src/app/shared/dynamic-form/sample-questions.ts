/**
 * Sample dynamic-form question configurations used only as a reference for developers.
 *
 * These examples demonstrate supported dynamic-form features such as supporting content,
 * inline layout, file upload appearance, input-card rendering, validations, and visibility rules.
 *
 * Do not import this file into production form flows or use these questions as live form data.
 * Copy only the required example pattern into the target form/API response and update the values
 * according to the actual business requirement.
 */

import { ConditionalFieldConfig } from '../../features/xvi-fc-module/dynamic-form-visibility.service';

export const TEMP_QUESTIONS: ConditionalFieldConfig[] = [
  {
    formFieldType: 'radio',
    label: 'SFC Active',
    key: 'sfcActive',
    value: 'yes',
    options: [
      { label: 'Yes', id: 'yes' },
      { label: 'No', id: 'no' },
    ],
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
  },
  {
    formFieldType: 'text',
    label: 'Status of SFC Report',
    key: 'sfcReportStatus',
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'sfcActive', operator: 'equals', value: 'yes' }],
    },
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
  },
  {
    formFieldType: 'file',
    label: 'Upload SFC Report',
    key: 'sfcReport',
    allowedFileTypes: ['pdf'],
    maxFileSize: 20,
    folderPath: 'state/sfc-status/sfc-report',
    value: null,
    visibleWhen: {
      mode: 'all',
      conditions: [
        { key: 'isActiveSfc', operator: 'equals', value: 'yes' },
        {
          key: 'sfcReportStatus',
          operator: 'in',
          value: ['reportSubmittedAtrNotYetTabled', 'reportSubmittedAtrTabled'],
        },
      ],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
  },
  {
    formFieldType: 'date',
    label: 'Applicable SFC for Grant Calculation',
    key: 'applicableSfcGrantCalculation',
    readonly: false,
    minDate: '2026-02-01',
    maxDate: '2026-12-31',
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
      {
        name: 'minDate',
        validator: '2026-02-01',
        message: 'Date must be on or after 01 Feb 2026.',
      },
      {
        name: 'maxDate',
        validator: '2026-12-31',
        message: 'Date must be on or before 31 Dec 2026.',
      },
    ],
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'sfcActive', operator: 'equals', value: 'yes' }],
    },
  },
  {
    formFieldType: 'file',
    label: 'Upload devolution data',
    key: 'devolutionExcelFile',
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
    value: null,
    folderPath: '',
    maxFileSize: 5,
    // fileViewType: 'button',
    allowedFileTypes: ['xlsx', 'xls'],
    supportingContent: [
      {
        type: 'template-download',
        position: 'before',
        label: 'Download the template',
        url: '/assets/templates/devolution-formula-template.xlsx',
        description: 'Fill in the grant amount and formula for each ULB, then re-upload as a single Excel file.',
      },
      {
        type: 'sample-columns',
        position: 'before',
        title: 'Expected Excel columns',
        columns: ['ULB Code', 'ULB Name', 'Grant Amount (₹ Cr)', 'Formula Used'],
      },
    ],
  },
  {
    formFieldType: 'textarea',
    label: 'Additional notes or clarifications (optional)',
    key: 'additionalNotes',
    placeholder: 'Add any notes about the formula or data sources…',
    validations: [
      {
        name: 'maxlength',
        validator: 500,
        message: 'Maximum 500 characters allowed',
      },
    ],
  },
  {
    formFieldType: 'checkbox',
    label:
      'I hereby certify that the information provided above is true and correct to the best of my knowledge and is provided for the purpose of 16th Finance Commission grant eligibility.',
    key: 'checkboxConfirmation',
    value: false,
  },
  // --- Temporary UI test fields (remove before pushing) ---
  {
    formFieldType: 'text',
    label: 'Testing info content',
    key: 'testingInfoContent',
    placeholder: 'Temporary test field',
    supportingContent: [
      {
        type: 'info',
        position: 'before',
        title: 'Helpful information',
        description: 'This is an example info block shown before a question.',
      },
    ],
  },
  {
    formFieldType: 'textarea',
    label: 'Testing warning content',
    key: 'testingWarningContent',
    placeholder: 'Temporary test textarea',
    supportingContent: [
      {
        type: 'warning',
        position: 'after',
        title: 'Important note',
        description: 'This is an example warning block shown after a question.',
      },
    ],
  },
  {
    formFieldType: 'text',
    label: 'Testing readonly card content',
    key: 'testingReadonlyCardContent',
    placeholder: 'Temporary test field',
    supportingContent: [
      {
        type: 'readonly-card',
        position: 'before',
        title: 'Grant summary',
        description: 'This is a sample read-only content card.',
        rows: [
          { label: 'Financial Year', value: '2026-27' },
          { label: 'State', value: 'Andhra Pradesh' },
          { label: 'Total ULBs', value: '123' },
        ],
      },
    ],
  },
  {
    formFieldType: 'text',
    label: 'Testing sample columns content',
    key: 'testingSampleColumnsContent',
    placeholder: 'Temporary test field',
    supportingContent: [
      {
        type: 'sample-columns',
        position: 'before',
        title: 'Sample columns',
        columns: ['Column A', 'Column B', 'Column C'],
      },
    ],
  },
  // --- Temporary appearance test fields (remove before pushing) ---
  {
    formFieldType: 'file',
    label: 'Default Orange Upload',
    key: 'defaultOrangeUpload',
    fileViewType: 'dropzone',
    allowedFileTypes: ['pdf'],
    folderPath: '',
    // No appearance config — should show CityFinance orange style
  },
  {
    formFieldType: 'file',
    label: 'Bootstrap Primary Upload',
    key: 'primaryUploadExample',
    fileViewType: 'dropzone',
    allowedFileTypes: ['pdf'],
    folderPath: '',
    appearance: {
      color: 'primary',
    },
  },
  {
    formFieldType: 'file',
    label: 'Success Soft Upload',
    key: 'successUploadExample',
    fileViewType: 'dropzone',
    allowedFileTypes: ['pdf'],
    folderPath: '',
    appearance: {
      color: 'success',
      variant: 'soft',
    },
  },
  {
    formFieldType: 'file',
    label: 'Warning Outlined Upload',
    key: 'warningUploadExample',
    fileViewType: 'button',
    allowedFileTypes: ['pdf'],
    folderPath: '',
    appearance: {
      color: 'warning',
      variant: 'outlined',
    },
  },
  {
    formFieldType: 'file',
    label: 'Danger Soft Upload',
    key: 'dangerUploadExample',
    fileViewType: 'dropzone',
    allowedFileTypes: ['pdf'],
    folderPath: '',
    appearance: {
      color: 'danger',
      variant: 'soft',
    },
  },
  // --- Temporary inline-layout test fields (remove before pushing) ---
  {
    formFieldType: 'text',
    label: 'label width sm Testing inline text field',
    key: 'testingInlineText',
    placeholder: 'This should appear on the right side',
    layout: {
      variant: 'inline',
      labelWidth: 'sm',
    },
  },
  {
    formFieldType: 'textarea',
    label: 'label width md Testing inline textarea',
    key: 'testingInlineTextarea',
    placeholder: 'Textarea should appear on the right side',
    layout: {
      variant: 'inline',
      labelWidth: 'md',
    },
  },
  {
    formFieldType: 'file',
    label: 'label width lg Testing inline file upload',
    key: 'testingInlineFileUpload',
    fileViewType: 'dropzone',
    allowedFileTypes: ['pdf'],
    maxFileSize: 5,
    folderPath: '',
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
    supportingContent: [
      {
        type: 'info',
        position: 'before',
        title: 'Inline upload example',
        description: 'This info block should appear above the upload area in the right column.',
      },
    ],
  },
  // --- Temporary input-card test fields (remove before pushing) ---
  {
    formFieldType: 'input-card',
    label: 'Grant formula base value',
    key: 'testingInputCardBaseValue',
    placeholder: 'Enter base value',
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'Base value is required.',
      },
    ],
    inputCardConfig: {
      title: 'Formula Base Value',
      description: 'Temporary test card. Uses the normal dynamic form control and will be removed before pushing.',
      prefixText: '₹',
      suffixText: 'Cr',
    },
  },
  {
    formFieldType: 'input-card',
    label: 'Inline Input Card',
    key: 'testingInlineInputCard',
    placeholder: 'Enter value',
    layout: {
      variant: 'inline',
      labelWidth: 'md',
    },
    inputCardConfig: {
      title: 'Inline Card Answer',
      description: 'This card should appear on the right side in inline layout.',
      suffixText: '%',
    },
  },
];
