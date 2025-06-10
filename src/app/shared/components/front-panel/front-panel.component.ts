import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import * as fileSaver from "file-saver";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "../../../core/services/common.service";
import { GlobalLoaderService } from "../../../core/services/loaders/global-loader.service";
import { OwnRevenueService } from "../../../pages/own-revenue-dashboard/own-revenue.service";
import { SharedCardComponent } from "../shared-card/shared-card.component";

@Component({
  selector: "app-front-panel",
  imports: [CommonModule, SharedCardComponent],
  templateUrl: "./front-panel.component.html",
  styleUrls: ["./front-panel.component.scss"],
})
export class FrontPanelComponent implements OnInit, OnChanges {
  @Input()
  data: any = {
    showMap: true,
    stateId: "",
    date: "",
    year: "2021-22",
    name: "",
    desc: "This urban local body has been classified as a municipal corporation in the 4M+ population category",
    finance: "",
    link: "",
    linkName: "",
    footer: ``,
    disclaimer: "",
    dataIndicators: [
      // {
      //   value: "0 Million",
      //   title: "population",
      // },
      // { value: "0 Sq km", title: "area" },
      // { value: "0/ Sq km", title: "populationDensity" },
      // {
      //   value: "0",
      //   title: "wards",
      // },
    ],
  };
  @Input()
  showDataAvailable = false;
  @Input()
  cardData: any = [revenue, expenditure, assets, liabilities, tax_revenue, grants];
  @Input()
  cardStyle = cardStyle;
  @Input()
  componentName!: string;
  @Input()
  mapConfig = {
    showStateList: false,
    showDistrictList: false,
    stateMapContainerHeight: "23rem",
    nationalZoomOnMobile: 3.9, // will fit map in container
    nationalZoomOnWeb: 3.9, // will fit map in container
    stateZoomOnMobile: 4, // will fit map in container
    stateZoomOnWeb: 4, // will fit map in container
    stateBlockHeight: "23.5rem", // will fit map in container
  };
  @Output()
  changeInStateOrCity = new EventEmitter();
  @Output()
  yearValue = new EventEmitter();

  @Output()
  dataAvailEmit = new EventEmitter();
  dataAvailLoading = false;
  financialYear: any;
  availValue: any;
  dataAvailable!: number;
  stateList: any;
  notFoundNames = [];
  showButton: boolean = true;
  ulbList: any;
  constructor(
    public ownRevenueService: OwnRevenueService,
    public _loaderService: GlobalLoaderService,
    public _commonServices: CommonService,
    private router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    this.ulbList = JSON.parse(localStorage.getItem("ulbList") || "{}");
  }
  ngOnInit(): void {
    console.log("this.data====>", this.data, this.componentName);
    console.log("this.data====> this.componentName", this.componentName);
    this._commonServices.fetchStateList().subscribe(
      (res: any) => {
        // console.log('res', res);
        this.stateList = this._commonServices.sortDataSource(res, "name");
      },
      (error) => {
        console.log(error);
      }
    );

    this._commonServices.lastUpdatedYear.subscribe((data) => {
      console.log("lastUpdateYear", data);
      this.yearVal = data;
      this.data.year = data;
      this.getAvailableData();
    });

    this._commonServices.getSelectedYear.subscribe((res: any) => {
      if (res) {
        if (res.length > 0) {
          this.yearVal = res;
          this.data.year = res;
          if (this.componentName != 'National')
            this.getAvailableData();
        }
      }
    })
  }
  yearVal = "";

  stateChanges(event: any) {
    console.log("new Event", event);
    this.viewDashboard(event.target.value);
  }

  viewDashboard(stateId: any) {
    this.router.navigateByUrl(`/dashboard/state?stateId=${stateId}`);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("stateChanges", changes);
    if (changes && changes['data'] && changes['data'].currentValue) {
      this.data = Object.assign(changes['data'].currentValue);
      this.yearValue.emit(this.data["year"]);
      console.log("dataaaaa", this.data);
      // this.data["date"] = changes.data.currentValue?.date;
      // this.yearVal = this.data.year;
      // this.getAvailableData();
    }
  }

  changeInMapFilter(event: { value: { ST_CODE: string | number; }; }) {
    console.log("changeInMapFilter", event);
    console.log("this.ulbList", this.ulbList);
    const stateId = this.ulbList?.data[event?.value?.ST_CODE]._id;
    console.log("stateId", stateId);
    this.getAvailableData(stateId);
    this.changeInStateOrCity.emit(event);
  }
  // yearVal = "2020-21";
  ulbId: any;
  downloadCSV(from: any) {
    const obj = {
      financialYear: this.yearVal,
      stateId: this.data.stateId,
      csv: true,
    };
    this._loaderService.showLoader();
    this.ownRevenueService.displayDataAvailable(obj).subscribe(
      (res: any) => {
        this._loaderService.stopLoader();
        const blob: any = new Blob([res], {
          type: "text/json; charset=utf-8",
        });
        const url = window.URL.createObjectURL(blob);

        fileSaver.saveAs(blob, "dataAvailable.xlsx");
      },
      (error: any) => {
        this._loaderService.stopLoader();
      }
    );
  }

  selectedStateId: string = "";
  getStateId() {
    this.selectedStateId = "";
    this.activatedRoute.queryParams.subscribe((val) => {
      console.log("val", val);
      const { stateId } = val;
      if (stateId) {
        this.selectedStateId = stateId;
        sessionStorage.setItem("stateId", this.selectedStateId);
      } else {
        this.selectedStateId = sessionStorage.getItem("row_id") || "";
      }
    });
  }

  getAvailableData(stateId: string = "") {
    console.log("getAvailableData called");
    // this.getStateId();
    // this._loaderService.showLoader()
    this.dataAvailLoading = true;
    let obj;
    if (this.componentName == 'stateDB') {
      obj = {
        financialYear: this.yearVal,
        stateId: stateId ? stateId : this.data.stateId,
        // from:"slb"
      };
    } else {
      obj = {
        financialYear: this.yearVal,
        stateId: stateId ? stateId : this.data.stateId,
        from: "slb"
      };
    }
    if (!this.yearVal) {
      this.yearVal = '2021-22',
        this.data.year = '2021-22'
    }
    this.ownRevenueService.displayDataAvailable(obj).subscribe(
      (res: any) => {
        // this._loaderService.stopLoader();
        this.dataAvailLoading = false;
        this.dataAvailEmit.emit(res);
        // this._loaderService.stopLoader()
        // res["data"].percent = parseFloat(res["data"].percent.toFixed(2));
        const percentage =
          res["data"] && res["data"].percent
            ? Math.round(res["data"].percent)
            : 0;
        res["actualPercent"] = res["data"].percent;
        res["data"].percent = percentage;
        this.financialYear = res;
        // this.availValue = res["data"]?.percent;
        this.availValue = percentage;
        this.halfDoughnutChart();

        this.notFoundNames = res["data"]?.names;
        console.log("ordResponse", res);
      },
      (err: any) => {
        // this._loaderService.stopLoader();
        this.dataAvailLoading = false;
        console.log("error", err);
      }
    );
  }

  myChart: any;
  halfDoughnutChart() {
    console.log("halfDoughnutChart called");
    if (this.myChart) {
      this.myChart.destroy();
    }

    this.dataAvailable = this.availValue;

    const canvas = <HTMLCanvasElement>document.getElementById("myChart1");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // this.myChart = new Chart(ctx, {
      //   type: "doughnut",
      //   data: {
      //     labels: ["Data available", "Data not available"],
      //     datasets: [
      //       {
      //         label: "Availability",
      //         borderWidth: 0,
      //         data: [this.dataAvailable, 100 - this.dataAvailable],
      //         backgroundColor: ["rgba(51, 96, 219, 1)", "rgba(218, 226, 253, 1)"],
      //       },
      //     ],
      //   },
      //   options: {
      //     rotation: 1 * Math.PI,
      //     circumference: 1 * Math.PI,
      //     legend: {
      //       display: false,
      //     },
      //     cutoutPercentage: 75,
      //   },
      // });
    }
  }
}

const revenue = {
  type: 6,
  title: "revenue",
  subTitle: "revenue",
  svg: `../../../../assets/7340549_e-commerce_online_shopping_ui_receipt_icon.svg`,
  img: "",
  para: "",
  actionButtons: [
    {
      name: "btn1",
      function: "",
    },
    {
      name: "btn2",
      function: "",
    },
  ],
  number: 230,
  amount: "567 Cr",
  projectId: 123,
  text: "",
  id: 1,
};
const expenditure = {
  type: 2,
  title: "expenditure",
  subTitle: "expenditure",
  svg: `../../../../assets/7340549_e-commerce_online_shopping_ui_receipt_icon.svg`,
  img: "",
  para: "",
  actionButtons: [
    {
      name: "btn1",
      function: "",
    },
    {
      name: "btn2",
      function: "",
    },
  ],
  number: 230,
  amount: "567 Cr",
  projectId: 123,
  text: "",
  id: 1,
};
const assets = {
  type: 2,
  title: "assets",
  subTitle: "assets",
  svg: `../../../../assets/7340549_e-commerce_online_shopping_ui_receipt_icon.svg`,
  img: "",
  para: "",
  actionButtons: [
    {
      name: "btn1",
      function: "",
    },
    {
      name: "btn2",
      function: "",
    },
  ],
  number: 230,
  amount: "567 Cr",
  projectId: 123,
  text: "",
  id: 1,
};
const tax_revenue = {
  type: 2,
  title: "tax_revenue",
  subTitle: "tax_revenue",
  svg: `../../../../assets/7340549_e-commerce_online_shopping_ui_receipt_icon.svg`,
  img: "",
  para: "",
  actionButtons: [
    {
      name: "btn1",
      function: "",
    },
    {
      name: "btn2",
      function: "",
    },
  ],
  number: 230,
  amount: "567 Cr",
  projectId: 123,
  text: "",
  id: 1,
};
const liabilities = {
  type: 2,
  title: "liabilities",
  subTitle: "liabilities",
  svg: `../../../../assets/7340549_e-commerce_online_shopping_ui_receipt_icon.svg`,
  img: "",
  para: "",
  actionButtons: [
    {
      name: "btn1",
      function: "",
    },
    {
      name: "btn2",
      function: "",
    },
  ],
  number: 230,
  amount: "567 Cr",
  projectId: 123,
  text: "",
  id: 1,
};
const grants = {
  type: 2,
  title: "grant",
  subTitle: "grant",
  svg: `../../../../assets/7340549_e-commerce_online_shopping_ui_receipt_icon.svg`,
  img: "",
  para: "",
  actionButtons: [
    {
      name: "btn1",
      function: "",
    },
    {
      name: "btn2",
      function: "",
    },
  ],
  number: 230,
  amount: "567 Cr",
  projectId: 123,
  text: "",
  id: 1,
};

const cardStyle = {
  width: "auto",
  borderRadius: "0.7500em",
  height: "auto",
  "max-height": "8rem",
};
