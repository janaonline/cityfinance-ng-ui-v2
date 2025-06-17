import { Component } from '@angular/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-spotlight',
  imports: [SlickCarouselModule, MaterialModule],
  templateUrl: './spotlight.component.html',
  styleUrl: './spotlight.component.scss'
})
export class SpotlightComponent {

  slides = [
    { img: "http://placehold.it/350x150/000000" },
    { img: "http://placehold.it/350x150/111111" },
    { img: "http://placehold.it/350x150/333333" },
    { img: "http://placehold.it/350x150/666666" }
  ];
  whatNewData =
    [
      {
        "src": "/assets/images/homepage-v2/spotlight/rbi-report.webp",
        "name": "RBI Report on Municipal Finances",
        "downloadUrl": "https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/objects/5b1a4e36-ebfb-4311-84c6-8213bee1a284.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/municipal-finance-blueprint.webp",
        "name": "A Municipal Finance Blueprint For India",
        "downloadUrl": "https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/objects/bdd4ab84-20bf-4299-818b-e34273084615.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/xvi-fc-members-appointment-1.webp",
        "name": "XVI FC Constitution & Terms of Reference",
        "downloadUrl": "/assets/images/homepage-v2/spotlight/xvi-fc-members-appointment-1.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/cfr-framework.webp",
        "name": "City Finance Rankings Framework",
        "downloadUrl": "/assets/images/homepage-v2/spotlight/cfr-framework.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/asics-2023-report.webp",
        "name": "ASICS Report 2023",
        "downloadUrl": "/assets/images/homepage-v2/spotlight/asics-2023-report.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/world-bank.webp",
        "name": "Indian Urban Infrastructure & Services",
        "downloadUrl": "https://documents1.worldbank.org/curated/en/099615110042225105/pdf/P17130200d91fc0da0ac610a1e3e1a664d4.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/national-municipal-account-manual-nov-2004-low.webp",
        "name": "National Municipal Accounts Manual",
        "downloadUrl": "https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/NMAM_Manual.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/xvfc-main-report-volume-1.webp",
        "name": "XV FC Main Report Volume I",
        "downloadUrl": "https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/XVFC_VOL_I_Main_Report_2021-26.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/xv-fc-operational-guidelines.webp",
        "name": "XV FC Operational Guidelines",
        "downloadUrl": "https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/Annexure-I_FC-XV_operational_guidelines_for_Urban_Local_Body_for_2021-26.pdf"
      },
      {
        "src": "/assets/images/homepage-v2/spotlight/property-tax.webp",
        "name": "Property Tax Toolkit",
        "downloadUrl": "https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/Property_Tax_Reforms_Toolkit.pdf"
      }
    ];


  slideConfig = {
    "slidesToShow": 3,
    "slidesToScroll": 3,
    "dots": true,
    "infinite": true,
    "autoplay": true,
    "autoplaySpeed": 5000,
    "responsive": [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 680,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };


  // removeSlide() {
  //   this.slides.length = this.slides.length - 1;
  // }

  // slickInit(e: any) {
  //   console.log('slick initialized', e);
  // }

  // breakpoint(e: any) {
  //   console.log('breakpoint', e);
  // }

  // afterChange(e: any) {
  //   console.log('afterChange', e);
  // }

  // beforeChange(e: any) {
  //   console.log('beforeChange', e);
  // }
}
