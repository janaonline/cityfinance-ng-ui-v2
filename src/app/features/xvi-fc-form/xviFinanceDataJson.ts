const sourceOfFd = {
    key: "sourceOfFd",
    label: "",
    section: 'accordion',
    formFieldType: "table",
    "data": [
        {
            "label": "",
            key: 'sourceOfFd1',
            "position": "",
            "required": true,
            "info": "",
            "placeHolder": "",
            "canShow": true,
            "options": [
                "Accounts Finalized & Audited",
                "Accounts Finalized but Not Audited",
                "Accounts not Finalized - Provisional data"
            ],
            "showInputBox": "",
            "inputBoxValue": "",
            "yearType": 'dynamicYear',
            year: [
                {
                    "warning": [],
                    "label": "FY 2022-23",
                    "key": "2022-23",
                    "position": 1,
                    "type": "sourceOfFd",
                    "formFieldType": "heading",
                    "value": 6906
                },
                {
                    "warning": [],
                    "label": "FY 2021-22",
                    "key": "2021-22",
                    "position": 2,
                    "type": "sourceOfFd",
                    "formFieldType": "heading",
                    "value": 1604
                },
                {
                    "warning": [],
                    "label": "FY 2020-21",
                    "key": "2020-21",
                    "position": 3,
                    "type": "sourceOfFd",
                    "formFieldType": "heading",
                    "value": 3145
                },
                {
                    "warning": [],
                    "label": "FY 2019-20",
                    "key": "2019-20",
                    "position": 4,
                    "type": "sourceOfFd",
                    "formFieldType": "heading",
                    "value": 7967
                },
                {
                    "warning": [],
                    "label": "FY 2018-19",
                    "key": "2018-19",
                    "position": 5,
                    "type": "sourceOfFd",
                    "formFieldType": "heading",
                    "value": 476
                },
                {
                    "warning": [],
                    "label": "FY 2017-18",
                    "key": "2017-18",
                    "position": 6,
                    "type": "sourceOfFd",
                    "formFieldType": "heading",
                    "value": 832
                },
                {
                    "warning": [],
                    "label": "FY 2016-17",
                    "key": "2016-17",
                    "position": 7,
                    "type": "sourceOfFd",
                    "formFieldType": "heading",
                    "value": 2139
                },
                {
                    "warning": [],
                    "label": "FY 2015-16",
                    "key": "2015-16",
                    "position": 8,
                    "type": "sourceOfFd",
                    "formFieldType": "heading",
                    "value": 8888
                }
            ],
            "status": "Na",
            "value": "",
            "isDraft": true,
            "readonly": false
        },
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
    "key": 'revenue',
    "label": "I. REVENUE",
    "section": 'accordion',
    "formFieldType": "table",
    "data": [
        {
            "key": "taxRevenue",
            "label": "Tax Revenue",
            "position": "1.1",
            "class": "",
            "required": true,
            "info": "Tax revenue shall include property, water, drainage, sewerage,professional, entertainment and advertisment tax and all other tax revenues.",
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
                    "type": "taxRevenue",
                    "formFieldType": "amount",
                    "value": "321"
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
                    "type": "taxRevenue",
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
                    "type": "taxRevenue",
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
                    "type": "taxRevenue",
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
                    "type": "taxRevenue",
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
                    "type": "taxRevenue",
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
                    "type": "taxRevenue",
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
            "key": "feeAndUserCharges",
            "label": "Fee and User Charges",
            "position": "1.2",
            "class": "no-bold",
            "required": true,
            "info": "Fees & user charges shall include Water supply, Fees & Sanitation / Sewerage, Garbage collection / Solid waste management, and all other fees & user charges.",
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
                    "type": "feeAndUserCharges",
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
                    "type": "feeAndUserCharges",
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
                    "type": "feeAndUserCharges",
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
                    "type": "feeAndUserCharges",
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
                    "type": "feeAndUserCharges",
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
                    "type": "feeAndUserCharges",
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
                    "type": "feeAndUserCharges",
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
                    "type": "feeAndUserCharges",
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
            "key": "interestIncome",
            "label": "Interest Income",
            "position": "1.3",
            "class": "",
            "required": true,
            "info": "Interest income shall include sale from assets, land and other assets.",
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
                    "type": "interestIncome",
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
                    "type": "interestIncome",
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
                    "type": "interestIncome",
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
                    "type": "interestIncome",
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
                    "type": "interestIncome",
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
                    "type": "interestIncome",
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
                    "type": "interestIncome",
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
                    "type": "interestIncome",
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
            "key": "otherIncome",
            "label": "Other Income",
            "position": "1.4",
            "class": "border-secondary",
            "required": true,
            "info": "Other income shall include sale & hire charges, income from investments,interest earned, etc.",
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
                    "type": "otherIncome",
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
                    "type": "otherIncome",
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
                    "type": "otherIncome",
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
                    "type": "otherIncome",
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
                    "type": "otherIncome",
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
                    "type": "otherIncome",
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
                    "type": "otherIncome",
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
                    "type": "otherIncome",
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
            "key": "totOwnRevenue",
            "label": "Total Own Revenue",
            "position": "1",
            "class": "fw-bold border-primary",
            "required": true,
            "info": "Total own revenue shall include tax revenue, fees & user charges, interest income, and other income.",
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
            sumOf: ['taxRevenue', 'feeAndUserCharges', 'interestIncome', 'otherIncome'],
            "logic": [
                "1.1",
                "1.2",
                "1.3",
                "1.4"
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
                    "type": "totOwnRevenue",
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
                    "type": "totOwnRevenue",
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
                    "type": "totOwnRevenue",
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
                    "type": "totOwnRevenue",
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
                    "type": "totOwnRevenue",
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
                    "type": "totOwnRevenue",
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
                    "type": "totOwnRevenue",
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
                    "type": "totOwnRevenue",
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
            "key": "centralGrants",
            "label": "Grants for Centre's Initiatives ",
            "position": "2.1",
            "required": true,
            "info": "These grants shall include Union Finance Commission grants, Grants received for Centrally Sponsored Schemes (including state's matching share).",
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
                    "type": "centralGrants",
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
                    "type": "centralGrants",
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
                    "type": "centralGrants",
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
                    "type": "centralGrants",
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
                    "type": "centralGrants",
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
                    "type": "centralGrants",
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
                    "type": "centralGrants",
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
                    "type": "centralGrants",
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
            "key": "otherGrants",
            "label": "Other Grants (including State's grants)",
            "position": "2.2",
            "required": true,
            "info": "These grants shall include State Finance Commission grants, Other State ,Grants, Other grants etc.",
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
                    "type": "otherGrants",
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
                    "type": "otherGrants",
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
                    "type": "otherGrants",
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
                    "type": "otherGrants",
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
                    "type": "otherGrants",
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
                    "type": "otherGrants",
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
                    "type": "otherGrants",
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
                    "type": "otherGrants",
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
            "key": "totalGrants",
            "label": "Total Grants",
            "position": "2",
            "required": true,
            "info": "",
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
                "2.1",
                "2.2"
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
                    "type": "totalGrants",
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
                    "type": "totalGrants",
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
                    "type": "totalGrants",
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
                    "type": "totalGrants",
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
                    "type": "totalGrants",
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
                    "type": "totalGrants",
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
                    "type": "totalGrants",
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
                    "type": "totalGrants",
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
            "key": "assignedRevAndCom",
            "label": "Assigned Revenue and Compensation",
            "position": "3",
            "required": true,
            "info": "Assigned Revenue includes share in the revenues of the state government ,allocated to the ULB. This includes Entertainment Tax, Duty on Transfer of Properties,etc.",
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
                    "type": "assignedRevAndCom",
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
                    "type": "assignedRevAndCom",
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
                    "type": "assignedRevAndCom",
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
                    "type": "assignedRevAndCom",
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
                    "type": "assignedRevAndCom",
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
                    "type": "assignedRevAndCom",
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
                    "type": "assignedRevAndCom",
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
                    "type": "assignedRevAndCom",
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
            "key": "otherRevenue",
            "label": "Other Revenue",
            "position": "4",
            "required": true,
            "info": "Other Revenue shall include any other sources of revenue except own ,revenue, assigned revenue and grants",
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
                    "type": "otherRevenue",
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
                    "type": "otherRevenue",
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
                    "type": "otherRevenue",
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
                    "type": "otherRevenue",
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
                    "type": "otherRevenue",
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
                    "type": "otherRevenue",
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
                    "type": "otherRevenue",
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
                    "type": "otherRevenue",
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
            "key": "totalRevenue",
            "label": "Total Revenues",
            "position": "5",
            "required": true,
            "info": "Total Revenue is the sum of: (a) tax revenues, (b) non-tax revenues, (c) assigned (shared) revenue, (c) grants-in-aid, (d) other receipts, etc.",
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
                "1",
                "2",
                "3",
                "4"
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
                    "type": "totalRevenue",
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
                    "type": "totalRevenue",
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
                    "type": "totalRevenue",
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
                    "type": "totalRevenue",
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
                    "type": "totalRevenue",
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
                    "type": "totalRevenue",
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
                    "type": "totalRevenue",
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
                    "type": "totalRevenue",
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