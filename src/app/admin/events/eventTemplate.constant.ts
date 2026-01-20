import { FieldConfig } from '../../shared/dynamic-form/field.interface';

export const EVENT_TEMPLATE: FieldConfig[] = [
  {
    key: 'webinarId',
    required: true,
    label: 'Webinar Id',
    validations: [
      { name: 'required', validator: null, message: 'Webinar Id is required.' },
      { name: 'minlength', validator: 5, message: 'Must be at least 5 characters.' },
      { name: 'maxlength', validator: 50, message: 'Must not exceed 50 characters.' },
    ],
    formFieldType: 'input',
  },
  {
    key: 'title',
    required: true,
    label: 'Event Title',
    validations: [
      { name: 'required', validator: null, message: 'Event title is required.' },
      { name: 'minlength', validator: 10, message: 'Must be at least 10 characters.' },
      { name: 'maxlength', validator: 100, message: 'Must not exceed 100 characters.' },
    ],
    formFieldType: 'input',
  },
  {
    key: 'desc',
    required: true,
    label: 'Event Description',
    validations: [
      { name: 'required', validator: null, message: 'Description is required.' },
      { name: 'minlength', validator: 50, message: 'Must be at least 50 characters.' },
      { name: 'maxlength', validator: 1000, message: 'Must not exceed 1000 characters.' },
    ],
    formFieldType: 'input',
  },
  {
    key: 'eventStatus',
    required: true,
    label: 'Event Status',
    validations: [
      { name: 'required', validator: null, message: 'Event status is required.' },
      {
        name: 'pattern',
        validator: '^(Active|Draft)$',
        message: 'Event status must be Active or Draft.',
      },
    ],
    formFieldType: 'input',
  },
  {
    key: 'startAt',
    required: true,
    label: 'Event Start Date (UTC time in ISO format)',
    validations: [
      { name: 'required', validator: null, message: 'Start date is required.' },
      {
        name: 'pattern',
        validator: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?Z$',
        message: 'Start date must be in UTC format YYYY-MM-DDTHH:mm:ss.sssZ',
      },
    ],
    formFieldType: 'input',
  },
  {
    key: 'endAt',
    required: true,
    label: 'Event End Date (UTC time in ISO format)',
    validations: [
      { name: 'required', validator: null, message: 'End date is required.' },
      {
        name: 'pattern',
        validator: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?Z$',
        message: 'End date must be in UTC format YYYY-MM-DDTHH:mm:ss.sssZ',
      },
    ],
    formFieldType: 'input',
  },
  {
    key: 'redirectionLink',
    required: false,
    label: 'Redirection Link',
    validations: [
      {
        name: 'pattern',
        validator: '^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]{2,}(\\/\\S*)?$',
        message: 'Please enter a valid URL.',
      },
    ],
    formFieldType: 'input',
  },
  {
    key: 'buttonLabels',
    required: false,
    label: 'Button Labels (Comma Separated)',
    validations: [
      {
        name: 'pattern',
        validator: '^[^,]+(,[^,]+)*$',
        message: 'Enter comma-separated values only.',
      },
    ],
    formFieldType: 'input',
  },
  {
    key: 'imgUrl',
    required: false,
    label: 'Image URL (Comma Separated)',
    validations: [],
    formFieldType: 'input',
  },
];
