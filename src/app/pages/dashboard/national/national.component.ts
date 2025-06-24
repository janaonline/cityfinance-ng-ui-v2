import { Component, HostListener, OnInit, SimpleChanges, OnChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NationalMapSectionService } from "./national-map-section/national-map-section.service";
import { DashboardService } from "../dashboard.service";
import { CommonService } from "../../../core/services/common.service";
import { AssetsService } from "../../../core/services/assets/assets.service";
import { AuthService } from "../../../core/services/auth.service";
import { ICreditRatingData } from "../../../core/models/creditRating/creditRatingResponse";
import { FrontPanelComponent } from "../../../shared/components/front-panel/front-panel.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-national",
  imports: [CommonModule, FrontPanelComponent],
  templateUrl: "./national.component.html",
  styleUrls: ["./national.component.scss"],
})
export class NationalComponent implements OnInit, OnChanges {
  constructor(
    protected router: Router,
    public newDashboardService: DashboardService,
    private _activatedRoute: ActivatedRoute,
    private nationalMapService: NationalMapSectionService,
    private _commonService: CommonService,
    private assetService: AssetsService,
    private authService: AuthService
  ) {
    this._activatedRoute.queryParams.subscribe((param: any) => {
      console.log("nationalParam", param);
      this.tabIndex = param.tabIndex ? param.tabIndex : 0;
    });
    this.loadData();
    this.fetchCreditRatingTotalCount();

    this.fetchMinMaxFinancialYears();

    this.fetchBondIssueAmout("");
  }
  frontPanelData = data;
  revenueData = [TaxRevenue, OwnRevenue, Grant, Revenue, Expense, BalanceSheetSize];
  tabAboutData: any;
  tabId: any = "61e150439ed0e8575c881028";
  component_name: any;
  tabIndex: any;
  selectedFilterTab: any;

  nationalDataAvailability: number = 0;
  stateId: any;
  yearValue: any = "2021-22";
  type: string = "national";
  cardInput = {
    ifPeople: false,
    state: "",
    type: "national",
    year: this.yearValue,
  };

  // creditRating: { [stateName: string]: number; total?: number } = {};
  creditRating: any = {};

  creditRatingList!: any[];
  absCreditInfo: any = {
    title: "",
    ulbs: 0,
    creditRatingUlbs: 0,
    ratings: {
      "AAA+": 0,
      AAA: 0,
      "AAA-": 0,
      "AA+": 0,
      AA: 0,
      "AA-": 0,
      "A+": 0,
      A: 0,
      "A-": 0,
      "BBB+": 0,
      BBB: 0,
      "BBB-": 0,
      BB: 0,
      "BB+": 0,
      "BB-": 0,
      "B+": 0,
      B: 0,
      "B-": 0,
      "C+": 0,
      C: 0,
      "C-": 0,
      "D+": 0,
      D: 0,
      "D-": 0,
    },
  };

  // Including A
  creditRatingAboveA: any;

  // Including BBB-
  creditRatingAboveBBB_Minus: any;

  cords: any;
  checkStickyValue: boolean = false;
  financialYearTexts!: {
    min: string;
    max: string;
  };

  isBondIssueAmountInProgress = false;

  bondIssueAmount: number = 0;

  @HostListener("window:scroll", ["$event"])
  doSomething(event: any) {
    this.cords = window.pageYOffset;
    if (window.pageYOffset >= 750) {
      this.checkStickyValue = true;
    } else {
      this.checkStickyValue = false;
    }
  }


  ngOnInit(): void {
    this.dashboardLastUpdatedYear();
    this.getIndicatorData(this.stateId);
    //this.getCardsData();
    this.component_name = "National";
    const availData: any = sessionStorage.getItem("dataAvail");

    this.nationalDataAvailability = availData;
    this.nationalMapService.currentSubTab.subscribe((res) => {
      this.selectedFilterTab = res?.HeadTab;
    });
    if (this.tabIndex == 0) {
      this.nationalMapService.dataAvailabilityVal.subscribe((res) => {
        console.log("newRes", res);
        this.nationalDataAvailability = Math.round(res?.data);
      });
    }
    // this.nationalMapService.currentSelectedStateId.subscribe((res) => {
    //   console.log("emmited state id", res);
    //   this.stateId = res?.data;
    //   this.getIndicatorData(this.stateId);
    // });
    this.nationalMapService.selectedYear.subscribe((res) => {
      this.yearValue = res?.data;
      this.getCardsData();
    });

    // this.router.navigate([
    //   // `dashboard/national/${this.tabId}?tabIndex=${this.tabIndex}`,
    //   `dashboard/national/61e150439ed0e8575c881028`,
    // ]);
  }

  getCardsData() {
    if (this.yearValue != '') {
      this.newDashboardService
        .dashboardInformation(false, "", "national", this.yearValue)
        .subscribe((res: any) => {
          const obj: any = { TaxRevenue, OwnRevenue, Grant, Expense, BalanceSheetSize, Revenue };
          const data = res.data;
          for (const key in obj) {
            const element = obj[key];

            const computedNumber = Math.round(
              data.find((value: any) => value._id == key)?.amount / 10000000
            );
            element.number =
              "INR " +
              (data.length > 0
                ? this._commonService.formatNumber(computedNumber)
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
        });
    }
  }

  private fetchMinMaxFinancialYears() {
    this._commonService.getFinancialYearBasedOnData().subscribe((res: any) => {
      this.financialYearTexts = {
        min: res.data[0],
        max: res.data[res.data.length - 1].slice(2),
      };
      console.log("financialYearTexts", this.financialYearTexts);

      this.frontPanelData.dataIndicators.map((elem) => {
        if (elem?.key == "financialStatements") {
          elem.title = "Financial Statements ";
          elem.title =
            elem.title +
            "( " +
            this.financialYearTexts.min +
            " to " +
            this.financialYearTexts.max +
            " )";
        }
      });

      // console.log(this.financialYearTexts);
    });
  }

  private fetchBondIssueAmout(stateId?: string) {
    this.isBondIssueAmountInProgress = true;
    this._commonService.getBondIssuerItemAmount(stateId).subscribe((res: any) => {
      try {
        this.bondIssueAmount = Math.round(res["data"][0]["totalAmount"]);
      } catch (error) {
        this.bondIssueAmount = 0;
      }

      this.isBondIssueAmountInProgress = false;
      this.frontPanelData.dataIndicators.map((elem) => {
        if (elem?.key == "totalMunicipalBonds") {
          elem.title = `Municipal Bond Issuances Of Rs. ${this.bondIssueAmount || 0
            }  Cr With Details`;
        }
      });
    });
  }

  getIndicatorData(state: any) {
    this._commonService.fetchDataForHomepageMap(state).subscribe((res: any) => {
      this.frontPanelData.dataIndicators.map((elem) => {
        switch (elem.key) {
          case "coveredUlbCount":
            elem.value = this._commonService.formatNumber(res?.coveredUlbCount);
            break;
          case "financialStatements":
            elem.value = this._commonService.formatNumber(
              res?.financialStatements
            );
            break;
          case "totalMunicipalBonds":
            elem.value = this._commonService.formatNumber(
              res?.totalMunicipalBonds
            );
            break;
        }
        return elem;
      });
      // this.frontPanelData.dataIndicators.push(res?.data);
    });
  }

  showCreditInfoByState() {
    const ulbList = [];

    for (let i = 0; i < this.creditRatingList?.length; i++) {
      const ulb = this.creditRatingList[i];
      ulbList.push(ulb["ulb"]);
      const rating = ulb.creditrating.trim();
      this.calculateRatings(this.absCreditInfo, rating);
    }

    this.creditRatingAboveA =
      this.absCreditInfo["ratings"]["A"] +
      this.absCreditInfo["ratings"]["A+"] +
      this.absCreditInfo["ratings"]["AA"] +
      this.absCreditInfo["ratings"]["AA+"] +
      this.absCreditInfo["ratings"]["AA-"] +
      this.absCreditInfo["ratings"]["AAA"] +
      this.absCreditInfo["ratings"]["AAA+"] +
      this.absCreditInfo["ratings"]["AAA-"];

    this.creditRatingAboveBBB_Minus =
      this.creditRatingAboveA +
      this.absCreditInfo["ratings"]["A-"] +
      this.absCreditInfo["ratings"]["BBB"] +
      this.absCreditInfo["ratings"]["BBB+"] +
      this.absCreditInfo["ratings"]["BBB-"];

    this.absCreditInfo["title"] = "India";
    this.absCreditInfo["ulbs"] = ulbList;

    this.frontPanelData.dataIndicators.map((elem) => {
      if (elem.key == "ulbsWithA") {
        elem.value = this.creditRatingAboveA;
      } else if (elem.key == "UlbsWithBBB") {
        elem.value = this.creditRatingAboveBBB_Minus;
      }
    });
  }
  calculateRatings(dataObject: any, ratingValue: any) {
    if (!dataObject["ratings"][ratingValue]) {
      dataObject["ratings"][ratingValue] = 0;
    }
    dataObject["ratings"][ratingValue] = dataObject["ratings"][ratingValue] + 1;
    dataObject["creditRatingUlbs"] = dataObject["creditRatingUlbs"] + 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("nationalChanges", changes);
  }

  loadData() {
    this.newDashboardService
      .getDashboardTabData("619cc10e6abe7f5b80e45c6d")
      .subscribe(
        (res: any) => {
          console.log("newResponse", res);
          const tab = res.data;

          this.tabAboutData = tab.sort((x: any, y: any) => {
            return x.position - y.position;
            // return x.position - y.position;
          });
          // setTimeout(() => {
          // this.sortTabData(tab);
          // }, 200);
        },
        (error: any) => {
          console.log(error);
        }
      );

    const id = "5dd24729437ba31f7eb42eac";
    // this.newDashboardService
    //   .dashboardInformation(true, id, "ulb", "")
    //   .subscribe(
    //     (res: any) => { },
    //     (error:any) => {
    //       console.error(error);
    //     }
    //   );
    // this.newDashboardService
    //   .dashboardInformation(false, id, "ulb", "")
    //   .subscribe(
    //     (res: any) => { },
    //     (error: any) => {
    //       console.error(error);
    //     }
    //   );
  }
  sortTabData(res: any) {
    this.tabAboutData = res.sort(function (x: any, y: any) {
      return x.position - y.position;
    });
  }

  dashboardLastUpdatedYear() {
    this.authService.getLastUpdated().subscribe((res: any) => {
      Object.assign(this.frontPanelData, {
        year: res["year"],
        date: res["data"],
      });
    });
  }

  private fetchCreditRatingTotalCount() {
    this.assetService
      .fetchCreditRatingReport()
      .subscribe((res: any) => this.computeStatesTotalRatings(res));
  }
  private computeStatesTotalRatings(res: ICreditRatingData[]) {
    this.creditRatingList = res;

    const computedData: any = { total: 0, India: 0 };
    res.forEach((data: any) => {
      if (computedData[data.state] || computedData[data.state] === 0) {
        computedData[data.state] += 1;
      } else {
        computedData[data.state] = 1;
      }
      computedData.total += 1;
      computedData["India"] += 1;
    });

    this.creditRating = computedData;
    this.frontPanelData.dataIndicators.map((elem) => {
      if (elem.key == "ULBCreditRating") {
        elem.value = computedData?.total.toString();
      }
    });
    this.showCreditInfoByState();
  }
}

const data = {
  showMap: false,
  name: "National Performance",
  desc: "Summary of key national-level demographics and municipal (urban) indicators",
  dataIndicators: [
    {
      value: "",
      title: "ULBs With Financial Data",
      key: "coveredUlbCount",
    },
    {
      value: "",
      title: "Financial Statements ",
      // key: "Municipal_Corporation",
      key: "financialStatements",
    },
    {
      value: "",
      title: "ULBs Credit Rating Reports",
      key: "ULBCreditRating",
    },
    {
      value: "",
      title: "ULBs With Investment Grade Rating",
      key: "UlbsWithBBB",
    },
    {
      value: " ",
      title: "ULBs With Rating A & Above",
      key: "ulbsWithA",
    },
    {
      value: "",
      title: "",
      key: "totalMunicipalBonds",
    },
  ],
  footer: `Data shown is from audited/provisional financial statements for FY 20-21
  and data was last updated on 21st August 2021`,
};

// const RevenueObject = [{
//   Revenue :{
//     type: 2,
//     subTitle: "Total Revenue",
//     svg: `../../../../assets/file.svg`,
//     number: "567 Cr",
//   },
//   Expense :
// }]
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