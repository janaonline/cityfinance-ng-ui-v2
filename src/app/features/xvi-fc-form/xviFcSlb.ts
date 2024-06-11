// export const slb = {
//     "_id": "665df95e73de1812233ecc07",
//     "key": "serviceLevelBenchmark",
//     "icon": "",
//     "text": "",
//     "formType": "form2",
//     "label": "Service Level Benchmark Data",
//     "id": "s5",
//     "displayPriority": 5,
//     "__v": 0,
//     "data": [
//         {
//             "key": "waterSupply",
//             "section": "accordion",
//             "formFieldType": "table",
//             "label": "I. WATER SUPPLY",
//             "data": [
//                 {
//                     "key": "coverageOfWs",
//                     "label": "Coverage of water supply connections (%)",
//                     "position": 1,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "coverageOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "coverageOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "coverageOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "coverageOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "coverageOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "coverageOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "coverageOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "coverageOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "perCapitaOfWs",
//                     "label": "Per capita supply of water(lpcd)",
//                     "position": 2,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 999,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 135,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "perCapitaOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 135,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "perCapitaOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 135,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "perCapitaOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 135,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "perCapitaOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 135,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "perCapitaOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 135,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "perCapitaOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 135,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "perCapitaOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 135,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 135 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "perCapitaOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "extentOfMeteringWs",
//                     "label": "Extent of metering of water connections (%)",
//                     "position": 3,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "extentOfMeteringWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "extentOfMeteringWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "extentOfMeteringWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "extentOfMeteringWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "extentOfMeteringWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "extentOfMeteringWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "extentOfMeteringWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "extentOfMeteringWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "extentOfNonRevenueWs",
//                     "label": "Extent of non-revenue water (NRW) (%)",
//                     "position": 4,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "extentOfNonRevenueWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "extentOfNonRevenueWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "extentOfNonRevenueWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "extentOfNonRevenueWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "extentOfNonRevenueWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "extentOfNonRevenueWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "extentOfNonRevenueWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "extentOfNonRevenueWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "continuityOfWs",
//                     "label": "Continuity of water supplied (hours)",
//                     "position": 5,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 24,
//                     "min": 0,
//                     "decimal": 0,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "continuityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "continuityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "continuityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "continuityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "continuityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "continuityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "continuityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "continuityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "efficiencyInRedressalCustomerWs",
//                     "label": "Efficiency in redressal of customer complaints related to water supply (%)",
//                     "position": 6,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "efficiencyInRedressalCustomerWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "efficiencyInRedressalCustomerWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "efficiencyInRedressalCustomerWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "efficiencyInRedressalCustomerWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "efficiencyInRedressalCustomerWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "efficiencyInRedressalCustomerWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "efficiencyInRedressalCustomerWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "efficiencyInRedressalCustomerWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "qualityOfWs",
//                     "label": "Quality of water supplied (%)",
//                     "position": 7,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "qualityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "qualityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "qualityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "qualityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "qualityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "qualityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "qualityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "qualityOfWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "costRecoveryInWs",
//                     "label": "Cost recovery in water supply service (%)",
//                     "position": 8,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "costRecoveryInWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "costRecoveryInWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "costRecoveryInWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "costRecoveryInWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "costRecoveryInWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "costRecoveryInWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "costRecoveryInWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "costRecoveryInWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "efficiencyInCollectionRelatedWs",
//                     "label": "Efficiency in collection of water supply-related charges (%)",
//                     "position": 9,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "efficiencyInCollectionRelatedWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "efficiencyInCollectionRelatedWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "efficiencyInCollectionRelatedWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "efficiencyInCollectionRelatedWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "efficiencyInCollectionRelatedWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "efficiencyInCollectionRelatedWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "efficiencyInCollectionRelatedWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "efficiencyInCollectionRelatedWs",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 }
//             ]
//         },
//         {
//             "key": "sewerage",
//             "section": "accordion",
//             "formFieldType": "table",
//             "label": "II. SEWERAGE",
//             "data": [
//                 {
//                     "key": "coverageOfToiletsSew",
//                     "label": "Coverage of toilets (%)",
//                     "position": 10,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "coverageOfToiletsSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "coverageOfToiletsSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "coverageOfToiletsSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "coverageOfToiletsSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "coverageOfToiletsSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "coverageOfToiletsSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "coverageOfToiletsSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "coverageOfToiletsSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "coverageOfSewNet",
//                     "label": "Coverage of sewerage network (%)",
//                     "position": 11,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "coverageOfSewNet",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "coverageOfSewNet",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "coverageOfSewNet",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "coverageOfSewNet",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "coverageOfSewNet",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "coverageOfSewNet",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "coverageOfSewNet",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "coverageOfSewNet",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "collectionEfficiencySew",
//                     "label": "Collection efficiency of sewerage network (%)",
//                     "position": 12,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "collectionEfficiencySew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "collectionEfficiencySew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "collectionEfficiencySew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "collectionEfficiencySew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "collectionEfficiencySew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "collectionEfficiencySew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "collectionEfficiencySew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "collectionEfficiencySew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "adequacyOfSew",
//                     "label": "Adequacy of sewerage treatment capacity (%)",
//                     "position": 13,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "adequacyOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "adequacyOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "adequacyOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "adequacyOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "adequacyOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "adequacyOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "adequacyOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "adequacyOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "qualityOfSew",
//                     "label": "Quality of sewerage treatment (%)",
//                     "position": 14,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "qualityOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "qualityOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "qualityOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "qualityOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "qualityOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "qualityOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "qualityOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "qualityOfSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "extentOfReuseSew",
//                     "label": "Extent of reuse and recycling of sewage (%)",
//                     "position": 15,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "extentOfReuseSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "extentOfReuseSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "extentOfReuseSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "extentOfReuseSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "extentOfReuseSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "extentOfReuseSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "extentOfReuseSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "extentOfReuseSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "efficiencyInRedressalCustomerSew",
//                     "label": "Efficiency in redressal of customer complaints related to sewerage (%)",
//                     "position": 16,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "efficiencyInRedressalCustomerSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "efficiencyInRedressalCustomerSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "efficiencyInRedressalCustomerSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "efficiencyInRedressalCustomerSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "efficiencyInRedressalCustomerSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "efficiencyInRedressalCustomerSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "efficiencyInRedressalCustomerSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "efficiencyInRedressalCustomerSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "extentOfCostWaterSew",
//                     "label": "Extent of cost recovery in waste water management (%)",
//                     "position": 17,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "extentOfCostWaterSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "extentOfCostWaterSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "extentOfCostWaterSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "extentOfCostWaterSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "extentOfCostWaterSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "extentOfCostWaterSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "extentOfCostWaterSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "extentOfCostWaterSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "efficiencyInCollectionSew",
//                     "label": "Efficiency in collection of sewage water charges (%)",
//                     "position": 18,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "efficiencyInCollectionSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "efficiencyInCollectionSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "efficiencyInCollectionSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "efficiencyInCollectionSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "efficiencyInCollectionSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "efficiencyInCollectionSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "efficiencyInCollectionSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "efficiencyInCollectionSew",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 }
//             ]
//         },
//         {
//             "key": "solidWaste",
//             "section": "accordion",
//             "formFieldType": "table",
//             "label": "III. SOLID WASTE MANAGEMENT",
//             "data": [
//                 {
//                     "key": "householdLevelCoverageLevelSwm",
//                     "label": "Household level coverage (%)",
//                     "position": 19,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "householdLevelCoverageLevelSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "householdLevelCoverageLevelSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "householdLevelCoverageLevelSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "householdLevelCoverageLevelSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "householdLevelCoverageLevelSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "householdLevelCoverageLevelSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "householdLevelCoverageLevelSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "householdLevelCoverageLevelSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "efficiencyOfCollectionSwm",
//                     "label": "Efficiency of collection of municipal solid waste (%)",
//                     "position": 20,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "efficiencyOfCollectionSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "efficiencyOfCollectionSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "efficiencyOfCollectionSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "efficiencyOfCollectionSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "efficiencyOfCollectionSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "efficiencyOfCollectionSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "efficiencyOfCollectionSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "efficiencyOfCollectionSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "extentOfSegregationSwm",
//                     "label": "Extent of segregation of municipal solid waste (%)",
//                     "position": 21,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "extentOfSegregationSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "extentOfSegregationSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "extentOfSegregationSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "extentOfSegregationSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "extentOfSegregationSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "extentOfSegregationSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "extentOfSegregationSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "extentOfSegregationSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "extentOfMunicipalSwm",
//                     "label": "Extent of municipal solid waste recovered (%)",
//                     "position": 22,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "extentOfMunicipalSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "extentOfMunicipalSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "extentOfMunicipalSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "extentOfMunicipalSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "extentOfMunicipalSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "extentOfMunicipalSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "extentOfMunicipalSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "extentOfMunicipalSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "extentOfScientificSolidSwm",
//                     "label": "Extent of scientific disposal of municipal solid waste (%)",
//                     "position": 23,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "extentOfScientificSolidSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "extentOfScientificSolidSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "extentOfScientificSolidSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "extentOfScientificSolidSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "extentOfScientificSolidSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "extentOfScientificSolidSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "extentOfScientificSolidSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "extentOfScientificSolidSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "extentOfCostInSwm",
//                     "label": "Extent of cost recovery in SWM services (%)",
//                     "position": 24,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "extentOfCostInSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "extentOfCostInSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "extentOfCostInSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "extentOfCostInSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "extentOfCostInSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "extentOfCostInSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "extentOfCostInSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "extentOfCostInSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "efficiencyInCollectionSwmUser",
//                     "label": "Efficiency in collection of SWM user charges (%)",
//                     "position": 25,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "efficiencyInCollectionSwmUser",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "efficiencyInCollectionSwmUser",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "efficiencyInCollectionSwmUser",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "efficiencyInCollectionSwmUser",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "efficiencyInCollectionSwmUser",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "efficiencyInCollectionSwmUser",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "efficiencyInCollectionSwmUser",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 90,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 90 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "efficiencyInCollectionSwmUser",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "efficiencyInRedressalCustomerSwm",
//                     "label": "Efficiency in redressal of customer complaints related to SWM (%)",
//                     "position": 26,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "efficiencyInRedressalCustomerSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "efficiencyInRedressalCustomerSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "efficiencyInRedressalCustomerSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "efficiencyInRedressalCustomerSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "efficiencyInRedressalCustomerSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "efficiencyInRedressalCustomerSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "efficiencyInRedressalCustomerSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 },
//                                 {
//                                     "value": 80,
//                                     "condition": "gt",
//                                     "message": "Please note that the entered value exceeds the threshold of 80 lpcd"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "efficiencyInRedressalCustomerSwm",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 }
//             ]
//         },
//         {
//             "key": "stromWater",
//             "section": "accordion",
//             "formFieldType": "table",
//             "label": "IV. STROM WATER DRAINAGE",
//             "data": [
//                 {
//                     "key": "coverageOfStormDrainage",
//                     "label": "Coverage of storm water drainage network (%)",
//                     "position": 27,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 100,
//                     "min": 0,
//                     "decimal": 2,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "coverageOfStormDrainage",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "coverageOfStormDrainage",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "coverageOfStormDrainage",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "coverageOfStormDrainage",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "coverageOfStormDrainage",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "coverageOfStormDrainage",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "coverageOfStormDrainage",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "coverageOfStormDrainage",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 },
//                 {
//                     "key": "incidenceOfWaterLogging",
//                     "label": "Incidence of water logging",
//                     "position": 28,
//                     "required": true,
//                     "info": "",
//                     "placeHolder": "",
//                     "formFieldType": "amount",
//                     "canShow": true,
//                     "warning": [
//                         {
//                             "value": 0,
//                             "condition": "eq",
//                             "message": "Are you sure you want to continue with 0"
//                         }
//                     ],
//                     "max": 9999,
//                     "min": 0,
//                     "decimal": 0,
//                     "validation": "",
//                     "logic": "",
//                     "year": [
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2022-23",
//                             "key": "2022-23",
//                             "position": 1,
//                             "type": "incidenceOfWaterLogging",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2021-22",
//                             "key": "2021-22",
//                             "position": 2,
//                             "type": "incidenceOfWaterLogging",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2020-21",
//                             "key": "2020-21",
//                             "position": 3,
//                             "type": "incidenceOfWaterLogging",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2019-20",
//                             "key": "2019-20",
//                             "position": 4,
//                             "type": "incidenceOfWaterLogging",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2018-19",
//                             "key": "2018-19",
//                             "position": 5,
//                             "type": "incidenceOfWaterLogging",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2017-18",
//                             "key": "2017-18",
//                             "position": 6,
//                             "type": "incidenceOfWaterLogging",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2016-17",
//                             "key": "2016-17",
//                             "position": 7,
//                             "type": "incidenceOfWaterLogging",
//                             "formFieldType": "amount",
//                             "value": ""
//                         },
//                         {
//                             "warning": [
//                                 {
//                                     "value": 0,
//                                     "condition": "eq",
//                                     "message": "Are you sure you want to continue with 0"
//                                 }
//                             ],
//                             "label": "FY 2015-16",
//                             "key": "2015-16",
//                             "position": 8,
//                             "type": "incidenceOfWaterLogging",
//                             "formFieldType": "amount",
//                             "value": ""
//                         }
//                     ],
//                     "status": "Na",
//                     "value": "",
//                     "isDraft": true,
//                     "readonly": false
//                 }
//             ]
//         }
//     ]
// }

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
                    "readOnly": false,
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
                            "key": "fy2022-23_coverageOfWs",
                            "position": 1,
                            "type": "coverageOfWs",
                            "formFieldType": "number",
                            "value": 97
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
                            "key": "fy2021-22_coverageOfWs",
                            "position": 2,
                            "type": "coverageOfWs",
                            "formFieldType": "number",
                            "value": 47
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
                            "key": "fy2020-21_coverageOfWs",
                            "position": 3,
                            "type": "coverageOfWs",
                            "formFieldType": "number",
                            "value": 59
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
                            "key": "fy2019-20_coverageOfWs",
                            "position": 4,
                            "type": "coverageOfWs",
                            "formFieldType": "number",
                            "value": 13
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
                            "key": "fy2018-19_coverageOfWs",
                            "position": 5,
                            "type": "coverageOfWs",
                            "formFieldType": "number",
                            "value": 75
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
                            "key": "fy2017-18_coverageOfWs",
                            "position": 6,
                            "type": "coverageOfWs",
                            "formFieldType": "number",
                            "value": 39
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
                            "key": "fy2016-17_coverageOfWs",
                            "position": 7,
                            "type": "coverageOfWs",
                            "formFieldType": "number",
                            "value": 49
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "perCapitaOfWs",
                    "readOnly": false,
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
                            "key": "fy2022-23_perCapitaOfWs",
                            "position": 1,
                            "type": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": 47
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
                            "key": "fy2021-22_perCapitaOfWs",
                            "position": 2,
                            "type": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": 18
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
                            "key": "fy2020-21_perCapitaOfWs",
                            "position": 3,
                            "type": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": 62
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
                            "key": "fy2019-20_perCapitaOfWs",
                            "position": 4,
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
                            "label": "FY 2018-19",
                            "key": "fy2018-19_perCapitaOfWs",
                            "position": 5,
                            "type": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": 15
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
                            "key": "fy2017-18_perCapitaOfWs",
                            "position": 6,
                            "type": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": 23
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
                            "key": "fy2016-17_perCapitaOfWs",
                            "position": 7,
                            "type": "perCapitaOfWs",
                            "formFieldType": "number",
                            "value": 77
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "extentOfMeteringWs",
                    "readOnly": false,
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
                            "key": "fy2022-23_extentOfMeteringWs",
                            "position": 1,
                            "type": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": 60
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
                            "key": "fy2021-22_extentOfMeteringWs",
                            "position": 2,
                            "type": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": 36
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
                            "key": "fy2020-21_extentOfMeteringWs",
                            "position": 3,
                            "type": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": 63
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
                            "key": "fy2019-20_extentOfMeteringWs",
                            "position": 4,
                            "type": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": 4
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
                            "key": "fy2018-19_extentOfMeteringWs",
                            "position": 5,
                            "type": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": 57
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
                            "key": "fy2017-18_extentOfMeteringWs",
                            "position": 6,
                            "type": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": 61
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
                            "key": "fy2016-17_extentOfMeteringWs",
                            "position": 7,
                            "type": "extentOfMeteringWs",
                            "formFieldType": "number",
                            "value": 60
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "extentOfNonRevenueWs",
                    "readOnly": false,
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
                            "key": "fy2022-23_extentOfNonRevenueWs",
                            "position": 1,
                            "type": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": 32
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
                            "key": "fy2021-22_extentOfNonRevenueWs",
                            "position": 2,
                            "type": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": 43
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
                            "key": "fy2020-21_extentOfNonRevenueWs",
                            "position": 3,
                            "type": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": 68
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
                            "key": "fy2019-20_extentOfNonRevenueWs",
                            "position": 4,
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
                            "label": "FY 2018-19",
                            "key": "fy2018-19_extentOfNonRevenueWs",
                            "position": 5,
                            "type": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": 56
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
                            "key": "fy2017-18_extentOfNonRevenueWs",
                            "position": 6,
                            "type": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": 1
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
                            "key": "fy2016-17_extentOfNonRevenueWs",
                            "position": 7,
                            "type": "extentOfNonRevenueWs",
                            "formFieldType": "number",
                            "value": 74
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "continuityOfWs",
                    "readOnly": false,
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
                            "key": "fy2022-23_continuityOfWs",
                            "position": 1,
                            "type": "continuityOfWs",
                            "formFieldType": "number",
                            "value": 2
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
                            "key": "fy2021-22_continuityOfWs",
                            "position": 2,
                            "type": "continuityOfWs",
                            "formFieldType": "number",
                            "value": 20
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
                            "key": "fy2020-21_continuityOfWs",
                            "position": 3,
                            "type": "continuityOfWs",
                            "formFieldType": "number",
                            "value": 17
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
                            "key": "fy2019-20_continuityOfWs",
                            "position": 4,
                            "type": "continuityOfWs",
                            "formFieldType": "number",
                            "value": 12
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
                            "key": "fy2018-19_continuityOfWs",
                            "position": 5,
                            "type": "continuityOfWs",
                            "formFieldType": "number",
                            "value": 11
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
                            "key": "fy2017-18_continuityOfWs",
                            "position": 6,
                            "type": "continuityOfWs",
                            "formFieldType": "number",
                            "value": 5
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
                            "key": "fy2016-17_continuityOfWs",
                            "position": 7,
                            "type": "continuityOfWs",
                            "formFieldType": "number",
                            "value": 10
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "efficiencyInRedressalCustomerWs",
                    "readOnly": false,
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
                            "key": "fy2022-23_efficiencyInRedressalCustomerWs",
                            "position": 1,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": 90
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
                            "key": "fy2021-22_efficiencyInRedressalCustomerWs",
                            "position": 2,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": 27
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
                            "key": "fy2020-21_efficiencyInRedressalCustomerWs",
                            "position": 3,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": 92
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
                            "key": "fy2019-20_efficiencyInRedressalCustomerWs",
                            "position": 4,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": 35
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
                            "key": "fy2018-19_efficiencyInRedressalCustomerWs",
                            "position": 5,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": 38
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
                            "key": "fy2017-18_efficiencyInRedressalCustomerWs",
                            "position": 6,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": 32
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
                            "key": "fy2016-17_efficiencyInRedressalCustomerWs",
                            "position": 7,
                            "type": "efficiencyInRedressalCustomerWs",
                            "formFieldType": "number",
                            "value": 20
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "qualityOfWs",
                    "readOnly": false,
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
                            "key": "fy2022-23_qualityOfWs",
                            "position": 1,
                            "type": "qualityOfWs",
                            "formFieldType": "number",
                            "value": 39
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
                            "key": "fy2021-22_qualityOfWs",
                            "position": 2,
                            "type": "qualityOfWs",
                            "formFieldType": "number",
                            "value": 51
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
                            "key": "fy2020-21_qualityOfWs",
                            "position": 3,
                            "type": "qualityOfWs",
                            "formFieldType": "number",
                            "value": 49
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
                            "key": "fy2019-20_qualityOfWs",
                            "position": 4,
                            "type": "qualityOfWs",
                            "formFieldType": "number",
                            "value": 31
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
                            "key": "fy2018-19_qualityOfWs",
                            "position": 5,
                            "type": "qualityOfWs",
                            "formFieldType": "number",
                            "value": 58
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
                            "key": "fy2017-18_qualityOfWs",
                            "position": 6,
                            "type": "qualityOfWs",
                            "formFieldType": "number",
                            "value": 17
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
                            "key": "fy2016-17_qualityOfWs",
                            "position": 7,
                            "type": "qualityOfWs",
                            "formFieldType": "number",
                            "value": 73
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "costRecoveryInWs",
                    "readOnly": false,
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
                            "key": "fy2022-23_costRecoveryInWs",
                            "position": 1,
                            "type": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": 49
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
                            "key": "fy2021-22_costRecoveryInWs",
                            "position": 2,
                            "type": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": 15
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
                            "key": "fy2020-21_costRecoveryInWs",
                            "position": 3,
                            "type": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": 1
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
                            "key": "fy2019-20_costRecoveryInWs",
                            "position": 4,
                            "type": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": 22
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
                            "key": "fy2018-19_costRecoveryInWs",
                            "position": 5,
                            "type": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": 20
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
                            "key": "fy2017-18_costRecoveryInWs",
                            "position": 6,
                            "type": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": 12
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
                            "key": "fy2016-17_costRecoveryInWs",
                            "position": 7,
                            "type": "costRecoveryInWs",
                            "formFieldType": "number",
                            "value": 38
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "efficiencyInCollectionRelatedWs",
                    "readOnly": false,
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
                            "key": "fy2022-23_efficiencyInCollectionRelatedWs",
                            "position": 1,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": 29
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
                            "key": "fy2021-22_efficiencyInCollectionRelatedWs",
                            "position": 2,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": 85
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
                            "key": "fy2020-21_efficiencyInCollectionRelatedWs",
                            "position": 3,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": 56
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
                            "key": "fy2019-20_efficiencyInCollectionRelatedWs",
                            "position": 4,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": 38
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
                            "key": "fy2018-19_efficiencyInCollectionRelatedWs",
                            "position": 5,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": 66
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
                            "key": "fy2017-18_efficiencyInCollectionRelatedWs",
                            "position": 6,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": 77
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
                            "key": "fy2016-17_efficiencyInCollectionRelatedWs",
                            "position": 7,
                            "type": "efficiencyInCollectionRelatedWs",
                            "formFieldType": "number",
                            "value": 96
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
                    "readOnly": false,
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
                            "key": "fy2022-23_coverageOfToiletsSew",
                            "position": 1,
                            "type": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": 11
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
                            "key": "fy2021-22_coverageOfToiletsSew",
                            "position": 2,
                            "type": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": 30
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
                            "key": "fy2020-21_coverageOfToiletsSew",
                            "position": 3,
                            "type": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": 7
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
                            "key": "fy2019-20_coverageOfToiletsSew",
                            "position": 4,
                            "type": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": 21
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
                            "key": "fy2018-19_coverageOfToiletsSew",
                            "position": 5,
                            "type": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": 47
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
                            "key": "fy2017-18_coverageOfToiletsSew",
                            "position": 6,
                            "type": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": 31
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
                            "key": "fy2016-17_coverageOfToiletsSew",
                            "position": 7,
                            "type": "coverageOfToiletsSew",
                            "formFieldType": "number",
                            "value": 16
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "coverageOfSewNet",
                    "readOnly": false,
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
                            "key": "fy2022-23_coverageOfSewNet",
                            "position": 1,
                            "type": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": 33
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
                            "key": "fy2021-22_coverageOfSewNet",
                            "position": 2,
                            "type": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": 92
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
                            "key": "fy2020-21_coverageOfSewNet",
                            "position": 3,
                            "type": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": 54
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
                            "key": "fy2019-20_coverageOfSewNet",
                            "position": 4,
                            "type": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": 13
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
                            "key": "fy2018-19_coverageOfSewNet",
                            "position": 5,
                            "type": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": 4
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
                            "key": "fy2017-18_coverageOfSewNet",
                            "position": 6,
                            "type": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": 92
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
                            "key": "fy2016-17_coverageOfSewNet",
                            "position": 7,
                            "type": "coverageOfSewNet",
                            "formFieldType": "number",
                            "value": 69
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "collectionEfficiencySew",
                    "readOnly": false,
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
                            "key": "fy2022-23_collectionEfficiencySew",
                            "position": 1,
                            "type": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": 11
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
                            "key": "fy2021-22_collectionEfficiencySew",
                            "position": 2,
                            "type": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": 42
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
                            "key": "fy2020-21_collectionEfficiencySew",
                            "position": 3,
                            "type": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": 26
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
                            "key": "fy2019-20_collectionEfficiencySew",
                            "position": 4,
                            "type": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": 96
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
                            "key": "fy2018-19_collectionEfficiencySew",
                            "position": 5,
                            "type": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": 66
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
                            "key": "fy2017-18_collectionEfficiencySew",
                            "position": 6,
                            "type": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": 32
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
                            "key": "fy2016-17_collectionEfficiencySew",
                            "position": 7,
                            "type": "collectionEfficiencySew",
                            "formFieldType": "number",
                            "value": 8
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "adequacyOfSew",
                    "readOnly": false,
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
                            "key": "fy2022-23_adequacyOfSew",
                            "position": 1,
                            "type": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": 42
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
                            "key": "fy2021-22_adequacyOfSew",
                            "position": 2,
                            "type": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": 31
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
                            "key": "fy2020-21_adequacyOfSew",
                            "position": 3,
                            "type": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": 90
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
                            "key": "fy2019-20_adequacyOfSew",
                            "position": 4,
                            "type": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": 94
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
                            "key": "fy2018-19_adequacyOfSew",
                            "position": 5,
                            "type": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": 65
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
                            "key": "fy2017-18_adequacyOfSew",
                            "position": 6,
                            "type": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": 67
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
                            "key": "fy2016-17_adequacyOfSew",
                            "position": 7,
                            "type": "adequacyOfSew",
                            "formFieldType": "number",
                            "value": 62
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "qualityOfSew",
                    "readOnly": false,
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
                            "key": "fy2022-23_qualityOfSew",
                            "position": 1,
                            "type": "qualityOfSew",
                            "formFieldType": "number",
                            "value": 10
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
                            "key": "fy2021-22_qualityOfSew",
                            "position": 2,
                            "type": "qualityOfSew",
                            "formFieldType": "number",
                            "value": 12
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
                            "key": "fy2020-21_qualityOfSew",
                            "position": 3,
                            "type": "qualityOfSew",
                            "formFieldType": "number",
                            "value": 1
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
                            "key": "fy2019-20_qualityOfSew",
                            "position": 4,
                            "type": "qualityOfSew",
                            "formFieldType": "number",
                            "value": 68
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
                            "key": "fy2018-19_qualityOfSew",
                            "position": 5,
                            "type": "qualityOfSew",
                            "formFieldType": "number",
                            "value": 12
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
                            "key": "fy2017-18_qualityOfSew",
                            "position": 6,
                            "type": "qualityOfSew",
                            "formFieldType": "number",
                            "value": 14
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
                            "key": "fy2016-17_qualityOfSew",
                            "position": 7,
                            "type": "qualityOfSew",
                            "formFieldType": "number",
                            "value": 65
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "extentOfReuseSew",
                    "readOnly": false,
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
                            "key": "fy2022-23_extentOfReuseSew",
                            "position": 1,
                            "type": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": 69
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
                            "key": "fy2021-22_extentOfReuseSew",
                            "position": 2,
                            "type": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": 56
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
                            "key": "fy2020-21_extentOfReuseSew",
                            "position": 3,
                            "type": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": 83
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
                            "key": "fy2019-20_extentOfReuseSew",
                            "position": 4,
                            "type": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": 61
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
                            "key": "fy2018-19_extentOfReuseSew",
                            "position": 5,
                            "type": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": 59
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
                            "key": "fy2017-18_extentOfReuseSew",
                            "position": 6,
                            "type": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": 82
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
                            "key": "fy2016-17_extentOfReuseSew",
                            "position": 7,
                            "type": "extentOfReuseSew",
                            "formFieldType": "number",
                            "value": 38
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "efficiencyInRedressalCustomerSew",
                    "readOnly": false,
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
                            "key": "fy2022-23_efficiencyInRedressalCustomerSew",
                            "position": 1,
                            "type": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": 44
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
                            "key": "fy2021-22_efficiencyInRedressalCustomerSew",
                            "position": 2,
                            "type": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": 31
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
                            "key": "fy2020-21_efficiencyInRedressalCustomerSew",
                            "position": 3,
                            "type": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": 51
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
                            "key": "fy2019-20_efficiencyInRedressalCustomerSew",
                            "position": 4,
                            "type": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": 75
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
                            "key": "fy2018-19_efficiencyInRedressalCustomerSew",
                            "position": 5,
                            "type": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": 24
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
                            "key": "fy2017-18_efficiencyInRedressalCustomerSew",
                            "position": 6,
                            "type": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": 16
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
                            "key": "fy2016-17_efficiencyInRedressalCustomerSew",
                            "position": 7,
                            "type": "efficiencyInRedressalCustomerSew",
                            "formFieldType": "number",
                            "value": 46
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "extentOfCostWaterSew",
                    "readOnly": false,
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
                            "key": "fy2022-23_extentOfCostWaterSew",
                            "position": 1,
                            "type": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": 87
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
                            "key": "fy2021-22_extentOfCostWaterSew",
                            "position": 2,
                            "type": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": 18
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
                            "key": "fy2020-21_extentOfCostWaterSew",
                            "position": 3,
                            "type": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": 83
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
                            "key": "fy2019-20_extentOfCostWaterSew",
                            "position": 4,
                            "type": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": 85
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
                            "key": "fy2018-19_extentOfCostWaterSew",
                            "position": 5,
                            "type": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": 3
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
                            "key": "fy2017-18_extentOfCostWaterSew",
                            "position": 6,
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
                            "label": "FY 2016-17",
                            "key": "fy2016-17_extentOfCostWaterSew",
                            "position": 7,
                            "type": "extentOfCostWaterSew",
                            "formFieldType": "number",
                            "value": 9
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "efficiencyInCollectionSew",
                    "readOnly": false,
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
                            "key": "fy2022-23_efficiencyInCollectionSew",
                            "position": 1,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": 2
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
                            "key": "fy2021-22_efficiencyInCollectionSew",
                            "position": 2,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": 24
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
                            "key": "fy2020-21_efficiencyInCollectionSew",
                            "position": 3,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": 61
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
                            "key": "fy2019-20_efficiencyInCollectionSew",
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
                            "key": "fy2018-19_efficiencyInCollectionSew",
                            "position": 5,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": 17
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
                            "key": "fy2017-18_efficiencyInCollectionSew",
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
                            "key": "fy2016-17_efficiencyInCollectionSew",
                            "position": 7,
                            "type": "efficiencyInCollectionSew",
                            "formFieldType": "number",
                            "value": 26
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
                    "readOnly": false,
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
                            "key": "fy2022-23_householdLevelCoverageLevelSwm",
                            "position": 1,
                            "type": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": 8
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
                            "key": "fy2021-22_householdLevelCoverageLevelSwm",
                            "position": 2,
                            "type": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": 45
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
                            "key": "fy2020-21_householdLevelCoverageLevelSwm",
                            "position": 3,
                            "type": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": 41
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
                            "key": "fy2019-20_householdLevelCoverageLevelSwm",
                            "position": 4,
                            "type": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": 74
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
                            "key": "fy2018-19_householdLevelCoverageLevelSwm",
                            "position": 5,
                            "type": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": 2
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
                            "key": "fy2017-18_householdLevelCoverageLevelSwm",
                            "position": 6,
                            "type": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": 94
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
                            "key": "fy2016-17_householdLevelCoverageLevelSwm",
                            "position": 7,
                            "type": "householdLevelCoverageLevelSwm",
                            "formFieldType": "number",
                            "value": 99
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "efficiencyOfCollectionSwm",
                    "readOnly": false,
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
                            "key": "fy2022-23_efficiencyOfCollectionSwm",
                            "position": 1,
                            "type": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": 21
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
                            "key": "fy2021-22_efficiencyOfCollectionSwm",
                            "position": 2,
                            "type": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": 12
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
                            "key": "fy2020-21_efficiencyOfCollectionSwm",
                            "position": 3,
                            "type": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": 14
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
                            "key": "fy2019-20_efficiencyOfCollectionSwm",
                            "position": 4,
                            "type": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": 51
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
                            "key": "fy2018-19_efficiencyOfCollectionSwm",
                            "position": 5,
                            "type": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": 65
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
                            "key": "fy2017-18_efficiencyOfCollectionSwm",
                            "position": 6,
                            "type": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": 64
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
                            "key": "fy2016-17_efficiencyOfCollectionSwm",
                            "position": 7,
                            "type": "efficiencyOfCollectionSwm",
                            "formFieldType": "number",
                            "value": 57
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "extentOfSegregationSwm",
                    "readOnly": false,
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
                            "key": "fy2022-23_extentOfSegregationSwm",
                            "position": 1,
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
                            "label": "FY 2021-22",
                            "key": "fy2021-22_extentOfSegregationSwm",
                            "position": 2,
                            "type": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": 92
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
                            "key": "fy2020-21_extentOfSegregationSwm",
                            "position": 3,
                            "type": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": 92
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
                            "key": "fy2019-20_extentOfSegregationSwm",
                            "position": 4,
                            "type": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": 52
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
                            "key": "fy2018-19_extentOfSegregationSwm",
                            "position": 5,
                            "type": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": 63
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
                            "key": "fy2017-18_extentOfSegregationSwm",
                            "position": 6,
                            "type": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": 47
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
                            "key": "fy2016-17_extentOfSegregationSwm",
                            "position": 7,
                            "type": "extentOfSegregationSwm",
                            "formFieldType": "number",
                            "value": 70
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "extentOfMunicipalSwm",
                    "readOnly": false,
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
                            "key": "fy2022-23_extentOfMunicipalSwm",
                            "position": 1,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": 48
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
                            "key": "fy2021-22_extentOfMunicipalSwm",
                            "position": 2,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": 79
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
                            "key": "fy2020-21_extentOfMunicipalSwm",
                            "position": 3,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": 10
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
                            "key": "fy2019-20_extentOfMunicipalSwm",
                            "position": 4,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": 16
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
                            "key": "fy2018-19_extentOfMunicipalSwm",
                            "position": 5,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": 97
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
                            "key": "fy2017-18_extentOfMunicipalSwm",
                            "position": 6,
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
                            "label": "FY 2016-17",
                            "key": "fy2016-17_extentOfMunicipalSwm",
                            "position": 7,
                            "type": "extentOfMunicipalSwm",
                            "formFieldType": "number",
                            "value": 30
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "extentOfScientificSolidSwm",
                    "readOnly": false,
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
                            "key": "fy2022-23_extentOfScientificSolidSwm",
                            "position": 1,
                            "type": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": 35
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
                            "key": "fy2021-22_extentOfScientificSolidSwm",
                            "position": 2,
                            "type": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": 55
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
                            "key": "fy2020-21_extentOfScientificSolidSwm",
                            "position": 3,
                            "type": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": 51
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
                            "key": "fy2019-20_extentOfScientificSolidSwm",
                            "position": 4,
                            "type": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": 74
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
                            "key": "fy2018-19_extentOfScientificSolidSwm",
                            "position": 5,
                            "type": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": 27
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
                            "key": "fy2017-18_extentOfScientificSolidSwm",
                            "position": 6,
                            "type": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": 76
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
                            "key": "fy2016-17_extentOfScientificSolidSwm",
                            "position": 7,
                            "type": "extentOfScientificSolidSwm",
                            "formFieldType": "number",
                            "value": 9
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "extentOfCostInSwm",
                    "readOnly": false,
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
                            "key": "fy2022-23_extentOfCostInSwm",
                            "position": 1,
                            "type": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": 94
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
                            "key": "fy2021-22_extentOfCostInSwm",
                            "position": 2,
                            "type": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": 86
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
                            "key": "fy2020-21_extentOfCostInSwm",
                            "position": 3,
                            "type": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": 81
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
                            "key": "fy2019-20_extentOfCostInSwm",
                            "position": 4,
                            "type": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": 83
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
                            "key": "fy2018-19_extentOfCostInSwm",
                            "position": 5,
                            "type": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": 14
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
                            "key": "fy2017-18_extentOfCostInSwm",
                            "position": 6,
                            "type": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": 90
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
                            "key": "fy2016-17_extentOfCostInSwm",
                            "position": 7,
                            "type": "extentOfCostInSwm",
                            "formFieldType": "number",
                            "value": 25
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "efficiencyInCollectionSwmUser",
                    "readOnly": false,
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
                            "key": "fy2022-23_efficiencyInCollectionSwmUser",
                            "position": 1,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": 14
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
                            "key": "fy2021-22_efficiencyInCollectionSwmUser",
                            "position": 2,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": 85
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
                            "key": "fy2020-21_efficiencyInCollectionSwmUser",
                            "position": 3,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": 74
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
                            "key": "fy2019-20_efficiencyInCollectionSwmUser",
                            "position": 4,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": 76
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
                            "key": "fy2018-19_efficiencyInCollectionSwmUser",
                            "position": 5,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": 52
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
                            "key": "fy2017-18_efficiencyInCollectionSwmUser",
                            "position": 6,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": 83
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
                            "key": "fy2016-17_efficiencyInCollectionSwmUser",
                            "position": 7,
                            "type": "efficiencyInCollectionSwmUser",
                            "formFieldType": "number",
                            "value": 63
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "efficiencyInRedressalCustomerSwm",
                    "readOnly": false,
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
                            "key": "fy2022-23_efficiencyInRedressalCustomerSwm",
                            "position": 1,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": 97
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
                            "key": "fy2021-22_efficiencyInRedressalCustomerSwm",
                            "position": 2,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": 99
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
                            "key": "fy2020-21_efficiencyInRedressalCustomerSwm",
                            "position": 3,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": 74
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
                            "key": "fy2019-20_efficiencyInRedressalCustomerSwm",
                            "position": 4,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": 14
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
                            "key": "fy2018-19_efficiencyInRedressalCustomerSwm",
                            "position": 5,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": 78
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
                            "key": "fy2017-18_efficiencyInRedressalCustomerSwm",
                            "position": 6,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": 51
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
                            "key": "fy2016-17_efficiencyInRedressalCustomerSwm",
                            "position": 7,
                            "type": "efficiencyInRedressalCustomerSwm",
                            "formFieldType": "number",
                            "value": 56
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
                    "readOnly": false,
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
                            "key": "fy2022-23_coverageOfStormDrainage",
                            "position": 1,
                            "type": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": 94
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
                            "key": "fy2021-22_coverageOfStormDrainage",
                            "position": 2,
                            "type": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": 93
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
                            "key": "fy2020-21_coverageOfStormDrainage",
                            "position": 3,
                            "type": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": 62
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
                            "key": "fy2019-20_coverageOfStormDrainage",
                            "position": 4,
                            "type": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": 13
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
                            "key": "fy2018-19_coverageOfStormDrainage",
                            "position": 5,
                            "type": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": 86
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
                            "key": "fy2017-18_coverageOfStormDrainage",
                            "position": 6,
                            "type": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": 27
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
                            "key": "fy2016-17_coverageOfStormDrainage",
                            "position": 7,
                            "type": "coverageOfStormDrainage",
                            "formFieldType": "number",
                            "value": 86
                        }
                    ],
                    "status": "Na",
                    "value": "",
                    "isDraft": true
                },
                {
                    "key": "incidenceOfWaterLogging",
                    "readOnly": false,
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
                            "key": "fy2022-23_incidenceOfWaterLogging",
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
                            "key": "fy2021-22_incidenceOfWaterLogging",
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
                            "key": "fy2020-21_incidenceOfWaterLogging",
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
                            "key": "fy2019-20_incidenceOfWaterLogging",
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
                            "key": "fy2018-19_incidenceOfWaterLogging",
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
                            "key": "fy2017-18_incidenceOfWaterLogging",
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
                            "key": "fy2016-17_incidenceOfWaterLogging",
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