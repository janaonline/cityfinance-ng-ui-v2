import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import {
  MatDialog
} from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { CommonService } from "../../../../core/services/common.service";
import { MaterialModule } from "../../../../material.module";
import { FilterModelBoxComponent } from "../filter-model-box/filter-model-box.component";
import { ResourcesDashboardService } from "../resources-dashboard.service";
@Component({
    selector: "app-filter-component",
    templateUrl: "./filter-component.component.html",
    styleUrls: ["./filter-component.component.scss"],
    imports: [MaterialModule]
})
export class FilterComponentComponent implements OnInit, OnChanges {
  @Output() filterFormData = new EventEmitter<any>();
  @Output() clearEvent = new EventEmitter<any>();


  @Input() filterTabDataSet!: any;
  @Input() filterInputData!: any;
  @Input() downloadValue!: any;
  @Input() data!: any;
  @Input() category!: any;
  @Output()
  init = new EventEmitter();
  @Output() download = new EventEmitter();
  @Input() mobileFilterConfig: any;


  state = new FormControl();


  dropdownSettings = {
    singleSelection: true,
    text: "State",
    enableSearchFilter: true,
    labelKey: "name",
    primaryKey: "_id",
    showCheckbox: false,
    classes: "filter-component",
  };


  selectedValue: string = "2020-21";
  defaultYearInDropdown: string = "";
  selectedType: string = "Raw Data PDF";

  constructor(
    private fb: FormBuilder,
    private _commonServices: CommonService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private _resourcesDashboardService: ResourcesDashboardService
  ) {
    // this.filterData("", "");
    this.addYearsTillCurrent();

    const year = this.route.snapshot.queryParamMap.get('year') || this.selectedValue;
    const ulbName = this.route.snapshot.queryParamMap.get('ulbName') || this.route.snapshot.queryParamMap.get('ulb') || '';
    const ulbId = this.route.snapshot.queryParamMap.get('ulbId') || '';
    this.stateId = this.route.snapshot.queryParamMap.get('state') || '';
    const contentType = this.route.snapshot.queryParamMap.get('type') || this.selectedType;
    this.initializationFilterValue();
    this.defaultYearInDropdown = this.selectedValue;
    this.selectedValue = year ? year : "";
    this.getStatesList();
    this.patchFilterValues(this.stateId, ulbId, ulbName, this.selectedValue, contentType);
  }

  stateList!: any;
  ulbList!: any;
  filterForm!: FormGroup;
  globalOptions = [];
  yearList = [
    "2015-16",
    "2016-17",
    "2017-18",
    "2018-19",
    "2019-20",
    "2020-21",
    "2021-22",
  ];
  cType = ["Raw Data PDF", "Raw Data Excel", "Standardised Excel"];
  // "Standardised Excel",
  // "Standardised PDF",
  filteredOptions!: Observable<any[]>;
  stateId: string = "";
  getYearsList() {
    this._resourcesDashboardService.getYearsList().subscribe((res: any) => {
      console.log("years===>", res.data);
      this.yearList = res.data;
      this.yearList.unshift('All Years')
      this.defaultYearInDropdown = "All Years";
      this.filterForm.patchValue({
        year: "All Years",
      });

      console.log("this.filterFrom", this.filterForm);
      this.filterFormData.emit(this.filterForm);
    });
  }

  ngOnInit(): void {
    console.log("daaaaa", this.filterInputData);
    this.getStatesList();
    // this.addYearsTillCurrent();
  }

  onChange(event) {
    this.selectedValue = event.target.value;
    this.filterData("year", "");
  }
  onChangeType(event) {
    this.selectedType = event.target.value;
    this.filterData("type", "");
  }

  getStatesList() {
    const stateCode = this.route.snapshot.queryParamMap.get('stateCode');
    this._commonServices.fetchStateList().subscribe(
      (res: any) => {
        console.log("res", res);
        this.stateList = this._commonServices.sortDataSource(res, "name");
        if (stateCode || this.stateId) {
          const state = stateCode ? this.stateList?.find(st => st?.code == stateCode) : this.stateList?.find(st => st?._id == this.stateId);
          this.state.patchValue([state]);
          this.onStateChange(state);
        }
        this.loadData();
        console.log("this.state this.state 234", this.state);
      },
      (error) => {
        console.log(error);
      }
    );
  }
  loadData() {
    this.filterForm?.controls?.ulb?.valueChanges.subscribe((value) => {

      console.log(value, this.filterForm.value);
      if (value?.length >= 1) {
        if ((this.filterForm.value.hasOwnProperty('state') && this.filterForm.value.state != undefined)
          && (this.filterForm.value.hasOwnProperty('ulb') && this.filterForm.value.state != undefined)
        ) {
          this._commonServices
            .postGlobalSearchData({ ...this.filterForm.value, ulb: value }, "ulb", this.filterForm.value.state)
            .subscribe((res: any) => {
              const emptyArr: any = [];
              this.filteredOptions = emptyArr;
              if (res?.data.length > 0) {
                this.filteredOptions = res?.data;
                //this.noDataFound = false;
              } else {
                const emptyArr: any = [];
                this.filteredOptions = emptyArr;
                // this.noDataFound = true;
                console.log("no data found");
              }
              const obj = res?.data.find(e => e.ulbName == this.filterForm?.value?.ulb)
              if (obj && (!this.filterForm.value['ulbId'] || this.filterForm.value['ulbId'] != obj._id)) {
                this.filterForm.patchValue({
                  ulb: obj?.name,
                  ulbId: obj?._id
                })
                this.filterData('ulb', obj);
              }

            });
        }

      } else {
        return null;
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes====>", changes);
    // check the object "changes" for new data
    // console.log("chanhged happed", changes.category.currentValue);
    if (
      changes &&
      changes.filterInputData &&
      changes.filterInputData.currentValue
    ) {
      const filterTabValue = changes.filterInputData.currentValue.comp;
      if (
        filterTabValue == "report-publications" ||
        filterTabValue == "bestPractices"
      ) {
        this.getYearsList();
      }
    }
    if (changes && changes.category && changes.category.currentValue) {
      this.filterData("category", "");
    }

    if (changes.data) {
      console.log(this.data);
    }
    if (changes && changes.download && changes.download.currentValue) {
      this.download = changes.download.currentValue;
    }
  }

  initiateDownload() {
    this.download.emit(true);
  }
  filterData(param: string, val: any) {
    if (param === "ulb") {
      const ulbName = val?.name || '';
      const stateId = val?.state?._id || '';

      this.filterForm.patchValue({
        state: stateId,
        ulbId: val?._id || '',
        ulb: ulbName,
      });
    } else if (param === "state") {
      const emptyArr: any = [];
      this.filteredOptions = emptyArr;
      this.filterForm.patchValue({
        ulbId: '',
      });
    }

    // Emit the updated form values for further processing
    this.filterFormData.emit(this.filterForm);
  }


  clearAll() {
    const emptyArr: any = [];
    this.filteredOptions = emptyArr;
    this.filterForm.reset();
    this.state.reset();

    this.patchFilterValues("", "", "", this.defaultYearInDropdown, "Raw Data PDF")
    this.filterFormData.emit(this.filterForm);
    this.clearEvent.emit();
    this.loadData();
  }

  defaultFilterStage: boolean = false;
  tempDataHolder: any;
  filterModel() {
    const dialogRef = this.dialog.open(FilterModelBoxComponent, {
      width: "100%",
      height: "100%",
      data: {
        mobileFilterConfig: this.mobileFilterConfig,
        yearList: this.yearList,
        preSelectedValue: { ...this.tempDataHolder },
        defaultStage: this.defaultFilterStage,
        fileType: this.cType,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      if (result && result.filterForm) {
        this.defaultFilterStage = result?.defaultStage;
        this.tempDataHolder = result?.filterForm?.value;
        this.filterFormData.emit(result?.filterForm);
      }
    });
  }

  onStateChange(state) {
    this.filterForm.patchValue({ state: state._id })
    this.filterData('state', '')
  }


  /*initializationFilterValue method initialise the filter form */
  initializationFilterValue() {
    this.filterForm = this.fb.group({
      state: [""],
      ulb: [""],
      ulbId: [""],
      contentType: [""],
      sortBy: [""],
      year: [""],
      category: this.category,
    });
  }

  /*patchFilterValues method patch all values based on filter applied */
  patchFilterValues(stateId, ulbId, ulbName, year, contentType) {
    this.filterForm.patchValue({
      year,
      ulb: ulbName,
      ulbId,
      contentType,
      state: stateId
    });
  }

  /*this method add calander year dynamic in yearList array, format- "2021-22" */
  addYearsTillCurrent() {
    // Get the current year
    const currentYear = new Date().getFullYear();
    // get the previous year which is presented in the year list
    let lastYear = parseInt(this.yearList[this.yearList.length - 1]);

    // Generate and add years until the current year
    while (lastYear <= currentYear) {
      const formattedYear = `${lastYear - 1}-${String(lastYear).slice(2)}`;

      // Check if the year is not already in the array
      if (!this.yearList.includes(formattedYear)) {
        // Add the year to the array
        this.yearList.push(formattedYear);
      }

      // Move to the next year
      lastYear++;
    }

    // Reverse the array if needed
    this.yearList.reverse();

    // Set the latest year.
    this.selectedValue = this.yearList[0];
  }
}
