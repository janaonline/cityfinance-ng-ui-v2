const sourceOfFd = {
    key: "sourceOfFd",
    label: "",
    section: 'accordion',
    formFieldType: "table",
    "data": [
        {
            "key": "sourceOfFd",
            "label": "Please select the source of Financial Data",
            "position": "",
            "required": true,
            "info": "",
            "placeHolder": "",
            "formFieldType": "select",
            "canShow": true,
            "options": [
                "Accounts Finalized & Audited",
                "Accounts Finalized but Not Audited",
                "Accounts not Finalized - Provisional data"
            ],
            "showInputBox": "",
            "inputBoxValue": "",
            "yearType": 'dynamicYear',
            "year": [
                {
                    "warning": [],
                    "label": "FY 2022-23",
                    "key": "2022-23",
                    "position": 1,
                    "type": "sourceOfFd",
                    "formFieldType": "select",
                    "value": "Accounts Finalized & Audited"
                },
                {
                    "warning": [],
                    "label": "FY 2021-22",
                    "key": "2021-22",
                    "position": 2,
                    "type": "sourceOfFd",
                    "formFieldType": "select",
                    "value": ""
                },
                {
                    "warning": [],
                    "label": "FY 2020-21",
                    "key": "2020-21",
                    "position": 3,
                    "type": "sourceOfFd",
                    "formFieldType": "select",
                    "value": ""
                },
                {
                    "warning": [],
                    "label": "FY 2019-20",
                    "key": "2019-20",
                    "position": 4,
                    "type": "sourceOfFd",
                    "formFieldType": "select",
                    "value": ""
                },
                {
                    "warning": [],
                    "label": "FY 2018-19",
                    "key": "2018-19",
                    "position": 5,
                    "type": "sourceOfFd",
                    "formFieldType": "select",
                    "value": ""
                },
                {
                    "warning": [],
                    "label": "FY 2017-18",
                    "key": "2017-18",
                    "position": 6,
                    "type": "sourceOfFd",
                    "formFieldType": "select",
                    "value": ""
                },
                {
                    "warning": [],
                    "label": "FY 2016-17",
                    "key": "2016-17",
                    "position": 7,
                    "type": "sourceOfFd",
                    "formFieldType": "select",
                    "value": ""
                },
                {
                    "warning": [],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "sourceOfFd",
                    "formFieldType": "select",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
            "isDraft": true,
            "readonly": false,
            validations: [
                {
                    name: "required",
                    validator: 'required',
                    message: "Please fill in this required field."
                }
            ]
        }]
};
const revenue = {
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
            sumOrder: 2,
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
            sumOrder: 1,
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
            sumOrder: 2,
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
            sumOrder: 1,
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
            sumOrder: 1,
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
            sumOrder: 3,
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
};
const expenditure = {
    "key": 'expenditure',
    "label": "II. EXPENDITURE",
    "section": 'accordion',
    "formFieldType": "table",
    "data": [
        {
            "key": "establishmentExp",
            "label": "Establishment Expenses",
            "position": "6.1",
            "required": true,
            "info": "Expenses directly incurred on human resources of the ULB such as ,wages, and employee benefits such as retirement and pensions are called establishment expenses",
            "placeHolder": "",
            "formFieldType": "amount",
            "canShow": true,
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
            "validation": "",
            "logic": "",
            "yearType": 'dynamicYear',
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "type": "establishmentExp",
                    "formFieldType": "amount",
                    "value": ""
                },
                {
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "establishmentExp",
                    "formFieldType": "amount",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
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
                    validator: -999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "max",
                    validator: 999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        },
        {
            "key": "oAndmExp",
            "label": "Operation and Maintenance Expenditure",
            "position": "6.2",
            "required": true,
            "info": "Operation and Maintenance Expenditure shall include O&M expense on water supply + O&M expense on sanitation / sewerage + All other O&M expenses.",
            "placeHolder": "",
            "formFieldType": "amount",
            "canShow": true,
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
            "validation": "",
            "logic": "",
            "yearType": 'dynamicYear',
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "type": "oAndmExp",
                    "formFieldType": "amount",
                    "value": ""
                },
                {
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "oAndmExp",
                    "formFieldType": "amount",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
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
                    validator: -999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "max",
                    validator: 999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        },
        {
            "key": "interestAndfinacialChar",
            "label": "Interest and Finance Charges",
            "position": "6.3",
            "required": true,
            "info": "Interest and Finance Charges shall include Interest on Loans from Central Govt, State Govt, International agencies, govt bodies, banks, bank charges and other financial expenses, etc.",
            "placeHolder": "",
            "formFieldType": "amount",
            "canShow": true,
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
            "validation": "",
            "logic": "",
            "yearType": 'dynamicYear',
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "type": "interestAndfinacialChar",
                    "formFieldType": "amount",
                    "value": ""
                },
                {
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "interestAndfinacialChar",
                    "formFieldType": "amount",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
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
                    validator: -999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "max",
                    validator: 999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        },
        {
            "key": "otherRevenueExp",
            "label": "Other Revenue Expenditure",
            "position": "6.4",
            "required": true,
            "info": "Other expenses shall include programme expenses, revenue grants, contributions & subsidies.",
            "placeHolder": "",
            "formFieldType": "amount",
            "canShow": true,
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
            "validation": "",
            "logic": "",
            "yearType": 'dynamicYear',
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "type": "otherRevenueExp",
                    "formFieldType": "amount",
                    "value": ""
                },
                {
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "otherRevenueExp",
                    "formFieldType": "amount",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
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
                    validator: -999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "max",
                    validator: 999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        },
        {
            "key": "totalRevenueExp",
            "label": "Total Revenue Expenditure",
            "position": "6",
            "required": true,
            "info": "Total expenditure shall include establishment expenses, operations & maintenance + interest & finance charges and other expenditure.",
            "placeHolder": "",
            "formFieldType": "amount",
            "canShow": true,
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
            "validation": "sum",
            "logic": [
                "6.1",
                "6.2",
                "6.3",
                "6.4"
            ],
            "yearType": 'dynamicYear',
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "type": "totalRevenueExp",
                    "formFieldType": "amount",
                    "value": ""
                },
                {
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "totalRevenueExp",
                    "formFieldType": "amount",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
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
                    validator: -999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "max",
                    validator: 999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        },
        {
            "key": "capExp",
            "label": "Capital Expenditure",
            "position": "7",
            "required": true,
            "info": "Capital Expenditure = (Closing Balance Gross Block + Closing Balance Capital Work in Progress) - (Opening Balance Gross Block + Opening Balance Capital Work in Progress)",
            "placeHolder": "",
            "formFieldType": "amount",
            "canShow": true,
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
            "validation": "",
            "logic": "",
            "yearType": 'dynamicYear',
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "type": "capExp",
                    "formFieldType": "amount",
                    "value": ""
                },
                {
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "capExp",
                    "formFieldType": "amount",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
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
                    validator: -999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "max",
                    validator: 999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        },
        {
            "key": "totalExp",
            "label": "Total Expenditure",
            "position": "8",
            "required": true,
            "info": "Total Expenditure = Revenue Expenditure + Capital Expenditure",
            "placeHolder": "",
            "formFieldType": "amount",
            "canShow": true,
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
            "validation": "sum",
            "logic": [
                "6",
                "7"
            ],
            "yearType": 'dynamicYear',
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "type": "totalExp",
                    "formFieldType": "amount",
                    "value": ""
                },
                {
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "totalExp",
                    "formFieldType": "amount",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
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
                    validator: -999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "max",
                    validator: 999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        }
    ]
};
const borrowings = {
    "key": 'borrowings',
    "label": "III. BORROWINGS",
    "section": 'accordion',
    "formFieldType": "table",
    "data": [
        {
            "key": "grossBorrowing",
            "label": "Gross Borrowings",
            "position": "9",
            "required": true,
            "info": "Gross Borrowings = Sum of All Secured and Unsecured Loans",
            "placeHolder": "",
            "formFieldType": "amount",
            "canShow": true,
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
            "validation": "",
            "logic": "",
            "yearType": 'dynamicYear',
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "value": ""
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
                    "type": "grossBorrowing",
                    "formFieldType": "amount",
                    "value": ""
                },
                {
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "grossBorrowing",
                    "formFieldType": "amount",
                    "value": ""
                }
            ],
            "status": "Na",
            "value": "",
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
                    validator: -999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "max",
                    validator: 999999999999999,
                    message: "Please enter a valid number with at most 15 digits."
                },
                {
                    name: "decimal",
                    validator: 0,
                    message: "Please enter a whole number for this field."
                }
            ]
        }
    ]
};
export const financialData = {
    "_id": "6657921b9ab1c13ac44d01f5",
    "key": "financialData",
    "icon": "",
    "text": "",
    "formType": "form1",
    "label": "Financial Data",
    "id": "s2",
    "displayPriority": 2,
    "__v": 0,
    "data": [
        sourceOfFd,
        revenue,
        expenditure,
        borrowings,
    ]
}