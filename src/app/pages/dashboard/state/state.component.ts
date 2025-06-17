import { Component, HostListener, OnInit, SimpleChanges, OnChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DashboardService } from "../dashboard.service";
import { AuthService } from "../../../core/services/auth.service";
import { CommonService } from "../../../core/services/common.service";
import { FrontPanelComponent } from "../../../shared/components/front-panel/front-panel.component";
import { DashboardTabsComponent } from "../../../shared/components/dashboard-tabs/dashboard-tabs.component";
import { GlobalLoaderService } from "../../../core/services/loaders/global-loader.service";
@Component({
  selector: "app-state",
  imports: [FrontPanelComponent, DashboardTabsComponent],
  templateUrl: "./state.component.html",
  styleUrls: ["./state.component.scss"],
})
export class StateComponent implements OnInit, OnChanges {
  constructor(
    public newDashboardService: DashboardService,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    public _loaderService: GlobalLoaderService,
    private authService: AuthService,
    private _commonService: CommonService
  ) {
    this._activatedRoute.queryParams.subscribe((param: any) => {
      this.stateId = param.stateId;
      this.frontPanelData.stateId = this.stateId;
      for (const key in this.stateUlbData.data) {
        const element = this.stateUlbData.data[key];
        if (element._id == this.stateId) {
          this.stateCode = key;
          break;
        }
      }
      this.mapData.code.state = this.stateCode;
    });
  }
  frontPanelData = data;
  revenueData = [TaxRevenue, OwnRevenue, Grant, Revenue, Expense, BalanceSheetSize];
  stateId: any;
  stateCode: any;
  cords: any;

  @HostListener("window:scroll", ["$event"])
  doSomething(event: any) {
    this.cords = window.pageYOffset;
  }

  stateUlbData = JSON.parse(localStorage.getItem("ulbList") || '{}');
  mapData = mapConfig;
  dashboardTabData: any;
  date: any;
  percentValue: any;
  moneyYear: any;

  ngOnChanges(changes: SimpleChanges): void {
    console.log("windowScroll===>", window.pageYOffset);
  }
  ngOnInit(): void {
    this._loaderService.showLoader();
    //statedashboard id
    this.newDashboardService
      .getDashboardTabData("619cc1016abe7f5b80e45c6b")
      .subscribe(
        (res: any) => {
          console.log(res, "dashboardTabData");
          this.dashboardTabData = res["data"];
        },
        (error) => {
          console.log(error);
        }
      );
    this.authService.getLastUpdated().subscribe((res: any) => {
      console.log("rress", res);
      this.frontPanelData.date = res["data"];
      data.date = res["data"];
      data.year = res["year"];
      this.moneyYear = res["year"];
      // data.date = this.date;
      this._commonService.lastUpdatedYear.next(this.moneyYear);
      this.dashBoardData(this.stateId, this.moneyYear);
    });
    this._commonService.getSelectedYear.subscribe(res => {
      if (res) {
        this.dashBoardData(this.stateId, res);
      }
    })
  }
  yearVal: any;
  setYear(year: any) {
    this.yearVal = year;
    console.log("this.yearVal", year);
  }

  dashBoardData(stateId: any, year: any) {
    //bringing people info in front panel
    this.newDashboardService
      .dashboardInformation(true, stateId, "state", year)
      .subscribe(
        (res: any) => {
          this.frontPanelData.dataIndicators.map((item) => {
            switch (item.key) {
              case "population":
                item.value =
                  this._commonService.formatNumber(
                    Math.round(res.data[0].population / 1000000)
                  ) + " Million";
                if (item.value == "0 Million")
                  item.value =
                    this._commonService.formatNumber(
                      Math.round(res.data[0].population / 1000)
                    ) + " Thousand";
                break;
              case "density":
                item.value =
                  this._commonService.formatNumber(res.data[0].density || '0') +
                  "/ Sq km";
                break;
              case "area":
                item.value =
                  ((res.data[0].area).toFixed(0) || '0') + " Sq km";
                break;
              case "Municipal_Corporation":
                item.value = res.data[0].Municipal_Corporation || '0';
                break;
              case "Municipal_Council":
                item.value = res.data[0].Municipal_Council || '0';
                break;
              case "uas":
                item.value = res.data[0].uas || '0';
                break;
              case "Town_Panchayat":
                item.value = res.data[0].Town_Panchayat || '0';
                break;
              case "ulbs":
                item.value = res.data[0].ulbs || '0';
                break;
            }
            return item;
          });
          this.frontPanelData.name = res.data[0]._id.name + " Dashboard";
          this.frontPanelData.stateId = this.stateId;
          this.frontPanelData["year"] = year;
        },
        (error) => {
          console.error(error);
        }
      );
    //bringing cards data on front panel
    this.newDashboardService
      .dashboardInformation(false, stateId, "state", year)
      .subscribe(
        (res: any) => {
          res.data = res.data.filter((result: any) => { return result != null })
          const obj: any = { TaxRevenue, OwnRevenue, Grant, Expense, BalanceSheetSize, Revenue };
          for (const key in obj) {
            const element = obj[key];

            element.number =
              "INR " +
              (res.data.length > 0 && res.data.find((value: any) => value && value._id == key)?.amount
                ? Math.round(
                  res.data.find((value: any) => value && value._id == key)?.amount /
                  10000000
                )
                : "0") +
              " Cr";
          }
          this.revenueData = [
            obj.TaxRevenue,
            obj.OwnRevenue,
            obj.Grant,
            obj.Revenue,
            obj.Expense,
            obj.BalanceSheetSize,

          ];
        },
        (error) => {
          console.error(error);
        }
      );
  }
  setAvail(data: any) {
    console.log("success====>", data);
    this.percentValue = data?.data?.percent;
  }
  changeInDropDown(event: any) {
    console.log(
      "StateChangeInDropDown(",
      event,
      "stateUlbData",
      this.stateUlbData
    );
    if (event.fromState) {
      this.stateCode = event.value.ST_CODE;
      this.stateId = this.stateUlbData.data[this.stateCode]._id;
      this.mapData.code.state = this.stateCode;
      this.dashBoardData(this.stateId, this.moneyYear);
    } else if (this.stateCode) {
      const cityId = this.stateUlbData.data[this.stateCode].ulbs.find(
        (value: any) => value.code === event.value.key
      )._id;
      this.router.navigateByUrl(
        `dashboard/city?cityId=${cityId}&stateCode=${this.stateCode}`
      );
    }
  }
}

const data = {
  showMap: true,
  name: "",
  year: "",
  stateId: "",
  date: "",
  desc: "Summary of key state demographics and municipal (urban) indicators",
  link: "dashboard/national/61e150439ed0e8575c881028",
  linkName: "National Dashboard",
  dataIndicators: [
    {
      value: "0 M",
      title: "Population",
      key: "population",
      super: false,
    },
    { value: "0 Sq km", title: "Urban Area", key: "area", super: false },
    {
      value: "0/ Sq km",
      title: "Urban Population Density",
      key: "density",
      super: false,
    },
    {
      value: "0",
      title: "Urban Local Bodies(ULBs)",
      key: "ulbs",
      super: false,
    },
    {
      value: "0",
      title: "ULBs part of Urban Agglomorations",
      key: "uas",
      super: false,
    },
    {
      value: "0",
      title: "Municipal Corporations",
      key: "Municipal_Corporation",
      super: false,
    },
    {
      value: "0",
      title: "Municipality",
      key: "Municipal_Council",
      super: true,
    },

    {
      value: "0",
      title: "Town Panchayat",
      key: "Town_Panchayat",
      super: true,
    },
  ],
  footer: `Data shown is from audited/provisional financial statements for FY 20-21
  and data was last updated on 21st August 2021`,
  disclaimer:
    "*To enable standardization of nomenclature across states, we have reclassified all ULBs into one of the three categories - Municipal Corporation, Municipality or Town Panchayat",
};
const TaxRevenue = {
  type: 2,
  subTitle: "Total Tax Revenue",
  svg: `../../../../assets/file.svg`,
  number: "0 Cr",
};

const OwnRevenue = {
  type: 2,
  subTitle: "Total Own Revenue",
  svg: `../../../../assets/file.svg`,
  number: "0 Cr",
};

const Grant = {
  type: 2,
  subTitle: "Total Grant",
  svg: `../../../../assets/coinCuren.svg`,
  number: "0 Cr",
};

const Revenue = {
  type: 2,
  subTitle: "Total Revenue",
  svg: `../../../../assets/coinCuren.svg`,
  number: "0 Cr",
};

const Expense = {
  type: 2,
  subTitle: "Total Expenditure",
  svg: `../../../../assets/coinCuren.svg`,
  number: "0 Cr",
};
const BalanceSheetSize = {
  type: 2,
  subTitle: "Total Balance Sheet Size",
  svg: `../../../../assets/Group 15967.svg`,
  number: "0 Cr",
};

const mapConfig = {
  code: {
    state: "GJ",
    city: "GJ039",
  },
  showStateList: true,
  showDistrictList: true,
  stateMapContainerHeight: "23rem",
  nationalZoomOnMobile: 3.9, // will fit map in container
  nationalZoomOnWeb: 3.9, // will fit map in container
  stateZoomOnMobile: 4, // will fit map in container
  stateZoomOnWeb: 4, // will fit map in container
  stateBlockHeight: "23.5rem", // will fit map in container
};
