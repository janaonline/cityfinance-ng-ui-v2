import { financialData } from "./xviFinanceDataJson";

const basicTab = {
    "_id": "6657921b9ab1c13ac44d01f4",
    "key": "demographicData",
    "icon": "",
    "text": "",
    "formType": "form1",
    "label": "Demographic Data",
    "id": "s1",
    "displayPriority": 1,
    "__v": 0,
    "formArrays": [
        {
            "key": "nameOfUlb",
            "label": "Name of ULB",
            "postion": "1",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "text",
            "canShow": true,
            "value": "",
            "status": "Na",
            "isDraft": true,
            "readonly": false,
            validations: [
                {
                    name: "required",
                    validator: 'required',
                    message: "Name Required"
                },
                // {
                //     name: "pattern",
                //     validator:"^[a-zA-Z]+$",
                //     message: "Accept only text"
                // }
            ]
        },
        {
            "key": "nameOfState",
            "label": "Name of State/Union Territory ",
            "postion": "2",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "text",
            "canShow": true,
            "value": "",
            "status": "Na",
            "isDraft": true,
            "readonly": true
        },
        {
            "key": "pop2011",
            "label": "Population as per Census 2011",
            "postion": "3",
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
            "readonly": false
        },
        {
            "key": "popApril2024",
            "label": "Population as per 01 April 2024",
            "postion": "4",
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
            "readonly": false
        },
        {
            "key": "areaOfUlb",
            "label": "Area of the ULB (in Sq. Km.)",
            "postion": "5",
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
            "readonly": false
        },
        {
            "key": "yearOfElection",
            "label": "Which is the latest year when ULB's election was held?",
            "postion": "6",
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
            "postion": "7",
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
            "postion": "8",
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
    // "_id": "6657921b9ab1c13ac44d01f6",
    // "key": "uploadDoc",
    // "icon": "",
    // "text": "",
    "formType": "form1",
    "label": "View/ Upload Document",
    "id": "s3",
    "displayPriority": 3,
    "key": "auditedAnnualFySt",
    // "label": "Copy of Audited Annual Financial Statements preferably in English",
    "postion": "",
    "required": true,
    // "info": "",
    // "placeHolder": "",
    // "canShow": true,
    // "max": 5,
    // "min": 0,
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
    "status": "Na",
    "value": "",
    "isDraft": true,
    "readonly": false,
    "fileRejectOptions": [
        "Balance Sheet",
        "Schedules To Balance Sheet",
        "Income And Expenditure",
        "Schedules To Income And Expenditure",
        "Cash Flow Statement",
        "Auditor Report"
    ],
    "formArrays": [
        {
            "warning": [],
            "label": "FY 2022-23",
            "key": "fy2022-23_auditedAnnualFySt",
            "postion": 1,
            "type": "auditedAnnualFySt",
            "formFieldType": "file",
            "value": "",
            "isPdfAvailable": "",
            "file": {
                "name": "",
                "url": ""
            },
            "fileAlreadyOnCf": [
                {
                    "name": "",
                    "url": "",
                    "type": "",
                    "label": ""
                }
            ],

        },
        {
            "warning": [],
            "label": "FY 2021-22",
            "key": "fy2021-22_auditedAnnualFySt",
            "postion": 2,
            "type": "auditedAnnualFySt",
            "formFieldType": "file",
            "value": "",
            "isPdfAvailable": "",
            "file": {
                "name": "",
                "url": ""
            },
            "fileAlreadyOnCf": [
                {
                    "name": "",
                    "url": "",
                    "type": "",
                    "label": ""
                }
            ],
        },
        {
            "warning": [],
            "label": "FY 2020-21",
            "key": "fy2020-21_auditedAnnualFySt",
            "postion": 3,
            "type": "auditedAnnualFySt",
            "formFieldType": "file",
            "value": "",
            "isPdfAvailable": "",
            "file": {
                "name": "",
                "url": ""
            },
            "fileAlreadyOnCf": [
                {
                    "name": "",
                    "url": "",
                    "type": "",
                    "label": ""
                }
            ],
        },
        {
            "warning": [],
            "label": "FY 2019-20",
            "key": "fy2019-20_auditedAnnualFySt",
            "postion": 4,
            "type": "auditedAnnualFySt",
            "formFieldType": "file",
            "value": "",
            "isPdfAvailable": "",
            "file": {
                "name": "",
                "url": ""
            },
            "fileAlreadyOnCf": [
                {
                    "name": "",
                    "url": "",
                    "type": "",
                    "label": ""
                }
            ],
        },
        {
            "warning": [],
            "label": "FY 2018-19",
            "key": "fy2018-19_auditedAnnualFySt",
            "postion": 5,
            "type": "auditedAnnualFySt",
            "formFieldType": "file",
            "value": "",
            "isPdfAvailable": "",
            "file": {
                "name": "",
                "url": ""
            },
            "fileAlreadyOnCf": [
                {
                    "name": "",
                    "url": "",
                    "type": "",
                    "label": ""
                }
            ],
        },
        {
            "warning": [],
            "label": "FY 2017-18",
            "key": "fy2017-18_auditedAnnualFySt",
            "postion": 6,
            "type": "auditedAnnualFySt",
            "formFieldType": "file",
            "value": "",
            "isPdfAvailable": "",
            "file": {
                "name": "",
                "url": ""
            },
            "fileAlreadyOnCf": [
                {
                    "name": "",
                    "url": "",
                    "type": "",
                    "label": ""
                }
            ],
        },
        {
            "warning": [],
            "label": "FY 2016-17",
            "key": "fy2016-17_auditedAnnualFySt",
            "postion": 7,
            "type": "auditedAnnualFySt",
            "formFieldType": "file",
            "value": "",
            "isPdfAvailable": "",
            "file": {
                "name": "",
                "url": ""
            },
            "fileAlreadyOnCf": [
                {
                    "name": "",
                    "url": "",
                    "type": "",
                    "label": ""
                }
            ],
        },
        {
            "warning": [],
            "label": "FY 2015-16",
            "key": "fy2015-16_auditedAnnualFySt",
            "postion": 8,
            "type": "auditedAnnualFySt",
            "formFieldType": "file",
            "value": "",
            "isPdfAvailable": "",
            "file": {
                "name": "",
                "url": ""
            },
            "fileAlreadyOnCf": [
                {
                    "name": "",
                    "url": "",
                    "type": "",
                    "label": ""
                }
            ],
        }
    ],
}
const accountPractice = {
    "key": "accountPractice",
    "label": "Accounting Practice",
    "displayPriority": 4,
    "formArrays": [
        {
            "key": 'accSysAndProcess',
            "label": "I. Accounting Systems and Processes",
            "section": 'accordion',
            "formFieldType": "section",
            "questions": [
                {
                    "key": "accSystem",
                    "label": "What is the accounting system being followed by the ULB?",
                    "postion": "1",
                    "required": true,
                    "info": {
                        "Cash basis of accounting": "Revenues and expenses are recognised/recorded when the related cash receipts or cash payments take place.",
                        "Accrual basis of accounting": "Revenues and expneses are  recognised/recorded as they are earned or incurred (and not as money is received or paid) and recorded in the financial statements of the periods to which they relate.",
                        "Modified": "Revenues are recognized/recorded when cash is received and expenses when they are paid, with the exception of capitalizing long-term assets and recording their related depreciation."
                    },
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "Cash Basis of Accounting",
                        "Accrual Basis of Accounting",
                        "Modified Cash/ Accrual Accounting"
                    ],
                    "showInputBox": "",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "accProvision",
                    "label": "What accounting provisions or framework does the ULB follow?",
                    "postion": "2",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "National Municipal Accounting Manual",
                        "State-specific Municipal Accounting Manual",
                        "Other (Please specify)"
                    ],
                    "showInputBox": "Other (Please specify)",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "accInCashBasis",
                    "label": "Are there any accounts/books/registers maintained in cash basis?",
                    "postion": "3",
                    "required": true,
                    "info": "Types of registers maintained: cash book, receipt register, register of bills for payment, collection register, deposit register, register of fixed assets etc.",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "Yes (Please specify)",
                        "No"
                    ],
                    "showInputBox": "Yes (Please specify)",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "fsTransactionRecord",
                    "label": "Does the ULB initially record transactions on a cash basis and subsequently prepare accrual accounts for consolidation of financial statements?",
                    "postion": "4",
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
                    "readonly": false
                },
                {
                    "key": "fsPreparedBy",
                    "label": "Are the Financial Statements prepared internally by the ULB's accounting department, or are they compiled by an external Chartered Accountant?",
                    "postion": "5",
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
                    "readonly": false
                },
                {
                    "key": "revReceiptRecord",
                    "label": "Is the revenue receipt recorded when the cash is received or when it is accrued/event occurs?",
                    "postion": "6",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "Recorded when cash is received",
                        "Recorded when they are accrued",
                        "Both (Please specify which transactions are recognised in accrual basis)"
                    ],
                    "showInputBox": "Both (Please specify which transactions are recognised in accrual basis)",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "expRecord",
                    "label": "Is the expense recorded when it is paid or when it is incurred/event occurs?",
                    "postion": "7",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "Recorded when cash is paid",
                        "Recorded when they are accrued",
                        "Both (Please specify which transactions are recognised in accrual basis)"
                    ],
                    "showInputBox": "Both (Please specify which transactions are recognised in accrual basis)",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "accSoftware",
                    "label": "What accounting software is currently in use by the ULB?",
                    "postion": "8",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "Centralized system provided by the State",
                        "Standalone software",
                        "Tally",
                        "Other (Please specify)",
                        "None"
                    ],
                    "showInputBox": "Other (Please specify)",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "onlineAccSysIntegrate",
                    "label": "Does the online accounting system integrate seamlessly with other municipal systems?",
                    "postion": "9",
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "options": [
                        "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)",
                        "No"
                    ],
                    "showInputBox": "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)",
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "muniAudit",
                    "label": "Who does the municipal audit of financial statements ?",
                    "postion": "10",
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
                    "readonly": false
                }
            ]
        },
        {
            "key": 'accSysAndProcess',
            "label": "II.Staffing - Finance & Accounts Department",
            "section": 'accordion',
            "formFieldType": "section",
            "questions": [
                {
                    "key": "totSanction",
                    "label": "What is the total sanctioned posts for finance & accounts related positions?",
                    "postion": "11",
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
                    "readonly": false
                },
                {
                    "key": "totVacancy",
                    "label": "What is the total vacancy across finance & accounts related positions?",
                    "postion": "12",
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
                    "readonly": false
                },
                {
                    "key": "accPosition",
                    "label": "How many finance & accounts related positions currently are filled on contractual basis or outsourced?",
                    "postion": "13",
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
                    "readonly": false
                }
            ]
        }
    ]
}

const reviewSubmit = {
    key: 'reviewSubmit',
    label: "Accounting Practice",
}
export const tabsJson = {
    data: {
        "tabs": [
            basicTab,
            financialData,
            
            uploadDoc,
            accountPractice,
            reviewSubmit
        ]
    }
};