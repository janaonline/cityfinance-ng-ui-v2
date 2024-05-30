import { Validators } from "@angular/forms";

const basicTab = {
    "_id": "664b8179ea7f70385313396c",
    "key": "demographicData",
    "icon": "",
    "text": "",
    "label": "Demographic Data",
    "id": "s1",
    "displayPriority": 1,
    "__v": 0,
    "data": [
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
            "readonly": false
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
            "postion": "",
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
};
const financeTab = {
    "_id": "664b8179ea7f70385313396d",
    "key": "financialData",
    "icon": "",
    "text": "",
    "label": "Financial Data",
    "id": "s2",
    "displayPriority": 2,
    "__v": 0,
    "data": [
        {
            key: "sourceOfFd",
            label: "",
            section: 'accordion',
            formFieldType: "table",
            tableRow: [{
                "label": "Please select the source of Financial Data",
                "postion": "*",
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
                tableData: [
                    {
                        "warning": [],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_sourceOfFd",
                        "postion": 1,
                        "type": "sourceOfFd",
                        "formFieldType": "select",
                        "value": 6906
                    },
                    {
                        "warning": [],
                        "label": "FY 2021-22",
                        "key": "fy2021-22_sourceOfFd",
                        "postion": 2,
                        "type": "sourceOfFd",
                        "formFieldType": "select",
                        "value": 1604
                    },
                    {
                        "warning": [],
                        "label": "FY 2020-21",
                        "key": "fy2020-21_sourceOfFd",
                        "postion": 3,
                        "type": "sourceOfFd",
                        "formFieldType": "select",
                        "value": 3145
                    },
                    {
                        "warning": [],
                        "label": "FY 2019-20",
                        "key": "fy2019-20_sourceOfFd",
                        "postion": 4,
                        "type": "sourceOfFd",
                        "formFieldType": "select",
                        "value": 7967
                    },
                    {
                        "warning": [],
                        "label": "FY 2018-19",
                        "key": "fy2018-19_sourceOfFd",
                        "postion": 5,
                        "type": "sourceOfFd",
                        "formFieldType": "select",
                        "value": 476
                    },
                    {
                        "warning": [],
                        "label": "FY 2017-18",
                        "key": "fy2017-18_sourceOfFd",
                        "postion": 6,
                        "type": "sourceOfFd",
                        "formFieldType": "select",
                        "value": 832
                    },
                    {
                        "warning": [],
                        "label": "FY 2016-17",
                        "key": "fy2016-17_sourceOfFd",
                        "postion": 7,
                        "type": "sourceOfFd",
                        "formFieldType": "select",
                        "value": 2139
                    },
                    {
                        "warning": [],
                        "label": "FY 2015-16",
                        "key": "fy2015-16_sourceOfFd",
                        "postion": 8,
                        "type": "sourceOfFd",
                        "formFieldType": "select",
                        "value": 8888
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            }],
        },
        {
            key: 'revenue',
            "label": "I. REVENUE",
            section: 'accordion',
            formFieldType: "table",
            tableRow: [
                {
                    "key": "taxRevenue",
                    "label": "Tax Revenue",
                    "postion": "1.1",
                    "required": true,
                    "info": "Tax revenue shall include property, water, drainage, sewerage,professional, entertainment and advertisment tax and all other tax revenues.",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_taxRevenue",
                            "postion": 1,
                            "type": "taxRevenue",
                            "formFieldType": "number",
                            "value": 4109
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
                            "key": "fy2021-22_taxRevenue",
                            "postion": 2,
                            "type": "taxRevenue",
                            "formFieldType": "number",
                            "value": 8012
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
                            "key": "fy2020-21_taxRevenue",
                            "postion": 3,
                            "type": "taxRevenue",
                            "formFieldType": "number",
                            "value": 9400
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
                            "key": "fy2019-20_taxRevenue",
                            "postion": 4,
                            "type": "taxRevenue",
                            "formFieldType": "number",
                            "value": 779
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
                            "key": "fy2018-19_taxRevenue",
                            "postion": 5,
                            "type": "taxRevenue",
                            "formFieldType": "number",
                            "value": 3580
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
                            "key": "fy2017-18_taxRevenue",
                            "postion": 6,
                            "type": "taxRevenue",
                            "formFieldType": "number",
                            "value": 4020
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
                            "key": "fy2016-17_taxRevenue",
                            "postion": 7,
                            "type": "taxRevenue",
                            "formFieldType": "number",
                            "value": 6958
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
                            "key": "fy2015-16_taxRevenue",
                            "postion": 8,
                            "type": "taxRevenue",
                            "formFieldType": "number",
                            "value": 2457
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "feeAndUserCharges",
                    "label": "Fee and User Charges",
                    "postion": "1.2",
                    "required": true,
                    "info": "Fees & user charges shall include Water supply, Fees & Sanitation / Sewerage, Garbage collection / Solid waste management, and all other fees & user charges.",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_feeAndUserCharges",
                            "postion": 1,
                            "type": "feeAndUserCharges",
                            "formFieldType": "number",
                            "value": 9321
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
                            "key": "fy2021-22_feeAndUserCharges",
                            "postion": 2,
                            "type": "feeAndUserCharges",
                            "formFieldType": "number",
                            "value": 3812
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
                            "key": "fy2020-21_feeAndUserCharges",
                            "postion": 3,
                            "type": "feeAndUserCharges",
                            "formFieldType": "number",
                            "value": 622
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
                            "key": "fy2019-20_feeAndUserCharges",
                            "postion": 4,
                            "type": "feeAndUserCharges",
                            "formFieldType": "number",
                            "value": 2127
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
                            "key": "fy2018-19_feeAndUserCharges",
                            "postion": 5,
                            "type": "feeAndUserCharges",
                            "formFieldType": "number",
                            "value": 7612
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
                            "key": "fy2017-18_feeAndUserCharges",
                            "postion": 6,
                            "type": "feeAndUserCharges",
                            "formFieldType": "number",
                            "value": 3939
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
                            "key": "fy2016-17_feeAndUserCharges",
                            "postion": 7,
                            "type": "feeAndUserCharges",
                            "formFieldType": "number",
                            "value": 2310
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
                            "key": "fy2015-16_feeAndUserCharges",
                            "postion": 8,
                            "type": "feeAndUserCharges",
                            "formFieldType": "number",
                            "value": 7947
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "interestIncome",
                    "label": "Interest Income",
                    "postion": "1.3",
                    "required": true,
                    "info": "Interest income shall include sale from assets, land and other assets.",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_interestIncome",
                            "postion": 1,
                            "type": "interestIncome",
                            "formFieldType": "number",
                            "value": 6416
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
                            "key": "fy2021-22_interestIncome",
                            "postion": 2,
                            "type": "interestIncome",
                            "formFieldType": "number",
                            "value": 3192
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
                            "key": "fy2020-21_interestIncome",
                            "postion": 3,
                            "type": "interestIncome",
                            "formFieldType": "number",
                            "value": 8346
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
                            "key": "fy2019-20_interestIncome",
                            "postion": 4,
                            "type": "interestIncome",
                            "formFieldType": "number",
                            "value": 2199
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
                            "key": "fy2018-19_interestIncome",
                            "postion": 5,
                            "type": "interestIncome",
                            "formFieldType": "number",
                            "value": 5745
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
                            "key": "fy2017-18_interestIncome",
                            "postion": 6,
                            "type": "interestIncome",
                            "formFieldType": "number",
                            "value": 6028
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
                            "key": "fy2016-17_interestIncome",
                            "postion": 7,
                            "type": "interestIncome",
                            "formFieldType": "number",
                            "value": 3653
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
                            "key": "fy2015-16_interestIncome",
                            "postion": 8,
                            "type": "interestIncome",
                            "formFieldType": "number",
                            "value": 4973
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "otherIncome",
                    "label": "Other Income",
                    "postion": "1.4",
                    "required": true,
                    "info": "Other income shall include sale & hire charges, income from investments,interest earned, etc.",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_otherIncome",
                            "postion": 1,
                            "type": "otherIncome",
                            "formFieldType": "number",
                            "value": 7698
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
                            "key": "fy2021-22_otherIncome",
                            "postion": 2,
                            "type": "otherIncome",
                            "formFieldType": "number",
                            "value": 6626
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
                            "key": "fy2020-21_otherIncome",
                            "postion": 3,
                            "type": "otherIncome",
                            "formFieldType": "number",
                            "value": 4667
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
                            "key": "fy2019-20_otherIncome",
                            "postion": 4,
                            "type": "otherIncome",
                            "formFieldType": "number",
                            "value": 2124
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
                            "key": "fy2018-19_otherIncome",
                            "postion": 5,
                            "type": "otherIncome",
                            "formFieldType": "number",
                            "value": 698
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
                            "key": "fy2017-18_otherIncome",
                            "postion": 6,
                            "type": "otherIncome",
                            "formFieldType": "number",
                            "value": 5098
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
                            "key": "fy2016-17_otherIncome",
                            "postion": 7,
                            "type": "otherIncome",
                            "formFieldType": "number",
                            "value": 6759
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
                            "key": "fy2015-16_otherIncome",
                            "postion": 8,
                            "type": "otherIncome",
                            "formFieldType": "number",
                            "value": 152
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "totOwnRevenue",
                    "label": "Total Own Revenue",
                    "postion": "1",
                    "required": true,
                    "info": "Total own revenue shall include tax revenue, fees & user charges, interest income, and other income.",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "sum",
                    "logic": [
                        "1.1",
                        "1.2",
                        "1.3",
                        "1.4"
                    ],
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_totOwnRevenue",
                            "postion": 1,
                            "type": "totOwnRevenue",
                            "formFieldType": "number",
                            "value": 7264
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
                            "key": "fy2021-22_totOwnRevenue",
                            "postion": 2,
                            "type": "totOwnRevenue",
                            "formFieldType": "number",
                            "value": 4920
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
                            "key": "fy2020-21_totOwnRevenue",
                            "postion": 3,
                            "type": "totOwnRevenue",
                            "formFieldType": "number",
                            "value": 5302
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
                            "key": "fy2019-20_totOwnRevenue",
                            "postion": 4,
                            "type": "totOwnRevenue",
                            "formFieldType": "number",
                            "value": 2245
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
                            "key": "fy2018-19_totOwnRevenue",
                            "postion": 5,
                            "type": "totOwnRevenue",
                            "formFieldType": "number",
                            "value": 7434
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
                            "key": "fy2017-18_totOwnRevenue",
                            "postion": 6,
                            "type": "totOwnRevenue",
                            "formFieldType": "number",
                            "value": 8109
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
                            "key": "fy2016-17_totOwnRevenue",
                            "postion": 7,
                            "type": "totOwnRevenue",
                            "formFieldType": "number",
                            "value": 2957
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
                            "key": "fy2015-16_totOwnRevenue",
                            "postion": 8,
                            "type": "totOwnRevenue",
                            "formFieldType": "number",
                            "value": 5281
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "centralGrants",
                    "label": "Grants for Centre's Initiatives ",
                    "postion": "2.1",
                    "required": true,
                    "info": "These grants shall include Union Finance Commission grants, Grants received for Centrally Sponsored Schemes (including state's matching share).",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_centralGrants",
                            "postion": 1,
                            "type": "centralGrants",
                            "formFieldType": "number",
                            "value": 4229
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
                            "key": "fy2021-22_centralGrants",
                            "postion": 2,
                            "type": "centralGrants",
                            "formFieldType": "number",
                            "value": 5623
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
                            "key": "fy2020-21_centralGrants",
                            "postion": 3,
                            "type": "centralGrants",
                            "formFieldType": "number",
                            "value": 3045
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
                            "key": "fy2019-20_centralGrants",
                            "postion": 4,
                            "type": "centralGrants",
                            "formFieldType": "number",
                            "value": 7045
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
                            "key": "fy2018-19_centralGrants",
                            "postion": 5,
                            "type": "centralGrants",
                            "formFieldType": "number",
                            "value": 6525
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
                            "key": "fy2017-18_centralGrants",
                            "postion": 6,
                            "type": "centralGrants",
                            "formFieldType": "number",
                            "value": 9526
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
                            "key": "fy2016-17_centralGrants",
                            "postion": 7,
                            "type": "centralGrants",
                            "formFieldType": "number",
                            "value": 8236
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
                            "key": "fy2015-16_centralGrants",
                            "postion": 8,
                            "type": "centralGrants",
                            "formFieldType": "number",
                            "value": 8006
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "otherGrants",
                    "label": "Other Grants (including State's grants)",
                    "postion": "2.2",
                    "required": true,
                    "info": "These grants shall include State Finance Commission grants, Other State ,Grants, Other grants etc.",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_otherGrants",
                            "postion": 1,
                            "type": "otherGrants",
                            "formFieldType": "number",
                            "value": 5889
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
                            "key": "fy2021-22_otherGrants",
                            "postion": 2,
                            "type": "otherGrants",
                            "formFieldType": "number",
                            "value": 322
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
                            "key": "fy2020-21_otherGrants",
                            "postion": 3,
                            "type": "otherGrants",
                            "formFieldType": "number",
                            "value": 3205
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
                            "key": "fy2019-20_otherGrants",
                            "postion": 4,
                            "type": "otherGrants",
                            "formFieldType": "number",
                            "value": 2934
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
                            "key": "fy2018-19_otherGrants",
                            "postion": 5,
                            "type": "otherGrants",
                            "formFieldType": "number",
                            "value": 354
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
                            "key": "fy2017-18_otherGrants",
                            "postion": 6,
                            "type": "otherGrants",
                            "formFieldType": "number",
                            "value": 2289
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
                            "key": "fy2016-17_otherGrants",
                            "postion": 7,
                            "type": "otherGrants",
                            "formFieldType": "number",
                            "value": 9614
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
                            "key": "fy2015-16_otherGrants",
                            "postion": 8,
                            "type": "otherGrants",
                            "formFieldType": "number",
                            "value": 2767
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "totalGrants",
                    "label": "Total Grants",
                    "postion": "2",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "sum",
                    "logic": [
                        "2.1",
                        "2.2"
                    ],
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_totalGrants",
                            "postion": 1,
                            "type": "totalGrants",
                            "formFieldType": "number",
                            "value": 2368
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
                            "key": "fy2021-22_totalGrants",
                            "postion": 2,
                            "type": "totalGrants",
                            "formFieldType": "number",
                            "value": 9290
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
                            "key": "fy2020-21_totalGrants",
                            "postion": 3,
                            "type": "totalGrants",
                            "formFieldType": "number",
                            "value": 5191
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
                            "key": "fy2019-20_totalGrants",
                            "postion": 4,
                            "type": "totalGrants",
                            "formFieldType": "number",
                            "value": 6388
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
                            "key": "fy2018-19_totalGrants",
                            "postion": 5,
                            "type": "totalGrants",
                            "formFieldType": "number",
                            "value": 539
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
                            "key": "fy2017-18_totalGrants",
                            "postion": 6,
                            "type": "totalGrants",
                            "formFieldType": "number",
                            "value": 2303
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
                            "key": "fy2016-17_totalGrants",
                            "postion": 7,
                            "type": "totalGrants",
                            "formFieldType": "number",
                            "value": 9877
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
                            "key": "fy2015-16_totalGrants",
                            "postion": 8,
                            "type": "totalGrants",
                            "formFieldType": "number",
                            "value": 2867
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "assignedRevAndCom",
                    "label": "Assigned Revenue and Compensation",
                    "postion": "3",
                    "required": true,
                    "info": "Assigned Revenue includes share in the revenues of the state government ,allocated to the ULB. This includes Entertainment Tax, Duty on Transfer of Properties,etc.",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_assignedRevAndCom",
                            "postion": 1,
                            "type": "assignedRevAndCom",
                            "formFieldType": "number",
                            "value": 2831
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
                            "key": "fy2021-22_assignedRevAndCom",
                            "postion": 2,
                            "type": "assignedRevAndCom",
                            "formFieldType": "number",
                            "value": 5733
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
                            "key": "fy2020-21_assignedRevAndCom",
                            "postion": 3,
                            "type": "assignedRevAndCom",
                            "formFieldType": "number",
                            "value": 3246
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
                            "key": "fy2019-20_assignedRevAndCom",
                            "postion": 4,
                            "type": "assignedRevAndCom",
                            "formFieldType": "number",
                            "value": 7709
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
                            "key": "fy2018-19_assignedRevAndCom",
                            "postion": 5,
                            "type": "assignedRevAndCom",
                            "formFieldType": "number",
                            "value": 2392
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
                            "key": "fy2017-18_assignedRevAndCom",
                            "postion": 6,
                            "type": "assignedRevAndCom",
                            "formFieldType": "number",
                            "value": 8505
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
                            "key": "fy2016-17_assignedRevAndCom",
                            "postion": 7,
                            "type": "assignedRevAndCom",
                            "formFieldType": "number",
                            "value": 7656
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
                            "key": "fy2015-16_assignedRevAndCom",
                            "postion": 8,
                            "type": "assignedRevAndCom",
                            "formFieldType": "number",
                            "value": 7654
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "otherRevenue",
                    "label": "Other Revenue",
                    "postion": "4",
                    "required": true,
                    "info": "Other Revenue shall include any other sources of revenue except own ,revenue, assigned revenue and grants",
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
                    "max": 999999999999999,
                    "min": -999999999999999,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_otherRevenue",
                            "postion": 1,
                            "type": "otherRevenue",
                            "formFieldType": "number",
                            "value": 1463
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
                            "key": "fy2021-22_otherRevenue",
                            "postion": 2,
                            "type": "otherRevenue",
                            "formFieldType": "number",
                            "value": 3814
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
                            "key": "fy2020-21_otherRevenue",
                            "postion": 3,
                            "type": "otherRevenue",
                            "formFieldType": "number",
                            "value": 8436
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
                            "key": "fy2019-20_otherRevenue",
                            "postion": 4,
                            "type": "otherRevenue",
                            "formFieldType": "number",
                            "value": 2929
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
                            "key": "fy2018-19_otherRevenue",
                            "postion": 5,
                            "type": "otherRevenue",
                            "formFieldType": "number",
                            "value": 1413
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
                            "key": "fy2017-18_otherRevenue",
                            "postion": 6,
                            "type": "otherRevenue",
                            "formFieldType": "number",
                            "value": 3818
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
                            "key": "fy2016-17_otherRevenue",
                            "postion": 7,
                            "type": "otherRevenue",
                            "formFieldType": "number",
                            "value": 4390
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
                            "key": "fy2015-16_otherRevenue",
                            "postion": 8,
                            "type": "otherRevenue",
                            "formFieldType": "number",
                            "value": 4991
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "totalRevenue",
                    "label": "Total Revenues",
                    "postion": "5",
                    "required": true,
                    "info": "Total Revenue is the sum of: (a) tax revenues, (b) non-tax revenues, (c) assigned (shared) revenue, (c) grants-in-aid, (d) other receipts, etc.",
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
                    tableData: [
                        {
                            "warning": [
                                {
                                    "value": 0,
                                    "condition": "eq",
                                    "message": "Are you sure you want to continue with 0"
                                }
                            ],
                            "label": "FY 2022-23",
                            "key": "fy2022-23_totalRevenue",
                            "postion": 1,
                            "type": "totalRevenue",
                            "formFieldType": "number",
                            "value": 8830
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
                            "key": "fy2021-22_totalRevenue",
                            "postion": 2,
                            "type": "totalRevenue",
                            "formFieldType": "number",
                            "value": 5451
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
                            "key": "fy2020-21_totalRevenue",
                            "postion": 3,
                            "type": "totalRevenue",
                            "formFieldType": "number",
                            "value": 932
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
                            "key": "fy2019-20_totalRevenue",
                            "postion": 4,
                            "type": "totalRevenue",
                            "formFieldType": "number",
                            "value": 7065
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
                            "key": "fy2018-19_totalRevenue",
                            "postion": 5,
                            "type": "totalRevenue",
                            "formFieldType": "number",
                            "value": 1947
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
                            "key": "fy2017-18_totalRevenue",
                            "postion": 6,
                            "type": "totalRevenue",
                            "formFieldType": "number",
                            "value": 2948
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
                            "key": "fy2016-17_totalRevenue",
                            "postion": 7,
                            "type": "totalRevenue",
                            "formFieldType": "number",
                            "value": 4719
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
                            "key": "fy2015-16_totalRevenue",
                            "postion": 8,
                            "type": "totalRevenue",
                            "formFieldType": "number",
                            "value": 4511
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                }
            ]
        },
        {
            key: 'expenditure',
            "label": "II. EXPENDITURE",
            "establishmentExp": {
                "key": "establishmentExp",
                "label": "Establishment Expenses",
                "postion": "6.1",
                "required": true,
                "info": "Expenses directly incurred on human resources of the ULB such as ,wages, and employee benefits such as retirement and pensions are called establishment expenses",
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
                "max": 999999999999999,
                "min": -999999999999999,
                "decimal": 0,
                "validation": "",
                "logic": "",
                tableData: [
                    {
                        "warning": [
                            {
                                "value": 0,
                                "condition": "eq",
                                "message": "Are you sure you want to continue with 0"
                            }
                        ],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_establishmentExp",
                        "postion": 1,
                        "type": "establishmentExp",
                        "formFieldType": "number",
                        "value": 9888
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
                        "key": "fy2021-22_establishmentExp",
                        "postion": 2,
                        "type": "establishmentExp",
                        "formFieldType": "number",
                        "value": 8791
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
                        "key": "fy2020-21_establishmentExp",
                        "postion": 3,
                        "type": "establishmentExp",
                        "formFieldType": "number",
                        "value": 3041
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
                        "key": "fy2019-20_establishmentExp",
                        "postion": 4,
                        "type": "establishmentExp",
                        "formFieldType": "number",
                        "value": 4896
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
                        "key": "fy2018-19_establishmentExp",
                        "postion": 5,
                        "type": "establishmentExp",
                        "formFieldType": "number",
                        "value": 2088
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
                        "key": "fy2017-18_establishmentExp",
                        "postion": 6,
                        "type": "establishmentExp",
                        "formFieldType": "number",
                        "value": 4664
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
                        "key": "fy2016-17_establishmentExp",
                        "postion": 7,
                        "type": "establishmentExp",
                        "formFieldType": "number",
                        "value": 7475
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
                        "key": "fy2015-16_establishmentExp",
                        "postion": 8,
                        "type": "establishmentExp",
                        "formFieldType": "number",
                        "value": 3172
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            },
            "oAndmExp": {
                "key": "oAndmExp",
                "label": "Operation and Maintenance Expenditure",
                "postion": "6.2",
                "required": true,
                "info": "Operation and Maintenance Expenditure shall include O&M expense on water supply + O&M expense on sanitation / sewerage + All other O&M expenses.",
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
                "max": 999999999999999,
                "min": -999999999999999,
                "decimal": 0,
                "validation": "",
                "logic": "",
                tableData: [
                    {
                        "warning": [
                            {
                                "value": 0,
                                "condition": "eq",
                                "message": "Are you sure you want to continue with 0"
                            }
                        ],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_oAndmExp",
                        "postion": 1,
                        "type": "oAndmExp",
                        "formFieldType": "number",
                        "value": 4623
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
                        "key": "fy2021-22_oAndmExp",
                        "postion": 2,
                        "type": "oAndmExp",
                        "formFieldType": "number",
                        "value": 7285
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
                        "key": "fy2020-21_oAndmExp",
                        "postion": 3,
                        "type": "oAndmExp",
                        "formFieldType": "number",
                        "value": 6700
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
                        "key": "fy2019-20_oAndmExp",
                        "postion": 4,
                        "type": "oAndmExp",
                        "formFieldType": "number",
                        "value": 8134
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
                        "key": "fy2018-19_oAndmExp",
                        "postion": 5,
                        "type": "oAndmExp",
                        "formFieldType": "number",
                        "value": 4549
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
                        "key": "fy2017-18_oAndmExp",
                        "postion": 6,
                        "type": "oAndmExp",
                        "formFieldType": "number",
                        "value": 6860
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
                        "key": "fy2016-17_oAndmExp",
                        "postion": 7,
                        "type": "oAndmExp",
                        "formFieldType": "number",
                        "value": 8937
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
                        "key": "fy2015-16_oAndmExp",
                        "postion": 8,
                        "type": "oAndmExp",
                        "formFieldType": "number",
                        "value": 2530
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            },
            "interestAndfinacialChar": {
                "key": "interestAndfinacialChar",
                "label": "Interest and Finance Charges",
                "postion": "6.3",
                "required": true,
                "info": "Interest and Finance Charges shall include Interest on Loans from Central Govt, State Govt, International agencies, govt bodies, banks, bank charges and other financial expenses, etc.",
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
                "max": 999999999999999,
                "min": -999999999999999,
                "decimal": 0,
                "validation": "",
                "logic": "",
                tableData: [
                    {
                        "warning": [
                            {
                                "value": 0,
                                "condition": "eq",
                                "message": "Are you sure you want to continue with 0"
                            }
                        ],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_interestAndfinacialChar",
                        "postion": 1,
                        "type": "interestAndfinacialChar",
                        "formFieldType": "number",
                        "value": 5717
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
                        "key": "fy2021-22_interestAndfinacialChar",
                        "postion": 2,
                        "type": "interestAndfinacialChar",
                        "formFieldType": "number",
                        "value": 1819
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
                        "key": "fy2020-21_interestAndfinacialChar",
                        "postion": 3,
                        "type": "interestAndfinacialChar",
                        "formFieldType": "number",
                        "value": 7402
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
                        "key": "fy2019-20_interestAndfinacialChar",
                        "postion": 4,
                        "type": "interestAndfinacialChar",
                        "formFieldType": "number",
                        "value": 7204
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
                        "key": "fy2018-19_interestAndfinacialChar",
                        "postion": 5,
                        "type": "interestAndfinacialChar",
                        "formFieldType": "number",
                        "value": 9329
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
                        "key": "fy2017-18_interestAndfinacialChar",
                        "postion": 6,
                        "type": "interestAndfinacialChar",
                        "formFieldType": "number",
                        "value": 4091
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
                        "key": "fy2016-17_interestAndfinacialChar",
                        "postion": 7,
                        "type": "interestAndfinacialChar",
                        "formFieldType": "number",
                        "value": 9032
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
                        "key": "fy2015-16_interestAndfinacialChar",
                        "postion": 8,
                        "type": "interestAndfinacialChar",
                        "formFieldType": "number",
                        "value": 9585
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            },
            "otherRevenueExp": {
                "key": "otherRevenueExp",
                "label": "Other Revenue Expenditure",
                "postion": "6.4",
                "required": true,
                "info": "Other expenses shall include programme expenses, revenue grants, contributions & subsidies.",
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
                "max": 999999999999999,
                "min": -999999999999999,
                "decimal": 0,
                "validation": "",
                "logic": "",
                tableData: [
                    {
                        "warning": [
                            {
                                "value": 0,
                                "condition": "eq",
                                "message": "Are you sure you want to continue with 0"
                            }
                        ],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_otherRevenueExp",
                        "postion": 1,
                        "type": "otherRevenueExp",
                        "formFieldType": "number",
                        "value": 9151
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
                        "key": "fy2021-22_otherRevenueExp",
                        "postion": 2,
                        "type": "otherRevenueExp",
                        "formFieldType": "number",
                        "value": 8988
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
                        "key": "fy2020-21_otherRevenueExp",
                        "postion": 3,
                        "type": "otherRevenueExp",
                        "formFieldType": "number",
                        "value": 807
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
                        "key": "fy2019-20_otherRevenueExp",
                        "postion": 4,
                        "type": "otherRevenueExp",
                        "formFieldType": "number",
                        "value": 4961
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
                        "key": "fy2018-19_otherRevenueExp",
                        "postion": 5,
                        "type": "otherRevenueExp",
                        "formFieldType": "number",
                        "value": 9811
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
                        "key": "fy2017-18_otherRevenueExp",
                        "postion": 6,
                        "type": "otherRevenueExp",
                        "formFieldType": "number",
                        "value": 9112
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
                        "key": "fy2016-17_otherRevenueExp",
                        "postion": 7,
                        "type": "otherRevenueExp",
                        "formFieldType": "number",
                        "value": 7946
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
                        "key": "fy2015-16_otherRevenueExp",
                        "postion": 8,
                        "type": "otherRevenueExp",
                        "formFieldType": "number",
                        "value": 1223
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            },
            "totalRevenueExp": {
                "key": "totalRevenueExp",
                "label": "Total Revenue Expenditure",
                "postion": "6",
                "required": true,
                "info": "Total expenditure shall include establishment expenses, operations & maintenance + interest & finance charges and other expenditure.",
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
                tableData: [
                    {
                        "warning": [
                            {
                                "value": 0,
                                "condition": "eq",
                                "message": "Are you sure you want to continue with 0"
                            }
                        ],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_totalRevenueExp",
                        "postion": 1,
                        "type": "totalRevenueExp",
                        "formFieldType": "number",
                        "value": 1211
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
                        "key": "fy2021-22_totalRevenueExp",
                        "postion": 2,
                        "type": "totalRevenueExp",
                        "formFieldType": "number",
                        "value": 191
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
                        "key": "fy2020-21_totalRevenueExp",
                        "postion": 3,
                        "type": "totalRevenueExp",
                        "formFieldType": "number",
                        "value": 5426
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
                        "key": "fy2019-20_totalRevenueExp",
                        "postion": 4,
                        "type": "totalRevenueExp",
                        "formFieldType": "number",
                        "value": 8802
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
                        "key": "fy2018-19_totalRevenueExp",
                        "postion": 5,
                        "type": "totalRevenueExp",
                        "formFieldType": "number",
                        "value": 5527
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
                        "key": "fy2017-18_totalRevenueExp",
                        "postion": 6,
                        "type": "totalRevenueExp",
                        "formFieldType": "number",
                        "value": 8556
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
                        "key": "fy2016-17_totalRevenueExp",
                        "postion": 7,
                        "type": "totalRevenueExp",
                        "formFieldType": "number",
                        "value": 4778
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
                        "key": "fy2015-16_totalRevenueExp",
                        "postion": 8,
                        "type": "totalRevenueExp",
                        "formFieldType": "number",
                        "value": 8821
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            },
            "capExp": {
                "key": "capExp",
                "label": "Capital Expenditure",
                "postion": "7",
                "required": true,
                "info": "Capital Expenditure = (Closing Balance Gross Block + Closing Balance Capital Work in Progress) - (Opening Balance Gross Block + Opening Balance Capital Work in Progress)",
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
                "max": 999999999999999,
                "min": -999999999999999,
                "decimal": 0,
                "validation": "",
                "logic": "",
                tableData: [
                    {
                        "warning": [
                            {
                                "value": 0,
                                "condition": "eq",
                                "message": "Are you sure you want to continue with 0"
                            }
                        ],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_capExp",
                        "postion": 1,
                        "type": "capExp",
                        "formFieldType": "number",
                        "value": 2936
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
                        "key": "fy2021-22_capExp",
                        "postion": 2,
                        "type": "capExp",
                        "formFieldType": "number",
                        "value": 1628
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
                        "key": "fy2020-21_capExp",
                        "postion": 3,
                        "type": "capExp",
                        "formFieldType": "number",
                        "value": 4601
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
                        "key": "fy2019-20_capExp",
                        "postion": 4,
                        "type": "capExp",
                        "formFieldType": "number",
                        "value": 5102
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
                        "key": "fy2018-19_capExp",
                        "postion": 5,
                        "type": "capExp",
                        "formFieldType": "number",
                        "value": 4311
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
                        "key": "fy2017-18_capExp",
                        "postion": 6,
                        "type": "capExp",
                        "formFieldType": "number",
                        "value": 116
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
                        "key": "fy2016-17_capExp",
                        "postion": 7,
                        "type": "capExp",
                        "formFieldType": "number",
                        "value": 4098
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
                        "key": "fy2015-16_capExp",
                        "postion": 8,
                        "type": "capExp",
                        "formFieldType": "number",
                        "value": 4693
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            },
            "totalExp": {
                "key": "totalExp",
                "label": "Total Expenditure",
                "postion": "8",
                "required": true,
                "info": "Total Expenditure = Revenue Expenditure + Capital Expenditure",
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
                "max": 999999999999999,
                "min": -999999999999999,
                "decimal": 0,
                "validation": "sum",
                "logic": [
                    "6",
                    "7"
                ],
                tableData: [
                    {
                        "warning": [
                            {
                                "value": 0,
                                "condition": "eq",
                                "message": "Are you sure you want to continue with 0"
                            }
                        ],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_totalExp",
                        "postion": 1,
                        "type": "totalExp",
                        "formFieldType": "number",
                        "value": 9767
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
                        "key": "fy2021-22_totalExp",
                        "postion": 2,
                        "type": "totalExp",
                        "formFieldType": "number",
                        "value": 3785
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
                        "key": "fy2020-21_totalExp",
                        "postion": 3,
                        "type": "totalExp",
                        "formFieldType": "number",
                        "value": 7566
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
                        "key": "fy2019-20_totalExp",
                        "postion": 4,
                        "type": "totalExp",
                        "formFieldType": "number",
                        "value": 6343
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
                        "key": "fy2018-19_totalExp",
                        "postion": 5,
                        "type": "totalExp",
                        "formFieldType": "number",
                        "value": 7302
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
                        "key": "fy2017-18_totalExp",
                        "postion": 6,
                        "type": "totalExp",
                        "formFieldType": "number",
                        "value": 2765
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
                        "key": "fy2016-17_totalExp",
                        "postion": 7,
                        "type": "totalExp",
                        "formFieldType": "number",
                        "value": 3100
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
                        "key": "fy2015-16_totalExp",
                        "postion": 8,
                        "type": "totalExp",
                        "formFieldType": "number",
                        "value": 7953
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            }
        },
        {
            key: 'borrowings',
            "label": "III. BORROWINGS",
            "grossBorrowing": {
                "key": "grossBorrowing",
                "label": "Gross Borrowings",
                "postion": "9",
                "required": true,
                "info": "Gross Borrowings = Sum of All Secured and Unsecured Loans",
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
                "max": 999999999999999,
                "min": -999999999999999,
                "decimal": 0,
                "validation": "",
                "logic": "",
                tableData: [
                    {
                        "warning": [
                            {
                                "value": 0,
                                "condition": "eq",
                                "message": "Are you sure you want to continue with 0"
                            }
                        ],
                        "label": "FY 2022-23",
                        "key": "fy2022-23_grossBorrowing",
                        "postion": 1,
                        "type": "grossBorrowing",
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
                        "key": "fy2021-22_grossBorrowing",
                        "postion": 2,
                        "type": "grossBorrowing",
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
                        "key": "fy2020-21_grossBorrowing",
                        "postion": 3,
                        "type": "grossBorrowing",
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
                        "key": "fy2019-20_grossBorrowing",
                        "postion": 4,
                        "type": "grossBorrowing",
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
                        "key": "fy2018-19_grossBorrowing",
                        "postion": 5,
                        "type": "grossBorrowing",
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
                        "key": "fy2017-18_grossBorrowing",
                        "postion": 6,
                        "type": "grossBorrowing",
                        "formFieldType": "number",
                        "value": 5515
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
                        "key": "fy2016-17_grossBorrowing",
                        "postion": 7,
                        "type": "grossBorrowing",
                        "formFieldType": "number",
                        "value": 2381
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
                        "key": "fy2015-16_grossBorrowing",
                        "postion": 8,
                        "type": "grossBorrowing",
                        "formFieldType": "number",
                        "value": 6418
                    }
                ],
                "status": "Na",
                "value": "",
                "isDraft": true,
                "readonly": false
            }
        }
    ]
};
export const tabsJson = {
    data: {
        "tabs": [
            financeTab,
            basicTab,
            {
                "_id": "664b8179ea7f70385313396c",
                "key": "finanace",
                "icon": "",
                "text": "",
                "label": "finance Data",
                "id": "s2",
                "displayPriority": 1,
                "__v": 0,
                "data": [
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
                        "readonly": false
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
                        "postion": "",
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
        ]
    }
};
export const formJson = [
    {
        type: "input",
        label: "Username",
        inputType: "text",
        name: "name",
        validations: [
            {
                name: "required",
                validator: Validators.required,
                message: "Name Required"
            },
            {
                name: "pattern",
                validator: Validators.pattern("^[a-zA-Z]+$"),
                message: "Accept only text"
            }
        ]
    },
    {
        type: "childform",
        label: "Child Form",
        name: "childForm",
        inputType: "NA",
        formArrays: [
            [
                {
                    type: "input",
                    label: "firstname",
                    name: "firstname",
                    validations: [
                        {
                            name: "required",
                            validator: Validators.required,
                            message: "First Name Required"
                        },
                        {
                            name: "pattern",
                            validator: Validators.pattern("^[a-zA-Z]+$"),
                            message: "Accept only text"
                        }
                    ]
                },
                {
                    type: "input",
                    label: "lastname",
                    name: "lastname",
                    validations: [
                        {
                            name: "required",
                            validator: Validators.required,
                            message: "Last Name Required"
                        },
                        {
                            name: "pattern",
                            validator: Validators.pattern("^[a-zA-Z]+$"),
                            message: "Accept only text"
                        }
                    ]
                }
            ],
            [
                {
                    type: "input",
                    label: "firstname",
                    name: "firstname",
                    validations: [
                        {
                            name: "required",
                            validator: Validators.required,
                            message: "First Name Required"
                        },
                        {
                            name: "pattern",
                            validator: Validators.pattern("^[a-zA-Z]+$"),
                            message: "Accept only text"
                        }
                    ]
                },
                {
                    type: "input",
                    label: "lastname",
                    name: "lastname",
                    validations: [
                        {
                            name: "required",
                            validator: Validators.required,
                            message: "Last Name Required"
                        },
                        {
                            name: "pattern",
                            validator: Validators.pattern("^[a-zA-Z]+$"),
                            message: "Accept only text"
                        }
                    ]
                }
            ]
        ],
        validations: []
    },
    {
        type: "input",
        label: "Email Address",
        inputType: "email",
        name: "email",
        validations: [
            {
                name: "required",
                validator: Validators.required,
                message: "Email Required"
            },
            {
                name: "pattern",
                validator: Validators.pattern(
                    "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"
                ),
                message: "Invalid email"
            }
        ]
    },
    {
        type: "input",
        label: "Password",
        inputType: "password",
        name: "password",
        validations: [
            {
                name: "required",
                validator: Validators.required,
                message: "Password Required"
            }
        ]
    },
    {
        type: "radiobutton",
        label: "Gender",
        name: "gender",
        options: ["Male", "Female"],
        value: "Male",
        inputType: "NA",
    },
    {
        type: "date",
        label: "DOB",
        name: "dob",
        inputType: "text",
        validations: [
            {
                name: "required",
                validator: Validators.required,
                message: "Date of Birth Required"
            }
        ]
    },
    {
        type: "select",
        label: "Country",
        name: "country",
        value: "UK",
        options: ["India", "UAE", "UK", "US"],
        inputType: "NA",
    },
    {
        type: "checkbox",
        label: "Accept Terms",
        name: "term",
        value: true,
        inputType: "NA",
    },
    {
        type: "button",
        label: "Save",
        name: 'save',
        inputType: "NA",
    }
];