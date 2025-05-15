import { financialData } from './xviFinanceDataJson';
import { slb } from './xviFcSlb';

// const basicTab = {
//     "_id": "6657921b9ab1c13ac44d01f4",
//     "key": "demographicData",
//     "icon": "",
//     "text": "",
//     "formType": "form1",
//     "label": "Demographic Data",
//     "id": "s1",
//     class: 'w-75',
//     "displayPriority": 1,
//     "__v": 0,
//     "data": [
//         {
//             "key": "nameOfUlb",
//             "label": "Name of ULB",
//             "position": "1",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "text",
//             "canShow": true,
//             "value": "Barpeta Municipal Board",
//             "status": "Na",
//             "isDraft": true,
//             "readonly": true
//         },
//         {
//             "key": "nameOfState",
//             "label": "Name of State/Union Territory ",
//             "position": "2",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "text",
//             "canShow": true,
//             "value": "Assam",
//             "status": "Na",
//             "isDraft": true,
//             "readonly": true,
//             validations: [
//                 {
//                     name: "required",
//                     validator: 'required',
//                     message: "Please fill in this required field."
//                 },
//                 {
//                     name: "pattern",
//                     validator: "^[a-zA-Z]+$",
//                     message: "Please enter a valid text."
//                 }
//             ]
//         },
//         {
//             "key": "pop2011",
//             "label": "Population as per Census 2011",
//             "position": "3",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "number",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 1000000,
//             "min": 0,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "value": "",
//             "status": "Na",
//             "isDraft": true,
//             "readonly": false,
//             validations: [
//                 {
//                     name: "required",
//                     validator: 'required',
//                     message: "Please fill in this required field."
//                 },
//                 {
//                     name: "min",
//                     validator: 0,
//                     message: "Please enter a number between 0 and 10,00,000."
//                 },
//                 {
//                     name: "max",
//                     validator: 1000000,
//                     message: "Please enter a number between 0 and 10,00,000."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "popApril2024",
//             "label": "Population as per 01 April 2024",
//             "position": "4",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 1000000,
//             "min": 0,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "value": "",
//             "status": "Na",
//             "isDraft": true,
//             "readonly": false,
//             validations: [
//                 {
//                     name: "required",
//                     validator: 'required',
//                     message: "Please fill in this required field."
//                 },
//                 {
//                     name: "min",
//                     validator: 0,
//                     message: "Please enter a number between 0 and 10,00,000."
//                 },
//                 {
//                     name: "max",
//                     validator: 1000000,
//                     message: "Please enter a number between 0 and 10,00,000."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "areaOfUlb",
//             "label": "Area of the ULB (in Sq. Km.)",
//             "position": "5",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "number",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 1000,
//             "min": 0.1,
//             "decimal": 2,
//             "validation": "",
//             "logic": "",
//             "value": "",
//             "status": "Na",
//             "isDraft": true,
//             "readonly": false,
//             validations: [
//                 {
//                     name: "required",
//                     validator: 'required',
//                     message: "Please fill in this required field."
//                 },
//                 {
//                     name: "min",
//                     validator: 0.1,
//                     message: "Please enter area greater than 0."
//                 },
//                 {
//                     name: "max",
//                     validator: 1000,
//                     message: "Please enter area within 1000 sq.km"
//                 },
//                 {
//                     name: "decimal",
//                     validator: 2,
//                     message: "Please enter the area with at most two decimal places."
//                 }
//             ]
//         },
//         {
//             "key": "yearOfElection",
//             "label": "Which is the latest year when ULB's election was held?",
//             "position": "6",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "select",
//             "canShow": true,
//             "options": [
//                 "2000",
//                 "2001",
//                 "2002",
//                 "2003",
//                 "2004",
//                 "2005",
//                 "2006",
//                 "2007",
//                 "2008",
//                 "2009",
//                 "2010",
//                 "2011",
//                 "2012",
//                 "2013",
//                 "2014",
//                 "2015",
//                 "2016",
//                 "2017",
//                 "2018",
//                 "2019",
//                 "2020",
//                 "2021",
//                 "2022",
//                 "2023",
//                 "2024"
//             ],
//             "showInputBox": "",
//             "inputBoxValue": "",
//             "value": "",
//             "status": "Na",
//             "isDraft": true,
//             "readonly": false
//         },
//         {
//             "key": "isElected",
//             "label": "Is the elected body in place as on 01 April 2024?",
//             "position": "7",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "radio",
//             "canShow": true,
//             "options": [
//                 "Yes",
//                 "No"
//             ],
//             "inputBoxValue": "",
//             "value": "",
//             "status": "Na",
//             "isDraft": true,
//             "readonly": false
//         },
//         {
//             "key": "yearOfConstitution",
//             "label": "In which year was the ULB constituted?",
//             "position": "8",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "select",
//             "canShow": true,
//             "options": [
//                 "2015-16",
//                 "2016-17",
//                 "2017-18",
//                 "2018-19",
//                 "2019-20",
//                 "2020-21",
//                 "2021-22",
//                 "2022-23"
//             ],
//             "showInputBox": "",
//             "inputBoxValue": "",
//             "value": "",
//             "status": "Na",
//             "isDraft": true,
//             "readonly": false
//         }
//     ]
// }
const uploadDoc = {
  // "_id": "6657921b9ab1c13ac44d01f6",
  // "key": "uploadDoc",
  // "icon": "",
  // "text": "",
  formType: 'form1',
  label: 'View/ Upload Document',
  id: 's3',
  displayPriority: 3,
  key: 'auditedAnnualFySt',
  // class: 'w-75',
  // "label": "Copy of Audited Annual Financial Statements preferably in English",
  position: '',
  required: true,

  bottomText: 'Maximum of 5MB',
  instruction: [
    {
      instruction:
        "Annual Financial Statement should include: Income and Expenditure Statement, Balance Sheet, Schedules to IES and BS, Auditor's Report and if available Receipts & Payments Statement.",
    },
    {
      instruction:
        ' All documents pertaining to a specific financial year should be combined into a single PDF before uploading & should not exceed 20 MB.',
    },
    {
      instruction:
        'Please use the following format for naming the documents to be uploaded: nameofthedocument_FY_ULB Name. || Example: Annual accounts_15-16_Jaipur municipal corporation',
    },
  ],
  status: 'Na',
  value: '',
  isDraft: true,
  readonly: false,
  fileRejectOptions: [
    'Balance Sheet',
    'Schedules To Balance Sheet',
    'Income And Expenditure',
    'Schedules To Income And Expenditure',
    'Cash Flow Statement',
    'Auditor Report',
  ],
  year: [
    {
      warning: [],
      label: 'FY 2022-23',
      // "key": "2022-23",
      key: '2022-23',
      position: 1,
      type: 'auditedAnnualFySt',
      formFieldType: 'file',
      value: '',
      isPdfAvailable: '',
      verifyStatus: 1, // 1-pending, 2- accept, 3- reject
      rejectOption: '',
      rejectReason: '',
      file: {
        name: '123',
        url: '321',
      },
      allowedFileTypes: ['pdf'],
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please upload a file.',
        },
        {
          name: 'max',
          validator: 20,
          message: 'Please upload a file with a maximum size of 20 MB.',
        },
      ],
      fileAlreadyOnCf: [
        {
          name: '',
          url: '',
          type: '',
          label: '',
        },
      ],
    },
    {
      warning: [],
      label: 'FY 2021-22',
      key: '2021-22',
      position: 2,
      type: 'auditedAnnualFySt',
      formFieldType: 'file',
      value: '',
      isPdfAvailable: true,
      isVerifiedStatus: 2, // 1- pending, 2- approved, 3-rejected by ulbs
      file: {
        name: '567',
        url: '765',
      },
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please upload a file.',
        },
        {
          name: 'max',
          validator: 20,
          message: 'Please upload a file with a maximum size of 20 MB.',
        },
      ],
      fileAlreadyOnCf: [
        {
          name: 'file1.pdf',
          url: 'file1.pdf',
          type: '',
          label: '',
          size: '12kb',
        },
        {
          name: 'file2.pdf',
          url: 'file1.pdf',
          type: '',
          label: '',
          size: '12kb',
        },
      ],
    },
    {
      warning: [],
      label: 'FY 2020-21',
      key: '2020-21',
      position: 3,
      type: 'auditedAnnualFySt',
      formFieldType: 'file',
      value: '',
      isPdfAvailable: true,
      isVerifiedStatus: 3, // 1- pending, 2- approved, 3-rejected by ulbs
      file: {
        name: '',
        url: '',
      },
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please upload a file.',
        },
        {
          name: 'max',
          validator: 20,
          message: 'Please upload a file with a maximum size of 20 MB.',
        },
      ],
      fileAlreadyOnCf: [
        {
          name: '',
          url: '',
          type: '',
          label: '',
        },
      ],
    },
    {
      warning: [],
      label: 'FY 2019-20',
      key: '2019-20',
      position: 4,
      type: 'auditedAnnualFySt',
      formFieldType: 'file',
      value: '',
      isPdfAvailable: '',
      file: {
        name: '',
        url: '',
      },
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please upload a file.',
        },
        {
          name: 'max',
          validator: 20,
          message: 'Please upload a file with a maximum size of 20 MB.',
        },
      ],
      fileAlreadyOnCf: [
        {
          name: '',
          url: '',
          type: '',
          label: '',
        },
      ],
    },
    {
      warning: [],
      label: 'FY 2018-19',
      key: '2018-19',
      position: 5,
      type: 'auditedAnnualFySt',
      formFieldType: 'file',
      value: '',
      isPdfAvailable: '',
      file: {
        name: '',
        url: '',
      },
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please upload a file.',
        },
        {
          name: 'max',
          validator: 20,
          message: 'Please upload a file with a maximum size of 20 MB.',
        },
      ],
      fileAlreadyOnCf: [
        {
          name: '',
          url: '',
          type: '',
          label: '',
        },
      ],
    },
    {
      warning: [],
      label: 'FY 2017-18',
      key: '2017-18',
      position: 6,
      type: 'auditedAnnualFySt',
      formFieldType: 'file',
      value: '',
      isPdfAvailable: '',
      file: {
        name: '',
        url: '',
      },
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please upload a file.',
        },
        {
          name: 'max',
          validator: 20,
          message: 'Please upload a file with a maximum size of 20 MB.',
        },
      ],
      fileAlreadyOnCf: [
        {
          name: '',
          url: '',
          type: '',
          label: '',
        },
      ],
    },
    {
      warning: [],
      label: 'FY 2016-17',
      key: '2016-17',
      position: 7,
      type: 'auditedAnnualFySt',
      formFieldType: 'file',
      value: '',
      isPdfAvailable: '',
      file: {
        name: '',
        url: '',
      },
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please upload a file.',
        },
        {
          name: 'max',
          validator: 20,
          message: 'Please upload a file with a maximum size of 20 MB.',
        },
      ],
      fileAlreadyOnCf: [
        {
          name: '',
          url: '',
          type: '',
          label: '',
        },
      ],
    },
    {
      warning: [],
      label: 'FY 2015-16',
      key: '2015-16',
      position: 8,
      type: 'auditedAnnualFySt',
      formFieldType: 'file',
      value: '',
      isPdfAvailable: '',
      file: {
        name: '',
        url: '',
      },
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please upload a file.',
        },
        {
          name: 'max',
          validator: 20,
          message: 'Please upload a file with a maximum size of 20 MB.',
        },
      ],
      fileAlreadyOnCf: [
        {
          name: '',
          url: '',
          type: '',
          label: '',
        },
      ],
    },
  ],
};
// const accountPractice = {
//     "key": "accountPractice",
//     "label": "Accounting Practice",
//     "displayPriority": 4,
//     "data": [
//         {
//             "key": 'accSysAndProcess',
//             "label": "I. Accounting Systems and Processes",
//             "section": 'accordion',
//             "formFieldType": "questionnaire",
//             "data": [
//                 {
//                     "key": "accSystem",
//                     "label": "What is the accounting system being followed by the ULB?",
//                     "position": "1",
//                     "required": true,
//                     options: [
//                         { label: "Cash Basis of Accounting", info: "Revenues and expenses are recognised/recorded when the related cash receipts or cash payments take place." },
//                         { label: "Accrual Basis of Accounting", info: "Revenues and expneses are  recognised/recorded as they are earned or incurred (and not as money is received or paid) and recorded in the financial statements of the periods to which they relate." },
//                         { label: "Modified Cash/ Accrual Accounting", info: "Revenues are recognized/recorded when cash is received and expenses when they are paid, with the exception of capitalizing long-term assets and recording their related depreciation." }
//                     ],
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "showInputBox": "",
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "accProvision",
//                     "label": "What accounting provisions or framework does the ULB follow?",
//                     "position": "2",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     options: [
//                         { label: "National Municipal Accounting Manual", },
//                         { label: "State-specific Municipal Accounting Manual", },
//                         { label: "Other (Please specify)", 'showInputBox': true, inputBoxValue: '' }
//                     ],
//                     // "showInputBox": "Other (Please specify)",
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "accInCashBasis",
//                     "label": "Are there any accounts/books/registers maintained in cash basis?",
//                     "position": "3",
//                     "required": true,
//                     "info": "Types of registers maintained: cash book, receipt register, register of bills for payment, collection register, deposit register, register of fixed assets etc.",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "options": [
//                         { label: "Yes (Please specify)", 'showInputBox': true },
//                         { label: "No", }
//                     ],
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "fsTransactionRecord",
//                     "label": "Does the ULB initially record transactions on a cash basis and subsequently prepare accrual accounts for consolidation of financial statements?",
//                     "position": "4",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "options": [
//                         "Yes",
//                         "No"
//                     ],
//                     "showInputBox": "",
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "fsPreparedBy",
//                     "label": "Are the Financial Statements prepared internally by the ULB's accounting department, or are they compiled by an external Chartered Accountant?",
//                     "position": "5",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "options": [
//                         { label: "Internally (by Accounts Department)" },
//                         "External Chartered Accountants",
//                         "Both"
//                     ],
//                     "showInputBox": "",
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "revReceiptRecord",
//                     "label": "Is the revenue receipt recorded when the cash is received or when it is accrued/event occurs?",
//                     "position": "6",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "options": [
//                         { option: "Recorded when cash is received" },
//                         { option: "Recorded when they are accrued" },
//                         { option: "Both (Please specify which transactions are recognised in accrual basis)", showInputBox: true }
//                     ],
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "expRecord",
//                     "label": "Is the expense recorded when it is paid or when it is incurred/event occurs?",
//                     "position": "7",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "options": [
//                         { option: "Recorded when cash is paid" },
//                         { option: "Recorded when they are accrued" },
//                         { option: "Both (Please specify which transactions are recognised in accrual basis)", showInputBox: true },
//                     ],
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "accSoftware",
//                     "label": "What accounting software is currently in use by the ULB?",
//                     "position": "8",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "options": [
//                         { option: "Centralized system provided by the State" },
//                         { option: "Standalone software" },
//                         { option: "Tally" },
//                         { option: "Other (Please specify)", showInputBox: true },
//                         { option: "None" }
//                     ],
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "onlineAccSysIntegrate",
//                     "label": "Does the online accounting system integrate seamlessly with other municipal systems?",
//                     "position": "9",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "options": [
//                         { option: "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)", showInputBox: true },
//                         { option: "No" }
//                     ],
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "muniAudit",
//                     "label": "Who does the municipal audit of financial statements ?",
//                     "position": "10",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "radio",
//                     "canShow": true,
//                     "options": [
//                         "External Chartered Accountant (CA)",
//                         "State Audit Department"
//                     ],
//                     "showInputBox": "",
//                     "inputBoxValue": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "required",
//                             validator: 'inputBoxValue',
//                             message: "Please fill in this required field."
//                         }
//                     ]
//                 }
//             ]
//         },
//         {
//             "key": 'accSysAndProcess',
//             "label": "II.Staffing - Finance & Accounts Department",
//             "section": 'accordion',
//             "formFieldType": "section",
//             "questions": [
//                 {
//                     "key": "totSanction",
//                     "label": "What is the total sanctioned posts for finance & accounts related positions?",
//                     "position": "11",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "number",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 9999,
//                     "min": 0,
//                     "decimal": 0,
//                     "validation": "",
//                     "logic": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "min",
//                             validator: 0,
//                             message: "Please enter a number between 0 and 9999."
//                         },
//                         {
//                             name: "max",
//                             validator: 9999,
//                             message: "Please enter a number between 0 and 9999."
//                         },
//                         {
//                             name: "decimal",
//                             validator: 0,
//                             message: "Please enter a whole number for this field."
//                         }
//                     ]
//                 },
//                 {
//                     "key": "totVacancy",
//                     "label": "What is the total vacancy across finance & accounts related positions?",
//                     "position": "12",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "number",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 9999,
//                     "min": 0,
//                     "decimal": 0,
//                     "validation": "lessThan",
//                     "logic": "11",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "min",
//                             validator: 0,
//                             message: "Please enter a number between 0 and 9999."
//                         },
//                         {
//                             name: "max",
//                             validator: 9999,
//                             message: "Please enter a number between 0 and 9999."
//                         },
//                         {
//                             name: "decimal",
//                             validator: 0,
//                             message: "Please enter a whole number for this field.s"
//                         }
//                     ]
//                 },
//                 {
//                     "key": "accPosition",
//                     "label": "How many finance & accounts related positions currently are filled on contractual basis or outsourced?",
//                     "position": "13",
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "number",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 9999,
//                     "min": 0,
//                     "decimal": 0,
//                     "validation": "",
//                     "logic": "",
//                     "value": "",
//                     "status": "Na",
//                     "isDraft": true,
//                     "readonly": false,
//                     validations: [
//                         {
//                             name: "required",
//                             validator: 'required',
//                             message: "Please fill in this required field."
//                         },
//                         {
//                             name: "min",
//                             validator: 0,
//                             message: "Please enter a number between 0 and 9999."
//                         },
//                         {
//                             name: "max",
//                             validator: 9999,
//                             message: "Please enter a number between 0 and 9999."
//                         },
//                         {
//                             name: "decimal",
//                             validator: 0,
//                             message: "Please enter a whole number for this field."
//                         }
//                     ]
//                 }
//             ]
//         }
//     ]
// }

const basicTab = {
  _id: '666764fa1d285021388bedba',
  key: 'demographicData',
  icon: '',
  formType: 'form1',
  label: 'Demographic Data',
  id: 's1',
  displayPriority: 1,
  __v: 0,
  data: [
    {
      key: 'nameOfUlb',
      readOnly: true,
      class: '',
      label: 'Name of ULB',
      position: '1',
      quesPos: 1,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'text',
      canShow: true,
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please fill in this required field.',
        },
      ],
      value: 'Barpeta Municipal Board',
      status: 'Na',
      isDraft: true,
    },
    {
      key: 'nameOfState',
      readOnly: true,
      class: '',
      label: 'Name of State/Union Territory ',
      position: '2',
      quesPos: 2,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'text',
      canShow: true,
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please fill in this required field.',
        },
      ],
      value: 'Assam',
      status: 'Na',
      isDraft: true,
    },
    {
      key: 'pop2011',
      readOnly: true,
      class: '',
      label: 'Population as per Census 2011',
      position: '3',
      quesPos: 3,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'number',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: 0,
          message: 'Please enter a number between 0 and 100000000.',
        },
        {
          name: 'max',
          validator: 100000000,
          message: 'Please enter a number between 0 and 100000000.',
        },
        {
          name: 'decimal',
          validator: 0,
          message: 'Please enter a whole number for this field.',
        },
      ],
      warning: [
        {
          value: 0,
          condition: 'eq',
          message: 'Are you sure you want to continue with 0',
        },
      ],
      max: 100000000,
      min: 0,
      decimal: 0,
      autoSumValidation: '',
      value: '',
      status: 'Na',
      isDraft: true,
    },
    {
      key: 'popApril2024',
      readOnly: true,
      class: '',
      label: 'Population as per 01 April 2024',
      position: '4',
      quesPos: 4,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'number',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: 0,
          message: 'Please enter a number between 0 and 100000000.',
        },
        {
          name: 'max',
          validator: 100000000,
          message: 'Please enter a number between 0 and 100000000.',
        },
        {
          name: 'decimal',
          validator: 0,
          message: 'Please enter a whole number for this field.',
        },
      ],
      warning: [
        {
          value: 0,
          condition: 'eq',
          message: 'Are you sure you want to continue with 0',
        },
      ],
      max: 100000000,
      min: 0,
      decimal: 0,
      autoSumValidation: '',
      value: '',
      status: 'Na',
      isDraft: true,
    },
    {
      key: 'areaOfUlb',
      readOnly: true,
      class: '',
      label: 'Area of the ULB (in Sq. Km.)',
      position: '5',
      quesPos: 5,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'number',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: 0.1,
          message: 'Please enter a number between 0.1 and 1000.',
        },
        {
          name: 'max',
          validator: 1000,
          message: 'Please enter a number between 0.1 and 1000.',
        },
        {
          name: 'decimal',
          validator: 2,
          message: 'Please enter number with at most 2 places.',
        },
      ],
      warning: [
        {
          value: 0,
          condition: 'eq',
          message: 'Are you sure you want to continue with 0',
        },
      ],
      max: 1000,
      min: 0.1,
      decimal: 2,
      autoSumValidation: '',
      value: '',
      status: 'Na',
      isDraft: true,
    },
    {
      key: 'yearOfElection',
      readOnly: true,
      class: '',
      label: "Which is the latest year when ULB's election was held?",
      position: '6',
      quesPos: 6,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'dropdown',
      canShow: true,
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please fill in this required field.',
        },
      ],
      options: [
        '2023-24',
        '2022-23',
        '2021-22',
        '2020-21',
        '2019-20',
        '2018-19',
        '2017-18',
        '2016-17',
        '2015-16',
        'Before 2015-16',
      ],
      showInputBox: '',
      inputBoxValue: '',
      value: '',
      status: 'Na',
      isDraft: true,
    },
    {
      key: 'isElected',
      readOnly: true,
      class: '',
      label: 'Is the elected body in place as on 01 April 2024?',
      position: '7',
      quesPos: 7,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'radio',
      canShow: true,
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please fill in this required field.',
        },
      ],
      options: ['Yes', 'No'],
      inputBoxValue: '',
      value: '',
      status: 'Na',
      isDraft: true,
    },
    {
      key: 'yearOfConstitution',
      readOnly: true,
      class: '',
      label: 'In which year was the ULB constituted?',
      position: '8',
      quesPos: 8,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'dropdown',
      canShow: true,
      validations: [
        {
          name: 'required',
          validator: 'required',
          message: 'Please fill in this required field.',
        },
      ],
      options: [
        '2023-34',
        '2022-23',
        '2021-22',
        '2020-21',
        '2019-20',
        '2018-19',
        '2017-18',
        '2016-17',
        'In 2015-16',
        'Before 2015-16',
      ],
      showInputBox: '',
      inputBoxValue: '',
      value: 'Before 2015-16',
      status: 'Na',
      isDraft: true,
    },
  ],
};
// const uploadDoc = {
//     "_id": "666764fa1d285021388bedbc",
//     "key": "uploadDoc",
//     "icon": "",
//     "formType": "form1",
//     "label": "View/ Upload Document",
//     "id": "s3",
//     "displayPriority": 3,
//     "__v": 0,
//     "data": [
//         {
//             "key": "auditedAnnualFySt",
//             "readOnly": true,
//             "class": "",
//             "label": "Copy of Audited Annual Financial Statements preferably in English",
//             "position": "",
//             "quesPos": 52,
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "file",
//             "canShow": true,
//             "validations": [
//                 {
//                     "name": "required",
//                     "validator": "required",
//                     "message": "Please fill in this required field."
//                 }
//             ],
//             "max": 20,
//             "min": 0,
//             "bottomText": "Maximum of 5MB",
//             "instruction": [
//                 {
//                     "instruction": "Annual Financial Statement should include: Income and Expenditure Statement, Balance Sheet, Schedules to IES and BS, Auditor's Report and if available Receipts & Payments Statement."
//                 },
//                 {
//                     "instruction": " All documents pertaining to a specific financial year should be combined into a single PDF before uploading & should not exceed 20 MB."
//                 },
//                 {
//                     "instruction": "Please use the following format for naming the documents to be uploaded: nameofthedocument_FY_ULB Name. || Example: Annual accounts_15-16_Jaipur municipal corporation"
//                 }
//             ],
//             "year": [],
//             "status": "Na",
//             "value": "",
//             "isDraft": true
//         }
//     ]
// };
const accountPractice = {
  _id: '666764fa1d285021388bedbd',
  key: 'accountPractice',
  icon: '',
  formType: 'form1',
  label: 'Accounting Practice',
  id: 's4',
  displayPriority: 4,
  __v: 0,
  data: [
    {
      key: 'accSysAndProcess',
      section: 'accordion',
      formFieldType: 'questionnaire',
      label: 'I. Accounting Systems and Processes',
      data: [
        {
          key: 'accSystem',
          readOnly: true,
          class: '',
          label: 'What is the accounting system being followed by the ULB?',
          position: '1',
          quesPos: 53,
          required: true,
          info: {
            'Cash basis of accounting':
              'Revenues and expenses are recognised/recorded when the related cash receipts or cash payments take place.',
            'Accrual basis of accounting':
              'Revenues and expneses are  recognised/recorded as they are earned or incurred (and not as money is received or paid) and recorded in the financial statements of the periods to which they relate.',
            Modified:
              'Revenues are recognized/recorded when cash is received and expenses when they are paid, with the exception of capitalizing long-term assets and recording their related depreciation.',
          },
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'Cash Basis of Accounting',
            },
            {
              id: 'Accrual Basis of Accounting',
            },
            {
              id: 'Modified Cash/ Accrual Accounting',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'accProvision',
          readOnly: true,
          class: '',
          label: 'What accounting provisions or framework does the ULB follow?',
          position: '2',
          quesPos: 54,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'National Municipal Accounting Manual',
            },
            {
              id: 'State-specific Municipal Accounting Manual',
            },
            {
              id: 'Other (Please specify)',
              showInputBox: true,
              inputBoxValue: '',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'accInCashBasis',
          readOnly: true,
          class: '',
          label: 'Are there any accounts/books/registers maintained in cash basis?',
          position: '3',
          quesPos: 55,
          required: true,
          info: 'Types of registers maintained: cash book, receipt register, register of bills for payment, collection register, deposit register, register of fixed assets etc.',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'Yes (Please specify)',
              showInputBox: true,
              inputBoxValue: '',
            },
            {
              id: 'No',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'fsTransactionRecord',
          readOnly: true,
          class: '',
          label:
            'Does the ULB initially record transactions on a cash basis and subsequently prepare accrual accounts for consolidation of financial statements?',
          position: '4',
          quesPos: 56,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'Yes',
            },
            {
              id: 'No',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'fsPreparedBy',
          readOnly: true,
          class: '',
          label:
            "Are the Financial Statements prepared internally by the ULB's accounting department, or are they compiled by an external Chartered Accountant?",
          position: '5',
          quesPos: 57,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'Internally (by Accounts Department)',
            },
            {
              id: 'External Chartered Accountants',
            },
            {
              id: 'Both',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'revReceiptRecord',
          readOnly: true,
          class: '',
          label:
            'Is the revenue receipt recorded when the cash is received or when it is accrued/event occurs?',
          position: '6',
          quesPos: 58,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'Recorded when cash is received',
            },
            {
              id: 'Recorded when they are accrued',
            },
            {
              id: 'Both (Please specify which transactions are recognised in accrual basis)',
              showInputBox: true,
              inputBoxValue: '',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'expRecord',
          readOnly: true,
          class: '',
          label: 'Is the expense recorded when it is paid or when it is incurred/event occurs?',
          position: '7',
          quesPos: 59,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'Recorded when cash is paid',
            },
            {
              id: 'Recorded when they are accrued',
            },
            {
              id: 'Both (Please specify which transactions are recognised in accrual basis)',
              showInputBox: true,
              inputBoxValue: '',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'accSoftware',
          readOnly: true,
          class: '',
          label: 'What accounting software is currently in use by the ULB?',
          position: '8',
          quesPos: 60,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'Centralized system provided by the State',
            },
            {
              id: 'Standalone software',
            },
            {
              id: 'Tally',
            },
            {
              id: 'Other (Please specify)',
              showInputBox: true,
              inputBoxValue: '',
            },
            {
              id: 'None',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'onlineAccSysIntegrate',
          readOnly: true,
          class: '',
          label:
            'Does the online accounting system integrate seamlessly with other municipal systems?',
          position: '9',
          quesPos: 61,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'Yes (Please specify which all system, e.g., tax collection, payroll, asset management)',
              showInputBox: true,
              inputBoxValue: '',
            },
            {
              id: 'No',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'muniAudit',
          readOnly: true,
          class: '',
          label: 'Who does the municipal audit of financial statements ?',
          position: '10',
          quesPos: 62,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'radio',
          canShow: true,
          validations: [
            {
              name: 'required',
              validator: 'required',
              message: 'Please fill in this required field.',
            },
          ],
          options: [
            {
              id: 'External Chartered Accountant (CA)',
            },
            {
              id: 'State Audit Department',
            },
          ],
          inputBoxValue: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
      ],
    },
    {
      key: 'staffing',
      section: 'accordion',
      formFieldType: 'questionnaire',
      label: 'II.Staffing - Finance & Accounts Department',
      data: [
        {
          key: 'totSanction',
          readOnly: true,
          class: '',
          label: 'What is the total sanctioned posts for finance & accounts related positions?',
          position: '11',
          quesPos: 63,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'number',
          canShow: true,
          validations: [
            {
              name: 'min',
              validator: 0,
              message: 'Please enter a number between 0 and 9999.',
            },
            {
              name: 'max',
              validator: 9999,
              message: 'Please enter a number between 0 and 9999.',
            },
            {
              name: 'decimal',
              validator: 0,
              message: 'Please enter a whole number for this field.',
            },
          ],
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          max: 9999,
          min: 0,
          decimal: 0,
          autoSumValidation: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'totVacancy',
          readOnly: true,
          class: '',
          label: 'What is the total vacancy across finance & accounts related positions?',
          position: '12',
          quesPos: 64,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'number',
          canShow: true,
          validations: [
            {
              name: 'min',
              validator: 0,
              message: 'Please enter a number between 0 and 9999.',
            },
            {
              name: 'max',
              validator: 9999,
              message: 'Please enter a number between 0 and 9999.',
            },
            {
              name: 'decimal',
              validator: 0,
              message: 'Please enter a whole number for this field.',
            },
          ],
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          max: 9999,
          min: 0,
          decimal: 0,
          autoSumValidation: 'lessThan',
          value: '',
          status: 'Na',
          isDraft: true,
        },
        {
          key: 'accPosition',
          readOnly: true,
          class: '',
          label:
            'How many finance & accounts related positions currently are filled on contractual basis or outsourced?',
          position: '13',
          quesPos: 65,
          required: true,
          info: '',
          placeHolder: '',
          formFieldType: 'number',
          canShow: true,
          validations: [
            {
              name: 'min',
              validator: 0,
              message: 'Please enter a number between 0 and 9999.',
            },
            {
              name: 'max',
              validator: 9999,
              message: 'Please enter a number between 0 and 9999.',
            },
            {
              name: 'decimal',
              validator: 0,
              message: 'Please enter a whole number for this field.',
            },
          ],
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          max: 9999,
          min: 0,
          decimal: 0,
          autoSumValidation: '',
          value: '',
          status: 'Na',
          isDraft: true,
        },
      ],
    },
  ],
};
const reviewSubmit = {
  key: 'reviewSubmit',
  label: 'Review & Submit',
  displayPriority: 5,
};
export const tabsJson = {
  data: {
    tabs: [basicTab, financialData, uploadDoc, accountPractice, slb, reviewSubmit],
  },
};
