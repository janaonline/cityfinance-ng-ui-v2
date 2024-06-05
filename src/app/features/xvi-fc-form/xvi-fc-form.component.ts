// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-xvi-fc-form',
//   standalone: true,
//   imports: [],
//   templateUrl: './xvi-fc-form.component.html',
//   styleUrl: './xvi-fc-form.component.scss'
// })
// export class XviFcFormComponent {

// }

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { tabsJson } from './formJson';
import { tabsJson } from './xviFormJson';
import { MaterialModule } from '../../material.module';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';
import { USER_TYPE } from '../../core/models/user/userType';
import { FiscalRankingService, StatusType } from '../xvi-fc/services/fiscal-ranking.service';
import { MatStepper } from '@angular/material/stepper';
import { UserUtility } from '../../core/util/user/user';
import swal from 'sweetalert2';
import { Tab, APPROVAL_TYPES } from '../../core/models/models';
import { AlreadyUpdatedUrlPipe } from '../../core/pipes/already-updated-url.pipe';
import { DisplayPositionPipe } from '../../core/pipes/display-position.pipe';
import { PercentprogressPipe } from '../../core/pipes/percentprogress.pipe';
import { ToStorageUrlPipe } from '../../core/pipes/to-storage-url.pipe';
import { TowordPipe } from '../../core/pipes/toword.pipe';
import { CommonActionRadioComponent } from '../../shared/components/actions/common-action-radio/common-action-radio.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { DecimalLimitDirective } from '../xvi-fc/directives/decimal-limit.directive';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalLoaderService } from '../../core/services/loaders/global-loader.service';
import { DataEntryService } from '../xvi-fc/services/data-entry.service';
import { AccountingPracticeComponent } from './accounting-practice/accounting-practice.component';
import { ReviewSubmitComponent } from './review-submit/review-submit.component';
import { YearwiseFilesComponent } from './yearwise-files/yearwise-files.component';
import { DynamicFormService } from '../../shared/dynamic-form/dynamic-form.service';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';

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
    TowordPipe,
    ToStorageUrlPipe,
    AlreadyUpdatedUrlPipe,
    DisplayPositionPipe,
    DecimalLimitDirective,
    CommonActionRadioComponent,
    LoaderComponent,

    YearwiseFilesComponent,
    AccountingPracticeComponent,
    ReviewSubmitComponent,
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
  loggedInUserType: any;
  hideForm: boolean = false;
  notice!: string;
  pmuSubmissionDate!: string;
  isAutoApproved: boolean = false;
  selfDeclarationTabId: string = 's5';
  guidanceNotesKey: string = 'guidanceNotes';
  incomeSectionBelowKey: number = 1;
  expenditureSectionBelowKey: number = 8;
  financialYearTableHeader: { [key: number]: string[] } = {};
  linearTabs: string[] = ['s1', 's2'];
  twoDTabs: string[] = ['s4', 's5', 's6'];
  textualFormFiledTypes: string[] = ['text', 'url', 'email', 'number'];
  tabs: Tab[] = [];
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
  msgForLedgerUpdate: string[] = [];
  fields: any[] = tabsJson.data.tabs;

  get value() {
    return this.form.value;
  }
  constructor(private fb: FormBuilder,
    public fiscalService: FiscalRankingService,
    public formService: DynamicFormService
    // private dataEntryService: DataEntryService,
    // private _router: Router,
    // private dialog: MatDialog,
    // private activatedRoute: ActivatedRoute,
    // private loaderService: GlobalLoaderService,
    // private dateAdapter: DateAdapter<Date>
  ) { }

  ngOnInit() {
    this.form = this.formService.tabControl(tabsJson.data.tabs);
    // console.log('this.form----', this.form);
    // console.log('this.form.getRawValue()---',this.form.getRawValue());

    // this.form.valueChanges.subscribe(x => {
    //   this.submit.emit(x);
    //   // this.childFG.emit(this.form);
    // });
    // this.onLoad();
  }

  // validateAllFormFields(formGroup: FormGroup) {
  //   Object.keys(formGroup.controls).forEach(field => {
  //     const control = formGroup.get(field);
  //     control?.markAsTouched({ onlySelf: true });
  //   });
  // }

  // submit(value: any) { }



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

  onLoad() {
    console.log('-----dfdf----');

    this.isLoader = true;
    // this.fiscalService.getfiscalUlbForm(this.design_year, this.ulbId).subscribe((res: any) => {
    // const res:any = formJson;
    const res: any = tabsJson;
    this.hideForm = res?.data?.hideForm;
    this.notice = res?.data?.notice;
    this.formId = res?.data?._id;
    this.isDraft = res?.data?.isDraft;
    this.ulbName = res?.data?.ulbName;
    this.stateCode = res?.data?.stateCode;
    this.currentFormStatus = res?.data?.currentFormStatus;
    this.tabs = res?.data?.tabs;
    this.financialYearTableHeader = res?.data?.financialYearTableHeader;
    this.pmuSubmissionDate = res?.data?.pmuSubmissionDate;
    this.isAutoApproved = res?.data?.isAutoApproved;

    // this.form = this.fb.array(this.tabs.map(tab => this.getTabFormGroup(tab)))
    // this.addSkipLogics();
    // if (this.userData.role == this.userTypes.ULB) {
    // this.addSumLogics();
    // }
    // this.addSubtractLogics();
    this.form.markAsPristine();
    this.isLoader = false;
    this.msgForLedgerUpdate = res?.data?.messages;
    if (this.msgForLedgerUpdate?.length) swal.fire("Confirmation !", `${this.msgForLedgerUpdate?.join(', ')}`, "warning")
    // });
  }

  getTabFormGroup(tab: Tab): any {
    const { data, feedback, ...rest } = tab;
    // console.log('data', data);

    return this.fb.group({
      ...rest,
      // feedback: this.fb.group({
      //   comment: [feedback.comment,],
      //   status: feedback.status,
      //   _id: feedback._id,
      // }),
      data: this.fb.group(Object.entries(data).reduce((obj: any, [key1, item]: any) => {
        // console.log('obj, key, item----', key, item);
        let key = item.key;
        if (this.linearTabs.includes(tab.id)) {
          obj[key] = this.getInnerFormGroup({ ...item, key })
        }
        else if (tab.id == this.selfDeclarationTabId) {
          obj[key] = this.fb.group({
            uploading: [{ value: false, disabled: true }],
            name: [item.name, this.userData?.role == USER_TYPE.ULB && item.required ? Validators.required : null],
            readonly: [{ value: item.readonly, disabled: true }],
            status: [item?.status, this.getStatusValidators(item, tab.id)],
            rejectReason: item?.rejectReason,
            url: [item.url, this.userData?.role == USER_TYPE.ULB && item.required ? Validators.required : null],
          });
          this.attactRequiredReasonToggler(obj[key]);
        }
        else {
          obj[key] = this.fb.group({
            key: item.key,
            position: [{ value: +item.displayPriority || 1, disabled: true }],
            isHeading: [{ value: this.isHeading(item.displayPriority), disabled: true }],
            required: [{ value: item.required, disabled: true }],
            modelName: [{ value: item.modelName, disabled: true }],
            calculatedFrom: [{ value: item.calculatedFrom, disabled: true }],
            logic: [{ value: item.logic, disabled: true }],
            canShow: [{ value: true, disabled: true }],
            label: [{ value: item.label, disabled: true }],
            info: [{ value: item.info, disabled: true }],
            yearData: this.fb.array(item.yearData.slice().reverse().map((yearItem: any) => this.getInnerFormGroup(yearItem, item, tab?.id)))
          })
        }
        return obj;
      }, {}))
    })
  }

  isHeading(displayPriority: string): boolean {
    if (['5.1', '5.2', '7.1', '7.2'].includes(displayPriority)) return true;
    if (['24', '25', '26', '27', '28', '29', '30', '31', '32', '33'].includes(displayPriority)) return false;
    return Number.isInteger(+displayPriority);
  }

  getApprovalTypeValidators(item: { status: string; suggestedValue: any; }) {
    if (this.userData?.role == USER_TYPE.ULB && item?.status == 'REJECTED' && item?.suggestedValue) {
      return [
        Validators.required,
        (control: { value: APPROVAL_TYPES; }) => [
          APPROVAL_TYPES.enteredPmuAcceptUlb,
          APPROVAL_TYPES.enteredPmuRejectUlb
        ].includes(control.value) ? null : { invalidApprovalType: true }
      ];
    } else if (this.userData?.role == USER_TYPE.PMU && item?.status == 'REJECTED' && item?.suggestedValue) {
      return [
        Validators.required,
        (control: { value: APPROVAL_TYPES; }) => control.value !== APPROVAL_TYPES.enteredPmuRejectUlb ? null : { invalidApprovalType: true }
      ];
    } else {
      return [];
    }
  }

  getInnerFormGroup(item: any, parent?: any, tabId?: any) {
    const innerFormGroup = this.fb.group({
      key: item.key,
      value: [item.value, this.getValidators(item, !['date', 'file'].includes(item.formFieldType), parent)],
      originalValue: item.value,
      year: item.year,
      type: item.type,
      _id: item._id,
      modelName: [{ value: item.modelName, disabled: true }],
      suggestedValue: [item?.suggestedValue],
      pmuSuggestedValue2: [item?.pmuSuggestedValue2],
      approvalType: [item?.approvalType, this.getApprovalTypeValidators(item)],
      ulbValue: [item?.ulbValue],
      ulbComment: [item?.ulbComment],
      focused: [{ value: false, disabled: true }],
      required: [{ value: item.required, disabled: true }],
      options: [{ value: item.options, disabled: true }],
      isRupee: [{ value: item.isRupee, disabled: true }],
      code: [{ value: item.code, disabled: true }],
      previousYearCodes: [{ value: item.previousYearCodes, disabled: true }],
      min: [{ value: new Date(item?.min), disabled: true }],
      max: [{ value: new Date(item?.max), disabled: true }],
      date: [item.date, this.userData?.role == USER_TYPE.ULB && item.formFieldType == 'date' && item.required ? [Validators.required] : []],
      formFieldType: [{ value: item.formFieldType || 'text', disabled: true }],
      status: [item?.status, this.getStatusValidators(item, tabId)],
      rejectReason: [item?.rejectReason],
      rejectReason2: [item?.rejectReason2],
      bottomText: [{ value: item.bottomText, disabled: true }],
      label: [{ value: item.label, disabled: true }],
      info: [{ value: item.info, disabled: true }],
      placeholder: [{ value: item.placeholder, disabled: true }],
      desc: [{ value: item.desc, disabled: true }],
      position: [{ value: item.postion, disabled: true }],
      pos: [{ value: item.pos, disabled: true }],
      readonly: [{ value: item.readonly, disabled: true }],
      ...(item.file && {
        file: this.fb.group({
          uploading: [{ value: false, disabled: true }],
          name: [item.file.name, this.userData?.role == USER_TYPE.ULB && item.required ? [Validators.required] : []],
          url: [item.file.url, this.userData?.role == USER_TYPE.ULB && item.required ? [Validators.required] : []]
        })
      })
    });
    this.attactRequiredReasonToggler(innerFormGroup, tabId);
    return innerFormGroup;
  }

  getStatusValidators(item: { status: any; }, tabId: string) {
    if (this.loggedInUserType == this.userTypes.PMU) {
      if (item?.status) {
        if (tabId != 's3' && this?.pmuSubmissionDate) {
          return Validators.pattern(/^(APPROVED)$/)
        }
        return Validators.pattern(/^(REJECTED|APPROVED)$/)
      }
      return null;
    }
    return null;
  }

  attactRequiredReasonToggler(innerFormGroup: FormGroup, tabId?: any) {
    const statusControl = innerFormGroup.get('status');
    statusControl?.valueChanges.subscribe(status => {
      const rejectReasonControl = innerFormGroup.get('rejectReason');
      const suggestedValueControl = innerFormGroup.get('suggestedValue');
      rejectReasonControl?.setValidators(status == 'REJECTED' ? [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ] : []);
      suggestedValueControl?.setValidators(status == 'REJECTED' && tabId == 's3' ? [
        Validators.required
      ] : []);
      rejectReasonControl?.updateValueAndValidity({ emitEvent: true });
      suggestedValueControl?.updateValueAndValidity({ emitEvent: true });
    });
    statusControl?.updateValueAndValidity({ emitEvent: true });
  }

  getValidators(item: any, canApplyRequired = false, parent?: any) {
    if (this.userData?.role != USER_TYPE.ULB) return [];
    return [
      ...(parent?.logic == 'sum' && item.modelName ? [Validators.pattern(new RegExp(item.value))] : []),
      ...(item.required && canApplyRequired ? [Validators.required] : []),
      ...(item.formFieldType == 'url' ? [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')] : []),
      ...(item.formFieldType == 'email' ? [Validators.email] : []),
      ...(item.min !== '' ? [Validators[item.formFieldType == 'number' ? 'min' : 'minLength'](+item.min)] : []),
      ...(item.max !== '' ? [Validators[item.formFieldType == 'number' ? 'max' : 'maxLength'](+item.max)] : []),
    ];
  }

}

