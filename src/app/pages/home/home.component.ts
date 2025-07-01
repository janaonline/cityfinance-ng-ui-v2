import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardMapSectionComponent } from './dashboard-map-section/dashboard-map-section.component';
import { FormControl } from '@angular/forms';
import { CommonService } from '../../core/services/common.service';
import { ResourcesDashboardService } from './resources-dashboard.service';
import { MaterialModule } from '../../material.module';
import { SearchBarComponent } from './search-bar/search-bar.component';
// import { SpotlightComponent } from './spotlight/spotlight.component';
import { DiscoverSectionComponent } from './discover-section/discover-section.component';
import { SponsersPartnersComponent } from './sponsers-partners/sponsers-partners.component';
import { SeoService } from '../../core/services/seo/seo.service';
// declare let $: any;

@Component({
  selector: 'app-home',
  imports: [
    // CommonModule,
    // RouterModule,
    DashboardMapSectionComponent,
    // MaterialModule,
    SearchBarComponent,
    // SpotlightComponent,
    DiscoverSectionComponent,
    SponsersPartnersComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {

  constructor(
    protected _commonService: CommonService,
    // private router: Router,
    public resourceDashboard: ResourcesDashboardService,
    private seoService: SeoService,
  ) {

    // this.resourceDashboard.getPdfData(this.pdfInput).subscribe(
    //   (res: any) => {
    //     const response = res?.data.map((elem: any) => {
    //       elem.createdAt = elem.createdAt.split('T')[0];
    //       return elem;
    //     });
    //     //  console.log("response", response)
    //     // Commented for updating the order
    //     // this.whatNewData = response
    //   },
    //   (err: any) => {
    //     // this.whatNewData = []
    //   },
    // );
  }

  // globalFormControl = new FormControl();
  // globalOptions = [];
  // filteredOptions: any = [];
  // cardData = [];
  // dataForVisualization: any;
  // pdfInput: any = {
  //   toolKitVisible: '',
  //   type: 'PDF',
  //   header: 'reports_%26_publications',
  //   subHeader: '',
  //   globalName: '',
  //   state: '',
  //   ulb: '',
  //   year: '',
  // };

  // myInterval = 2000;
  // activeSlideIndex = false;
  // p_indi = true;
  // m_indi = false;
  // itemsPerSlide = 1;
  // singleSlideOffset = false;
  // noWrap = false;

  slides = [
    {
      image: '../../../assets/images/homepage/new_dashBord_ftr_hdr/modiji.png',
      text: `"It’s our mission to strengthen our cities to meet the challenges of 21st century"`,
      name: 'Narendra Modi',
      designation: 'Hon’ble Prime Minister of India',
      class: 'prim-img',
      textCls: 'p-t',
    },
    {
      image: '../../../assets/images/homepage/new_dashBord_ftr_hdr/puriji.png',
      text: `"Municipalities need to lay a foundation of robust financial management for both,
         enhancing own revenues, as well as tapping the capital market through municipal bonds"`,
      name: 'Hardeep Singh Puri',
      designation: 'Hon’ble Union Minister of Housing and Urban Affairs',
      class: 'min-img',
      textCls: 'm-t',
    },
  ];


  ngOnInit() {
    this.setSeo();
    // this._commonService.dataForVisualizationCount.subscribe((res: any) => {
    //   this.dataForVisualization = res;
    // });
  }

  setSeo() {
    this.seoService.updateTitle('Home Page | Your Site');

    this.seoService.updateMetaTags([
      { name: 'description', content: 'Homepage of Your Site' },
      { name: 'keywords', content: 'angular 20, seo, json-ld' },
      { property: 'og:title', content: 'Home | Your Site' }
    ]);

    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Your Site",
      "url": "https://yoursite.com"
    });
  }

  // carouselClass(e: any) {
  //   if (e == 0) {
  //     this.p_indi = true;
  //     this.m_indi = false;
  //   }
  //   if (e == 1) {
  //     this.m_indi = true;
  //     this.p_indi = false;
  //   }
  // }
}
