import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild  } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-xvi-fc',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatRadioModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatSelectModule,
    MatDialogModule

  ],
//   providers: [provideNativeDateAdapter()],
//   templateUrl: './xvi-fc.component.html',
  template: ``,
  styleUrl: './xvi-fc.component.scss'
})
export class XviFCComponent {
  @ViewChild('viewAndVerifyDialog')
  viewAndVerifyDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;

  constructor(private _formBuilder: FormBuilder,public dialog: MatDialog) { }

  openDialog(): void {
    this.dialogRef = this.dialog.open(this.viewAndVerifyDialog, {
      width: '1200px'
    });
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  public form1Data: any;
  public selectedTabData: any;
  public selectedTabQuestion: any;
  public questionHeader: any;
  public changeEventNumber: any;

  ngOnInit(): void {
    // let ulbId = '5dcfca53df6f59198c4ac3d5';
    this.form1Data = {
      "status": true,
      "message": "Success fetched data!",
      "data": {
          "ulb": "5dcfca53df6f59198c4ac3d5",
          "tabs": [
              {
                  "_id": "6650db97206996389c4b2036",
                  "key": "demographicData",
                  "icon": "",
                  "text": "",
                  "formType": "form1",
                  "label": "Demographic Data",
                  "id": "s1",
                  "displayPriority": 1,
                  "__v": 0,
                  "data": {
                      "nameOfUlb": {
                          "key": "nameOfUlb",
                          "label": "Name of ULB",
                          "postion": "1",
                          "required": true,
                          "info": "",
                          "placeHolder": "",
                          "formFieldType": "text",
                          "canShow": true,
                          "value": "2nd Try",
                          "status": "Na",
                          "isDraft": true,
                          "readonly": false
                      },
                      "nameOfState": {
                          "key": "nameOfState",
                          "label": "Name of State/Union Territory ",
                          "postion": "2",
                          "required": true,
                          "info": "",
                          "placeHolder": "",
                          "formFieldType": "text",
                          "canShow": true,
                          "value": "Halwa",
                          "status": "Na",
                          "isDraft": true,
                          "readonly": true
                      },
                      "pop2011": {
                          "key": "pop2011",
                          "label": "Population as per Census 2011",
                          "postion": "3",
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
                          "max": 1000000,
                          "min": 0,
                          "decimal": 0,
                          "validation": "",
                          "logic": "",
                          "value": 1000,
                          "status": "Na",
                          "isDraft": true,
                          "readonly": false
                      },
                      "popApril2024": {
                          "key": "popApril2024",
                          "label": "Population as per 01 April 2024",
                          "postion": "4",
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
                          "max": 1000000,
                          "min": 0,
                          "decimal": 0,
                          "validation": "",
                          "logic": "",
                          "value": 1000,
                          "status": "Na",
                          "isDraft": true,
                          "readonly": false
                      },
                      "areaOfUlb": {
                          "key": "areaOfUlb",
                          "label": "Area of the ULB (in Sq. Km.)",
                          "postion": "5",
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
                          "max": 1000,
                          "min": 0.1,
                          "decimal": 2,
                          "validation": "",
                          "logic": "",
                          "value": 10.12,
                          "status": "Na",
                          "isDraft": true,
                          "readonly": false
                      },
                      "yearOfElection": {
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
                          "value": 2020,
                          "status": "Na",
                          "isDraft": true,
                          "readonly": false
                      },
                      "isElected": {
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
                          "value": "Yes",
                          "status": "Na",
                          "isDraft": true,
                          "readonly": false
                      },
                      "yearOfConstitution": {
                          "key": "yearOfConstitution",
                          "label": "In which year was the ULB constituted?",
                          "postion": "8",
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
                          "value": "2016",
                          "status": "Na",
                          "isDraft": true,
                          "readonly": false
                      }
                  }
              },
              {
                  "_id": "6650db97206996389c4b2037",
                  "key": "financialData",
                  "icon": "",
                  "text": "",
                  "formType": "form1",
                  "label": "Financial Data",
                  "id": "s2",
                  "displayPriority": 2,
                  "__v": 0,
                  "data": {
                      "commonPrimaryKey": {
                          "sourceOfFd": {
                              "key": "sourceOfFd",
                              "label": "Please select the source of Financial Data",
                              "postion": "*",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "dropdown",
                              "canShow": true,
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
                                      "key": "fy2022-23_sourceOfFd",
                                      "postion": 1,
                                      "type": "sourceOfFd",
                                      "formFieldType": "dropdown",
                                      "value": 6906
                                  },
                                  {
                                      "warning": [],
                                      "label": "FY 2021-22",
                                      "key": "fy2021-22_sourceOfFd",
                                      "postion": 2,
                                      "type": "sourceOfFd",
                                      "formFieldType": "dropdown",
                                      "value": 1604
                                  },
                                  {
                                      "warning": [],
                                      "label": "FY 2020-21",
                                      "key": "fy2020-21_sourceOfFd",
                                      "postion": 3,
                                      "type": "sourceOfFd",
                                      "formFieldType": "dropdown",
                                      "value": 3145
                                  },
                                  {
                                      "warning": [],
                                      "label": "FY 2019-20",
                                      "key": "fy2019-20_sourceOfFd",
                                      "postion": 4,
                                      "type": "sourceOfFd",
                                      "formFieldType": "dropdown",
                                      "value": 7967
                                  },
                                  {
                                      "warning": [],
                                      "label": "FY 2018-19",
                                      "key": "fy2018-19_sourceOfFd",
                                      "postion": 5,
                                      "type": "sourceOfFd",
                                      "formFieldType": "dropdown",
                                      "value": 476
                                  },
                                  {
                                      "warning": [],
                                      "label": "FY 2017-18",
                                      "key": "fy2017-18_sourceOfFd",
                                      "postion": 6,
                                      "type": "sourceOfFd",
                                      "formFieldType": "dropdown",
                                      "value": 832
                                  },
                                  {
                                      "warning": [],
                                      "label": "FY 2016-17",
                                      "key": "fy2016-17_sourceOfFd",
                                      "postion": 7,
                                      "type": "sourceOfFd",
                                      "formFieldType": "dropdown",
                                      "value": 2139
                                  },
                                  {
                                      "warning": [],
                                      "label": "FY 2015-16",
                                      "key": "fy2015-16_sourceOfFd",
                                      "postion": 8,
                                      "type": "sourceOfFd",
                                      "formFieldType": "dropdown",
                                      "value": 8888
                                  }
                              ],
                              "status": "Na",
                              "value": "",
                              "isDraft": true,
                              "readonly": false
                          }
                      },
                      "revenue": {
                          "label": "I. REVENUE",
                          "taxRevenue": {
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
                          "feeAndUserCharges": {
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
                          "interestIncome": {
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
                          "otherIncome": {
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
                          "totOwnRevenue": {
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
                          "centralGrants": {
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
                          "otherGrants": {
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
                          "totalGrants": {
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
                          "assignedRevAndCom": {
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
                          "otherRevenue": {
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
                          "totalRevenue": {
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
                      },
                      "expenditure": {
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
                      "borrowings": {
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
                  }
              },
              {
                  "_id": "6650db97206996389c4b2038",
                  "key": "uploadDoc",
                  "icon": "",
                  "text": "",
                  "formType": "form1",
                  "label": "View/ Upload Document",
                  "id": "s3",
                  "displayPriority": 3,
                  "__v": 0,
                  "data": {
                      "auditedAnnualFySt": {
                          "key": "auditedAnnualFySt",
                          "label": "Copy of Audited Annual Financial Statements preferably in English",
                          "postion": "",
                          "required": true,
                          "info": "",
                          "placeHolder": "",
                          "formFieldType": "file",
                          "canShow": true,
                          "max": 5,
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
                                  "key": "fy2022-23_auditedAnnualFySt",
                                  "postion": 1,
                                  "type": "auditedAnnualFySt",
                                  "formFieldType": "file",
                                  "value": "",
                                  "isPdfAvailable": "",
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
                                  ]
                              },
                              {
                                  "warning": [],
                                  "label": "FY 2021-22",
                                  "key": "fy2021-22_auditedAnnualFySt",
                                  "postion": 2,
                                  "type": "auditedAnnualFySt",
                                  "formFieldType": "file",
                                  "value": "",
                                  "isPdfAvailable": "",
                                  "file": {
                                      "name": "testName2021-22",
                                      "url": "https://www.test.com/2021-22.pdf"
                                  },
                                  "fileAlreadyOnCf": [
                                      {
                                          "name": "",
                                          "url": "",
                                          "type": "",
                                          "label": ""
                                      }
                                  ]
                              },
                              {
                                  "warning": [],
                                  "label": "FY 2020-21",
                                  "key": "fy2020-21_auditedAnnualFySt",
                                  "postion": 3,
                                  "type": "auditedAnnualFySt",
                                  "formFieldType": "file",
                                  "value": "",
                                  "isPdfAvailable": "",
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
                                  ]
                              },
                              {
                                  "warning": [],
                                  "label": "FY 2019-20",
                                  "key": "fy2019-20_auditedAnnualFySt",
                                  "postion": 4,
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
                                  ]
                              },
                              {
                                  "warning": [],
                                  "label": "FY 2018-19",
                                  "key": "fy2018-19_auditedAnnualFySt",
                                  "postion": 5,
                                  "type": "auditedAnnualFySt",
                                  "formFieldType": "file",
                                  "value": "",
                                  "isPdfAvailable": "",
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
                                  ]
                              },
                              {
                                  "warning": [],
                                  "label": "FY 2017-18",
                                  "key": "fy2017-18_auditedAnnualFySt",
                                  "postion": 6,
                                  "type": "auditedAnnualFySt",
                                  "formFieldType": "file",
                                  "value": "",
                                  "isPdfAvailable": "",
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
                                  ]
                              },
                              {
                                  "warning": [],
                                  "label": "FY 2016-17",
                                  "key": "fy2016-17_auditedAnnualFySt",
                                  "postion": 7,
                                  "type": "auditedAnnualFySt",
                                  "formFieldType": "file",
                                  "value": "",
                                  "isPdfAvailable": "",
                                  "file": {
                                      "name": "testName2016-17",
                                      "url": "https://www.test.com/2016-17.pdf"
                                  },
                                  "fileAlreadyOnCf": [
                                      {
                                          "name": "",
                                          "url": "",
                                          "type": "",
                                          "label": ""
                                      }
                                  ]
                              },
                              {
                                  "warning": [],
                                  "label": "FY 2015-16",
                                  "key": "fy2015-16_auditedAnnualFySt",
                                  "postion": 8,
                                  "type": "auditedAnnualFySt",
                                  "formFieldType": "file",
                                  "value": "",
                                  "isPdfAvailable": "",
                                  "file": {
                                      "name": "testName2015-16",
                                      "url": "https://www.test.com/2015-16.pdf"
                                  },
                                  "fileAlreadyOnCf": [
                                      {
                                          "name": "",
                                          "url": "",
                                          "type": "",
                                          "label": ""
                                      }
                                  ]
                              }
                          ],
                          "status": "Na",
                          "value": "",
                          "isDraft": true,
                          "readonly": false
                      }
                  }
              },
              {
                  "_id": "6650db97206996389c4b2039",
                  "key": "accountPractice",
                  "icon": "",
                  "text": "",
                  "formType": "form1",
                  "label": "Accounting Practice",
                  "id": "s4",
                  "displayPriority": 4,
                  "__v": 0,
                  "data": {
                      "accSysAndProcess": {
                          "label": "I. Accounting Systems and Processes",
                          "accSystem": {
                              "key": "accSystem",
                              "label": "What is the accounting system being followed by the ULB?",
                              "postion": "1",
                              "required": true,
                              "info": {
                                  "Cash basis of accounting": "Revenues and expenses are recognised/recorded when the related cash receipts or cash payments take place.",
                                  "Accrual basis of accounting": "Revenues and expneses are  recognised/recorded as they are earned or incurred (and not as money is received or paid) and recorded in the financial statements of the periods to which they relate.",
                                  "Modified": "Revenues are recognized/recorded when cash is received and expenses when they are paid, with the exception of capitalizing long-term assets and recording their related depreciation."
                              },
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "Cash Basis of Accounting",
                                  "Accrual Basis of Accounting",
                                  "Modified Cash/ Accrual Accounting"
                              ],
                              "showInputBox": "",
                              "inputBoxValue": "",
                              "value": "Cash Basis of Accounting",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "accProvision": {
                              "key": "accProvision",
                              "label": "What accounting provisions or framework does the ULB follow?",
                              "postion": "2",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "National Municipal Accounting Manual",
                                  "State-specific Municipal Accounting Manual",
                                  "Other (Please specify)"
                              ],
                              "showInputBox": "Other (Please specify)",
                              "inputBoxValue": "",
                              "value": "National Municipal Accounting Manual",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "accInCashBasis": {
                              "key": "accInCashBasis",
                              "label": "Are there any accounts/books/registers maintained in cash basis?",
                              "postion": "3",
                              "required": true,
                              "info": "Types of registers maintained: cash book, receipt register, register of bills for payment, collection register, deposit register, register of fixed assets etc.",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "Yes (Please specify)",
                                  "No"
                              ],
                              "showInputBox": "Yes (Please specify)",
                              "inputBoxValue": "",
                              "value": "Yes (Please specify)",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "fsTransactionRecord": {
                              "key": "fsTransactionRecord",
                              "label": "Does the ULB initially record transactions on a cash basis and subsequently prepare accrual accounts for consolidation of financial statements?",
                              "postion": "4",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "Yes",
                                  "No"
                              ],
                              "showInputBox": "",
                              "inputBoxValue": "",
                              "value": "Yes",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "fsPreparedBy": {
                              "key": "fsPreparedBy",
                              "label": "Are the Financial Statements prepared internally by the ULB's accounting department, or are they compiled by an external Chartered Accountant?",
                              "postion": "5",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "Internally (by Accounts Department)",
                                  "External Chartered Accountants",
                                  "Both"
                              ],
                              "showInputBox": "",
                              "inputBoxValue": "",
                              "value": "Internally (by Accounts Department)",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "revReceiptRecord": {
                              "key": "revReceiptRecord",
                              "label": "Is the revenue receipt recorded when the cash is received or when it is accrued/event occurs?",
                              "postion": "6",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "Recorded when cash is received",
                                  "Recorded when they are accrued",
                                  "Both (Please specify which transactions are recognised in accrual basis)"
                              ],
                              "showInputBox": "Both (Please specify which transactions are recognised in accrual basis)",
                              "inputBoxValue": "",
                              "value": "Recorded when cash is received",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "expRecord": {
                              "key": "expRecord",
                              "label": "Is the expense recorded when it is paid or when it is incurred/event occurs?",
                              "postion": "7",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "Recorded when cash is paid",
                                  "Recorded when they are accrued",
                                  "Both (Please specify which transactions are recognised in accrual basis)"
                              ],
                              "showInputBox": "Both (Please specify which transactions are recognised in accrual basis)",
                              "inputBoxValue": "",
                              "value": "Recorded when cash is paid",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "accSoftware": {
                              "key": "accSoftware",
                              "label": "What accounting software is currently in use by the ULB?",
                              "postion": "8",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "Centralized system provided by the State",
                                  "Standalone software",
                                  "Tally",
                                  "Other (Please specify)",
                                  "None"
                              ],
                              "showInputBox": "Other (Please specify)",
                              "inputBoxValue": "",
                              "value": "Centralized system provided by the State",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "onlineAccSysIntegrate": {
                              "key": "onlineAccSysIntegrate",
                              "label": "Does the online accounting system integrate seamlessly with other municipal systems?",
                              "postion": "9",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)",
                                  "No"
                              ],
                              "showInputBox": "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)",
                              "inputBoxValue": "",
                              "value": "Yes (Please specify which all system, e.g., tax collection, payroll, asset management)",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "muniAudit": {
                              "key": "muniAudit",
                              "label": "Who does the municipal audit of financial statements ?",
                              "postion": "10",
                              "required": true,
                              "info": "",
                              "placeHolder": "",
                              "formFieldType": "radio",
                              "canShow": true,
                              "options": [
                                  "External Chartered Accountant (CA)",
                                  "State Audit Department"
                              ],
                              "showInputBox": "",
                              "inputBoxValue": "",
                              "value": "External Chartered Accountant (CA)",
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          }
                      },
                      "staffing": {
                          "label": "II.Staffing - Finance & Accounts Department",
                          "totSanction": {
                              "key": "totSanction",
                              "label": "What is the total sanctioned posts for finance & accounts related positions?",
                              "postion": "11",
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
                              "max": 9999,
                              "min": 0,
                              "decimal": 0,
                              "validation": "",
                              "logic": "",
                              "value": 525,
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "totVacancy": {
                              "key": "totVacancy",
                              "label": "What is the total vacancy across finance & accounts related positions?",
                              "postion": "12",
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
                              "max": 9999,
                              "min": 0,
                              "decimal": 0,
                              "validation": "lessThan",
                              "logic": "11",
                              "value": 380,
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          },
                          "accPosition": {
                              "key": "accPosition",
                              "label": "How many finance & accounts related positions currently are filled on contractual basis or outsourced?",
                              "postion": "13",
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
                              "max": 9999,
                              "min": 0,
                              "decimal": 0,
                              "validation": "",
                              "logic": "",
                              "value": 619,
                              "status": "Na",
                              "isDraft": true,
                              "readonly": false
                          }
                      }
                  }
              }
          ],
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
    // this.form1DataServiceService.getForm1Data(ulbId).subscribe((data) => {
    //   if (data) {
    //     this.form1Data = data;
    //     this.selectionChange("");
    //   }
    // });
  }

  inputChange(changeValue: any) {
    this.changeEventNumber = changeValue.target.value;
  }

  tabClick(tabData: any) {
    console.log("inside tab click");
    this.selectedTabData = tabData;
    if (this.selectedTabData.id == 's1' || this.selectedTabData.id == 's3') {
      this.selectedTabQuestion = Object.keys(this.selectedTabData.data);
    } else {
      this.questionHeader = Object.keys(this.selectedTabData.data);
      this.selectedTabQuestion = Object.keys(this.selectedTabData.data[this.questionHeader[0]]);

      console.log("this.questionHeader", this.questionHeader);
      console.log("this.selectedTabQuestion", this.selectedTabQuestion);
    }
  }

  selectionChange(event: any) {
    console.log(event);
    console.log("inside tab click");
    if (event) { this.selectedTabData = this.form1Data.data.tabs[event.selectedIndex]; }
    else { this.selectedTabData = this.form1Data.data.tabs[0] };
    if (this.selectedTabData.id == 's1' || this.selectedTabData.id == 's3') {
      this.selectedTabQuestion = Object.keys(this.selectedTabData.data);
    } else {
      this.questionHeader = Object.keys(this.selectedTabData.data);
      this.selectedTabQuestion = Object.keys(this.selectedTabData.data[this.questionHeader[0]]);

      console.log("this.questionHeader", this.questionHeader);
      console.log("this.selectedTabQuestion", this.selectedTabQuestion);
    }
  }

  objectKeys(obj: any) {
    return Object.keys(obj);
  }
}
