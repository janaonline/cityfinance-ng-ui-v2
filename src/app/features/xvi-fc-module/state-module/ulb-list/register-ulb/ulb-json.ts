import { FormSectionConfig } from '../../../../../shared/dynamic-form/field.interface';

export const ulbFormConfig: FormSectionConfig[] = [
  {
    title: 'ULB Identity',
    icon: 'bi-bank',
    fields: [
      {
        key: 'name',
        label: 'ULB Name',
        // hideLabel: false,
        displayInlineLabel: true,
        formFieldType: 'text',
        required: true,
        validations: [
          {
            name: 'required',
            validator: null,
            message: 'ULB name is required.',
          },
          {
            name: 'maxlength',
            validator: 200,
            message: 'ULB name must be at most 200 characters.',
          },
        ],
        grid: 'col-12',
      },
      {
        key: 'ulbType',
        label: 'ULB Type',
        displayInlineLabel: true,
        formFieldType: 'select',
        required: true,
        placeholder: 'Select type...',
        options: [
          {
            id: '5dcfa67543263a0e75c71697',
            label: 'Municipal Corporation',
          },
          {
            id: '5dd24adcbff7a9226a3231ae',
            label: 'Municipal Council',
          },
          {
            id: '5dcfa64e43263a0e75c71695',
            label: 'Municipality',
          },
          {
            id: '5dcfa6cc43263a0e75c71698',
            label: 'Nagar Nigam',
          },
          {
            id: '5dcfa6dc43263a0e75c71699',
            label: 'Nagar Palika Parishad',
          },
          {
            id: '649e8310a6b0966914ea45d4',
            label: 'Notified Area Council',
          },
          {
            id: '5dcfa66b43263a0e75c71696',
            label: 'Town Panchayat',
          },
        ],
        validations: [
          {
            name: 'required',
            validator: null,
            message: 'ULB type is required.',
          },
        ],
        grid: 'col-md-6',
      },
      {
        key: 'district',
        label: 'District',
        formFieldType: 'text',
        required: true,
        displayInlineLabel: true,
        validations: [
          {
            name: 'required',
            validator: null,
            message: 'District is required.',
          },
          {
            name: 'maxlength',
            validator: 100,
            message: 'District must be at most 100 characters.',
          },
        ],
        grid: 'col-md-6',
      },
      {
        key: 'censusCode',
        label: '2011 Census Code',
        formFieldType: 'text',

        validations: [
          {
            name: 'maxlength',
            validator: 20,
            message: 'Census code must be at most 20 characters.',
          },
        ],
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
      {
        key: 'dateOfConstitution',
        label: 'Date of Constitution',
        formFieldType: 'date',
        required: true,
        validations: [
          {
            name: 'required',
            validator: null,
            message: 'Date of constitution is required.',
          },
        ],
        grid: 'col-md-6',
      },
      {
        key: 'gazetteNotificationNumber',
        label: 'Gazette Notification Number',
        formFieldType: 'text',
        validations: [
          {
            name: 'maxlength',
            validator: 100,
            message: 'Must not exceed 100 characters.',
          },
        ],
        grid: 'col-md-6',
        labelHint: '(if available)',
      },
      {
        key: 'gazetteNotificationFile',
        label: 'Gazette Notification',
        formFieldType: 'file',
        required: true,
        allowedFileTypes: ['pdf'],
        maxFileSize: 5,
        validations: [
          {
            name: 'required',
            validator: null,
            message: 'Gazette notification PDF is required.',
          },
        ],
        grid: 'col-12',
        labelHint: '— upload the PDF of the gazette notifying constitution',
      },
    ],
  },
  {
    title: 'Primary Contact at ULB',
    icon: 'bi-person',
    subtitle: '— will be the first login for this ULB',
    fields: [
      {
        key: 'primaryContactName',
        label: 'Full Name',
        formFieldType: 'text',
        required: true,
        validations: [
          {
            name: 'required',
            validator: null,
            message: 'Primary contact name is required.',
          },
          {
            name: 'maxlength',
            validator: 200,
            message: 'Name must be at most 200 characters.',
          },
        ],
        grid: 'col-md-6',
      },
      {
        key: 'primaryContactDesignation',
        label: 'Designation',
        formFieldType: 'text',
        validations: [
          {
            name: 'maxlength',
            validator: 100,
            message: 'Designation must be at most 100 characters.',
          },
        ],
        grid: 'col-md-6',
      },
      {
        key: 'primaryContactEmail',
        label: 'Email Address',
        formFieldType: 'text',
        required: true,
        validations: [
          {
            name: 'required',
            validator: null,
            message: 'Primary contact email is required.',
          },
          {
            name: 'email',
            validator: null,
            message: 'Enter a valid email address.',
          },
        ],
        grid: 'col-md-6',
      },
      {
        key: 'primaryContactMobile',
        label: 'Mobile Number',
        formFieldType: 'text',
        required: true,
        validations: [
          {
            name: 'required',
            validator: null,
            message: 'Primary contact mobile number is required.',
          },
          {
            name: 'pattern',
            validator: '^[6-9]\\d{9}$',
            message: 'Enter a valid 10-digit mobile number.',
          },
        ],
        grid: 'col-md-6',
      },
    ],
  },
];
