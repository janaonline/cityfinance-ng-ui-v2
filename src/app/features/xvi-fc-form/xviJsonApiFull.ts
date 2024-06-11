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
                "_id": "666764fa1d285021388bedba",
                "key": "demographicData",
                "icon": "",
                "formType": "form2",
                "label": "Demographic Data",
                "id": "s1",
                "displayPriority": 1,
                "__v": 0,
                "data": [
                    {
                        "key": "nameOfUlb",
                        "readonly": true,
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
                        "value": "Gondia Municipal Council",
                        "status": "Na",
                        "isDraft": true
                    },
                    {
                        "key": "nameOfState",
                        "readonly": true,
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
                        "value": "Maharashtra",
                        "status": "Na",
                        "isDraft": true
                    },
                    {
                        "key": "pop2011",
                        "readonly": false,
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
                        "value": 1000,
                        "status": "Na",
                        "isDraft": true
                    },
                    {
                        "key": "popApril2024",
                        "readonly": false,
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
                        "value": 1000,
                        "status": "Na",
                        "isDraft": true
                    },
                    {
                        "key": "areaOfUlb",
                        "readonly": false,
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
                        "value": 10.12,
                        "status": "Na",
                        "isDraft": true
                    },
                    {
                        "key": "yearOfElection",
                        "readonly": false,
                        "class": "",
                        "label": "Which is the latest year when ULB's election was held?",
                        "position": "6",
                        "quesPos": 6,
                        "required": true,
                        "info": "",
                        "placeHolder": "",
                        "formFieldType": "dropdown",
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
                        "value": "2020",
                        "status": "Na",
                        "isDraft": true
                    },
                    {
                        "key": "isElected",
                        "readonly": false,
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
                        "value": "Yes",
                        "status": "Na",
                        "isDraft": true
                    },
                    {
                        "key": "yearOfConstitution",
                        "readonly": false,
                        "class": "",
                        "label": "In which year was the ULB constituted?",
                        "position": "8",
                        "quesPos": 8,
                        "required": true,
                        "info": "",
                        "placeHolder": "",
                        "formFieldType": "dropdown",
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
                        "value": "2016-17",
                        "status": "Na",
                        "isDraft": true
                    },
                    {
                        "key": "yearOfSlb",
                        "readonly": false,
                        "class": "",
                        "label": "From which year is Service Level Benchmark data available?",
                        "position": "9",
                        "quesPos": 9,
                        "required": true,
                        "info": "",
                        "placeHolder": "",
                        "formFieldType": "dropdown",
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
                            "2015-16"
                        ],
                        "showInputBox": "",
                        "inputBoxValue": "",
                        "value": "2016-17",
                        "status": "Na",
                        "isDraft": true
                    }
                ]
            },
            {
                "_id": "666764fa1d285021388bedbb",
                "key": "financialData",
                "icon": "",
                "formType": "form2",
                "label": "Financial Data",
                "id": "s2",
                "displayPriority": 2,
                "__v": 0,
                "data": [
                    {
                        "key": "commonPrimaryKey",
                        "section": "accordion",
                        "formFieldType": "table",
                        "label": "",
                        "data": [
                            {
                                "key": "sourceOfFd",
                                "readonly": false,
                                "class": "",
                                "label": "Please select the source of Financial Data",
                                "position": "",
                                "quesPos": 10,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "dropdown",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "required",
                                        "validator": "required",
                                        "message": "Please fill in this required field."
                                    }
                                ],
                                "options": [
                                    "Accounts Finalized & Audited",
                                    "Accounts Finalized but Not Audited",
                                    "Accounts not Finalized - Provisional data"
                                ],
                                "showInputBox": "",
                                "inputBoxValue": "",
                                "year": [
                                    {
                                        "warning": [],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "sourceOfFd",
                                        "formFieldType": "dropdown",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "sourceOfFd",
                                        "formFieldType": "dropdown",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "sourceOfFd",
                                        "formFieldType": "dropdown",
                                        "value": 202
                                    },
                                    {
                                        "warning": [],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "sourceOfFd",
                                        "formFieldType": "dropdown",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "sourceOfFd",
                                        "formFieldType": "dropdown",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "sourceOfFd",
                                        "formFieldType": "dropdown",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ]
                    },
                    {
                        "key": "revenue",
                        "section": "accordion",
                        "formFieldType": "table",
                        "label": "I. REVENUE",
                        "data": [
                            {
                                "key": "totOwnRevenue",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Total Own Revenue",
                                "position": "1",
                                "quesPos": 11,
                                "required": true,
                                "info": "Total own revenue shall include tax revenue, fees & user charges, interest income, and other income.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "taxRevenue",
                                    "feeAndUserCharges",
                                    "interestIncome",
                                    "otherIncome",
                                    "rentalIncome"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "totOwnRevenue",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "totOwnRevenue",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "totOwnRevenue",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "totOwnRevenue",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "totOwnRevenue",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "totOwnRevenue",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "taxRevenue",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Tax Revenue",
                                "position": "1.1",
                                "quesPos": 12,
                                "required": true,
                                "info": "Tax revenue shall include property, water, drainage, sewerage,professional, entertainment and advertisment tax and all other tax revenues.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "pTax",
                                    "otherTax"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "taxRevenue",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "taxRevenue",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "taxRevenue",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "taxRevenue",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "taxRevenue",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "taxRevenue",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "pTax",
                                "readonly": false,
                                "class": "",
                                "label": "Property Tax",
                                "position": "1.1.1",
                                "quesPos": 13,
                                "required": true,
                                "info": "Property tax shall include only proprty tax levied on residential and commercial properties",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "pTax",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "pTax",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "pTax",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "pTax",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "pTax",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "pTax",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "noOfRegiProperty",
                                "readonly": false,
                                "class": "",
                                "label": "Number of registered properties",
                                "position": "1.1.2",
                                "quesPos": 14,
                                "required": true,
                                "info": "Please enter the total number of properties that have been officially registered",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 2000000."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 2000000,
                                        "message": "Please enter a number between 0 and 2000000."
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
                                "max": 2000000,
                                "min": 0,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "noOfRegiProperty",
                                        "formFieldType": "number",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "noOfRegiProperty",
                                        "formFieldType": "number",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "noOfRegiProperty",
                                        "formFieldType": "number",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "noOfRegiProperty",
                                        "formFieldType": "number",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "noOfRegiProperty",
                                        "formFieldType": "number",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "noOfRegiProperty",
                                        "formFieldType": "number",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "otherTax",
                                "readonly": false,
                                "class": "",
                                "label": "Other Tax",
                                "position": "1.1.3",
                                "quesPos": 15,
                                "required": true,
                                "info": "Other Tax shall include any tax other than property tax levied by the ULB",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "otherTax",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "otherTax",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "otherTax",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "otherTax",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "otherTax",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "otherTax",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "feeAndUserCharges",
                                "readonly": false,
                                "class": "",
                                "label": "Fee and User Charges",
                                "position": "1.2",
                                "quesPos": 16,
                                "required": true,
                                "info": "Fees & user charges shall include Water supply, Fees & Sanitation / Sewerage, Garbage collection / Solid waste management, and all other fees & user charges.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "feeAndUserCharges",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "feeAndUserCharges",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "feeAndUserCharges",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "feeAndUserCharges",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "feeAndUserCharges",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "feeAndUserCharges",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "interestIncome",
                                "readonly": false,
                                "class": "",
                                "label": "Interest Income",
                                "position": "1.3",
                                "quesPos": 17,
                                "required": true,
                                "info": "Interest income shall include sale from assets, land and other assets.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "interestIncome",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "interestIncome",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "interestIncome",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "interestIncome",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "interestIncome",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "interestIncome",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "otherIncome",
                                "readonly": false,
                                "class": "",
                                "label": "Other Income",
                                "position": "1.4",
                                "quesPos": 18,
                                "required": true,
                                "info": "Other income shall include sale & hire charges, income from investments,interest earned, etc.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "otherIncome",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "otherIncome",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "otherIncome",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "otherIncome",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "otherIncome",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "otherIncome",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "rentalIncome",
                                "readonly": false,
                                "class": "",
                                "label": "Rental Income from Municipal Properties",
                                "position": "1.5",
                                "quesPos": 19,
                                "required": true,
                                "info": "Rental Income shall include rental incomes earned out of shopping complexes, markets, office buildings, etc",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "rentalIncome",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "rentalIncome",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "rentalIncome",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "rentalIncome",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "rentalIncome",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "rentalIncome",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "totalGrants",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Total Grants",
                                "position": "2",
                                "quesPos": 20,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "centralGrants",
                                    "otherGrants"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "totalGrants",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "totalGrants",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "totalGrants",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "totalGrants",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "totalGrants",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "totalGrants",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "centralGrants",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Grants for Centre's Initiatives ",
                                "position": "2.1",
                                "quesPos": 21,
                                "required": true,
                                "info": "These grants shall include Union Finance Commission grants, Grants received for Centrally Sponsored Schemes (including state's matching share).",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "centralSponsoredScheme",
                                    "unionFinanceGrants"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "centralGrants",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "centralGrants",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "centralGrants",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "centralGrants",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "centralGrants",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "centralGrants",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "centralSponsoredScheme",
                                "readonly": false,
                                "class": "",
                                "label": "Centrally Sponsored Schemes (Total Centre and State Share)",
                                "position": "2.1.1",
                                "quesPos": 22,
                                "required": true,
                                "info": "Centrally Sponsored Scheme shall include  Grants received for Centrally Sponsored Schemes (including state's matching share)",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "centralSponsoredScheme",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "centralSponsoredScheme",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "centralSponsoredScheme",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "centralSponsoredScheme",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "centralSponsoredScheme",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "centralSponsoredScheme",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "unionFinanceGrants",
                                "readonly": false,
                                "class": "",
                                "label": "Union Finance Commission Grants",
                                "position": "2.1.2",
                                "quesPos": 23,
                                "required": true,
                                "info": "Union Finance Commission Grants shall include Union Finance Commission grants",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "unionFinanceGrants",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "unionFinanceGrants",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "unionFinanceGrants",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "unionFinanceGrants",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "unionFinanceGrants",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "unionFinanceGrants",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "otherGrants",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Other Grants (including State's grants)",
                                "position": "2.2",
                                "quesPos": 24,
                                "required": true,
                                "info": "These grants shall include State Finance Commission grants, Other State ,Grants, Other grants etc.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "sfcGrants",
                                    "grantsOtherThanSfc",
                                    "grantsWithoutState"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "otherGrants",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "otherGrants",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "otherGrants",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "otherGrants",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "otherGrants",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "otherGrants",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "sfcGrants",
                                "readonly": false,
                                "class": "",
                                "label": "State Finance Commission Devolution and Grants",
                                "position": "2.2.1",
                                "quesPos": 25,
                                "required": true,
                                "info": "State Finance Commission Devolution and Grants shall include State Finance Commission grants",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "sfcGrants",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "sfcGrants",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "sfcGrants",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "sfcGrants",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "sfcGrants",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "sfcGrants",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "grantsOtherThanSfc",
                                "readonly": false,
                                "class": "",
                                "label": "Grants from State (other than SFC)",
                                "position": "2.2.2",
                                "quesPos": 26,
                                "required": true,
                                "info": "Grants from State shall include  Other State Grants (excluding State Finance Commission grants)",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "grantsOtherThanSfc",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "grantsOtherThanSfc",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "grantsOtherThanSfc",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "grantsOtherThanSfc",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "grantsOtherThanSfc",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "grantsOtherThanSfc",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "assignedRevAndCom",
                                "readonly": false,
                                "class": "",
                                "label": "Assigned Revenue and Compensation",
                                "position": "3",
                                "quesPos": 28,
                                "required": true,
                                "info": "Assigned Revenue includes share in the revenues of the state government ,allocated to the ULB. This includes Entertainment Tax, Duty on Transfer of Properties,etc.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "assignedRevAndCom",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "assignedRevAndCom",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "assignedRevAndCom",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "assignedRevAndCom",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "assignedRevAndCom",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "assignedRevAndCom",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "otherRevenue",
                                "readonly": false,
                                "class": "",
                                "label": "Other Revenue",
                                "position": "4",
                                "quesPos": 29,
                                "required": true,
                                "info": "Other Revenue shall include any other sources of revenue except own ,revenue, assigned revenue and grants",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "otherRevenue",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "otherRevenue",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "otherRevenue",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "otherRevenue",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "otherRevenue",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "otherRevenue",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "totalRevenue",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Total Revenues",
                                "position": "5",
                                "quesPos": 30,
                                "required": true,
                                "info": "Total Revenue is the sum of: (a) tax revenues, (b) non-tax revenues, (c) assigned (shared) revenue, (c) grants-in-aid, (d) other receipts, etc.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "totOwnRevenue",
                                    "totalGrants",
                                    "assignedRevAndCom",
                                    "otherRevenue"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "totalRevenue",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "totalRevenue",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "totalRevenue",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "totalRevenue",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "totalRevenue",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "totalRevenue",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ]
                    },
                    {
                        "key": "expenditure",
                        "section": "accordion",
                        "formFieldType": "table",
                        "label": "II. EXPENDITURE",
                        "data": [
                            {
                                "key": "totalRevenueExp",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Total Revenue Expenditure",
                                "position": "6",
                                "quesPos": 31,
                                "required": true,
                                "info": "Total expenditure shall include establishment expenses, operations & maintenance + interest & finance charges and other expenditure.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "establishmentExp",
                                    "oAndmExp",
                                    "interestAndfinacialChar",
                                    "otherRevenueExp",
                                    "adExp"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "totalRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "totalRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "totalRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "totalRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "totalRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "totalRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "establishmentExp",
                                "readonly": false,
                                "class": "",
                                "label": "Establishment Expenses",
                                "position": "6.1",
                                "quesPos": 33,
                                "required": true,
                                "info": "Expenses directly incurred on human resources of the ULB such as ,wages, and employee benefits such as retirement and pensions are called establishment expenses",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "salaries",
                                    "pension",
                                    "otherExp"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "establishmentExp",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "establishmentExp",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "establishmentExp",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "establishmentExp",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "establishmentExp",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "establishmentExp",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "salaries",
                                "readonly": false,
                                "class": "",
                                "label": "Salaries, Bonus and Wages",
                                "position": "6.1.1",
                                "quesPos": 33,
                                "required": true,
                                "info": "Salaries, Bonus & Wages shall include expenses directly incurred on human resources of the ULB such as wages, salaries and bonus",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "salaries",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "salaries",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "salaries",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "salaries",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "salaries",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "salaries",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "pension",
                                "readonly": false,
                                "class": "",
                                "label": "Pension",
                                "position": "6.1.2",
                                "quesPos": 34,
                                "required": true,
                                "info": "Pension shall include expenses directly incurred on human resources of the ULB such as pension",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "pension",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "pension",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "pension",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "pension",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "pension",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "pension",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "otherExp",
                                "readonly": false,
                                "class": "",
                                "label": "Others",
                                "position": "6.1.3",
                                "quesPos": 35,
                                "required": true,
                                "info": "Others shall include any other expenses directly incurred on human resources of the ULB",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "otherExp",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "otherExp",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "otherExp",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "otherExp",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "otherExp",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "otherExp",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "oAndmExp",
                                "readonly": false,
                                "class": "",
                                "label": "Operation and Maintenance Expenditure",
                                "position": "6.2",
                                "quesPos": 36,
                                "required": true,
                                "info": "Operation and Maintenance Expenditure shall include O&M expense on water supply + O&M expense on sanitation / sewerage + All other O&M expenses.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "oAndmExp",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "oAndmExp",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "oAndmExp",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "oAndmExp",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "oAndmExp",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "oAndmExp",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "interestAndfinacialChar",
                                "readonly": false,
                                "class": "",
                                "label": "Interest and Finance Charges",
                                "position": "6.3",
                                "quesPos": 37,
                                "required": true,
                                "info": "Interest and Finance Charges shall include Interest on Loans from Central Govt, State Govt, International agencies, govt bodies, banks, bank charges and other financial expenses, etc.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "interestAndfinacialChar",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "interestAndfinacialChar",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "interestAndfinacialChar",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "interestAndfinacialChar",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "interestAndfinacialChar",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "interestAndfinacialChar",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "otherRevenueExp",
                                "readonly": false,
                                "class": "",
                                "label": "Other Revenue Expenditure",
                                "position": "6.4",
                                "quesPos": 38,
                                "required": true,
                                "info": "Other expenses shall include programme expenses, revenue grants, contributions & subsidies.",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "otherRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "otherRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "otherRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "otherRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "otherRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "otherRevenueExp",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "adExp",
                                "readonly": false,
                                "class": "",
                                "label": "Administrative Expenses",
                                "position": "6.5",
                                "quesPos": 39,
                                "required": true,
                                "info": "Administrative Expenses shall include Indirect expenses  which relate to the ULB as a whole, such as Rents, Rates & Taxes, Office maintenance, Communications, Books & periodicals, Printing & Stationary, Travel Expenditure, Law Charges etc. ",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "adExp",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "adExp",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "adExp",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "adExp",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "adExp",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "adExp",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "capExp",
                                "readonly": false,
                                "class": "",
                                "label": "Capital Expenditure",
                                "position": "7",
                                "quesPos": 40,
                                "required": true,
                                "info": "Capital Expenditure = (Closing Balance Gross Block + Closing Balance Capital Work in Progress) - (Opening Balance Gross Block + Opening Balance Capital Work in Progress)",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "capExp",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "capExp",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "capExp",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "capExp",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "capExp",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "capExp",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "totalExp",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Total Expenditure",
                                "position": "8",
                                "quesPos": 41,
                                "required": true,
                                "info": "Total Expenditure = Revenue Expenditure + Capital Expenditure",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "totalRevenueExp",
                                    "capExp"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "totalExp",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "totalExp",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "totalExp",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "totalExp",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "totalExp",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "totalExp",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ]
                    },
                    {
                        "key": "borrowings",
                        "section": "accordion",
                        "formFieldType": "table",
                        "label": "III. BORROWINGS",
                        "data": [
                            {
                                "key": "grossBorrowing",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Gross Borrowings",
                                "position": "9",
                                "quesPos": 42,
                                "required": true,
                                "info": "Gross Borrowings = Sum of All Secured and Unsecured Loans",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
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
                                "sumOf": [
                                    "centralStateBorrow",
                                    "bonds",
                                    "bankAndFinancial",
                                    "otherBorrowing"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": 0,
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "grossBorrowing",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "grossBorrowing",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "grossBorrowing",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "grossBorrowing",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "grossBorrowing",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "grossBorrowing",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "centralStateBorrow",
                                "readonly": false,
                                "class": "",
                                "label": "Central and State Government",
                                "position": "9.1",
                                "quesPos": 43,
                                "required": true,
                                "info": "Central and State Government includes the sum of All Secured and Unsecured Loans from Central and State Government",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "centralStateBorrow",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "centralStateBorrow",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "centralStateBorrow",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "centralStateBorrow",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "centralStateBorrow",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "centralStateBorrow",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "bonds",
                                "readonly": false,
                                "class": "",
                                "label": "Bonds",
                                "position": "9.2",
                                "quesPos": 44,
                                "required": true,
                                "info": "Bonds includes the sum of bond amounts issued by the ULB",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "bonds",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "bonds",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "bonds",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "bonds",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "bonds",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "bonds",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "bankAndFinancial",
                                "readonly": false,
                                "class": "",
                                "label": "Banks and Financial Institutions",
                                "position": "9.3",
                                "quesPos": 45,
                                "required": true,
                                "info": "Banks and Financial Institutions includes the sum of all secured and Unsecured Loans from banks and other financial institution",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "bankAndFinancial",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "bankAndFinancial",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "bankAndFinancial",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "bankAndFinancial",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "bankAndFinancial",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "bankAndFinancial",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "otherBorrowing",
                                "readonly": false,
                                "class": "",
                                "label": "Others",
                                "position": "9.4",
                                "quesPos": 46,
                                "required": true,
                                "info": "Others includes the sum of all other types of loans",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "otherBorrowing",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "otherBorrowing",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "otherBorrowing",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "otherBorrowing",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "otherBorrowing",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "otherBorrowing",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ]
                    },
                    {
                        "key": "receivables",
                        "section": "accordion",
                        "formFieldType": "table",
                        "label": "IV. RECEIVABLES",
                        "data": [
                            {
                                "key": "totalReceivable",
                                "readonly": true,
                                "class": " fw-bold",
                                "label": "Total Receivables",
                                "position": "10",
                                "quesPos": 47,
                                "required": true,
                                "info": "Total Receivables is the sum of total amounts due for taxes, goods sold or services rendered by ULB",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "sumOf": [
                                    "receivablePTax",
                                    "receivableFee",
                                    "otherReceivable"
                                ],
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "sum",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "totalReceivable",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "totalReceivable",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "totalReceivable",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "totalReceivable",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "totalReceivable",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "totalReceivable",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "receivablePTax",
                                "readonly": false,
                                "class": "",
                                "label": "Receivables for Property Tax",
                                "position": "10.1",
                                "quesPos": 48,
                                "required": true,
                                "info": "Receivables for Property Tax includes total amounts due towards property taxes",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "receivablePTax",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "receivablePTax",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "receivablePTax",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "receivablePTax",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "receivablePTax",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "receivablePTax",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "receivableFee",
                                "readonly": false,
                                "class": "",
                                "label": "Receivables for Fee and User Charges",
                                "position": "10.2",
                                "quesPos": 49,
                                "required": true,
                                "info": "Receivables for Fee and User Chargesincludes total amounts due towards fee and user charges",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "receivableFee",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "receivableFee",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "receivableFee",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "receivableFee",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "receivableFee",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "receivableFee",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "otherReceivable",
                                "readonly": false,
                                "class": "",
                                "label": "Other Receivables",
                                "position": "10.3",
                                "quesPos": 50,
                                "required": true,
                                "info": "Other Receivables shall include any other amount due for taxes, goods sold or services rendered by ULB",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "otherReceivable",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "otherReceivable",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "otherReceivable",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "otherReceivable",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "otherReceivable",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "otherReceivable",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ]
                    },
                    {
                        "key": "cashAndBank",
                        "section": "accordion",
                        "formFieldType": "table",
                        "label": "V. CASH and BANK BALANCE",
                        "data": [
                            {
                                "key": "totalCashAndBankBal",
                                "readonly": false,
                                "class": "",
                                "label": "Total Cash and Bank Balance",
                                "position": "11",
                                "quesPos": 51,
                                "required": true,
                                "info": "Total Cash & Bank Balance shall include cash held by the ULB and any money held in any bank/post office by the ULB (including municipal fund, special fund and grant funds)",
                                "placeHolder": "",
                                "formFieldType": "amount",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": -999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999999999999999,
                                        "message": "Please enter a valid number with at most 15 digits."
                                    },
                                    {
                                        "name": "decimal",
                                        "validator": "",
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
                                "max": 999999999999999,
                                "min": -999999999999999,
                                "decimal": "",
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "totalCashAndBankBal",
                                        "formFieldType": "amount",
                                        "value": 5782
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "totalCashAndBankBal",
                                        "formFieldType": "amount",
                                        "value": 5103
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "totalCashAndBankBal",
                                        "formFieldType": "amount",
                                        "value": 202
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "totalCashAndBankBal",
                                        "formFieldType": "amount",
                                        "value": 8748
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "totalCashAndBankBal",
                                        "formFieldType": "amount",
                                        "value": 7594
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "totalCashAndBankBal",
                                        "formFieldType": "amount",
                                        "value": 5515
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ]
                    }
                ]
            },
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
                                "label": "FY 2022-23",
                                "key": "2022-23",
                                "position": 1,
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
                                "verifyStatus": 1,
                                "rejectOption": "",
                                "rejectReason": "",
                                "allowedFileTypes": [
                                    "pdf"
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
                                "value": "Cash Basis of Accounting",
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
                                        "inputBoxValue": ""
                                    }
                                ],
                                "inputBoxValue": "",
                                "value": "National Municipal Accounting Manual",
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
                                        "inputBoxValue": ""
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
                                        "inputBoxValue": ""
                                    }
                                ],
                                "inputBoxValue": "",
                                "value": "Recorded when cash is received",
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
                                        "inputBoxValue": ""
                                    },
                                    {
                                        "id": "No"
                                    }
                                ],
                                "inputBoxValue": "",
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
                                "value": 525,
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
                                "value": 380,
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
                                "value": 619,
                                "status": "Na",
                                "isDraft": true
                            }
                        ]
                    }
                ]
            },
            {
                "_id": "666764fa1d285021388bedbe",
                "key": "serviceLevelBenchmark",
                "icon": "",
                "formType": "form2",
                "label": "Service Level Benchmark Data",
                "id": "s5",
                "displayPriority": 5,
                "__v": 0,
                "data": [
                    {
                        "key": "waterSupply",
                        "section": "accordion",
                        "formFieldType": "table",
                        "data": [
                            {
                                "key": "coverageOfWs",
                                "readonly": false,
                                "class": "",
                                "label": "Coverage of water supply connections (%)",
                                "position": 1,
                                "quesPos": 66,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "coverageOfWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "coverageOfWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "coverageOfWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "coverageOfWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "coverageOfWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "coverageOfWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "coverageOfWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "perCapitaOfWs",
                                "readonly": false,
                                "class": "",
                                "label": "Per capita supply of water(lpcd)",
                                "position": 2,
                                "quesPos": 67,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 999."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 999,
                                        "message": "Please enter a number between 0 and 999."
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
                                "max": 999,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "perCapitaOfWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "perCapitaOfWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "perCapitaOfWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "perCapitaOfWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "perCapitaOfWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "perCapitaOfWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "perCapitaOfWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "extentOfMeteringWs",
                                "readonly": false,
                                "class": "",
                                "label": "Extent of metering of water connections (%)",
                                "position": 3,
                                "quesPos": 68,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "extentOfMeteringWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "extentOfMeteringWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "extentOfMeteringWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "extentOfMeteringWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "extentOfMeteringWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "extentOfMeteringWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "extentOfMeteringWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "extentOfNonRevenueWs",
                                "readonly": false,
                                "class": "",
                                "label": "Extent of non-revenue water (NRW) (%)",
                                "position": 4,
                                "quesPos": 69,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "extentOfNonRevenueWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "extentOfNonRevenueWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "extentOfNonRevenueWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "extentOfNonRevenueWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "extentOfNonRevenueWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "extentOfNonRevenueWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "extentOfNonRevenueWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "continuityOfWs",
                                "readonly": false,
                                "class": "",
                                "label": "Continuity of water supplied (hours)",
                                "position": 5,
                                "quesPos": 70,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 24."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 24,
                                        "message": "Please enter a number between 0 and 24."
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
                                "max": 24,
                                "min": 0,
                                "decimal": 0,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "continuityOfWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "continuityOfWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "continuityOfWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "continuityOfWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "continuityOfWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "continuityOfWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "continuityOfWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "efficiencyInRedressalCustomerWs",
                                "readonly": false,
                                "class": "",
                                "label": "Efficiency in redressal of customer complaints related to water supply (%)",
                                "position": 6,
                                "quesPos": 71,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "efficiencyInRedressalCustomerWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "efficiencyInRedressalCustomerWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "efficiencyInRedressalCustomerWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "efficiencyInRedressalCustomerWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "efficiencyInRedressalCustomerWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "efficiencyInRedressalCustomerWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "efficiencyInRedressalCustomerWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "qualityOfWs",
                                "readonly": false,
                                "class": "",
                                "label": "Quality of water supplied (%)",
                                "position": 7,
                                "quesPos": 72,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "qualityOfWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "qualityOfWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "qualityOfWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "qualityOfWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "qualityOfWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "qualityOfWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "qualityOfWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "costRecoveryInWs",
                                "readonly": false,
                                "class": "",
                                "label": "Cost recovery in water supply service (%)",
                                "position": 8,
                                "quesPos": 73,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "costRecoveryInWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "costRecoveryInWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "costRecoveryInWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "costRecoveryInWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "costRecoveryInWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "costRecoveryInWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "costRecoveryInWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "efficiencyInCollectionRelatedWs",
                                "readonly": false,
                                "class": "",
                                "label": "Efficiency in collection of water supply-related charges (%)",
                                "position": 9,
                                "quesPos": 74,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "efficiencyInCollectionRelatedWs",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "efficiencyInCollectionRelatedWs",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "efficiencyInCollectionRelatedWs",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "efficiencyInCollectionRelatedWs",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "efficiencyInCollectionRelatedWs",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "efficiencyInCollectionRelatedWs",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "efficiencyInCollectionRelatedWs",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ],
                        "label": "I. WATER SUPPLY"
                    },
                    {
                        "key": "sewerage",
                        "section": "accordion",
                        "formFieldType": "table",
                        "data": [
                            {
                                "key": "coverageOfToiletsSew",
                                "readonly": false,
                                "class": "",
                                "label": "Coverage of toilets (%)",
                                "position": 10,
                                "quesPos": 75,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "coverageOfToiletsSew",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "coverageOfToiletsSew",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "coverageOfToiletsSew",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "coverageOfToiletsSew",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "coverageOfToiletsSew",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "coverageOfToiletsSew",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "coverageOfToiletsSew",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "coverageOfSewNet",
                                "readonly": false,
                                "class": "",
                                "label": "Coverage of sewerage network (%)",
                                "position": 11,
                                "quesPos": 76,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "coverageOfSewNet",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "coverageOfSewNet",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "coverageOfSewNet",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "coverageOfSewNet",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "coverageOfSewNet",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "coverageOfSewNet",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "coverageOfSewNet",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "collectionEfficiencySew",
                                "readonly": false,
                                "class": "",
                                "label": "Collection efficiency of sewerage network (%)",
                                "position": 12,
                                "quesPos": 77,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "collectionEfficiencySew",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "collectionEfficiencySew",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "collectionEfficiencySew",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "collectionEfficiencySew",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "collectionEfficiencySew",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "collectionEfficiencySew",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "collectionEfficiencySew",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "adequacyOfSew",
                                "readonly": false,
                                "class": "",
                                "label": "Adequacy of sewerage treatment capacity (%)",
                                "position": 13,
                                "quesPos": 78,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "adequacyOfSew",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "adequacyOfSew",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "adequacyOfSew",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "adequacyOfSew",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "adequacyOfSew",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "adequacyOfSew",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "adequacyOfSew",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "qualityOfSew",
                                "readonly": false,
                                "class": "",
                                "label": "Quality of sewerage treatment (%)",
                                "position": 14,
                                "quesPos": 79,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "qualityOfSew",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "qualityOfSew",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "qualityOfSew",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "qualityOfSew",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "qualityOfSew",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "qualityOfSew",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "qualityOfSew",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "extentOfReuseSew",
                                "readonly": false,
                                "class": "",
                                "label": "Extent of reuse and recycling of sewage (%)",
                                "position": 15,
                                "quesPos": 80,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "extentOfReuseSew",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "extentOfReuseSew",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "extentOfReuseSew",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "extentOfReuseSew",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "extentOfReuseSew",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "extentOfReuseSew",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "extentOfReuseSew",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "efficiencyInRedressalCustomerSew",
                                "readonly": false,
                                "class": "",
                                "label": "Efficiency in redressal of customer complaints related to sewerage (%)",
                                "position": 16,
                                "quesPos": 81,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "efficiencyInRedressalCustomerSew",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "efficiencyInRedressalCustomerSew",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "efficiencyInRedressalCustomerSew",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "efficiencyInRedressalCustomerSew",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "efficiencyInRedressalCustomerSew",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "efficiencyInRedressalCustomerSew",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "efficiencyInRedressalCustomerSew",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "extentOfCostWaterSew",
                                "readonly": false,
                                "class": "",
                                "label": "Extent of cost recovery in waste water management (%)",
                                "position": 17,
                                "quesPos": 82,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "extentOfCostWaterSew",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "extentOfCostWaterSew",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "extentOfCostWaterSew",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "extentOfCostWaterSew",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "extentOfCostWaterSew",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "extentOfCostWaterSew",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "extentOfCostWaterSew",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "efficiencyInCollectionSew",
                                "readonly": false,
                                "class": "",
                                "label": "Efficiency in collection of sewage water charges (%)",
                                "position": 18,
                                "quesPos": 83,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "efficiencyInCollectionSew",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "efficiencyInCollectionSew",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "efficiencyInCollectionSew",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "efficiencyInCollectionSew",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "efficiencyInCollectionSew",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "efficiencyInCollectionSew",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "efficiencyInCollectionSew",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ],
                        "label": "II. SEWERAGE"
                    },
                    {
                        "key": "solidWaste",
                        "section": "accordion",
                        "formFieldType": "table",
                        "data": [
                            {
                                "key": "householdLevelCoverageLevelSwm",
                                "readonly": false,
                                "class": "",
                                "label": "Household level coverage (%)",
                                "position": 19,
                                "quesPos": 84,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "householdLevelCoverageLevelSwm",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "householdLevelCoverageLevelSwm",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "householdLevelCoverageLevelSwm",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "householdLevelCoverageLevelSwm",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "householdLevelCoverageLevelSwm",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "householdLevelCoverageLevelSwm",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "householdLevelCoverageLevelSwm",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "efficiencyOfCollectionSwm",
                                "readonly": false,
                                "class": "",
                                "label": "Efficiency of collection of municipal solid waste (%)",
                                "position": 20,
                                "quesPos": 85,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "efficiencyOfCollectionSwm",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "efficiencyOfCollectionSwm",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "efficiencyOfCollectionSwm",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "efficiencyOfCollectionSwm",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "efficiencyOfCollectionSwm",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "efficiencyOfCollectionSwm",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "efficiencyOfCollectionSwm",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "extentOfSegregationSwm",
                                "readonly": false,
                                "class": "",
                                "label": "Extent of segregation of municipal solid waste (%)",
                                "position": 21,
                                "quesPos": 86,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "extentOfSegregationSwm",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "extentOfSegregationSwm",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "extentOfSegregationSwm",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "extentOfSegregationSwm",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "extentOfSegregationSwm",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "extentOfSegregationSwm",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "extentOfSegregationSwm",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "extentOfMunicipalSwm",
                                "readonly": false,
                                "class": "",
                                "label": "Extent of municipal solid waste recovered (%)",
                                "position": 22,
                                "quesPos": 87,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "extentOfMunicipalSwm",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "extentOfMunicipalSwm",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "extentOfMunicipalSwm",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "extentOfMunicipalSwm",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "extentOfMunicipalSwm",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "extentOfMunicipalSwm",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "extentOfMunicipalSwm",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "extentOfScientificSolidSwm",
                                "readonly": false,
                                "class": "",
                                "label": "Extent of scientific disposal of municipal solid waste (%)",
                                "position": 23,
                                "quesPos": 88,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "extentOfScientificSolidSwm",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "extentOfScientificSolidSwm",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "extentOfScientificSolidSwm",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "extentOfScientificSolidSwm",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "extentOfScientificSolidSwm",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "extentOfScientificSolidSwm",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "extentOfScientificSolidSwm",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "extentOfCostInSwm",
                                "readonly": false,
                                "class": "",
                                "label": "Extent of cost recovery in SWM services (%)",
                                "position": 24,
                                "quesPos": 89,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "extentOfCostInSwm",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "extentOfCostInSwm",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "extentOfCostInSwm",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "extentOfCostInSwm",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "extentOfCostInSwm",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "extentOfCostInSwm",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "extentOfCostInSwm",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "efficiencyInCollectionSwmUser",
                                "readonly": false,
                                "class": "",
                                "label": "Efficiency in collection of SWM user charges (%)",
                                "position": 25,
                                "quesPos": 90,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "efficiencyInCollectionSwmUser",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "efficiencyInCollectionSwmUser",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "efficiencyInCollectionSwmUser",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "efficiencyInCollectionSwmUser",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "efficiencyInCollectionSwmUser",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "efficiencyInCollectionSwmUser",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "efficiencyInCollectionSwmUser",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "efficiencyInRedressalCustomerSwm",
                                "readonly": false,
                                "class": "",
                                "label": "Efficiency in redressal of customer complaints related to SWM (%)",
                                "position": 26,
                                "quesPos": 91,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "efficiencyInRedressalCustomerSwm",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "efficiencyInRedressalCustomerSwm",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "efficiencyInRedressalCustomerSwm",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "efficiencyInRedressalCustomerSwm",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "efficiencyInRedressalCustomerSwm",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "efficiencyInRedressalCustomerSwm",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "efficiencyInRedressalCustomerSwm",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ],
                        "label": "III. SOLID WASTE MANAGEMENT"
                    },
                    {
                        "key": "stromWater",
                        "section": "accordion",
                        "formFieldType": "table",
                        "data": [
                            {
                                "key": "coverageOfStormDrainage",
                                "readonly": false,
                                "class": "",
                                "label": "Coverage of storm water drainage network (%)",
                                "position": 27,
                                "quesPos": 92,
                                "required": true,
                                "info": "",
                                "placeHolder": "",
                                "formFieldType": "number",
                                "canShow": true,
                                "validations": [
                                    {
                                        "name": "min",
                                        "validator": 0,
                                        "message": "Please enter a number between 0 and 100."
                                    },
                                    {
                                        "name": "max",
                                        "validator": 100,
                                        "message": "Please enter a number between 0 and 100."
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
                                "max": 100,
                                "min": 0,
                                "decimal": 2,
                                "autoSumValidation": "",
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "coverageOfStormDrainage",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "coverageOfStormDrainage",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "coverageOfStormDrainage",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "coverageOfStormDrainage",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "coverageOfStormDrainage",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "coverageOfStormDrainage",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "coverageOfStormDrainage",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            },
                            {
                                "key": "incidenceOfWaterLogging",
                                "readonly": false,
                                "class": "",
                                "label": "Incidence of water logging",
                                "position": 28,
                                "quesPos": 93,
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
                                "year": [
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2022-23",
                                        "key": "2022-23",
                                        "position": 1,
                                        "type": "incidenceOfWaterLogging",
                                        "formFieldType": "number",
                                        "value": 50
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2021-22",
                                        "key": "2021-22",
                                        "position": 2,
                                        "type": "incidenceOfWaterLogging",
                                        "formFieldType": "number",
                                        "value": 91
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2020-21",
                                        "key": "2020-21",
                                        "position": 3,
                                        "type": "incidenceOfWaterLogging",
                                        "formFieldType": "number",
                                        "value": 98
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2019-20",
                                        "key": "2019-20",
                                        "position": 4,
                                        "type": "incidenceOfWaterLogging",
                                        "formFieldType": "number",
                                        "value": 72
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2018-19",
                                        "key": "2018-19",
                                        "position": 5,
                                        "type": "incidenceOfWaterLogging",
                                        "formFieldType": "number",
                                        "value": 88
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2017-18",
                                        "key": "2017-18",
                                        "position": 6,
                                        "type": "incidenceOfWaterLogging",
                                        "formFieldType": "number",
                                        "value": 84
                                    },
                                    {
                                        "warning": [
                                            {
                                                "value": 0,
                                                "condition": "eq",
                                                "message": "Are you sure you want to continue with 0"
                                            }
                                        ],
                                        "label": "FY 2016-17",
                                        "key": "2016-17",
                                        "position": 7,
                                        "type": "incidenceOfWaterLogging",
                                        "formFieldType": "number",
                                        "value": 37
                                    }
                                ],
                                "status": "Na",
                                "value": "",
                                "isDraft": true
                            }
                        ],
                        "label": "IV. STROM WATER DRAINAGE"
                    }
                ]
            }
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
};