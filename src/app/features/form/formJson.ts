import { Validators } from "@angular/forms";

const tabs = {
    "tabs": [
        {
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
                    "formFieldType": "dropdown",
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
                    "formFieldType": "dropdown",
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
        },
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
                    "formFieldType": "dropdown",
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
                    "formFieldType": "dropdown",
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