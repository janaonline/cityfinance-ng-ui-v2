import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

export const FC_UNSPENT_DECLARATION_FIELDS: ConditionalFieldConfig[] = [
  {
    formFieldType: 'radio',
    label: 'Do any ULBs in the state have unspent 14th FC balance to report?',
    key: 'isFcUnspent',
    value: 'no',
    options: [
      {
        label: 'No (no ULB in the state has unspent 14th FC balance to report)',
        id: 'no',
      },
      {
        label: 'Yes (one or more ULBs have unspent 14th FC balance to report)',
        id: 'yes',
      },
    ],
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
    // layout: {
    //   variant: 'inline',
    //   labelWidth: 'lg',
    // },
    radioLayout: 'vertical',
    supportingContent: [
      {
        type: 'info',
        position: 'after',
        description:
          'Select No if your state has confirmed that none of its ULBs hold any unspent 14th Finance Commission balance. Select Yes if one or more ULBs need to report a balance.',
      },
      // {
      //   type: 'actions',
      //   position: 'after',
      //   layout: 'inline',
      //   separator: 'dot',
      //   description:
      //     'Select No if your state has confirmed that none of its ULBs hold any unspent 14th Finance Commission balance. Select Yes if one or more ULBs need to report a balance.',
      //   actions: [],
      //   badges: [],
      // },
    ],
  },
  {
    formFieldType: 'file',
    label: 'State-Level Declaration - 14th Finance Commission',
    key: 'fcDeclaration',
    value: null,
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
    folderPath: 'fc-unspent/fc-declaration',
    maxFileSize: 5,
    allowedFileTypes: ['pdf'],
    appearance: {
      color: 'success',
      variant: 'soft',
    },
    visibleWhen: {
      mode: 'all',
      conditions: [
        {
          key: 'isFcUnspent',
          operator: 'equals',
          value: 'no',
        },
      ],
    },
    clearValueWhenDisabled: true,
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
    supportingContent: [
      {
        type: 'actions',
        position: 'before',
        layout: 'inline',
        separator: 'dot',
        description:
          'Download the official template, have it signed by the authorized State DMA officer, and upload the signed declaration. Declarations on unofficial letterhead will not be accepted.',
        actions: [
          {
            id: 'download-template',
            label: 'Download the official template',
            icon: 'bi bi-file-earmark-word',
            tone: 'primary',
            visible: true,
          },
        ],
        badges: [],
      },
    ],
  },
  {
    formFieldType: 'checkbox',
    key: 'checkboxConfirmation',
    label:
      'I certify that the 14th FC unspent balances entered above have been compiled from figures reported by each ULB, and are accurate to the best of my knowledge.',
    value: false,
    validations: [
      {
        name: 'requiredTrue',
        validator: null,
        message: 'Please confirm before submitting.',
      },
    ],
    visibleWhen: {
      mode: 'all',
      conditions: [
        {
          key: 'isFcUnspent',
          operator: 'equals',
          value: 'yes',
        },
      ],
    },
    clearValueWhenDisabled: true,
  },
];
