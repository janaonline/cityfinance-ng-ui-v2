
import { Component, OnInit } from '@angular/core';
import { ToStorageUrlPipe } from '../../../core/pipes/to-storage-url.pipe';
import { CommonService } from '../../../core/services/common.service';
import { ResourcesDashboardService } from '../resources-dashboard.service';
import { Title , Meta} from '@angular/platform-browser';
@Component({
  selector: 'app-reports-publication',
  templateUrl: './reports-publication.component.html',
  styleUrls: ['./reports-publication.component.css'],
  imports: [ToStorageUrlPipe]
})
export class ReportsPublicationComponent implements OnInit {
  learningCount: any
  searchedValue: any
  learningToggle: boolean = false
  noData: boolean = false
  dataReceived: boolean = true
  stateIdsMap: any = JSON.parse(localStorage.getItem("stateIdsMap"))
  constructor(
    private titleService: Title,
    private metaService : Meta,
    private _commonService: CommonService, private resourcesDashboard: ResourcesDashboardService
  ) {
    // this._commonService.getPublicFileList().subscribe((res)=>{
    //   this.cardData = res
    //   console.log("cardData=>",this.cardData)
    // })
    this.resourcesDashboard.castSearchedData.subscribe(data => {
      this.learningToggle = data
    })
    this.resourcesDashboard.castCount.subscribe(data => {
      this.learningCount = data?.key?.reportsAndPublication
      this.searchedValue = data?.name
      this.learningToggle = data?.toggle ? true : false;
      if (data?.key?.total == 0 && this.searchedValue !== "") {
        this.noData = true;
        this.dataReceived = false;
      } else {
        this.noData = false;
        this.dataReceived = true;
      }
    })
  }
  cardData = []

  pdfInput: any = {
    toolKitVisible: "",
    type: "PDF",
    header: "reports_%26_publications",
    subHeader: "",
    globalName: "",
    state: "",
    ulb: "",
    year: "",
  }

  mobileFilterConfig: any = {
    isState: true,
    isUlb: true,
    isYear: true,
    useFor: "resourcesDashboard"
  };

  getCardData() {
    this.resourcesDashboard.getPdfData(this.pdfInput).subscribe((res: any) => {
      console.log("best practice data", res)
      const response = res?.data.map((elem) => {
        elem.createdAt = elem.createdAt.split("T")[0]
        return elem
      })
      console.log("response", response)
      this.cardData = response
      // this.cardData = res?.data
    }, (err: any) => {
      this.cardData = []
    })

    console.log("cardData", this.cardData)
  }

  openFile(url: string) {
    const storageUrl = new ToStorageUrlPipe().transform(url);
    window.open(storageUrl, '_blank');
  }
  filterComponent;
  ngOnInit(): void {
     // Set meta tags for Reports & Publications page
  this.titleService.setTitle('Reports & Publications | City Finance');

  this.metaService.updateTag({
    name: 'description',
    content: 'Access reports and publications on City Finance. Find financial documents, publications, and resources for informed decision-making.'
  });

  this.metaService.updateTag({
    name: 'keywords',
    content: 'City Finance, reports, publications, financial documents, resources, finance reports'
  });

  this.metaService.updateTag({
    name: 'robots',
    content: 'index, follow'
  });

  this.metaService.updateTag({
    property: 'og:title',
    content: 'Reports & Publications | City Finance'
  });

  this.metaService.updateTag({
    property: 'og:description',
    content: 'Explore the latest reports and publications from City Finance. Stay informed with our comprehensive financial resources.'
  });

  this.metaService.updateTag({
    property: 'og:url',
    content: 'https://cityfinance.in/report-publications'
  });

  this.metaService.updateTag({
    property: 'og:type',
    content: 'website'
  });

  if (this.searchedValue) {
      this.pdfInput.globalName = this.searchedValue
    }
    this.getCardData()
    console.log("stateIdsMap", this.stateIdsMap)
    this.filterComponent = {
      comp: 'report-publications'
    }
  }

  filterData(e) {
    console.log('reports publications', e.value, this.stateIdsMap[e.value?.state])
    this.pdfInput.state = e.value?.state;
    this.pdfInput.ulb = e.value.ulbId;
    this.pdfInput.year = e.value.year
    this.getCardData()

  }

}
