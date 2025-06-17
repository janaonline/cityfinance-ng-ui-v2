import { Component, HostListener, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DashboardService } from "../dashboard.service";
import { AuthService } from "../../../core/services/auth.service";
import { CommonService } from "../../../core/services/common.service";
import { GlobalLoaderService } from "../../../core/services/loaders/global-loader.service";
import { FrontPanelComponent } from "../../../shared/components/front-panel/front-panel.component";
import { DashboardTabsComponent } from "../../../shared/components/dashboard-tabs/dashboard-tabs.component";
import {Title ,Meta} from '@angular/platform-browser';
// import { CommonService } from "src/app/shared/services/common.service";
// import { GlobalLoaderService } from "src/app/shared/services/loaders/global-loader.service";
// import { AuthService } from "../../../auth/auth.service";
// import { dashboardService } from "../new-dashboard.service";

@Component({
  selector: 'app-city',
  imports: [FrontPanelComponent, DashboardTabsComponent],
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss'
})
export class CityComponent implements OnInit {
  constructor(
    private titleService : Title,
    private metaService : Meta,
    public dashboardService: DashboardService,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    // private cityService: CityService,
    private authService: AuthService,
    private _commonService: CommonService,
    public _loaderService: GlobalLoaderService,
  ) {
    this.cityId = this._activatedRoute.snapshot.params['cityId'];
    this._activatedRoute.queryParams.subscribe((param: any) => {
      // this.cityId = param.cityId;
      this.stateCode = param.stateCode || this.ulbStateCodeMapping[this.cityId];
      this.mapData.code.city = this.ulbCodeMapping[this.cityId];
      this.mapData.code.state = this.ulbStateCodeMapping[this.cityId];
    });
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }
  ulbStateCodeMapping = JSON.parse(localStorage.getItem("ulbStateCodeMapping") || '{}');
  ulbCodeMapping = JSON.parse(localStorage.getItem("ulbCodeMapping") || '{}');
  cityId!: string | number;
  stateCode!: string | number;
  frontPanelData = data;
  revenueData = [TaxRevenue, OwnRevenue, Grant, Revenue, Expense, BalanceSheetSize];
  mapData = mapConfig;
  stateUlbData = JSON.parse(localStorage.getItem("ulbList") || 'null');
  dashboardTabData!: any[];
  currentYear = new Date().getFullYear().toString();
  yearListForDropDown: any;

  cords: any;
  ulbDenotifiedMessage: string = '';
  @HostListener("window:scroll", ["$event"])
  doSomething(event: any) {
    this.cords = window.pageYOffset;
  }
  isUA: any;
  noDataFound: boolean = false;
  ngOnInit(): void {
    // Set meta tags tailored for the City Dashboard
    this.titleService.setTitle('City Dashboard | City Finance');

    this.metaService.updateTag({
      name: 'description',
      content: 'Explore detailed financial data, statistics, and insights for your city on the City Finance dashboard.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'City Finance, city dashboard, municipal finance, city statistics, urban finance, city data, city insights'
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow'
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: 'City Dashboard | City Finance'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Access comprehensive financial information and analytics for your city at City Finance.'
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://cityfinance.in/dashboard/city'
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });

    //this.dashboardDataCall();
    this.dashboardCalls(this.cityId);
    // setTimeout(() => {
    //   this.dashboardTabData.forEach((el) => {
    //     el.ulbName = this.frontPanelData?.name;
    //   });
    // }, 500);
  }
  setNameInFr() {
    this.dashboardTabData.forEach((el: { ulbName: string; }) => {
      el.ulbName = this.frontPanelData?.name;
    });
  }
  dashboardDataCall() {
    this.dashboardService
      .getDashboardTabData("619cc08a6abe7f5b80e45c67")
      .subscribe(
        (res: { [x: string]: any; }) => {
          console.log(res, "dashboardTabData");
          this.dashboardTabData = res["data"];
          // if(this.isUA == "No" || this.isUA == null || this.isUA == undefined){
          //   this.dashboardTabData = this.dashboardTabData.filter(o => o.name != "Infrastructure Projects")
          // }
          this.setNameInFr();
        },
        (error: any) => {
          console.log(error);
        }
      );
    this.authService
      .getLastUpdated({ ulb: this.cityId ?? "" })
      .subscribe((res: { [x: string]: any; }) => {
        Object.assign(this.frontPanelData, {
          year: res["year"],
          date: res["data"],
        });
      });
  }

  dashboardCalls(cityId: any) {
    this.dashboardService.getLatestDataYear(cityId).subscribe(
      (res: any) => {

        this.currentYear = res["data"].financialYear;
        this.callMoneyApi(cityId);
        let tempData: any = this.frontPanelData.footer.split(" ");
        tempData = tempData.map((value: string) => {
          if (value == "finacialYear")
            value = "FY " + res["data"].financialYear;
          if (value == "date")
            value = new Date(res["data"].modifiedAt).toLocaleDateString();
          return value;
        });
        tempData = tempData.join(" ");
        this.frontPanelData.footer = tempData;
        this.noDataFound = false;
      },
      (error: any) => {
        this.noDataFound = true;
        console.log(error);

      }
    );
    this.dashboardService.getYearList(this.cityId).subscribe(
      (res: { [x: string]: any; }) => {
        this.yearListForDropDown = res["data"];
      },
      (error: any) => {
        console.log(error);
      }
    );
    this.dashboardService
      .dashboardInformation(true, cityId, "ulb", this.currentYear)
      .subscribe(
        (res: any) => {
          this.isUA = res["data"]["isUA"];
          this.ulbDenotifiedMessage = res?.message;
          this.dashboardDataCall();
          this.frontPanelData.dataIndicators.map((item) => {
            switch (item.key) {
              case "population":
                // let computedNumber = this._commonService.formatNumber(
                //   res?.data?.population / 1000000
                // );
                item.value =
                  this._commonService.formatNumber(
                    Math.round(res.data.population / 1000000) || 0
                  ) + " Million";
                if (item.value == "0 Million")
                  item.value =
                    this._commonService.formatNumber(
                      Math.round(res.data.population / 1000) || 0
                    ) + " Thousand";
                break;
              case "density":
                item.value =
                  this._commonService.formatNumber(res.data.density || '0') +
                  "/ Sq km";
                break;
              case "ward":
                item.value = res.data.wards || '0';
                if (item.value == '0') {
                  item.value = '0'
                  console.log(item.value)
                }
                break;
              case "area":
                item.value =
                  this._commonService.formatNumber(res.data.area || '0') + " Sq km";
                break;
              case "amrut":
                item.value = res.data.amrut || '0';
                break;
              case "isUa":
                item.value = res.data.isUA;
                if (res?.data?.isUA == "Yes") {
                  item.value += ` (${res?.data?.UA?.name || '0'})`;
                }
                break;
              case "dataAvailable":
                item.value = res.data.dataAvailable || '0';
                break;
            }
            return item;
          });
          this.frontPanelData.name = res.data.name;
          this.frontPanelData.desc = createDesc(
            res.data?.ulbType?.name || "Municipal Corp",
            getPopulationType(res.data.population)
          );
          this.frontPanelData.linkName = `${res.data.state.name} Dashboard`;
          this.frontPanelData.link = `dashboard/state?stateId=${res.data.state._id}`;
        },
        (error: any) => {
          console.error(error);
        }
      );
  }

  callMoneyApi(cityId: any) {
    this.dashboardService
      .dashboardInformation(false, cityId, "ulb", this.currentYear)
      .subscribe(
        (res: any) => {
          const obj: any = { TaxRevenue, OwnRevenue, Grant, Expense, BalanceSheetSize, Revenue };
          for (const key in obj) {
            const element = obj[key];

            element.number =
              "INR " +
              (res.data.length > 0
                ? Math.round(
                  res.data.find((value: { _id: string; }) => value._id == key)?.amount /
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
        (error: any) => {
          console.error(error);
        }
      );
  }

  changeInDropDown(event: any) {
    if (!event.fromState) {
      this.cityId = this.stateUlbData.data[this.stateCode].ulbs.find(
        (value: any) => value.code === event.value.key
      )._id;
      this.dashboardDataCall();
      this.dashboardCalls(this.cityId);
    }
  }
}

const data = {
  showMap: true,
  name: "Municipal Corporation of Greater Mumbai",
  desc: "This urban local body has been classified as a municipal corporation in the 4M+ population category",
  link: "",
  linkName: "Maharashtra Dashboard",
  dataIndicators: [
    {
      value: "12. 1 M",
      title: "Population",
      key: "population",
    },
    { value: "4335 Sq km", title: "Area", key: "area" },
    { value: "2857/ Sq km", title: "Population Density", key: "density" },
    {
      value: "227",
      title: "Wards",
      key: "ward",
    },
    {
      value: "227",
      title: "Years of financial data",
      key: "dataAvailable",
    },
    // {
    //   value: "227",
    //   title: "AMRUT City",
    //   key: "amrut",
    // },
    {
      value: "227",
      title: "Part of UA",
      key: "isUa",
    },
  ],
  footer: `Data shown is from audited/provisional financial statements for finacialYear and data was last updated on date`,
};

const TaxRevenue = {
  type: 2,
  subTitle: "Total Tax Revenue",
  svg: `./assets/file.svg`,
  number: "0 Cr",
};

const OwnRevenue = {
  type: 2,
  subTitle: "Total Own Revenue",
  svg: `./assets/file.svg`,
  number: "0 Cr",
};

const Grant = {
  type: 2,
  subTitle: "Total Grant",
  svg: `./assets/coinCuren.svg`,
  number: "0 Cr",
};

const Revenue = {
  type: 2,
  subTitle: "Total Revenue",
  svg: `./assets/coinCuren.svg`,
  number: "0 Cr",
};

const Expense = {
  type: 2,
  subTitle: "Total Expenditure",
  svg: `./assets/coinCuren.svg`,
  number: "0 Cr",
};
const BalanceSheetSize = {
  type: 2,
  subTitle: "Total Balance Sheet Size",
  svg: `./assets/Group 15967.svg`,
  number: "0 Cr",
};

function createDesc(type: string, population = "4M+") {
  return `This urban local body has been classified as a ${type} in the ${population} population category`;
}

function getPopulationType(population: any) {
  if (population < 100000) {
    return "<100 Thousand";
  } else if (100000 < population && population < 500000) {
    return "100 Thousand - 500 Thousand";
  } else if (500000 < population && population < 1000000) {
    return "500 Thousand - 1 Million";
  } else if (1000000 < population && population < 4000000) {
    return "1 Million - 4 Million";
  } else {
    return "4 Million+";
  }
}

const mapConfig = {
  code: {
    state: "GJ",
    city: "GJ039",
  },
  showStateList: false,
  showDistrictList: true,
  stateMapContainerHeight: "23rem",
  nationalZoomOnMobile: 3.9, // will fit map in container
  nationalZoomOnWeb: 3.9, // will fit map in container
  stateZoomOnMobile: 4, // will fit map in container
  stateZoomOnWeb: 4, // will fit map in container
  stateBlockHeight: "23.5rem", // will fit map in container
};
