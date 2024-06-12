import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { tabsJson } from './formJson';
// import { tabsJson } from './xviFormJson';
import { tabsJson } from './xviFormJsonApi';
// import { tabsJson } from './xviJsonApiFull';
import { MaterialModule } from '../../material.module';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';
import { USER_TYPE } from '../../core/models/user/userType';
import { FiscalRankingService, StatusType } from './services/fiscal-ranking.service';
import { MatStepper } from '@angular/material/stepper';
import { UserUtility } from '../../core/util/user/user';
import Swal from 'sweetalert2';


// import { Tab, APPROVAL_TYPES } from '../../core/models/models';
import { AlreadyUpdatedUrlPipe } from '../../core/pipes/already-updated-url.pipe';
// import { DisplayPositionPipe } from '../../core/pipes/display-position.pipe';
import { PercentprogressPipe } from '../../core/pipes/percentprogress.pipe';
// import { ToStorageUrlPipe } from '../../core/pipes/to-storage-url.pipe';
import { TowordPipe } from '../../core/pipes/toword.pipe';
// import { CommonActionRadioComponent } from '../../shared/components/actions/common-action-radio/common-action-radio.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

// import { GlobalLoaderService } from '../../core/services/loaders/global-loader.service';
import { AccountingPracticeComponent } from './accounting-practice/accounting-practice.component';
import { ReviewSubmitComponent } from './review-submit/review-submit.component';
import { YearwiseFilesComponent } from './yearwise-files/yearwise-files.component';
import { DynamicFormService } from '../../shared/dynamic-form/dynamic-form.service';
// import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { XviFcService } from '../../core/services/xvi-fc.service';

import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
// import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-xvi-fc-form',
  standalone: true,
  imports: [
    // CommonModule,
    // FormsModule,
    // ReactiveFormsModule, 
    DynamicFormComponent,
    MaterialModule,

    PercentprogressPipe,
    // TowordPipe,
    // ToStorageUrlPipe,
    AlreadyUpdatedUrlPipe,
    // DisplayPositionPipe,
    // DecimalLimitDirective,
    // CommonActionRadioComponent,
    LoaderComponent,

    YearwiseFilesComponent,
    AccountingPracticeComponent,
    ReviewSubmitComponent,
    // SweetAlert2Module,
  ],
  templateUrl: './xvi-fc-form.component.html',
  styleUrl: './xvi-fc-form.component.scss'
})
export class XviFcFormComponent {

  // fields: FieldConfig[] = formJson;

  form!: FormGroup;
  dynamicForm!: FormGroup;
  // form!: FormArray;


  @ViewChild('stepper') stepper: MatStepper | undefined;

  yearIdArr: any = {};
  // user!: IUserLoggedInDetails | null;
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  isLoader: boolean = false;
  formSaveLoader: boolean = false;
  loggedInUserType: any;
  hideForm: boolean = false;
  notice!: string;
  pmuSubmissionDate!: string;
  isAutoApproved: boolean = false;
  selfDeclarationTabId: string = 's5';
  // guidanceNotesKey: string = 'guidanceNotes';
  // incomeSectionBelowKey: number = 1;
  // expenditureSectionBelowKey: number = 8;
  financialYearTableHeader: { [key: number]: string[] } = {};
  // linearTabs: string[] = ['s1', 's2'];
  // twoDTabs: string[] = ['s4', 's5', 's6'];
  // textualFormFiledTypes: string[] = ['text', 'url', 'email', 'number'];
  // tabs: Tab[] = [];
  tabs: any[] = [];
  currentFormStatus!: number;
  formId!: string;
  ulbId!: string;
  stateCode!: string;
  isDraft: boolean = false;
  userData: any;
  ulbName!: string;
  validators: any = {};
  userTypes = USER_TYPE;
  statusTypes = StatusType;
  status: '' | 'PENDING' | 'REJECTED' | 'APPROVED' = '';
  formSubmitted = false;
  // fields: any[] = tabsJson.data.tabs;
  fields: any[] = [];
  selectedStepIndex = 0;
  actionType!: string;

  get value() {
    return this.form.value;
  }
  constructor(private fb: FormBuilder,
    // public fiscalService: FiscalRankingService,
    public service: XviFcService,
    public formService: DynamicFormService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    // this.form = this.formService.tabControl(tabsJson.data.tabs);
    // this.form.valueChanges.subscribe(x => {
    //   this.submit.emit(x);
    //   // this.childFG.emit(this.form);
    // });
    this.onLoad();
  }

  onLoad(reload = false) {
    this.isLoader = true;
    // this.ulbId = '5dcfca53df6f59198c4ac3d5';
    this.ulbId = this.loggedInUserDetails.ulb;
    // this.ulbId = '5dd24e98cc3ddc04b552b7d4';
    this.service.getUlbForm(this.ulbId).subscribe({
      next: (res: any) => {
        this.tabs = res?.data?.tabs;

        // this.tabs = tabsJson.data.tabs;
        // push review tab
        this.tabs.push({
          key: 'reviewSubmit',
          label: "Review & Submit",
          "displayPriority": this.tabs.length + 1,
        });
        this.form = this.formService.tabControl(this.tabs);

        // this.form.markAsPristine();
        this.isLoader = false;
        if (reload) {
          setTimeout(() => {
            this.afterSave();
          }, 500);
        }
      }, error: () => {
        this.isLoader = false;
      }
    });
  }

  // validateAllFormFields(formGroup: FormGroup) {
  //   Object.keys(formGroup.controls).forEach(field => {
  //     const control = formGroup.get(field);
  //     control?.markAsTouched({ onlySelf: true });
  //   });
  // }

  submit() {

  }
  saveAs(actionType: string) {
    this.formSaveLoader = true;
    this.actionType = actionType;
    if (['previous', 'next'].includes(actionType)) {
      Swal.fire({
        title: "Unsaved changes!",
        text: "Save as draft and continue",
        icon: "info"
      });
    }

    // console.log('this.form.value', this.form.value);
    const formJson: any = this.form.value;

    const formData: any = { tab: [], formStatus: "IN_PROGRESS", formId: 16 }
    // console.log('this.tabs[this.selectedStepIndex]', this.tabs[this.selectedStepIndex]);
    const tabKey = this.tabs[this.selectedStepIndex].key;
    const tabData: any = { tabKey, data: [] };
    if (tabKey === 'demographicData') {
      this.tabs[this.selectedStepIndex]['data'].forEach((field: any, i: number) => {

        const fieldData = {
          key: field.key,
          value: formJson[tabKey][i][field.key],
          saveAsDraftValue: formJson[tabKey][i][field.key]
        };
        tabData.data.push(fieldData);
      });
    } else if (tabKey === 'financialData') {
      console.log('this.tabs[this.selectedStepIndex][', this.tabs[this.selectedStepIndex]['data']);

      this.tabs[this.selectedStepIndex]['data'].forEach((field: any, i: number) => {
        // console.log('formJson[tabKey][i][field.key]', formJson[tabKey][i][field.key]);
        // const data = [];
        for (const [key, value] of Object.entries(formJson[tabKey][i][field.key])) {
          if (this.isPlainObject(value)) {
            for (const [year, val] of Object.entries(value)) {
              tabData.data.push({ key, year, value: val });
            }
          }

        }
        // const fieldData = {
        //   key: field.key,
        //   value: formJson[tabKey][i][field.key],
        //   saveAsDraftValue: formJson[tabKey][i][field.key]
        // };
        // tabData.data.push(fieldData);
      });
    } else if (tabKey === 'uploadDoc') {

    } else if (tabKey === 'accountPractice') {

    }

    formData.tab.push(tabData);
    console.log('formData----', formData);

    this.service.saveUlbForm(this.ulbId, formData).subscribe((res) => {
      if (this.selectedStepIndex === 0) {
        this.onLoad(true);
      } else {
        this.afterSave();
      }
    });
  }

  isPlainObject(data: unknown): data is { [s: string]: unknown; } {
    return typeof data === 'object' && data !== null && !Array.isArray(data);
  }
  afterSave() {
    if (this.actionType === 'next') {
      this.stepper?.next();
    } else if (this.actionType === 'previous') {
      this.stepper?.previous();
    }
    this._snackBar.open('Save successfully!!', 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      // duration: 2000,
      // panelClass: ['snackbar-success']
      panelClass: ['custom-snackbar-success']
    });
    this.formSaveLoader = false;
    Swal.close();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.form.valid) {
      // this.submit.emit(this.form.value);
    } else {
      // this.validateAllFormFields(this.form);
    }
  }

  getTabGroup(tabKey: string): FormArray {
    return (this.form.get(tabKey) as FormArray)
  }

  getFG(tabKey: string, i: number): any {
    return (this.form.get(tabKey) as FormArray).controls[i]
  }

}

