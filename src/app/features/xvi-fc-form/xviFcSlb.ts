export const slb = {
    "_id": "665df95e73de1812233ecc07",
    "key": "serviceLevelBenchmark",
    "icon": "",
    "text": "",
    "formType": "form2",
    "label": "Service Level Benchmark Data",
    "id": "s5",
    "displayPriority": 5,
    "__v": 0,
    "formArrays": [
        {
            "key": "waterSupply",
            "section": "accordion",
            "formFieldType": "table",
            "label": "I. WATER SUPPLY",
            "tableRow": [
                {
                    "key": "coverageOfWs",
                    "label": "Coverage of water supply connections (%)",
                    "position": 1,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "coverageOfWs",
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
                            "type": "coverageOfWs",
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
                            "type": "coverageOfWs",
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
                            "type": "coverageOfWs",
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
                            "type": "coverageOfWs",
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
                            "type": "coverageOfWs",
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
                            "type": "coverageOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "perCapitaOfWs",
                    "label": "Per capita supply of water(lpcd)",
                    "position": 2,
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
                    "max": 999,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
                        {
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
                            "label": "FY 2022-23",
                            "key": "2022-23",
                            "position": 1,
                            "type": "perCapitaOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2021-22",
                            "key": "2021-22",
                            "position": 2,
                            "type": "perCapitaOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2020-21",
                            "key": "2020-21",
                            "position": 3,
                            "type": "perCapitaOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2019-20",
                            "key": "2019-20",
                            "position": 4,
                            "type": "perCapitaOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2018-19",
                            "key": "2018-19",
                            "position": 5,
                            "type": "perCapitaOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2017-18",
                            "key": "2017-18",
                            "position": 6,
                            "type": "perCapitaOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2016-17",
                            "key": "2016-17",
                            "position": 7,
                            "type": "perCapitaOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2015-16",
                            "key": "2015-16",
                            "position": 8,
                            "type": "perCapitaOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "extentOfMeteringWs",
                    "label": "Extent of metering of water connections (%)",
                    "position": 3,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "extentOfMeteringWs",
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
                            "type": "extentOfMeteringWs",
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
                            "type": "extentOfMeteringWs",
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
                            "type": "extentOfMeteringWs",
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
                            "type": "extentOfMeteringWs",
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
                            "type": "extentOfMeteringWs",
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
                            "type": "extentOfMeteringWs",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "extentOfNonRevenueWs",
                    "label": "Extent of non-revenue water (NRW) (%)",
                    "position": 4,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "extentOfNonRevenueWs",
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
                            "type": "extentOfNonRevenueWs",
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
                            "type": "extentOfNonRevenueWs",
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
                            "type": "extentOfNonRevenueWs",
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
                            "type": "extentOfNonRevenueWs",
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
                            "type": "extentOfNonRevenueWs",
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
                            "type": "extentOfNonRevenueWs",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "continuityOfWs",
                    "label": "Continuity of water supplied (hours)",
                    "position": 5,
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
                    "max": 24,
                    "min": 0,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "continuityOfWs",
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
                            "type": "continuityOfWs",
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
                            "type": "continuityOfWs",
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
                            "type": "continuityOfWs",
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
                            "type": "continuityOfWs",
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
                            "type": "continuityOfWs",
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
                            "type": "continuityOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "efficiencyInRedressalCustomerWs",
                    "label": "Efficiency in redressal of customer complaints related to water supply (%)",
                    "position": 6,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
                        {
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
                            "label": "FY 2022-23",
                            "key": "2022-23",
                            "position": 1,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2021-22",
                            "key": "2021-22",
                            "position": 2,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2020-21",
                            "key": "2020-21",
                            "position": 3,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2019-20",
                            "key": "2019-20",
                            "position": 4,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2018-19",
                            "key": "2018-19",
                            "position": 5,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2017-18",
                            "key": "2017-18",
                            "position": 6,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2016-17",
                            "key": "2016-17",
                            "position": 7,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2015-16",
                            "key": "2015-16",
                            "position": 8,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "qualityOfWs",
                    "label": "Quality of water supplied (%)",
                    "position": 7,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "qualityOfWs",
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
                            "type": "qualityOfWs",
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
                            "type": "qualityOfWs",
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
                            "type": "qualityOfWs",
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
                            "type": "qualityOfWs",
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
                            "type": "qualityOfWs",
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
                            "type": "qualityOfWs",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "costRecoveryInWs",
                    "label": "Cost recovery in water supply service (%)",
                    "position": 8,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "costRecoveryInWs",
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
                            "type": "costRecoveryInWs",
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
                            "type": "costRecoveryInWs",
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
                            "type": "costRecoveryInWs",
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
                            "type": "costRecoveryInWs",
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
                            "type": "costRecoveryInWs",
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
                            "type": "costRecoveryInWs",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "efficiencyInCollectionRelatedWs",
                    "label": "Efficiency in collection of water supply-related charges (%)",
                    "position": 9,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
                        {
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
                            "label": "FY 2022-23",
                            "key": "2022-23",
                            "position": 1,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2021-22",
                            "key": "2021-22",
                            "position": 2,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2020-21",
                            "key": "2020-21",
                            "position": 3,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2019-20",
                            "key": "2019-20",
                            "position": 4,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2018-19",
                            "key": "2018-19",
                            "position": 5,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2017-18",
                            "key": "2017-18",
                            "position": 6,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2016-17",
                            "key": "2016-17",
                            "position": 7,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2015-16",
                            "key": "2015-16",
                            "position": 8,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "amount",
                            "value": ""
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
            "key": "sewerage",
            "section": "accordion",
            "formFieldType": "table",
            "label": "II. SEWERAGE",
            "tableRow": [
                {
                    "key": "coverageOfToiletsSew",
                    "label": "Coverage of toilets (%)",
                    "position": 10,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "coverageOfToiletsSew",
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
                            "type": "coverageOfToiletsSew",
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
                            "type": "coverageOfToiletsSew",
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
                            "type": "coverageOfToiletsSew",
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
                            "type": "coverageOfToiletsSew",
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
                            "type": "coverageOfToiletsSew",
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
                            "type": "coverageOfToiletsSew",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "coverageOfSewNet",
                    "label": "Coverage of sewerage network (%)",
                    "position": 11,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "coverageOfSewNet",
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
                            "type": "coverageOfSewNet",
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
                            "type": "coverageOfSewNet",
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
                            "type": "coverageOfSewNet",
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
                            "type": "coverageOfSewNet",
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
                            "type": "coverageOfSewNet",
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
                            "type": "coverageOfSewNet",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "collectionEfficiencySew",
                    "label": "Collection efficiency of sewerage network (%)",
                    "position": 12,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "collectionEfficiencySew",
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
                            "type": "collectionEfficiencySew",
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
                            "type": "collectionEfficiencySew",
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
                            "type": "collectionEfficiencySew",
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
                            "type": "collectionEfficiencySew",
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
                            "type": "collectionEfficiencySew",
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
                            "type": "collectionEfficiencySew",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "adequacyOfSew",
                    "label": "Adequacy of sewerage treatment capacity (%)",
                    "position": 13,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "adequacyOfSew",
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
                            "type": "adequacyOfSew",
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
                            "type": "adequacyOfSew",
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
                            "type": "adequacyOfSew",
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
                            "type": "adequacyOfSew",
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
                            "type": "adequacyOfSew",
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
                            "type": "adequacyOfSew",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "qualityOfSew",
                    "label": "Quality of sewerage treatment (%)",
                    "position": 14,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "qualityOfSew",
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
                            "type": "qualityOfSew",
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
                            "type": "qualityOfSew",
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
                            "type": "qualityOfSew",
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
                            "type": "qualityOfSew",
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
                            "type": "qualityOfSew",
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
                            "type": "qualityOfSew",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "extentOfReuseSew",
                    "label": "Extent of reuse and recycling of sewage (%)",
                    "position": 15,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "extentOfReuseSew",
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
                            "type": "extentOfReuseSew",
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
                            "type": "extentOfReuseSew",
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
                            "type": "extentOfReuseSew",
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
                            "type": "extentOfReuseSew",
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
                            "type": "extentOfReuseSew",
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
                            "type": "extentOfReuseSew",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "efficiencyInRedressalCustomerSew",
                    "label": "Efficiency in redressal of customer complaints related to sewerage (%)",
                    "position": 16,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "efficiencyInRedressalCustomerSew",
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
                            "type": "efficiencyInRedressalCustomerSew",
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
                            "type": "efficiencyInRedressalCustomerSew",
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
                            "type": "efficiencyInRedressalCustomerSew",
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
                            "type": "efficiencyInRedressalCustomerSew",
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
                            "type": "efficiencyInRedressalCustomerSew",
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
                            "type": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "extentOfCostWaterSew",
                    "label": "Extent of cost recovery in waste water management (%)",
                    "position": 17,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "extentOfCostWaterSew",
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
                            "type": "extentOfCostWaterSew",
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
                            "type": "extentOfCostWaterSew",
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
                            "type": "extentOfCostWaterSew",
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
                            "type": "extentOfCostWaterSew",
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
                            "type": "extentOfCostWaterSew",
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
                            "type": "extentOfCostWaterSew",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "efficiencyInCollectionSew",
                    "label": "Efficiency in collection of sewage water charges (%)",
                    "position": 18,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
                        {
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
                            "label": "FY 2022-23",
                            "key": "2022-23",
                            "position": 1,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2021-22",
                            "key": "2021-22",
                            "position": 2,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2020-21",
                            "key": "2020-21",
                            "position": 3,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2019-20",
                            "key": "2019-20",
                            "position": 4,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2018-19",
                            "key": "2018-19",
                            "position": 5,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2017-18",
                            "key": "2017-18",
                            "position": 6,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2016-17",
                            "key": "2016-17",
                            "position": 7,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2015-16",
                            "key": "2015-16",
                            "position": 8,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "amount",
                            "value": ""
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
            "key": "solidWaste",
            "section": "accordion",
            "formFieldType": "table",
            "label": "III. SOLID WASTE MANAGEMENT",
            "tableRow": [
                {
                    "key": "householdLevelCoverageLevelSwm",
                    "label": "Household level coverage (%)",
                    "position": 19,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "householdLevelCoverageLevelSwm",
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
                            "type": "householdLevelCoverageLevelSwm",
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
                            "type": "householdLevelCoverageLevelSwm",
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
                            "type": "householdLevelCoverageLevelSwm",
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
                            "type": "householdLevelCoverageLevelSwm",
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
                            "type": "householdLevelCoverageLevelSwm",
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
                            "type": "householdLevelCoverageLevelSwm",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "efficiencyOfCollectionSwm",
                    "label": "Efficiency of collection of municipal solid waste (%)",
                    "position": 20,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "efficiencyOfCollectionSwm",
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
                            "type": "efficiencyOfCollectionSwm",
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
                            "type": "efficiencyOfCollectionSwm",
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
                            "type": "efficiencyOfCollectionSwm",
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
                            "type": "efficiencyOfCollectionSwm",
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
                            "type": "efficiencyOfCollectionSwm",
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
                            "type": "efficiencyOfCollectionSwm",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "extentOfSegregationSwm",
                    "label": "Extent of segregation of municipal solid waste (%)",
                    "position": 21,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "extentOfSegregationSwm",
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
                            "type": "extentOfSegregationSwm",
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
                            "type": "extentOfSegregationSwm",
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
                            "type": "extentOfSegregationSwm",
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
                            "type": "extentOfSegregationSwm",
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
                            "type": "extentOfSegregationSwm",
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
                            "type": "extentOfSegregationSwm",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "extentOfMunicipalSwm",
                    "label": "Extent of municipal solid waste recovered (%)",
                    "position": 22,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
                        {
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
                            "label": "FY 2022-23",
                            "key": "2022-23",
                            "position": 1,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2021-22",
                            "key": "2021-22",
                            "position": 2,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2020-21",
                            "key": "2020-21",
                            "position": 3,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2019-20",
                            "key": "2019-20",
                            "position": 4,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2018-19",
                            "key": "2018-19",
                            "position": 5,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2017-18",
                            "key": "2017-18",
                            "position": 6,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2016-17",
                            "key": "2016-17",
                            "position": 7,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2015-16",
                            "key": "2015-16",
                            "position": 8,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "extentOfScientificSolidSwm",
                    "label": "Extent of scientific disposal of municipal solid waste (%)",
                    "position": 23,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "extentOfScientificSolidSwm",
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
                            "type": "extentOfScientificSolidSwm",
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
                            "type": "extentOfScientificSolidSwm",
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
                            "type": "extentOfScientificSolidSwm",
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
                            "type": "extentOfScientificSolidSwm",
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
                            "type": "extentOfScientificSolidSwm",
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
                            "type": "extentOfScientificSolidSwm",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "extentOfCostInSwm",
                    "label": "Extent of cost recovery in SWM services (%)",
                    "position": 24,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "extentOfCostInSwm",
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
                            "type": "extentOfCostInSwm",
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
                            "type": "extentOfCostInSwm",
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
                            "type": "extentOfCostInSwm",
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
                            "type": "extentOfCostInSwm",
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
                            "type": "extentOfCostInSwm",
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
                            "type": "extentOfCostInSwm",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "efficiencyInCollectionSwmUser",
                    "label": "Efficiency in collection of SWM user charges (%)",
                    "position": 25,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
                        {
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
                            "label": "FY 2022-23",
                            "key": "2022-23",
                            "position": 1,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2021-22",
                            "key": "2021-22",
                            "position": 2,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2020-21",
                            "key": "2020-21",
                            "position": 3,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2019-20",
                            "key": "2019-20",
                            "position": 4,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2018-19",
                            "key": "2018-19",
                            "position": 5,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2017-18",
                            "key": "2017-18",
                            "position": 6,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2016-17",
                            "key": "2016-17",
                            "position": 7,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2015-16",
                            "key": "2015-16",
                            "position": 8,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "efficiencyInRedressalCustomerSwm",
                    "label": "Efficiency in redressal of customer complaints related to SWM (%)",
                    "position": 26,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
                        {
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
                            "label": "FY 2022-23",
                            "key": "2022-23",
                            "position": 1,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2021-22",
                            "key": "2021-22",
                            "position": 2,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2020-21",
                            "key": "2020-21",
                            "position": 3,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2019-20",
                            "key": "2019-20",
                            "position": 4,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2018-19",
                            "key": "2018-19",
                            "position": 5,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2017-18",
                            "key": "2017-18",
                            "position": 6,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2016-17",
                            "key": "2016-17",
                            "position": 7,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "amount",
                            "value": ""
                        },
                        {
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
                            "label": "FY 2015-16",
                            "key": "2015-16",
                            "position": 8,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "amount",
                            "value": ""
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
            "key": "stromWater",
            "section": "accordion",
            "formFieldType": "table",
            "label": "IV. STROM WATER DRAINAGE",
            "tableRow": [
                {
                    "key": "coverageOfStormDrainage",
                    "label": "Coverage of storm water drainage network (%)",
                    "position": 27,
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
                    "max": 100,
                    "min": 0,
                    "decimal": 2,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "coverageOfStormDrainage",
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
                            "type": "coverageOfStormDrainage",
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
                            "type": "coverageOfStormDrainage",
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
                            "type": "coverageOfStormDrainage",
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
                            "type": "coverageOfStormDrainage",
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
                            "type": "coverageOfStormDrainage",
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
                            "type": "coverageOfStormDrainage",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                },
                {
                    "key": "incidenceOfWaterLogging",
                    "label": "Incidence of water logging",
                    "position": 28,
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
                    "max": 9999,
                    "min": 0,
                    "decimal": 0,
                    "validation": "",
                    "logic": "",
                    "tableData": [
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
                            "type": "incidenceOfWaterLogging",
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
                            "type": "incidenceOfWaterLogging",
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
                            "type": "incidenceOfWaterLogging",
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
                            "type": "incidenceOfWaterLogging",
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
                            "type": "incidenceOfWaterLogging",
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
                            "type": "incidenceOfWaterLogging",
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
                            "type": "incidenceOfWaterLogging",
                            "formFieldType": "amount",
                            "value": ""
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true,
                    "readonly": false
                }
            ]
        }
    ]
}