// import { financialData } from "./xviFinanceDataJson";
import { financialData } from "./xviFinanceDataJsonApi";
import { slb } from "./xviFcSlb";

const basicTab = {
    "_id": "6657921b9ab1c13ac44d01f4",
    "key": "demographicData",
    "icon": "",
    "text": "",
    "formType": "form1",
    "label": "Demographic Data",
    "id": "s1",
    class: 'w-75',
    "displayPriority": 1,
    "__v": 0,
    "data": [
        {
            "key": "nameOfUlb",
            "label": "Name of ULB",
            "position": "1",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "text",
            "canShow": true,
            "value": "Barpeta Municipal Board",
            "status": "Na",
            "isDraft": true,
            "readonly": true
        },
        {
            "key": "nameOfState",
            "label": "Name of State/Union Territory ",
            "position": "2",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "text",
            "canShow": true,
            "value": "Assam",
            "status": "Na",
            "isDraft": true,
            "readonly": true,
            validations: [
                {
                    name: "required",
                    validator: 'required',
                    message: "Please fill in this required field."
                },
                {
                    name: "pattern",
                    validator: "^[a-zA-Z]+$",
                    message: "Please enter a valid text."
                }
            ]
        },
        {
            "key": "pop2011",
            "label": "Population as per Census 2011",
            "position": "3",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "number",
            "canShow": true,
            "warning": [
                {
                    "value": 0,
                    "condition": "eq",
                    "message": "Are you sure you want to continue with 0"
                }
            ],
            "max": 1000000,
            "min": 0,
            "decimal": 0,
            "validation": "",
            "logic": "",
            "value": "",
            "status": "Na",
            "isDraft": true,
            "readonly": false,
            validations: [
                {
                    name: "required",
                    validator: 'required',
                    message: "Please fill in this required field."
                },
                {
                    name: "min",
                    validator: 0,
                    message: "Please enter a number between 0 and 10,00,000."
                },
                {
                    name: "max",
                    validator: 1000000,
                    message: "Please enter a number between 0 and 10,00,000."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        },
        {
            "key": "popApril2024",
            "label": "Population as per 01 April 2024",
            "position": "4",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "",
            "canShow": true,
            "warning": [
                {
                    "value": 0,
                    "condition": "eq",
                    "message": "Are you sure you want to continue with 0"
                }
            ],
            "max": 1000000,
            "min": 0,
            "decimal": 0,
            "validation": "",
            "logic": "",
            "value": "",
            "status": "Na",
            "isDraft": true,
            "readonly": false,
            validations: [
                {
                    name: "required",
                    validator: 'required',
                    message: "Please fill in this required field."
                },
                {
                    name: "min",
                    validator: 0,
                    message: "Please enter a number between 0 and 10,00,000."
                },
                {
                    name: "max",
                    validator: 1000000,
                    message: "Please enter a number between 0 and 10,00,000."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        },
        {
            "key": "areaOfUlb",
            "label": "Area of the ULB (in Sq. Km.)",
            "position": "5",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "number",
            "canShow": true,
            "warning": [
                {
                    "value": 0,
                    "condition": "eq",
                    "message": "Are you sure you want to continue with 0"
                }
            ],
            "max": 1000,
            "min": 0.1,
            "decimal": 2,
            "validation": "",
            "logic": "",
            "value": "",
            "status": "Na",
            "isDraft": true,
            "readonly": false,
            validations: [
                {
                    name: "required",
                    validator: 'required',
                    message: "Please fill in this required field."
                },
                {
                    name: "min",
                    validator: 0.1,
                    message: "Please enter area greater than 0."
                },
                {
                    name: "max",
                    validator: 1000,
                    message: "Please enter area within 1000 sq.km"
                },
                {
                    name: "decimal",
                    validator: 2,
                    message: "Please enter the area with at most two decimal places."
                }
            ]
        },
        {
            "key": "yearOfElection",
            "label": "Which is the latest year when ULB's election was held?",
            "position": "6",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "select",
            "canShow": true,
            "options": [
                "2000",
                "2001",
                "2002",
                "2003",
                "2004",
                "2005",
                "2006",
                "2007",
                "2008",
                "2009",
                "2010",
                "2011",
                "2012",
                "2013",
                "2014",
                "2015",
                "2016",
                "2017",
                "2018",
                "2019",
                "2020",
                "2021",
                "2022",
                "2023",
                "2024"
            ],
            "showInputBox": "",
            "inputBoxValue": "",
            "value": "",
            "status": "Na",
            "isDraft": true,
            "readonly": false
        },
        {
            "key": "isElected",
            "label": "Is the elected body in place as on 01 April 2024?",
            "position": "7",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "radio",
            "canShow": true,
            "options": [
                "Yes",
                "No"
            ],
            "inputBoxValue": "",
            "value": "",
            "status": "Na",
            "isDraft": true,
            "readonly": false
        },
        {
            "key": "yearOfConstitution",
            "label": "In which year was the ULB constituted?",
            "position": "8",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "select",
            "canShow": true,
            "options": [
                "2015-16",
                "2016-17",
                "2017-18",
                "2018-19",
                "2019-20",
                "2020-21",
                "2021-22",
                "2022-23"
            ],
            "showInputBox": "",
            "inputBoxValue": "",
            "value": "",
            "status": "Na",
            "isDraft": true,
            "readonly": false
        }
    ]
}
const uploadDoc = {
    "_id": "665df95e73de1812233ecc01",
    "key": "uploadDoc",
    "icon": "",
    "text": "",
    "formType": "form1",
    "label": "View/ Upload Document",
    "id": "s3",
    "displayPriority": 3,
    "__v": 0,
    "data": [
        {
            "key": "auditedAnnualFySt",
            "label": "Copy of Audited Annual Financial Statements preferably in English",
            "postion": "",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "file",
            "canShow": true,
            "max": 5,
            "min": 0,
            "bottomText": "Maximum of 5MB",
            "instruction": [
                {
                    "instruction": "Annual Financial Statement should include: Income and Expenditure Statement, Balance Sheet, Schedules to IES and BS, Auditor's Report and if available Receipts & Payments Statement."
                },
                {
                    "instruction": " All documents pertaining to a specific financial year should be combined into a single PDF before uploading & should not exceed 20 MB."
                },
                {
                    "instruction": "Please use the following format for naming the documents to be uploaded: nameofthedocument_FY_ULB Name. || Example: Annual accounts_15-16_Jaipur municipal corporation"
                }
            ],
            "year": [
                {
                    "warning": [],
                    "label": "FY 2022-23",
                    "key": "fy2022-23_auditedAnnualFySt",
                    "postion": 1,
                    "type": "auditedAnnualFySt",
                    "formFieldType": "file",
                    "value": "",
                    "isPdfAvailable": false,
                    "file": {
                        "name": "testName2022-23",
                        "url": "https://www.test.com/2022-23.pdf"
                    },
                    "fileAlreadyOnCf": [
                        {
                            "name": "",
                            "url": "",
                            "type": "",
                            "label": ""
                        }
                    ],
                    "fileRejectOptions": [
                        "Balance Sheet",
                        "Schedules To Balance Sheet",
                        "Income And Expenditure",
                        "Schedules To Income And Expenditure",
                        "Cash Flow Statement",
                        "Auditor Report"
                    ],
                    verifyStatus: 1, // 1-pending, 2- accept, 3- reject
                    rejectOption: '',
                    rejectReason: '',
                    allowedFileTypes: ['pdf'],
                },
                {
                    "warning": [],
                    "label": "FY 2021-22",
                    "key": "fy2021-22_auditedAnnualFySt",
                    "postion": 2,
                    "type": "auditedAnnualFySt",
                    "formFieldType": "file",
                    "value": "",
                    "isPdfAvailable": false,
                    "file": {
                        "name": "testName2020-21",
                        "url": "https://www.test.com/2020-21.pdf"
                    },
                    "fileAlreadyOnCf": [
                        {
                            "name": "",
                            "url": "",
                            "type": "",
                            "label": ""
                        }
                    ],
                    "fileRejectOptions": [
                        "Balance Sheet",
                        "Schedules To Balance Sheet",
                        "Income And Expenditure",
                        "Schedules To Income And Expenditure",
                        "Cash Flow Statement",
                        "Auditor Report"
                    ]
                },
                {
                    "warning": [],
                    "label": "FY 2020-21",
                    "key": "fy2020-21_auditedAnnualFySt",
                    "postion": 3,
                    "type": "auditedAnnualFySt",
                    "formFieldType": "file",
                    "value": "",
                    "isPdfAvailable": false,
                    "file": {
                        "name": "testName2020-21",
                        "url": "https://www.test.com/2020-21.pdf"
                    },
                    "fileAlreadyOnCf": [
                        {
                            "name": "",
                            "url": "",
                            "type": "",
                            "label": ""
                        }
                    ],
                    "fileRejectOptions": [
                        "Balance Sheet",
                        "Schedules To Balance Sheet",
                        "Income And Expenditure",
                        "Schedules To Income And Expenditure",
                        "Cash Flow Statement",
                        "Auditor Report"
                    ]
                },
                {
                    "warning": [],
                    "label": "FY 2019-20",
                    "key": "fy2019-20_auditedAnnualFySt",
                    "postion": 4,
                    "type": "auditedAnnualFySt",
                    "formFieldType": "file",
                    "value": "",
                    "isPdfAvailable": true,
                    "file": {
                        "name": "testName2019-20",
                        "url": "https://www.test.com/2019-20.pdf"
                    },
                    "fileAlreadyOnCf": [
                        {
                            "name": "Balance Sheet 2019-20.pdf",
                            "url": "/objects/5f7b285f-8bc6-4bdf-a216-1f53605e9ab2.pdf",
                            "type": "bal_sheet",
                            "label": "Balance Sheet"
                        },
                        {
                            "name": "Schedule 1-20 Balance sheet 2019-20.pdf",
                            "url": "/objects/16c32fbe-3576-4ea0-ab94-af37cfb05569.pdf",
                            "type": "bal_sheet_schedules",
                            "label": "Schedules To Balance Sheet"
                        },
                        {
                            "name": "Income & Expenditure Statement 2019-20.pdf",
                            "url": "/objects/4f505458-5f1a-4475-900f-bcc65f224996.pdf",
                            "type": "inc_exp",
                            "label": "Income And Expenditure"
                        },
                        {
                            "name": "Schedule 21-40 Income Exp. 2019-20.pdf",
                            "url": "/objects/2c580cae-5ca7-4c50-80f3-3debfe5175c1.pdf",
                            "type": "inc_exp_schedules",
                            "label": "Schedules To Income And Expenditure"
                        },
                        {
                            "name": "BPT19.pdf",
                            "url": "/objects/c3d0135c-1f23-4880-ae60-6dce44c7e2ef.pdf",
                            "type": "cash_flow",
                            "label": "Cash Flow Statement"
                        },
                        {
                            "name": "Audit Report  2019-20.pdf",
                            "url": "/objects/57ce419b-1db3-4102-9743-7bcbd0786563.pdf",
                            "type": "auditor_report",
                            "label": "Auditor Report"
                        }
                    ],
                    "fileRejectOptions": [
                        "Balance Sheet",
                        "Schedules To Balance Sheet",
                        "Income And Expenditure",
                        "Schedules To Income And Expenditure",
                        "Cash Flow Statement",
                        "Auditor Report"
                    ]
                },
                {
                    "warning": [],
                    "label": "FY 2018-19",
                    "key": "fy2018-19_auditedAnnualFySt",
                    "postion": 5,
                    "type": "auditedAnnualFySt",
                    "formFieldType": "file",
                    "value": "",
                    "isPdfAvailable": false,
                    "file": {
                        "name": "testName2018-19",
                        "url": "https://www.test.com/2018-19.pdf"
                    },
                    "fileAlreadyOnCf": [
                        {
                            "name": "",
                            "url": "",
                            "type": "",
                            "label": ""
                        }
                    ],
                    "fileRejectOptions": [
                        "Balance Sheet",
                        "Schedules To Balance Sheet",
                        "Income And Expenditure",
                        "Schedules To Income And Expenditure",
                        "Cash Flow Statement",
                        "Auditor Report"
                    ]
                },
                {
                    "warning": [],
                    "label": "FY 2017-18",
                    "key": "fy2017-18_auditedAnnualFySt",
                    "postion": 6,
                    "type": "auditedAnnualFySt",
                    "formFieldType": "file",
                    "value": "",
                    "isPdfAvailable": false,
                    "file": {
                        "name": "testName2017-18",
                        "url": "https://www.test.com/2017-18.pdf"
                    },
                    "fileAlreadyOnCf": [
                        {
                            "name": "",
                            "url": "",
                            "type": "",
                            "label": ""
                        }
                    ],
                    "fileRejectOptions": [
                        "Balance Sheet",
                        "Schedules To Balance Sheet",
                        "Income And Expenditure",
                        "Schedules To Income And Expenditure",
                        "Cash Flow Statement",
                        "Auditor Report"
                    ]
                },
                {
                    "warning": [],
                    "label": "FY 2016-17",
                    "key": "fy2016-17_auditedAnnualFySt",
                    "postion": 7,
                    "type": "auditedAnnualFySt",
                    "formFieldType": "file",
                    "value": "",
                    "isPdfAvailable": false,
                    "file": {
                        "name": "testName2016-17",
                        "url": "https://www.test.com/2016-17.pdf"
                    },
                    "fileAlreadyOnCf": [
                        {
                            "name": "",
                            "url": "",
                            "type": "",
                            "label": ""
                        }
                    ],
                    "fileRejectOptions": [
                        "Balance Sheet",
                        "Schedules To Balance Sheet",
                        "Income And Expenditure",
                        "Schedules To Income And Expenditure",
                        "Cash Flow Statement",
                        "Auditor Report"
                    ]
                },
                {
                    "warning": [],
                    "label": "FY 2015-16",
                    "key": "fy2015-16_auditedAnnualFySt",
                    "postion": 8,
                    "type": "auditedAnnualFySt",
                    "formFieldType": "file",
                    "value": "",
                    "isPdfAvailable": false,
                    "file": {
                        "name": "testName2015-16",
                        "url": "https://www.test.com/2015-16.pdf"
                    },
                    "fileAlreadyOnCf": [
                        {
                            "name": "",
                            "url": "",
                            "type": "",
                            "label": ""
                        }
                    ],
                    "fileRejectOptions": [
                        "Balance Sheet",
                        "Schedules To Balance Sheet",
                        "Income And Expenditure",
                        "Schedules To Income And Expenditure",
                        "Cash Flow Statement",
                        "Auditor Report"
                    ]
                }
            ],
            "status": "Na",
            "value": "",
            "isDraft": true,
            "readonly": false
        }
    ]
}
const accountPractice = {
    "key": "accountPractice",
    "label": "Accounting Practice",
    "displayPriority": 4,
    "data": [
        {
            "key": 'accSysAndProcess1',
            "label": "I. Accounting Systems and Processes",
            "section": 'accordion',
            "formFieldType": "questionnaire",
            "data": [
                {
                    "key": "accSystem",
                    "label": "What is the accounting system being followed by the ULB?",
                    "position": "1",
                    "required": true,
                    options: [
                        { label: "Cash Basis of Accounting", info: "Revenues and expenses are recognised/recorded when the related cash receipts or cash payments take place." },
                        { label: "Accrual Basis of Accounting", info: "Revenues and expneses are  recognised/recorded as they are earned or incurred (and not as money is received or paid) and recorded in the financial statements of the periods to which they relate." },
                        { label: "Modified Cash/ Accrual Accounting", info: "Revenues are recognized/recorded when cash is received and expenses when they are paid, with the exception of capitalizing long-term assets and recording their related depreciation." }
                    ],
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "showInputBox": "",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "accProvision",
                    "label": "What accounting provisions or framework does the ULB follow?",
                    "position": "2",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    options: [
                        { label: "National Municipal Accounting Manual", },
                        { label: "State-specific Municipal Accounting Manual", },
                        { label: "Other (Please specify)", 'showInputBox': true }
                    ],
                    // "showInputBox": "Other (Please specify)",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "accInCashBasis",
                    "label": "Are there any accounts/books/registers maintained in cash basis?",
                    "position": "3",
                    "required": true,
                    "info": "Types of registers maintained: cash book, receipt register, register of bills for payment, collection register, deposit register, register of fixed assets etc.",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        { label: "Yes (Please specify)", 'showInputBox': true },
                        { label: "No", }
                    ],
                    reason: 'resafsf dfas12',
                    "inputBoxValue": "",
                    "value": "Yes (Please specify)",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "fsTransactionRecord",
                    "label": "Does the ULB initially record transactions on a cash basis and subsequently prepare accrual accounts for consolidation of financial statements?",
                    "position": "4",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "Yes",
                        "No"
                    ],
                    "showInputBox": "",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "fsPreparedBy",
                    "label": "Are the Financial Statements prepared internally by the ULB's accounting department, or are they compiled by an external Chartered Accountant?",
                    "position": "5",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "Internally (by Accounts Department)",
                        "External Chartered Accountants",
                        "Both"
                    ],
                    "showInputBox": "",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "revReceiptRecord",
                    "label": "Is the revenue receipt recorded when the cash is received or when it is accrued/event occurs?",
                    "position": "6",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        { label: "Recorded when cash is received" },
                        { label: "Recorded when they are accrued" },
                        { label: "Both (Please specify which transactions are recognised in accrual basis)", showInputBox: true }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "expRecord",
                    "label": "Is the expense recorded when it is paid or when it is incurred/event occurs?",
                    "position": "7",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        { label: "Recorded when cash is paid" },
                        { label: "Recorded when they are accrued" },
                        { label: "Both (Please specify which transactions are recognised in accrual basis)", showInputBox: true },
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "accSoftware",
                    "label": "What accounting software is currently in use by the ULB?",
                    "position": "8",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        { label: "Centralized system provided by the State" },
                        { label: "Standalone software" },
                        { label: "Tally" },
                        { label: "Other (Please specify)", showInputBox: true },
                        { label: "None" }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "onlineAccSysIntegrate",
                    "label": "Does the online accounting system integrate seamlessly with other municipal systems?",
                    "position": "9",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        { label: "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)", showInputBox: true },
                        { label: "No" }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                },
                {
                    "key": "muniAudit",
                    "label": "Who does the municipal audit of financial statements ?",
                    "position": "10",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "External Chartered Accountant (CA)",
                        "State Audit Department"
                    ],
                    "showInputBox": "",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "required",
                            validator: 'inputBoxValue',
                            message: "Please fill in this required field."
                        }
                    ]
                }
            ]
        },
        {
            "key": 'accSysAndProcess2',
            "label": "II.Staffing - Finance & Accounts Department",
            "section": 'accordion',
            "formFieldType": "questionnaire",
            "data": [
                {
                    "key": "totSanction",
                    "label": "What is the total sanctioned posts for finance & accounts related positions?",
                    "position": "11",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "number",
                    "canShow": true,
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "max": 9999,
                    "min": 0,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "min",
                            validator: 0,
                            message: "Please enter a number between 0 and 9999."
                        },
                        {
                            name: "max",
                            validator: 9999,
                            message: "Please enter a number between 0 and 9999."
                        },
                        {
                            name: "decimal",
                            validator: 0,
                            message: "Please enter a whole number for this field."
                        }
                    ]
                },
                {
                    "key": "totVacancy",
                    "label": "What is the total vacancy across finance & accounts related positions?",
                    "position": "12",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "number",
                    "canShow": true,
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "max": 9999,
                    "min": 0,
                    "decimal": 0,
                    "validation": "lessThan",
                    "logic": "11",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "min",
                            validator: 0,
                            message: "Please enter a number between 0 and 9999."
                        },
                        {
                            name: "max",
                            validator: 9999,
                            message: "Please enter a number between 0 and 9999."
                        },
                        {
                            name: "decimal",
                            validator: 0,
                            message: "Please enter a whole number for this field.s"
                        }
                    ]
                },
                {
                    "key": "accPosition",
                    "label": "How many finance & accounts related positions currently are filled on contractual basis or outsourced?",
                    "position": "13",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "number",
                    "canShow": true,
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "max": 9999,
                    "min": 0,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false,
                    validations: [
                        {
                            name: "required",
                            validator: 'required',
                            message: "Please fill in this required field."
                        },
                        {
                            name: "min",
                            validator: 0,
                            message: "Please enter a number between 0 and 9999."
                        },
                        {
                            name: "max",
                            validator: 9999,
                            message: "Please enter a number between 0 and 9999."
                        },
                        {
                            name: "decimal",
                            validator: 0,
                            message: "Please enter a whole number for this field."
                        }
                    ]
                }
            ]
        }
    ]
}

const reviewSubmit = {
    key: 'reviewSubmit',
    label: "Review & Submit",
    "displayPriority": 5,
}

export const tabsJson = {
    data: {
        "tabs": [
            // basicTab,
            financialData,
            uploadDoc,
            accountPractice,
            // slb,
            // reviewSubmit
        ]
    }
};