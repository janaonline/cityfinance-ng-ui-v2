// import { financialData } from "./xviFinanceDataJson";
import { financialData } from "./xviFinanceDataJsonApi";
import { slb } from "./xviFcSlb";

const basicTab = {
    "_id": "666764fa1d285021388bedba",
    "key": "demographicData",
    "icon": "",
    "formType": "form1",
    "label": "Demographic Data",
    "id": "s1",
    "displayPriority": 1,
    "__v": 0,
    "data": [
        {
            "key": "nameOfUlb",
            "readOnly": true,
            "class": "",
            "label": "Name of ULB",
            "position": "1",
            "quesPos": 1,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "text",
            "canShow": true,
            "validations": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Please fill in this required field."
                }
            ],
            "value": "Barpeta Municipal Board",
            "status": "Na",
            "isDraft": true
        },
        {
            "key": "nameOfState",
            "readOnly": true,
            "class": "",
            "label": "Name of State/Union Territory ",
            "position": "2",
            "quesPos": 2,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "text",
            "canShow": true,
            "validations": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Please fill in this required field."
                }
            ],
            "value": "Assam",
            "status": "Na",
            "isDraft": true
        },
        {
            "key": "pop2011",
            "readOnly": true,
            "class": "",
            "label": "Population as per Census 2011",
            "position": "3",
            "quesPos": 3,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "number",
            "canShow": true,
            "validations": [
                {
                    "name": "min",
                    "validator": 0,
                    "message": "Please enter a number between 0 and 100000000."
                },
                {
                    "name": "max",
                    "validator": 100000000,
                    "message": "Please enter a number between 0 and 100000000."
                },
                {
                    "name": "decimal",
                    "validator": 0,
                    "message": "Please enter a whole number for this field."
                }
            ],
            "warning": [
                {
                    "value": 0,
                    "condition": "eq",
                    "message": "Are you sure you want to continue with 0"
                }
            ],
            "max": 100000000,
            "min": 0,
            "decimal": 0,
            "autoSumValidation": "",
            "value": "",
            "status": "Na",
            "isDraft": true
        },
        {
            "key": "popApril2024",
            "readOnly": true,
            "class": "",
            "label": "Population as per 01 April 2024",
            "position": "4",
            "quesPos": 4,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "number",
            "canShow": true,
            "validations": [
                {
                    "name": "min",
                    "validator": 0,
                    "message": "Please enter a number between 0 and 100000000."
                },
                {
                    "name": "max",
                    "validator": 100000000,
                    "message": "Please enter a number between 0 and 100000000."
                },
                {
                    "name": "decimal",
                    "validator": 0,
                    "message": "Please enter a whole number for this field."
                }
            ],
            "warning": [
                {
                    "value": 0,
                    "condition": "eq",
                    "message": "Are you sure you want to continue with 0"
                }
            ],
            "max": 100000000,
            "min": 0,
            "decimal": 0,
            "autoSumValidation": "",
            "value": "",
            "status": "Na",
            "isDraft": true
        },
        {
            "key": "areaOfUlb",
            "readOnly": true,
            "class": "",
            "label": "Area of the ULB (in Sq. Km.)",
            "position": "5",
            "quesPos": 5,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "number",
            "canShow": true,
            "validations": [
                {
                    "name": "min",
                    "validator": 0.1,
                    "message": "Please enter a number between 0.1 and 1000."
                },
                {
                    "name": "max",
                    "validator": 1000,
                    "message": "Please enter a number between 0.1 and 1000."
                },
                {
                    "name": "decimal",
                    "validator": 2,
                    "message": "Please enter number with at most 2 places."
                }
            ],
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
            "autoSumValidation": "",
            "value": "",
            "status": "Na",
            "isDraft": true
        },
        {
            "key": "yearOfElection",
            "readOnly": true,
            "class": "",
            "label": "Which is the latest year when ULB's election was held?",
            "position": "6",
            "quesPos": 6,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "select",
            "canShow": true,
            "validations": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Please fill in this required field."
                }
            ],
            "options": [
                "2023-24",
                "2022-23",
                "2021-22",
                "2020-21",
                "2019-20",
                "2018-19",
                "2017-18",
                "2016-17",
                "2015-16",
                "Before 2015-16"
            ],
            "showInputBox": "",
            "inputBoxValue": "",
            "value": "",
            "status": "Na",
            "isDraft": true
        },
        {
            "key": "isElected",
            "readOnly": true,
            "class": "",
            "label": "Is the elected body in place as on 01 April 2024?",
            "position": "7",
            "quesPos": 7,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "radio",
            "canShow": true,
            "validations": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Please fill in this required field."
                }
            ],
            "options": [
                "Yes",
                "No"
            ],
            "inputBoxValue": "",
            "value": "",
            "status": "Na",
            "isDraft": true
        },
        {
            "key": "yearOfConstitution",
            "readOnly": true,
            "class": "",
            "label": "In which year was the ULB constituted?",
            "position": "8",
            "quesPos": 8,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "select",
            "canShow": true,
            "validations": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Please fill in this required field."
                }
            ],
            "options": [
                "2023-34",
                "2022-23",
                "2021-22",
                "2020-21",
                "2019-20",
                "2018-19",
                "2017-18",
                "2016-17",
                "In 2015-16",
                "Before 2015-16"
            ],
            "showInputBox": "",
            "inputBoxValue": "",
            "value": "Before 2015-16",
            "status": "Na",
            "isDraft": true
        }
    ]
};
const uploadDoc = {
    "_id": "666764fa1d285021388bedbc",
    "key": "uploadDoc",
    "icon": "",
    "formType": "form1",
    "label": "View/ Upload Document",
    "id": "s3",
    "displayPriority": 3,
    "__v": 0,
    "data": [
        {
            "key": "auditedAnnualFySt",
            "readOnly": true,
            "class": "",
            "label": "Copy of Audited Annual Financial Statements preferably in English",
            "position": "",
            "quesPos": 52,
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "file",
            "canShow": true,
            "validations": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Please fill in this required field."
                }
            ],
            "max": 20,
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
            "year": [],
            "status": "Na",
            "value": "",
            "isDraft": true
        }
    ]
};
const accountPractice = {
    "_id": "666764fa1d285021388bedbd",
    "key": "accountPractice",
    "icon": "",
    "formType": "form1",
    "label": "Accounting Practice",
    "id": "s4",
    "displayPriority": 4,
    "__v": 0,
    "data": [
        {
            "key": "accSysAndProcess",
            "section": "accordion",
            "formFieldType": "questionnaire",
            "label": "I. Accounting Systems and Processes",
            "data": [
                {
                    "key": "accSystem",
                    "readOnly": true,
                    "class": "",
                    "label": "What is the accounting system being followed by the ULB?",
                    "position": "1",
                    "quesPos": 53,
                    "required": true,
                    "info": {
                        "Cash basis of accounting": "Revenues and expenses are recognised/recorded when the related cash receipts or cash payments take place.",
                        "Accrual basis of accounting": "Revenues and expneses are  recognised/recorded as they are earned or incurred (and not as money is received or paid) and recorded in the financial statements of the periods to which they relate.",
                        "Modified": "Revenues are recognized/recorded when cash is received and expenses when they are paid, with the exception of capitalizing long-term assets and recording their related depreciation."
                    },
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "Cash Basis of Accounting"
                        },
                        {
                            "id": "Accrual Basis of Accounting"
                        },
                        {
                            "id": "Modified Cash/ Accrual Accounting"
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "accProvision",
                    "readOnly": true,
                    "class": "",
                    "label": "What accounting provisions or framework does the ULB follow?",
                    "position": "2",
                    "quesPos": 54,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "National Municipal Accounting Manual"
                        },
                        {
                            "id": "State-specific Municipal Accounting Manual"
                        },
                        {
                            "id": "Other (Please specify)",
                            "showInputBox": true,
                            "inputBoxValue": ""
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "accInCashBasis",
                    "readOnly": true,
                    "class": "",
                    "label": "Are there any accounts/books/registers maintained in cash basis?",
                    "position": "3",
                    "quesPos": 55,
                    "required": true,
                    "info": "Types of registers maintained: cash book, receipt register, register of bills for payment, collection register, deposit register, register of fixed assets etc.",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "Yes (Please specify)",
                            "showInputBox": true,
                            "inputBoxValue": ""
                        },
                        {
                            "id": "No"
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "fsTransactionRecord",
                    "readOnly": true,
                    "class": "",
                    "label": "Does the ULB initially record transactions on a cash basis and subsequently prepare accrual accounts for consolidation of financial statements?",
                    "position": "4",
                    "quesPos": 56,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "Yes"
                        },
                        {
                            "id": "No"
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "fsPreparedBy",
                    "readOnly": true,
                    "class": "",
                    "label": "Are the Financial Statements prepared internally by the ULB's accounting department, or are they compiled by an external Chartered Accountant?",
                    "position": "5",
                    "quesPos": 57,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "Internally (by Accounts Department)"
                        },
                        {
                            "id": "External Chartered Accountants"
                        },
                        {
                            "id": "Both"
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "revReceiptRecord",
                    "readOnly": true,
                    "class": "",
                    "label": "Is the revenue receipt recorded when the cash is received or when it is accrued/event occurs?",
                    "position": "6",
                    "quesPos": 58,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "Recorded when cash is received"
                        },
                        {
                            "id": "Recorded when they are accrued"
                        },
                        {
                            "id": "Both (Please specify which transactions are recognised in accrual basis)",
                            "showInputBox": true,
                            "inputBoxValue": ""
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "expRecord",
                    "readOnly": true,
                    "class": "",
                    "label": "Is the expense recorded when it is paid or when it is incurred/event occurs?",
                    "position": "7",
                    "quesPos": 59,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "Recorded when cash is paid"
                        },
                        {
                            "id": "Recorded when they are accrued"
                        },
                        {
                            "id": "Both (Please specify which transactions are recognised in accrual basis)",
                            "showInputBox": true,
                            "inputBoxValue": ""
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "accSoftware",
                    "readOnly": true,
                    "class": "",
                    "label": "What accounting software is currently in use by the ULB?",
                    "position": "8",
                    "quesPos": 60,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "Centralized system provided by the State"
                        },
                        {
                            "id": "Standalone software"
                        },
                        {
                            "id": "Tally"
                        },
                        {
                            "id": "Other (Please specify)",
                            "showInputBox": true,
                            "inputBoxValue": ""
                        },
                        {
                            "id": "None"
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "onlineAccSysIntegrate",
                    "readOnly": true,
                    "class": "",
                    "label": "Does the online accounting system integrate seamlessly with other municipal systems?",
                    "position": "9",
                    "quesPos": 61,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)",
                            "showInputBox": true,
                            "inputBoxValue": ""
                        },
                        {
                            "id": "No"
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "muniAudit",
                    "readOnly": true,
                    "class": "",
                    "label": "Who does the municipal audit of financial statements ?",
                    "position": "10",
                    "quesPos": 62,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "radio",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        }
                    ],
                    "options": [
                        {
                            "id": "External Chartered Accountant (CA)"
                        },
                        {
                            "id": "State Audit Department"
                        }
                    ],
                    "inputBoxValue": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                }
            ]
        },
        {
            "key": "staffing",
            "section": "accordion",
            "formFieldType": "questionnaire",
            "label": "II.Staffing - Finance & Accounts Department",
            "data": [
                {
                    "key": "totSanction",
                    "readOnly": true,
                    "class": "",
                    "label": "What is the total sanctioned posts for finance & accounts related positions?",
                    "position": "11",
                    "quesPos": 63,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "number",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "min",
                            "validator": 0,
                            "message": "Please enter a number between 0 and 9999."
                        },
                        {
                            "name": "max",
                            "validator": 9999,
                            "message": "Please enter a number between 0 and 9999."
                        },
                        {
                            "name": "decimal",
                            "validator": 0,
                            "message": "Please enter a whole number for this field."
                        }
                    ],
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
                    "autoSumValidation": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "totVacancy",
                    "readOnly": true,
                    "class": "",
                    "label": "What is the total vacancy across finance & accounts related positions?",
                    "position": "12",
                    "quesPos": 64,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "number",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "min",
                            "validator": 0,
                            "message": "Please enter a number between 0 and 9999."
                        },
                        {
                            "name": "max",
                            "validator": 9999,
                            "message": "Please enter a number between 0 and 9999."
                        },
                        {
                            "name": "decimal",
                            "validator": 0,
                            "message": "Please enter a whole number for this field."
                        }
                    ],
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
                    "autoSumValidation": "lessThan",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                },
                {
                    "key": "accPosition",
                    "readOnly": true,
                    "class": "",
                    "label": "How many finance & accounts related positions currently are filled on contractual basis or outsourced?",
                    "position": "13",
                    "quesPos": 65,
                    "required": true,
                    "info": "",
                    "placeHolder": "",
                    "formFieldType": "number",
                    "canShow": true,
                    "validations": [
                        {
                            "name": "min",
                            "validator": 0,
                            "message": "Please enter a number between 0 and 9999."
                        },
                        {
                            "name": "max",
                            "validator": 9999,
                            "message": "Please enter a number between 0 and 9999."
                        },
                        {
                            "name": "decimal",
                            "validator": 0,
                            "message": "Please enter a whole number for this field."
                        }
                    ],
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
                    "autoSumValidation": "",
                    "value": "",
                    "status": "Na",
                    "isDraft": true
                }
            ]
        }
    ]
};

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