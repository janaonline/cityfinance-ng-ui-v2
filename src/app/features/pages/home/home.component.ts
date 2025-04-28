import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardMapSectionComponent } from './dashboard-map-section/dashboard-map-section.component';
// import { CountUpDirective } from '../../core/directives/count-up/count-up.directive';
import { FormControl } from '@angular/forms';
import { CommonService } from '../../../core/services/common.service';
import { ResourcesDashboardService } from './resources-dashboard.service';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MaterialModule } from '../../../material.module';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SpotlightComponent } from './spotlight/spotlight.component';
declare let $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardMapSectionComponent,
    // CountUpDirective, 
    SlickCarouselModule, MaterialModule,
    SearchBarComponent, SpotlightComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(
    protected _commonService: CommonService,
    private router: Router,
    public resourceDashboard: ResourcesDashboardService,
    private renderer: Renderer2,
  ) {
    this.resourceDashboard.getPdfData(this.pdfInput).subscribe((res: any) => {
      const response = res?.data.map((elem: any) => {
        elem.createdAt = elem.createdAt.split("T")[0]
        return elem
      })
      //  console.log("response", response)
      // Commented for updating the order
      // this.whatNewData = response
    }, (err: any) => {
      // this.whatNewData = []
    })

  }


  @ViewChild('highlightContainer', { static: false }) private highlightContainer!: ElementRef<HTMLDivElement>;
  isHighlightContainerScrolledIntoView!: boolean;
  highlightNo: number = 0;
  interval: any;
  @HostListener('window:scroll', ['$event'])
  isScrolledIntoView() {
    if (this.highlightContainer) {
      const rect = this.highlightContainer.nativeElement.getBoundingClientRect();
      const topShown = rect.top >= 0;
      const bottomShown = rect.bottom <= window.innerHeight;
      this.isHighlightContainerScrolledIntoView = topShown && bottomShown;

      if (this.isHighlightContainerScrolledIntoView) {
        if (this.highlightNo == 0) {
          this.highlightNo++;
          this.interval = setInterval(() => {
            if (this.highlightNo < 4)
              this.highlightNo++;
          }, 5 * 1000);
        }
      } else {
        if (this.interval)
          clearInterval(this.interval);
        this.highlightNo = 0;
      }

    }
  }
  globalFormControl = new FormControl();
  globalOptions = [];
  filteredOptions: any = [];
  cardData = []
  dataForVisualization: any;
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

  myInterval = 2000;
  activeSlideIndex = false;
  p_indi = true;
  m_indi = false;
  itemsPerSlide = 1;
  singleSlideOffset = false;
  noWrap = false;

  counters = [
    {
      id: "002",
      label: "Customers served ",
      number: "5321",
      duration: "0.1"
    }
  ];

  slides = [
    {
      image: "../../../assets/images/homepage/new_dashBord_ftr_hdr/modiji.png",
      text: `"It’s our mission to strengthen our cities to meet the challenges of 21st century"`,
      name: "Narendra Modi",
      designation: "Hon’ble Prime Minister of India",
      class: "prim-img",
      textCls: "p-t",
    },
    {
      image: "../../../assets/images/homepage/new_dashBord_ftr_hdr/puriji.png",
      text: `"Municipalities need to lay a foundation of robust financial management for both,
         enhancing own revenues, as well as tapping the capital market through municipal bonds"`,
      name: "Hardeep Singh Puri",
      designation: "Hon’ble Union Minister of Housing and Urban Affairs",
      class: "min-img",
      textCls: "m-t",
    },
  ];

  // Adding latest static  spotlight carousel details

  exploreCardData = [
    {
      title: '',
      label: 'Financial Performance Of Cities',
      text: 'Analyze and compare the financial performance of cities',
      icon: '../../../assets/images/homepage/new_dashBord_ftr_hdr/perf.svg',
      // hiddenText: 'Key attributes of 42 municipal bond issuances, 400 listed projects, 223 city credit ratings available',
      link: '/dashboard/national'
    },
    {
      title: '',
      label: 'Improve Own Revenue',
      text: 'Explore own revenue sources of municipalities and identify revenue improvement strategies',
      icon: '../../../assets/images/homepage/new_dashBord_ftr_hdr/revenu.svg',
      // hiddenText: 'Key attributes of 42 municipal bond issuances, 400 listed projects, 223 city credit ratings available',
      link: '/own-revenue-dashboard'
    },

    {
      title: '',
      label: 'Resources',
      text: 'Get access to a rich repository of resources to build your knowledge, and implement municipal finance reforms',
      icon: '../../../assets/images/homepage/new_dashBord_ftr_hdr/resoures/Group 15547.png',
      // hiddenText: 'Key attributes of 42 municipal bond issuances, 400 listed projects, 223 city credit ratings available',
      link: '/resources-dashboard/learning-center/toolkits'
    },
    {
      title: '',
      label: 'Service Level Benchmarks',
      text: 'Track your city’s performance across five themes and 28 key indicators.',
      icon: '../../../assets/images/homepage/new_dashBord_ftr_hdr/slb/Group 15493.png',
      // hiddenText: 'Key attributes of 42 municipal bond issuances, 400 listed projects, 223 city credit ratings available',
      link: '/dashboard/slb'
    },
    {
      title: '',
      label: 'XV Finance Commission Grants',
      text: 'Apply, review, recommend and track XV finance commission grants',
      icon: '../../../assets/images/homepage/new_dashBord_ftr_hdr/15fc.svg',
      // hiddenText: 'Key attributes of 42 municipal bond issuances, 400 listed projects, 223 city credit ratings available',
      link: '/login'
    },
    {
      title: '',
      label: 'Upload Annual Accounts',
      text: 'Upload Annual Account Forms',
      icon: '../../../assets/images/homepage/new_dashBord_ftr_hdr/raisemny.svg',
      // hiddenText: 'Key attributes of 42 municipal bond issuances, 400 listed projects, 223 city credit ratings available',
      link: '/upload-annual-accounts'
    },


  ]
  noDataFound = false;
  recentSearchArray: any = [];
  dummyData: any = [
    {
      name: 'newDataSet',
      type: 'new'
    }
  ]
  ngOnInit() {


    const hUser = $("#countDownUser").data('value');
    let hUserLess = hUser - 1000;
    const k = setInterval(function () {
      if (hUserLess >= hUser) {
        clearInterval(k);
      }
      hUserLess += 10;
    }, 25);

    this.globalFormControl.valueChanges
      .subscribe((value) => {
        if (value.length >= 1) {
          this._commonService.postGlobalSearchData(value, "", "").subscribe((res: any) => {
            //    console.log(res?.data);
            const emptyArr: any = []
            this.filteredOptions = emptyArr;
            if (res?.data.length > 0) {

              this.filteredOptions = res?.data;
              this.noDataFound = false;
            } else {

              const emptyArr: any = []
              this.filteredOptions = emptyArr;
              this.noDataFound = true;
              const noDataFoundObj = {
                name: '',
                id: '',
                type: '',
              }
              //  console.log('no data found')
            }
          });
        }
        else {
          return;
        }
      })


    this._commonService.dataForVisualizationCount.subscribe((res: any) => {
      this.dataForVisualization = res;
    })
  }



  carouselClass(e: any) {
    if (e == 0) {
      this.p_indi = true;
      this.m_indi = false;
    }
    if (e == 1) {
      this.m_indi = true;
      this.p_indi = false;
    }
  }



}
