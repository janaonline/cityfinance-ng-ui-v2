import { Component, OnDestroy, OnInit, DoCheck } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CommonService } from "../../../core/services/common.service";
import { GlobalLoaderService } from "../../../core/services/loaders/global-loader.service";
import { ResourcesDashboardService } from "./resources-dashboard.service";

@Component({
  selector: "app-resources-dashboard",
  templateUrl: "./resources-dashboard.component.html",
  styleUrls: ["./resources-dashboard.component.scss"],
  standalone: true,
  imports: [],
})
export class ResourcesDashboardComponent implements OnInit, OnDestroy, DoCheck {
  constructor(
    private router: Router,
    protected resourcedashboard: ResourcesDashboardService,
    public globalLoader: GlobalLoaderService,
    private _commonService: CommonService
  ) { }
  resourcesFilter = new FormControl();
  autoCompleteData: string[] = [
    "Champs-Élysées 1",
    "Lombard Street",
    "Abbey Road",
    "Fifth Avenue",
  ];
  filteredResources: Observable<string[]>;

  cardStyle = cardStyle;
  cardData = [learningCenter, dataSets, reportsPublications];
  castSubs;
  ngOnInit(): void {
    // this.subscribeValue();
    console.log("======>>>>>", this.cardData);
    this.activeCard(1, this.cardData);
    this.filteredResources = this.resourcesFilter.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value))
    );
    this.castSubs = this._commonService.castSearchItem.subscribe((res: any) => {
      console.log('searched item in resource', res)
      this.resourcesFilter.setValue(res)
      this.searchFilter(res);
    })
    console.log("resource Filter", this.resourcesFilter)
  }
  private _filter(value: string): string[] {
    if (value != "") {
      const filterValue = this._normalizeValue(value);
      return this.autoCompleteData.filter((data) =>
        this._normalizeValue(data).includes(filterValue)
      );
    }
  }
  ngOnDestroy() {
    this.castSubs?.unsubscribe();
  }

  ngDoCheck() {
    const url = this.router.url;
    this.cardData.map((elem) => {
      const link = elem.link.split("/")[0];
      if (url.includes(link)) {
        elem[`activeCard`] = true;
      } else {
        elem[`activeCard`] = false;
      }
    });
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, "");
  }

  activeCard(cardIndex: number, cardData: any) {
    cardData.map((elem, index) => {
      if (index == cardIndex) {
        elem[`activeCard`] = true;
      } else {
        elem[`activeCard`] = false;
      }
    });
  }
  crossIcon: boolean = false;
  search: boolean = true;
  searchValue: string = "";
  // data:any={
  //   total:500,
  //   learning:220,
  //   dataset:180,
  //   report:100
  // }

  data: any = {
    total: 0,
    learningCenter: 0,
    dataSet: 0,
    reportsAndPublication: 0,
  };
  passedCount: any;
  totalCount: any;
  searchedValue: any;
  toggle: boolean = true;
  defaultPlaceholder: boolean = false;

  searchFilter(searchFilter: any) {
    //sending data to resource count to card
    //queryparam used for url
    // this.router.navigate( ['/resources-dashboard/learning-center/toolkits'],
    // { queryParams: { search: searchFilter } })

    this.globalLoader.showLoader();
    this.searchedValue = searchFilter;
    console.log('this.searchedValue', this.searchedValue)
    this.resourcedashboard.GlobalSearch(this.searchedValue).subscribe(
      (res: any) => {
        console.log("gloabal response", res);
        this.globalLoader.stopLoader();
        const apiData = res.data;
        for (const elem in this.data) {
          this.data[elem] = res.data[elem];
        }

        this.data.total = Object.values(res.data).reduce(
          (curr: any, acc: any) => curr + acc
        );
        this.passedCount = {
          key: this.data,
          name: searchFilter,
          toggle: this.toggle,
        };
        console.log("passedCount==>", this.passedCount);
        this.totalCount = this.data.total;
        this.resourcedashboard.updateResouceCount(this.passedCount);
      },
      (err: any) => {
        this.globalLoader.stopLoader();
        this.data = {};
        this.passedCount = {
          key: this.data,
          name: searchFilter,
          toggle: this.toggle,
        };
        console.log("passedCount==>", this.passedCount);

        this.resourcedashboard.updateResouceCount(this.passedCount);
      }
    );
    if (searchFilter.length) {
      this.crossIcon = true;
      this.search = false;
      this.router.navigate(["/resources-dashboard/learning-center/toolkits"], {
        queryParams: { search: searchFilter },
      });
    }
    console.log('searchFilter', searchFilter);

  }
  crossButton() {
    this.searchValue = "";
    this.search = true;
    this.crossIcon = false;
    this.resourcesFilter.patchValue("");
    // this.resourcesFilter.patchValue({
    //   value: ""
    // })
    // console.log("resource Filter", this.resourcesFilter)
    this.searchFilter(this.searchValue);
    // this.resourcedashboard.updateSearchedData(this.defaultPlaceholder)
  }
}
const learningCenter = {
  type: 4,
  title: "Learning Center",
  subTitle: `Access our research outputs such as digital toolkits, e-learning modules, best practices on municipal finance here.`,
  svg: `../../../assets/resources-das/learning.svg`,
  link: "learning-center/toolkits",
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
const dataSets = {
  type: 4,
  title: "Datasets",
  subTitle: `Access raw as well standardized ULB financial statements datasets here.`,
  svg: `../../../assets/resources-das/dataSets.svg`,
  link: "data-sets/income_statement",
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
const reportsPublications = {
  type: 4,
  title: "Reports & Publications",
  subTitle: `Access Municipal Finance related publications here.`,
  svg: `../../../assets/resources-das/reports.svg`,
  link: "report-publications",
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
const latestNewsUpdates = {
  type: 4,
  title: "Latest News & Updates",
  subTitle: `Lorem ipsum dolor sit amet, consectetur
  adipiscing elit. Morbi porta vitae nisl commodo aliquet. Suspendisse in posuere tellus.`,
  svg: `../../../assets/resources-das/learning.svg`,
  link: "latest-news",
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
  width: "15rem",
  borderRadius: "0.7500em",
  height: "13rem",
  // "max-height": "8rem",
};
