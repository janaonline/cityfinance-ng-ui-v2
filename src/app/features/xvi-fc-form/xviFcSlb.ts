export const slb = {
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_coverageOfWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "coverageOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_coverageOfWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "coverageOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_coverageOfWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "coverageOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_coverageOfWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "coverageOfWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_perCapitaOfWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_perCapitaOfWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_perCapitaOfWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_perCapitaOfWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        },
                        {
                            "value": 135,
                            "condition": "gt",
                            "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
                        }
                    ],
                    "sumOf": [],
                    "max": 999,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_extentOfMeteringWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfMeteringWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_extentOfMeteringWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_extentOfMeteringWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_extentOfNonRevenueWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfNonRevenueWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_extentOfNonRevenueWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_extentOfNonRevenueWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_continuityOfWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "continuityOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_continuityOfWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "continuityOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_continuityOfWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "continuityOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_continuityOfWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "continuityOfWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 24,
                    "min": 0,
                    "decimal": 0,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_efficiencyInRedressalCustomerWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_efficiencyInRedressalCustomerWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_efficiencyInRedressalCustomerWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_efficiencyInRedressalCustomerWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        },
                        {
                            "value": 80,
                            "condition": "gt",
                            "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_qualityOfWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "qualityOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_qualityOfWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "qualityOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_qualityOfWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "qualityOfWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_qualityOfWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "qualityOfWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_costRecoveryInWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_costRecoveryInWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_costRecoveryInWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_costRecoveryInWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_efficiencyInCollectionRelatedWs",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_efficiencyInCollectionRelatedWs",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_efficiencyInCollectionRelatedWs",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_efficiencyInCollectionRelatedWs",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        },
                        {
                            "value": 90,
                            "condition": "gt",
                            "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_coverageOfToiletsSew",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_coverageOfToiletsSew",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_coverageOfToiletsSew",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_coverageOfToiletsSew",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_coverageOfSewNet",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_coverageOfSewNet",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_coverageOfSewNet",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_coverageOfSewNet",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_collectionEfficiencySew",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_collectionEfficiencySew",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_collectionEfficiencySew",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_collectionEfficiencySew",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_adequacyOfSew",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_adequacyOfSew",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_adequacyOfSew",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_adequacyOfSew",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_qualityOfSew",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "qualityOfSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_qualityOfSew",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "qualityOfSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_qualityOfSew",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "qualityOfSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_qualityOfSew",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "qualityOfSew",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_extentOfReuseSew",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfReuseSew",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_extentOfReuseSew",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_extentOfReuseSew",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_efficiencyInRedressalCustomerSew",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_efficiencyInRedressalCustomerSew",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_efficiencyInRedressalCustomerSew",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_efficiencyInRedressalCustomerSew",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_extentOfCostWaterSew",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfCostWaterSew",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_extentOfCostWaterSew",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_extentOfCostWaterSew",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_efficiencyInCollectionSew",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_efficiencyInCollectionSew",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_efficiencyInCollectionSew",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_efficiencyInCollectionSew",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        },
                        {
                            "value": 90,
                            "condition": "gt",
                            "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_householdLevelCoverageLevelSwm",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_householdLevelCoverageLevelSwm",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_householdLevelCoverageLevelSwm",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_householdLevelCoverageLevelSwm",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_efficiencyOfCollectionSwm",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_efficiencyOfCollectionSwm",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_efficiencyOfCollectionSwm",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_efficiencyOfCollectionSwm",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_extentOfSegregationSwm",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfSegregationSwm",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_extentOfSegregationSwm",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_extentOfSegregationSwm",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_extentOfMunicipalSwm",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfMunicipalSwm",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_extentOfMunicipalSwm",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_extentOfMunicipalSwm",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        },
                        {
                            "value": 80,
                            "condition": "gt",
                            "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_extentOfScientificSolidSwm",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfScientificSolidSwm",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_extentOfScientificSolidSwm",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_extentOfScientificSolidSwm",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_extentOfCostInSwm",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfCostInSwm",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_extentOfCostInSwm",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_extentOfCostInSwm",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_efficiencyInCollectionSwmUser",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_efficiencyInCollectionSwmUser",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_efficiencyInCollectionSwmUser",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_efficiencyInCollectionSwmUser",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        },
                        {
                            "value": 90,
                            "condition": "gt",
                            "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_efficiencyInRedressalCustomerSwm",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_efficiencyInRedressalCustomerSwm",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_efficiencyInRedressalCustomerSwm",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_efficiencyInRedressalCustomerSwm",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        },
                        {
                            "value": 80,
                            "condition": "gt",
                            "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_coverageOfStormDrainage",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_coverageOfStormDrainage",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_coverageOfStormDrainage",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_coverageOfStormDrainage",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
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
                            "name": "required",
                            "validator": "required",
                            "message": "Please fill in this required field."
                        },
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
                        },
                        []
                    ],
                    "year": [
                        {
                            "label": "FY 2022-23",
                            "key": "fy2022-23_incidenceOfWaterLogging",
                            "year": "2022-23",
                            "position": 1,
                            "refKey": "incidenceOfWaterLogging",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2021-22",
                            "key": "fy2021-22_incidenceOfWaterLogging",
                            "year": "2021-22",
                            "position": 2,
                            "refKey": "incidenceOfWaterLogging",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2020-21",
                            "key": "fy2020-21_incidenceOfWaterLogging",
                            "year": "2020-21",
                            "position": 3,
                            "refKey": "incidenceOfWaterLogging",
                            "formFieldType": "number",
                            "value": ""
                        },
                        {
                            "label": "FY 2019-20",
                            "key": "fy2019-20_incidenceOfWaterLogging",
                            "year": "2019-20",
                            "position": 4,
                            "refKey": "incidenceOfWaterLogging",
                            "formFieldType": "number",
                            "value": ""
                        }
                    ],
                    "warning": [
                        {
                            "value": 0,
                            "condition": "eq",
                            "message": "Are you sure you want to continue with 0"
                        }
                    ],
                    "sumOf": [],
                    "max": 9999,
                    "min": 0,
                    "decimal": 0,
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                }
            ],
            "label": "IV. STORM WATER DRAINAGE"
        }
    ]
}