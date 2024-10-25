import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FiscalRankingService } from '../services/fiscal-ranking.service';
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assessment-parameter',
  templateUrl: './assessment-parameter.component.html',
  styleUrls: ['./assessment-parameter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent]
})
export class AssessmentParameterComponent implements OnInit, OnDestroy {

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
  allPageData: object | any = {};

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
        Swal.fire('Error', error?.message ?? 'Something went wrong', 'error');
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
