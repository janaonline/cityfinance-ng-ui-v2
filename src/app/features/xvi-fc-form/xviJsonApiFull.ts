export const tabsJson = {
    "status": true,
    "message": "Sucessfully fetched form 2",
    "data": {
        "ulb": "5dd24e98cc3ddc04b552b7d4",
        "ulbName": "Gondia Municipal Council",
        "censusCode": "802716",
        "sbCode": null,
        "stateId": "5dcf9d7416a06aed41c748f0",
        "stateName": "Maharashtra",
        "tabs": [
            {
                "_id": "666764fa1d285021388bedbc",
                "key": "uploadDoc",
                "icon": "",
                "formType": "form2",
                "label": "View/ Upload Document",
                "id": "s3",
                "displayPriority": 3,
                "__v": 0,
                "data": [
                    {
                        "key": "auditedAnnualFySt",
                        "readonly": false,
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
                        "year": [
                            {
                                "warning": [],
                                "label": "FY 2019-20",
                                "key": "fy2019-20_auditedAnnualFySt",
                                "postion": 4,
                                "type": "auditedAnnualFySt",
                                "formFieldType": "file",
                                "value": "",
                                "isPdfAvailable": true,
                                isVerifiedStatus: 3,
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
                                "label": "FY 2021-22",
                                "key": "2021-22",
                                "position": 2,
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
                                ],
                                "verifyStatus": 1,
                                "rejectOption": "",
                                "rejectReason": "",
                                "allowedFileTypes": [
                                    "pdf"
                                ]
                            },
                            {
                                "warning": [],
                                "label": "FY 2020-21",
                                "key": "2020-21",
                                "position": 3,
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
                                ],
                                "verifyStatus": 1,
                                "rejectOption": "",
                                "rejectReason": "",
                                "allowedFileTypes": [
                                    "pdf"
                                ]
                            },
                            {
                                "warning": [],
                                "label": "FY 2019-20",
                                "key": "2019-20",
                                "position": 4,
                                "type": "auditedAnnualFySt",
                                "formFieldType": "file",
                                "value": "",
                                "isPdfAvailable": false,
                                "file": {
                                    "name": "testName2019-20",
                                    "url": "https://www.test.com/2019-20.pdf"
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
                                "verifyStatus": 1,
                                "rejectOption": "",
                                "rejectReason": "",
                                "allowedFileTypes": [
                                    "pdf"
                                ]
                            },
                            {
                                "warning": [],
                                "label": "FY 2018-19",
                                "key": "2018-19",
                                "position": 5,
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
                                ],
                                "verifyStatus": 1,
                                "rejectOption": "",
                                "rejectReason": "",
                                "allowedFileTypes": [
                                    "pdf"
                                ]
                            },
                            {
                                "warning": [],
                                "label": "FY 2017-18",
                                "key": "2017-18",
                                "position": 6,
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
                                ],
                                "verifyStatus": 1,
                                "rejectOption": "",
                                "rejectReason": "",
                                "allowedFileTypes": [
                                    "pdf"
                                ]
                            }
                        ],
                        "status": "Na",
                        "value": "",
                        "isDraft": true
                    }
                ]
            },
            {
                "_id": "666764fa1d285021388bedbd",
                "key": "accountPractice",
                "icon": "",
                "formType": "form2",
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
                                "readonly": false,
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
                                "value": "Accrual Basis of Accounting",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "accProvision",
                                "readonly": false,
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
                                        "inputBoxValue": "Alpha beta gama"
                                    }
                                ],
                                "inputBoxValue": "",
                                "value": "Other (Please specify)",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "accInCashBasis",
                                "readonly": false,
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
                                        "inputBoxValue": "Alpha beta charlie"
                                    },
                                    {
                                        "id": "No"
                                    }
                                ],
                                "inputBoxValue": "",
                                "value": "Yes (Please specify)",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "fsTransactionRecord",
                                "readonly": false,
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
                                "value": "Yes",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "fsPreparedBy",
                                "readonly": false,
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
                                "value": "Internally (by Accounts Department)",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "revReceiptRecord",
                                "readonly": false,
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
                                        "inputBoxValue": "a;jg;aiejien"
                                    }
                                ],
                                "inputBoxValue": "",
                                reason: 'aslkjfhlakjhfkj',
                                "value": "Both (Please specify which transactions are recognised in accrual basis)",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "expRecord",
                                "readonly": false,
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
                                reason: '432',
                                "value": "Recorded when cash is paid",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "accSoftware",
                                "readonly": false,
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
                                reason: '432',
                                "value": "Centralized system provided by the State",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "onlineAccSysIntegrate",
                                "readonly": false,
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
                                        "inputBoxValue": "afeefae"
                                    },
                                    {
                                        "id": "No"
                                    }
                                ],
                                "inputBoxValue": "afeefae",
                                "value": "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)",
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "muniAudit",
                                "readonly": false,
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
                                "value": "External Chartered Accountant (CA)",
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
                                "readonly": false,
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
                                "value": 123,
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "totVacancy",
                                "readonly": false,
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
                                "value": 234,
                                "status": "Na",
                                "isDraft": true
                            },
                            {
                                "key": "accPosition",
                                "readonly": false,
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
                                "value": 45,
                                "status": "Na",
                                "isDraft": true
                            }
                        ]
                    }
                ]
            },

        ],
        "validationCounter": 0,
        "financialYearTableHeader": [
            "2022-23",
            "2021-22",
            "2020-21",
            "2019-20",
            "2018-19",
            "2017-18",
            "2016-17",
            "2015-16"
        ]
    }
}