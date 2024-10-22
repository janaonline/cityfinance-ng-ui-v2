import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FiscalRankingService } from '../services/fiscal-ranking.service';
import { SweetAlert } from "sweetalert/typings/core";
import { BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// const swal: SweetAlert = require("sweetalert");
@Component({
  selector: 'app-assessment-parameter',
  templateUrl: './assessment-parameter.component.html',
  styleUrls: ['./assessment-parameter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AssessmentParameterComponent implements OnInit {

  constructor(
    private router: Router,
    private fiscalRankingService: FiscalRankingService,
  ) {
    this.checkRouterForApi();
  }
  pageKey: string = 'resourceMobilisation';
  assestParameters = {
    title: '',
    data: [
      {
        id: 1,
        key: 'resourceMobilisation',
        label: 'Resource Mobilisation'
      },
      {
        id: 2,
        key: 'expenditurePerformance',
        label: 'Expenditure Performance'
      },
      {
        id: 3,
        key: 'fiscalGovernance',
        label: 'Fiscal Governance'
      },

    ]

  };
  allPageData: object | any = {
    // resourceMobilisation : {
    //   id: 1,
    //   key: 'resourceMobilisation',
    //   name: 'Resource Mobilisation',
    //   subHeading: 'Fueling Urban Growth',
    //   description: `Resource Mobilization is a crucial parameter that evaluates the financial 
    //                 strength and growth potential of Urban Local Bodies (ULBs). Discover the significance of
    //                 resource mobilization, how it's assessed, and its impact on ULB rankings and urban development.`,
    //   imgUrl : `../../../assets/fiscal-rankings/smart-industry-control-concept 1.png`,
    //   questions: [
    //     {
    //       question: 'Why is Resource Mobilization Important?',
    //       answer: `Resource Mobilization is crucial for ULBs to ensure financial stability and growth.
    //        It enables them to provide essential services,
    //        infrastructure development, and quality of life improvements for urban residents.`
    //     },
    //     {
    //       question: 'How Resource Mobilization helps ULB Scoring?',
    //       answer: `Resource Mobilization significantly influences ULB rankings. Higher mobilization indicates better financial health,
    //        leading to higher scores and better ULB positions in the rankings.`
    //     }
    //   ],
    //   scoringInfo: {
    //       header: 'Scoring Information',
    //       items: [
    //         {
    //           key: 'numberOfIndicators',
    //           value: 6,
    //           title: 'Number of Indicators'
    //         },
    //         {
    //           key: 'maximumScoreforIndicator',
    //           value: 100,
    //           title: 'Maximum Score for Each Indicator'
    //         },
    //         {
    //           key: 'maximumScore',
    //           value: 300,
    //           title: 'Maximum Score'
    //         },
    //       ]
    //   },
    //   scoringMethodology: {
    //     header: 'Scoring Methodology',
    //     description: `Unveiling the Metrics Shaping Urban Financial Strength and How They're Scored. 
    //     Explore the assessment indicators that drive the financial health of Urban Local Bodies (ULBs) and understand the methodology behind their scoring.
    //      Gain insights into the significance of resource mobilization in urban development.`,
    //     imgUrl: '../../../assets/fiscal-rankings/resMobTable.png'
    //   }

    //  },

    //  expenditurePerformance : {
    //   id: 2,
    //   key: 'expenditurePerformance',
    //   name: 'Expenditure Performance',
    //   subHeading: 'Fueling Urban Growth',
    //   description: `Explore the metrics that gauge Expenditure Performance and learn why it's a pivotal aspect for Urban Local Bodies (ULBs) across India.
    //   Understand how Expenditure Performance influences ULB rankings and delve into the scoring methodology.`,
    //   imgUrl : `../../../assets/fiscal-rankings/business-people-analyzing-data-graphs-and-charts-displayed-on-the-digital-tablet-screen 1.png`,
    //   questions: [
    //     {
    //       question: 'Why is Expenditure Performance Important?',
    //       answer: `Expenditure Performance is critical for ULBs to efficiently allocate resources, ensure quality infrastructure, and deliver services effectively.
    //        It contributes to improving the overall living conditions in urban areas.`
    //     },
    //     {
    //       question: 'How Expenditure Performance Affects ULB Scoring?',
    //       answer: `Expenditure Performance directly impacts ULB rankings.
    //        Higher performance in terms of capital expenditure and cost-effective operations & maintenance expenses results in better scores and higher ULB rankings.`
    //     }
    //   ],
    //   scoringInfo: {
    //     header: 'Scoring Information',
    //     items: [
    //       {
    //         key: 'numberOfIndicators',
    //         value: 6,
    //         title: 'Number of Indicators'
    //       },
    //       {
    //         key: 'maximumScoreforIndicator',
    //         value: 100,
    //         title: 'Maximum Score for Each Indicator'
    //       },
    //       {
    //         key: 'maximumScore',
    //         value: 300,
    //         title: 'MaximumScore'
    //       },
    //     ]
    // },
    // scoringMethodology: {
    //   header: 'Scoring Methodology',
    //   description: `Unveiling the Metrics Shaping Urban Financial Strength and How They're Scored. 
    //   Explore the assessment indicators that drive the financial health of Urban Local Bodies (ULBs) and understand the methodology behind their scoring.
    //    Gain insights into the significance of resource mobilization in urban development.`,
    //    imgUrl: '../../../assets/fiscal-rankings/expenTable.png'
    // }
    //  },
    //  fiscalGovernance : {
    //   id: 3,
    //   key: 'fiscalGovernance',
    //   name: 'Fiscal Governance',
    //   subHeading: 'Fueling Urban Growth',
    //   description: `Explore the metrics that define Fiscal Governance and discover why it's a crucial aspect for Urban Local Bodies (ULBs) across India. 
    //   Gain insights into how Fiscal Governance influences ULB rankings and dive into the scoring methodology.`,
    //   imgUrl : `../../../assets/fiscal-rankings/stack-of-money-coin-with-trading-graph-for-finance-investor-cryptocurrency-digital-economy 1.png`,
    //   questions: [
    //     {
    //       question: 'Why is Fiscal Governance Important?',
    //       answer: `Fiscal Governance is vital for ULBs to maintain transparency, ensure efficient revenue collection, 
    //       and effectively manage budgets. It enhances financial accountability and the ability to fund essential services.`
    //     },
    //     {
    //       question: 'How Fiscal Governance Affects ULB Scoring?',
    //       answer: `Fiscal Governance directly impacts ULB rankings. Timely audits, robust accounting systems,
    //        and digital revenue collection contribute to higher scores and improved ULB positions.`
    //     }
    //   ],
    //   scoringInfo: {
    //     header: 'Scoring Information',
    //     items: [
    //       {
    //         key: 'numberOfIndicators',
    //         value: 6,
    //         title: 'Number of Indicators'
    //       },
    //       {
    //         key: 'maximumScoreforIndicator',
    //         value: 100,
    //         title: 'Maximum Score for Each Indicator'
    //       },
    //       {
    //         key: 'maximumScore',
    //         value: 300,
    //         title: 'MaximumScore'
    //       },
    //     ]
    // },
    // scoringMethodology: {
    //   header: 'Scoring Methodology',
    //   description: `Unveiling the Metrics Shaping Urban Financial Strength and How They're Scored. 
    //   Explore the assessment indicators that drive the financial health of Urban Local Bodies (ULBs) and understand the methodology behind their scoring.
    //    Gain insights into the significance of resource mobilization in urban development.`,
    //   imgUrl: '../../../assets/fiscal-rankings/fiscalTable.png'
    // }

    //  }
  };

  currentPageData: object | any = {};
  routerSubs: any;
  isApiInProgress: boolean = true;
  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/cfr/home'
    },
    {
      label: `Ranking assessment parameter : `,
      url: '/cfr/participated-states-ut',
      class: 'disabled'
    }
  ];
  ngOnInit(): void {
    //   this.currentPageData = this.allPageData[this.pageKey];
  }
  checkRouterForApi() {
    this.isApiInProgress = true;
    this.routerSubs = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const urlArray = event.url.split("/");
        this.pageKey = urlArray[3]
        this.getPageData();
      }
    });
  }
  setPageKey(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.router.navigateByUrl(`cfr/assesst-parameters/${selectedValue}`);
  }

  // setPageKey(data: any) {
  //   // this.currentPageData = this.allPageData[data];
  //   this.router.navigateByUrl(`cfr/assesst-parameters/${data}`)
  // }
  getPageData() {
    this.fiscalRankingService.callGetMethod(`scoring-fr/assessment-parameters`, null).subscribe((res: any) => {
      this.allPageData = res?.data;
      this.currentPageData = this.allPageData[this.pageKey];
      const currentPageLink = {
        label: `Ranking assessment parameter : ${this.currentPageData?.name}`,
        url: '/cfr/participated-states-ut',
        class: 'disabled'
      }
      this.breadcrumbLinks.splice(1, 1, currentPageLink);
      this.isApiInProgress = false;
    },
      (error) => {
        // swal('Error', error?.message ?? 'Something went wrong', 'error');
        this.currentPageData = {};
        this.isApiInProgress = false;
      }
    )
  }

  ngOnDestroy() {
    this.isApiInProgress = false;
    this.routerSubs.unsubscribe();
  }

  isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0;
  }
}
