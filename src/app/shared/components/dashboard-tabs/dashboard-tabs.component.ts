import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from "@angular/core";
// import { MunicipalityBondsComponent } from "../municipality-bonds/municipality-bonds.component";
// import { AccordionToTableComponent } from "./accordion-to-table/accordion-to-table.component";
// import { NewCreditRatingComponent } from "./new-credit-rating/new-credit-rating.component";
// import { NewCityCreditRatingComponent } from "./new-city-credit-rating/new-city-credit-rating.component";
// import { StateFilterDataComponent } from "../state-filter-data/state-filter-data.component";
// import { SlbChartsComponent } from "../slb-charts/slb-charts.component";
import { FilterDataComponent } from "../filter-data/filter-data.component";


@Component({
  selector: "app-dashboard-tabs",
  imports: [CommonModule,
    // ButtonsModule,
    // MunicipalityBondsComponent,
    //  AccordionToTableComponent,
    // NewCreditRatingComponent, 
    // NewCityCreditRatingComponent,
    // StateFilterDataComponent, 
    // SlbChartsComponent,
    FilterDataComponent
  ],
  templateUrl: "./dashboard-tabs.component.html",
  styleUrls: ["./dashboard-tabs.component.scss"],
})
export class DashboardTabsComponent implements OnChanges {
  constructor() { }

  selectedValue: string = '';

  onValueSelected(value: string) {
    this.selectedValue = value;
  }

  currentStateId: any;
  tableView = true;
  TableTitles: any;
  stateName: any;

  @Input()
  yearListForDropDown: any;
  @Input()
  mySelectedYears!: any;
  @Input()
  cityId: any;
  @Input()
  DashBoardType: any;

  @Input()
  scrollCords!: number;
  @Input()
  percentValue: any;

  @Input()
  stateId!: string | number;

  @Input()
  data = [
    {
      name: "Financial Indicators",
      subHeaders: [
        {
          mainContent: [
            {
              static: {
                indicators: [
                  {
                    desc: [
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "Expenditure mix refers to the combination of establishment, administrative, interest & finance expenses, etc., all of which constitute the total expenditure of the ULB",
                      },
                    ],
                    name: "About this indicator",
                  },
                  {
                    desc: [
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "Establishment expense",
                      },
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "Administrative Expense",
                      },
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "Operational & Maint. Expense",
                      },
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "Interest & Finance Expense",
                      },
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "Revenue Grants",
                      },
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "Other Expenses",
                      },
                    ],
                    name: "Calculation",
                  },
                  {
                    desc: [
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "",
                      },
                    ],
                    name: "How is performance assessed?",
                  },
                  {
                    desc: [
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "",
                      },
                    ],
                    name: "Analysis",
                  },
                  {
                    desc: [
                      {
                        links: [
                          {
                            label: "",
                            url: "",
                          },
                        ],
                        text: "",
                      },
                    ],
                    name: "Next Steps",
                  },
                ],
              },
              btnLabels: [],
              about:
                "Expenditure mix refers to the combination of establishment, administrative, interest & finance expenses, etc., all of which constitute the total expenditure of the ULB",
              aggregateInfo:
                "Total revenue: 2000 Cr CAGR trend of 8% for last 3 years",
            },
          ],
          name: "Revenue Expenditure Mix",
        },
      ],
    },
  ];
  cityName = '';
  stateServiceLabel: boolean = false;

  activeHeader = "";
  activeFilter: any = [];
  innerActiveTab: any = "";
  sticky = false;
  tabDesc = ''
  // stateMap = json.parse(localStorage.getItem(stateIdsMap))
  // stateMap = JSON.parse(localStorage.getItem("stateIdsMap") || "{}");
  stateMap: any = {};
  @Input() isUA: string = 'No';
  @Input() noDataFound: boolean = false;
  changeTab(event: { name?: string; subHeaders?: { mainContent: { static: { indicators: { desc: { links: { label: string; url: string; }[]; text: string; }[]; name: string; }[]; }; btnLabels: never[]; about: string; aggregateInfo: string; }[]; name: string; }[]; target?: any; }, fromInner = false) {
    console.log('changeTab', event, fromInner)
    const value = event?.target?.value ? JSON.parse(event.target.value) : event;
    console.log("value ==>", value);
    this.cityName = value?.ulbName
    if (fromInner) this.innerActiveTab = value;
    else {
      this.activeHeader = value.name;
      this.activeFilter = value.subHeaders;
      this.innerActiveTab = value.subHeaders[0];
    }
  }

  onChangeTab({ tabName, subTabName }: { tabName: string; subTabName: string }) { // changing tab and subtab -- dirty fix due to no routing setup
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
      tabElement.click();
    }
    setTimeout(() => {
      const subTabElement = document.getElementById(subTabName);
      if (subTabElement) {
        subTabElement.click();
      }
    }, 1000);
  }

  getStickyValue() {
    if (this.stateId) {
      if (this.scrollCords > 1100) {
        this.sticky = true;
      } else {
        this.sticky = false;
      }
    }
    if (this.cityId) {
      if (this.scrollCords > 870) {
        this.sticky = true;
      } else {
        this.sticky = false;
      }
    }
  }

  getStateName() {
    // console.log('getStateName', this.stateId)
    this.stateName = this.stateMap[this.stateId];
    return this.stateName;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("DashBoardTabs OnChanges", changes, 'DashBoardType', this.DashBoardType)
    if (changes["stateId"]) {
      this.stateId = changes["stateId"]?.currentValue;
      this.getStateName();
    }
    if (changes["mySelectedYears"] && changes["mySelectedYears"].currentValue) {
      this.mySelectedYears = convertToPastYears(
        changes["mySelectedYears"]?.currentValue
      );
    }
    if (changes["data"]) {
      this.changeTab(this.data[0]);
    }
    if (changes['scrollCords']) {
      this.getStickyValue();
    }
    //  console.log('tab data....', this.data)
    const mouTabObj: any = this.data.filter(o => o.name == "Infrastructure Projects");
    this.tabDesc = mouTabObj[0]?.description
    //   console.log('this.tabDesc', this.tabDesc);

    // console.log("stickyValue==>", this.sticky);
  }

}
function convertToPastYears(year: any) {
  const newYears = [year];
  let numYear = 2,
    newValue = year;
  while (numYear--) {
    newValue = newValue
      .split("-")
      .map((value: number) =>
        !isNaN(Number(value)) ? (Number(value) - 1) : value
      )
      .join("-");
    newYears.push(newValue);
  }
  return newYears;
}


// var startProductBarPos=-1;
// window.onscroll=function(){
//   var bar = document.getElementById('nav');
//   if(startProductBarPos<0)startProductBarPos=findPosY(bar);

//   if(pageYOffset>startProductBarPos){
//     bar.style.position='fixed';
//     bar.style.top='0';
//     bar.style.left='0';
//     bar.style.backgroundColor='#fff';
//   }else{
//     bar.style.position='relative';
//   }

// };

// function findPosY(obj) {
//   var curtop = 0;
//   if (typeof (obj.offsetParent) != 'undefined' && obj.offsetParent) {
//     while (obj.offsetParent) {
//       curtop += obj.offsetTop;
//       obj = obj.offsetParent;
//     }
//     curtop += obj.offsetTop;
//   }
//   else if (obj.y)
//     curtop += obj.y;
//   return curtop;
// }
