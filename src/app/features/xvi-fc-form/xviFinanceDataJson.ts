// const sourceOfFd = {
//     key: "sourceOfFd",
//     label: "",
//     section: 'accordion',
//     formFieldType: "table",
//     "data": [
//         {
//             "key": "sourceOfFd",
//             "label": "Please select the source of Financial Data",
//             "position": "",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "select",
//             "canShow": true,
//             "options": [
//                 "Accounts Finalized & Audited",
//                 "Accounts Finalized but Not Audited",
//                 "Accounts not Finalized - Provisional data"
//             ],
//             "showInputBox": "",
//             "inputBoxValue": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "sourceOfFd",
//                     "formFieldType": "select",
//                     "value": "Accounts Finalized & Audited"
//                 },
//                 {
//                     "warning": [],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "sourceOfFd",
//                     "formFieldType": "select",
//                     "value": ""
//                 },
//                 {
//                     "warning": [],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "sourceOfFd",
//                     "formFieldType": "select",
//                     "value": ""
//                 },
//                 {
//                     "warning": [],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "sourceOfFd",
//                     "formFieldType": "select",
//                     "value": ""
//                 },
//                 {
//                     "warning": [],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "sourceOfFd",
//                     "formFieldType": "select",
//                     "value": ""
//                 },
//                 {
//                     "warning": [],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "sourceOfFd",
//                     "formFieldType": "select",
//                     "value": ""
//                 },
//                 {
//                     "warning": [],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "sourceOfFd",
//                     "formFieldType": "select",
//                     "value": ""
//                 },
//                 {
//                     "warning": [],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "sourceOfFd",
//                     "formFieldType": "select",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
//             "isDraft": true,
//             "readonly": false,
//             validations: [
//                 {
//                     name: "required",
//                     validator: 'required',
//                     message: "Please fill in this required field."
//                 }
//             ]
//         }]
// };

// const revenue = {
//     "key": 'revenue',
//     "label": "I. REVENUE",
//     "section": 'accordion',
//     "formFieldType": "table",
//     "data": [
//         {
//             "key": "taxRevenue",
//             "label": "Tax Revenue",
//             "position": "1.1",
//             "class": "",
//             "required": true,
//             "info": "Tax revenue shall include property, water, drainage, sewerage,professional, entertainment and advertisment tax and all other tax revenues.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "taxRevenue",
//                     "formFieldType": "amount",
//                     "value": "321"
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "taxRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "taxRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "taxRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "taxRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "taxRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "taxRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "taxRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "feeAndUserCharges",
//             "label": "Fee and User Charges",
//             "position": "1.2",
//             "class": "no-bold",
//             "required": true,
//             "info": "Fees & user charges shall include Water supply, Fees & Sanitation / Sewerage, Garbage collection / Solid waste management, and all other fees & user charges.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "feeAndUserCharges",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "feeAndUserCharges",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "feeAndUserCharges",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "feeAndUserCharges",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "feeAndUserCharges",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "feeAndUserCharges",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "feeAndUserCharges",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "feeAndUserCharges",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "interestIncome",
//             "label": "Interest Income",
//             "position": "1.3",
//             "class": "",
//             "required": true,
//             "info": "Interest income shall include sale from assets, land and other assets.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "interestIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "interestIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "interestIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "interestIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "interestIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "interestIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "interestIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "interestIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "otherIncome",
//             "label": "Other Income",
//             "position": "1.4",
//             "class": "border-secondary",
//             "required": true,
//             "info": "Other income shall include sale & hire charges, income from investments,interest earned, etc.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "otherIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "otherIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "otherIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "otherIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "otherIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "otherIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "otherIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "otherIncome",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "totOwnRevenue",
//             "label": "Total Own Revenue",
//             "position": "1",
//             "class": "fw-bold border-primary",
//             "required": true,
//             "info": "Total own revenue shall include tax revenue, fees & user charges, interest income, and other income.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "sum",
//             sumOf: ['taxRevenue', 'feeAndUserCharges', 'interestIncome', 'otherIncome'],
//             "logic": [
//                 "1.1",
//                 "1.2",
//                 "1.3",
//                 "1.4"
//             ],
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "totOwnRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "totOwnRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "totOwnRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "totOwnRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "totOwnRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "totOwnRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "totOwnRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "totOwnRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "centralGrants",
//             "label": "Grants for Centre's Initiatives ",
//             "position": "2.1",
//             "required": true,
//             "info": "These grants shall include Union Finance Commission grants, Grants received for Centrally Sponsored Schemes (including state's matching share).",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "centralGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "centralGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "centralGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "centralGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "centralGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "centralGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "centralGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "centralGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "otherGrants",
//             "label": "Other Grants (including State's grants)",
//             "position": "2.2",
//             "required": true,
//             "info": "These grants shall include State Finance Commission grants, Other State ,Grants, Other grants etc.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "otherGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "otherGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "otherGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "otherGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "otherGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "otherGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "otherGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "otherGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "totalGrants",
//             "label": "Total Grants",
//             "position": "2",
//             "required": true,
//             "info": "",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "sum",
//             "logic": [
//                 "2.1",
//                 "2.2"
//             ],
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "totalGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "totalGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "totalGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "totalGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "totalGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "totalGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "totalGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "totalGrants",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "assignedRevAndCom",
//             "label": "Assigned Revenue and Compensation",
//             "position": "3",
//             "required": true,
//             "info": "Assigned Revenue includes share in the revenues of the state government ,allocated to the ULB. This includes Entertainment Tax, Duty on Transfer of Properties,etc.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "assignedRevAndCom",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "assignedRevAndCom",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "assignedRevAndCom",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "assignedRevAndCom",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "assignedRevAndCom",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "assignedRevAndCom",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "assignedRevAndCom",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "assignedRevAndCom",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "otherRevenue",
//             "label": "Other Revenue",
//             "position": "4",
//             "required": true,
//             "info": "Other Revenue shall include any other sources of revenue except own ,revenue, assigned revenue and grants",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "otherRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "otherRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "otherRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "otherRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "otherRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "otherRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "otherRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "otherRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "totalRevenue",
//             "label": "Total Revenues",
//             "position": "5",
//             "required": true,
//             "info": "Total Revenue is the sum of: (a) tax revenues, (b) non-tax revenues, (c) assigned (shared) revenue, (c) grants-in-aid, (d) other receipts, etc.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "sum",
//             "logic": [
//                 "1",
//                 "2",
//                 "3",
//                 "4"
//             ],
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "totalRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "totalRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "totalRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "totalRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "totalRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "totalRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "totalRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "totalRevenue",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         }
//     ]
// };
// const expenditure = {
//     "key": 'expenditure',
//     "label": "II. EXPENDITURE",
//     "section": 'accordion',
//     "formFieldType": "table",
//     "data": [
//         {
//             "key": "establishmentExp",
//             "label": "Establishment Expenses",
//             "position": "6.1",
//             "required": true,
//             "info": "Expenses directly incurred on human resources of the ULB such as ,wages, and employee benefits such as retirement and pensions are called establishment expenses",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "establishmentExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "establishmentExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "establishmentExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "establishmentExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "establishmentExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "establishmentExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "establishmentExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "establishmentExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "oAndmExp",
//             "label": "Operation and Maintenance Expenditure",
//             "position": "6.2",
//             "required": true,
//             "info": "Operation and Maintenance Expenditure shall include O&M expense on water supply + O&M expense on sanitation / sewerage + All other O&M expenses.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "oAndmExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "oAndmExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "oAndmExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "oAndmExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "oAndmExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "oAndmExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "oAndmExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "oAndmExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "interestAndfinacialChar",
//             "label": "Interest and Finance Charges",
//             "position": "6.3",
//             "required": true,
//             "info": "Interest and Finance Charges shall include Interest on Loans from Central Govt, State Govt, International agencies, govt bodies, banks, bank charges and other financial expenses, etc.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "interestAndfinacialChar",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "interestAndfinacialChar",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "interestAndfinacialChar",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "interestAndfinacialChar",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "interestAndfinacialChar",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "interestAndfinacialChar",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "interestAndfinacialChar",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "interestAndfinacialChar",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "otherRevenueExp",
//             "label": "Other Revenue Expenditure",
//             "position": "6.4",
//             "required": true,
//             "info": "Other expenses shall include programme expenses, revenue grants, contributions & subsidies.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "otherRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "otherRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "otherRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "otherRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "otherRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "otherRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "otherRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "otherRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "totalRevenueExp",
//             "label": "Total Revenue Expenditure",
//             "position": "6",
//             "required": true,
//             "info": "Total expenditure shall include establishment expenses, operations & maintenance + interest & finance charges and other expenditure.",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "sum",
//             "logic": [
//                 "6.1",
//                 "6.2",
//                 "6.3",
//                 "6.4"
//             ],
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "totalRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "totalRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "totalRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "totalRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "totalRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "totalRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "totalRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "totalRevenueExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "capExp",
//             "label": "Capital Expenditure",
//             "position": "7",
//             "required": true,
//             "info": "Capital Expenditure = (Closing Balance Gross Block + Closing Balance Capital Work in Progress) - (Opening Balance Gross Block + Opening Balance Capital Work in Progress)",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "capExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "capExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "capExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "capExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "capExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "capExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "capExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "capExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         },
//         {
//             "key": "totalExp",
//             "label": "Total Expenditure",
//             "position": "8",
//             "required": true,
//             "info": "Total Expenditure = Revenue Expenditure + Capital Expenditure",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "sum",
//             "logic": [
//                 "6",
//                 "7"
//             ],
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "totalExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "totalExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "totalExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "totalExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "totalExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "totalExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "totalExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "totalExp",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         }
//     ]
// };
// const borrowings = {
//     "key": 'borrowings',
//     "label": "III. BORROWINGS",
//     "section": 'accordion',
//     "formFieldType": "table",
//     "data": [
//         {
//             "key": "grossBorrowing",
//             "label": "Gross Borrowings",
//             "position": "9",
//             "required": true,
//             "info": "Gross Borrowings = Sum of All Secured and Unsecured Loans",
//             "placeHolder": "",
//             "formFieldType": "amount",
//             "canShow": true,
//             "warning": [
//                 {
//                     "value": 0,
//                     "condition": "eq",
//                     "message": "Are you sure you want to continue with 0"
//                 }
//             ],
//             "max": 999999999999999,
//             "min": -999999999999999,
//             "decimal": 0,
//             "validation": "",
//             "logic": "",
//             "yearType": 'dynamicYear',
//             "year": [
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2022-23",
//                     "key": "2022-23",
//                     "position": 1,
//                     "type": "grossBorrowing",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2021-22",
//                     "key": "2021-22",
//                     "position": 2,
//                     "type": "grossBorrowing",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2020-21",
//                     "key": "2020-21",
//                     "position": 3,
//                     "type": "grossBorrowing",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2019-20",
//                     "key": "2019-20",
//                     "position": 4,
//                     "type": "grossBorrowing",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2018-19",
//                     "key": "2018-19",
//                     "position": 5,
//                     "type": "grossBorrowing",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2017-18",
//                     "key": "2017-18",
//                     "position": 6,
//                     "type": "grossBorrowing",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2016-17",
//                     "key": "2016-17",
//                     "position": 7,
//                     "type": "grossBorrowing",
//                     "formFieldType": "amount",
//                     "value": ""
//                 },
//                 {
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "label": "FY 2015-16",
//                     "key": "2015-16",
//                     "position": 8,
//                     "type": "grossBorrowing",
//                     "formFieldType": "amount",
//                     "value": ""
//                 }
//             ],
//             "status": "Na",
//             "value": "",
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
//                     validator: -999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "max",
//                     validator: 999999999999999,
//                     message: "Please enter a valid number with at most 15 digits."
//                 },
//                 {
//                     name: "decimal",
//                     validator: 0,
//                     message: "Please enter a whole number for this field."
//                 }
//             ]
//         }
//     ]
// };

const sourceOfFd = {
  key: 'commonPrimaryKey',
  section: 'accordion',
  formFieldType: 'table',
  label: '',
  data: [
    {
      key: 'sourceOfFd',
      readOnly: false,
      class: '',
      label: 'Please select the source of Financial Data',
      position: '',
      quesPos: 10,
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
        'Accounts Finalized & Audited',
        'Accounts Finalized but Not Audited',
        'Accounts not Finalized - Provisional data',
      ],
      showInputBox: '',
      inputBoxValue: '',
      year: [
        {
          warning: [],
          label: 'FY 2022-23',
          key: 'fy2022-23_sourceOfFd',
          position: 1,
          type: 'sourceOfFd',
          formFieldType: 'dropdown',
          value: '6906',
        },
        {
          warning: [],
          label: 'FY 2021-22',
          key: 'fy2021-22_sourceOfFd',
          position: 2,
          type: 'sourceOfFd',
          formFieldType: 'dropdown',
          value: '1604',
        },
        {
          warning: [],
          label: 'FY 2020-21',
          key: 'fy2020-21_sourceOfFd',
          position: 3,
          type: 'sourceOfFd',
          formFieldType: 'dropdown',
          value: '3145',
        },
        {
          warning: [],
          label: 'FY 2019-20',
          key: 'fy2019-20_sourceOfFd',
          position: 4,
          type: 'sourceOfFd',
          formFieldType: 'dropdown',
          value: '7967',
        },
        {
          warning: [],
          label: 'FY 2018-19',
          key: 'fy2018-19_sourceOfFd',
          position: 5,
          type: 'sourceOfFd',
          formFieldType: 'dropdown',
          value: '476',
        },
        {
          warning: [],
          label: 'FY 2017-18',
          key: 'fy2017-18_sourceOfFd',
          position: 6,
          type: 'sourceOfFd',
          formFieldType: 'dropdown',
          value: '832',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
  ],
};
const revenue = {
  key: 'revenue',
  section: 'accordion',
  formFieldType: 'table',
  label: 'I. REVENUE',
  data: [
    {
      key: 'totOwnRevenue',
      readOnly: true,
      class: ' fw-bold',
      label: 'Total Own Revenue',
      position: '1',
      quesPos: 11,
      required: true,
      info: 'Total own revenue shall include tax revenue, fees & user charges, interest income, and other income.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: [
        'taxRevenue',
        'feeAndUserCharges',
        'interestIncome',
        'otherIncome',
        'Rental Income from Municipal Properties',
      ],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      validation: 'sum',
      totalSumOf: ['taxRevenue', 'feeAndUserCharges', 'interestIncome', 'otherIncome'],
      logic: ['1.1', '1.2', '1.3', '1.4'],
      yearType: 'dynamicYear',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_totOwnRevenue',
          position: 1,
          type: 'totOwnRevenue',
          formFieldType: 'amount',
          value: 7264,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_totOwnRevenue',
          position: 2,
          type: 'totOwnRevenue',
          formFieldType: 'amount',
          value: 4920,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_totOwnRevenue',
          position: 3,
          type: 'totOwnRevenue',
          formFieldType: 'amount',
          value: 5302,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_totOwnRevenue',
          position: 4,
          type: 'totOwnRevenue',
          formFieldType: 'amount',
          value: 2245,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_totOwnRevenue',
          position: 5,
          type: 'totOwnRevenue',
          formFieldType: 'amount',
          value: 7434,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_totOwnRevenue',
          position: 6,
          type: 'totOwnRevenue',
          formFieldType: 'amount',
          value: 8109,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'taxRevenue',
      readOnly: true,
      class: ' fw-bold',
      label: 'Tax Revenue',
      position: '1.1',
      quesPos: 12,
      required: true,
      info: 'Tax revenue shall include property, water, drainage, sewerage,professional, entertainment and advertisment tax and all other tax revenues.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: ['pTax', 'otherTax'],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: 'sum',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_taxRevenue',
          position: 1,
          type: 'taxRevenue',
          formFieldType: 'amount',
          value: 4109,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_taxRevenue',
          position: 2,
          type: 'taxRevenue',
          formFieldType: 'amount',
          value: 8012,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_taxRevenue',
          position: 3,
          type: 'taxRevenue',
          formFieldType: 'amount',
          value: 9400,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_taxRevenue',
          position: 4,
          type: 'taxRevenue',
          formFieldType: 'amount',
          value: 779,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_taxRevenue',
          position: 5,
          type: 'taxRevenue',
          formFieldType: 'amount',
          value: 3580,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_taxRevenue',
          position: 6,
          type: 'taxRevenue',
          formFieldType: 'amount',
          value: 4020,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'pTax',
      readOnly: false,
      class: '',
      label: 'Property Tax',
      position: '1.1.1',
      quesPos: 13,
      required: true,
      info: 'Property tax shall include only proprty tax levied on residential and commercial properties',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_pTax',
          position: 1,
          type: 'pTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_pTax',
          position: 2,
          type: 'pTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_pTax',
          position: 3,
          type: 'pTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_pTax',
          position: 4,
          type: 'pTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_pTax',
          position: 5,
          type: 'pTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_pTax',
          position: 6,
          type: 'pTax',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'noOfRegiProperty',
      readOnly: false,
      class: '',
      label: 'Number of registered properties',
      position: '1.1.2',
      quesPos: 14,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'number',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: 0,
          message: 'Please enter a number between 0 and 0.',
        },
        {
          name: 'max',
          validator: 0,
          message: 'Please enter a number between 0 and 0.',
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
      max: 0,
      min: 0,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_noOfRegiProperty',
          position: 1,
          type: 'noOfRegiProperty',
          formFieldType: 'number',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_noOfRegiProperty',
          position: 2,
          type: 'noOfRegiProperty',
          formFieldType: 'number',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_noOfRegiProperty',
          position: 3,
          type: 'noOfRegiProperty',
          formFieldType: 'number',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_noOfRegiProperty',
          position: 4,
          type: 'noOfRegiProperty',
          formFieldType: 'number',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_noOfRegiProperty',
          position: 5,
          type: 'noOfRegiProperty',
          formFieldType: 'number',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_noOfRegiProperty',
          position: 6,
          type: 'noOfRegiProperty',
          formFieldType: 'number',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'otherTax',
      readOnly: false,
      class: '',
      label: 'Other Tax',
      position: '1.1.3',
      quesPos: 15,
      required: true,
      info: 'Other Tax shall include any tax other than property tax levied by the ULB',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_otherTax',
          position: 1,
          type: 'otherTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_otherTax',
          position: 2,
          type: 'otherTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_otherTax',
          position: 3,
          type: 'otherTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_otherTax',
          position: 4,
          type: 'otherTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_otherTax',
          position: 5,
          type: 'otherTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_otherTax',
          position: 6,
          type: 'otherTax',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'feeAndUserCharges',
      readOnly: false,
      class: '',
      label: 'Fee and User Charges',
      position: '1.2',
      quesPos: 16,
      required: true,
      info: 'Fees & user charges shall include Water supply, Fees & Sanitation / Sewerage, Garbage collection / Solid waste management, and all other fees & user charges.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_feeAndUserCharges',
          position: 1,
          type: 'feeAndUserCharges',
          formFieldType: 'amount',
          value: 9321,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_feeAndUserCharges',
          position: 2,
          type: 'feeAndUserCharges',
          formFieldType: 'amount',
          value: 3812,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_feeAndUserCharges',
          position: 3,
          type: 'feeAndUserCharges',
          formFieldType: 'amount',
          value: 622,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_feeAndUserCharges',
          position: 4,
          type: 'feeAndUserCharges',
          formFieldType: 'amount',
          value: 2127,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_feeAndUserCharges',
          position: 5,
          type: 'feeAndUserCharges',
          formFieldType: 'amount',
          value: 7612,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_feeAndUserCharges',
          position: 6,
          type: 'feeAndUserCharges',
          formFieldType: 'amount',
          value: 3939,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'interestIncome',
      readOnly: false,
      class: '',
      label: 'Interest Income',
      position: '1.3',
      quesPos: 17,
      required: true,
      info: 'Interest income shall include sale from assets, land and other assets.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_interestIncome',
          position: 1,
          type: 'interestIncome',
          formFieldType: 'amount',
          value: 6416,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_interestIncome',
          position: 2,
          type: 'interestIncome',
          formFieldType: 'amount',
          value: 3192,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_interestIncome',
          position: 3,
          type: 'interestIncome',
          formFieldType: 'amount',
          value: 8346,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_interestIncome',
          position: 4,
          type: 'interestIncome',
          formFieldType: 'amount',
          value: 2199,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_interestIncome',
          position: 5,
          type: 'interestIncome',
          formFieldType: 'amount',
          value: 5745,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_interestIncome',
          position: 6,
          type: 'interestIncome',
          formFieldType: 'amount',
          value: 6028,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'otherIncome',
      readOnly: false,
      class: '',
      label: 'Other Income',
      position: '1.4',
      quesPos: 18,
      required: true,
      info: 'Other income shall include sale & hire charges, income from investments,interest earned, etc.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_otherIncome',
          position: 1,
          type: 'otherIncome',
          formFieldType: 'amount',
          value: 7698,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_otherIncome',
          position: 2,
          type: 'otherIncome',
          formFieldType: 'amount',
          value: 6626,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_otherIncome',
          position: 3,
          type: 'otherIncome',
          formFieldType: 'amount',
          value: 4667,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_otherIncome',
          position: 4,
          type: 'otherIncome',
          formFieldType: 'amount',
          value: 2124,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_otherIncome',
          position: 5,
          type: 'otherIncome',
          formFieldType: 'amount',
          value: 698,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_otherIncome',
          position: 6,
          type: 'otherIncome',
          formFieldType: 'amount',
          value: 5098,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'rentalIncome',
      readOnly: false,
      class: '',
      label: 'Rental Income from Municipal Properties',
      position: '1.5',
      quesPos: 19,
      required: true,
      info: 'Rental Income shall include rental incomes earned out of shopping complexes, markets, office buildings, etc',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_rentalIncome',
          position: 1,
          type: 'rentalIncome',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_rentalIncome',
          position: 2,
          type: 'rentalIncome',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_rentalIncome',
          position: 3,
          type: 'rentalIncome',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_rentalIncome',
          position: 4,
          type: 'rentalIncome',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_rentalIncome',
          position: 5,
          type: 'rentalIncome',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_rentalIncome',
          position: 6,
          type: 'rentalIncome',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'totalGrants',
      readOnly: true,
      class: ' fw-bold',
      label: 'Total Grants',
      position: '2',
      quesPos: 20,
      required: true,
      info: '',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: ['centralGrants', 'otherGrants'],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: 'sum',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_totalGrants',
          position: 1,
          type: 'totalGrants',
          formFieldType: 'amount',
          value: 2368,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_totalGrants',
          position: 2,
          type: 'totalGrants',
          formFieldType: 'amount',
          value: 9290,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_totalGrants',
          position: 3,
          type: 'totalGrants',
          formFieldType: 'amount',
          value: 5191,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_totalGrants',
          position: 4,
          type: 'totalGrants',
          formFieldType: 'amount',
          value: 6388,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_totalGrants',
          position: 5,
          type: 'totalGrants',
          formFieldType: 'amount',
          value: 539,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_totalGrants',
          position: 6,
          type: 'totalGrants',
          formFieldType: 'amount',
          value: 2303,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'centralGrants',
      readOnly: true,
      class: ' fw-bold',
      label: "Grants for Centre's Initiatives ",
      position: '2.1',
      quesPos: 21,
      required: true,
      info: "These grants shall include Union Finance Commission grants, Grants received for Centrally Sponsored Schemes (including state's matching share).",
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: ['centralSponsoredScheme', 'unionFinanceGrants'],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: 'sum',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_centralGrants',
          position: 1,
          type: 'centralGrants',
          formFieldType: 'amount',
          value: 4229,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_centralGrants',
          position: 2,
          type: 'centralGrants',
          formFieldType: 'amount',
          value: 5623,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_centralGrants',
          position: 3,
          type: 'centralGrants',
          formFieldType: 'amount',
          value: 3045,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_centralGrants',
          position: 4,
          type: 'centralGrants',
          formFieldType: 'amount',
          value: 7045,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_centralGrants',
          position: 5,
          type: 'centralGrants',
          formFieldType: 'amount',
          value: 6525,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_centralGrants',
          position: 6,
          type: 'centralGrants',
          formFieldType: 'amount',
          value: 9526,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'centralSponsoredScheme',
      readOnly: false,
      class: '',
      label: 'Centrally Sponsored Schemes (Total Centre and State Share)',
      position: '2.1.1',
      quesPos: 22,
      required: true,
      info: "Centrally Sponsored Scheme shall include  Grants received for Centrally Sponsored Schemes (including state's matching share)",
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_centralSponsoredScheme',
          position: 1,
          type: 'centralSponsoredScheme',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_centralSponsoredScheme',
          position: 2,
          type: 'centralSponsoredScheme',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_centralSponsoredScheme',
          position: 3,
          type: 'centralSponsoredScheme',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_centralSponsoredScheme',
          position: 4,
          type: 'centralSponsoredScheme',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_centralSponsoredScheme',
          position: 5,
          type: 'centralSponsoredScheme',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_centralSponsoredScheme',
          position: 6,
          type: 'centralSponsoredScheme',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'unionFinanceGrants',
      readOnly: false,
      class: '',
      label: 'Union Finance Commission Grants',
      position: '2.1.2',
      quesPos: 23,
      required: true,
      info: 'Union Finance Commission Grants shall include Union Finance Commission grants',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_unionFinanceGrants',
          position: 1,
          type: 'unionFinanceGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_unionFinanceGrants',
          position: 2,
          type: 'unionFinanceGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_unionFinanceGrants',
          position: 3,
          type: 'unionFinanceGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_unionFinanceGrants',
          position: 4,
          type: 'unionFinanceGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_unionFinanceGrants',
          position: 5,
          type: 'unionFinanceGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_unionFinanceGrants',
          position: 6,
          type: 'unionFinanceGrants',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'otherGrants',
      readOnly: true,
      class: ' fw-bold',
      label: "Other Grants (including State's grants)",
      position: '2.2',
      quesPos: 24,
      required: true,
      info: 'These grants shall include State Finance Commission grants, Other State ,Grants, Other grants etc.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: ['sfcGrants', 'grantsOtherThanSfc', 'otherGrantsWithoutState'],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: 'sum',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_otherGrants',
          position: 1,
          type: 'otherGrants',
          formFieldType: 'amount',
          value: 5889,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_otherGrants',
          position: 2,
          type: 'otherGrants',
          formFieldType: 'amount',
          value: 322,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_otherGrants',
          position: 3,
          type: 'otherGrants',
          formFieldType: 'amount',
          value: 3205,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_otherGrants',
          position: 4,
          type: 'otherGrants',
          formFieldType: 'amount',
          value: 2934,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_otherGrants',
          position: 5,
          type: 'otherGrants',
          formFieldType: 'amount',
          value: 354,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_otherGrants',
          position: 6,
          type: 'otherGrants',
          formFieldType: 'amount',
          value: 2289,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'sfcGrants',
      readOnly: false,
      class: '',
      label: 'State Finance Commission Devolution and Grants',
      position: '2.2.1',
      quesPos: 25,
      required: true,
      info: 'State Finance Commission Devolution and Grants shall include State Finance Commission grants',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_sfcGrants',
          position: 1,
          type: 'sfcGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_sfcGrants',
          position: 2,
          type: 'sfcGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_sfcGrants',
          position: 3,
          type: 'sfcGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_sfcGrants',
          position: 4,
          type: 'sfcGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_sfcGrants',
          position: 5,
          type: 'sfcGrants',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_sfcGrants',
          position: 6,
          type: 'sfcGrants',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'grantsOtherThanSfc',
      readOnly: false,
      class: '',
      label: 'Grants from State (other than SFC)',
      position: '2.2.2',
      quesPos: 26,
      required: true,
      info: 'Grants from State shall include  Other State Grants (excluding State Finance Commission grants)',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_grantsOtherThanSfc',
          position: 1,
          type: 'grantsOtherThanSfc',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_grantsOtherThanSfc',
          position: 2,
          type: 'grantsOtherThanSfc',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_grantsOtherThanSfc',
          position: 3,
          type: 'grantsOtherThanSfc',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_grantsOtherThanSfc',
          position: 4,
          type: 'grantsOtherThanSfc',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_grantsOtherThanSfc',
          position: 5,
          type: 'grantsOtherThanSfc',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_grantsOtherThanSfc',
          position: 6,
          type: 'grantsOtherThanSfc',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'assignedRevAndCom',
      readOnly: false,
      class: '',
      label: 'Assigned Revenue and Compensation',
      position: '3',
      quesPos: 28,
      required: true,
      info: 'Assigned Revenue includes share in the revenues of the state government ,allocated to the ULB. This includes Entertainment Tax, Duty on Transfer of Properties,etc.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_assignedRevAndCom',
          position: 1,
          type: 'assignedRevAndCom',
          formFieldType: 'amount',
          value: 2831,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_assignedRevAndCom',
          position: 2,
          type: 'assignedRevAndCom',
          formFieldType: 'amount',
          value: 5733,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_assignedRevAndCom',
          position: 3,
          type: 'assignedRevAndCom',
          formFieldType: 'amount',
          value: 3246,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_assignedRevAndCom',
          position: 4,
          type: 'assignedRevAndCom',
          formFieldType: 'amount',
          value: 7709,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_assignedRevAndCom',
          position: 5,
          type: 'assignedRevAndCom',
          formFieldType: 'amount',
          value: 2392,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_assignedRevAndCom',
          position: 6,
          type: 'assignedRevAndCom',
          formFieldType: 'amount',
          value: 8505,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'otherRevenue',
      readOnly: false,
      class: '',
      label: 'Other Revenue',
      position: '4',
      quesPos: 29,
      required: true,
      info: 'Other Revenue shall include any other sources of revenue except own ,revenue, assigned revenue and grants',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_otherRevenue',
          position: 1,
          type: 'otherRevenue',
          formFieldType: 'amount',
          value: 1463,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_otherRevenue',
          position: 2,
          type: 'otherRevenue',
          formFieldType: 'amount',
          value: 3814,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_otherRevenue',
          position: 3,
          type: 'otherRevenue',
          formFieldType: 'amount',
          value: 8436,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_otherRevenue',
          position: 4,
          type: 'otherRevenue',
          formFieldType: 'amount',
          value: 2929,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_otherRevenue',
          position: 5,
          type: 'otherRevenue',
          formFieldType: 'amount',
          value: 1413,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_otherRevenue',
          position: 6,
          type: 'otherRevenue',
          formFieldType: 'amount',
          value: 3818,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'totalRevenue',
      readOnly: true,
      class: ' fw-bold',
      label: 'Total Revenues',
      position: '5',
      quesPos: 30,
      required: true,
      info: 'Total Revenue is the sum of: (a) tax revenues, (b) non-tax revenues, (c) assigned (shared) revenue, (c) grants-in-aid, (d) other receipts, etc.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: ['totOwnRevenue', 'totalGrants', 'assignedRevAndCom', 'otherRevenue'],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: 'sum',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_totalRevenue',
          position: 1,
          type: 'totalRevenue',
          formFieldType: 'amount',
          value: 8830,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_totalRevenue',
          position: 2,
          type: 'totalRevenue',
          formFieldType: 'amount',
          value: 5451,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_totalRevenue',
          position: 3,
          type: 'totalRevenue',
          formFieldType: 'amount',
          value: 932,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_totalRevenue',
          position: 4,
          type: 'totalRevenue',
          formFieldType: 'amount',
          value: 7065,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_totalRevenue',
          position: 5,
          type: 'totalRevenue',
          formFieldType: 'amount',
          value: 1947,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_totalRevenue',
          position: 6,
          type: 'totalRevenue',
          formFieldType: 'amount',
          value: 2948,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
  ],
};
const expenditure = {
  key: 'expenditure',
  section: 'accordion',
  formFieldType: 'table',
  label: 'II. EXPENDITURE',
  data: [
    {
      key: 'totalRevenueExp',
      readOnly: true,
      class: ' fw-bold',
      label: 'Total Revenue Expenditure',
      position: '6',
      quesPos: 31,
      required: true,
      info: 'Total expenditure shall include establishment expenses, operations & maintenance + interest & finance charges and other expenditure.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: ['establishmentExp', 'oAndmExp', 'interestAndfinacialChar', 'otherRevenueExp'],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: 'sum',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_totalRevenueExp',
          position: 1,
          type: 'totalRevenueExp',
          formFieldType: 'amount',
          value: 1211,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_totalRevenueExp',
          position: 2,
          type: 'totalRevenueExp',
          formFieldType: 'amount',
          value: 191,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_totalRevenueExp',
          position: 3,
          type: 'totalRevenueExp',
          formFieldType: 'amount',
          value: 5426,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_totalRevenueExp',
          position: 4,
          type: 'totalRevenueExp',
          formFieldType: 'amount',
          value: 8802,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_totalRevenueExp',
          position: 5,
          type: 'totalRevenueExp',
          formFieldType: 'amount',
          value: 5527,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_totalRevenueExp',
          position: 6,
          type: 'totalRevenueExp',
          formFieldType: 'amount',
          value: 8556,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'establishmentExp',
      readOnly: false,
      class: '',
      label: 'Establishment Expenses',
      position: '6.1',
      quesPos: 33,
      required: true,
      info: 'Expenses directly incurred on human resources of the ULB such as ,wages, and employee benefits such as retirement and pensions are called establishment expenses',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: ['salaries', 'pension', 'otherExp'],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_establishmentExp',
          position: 1,
          type: 'establishmentExp',
          formFieldType: 'amount',
          value: 9888,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_establishmentExp',
          position: 2,
          type: 'establishmentExp',
          formFieldType: 'amount',
          value: 8791,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_establishmentExp',
          position: 3,
          type: 'establishmentExp',
          formFieldType: 'amount',
          value: 3041,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_establishmentExp',
          position: 4,
          type: 'establishmentExp',
          formFieldType: 'amount',
          value: 4896,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_establishmentExp',
          position: 5,
          type: 'establishmentExp',
          formFieldType: 'amount',
          value: 2088,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_establishmentExp',
          position: 6,
          type: 'establishmentExp',
          formFieldType: 'amount',
          value: 4664,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'salaries',
      readOnly: false,
      class: '',
      label: 'Salaries, Bonus and Wages',
      position: '6.1.1',
      quesPos: 33,
      required: true,
      info: 'Salaries, Bonus & Wages shall include expenses directly incurred on human resources of the ULB such as wages, salaries and bonus',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_salaries',
          position: 1,
          type: 'salaries',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_salaries',
          position: 2,
          type: 'salaries',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_salaries',
          position: 3,
          type: 'salaries',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_salaries',
          position: 4,
          type: 'salaries',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_salaries',
          position: 5,
          type: 'salaries',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_salaries',
          position: 6,
          type: 'salaries',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'pension',
      readOnly: false,
      class: '',
      label: 'Pension',
      position: '6.1.2',
      quesPos: 34,
      required: true,
      info: 'Pension shall include expenses directly incurred on human resources of the ULB such as pension',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_pension',
          position: 1,
          type: 'pension',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_pension',
          position: 2,
          type: 'pension',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_pension',
          position: 3,
          type: 'pension',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_pension',
          position: 4,
          type: 'pension',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_pension',
          position: 5,
          type: 'pension',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_pension',
          position: 6,
          type: 'pension',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'otherExp',
      readOnly: false,
      class: '',
      label: 'Others',
      position: '6.1.3',
      quesPos: 35,
      required: true,
      info: 'Others shall include any other expenses directly incurred on human resources of the ULB',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_otherExp',
          position: 1,
          type: 'otherExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_otherExp',
          position: 2,
          type: 'otherExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_otherExp',
          position: 3,
          type: 'otherExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_otherExp',
          position: 4,
          type: 'otherExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_otherExp',
          position: 5,
          type: 'otherExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_otherExp',
          position: 6,
          type: 'otherExp',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'oAndmExp',
      readOnly: false,
      class: '',
      label: 'Operation and Maintenance Expenditure',
      position: '6.2',
      quesPos: 36,
      required: true,
      info: 'Operation and Maintenance Expenditure shall include O&M expense on water supply + O&M expense on sanitation / sewerage + All other O&M expenses.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_oAndmExp',
          position: 1,
          type: 'oAndmExp',
          formFieldType: 'amount',
          value: 4623,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_oAndmExp',
          position: 2,
          type: 'oAndmExp',
          formFieldType: 'amount',
          value: 7285,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_oAndmExp',
          position: 3,
          type: 'oAndmExp',
          formFieldType: 'amount',
          value: 6700,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_oAndmExp',
          position: 4,
          type: 'oAndmExp',
          formFieldType: 'amount',
          value: 8134,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_oAndmExp',
          position: 5,
          type: 'oAndmExp',
          formFieldType: 'amount',
          value: 4549,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_oAndmExp',
          position: 6,
          type: 'oAndmExp',
          formFieldType: 'amount',
          value: 6860,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'interestAndfinacialChar',
      readOnly: false,
      class: '',
      label: 'Interest and Finance Charges',
      position: '6.3',
      quesPos: 37,
      required: true,
      info: 'Interest and Finance Charges shall include Interest on Loans from Central Govt, State Govt, International agencies, govt bodies, banks, bank charges and other financial expenses, etc.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_interestAndfinacialChar',
          position: 1,
          type: 'interestAndfinacialChar',
          formFieldType: 'amount',
          value: 5717,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_interestAndfinacialChar',
          position: 2,
          type: 'interestAndfinacialChar',
          formFieldType: 'amount',
          value: 1819,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_interestAndfinacialChar',
          position: 3,
          type: 'interestAndfinacialChar',
          formFieldType: 'amount',
          value: 7402,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_interestAndfinacialChar',
          position: 4,
          type: 'interestAndfinacialChar',
          formFieldType: 'amount',
          value: 7204,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_interestAndfinacialChar',
          position: 5,
          type: 'interestAndfinacialChar',
          formFieldType: 'amount',
          value: 9329,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_interestAndfinacialChar',
          position: 6,
          type: 'interestAndfinacialChar',
          formFieldType: 'amount',
          value: 4091,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'otherRevenueExp',
      readOnly: false,
      class: '',
      label: 'Other Revenue Expenditure',
      position: '6.4',
      quesPos: 38,
      required: true,
      info: 'Other expenses shall include programme expenses, revenue grants, contributions & subsidies.',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_otherRevenueExp',
          position: 1,
          type: 'otherRevenueExp',
          formFieldType: 'amount',
          value: 9151,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_otherRevenueExp',
          position: 2,
          type: 'otherRevenueExp',
          formFieldType: 'amount',
          value: 8988,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_otherRevenueExp',
          position: 3,
          type: 'otherRevenueExp',
          formFieldType: 'amount',
          value: 807,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_otherRevenueExp',
          position: 4,
          type: 'otherRevenueExp',
          formFieldType: 'amount',
          value: 4961,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_otherRevenueExp',
          position: 5,
          type: 'otherRevenueExp',
          formFieldType: 'amount',
          value: 9811,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_otherRevenueExp',
          position: 6,
          type: 'otherRevenueExp',
          formFieldType: 'amount',
          value: 9112,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'adExp',
      readOnly: false,
      class: '',
      label: 'Administrative Expenses',
      position: '6.5',
      quesPos: 39,
      required: true,
      info: 'Administrative Expenses shall include Indirect expenses  which relate to the ULB as a whole, such as Rents, Rates & Taxes, Office maintenance, Communications, Books & periodicals, Printing & Stationary, Travel Expenditure, Law Charges etc. ',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_adExp',
          position: 1,
          type: 'adExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_adExp',
          position: 2,
          type: 'adExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_adExp',
          position: 3,
          type: 'adExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_adExp',
          position: 4,
          type: 'adExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_adExp',
          position: 5,
          type: 'adExp',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_adExp',
          position: 6,
          type: 'adExp',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'capExp',
      readOnly: false,
      class: '',
      label: 'Capital Expenditure',
      position: '7',
      quesPos: 40,
      required: true,
      info: 'Capital Expenditure = (Closing Balance Gross Block + Closing Balance Capital Work in Progress) - (Opening Balance Gross Block + Opening Balance Capital Work in Progress)',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_capExp',
          position: 1,
          type: 'capExp',
          formFieldType: 'amount',
          value: 2936,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_capExp',
          position: 2,
          type: 'capExp',
          formFieldType: 'amount',
          value: 1628,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_capExp',
          position: 3,
          type: 'capExp',
          formFieldType: 'amount',
          value: 4601,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_capExp',
          position: 4,
          type: 'capExp',
          formFieldType: 'amount',
          value: 5102,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_capExp',
          position: 5,
          type: 'capExp',
          formFieldType: 'amount',
          value: 4311,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_capExp',
          position: 6,
          type: 'capExp',
          formFieldType: 'amount',
          value: 116,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'totalExp',
      readOnly: true,
      class: ' fw-bold',
      label: 'Total Expenditure',
      position: '8',
      quesPos: 41,
      required: true,
      info: 'Total Expenditure = Revenue Expenditure + Capital Expenditure',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: ['totalRevenueExp', 'capExp'],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: 'sum',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_totalExp',
          position: 1,
          type: 'totalExp',
          formFieldType: 'amount',
          value: 9767,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_totalExp',
          position: 2,
          type: 'totalExp',
          formFieldType: 'amount',
          value: 3785,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_totalExp',
          position: 3,
          type: 'totalExp',
          formFieldType: 'amount',
          value: 7566,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_totalExp',
          position: 4,
          type: 'totalExp',
          formFieldType: 'amount',
          value: 6343,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_totalExp',
          position: 5,
          type: 'totalExp',
          formFieldType: 'amount',
          value: 7302,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_totalExp',
          position: 6,
          type: 'totalExp',
          formFieldType: 'amount',
          value: 2765,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
  ],
};
const borrowings = {
  key: 'borrowings',
  section: 'accordion',
  formFieldType: 'table',
  label: 'III. BORROWINGS',
  data: [
    {
      key: 'grossBorrowing',
      readOnly: false,
      class: '',
      label: 'Gross Borrowings',
      position: '9',
      quesPos: 42,
      required: true,
      info: 'Gross Borrowings = Sum of All Secured and Unsecured Loans',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
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
      sumOf: [],
      max: 999999999999999,
      min: -999999999999999,
      decimal: 0,
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_grossBorrowing',
          position: 1,
          type: 'grossBorrowing',
          formFieldType: 'amount',
          value: 12,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_grossBorrowing',
          position: 2,
          type: 'grossBorrowing',
          formFieldType: 'amount',
          value: 5103,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_grossBorrowing',
          position: 3,
          type: 'grossBorrowing',
          formFieldType: 'amount',
          value: 202,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_grossBorrowing',
          position: 4,
          type: 'grossBorrowing',
          formFieldType: 'amount',
          value: 8748,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_grossBorrowing',
          position: 5,
          type: 'grossBorrowing',
          formFieldType: 'amount',
          value: 7594,
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_grossBorrowing',
          position: 6,
          type: 'grossBorrowing',
          formFieldType: 'amount',
          value: 5515,
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'centralStateBorrow',
      readOnly: false,
      class: '',
      label: 'Central and State Government',
      position: '9.1',
      quesPos: 43,
      required: true,
      info: 'Central and State Government includes the sum of All Secured and Unsecured Loans from Central and State Government',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_centralStateBorrow',
          position: 1,
          type: 'centralStateBorrow',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_centralStateBorrow',
          position: 2,
          type: 'centralStateBorrow',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_centralStateBorrow',
          position: 3,
          type: 'centralStateBorrow',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_centralStateBorrow',
          position: 4,
          type: 'centralStateBorrow',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_centralStateBorrow',
          position: 5,
          type: 'centralStateBorrow',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_centralStateBorrow',
          position: 6,
          type: 'centralStateBorrow',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'bonds',
      readOnly: false,
      class: '',
      label: 'Bonds',
      position: '9.2',
      quesPos: 44,
      required: true,
      info: 'Bonds includes the sum of bond amounts issued by the ULB',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_bonds',
          position: 1,
          type: 'bonds',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_bonds',
          position: 2,
          type: 'bonds',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_bonds',
          position: 3,
          type: 'bonds',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_bonds',
          position: 4,
          type: 'bonds',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_bonds',
          position: 5,
          type: 'bonds',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_bonds',
          position: 6,
          type: 'bonds',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'bankAndFinancial',
      readOnly: false,
      class: '',
      label: 'Banks and Financial Institutions',
      position: '9.3',
      quesPos: 45,
      required: true,
      info: 'Banks and Financial Institutions includes the sum of all secured and Unsecured Loans from banks and other financial institution',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_bankAndFinancial',
          position: 1,
          type: 'bankAndFinancial',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_bankAndFinancial',
          position: 2,
          type: 'bankAndFinancial',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_bankAndFinancial',
          position: 3,
          type: 'bankAndFinancial',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_bankAndFinancial',
          position: 4,
          type: 'bankAndFinancial',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_bankAndFinancial',
          position: 5,
          type: 'bankAndFinancial',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_bankAndFinancial',
          position: 6,
          type: 'bankAndFinancial',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'otherBorrowing',
      readOnly: false,
      class: '',
      label: 'Others',
      position: '9.4',
      quesPos: 46,
      required: true,
      info: 'Others includes the sum of all other types of loans',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_otherBorrowing',
          position: 1,
          type: 'otherBorrowing',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_otherBorrowing',
          position: 2,
          type: 'otherBorrowing',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_otherBorrowing',
          position: 3,
          type: 'otherBorrowing',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_otherBorrowing',
          position: 4,
          type: 'otherBorrowing',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_otherBorrowing',
          position: 5,
          type: 'otherBorrowing',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_otherBorrowing',
          position: 6,
          type: 'otherBorrowing',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
  ],
};
const receivables = {
  key: 'receivables',
  section: 'accordion',
  formFieldType: 'table',
  label: 'IV. RECEIVABLES',
  data: [
    {
      key: 'totalReceivable',
      readOnly: false,
      class: '',
      label: 'Total Receivables',
      position: '10',
      quesPos: 47,
      required: true,
      info: 'Total Receivables is the sum of total amounts due for taxes, goods sold or services rendered by ULB',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_totalReceivable',
          position: 1,
          type: 'totalReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_totalReceivable',
          position: 2,
          type: 'totalReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_totalReceivable',
          position: 3,
          type: 'totalReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_totalReceivable',
          position: 4,
          type: 'totalReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_totalReceivable',
          position: 5,
          type: 'totalReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_totalReceivable',
          position: 6,
          type: 'totalReceivable',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'receivablePTax',
      readOnly: false,
      class: '',
      label: 'Receivables for Property Tax',
      position: '10.1',
      quesPos: 48,
      required: true,
      info: 'Receivables for Property Tax includes total amounts due towards property taxes',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_receivablePTax',
          position: 1,
          type: 'receivablePTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_receivablePTax',
          position: 2,
          type: 'receivablePTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_receivablePTax',
          position: 3,
          type: 'receivablePTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_receivablePTax',
          position: 4,
          type: 'receivablePTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_receivablePTax',
          position: 5,
          type: 'receivablePTax',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_receivablePTax',
          position: 6,
          type: 'receivablePTax',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'receivableFee',
      readOnly: false,
      class: '',
      label: 'Receivables for Fee and User Charges',
      position: '10.2',
      quesPos: 49,
      required: true,
      info: 'Receivables for Fee and User Chargesincludes total amounts due towards fee and user charges',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_receivableFee',
          position: 1,
          type: 'receivableFee',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_receivableFee',
          position: 2,
          type: 'receivableFee',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_receivableFee',
          position: 3,
          type: 'receivableFee',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_receivableFee',
          position: 4,
          type: 'receivableFee',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_receivableFee',
          position: 5,
          type: 'receivableFee',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_receivableFee',
          position: 6,
          type: 'receivableFee',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
    {
      key: 'otherReceivable',
      readOnly: false,
      class: '',
      label: 'Other Receivables',
      position: '10.3',
      quesPos: 50,
      required: true,
      info: 'Other Receivables shall include any other amount due for taxes, goods sold or services rendered by ULB',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_otherReceivable',
          position: 1,
          type: 'otherReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_otherReceivable',
          position: 2,
          type: 'otherReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_otherReceivable',
          position: 3,
          type: 'otherReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_otherReceivable',
          position: 4,
          type: 'otherReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_otherReceivable',
          position: 5,
          type: 'otherReceivable',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_otherReceivable',
          position: 6,
          type: 'otherReceivable',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
  ],
};
const cashAndBank = {
  key: 'cashAndBank',
  section: 'accordion',
  formFieldType: 'table',
  label: 'V. CASH and BANK BALANCE',
  data: [
    {
      key: 'totalCashAndBankBal',
      readOnly: false,
      class: '',
      label: 'Total Cash and Bank Balance',
      position: '11',
      quesPos: 51,
      required: true,
      info: 'Total Cash & Bank Balance shall include cash held by the ULB and any money held in any bank/post office by the ULB (including municipal fund, special fund and grant funds)',
      placeHolder: '',
      formFieldType: 'amount',
      canShow: true,
      validations: [
        {
          name: 'min',
          validator: -999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'max',
          validator: 999999999999999,
          message: 'Please enter a valid number with at most 15 digits.',
        },
        {
          name: 'decimal',
          validator: '',
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
      max: 999999999999999,
      min: -999999999999999,
      decimal: '',
      autoSumValidation: '',
      year: [
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2022-23',
          key: 'fy2022-23_totalCashAndBankBal',
          position: 1,
          type: 'totalCashAndBankBal',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2021-22',
          key: 'fy2021-22_totalCashAndBankBal',
          position: 2,
          type: 'totalCashAndBankBal',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2020-21',
          key: 'fy2020-21_totalCashAndBankBal',
          position: 3,
          type: 'totalCashAndBankBal',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2019-20',
          key: 'fy2019-20_totalCashAndBankBal',
          position: 4,
          type: 'totalCashAndBankBal',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2018-19',
          key: 'fy2018-19_totalCashAndBankBal',
          position: 5,
          type: 'totalCashAndBankBal',
          formFieldType: 'amount',
          value: '',
        },
        {
          warning: [
            {
              value: 0,
              condition: 'eq',
              message: 'Are you sure you want to continue with 0',
            },
          ],
          label: 'FY 2017-18',
          key: 'fy2017-18_totalCashAndBankBal',
          position: 6,
          type: 'totalCashAndBankBal',
          formFieldType: 'amount',
          value: '',
        },
      ],
      status: 'Na',
      value: '',
      isDraft: true,
    },
  ],
};

export const financialData = {
  _id: '6657921b9ab1c13ac44d01f5',
  key: 'financialData',
  icon: '',
  text: '',
  formType: 'form1',
  label: 'Financial Data',
  id: 's2',
  displayPriority: 2,
  __v: 0,
  data: [sourceOfFd, revenue, expenditure, borrowings],
};
