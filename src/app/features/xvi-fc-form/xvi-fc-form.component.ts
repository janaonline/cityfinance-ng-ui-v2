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
import { StepperSelectionEvent } from '@angular/cdk/stepper';
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
  step1Complete = false;
  tabChangeLoader = false;
  totalTabs = 6;
  isDemographicCompleted: boolean | undefined = false;

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
    // this._snackBar.open('Save successfully!!', 'Close', {
    //   horizontalPosition: 'end',
    //   verticalPosition: 'top',
    //   // duration: 2000,
    //   // panelClass: ['snackbar-success']
    //   panelClass: ['custom-snackbar-success']
    // });
  }
  get isDemographicValid() {
    // console.log('this.form.get()?.valid',this.form.get('demographicData')?.valid);
    return this.form.get('demographicData')?.valid;
  }
  onLoad(reload = false) {
    this.isLoader = true;
    // this.ulbId = '5dcfca53df6f59198c4ac3d5';
    this.ulbId = this.loggedInUserDetails.ulb;
    // this.ulbId = '5dd24e98cc3ddc04b552b7d4';
    this.service.getUlbForm(this.ulbId).subscribe({
      next: (res: any) => {
        this.tabs = res?.data?.tabs;
        this.totalTabs = this.tabs.length;
        // this.tabs = tabsJson.data.tabs;
        // push review tab
        this.tabs.push({
          key: 'reviewSubmit',
          label: 'Review & Submit',
          'displayPriority': this.totalTabs + 1,
        });

        this.form = this.formService.tabControl(this.tabs);
        // console.log('this.form.controls[0]--',this.form.controls[0]);

        // this.isDemographicCompleted = this.form.get('demographicData')?.valid;
        // console.log(`this.form.get('demographicData')?.valid;`, this.form.get('demographicData')?.valid);
        // console.log(`this.form.valid;`, this.form.valid);

        // this.form.markAsPristine();        

        if (reload) {
          setTimeout(() => {
            this.afterSave();
          }, 500);
        }
        this.isLoader = false;
        this.formSaveLoader = false;
        this.tabChangeLoader = false;
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
    if (this.form.valid) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to submit the data?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'No, cancel!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.formSaveLoader = true;
          // const formData = this.getFormData('SUBMITTED');
          const formData = this.getAllTabData();
          // this.service.submitUlbForm(this.ulbId, formData).subscribe((res) => {
          this.service.submitUlbForm(this.ulbId, formData).subscribe({
            next: (res) => {
              Swal.fire(
                'Done!',
                'Your action has been confirmed.',
                'success'
              );
              this.onLoad();
            }, error: (error: any) => {
              console.log('error', error);

              Swal.fire(
                'Error',
                error.message || 'Something went wrong! Please try again later',
                'error'
              );
              this.formSaveLoader = false;
            }
          });

        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Cancel the action
          Swal.fire(
            'Cancelled',
            'Your action has been cancelled.',
            'error'
          );
        }
      });
    } else {
      Swal.fire(
        'Validation Error!',
        'Some fields not filled or invalid.',
        'error'
      );
    }
  }
  getAllTabData() {
    const formData: any = { tab: [], formStatus: 'SUBMITTED', formId: 16 };
    for (let tab of this.tabs) {
      formData.tab.push(this.getFormTabData(tab));
    }
    return formData;
  }
  selectionChange(event: StepperSelectionEvent) {
    // return;
    // if last tab load only data
    if (event.previouslySelectedIndex !== this.totalTabs && !this.actionType) {
      this.tabChangeLoader = true;
      console.log('event', event.selectedIndex, 'this.totalTabs', this.totalTabs);
      // const formData = this.getAllTabData();
      const formData = this.getFormData();
      this.service.saveUlbForm(this.ulbId, formData).subscribe((res) => {
        if (event.previouslySelectedIndex === 0 || event.selectedIndex === this.totalTabs) {
          this.onLoad();
        } else {
          this.tabChangeLoader = false;
        }
        this.triggerSnackbar();
      });
    }

    // setTimeout(() => {
    //   this.tabChangeLoader = false;
    // }, 2000);

  }
  saveAs(actionType: string) {
    const currentForm = this.form.get(this.tabs[this.selectedStepIndex].key);
    // console.log(`currentForm?.valid;`, currentForm?.valid);
    // console.log(`this.form.valid;`, this.form.valid);

    currentForm?.markAllAsTouched()

    this.actionType = actionType;

    console.log('this.actionType', this.actionType, 'this.selectedStepIndex', this.selectedStepIndex, 'this.totalTabs', this.totalTabs);

    // if back from review tab no action
    if (this.actionType === 'previous' && this.selectedStepIndex === this.totalTabs) {
      this.stepper?.previous();
      this.actionType = '';
      return;
    }
    const formData = this.getFormData();
    // return;
    this.formSaveLoader = true;

    this.service.saveUlbForm(this.ulbId, formData).subscribe((res) => {
      // for last tab load json again
      if (this.actionType === 'next' && (this.selectedStepIndex + 1) === this.totalTabs) {
        this.onLoad(true);
      }
      // after first tab load json again
      else if (this.actionType !== 'stay' && this.selectedStepIndex === 0) {
        this.onLoad(true);
      } else {
        this.afterSave();
      }
    });
  }
  getFormData() {
    const formData: any = { tab: [], formStatus: 'IN_PROGRESS', formId: 16 }
    formData.tab.push(this.getFormTabData(this.tabs[this.selectedStepIndex]));
    return formData;
  }
  getFormTabData(tab: any) {
    // console.log('this.form.value', this.form.value);
    const formJson: any = this.form.getRawValue();

    // const formData: any = { tab: [], formStatus, formId: 16 }
    // console.log('this.tabs[this.selectedStepIndex]', this.tabs[this.selectedStepIndex]);
    // const tab = this.tabs[index];


    // for (let tab of this.tabs) {
    const tabKey = tab.key;
    const formJsonTab = formJson[tabKey];
    const tabData: any = { tabKey, data: [] };
    if (tabKey === 'demographicData') {
      tab['data'].forEach((field: any, i: number) => {
        // console.log('formJsonTab[i][field.key]', formJsonTab[i][field.key]);
        const fieldData = {
          key: field.key,
          value: formJsonTab[i][field.key],
          saveAsDraftValue: formJsonTab[i][field.key]
        };
        tabData.data.push(fieldData);
      });
    } else if (tabKey === 'financialData' || tabKey === 'serviceLevelBenchmark') {
      // console.log('tab[', tab['data']);

      tab['data'].forEach((table: any, i: number) => {
        // console.log('formJsonTab[i][field.key]', formJsonTab[i][table.key]);

        table.data.forEach((row: any) => {
          row.year.forEach((col: any) => {
            // console.log('col', col);
            const { key, year, refKey } = col;
            const value = formJsonTab[i][table.key][row.key][col.key];
            tabData.data.push({ key, year, refKey, value, saveAsDraftValue: value });
          });
        });
      });
    } else if (tabKey === 'uploadDoc') {
      tab['data'].forEach((row: any, i: number) => {
        // console.log('formJsonTab[i][field.key]', formJsonTab[i][row.key]);

        row.year.forEach((col: any) => {
          // console.log('col', col);
          const { key, year, refKey } = col;
          const value = formJsonTab[i][row.key][col.key];
          tabData.data.push({ key, year, refKey, ...value, saveAsDraftValue: '' });
        });
      });
      // tab['data'].forEach((field: any, i: number) => {
      //   // console.log('formJsonTab[i][field.key]', formJsonTab[i][field.key]);
      //   for (const [key, value] of Object.entries(formJsonTab[i][field.key])) {
      //     tabData.data.push(
      //       { refKey: field.key, key: field.key, year: key, ...(typeof value === 'object' && value !== null ? value : {}) }
      //     );

      //   }
      // });
    } else if (tabKey === 'accountPractice') {
      tab['data'].forEach((field: any, i: number) => {
        // console.log('formJsonTab[i][field.key]', formJsonTab[i][field.key]);
        for (const [key, value] of Object.entries(formJsonTab[i][field.key])) {
          if (this.isPlainObject(value)) {
            tabData.data.push(
              { key, saveAsDraftValue: value['value'], ...value }
            );
          }
        }
      });
      // }
      // if (tabKey !== 'reviewSubmit') {
      //   formData.tab.push(tabData);
      // }
    }


    // console.log('formData----', formData);
    return tabData;

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
    this.triggerSnackbar();
    this.formSaveLoader = false;
    this.actionType = '';
    // Swal.close();
  }
  triggerSnackbar() {
    this._snackBar.open('Data saved successfully!', 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 10000,
      // panelClass: ['snackbar-success']
      panelClass: ['custom-snackbar-success']
    });
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

