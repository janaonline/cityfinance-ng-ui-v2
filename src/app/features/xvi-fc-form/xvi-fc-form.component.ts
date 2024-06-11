import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { tabsJson } from './formJson';
// import { tabsJson } from './xviFormJson';
import { tabsJson } from './xviFormJsonApi';
import { MaterialModule } from '../../material.module';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';
import { USER_TYPE } from '../../core/models/user/userType';
import { FiscalRankingService, StatusType } from './services/fiscal-ranking.service';
import { MatStepper } from '@angular/material/stepper';
import { UserUtility } from '../../core/util/user/user';
import swal from 'sweetalert2';
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

  get value() {
    return this.form.value;
  }
  constructor(private fb: FormBuilder,
    // public fiscalService: FiscalRankingService,
    public service: XviFcService,
    public formService: DynamicFormService
    // private dataEntryService: DataEntryService,
    // private _router: Router,
    // private dialog: MatDialog,
    // private activatedRoute: ActivatedRoute,
    // private loaderService: GlobalLoaderService,
    // private dateAdapter: DateAdapter<Date>
  ) { }

  ngOnInit() {
    // this.isLoader=true;
    // setTimeout(()=> {
    //   this.isLoader=false;
    // }, 3000)
    // this.form = this.formService.tabControl(tabsJson.data.tabs);
    // console.log('this.form----', this.form);
    // console.log('this.form.getRawValue()---',this.form.getRawValue());

    // this.form.valueChanges.subscribe(x => {
    //   this.submit.emit(x);
    //   // this.childFG.emit(this.form);
    // });
    this.onLoad();
  }

  // validateAllFormFields(formGroup: FormGroup) {
  //   Object.keys(formGroup.controls).forEach(field => {
  //     const control = formGroup.get(field);
  //     control?.markAsTouched({ onlySelf: true });
  //   });
  // }

  // submit(value: any) { }

  saveAs(type: string) {
    console.log('this.form.value', this.form.value);
    // Object.entries(this.form.value)
    const formJson: any = this.form.value;

    const formData = {
      "ulb": "5dcfca53df6f59198c4ac3d5",
      "state": "5dcf9d7516a06aed41c748fa",
      "xvifc": "5dcf9d7516a06aed41c748fb",
      "tab": [
        {
          "tabKey": "demographicData",
          data: [
            {
              "key": "nameOfUlb",
              "value": "",
              "saveAsDraftValue": "2nd Try",
              file: { name: '', url: '' },
              reason: ''
            }
          ]
        }
      ]
    };
    for (const tab of this.tabs) {
      // const tab = { tabKey: tab.key, data:  []};
      formData.tab.push();
      if (tab.key === 'demographicData') {

      } else if (tab.key === 'financialData') {

      } else if (tab.key === 'uploadDoc') {

      } else if (tab.key === 'accountPractice') {

      }
      // else if(tab.key=== 'demographicData') {

      // }

    }
    for (const [key, fields] of Object.entries(formJson)) {
      console.log(`key: fields-----`, fields);
      const data = [];
      for (const field of formJson[key]) {
        console.log(`field----`, field);
        const filedData = {}
      }
      // fields.forEach(() => {

      // });
      const tab = { tabKey: key, data: '' };
      formData.tab.push();
    }
    this.stepper?.next();
    // this.selectedStepIndex += this.selectedStepIndex;
    // this.stepper?.previous();
    // if(this.stepper) this.stepper.selectedIndex = 3;

    // this.service.saveUlbForm(this.ulbId, this.form.value).subscribe((res) => {
    //   // this.stepper?.next();
    // });
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

  onLoad() {
    this.isLoader = true;
    // this.ulbId = '5dcfca53df6f59198c4ac3d5';
    this.ulbId = '5dd24e98cc3ddc04b552b7d4';
    this.service.getUlbForm(this.ulbId).subscribe((res: any) => {
      this.tabs = this.fields = res?.data?.tabs;

      // this.tabs = tabsJson.data.tabs;
      this.tabs.push({
        key: 'reviewSubmit',
        label: "Review & Submit",
        "displayPriority": this.tabs.length + 1,
      });
      this.form = this.formService.tabControl(this.tabs);
      // this.hideForm = res?.data?.hideForm;
      // this.notice = res?.data?.notice;
      // this.formId = res?.data?._id;
      // this.isDraft = res?.data?.isDraft;
      // this.ulbName = res?.data?.ulbName;
      // this.stateCode = res?.data?.stateCode;
      // this.currentFormStatus = res?.data?.currentFormStatus;

      // this.financialYearTableHeader = res?.data?.financialYearTableHeader;
      // this.pmuSubmissionDate = res?.data?.pmuSubmissionDate;
      // this.isAutoApproved = res?.data?.isAutoApproved;

      // this.form = this.fb.array(this.tabs.map(tab => this.getTabFormGroup(tab)))
      // this.addSkipLogics();
      // if (this.userData.role == this.userTypes.ULB) {
      // this.addSumLogics();
      // }
      // this.addSubtractLogics();
      // this.form.markAsPristine();
      this.isLoader = false;
      // this.msgForLedgerUpdate = res?.data?.messages;
      // if (this.msgForLedgerUpdate?.length) swal.fire("Confirmation !", `${this.msgForLedgerUpdate?.join(', ')}`, "warning")
    });
  }



}

