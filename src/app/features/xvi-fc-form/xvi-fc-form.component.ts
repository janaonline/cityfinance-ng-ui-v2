import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { tabsJson } from './formJson';
// import { tabsJson } from './xviFormJson';
import { tabsJson } from './xviFormJsonApi';
// import { tabsJson } from './xviJsonApiFull';
import { MaterialModule } from '../../material.module';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { USER_TYPE } from '../../core/models/user/userType';
import { StatusType } from './services/fiscal-ranking.service';
import { MatStepper } from '@angular/material/stepper';
import { UserUtility } from '../../core/util/user/user';
import Swal from 'sweetalert2';


// import { Tab, APPROVAL_TYPES } from '../../core/models/models';
import { AlreadyUpdatedUrlPipe } from '../../core/pipes/already-updated-url.pipe';
// import { DisplayPositionPipe } from '../../core/pipes/display-position.pipe';
import { PercentprogressPipe } from '../../core/pipes/percentprogress.pipe';
// import { ToStorageUrlPipe } from '../../core/pipes/to-storage-url.pipe';
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
} from '@angular/material/snack-bar';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
// import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-xvi-fc-form',
  standalone: true,
  imports: [
    DynamicFormComponent,
    MaterialModule,

    PercentprogressPipe,
    AlreadyUpdatedUrlPipe,
    LoaderComponent,

    YearwiseFilesComponent,
    AccountingPracticeComponent,
    ReviewSubmitComponent,
  ],
  templateUrl: './xvi-fc-form.component.html',
  styleUrl: './xvi-fc-form.component.scss'
})
export class XviFcFormComponent {

  form!: FormGroup;
  dynamicForm!: FormGroup;

  @ViewChild('stepper') stepper: MatStepper | undefined;

  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  isLoader: boolean = false;
  formSaveLoader: boolean = false;
  loggedInUserType: any;
  hideForm: boolean = false;
  notice!: string;
  // tabs: Tab[] = [];
  tabs: any[] = [];
  // currentFormStatus!: number;
  formId!: string;
  ulbId!: string;
  // stateCode!: string;
  // isDraft: boolean = false;
  // userData: any;
  // ulbName!: string;
  // validators: any = {};
  // userTypes = USER_TYPE;
  // statusTypes = StatusType;
  // status: '' | 'PENDING' | 'REJECTED' | 'APPROVED' = '';
  // formSubmitted = false;

  fields: any[] = [];
  selectedStepIndex = 0;
  actionType!: string;
  step1Complete = false;
  tabChangeLoader = false;
  totalTabs = 6;
  formStatus!: string;
  submittedFormStatuses = ['UNDER_REVIEW_BY_STATE'];
  oldYearOfSlbOptions: any[] = [];
  oldyearOfElectionOptions: any[] = [];
  // isDemographicCompleted: boolean | undefined = false;

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
    // this.form.valueChanges.subscribe(x => {
    //   this.submit.emit(x);
    //   // this.childFG.emit(this.form);
    // });
    this.onLoad();

  }
  get isDemographicValid() {
    // console.log('valu', this.form.get('demographicData')?.value);
    // console.log('valid', this.form.get('demographicData')?.valid);

    return this.submittedFormStatuses.includes(this.formStatus) || this.form.get('demographicData')?.valid;
    // return this.form.get('demographicData')?.valid;
  }

  get isFormEditable() {
    return !this.submittedFormStatuses.includes(this.formStatus);
  }
  onLoad(reload = false) {

    this.isLoader = true;
    this.ulbId = this.loggedInUserDetails.ulb;
    // this.ulbId = '5dd24e98cc3ddc04b552b7d4';
    this.service.getUlbForm(this.ulbId).subscribe({
      next: (res: any) => {
        this.formStatus = res.data.formStatus;
        this.tabs = res?.data?.tabs;
        // this.tabs = tabsJson.data.tabs;
        this.totalTabs = this.tabs.length;
        // push review tab
        this.tabs.push({
          key: 'reviewSubmit',
          label: 'Review & Submit',
          'displayPriority': this.totalTabs + 1,
        });

        this.form = this.formService.tabControl(this.tabs);
        if (this.isFormEditable) {
          this.oldyearOfElectionOptions = this.tabs[0].data.find((e: any) => e.key === 'yearOfElection').options;
          if (this.tabs[0].formType === 'form2') {
            this.oldYearOfSlbOptions = this.tabs[0].data.find((e: any) => e.key === 'yearOfSlb').options;
          }

          const yearOfConstitutionIndex = this.tabs[0].data.findIndex((e: any) => e.key === 'yearOfConstitution');

          this.setOption(yearOfConstitutionIndex);
          this.setOnValueChange(yearOfConstitutionIndex);
        }

        this.isLoader = false;
        this.formSaveLoader = false;
        this.tabChangeLoader = false;
      }, error: () => {
        this.isLoader = false;
      }
    });
  }


  setOnValueChange(yearOfConstitutionIndex: number) {

    this.getFG('demographicData', yearOfConstitutionIndex).valueChanges.pipe(
      // debounceTime(400),
      // distinctUntilChanged()
    )
      .subscribe((data: any) => {
        if (data['yearOfConstitution']) {
          this.setOption(yearOfConstitutionIndex);
        }
      });
  }

  setOption(yearOfConstitutionIndex: number) {
    const yearOfConstitutionValue = this.getFG('demographicData', yearOfConstitutionIndex).get('yearOfConstitution').value;
    const yearOfConstitutionOptions = this.tabs[0].data[yearOfConstitutionIndex].options;

    const index = yearOfConstitutionOptions.indexOf(yearOfConstitutionValue);
    const yearOfElection = this.tabs[0].data.findIndex((e: any) => e.key === 'yearOfElection');

    this.tabs[0].data[yearOfElection].options = this.oldyearOfElectionOptions.slice(0, index + 2);


    if (this.tabs[0].formType === 'form2') {
      const yearOfSlbIndex = this.tabs[0].data.findIndex((e: any) => e.key === 'yearOfSlb');
      this.tabs[0].data[yearOfSlbIndex].options = this.oldYearOfSlbOptions.slice(0, index);
      const yearOfSlbControl = this.getFG('demographicData', yearOfSlbIndex).get('yearOfSlb');
      if (index === 0) {
        this.tabs[0].data[yearOfSlbIndex].required = false;
        yearOfSlbControl.patchValue(null);
        yearOfSlbControl.disable();
        yearOfSlbControl.clearValidators();
        yearOfSlbControl.updateValueAndValidity();
      } else {
        this.tabs[0].data[yearOfSlbIndex].required = true;
        yearOfSlbControl.enable();
        yearOfSlbControl.setValidators([Validators.required]);
        yearOfSlbControl.updateValueAndValidity();
      }
    }
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
        text: `Are you sure you want to submit this form? Once submitted, 
        it will not be editable and will be sent to State/UT for Review. Alternatively, 
        you can ‘Save as Draft’ for now and submit it later.`,
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
              this.handleHttpError(error);
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
        'Incomplete or incorrect data entered!',
        'The form can not be submitted without filling in all the mandatory fields correctly.',
        'error'
      ).then(() => {
        //scroll to fisrt error tab
        setTimeout(() => {
          for (const tab of this.tabs) {
            // console.log('tab.key', tab.key, 'invalid', this.form.get(tab.key)?.invalid);

            if (this.form.get(tab.key)?.invalid) {
              document.getElementById(tab.key)?.scrollIntoView({ behavior: "smooth" });
              return;
            }
          }
        }, 500)
      });
    }
  }
  handleHttpError(error: any) {
    Swal.fire(
      'Error',
      error.message || 'Something went wrong! Please try again',
      'error'
    );
    this.formSaveLoader = false;
    this.tabChangeLoader = false;
  }
  getAllTabData() {
    const formData: any = { tab: [] };
    for (let tab of this.tabs) {
      if (tab.key !== 'reviewSubmit') {
        formData.tab.push(this.getFormTabData(tab));
      }
    }
    return formData;
  }
  onTabChange(event: StepperSelectionEvent) {
    if (!this.isFormEditable) {
      return;
    }
    // console.log('onTabChange',event);

    // return;
    // if last tab load only data
    if (event.previouslySelectedIndex !== this.totalTabs && !this.actionType) {
      this.tabChangeLoader = true;
      // console.log('event', event.selectedIndex, 'this.totalTabs', this.totalTabs);
      // const formData = this.getAllTabData();
      const formData = this.getFormData();
      this.service.saveUlbForm(this.ulbId, formData).subscribe({
        next: (res) => {
          // move from 1st or navigate to last tab reload form
          if (event.previouslySelectedIndex === 0 || event.selectedIndex === this.totalTabs) {
            this.onLoad();
          } else {
            this.tabChangeLoader = false;
          }
          this.triggerSnackbar();
        }, error: (error: any) => {
          this.handleHttpError(error);
        }
      });
    }
  }
  saveAs(actionType: string) {
    const currentForm = this.form.get(this.tabs[this.selectedStepIndex].key);

    currentForm?.markAllAsTouched()

    this.actionType = actionType;

    const formData = this.getFormData();
    // return;
    this.formSaveLoader = true;

    this.service.saveUlbForm(this.ulbId, formData).subscribe({
      next: (res) => {
        this.triggerSnackbar();
        this.formSaveLoader = false;
        this.actionType = '';
      }, error: (error: any) => {
        this.handleHttpError(error);
      }
    });
  }
  // afterSave() {
  //   // if (this.actionType === 'next') {
  //   //   this.stepper?.next();
  //   // } else if (this.actionType === 'previous') {
  //   //   this.stepper?.previous();
  //   // }
  //   this.triggerSnackbar();
  //   this.formSaveLoader = false;
  //   this.actionType = '';
  //   // Swal.close();
  // }
  // saveAs_bkp(actionType: string) {
  //   const currentForm = this.form.get(this.tabs[this.selectedStepIndex].key);
  //   // console.log(`currentForm?.valid;`, currentForm?.valid);
  //   // console.log(`this.form.valid;`, this.form.valid);

  //   currentForm?.markAllAsTouched()

  //   this.actionType = actionType;

  //   // console.log('this.actionType', this.actionType, 'this.selectedStepIndex', this.selectedStepIndex, 'this.totalTabs', this.totalTabs);

  //   // if back from review tab no action
  //   if (this.actionType === 'previous' && this.selectedStepIndex === this.totalTabs) {
  //     this.stepper?.previous();
  //     this.actionType = '';
  //     return;
  //   }
  //   const formData = this.getFormData();
  //   // return;
  //   this.formSaveLoader = true;

  //   this.service.saveUlbForm(this.ulbId, formData).subscribe({
  //     next: (res) => {
  //       // for last tab load json again
  //       if (this.actionType === 'next' && (this.selectedStepIndex + 1) === this.totalTabs) {
  //         this.onLoad(true);
  //       }
  //       // after first tab load json again
  //       else if (this.actionType !== 'stay' && this.selectedStepIndex === 0) {
  //         this.onLoad(true);
  //       } else {
  //         this.afterSave();
  //       }
  //     }, error: (error: any) => {
  //       this.handleHttpError(error);
  //     }
  //   });
  // }
  getFormData() {
    const formData: any = { tab: [], formStatus: 'IN_PROGRESS' }
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
    }

    // console.log('formData----', formData);
    return tabData;

  }

  isPlainObject(data: unknown): data is { [s: string]: unknown; } {
    return typeof data === 'object' && data !== null && !Array.isArray(data);
  }

  triggerSnackbar() {
    this._snackBar.open('Data saved successfully!', 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 10000,
      panelClass: ['custom-snackbar-success']
    });
  }
  // onSubmit(event: Event) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   if (this.form.valid) {
  //     // this.submit.emit(this.form.value);
  //   } else {
  //     // this.validateAllFormFields(this.form);
  //   }
  // }

  getTabGroup(tabKey: string): FormArray {
    return (this.form.get(tabKey) as FormArray)
  }

  getFG(tabKey: string, i: number): any {
    // console.log('tabKey',tabKey, 'i',i, '---',(this.form.get(tabKey) as FormArray).controls[i]);    
    return (this.form.get(tabKey) as FormArray).controls[i];
  }

}

