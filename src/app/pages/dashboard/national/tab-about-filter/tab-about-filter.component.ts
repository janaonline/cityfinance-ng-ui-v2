import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "../../../../core/services/common.service";
import { NationalMapSectionService } from "../national-map-section/national-map-section.service";

@Component({
  selector: "app-tab-about-filter",
  templateUrl: "./tab-about-filter.component.html",
  styleUrls: ["./tab-about-filter.component.scss"],
})
export class TabAboutFilterComponent implements OnInit, OnChanges {
  constructor(
    protected router: Router,
    protected activeRoute: ActivatedRoute,
    private _commonServices: CommonService,
    private nationalMapService: NationalMapSectionService
  ) {}
  public chart: Chart;
  @Input() data = [];
  @Input() tabIndex = 0;
  @Input() tabId = "61e150439ed0e8575c881028";
  @Input() cordsValue: number;

  @Output() nationalDataAvailabilityValue = new EventEmitter<string>();

  tabData;
  aboutTab;
  activeFilter: any = [];
  selectedIndex: any;
  mainTab: any;
  baseUrl:string = window.location.origin;
  stickyValue: boolean = false;
  ngOnInit(): void {
    this.nationalSubTab("Total Revenue", 0);
  }

  nationalSubTab(value, i) {
    this.selectedIndex = i;
    this.nationalMapService.setCurrentSubTabValue({
      data: value,
      HeadTab: this.mainTab,
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.cordsValue && changes.cordsValue.currentValue) {
      if (this.cordsValue >= 750) {
        this.stickyValue = true;
      } else {
        this.stickyValue = false;
      }
    }
    if (changes.data && changes.data.currentValue) {
      const urls = this.router.url.split("/");
      const selectedTabId = urls[urls.length - 1];
      const index = this.data.findIndex((el) => el._id == selectedTabId);
      if (index > -1) this.activeTabFn(this.data[index], index);
    }

    // if(changes.tabIndex && changes.tabIndex.currentValue ){
    //   console.log("changesCatib", this.activeFilter, this.tabIndex)
    //   this.tabIndex = changes.tabIndex.currentValue;
    //   this.activeTabFn(this.data[this.tabIndex], this.tabIndex);
    //   this.router.navigate([`dashboard/national/${this.tabId}`], {queryParams: {"tabIndex": this.tabIndex}});
    // }
  }
  activeTabFn(item: any, selectedTabIndex: number) {
    this.mainTab = item?.name;
    this.aboutTab = item?.subHeaders[0]?.mainContent[0]?.about;
    this.tabIndex = selectedTabIndex;

    this.activeFilter = item?.subHeaders[0]?.mainContent[0]?.btnLabels;
    if (this.activeFilter) {
      this.nationalSubTab(this.activeFilter[0], 0);
    }
    
    if(this.mainTab=='Data Availability'){
      this._commonServices.setSelectedFinancialYear('2021-22')
      this.nationalMapService.setCurrentSelectYear({
      data:'2021-22',
    });
  }
  }
}
