import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { MatCommonTableComponent } from '../mat-common-table/mat-common-table.component';
import { FiscalRankingService } from '../services/fiscal-ranking.service';

@Component({
    selector: 'app-assessment-parameter',
    templateUrl: './assessment-parameter.component.html',
    styleUrls: ['./assessment-parameter.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        BreadcrumbComponent,
        MatCommonTableComponent,
        LoaderComponent,
    ]
})
export class AssessmentParameterComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fiscalRankingService: FiscalRankingService,
  ) {
    // this.checkRouterForApi();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.pageKey = id;
  }
  pageKey: string = 'resourceMobilization';
  isLoadingResults: boolean = true;
  apiResponse: any = {};
  parameterData: any = {};
  assestParameters = {
    title: '',
    data: [
      {
        id: 1,
        key: 'resourceMobilization',
        label: 'Resource Mobilization',
      },
      {
        id: 2,
        key: 'expenditurePerformance',
        label: 'Expenditure Performance',
      },
      {
        id: 3,
        key: 'fiscalGovernance',
        label: 'Fiscal Governance',
      },
    ],
  };
  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/cfr/home',
    },
    {
      label: `Ranking assessment parameter : `,
      url: '',
      class: 'disabled',
    },
  ];

  ngOnInit(): void {
    this.getPageData();
  }

  setPageKey(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.router.navigateByUrl(`cfr/assesst-parameters/${selectedValue}`);
    this.parameterData = this.apiResponse?.[selectedValue];

    const parameterLabel = this.assestParameters.data.find(
      (ele: any) => ele.key === selectedValue,
    )!.label;
    this.updateBreadCrumb(parameterLabel);
  }

  updateBreadCrumb(parameter: string) {
    const currentPageLink = {
      label: `Ranking assessment parameter : ${parameter}`,
      url: '/cfr/participated-states-ut',
      class: 'disabled',
    };
    this.breadcrumbLinks.splice(1, 1, currentPageLink);
  }

  getPageData() {
    this.isLoadingResults = true;
    this.fiscalRankingService.callGetMethod(`scoring-fr/assessment-parameters`, null).subscribe({
      next: (res: any) => {
        // console.log(res);
        this.parameterData = res?.data?.[this.pageKey];
        this.apiResponse = res?.data;
        this.updateBreadCrumb(this.parameterData?.name);
        this.isLoadingResults = false;
      },
      error: (error) => {
        Swal.fire('Error', error?.message ?? 'Something went wrong', 'error');
        this.parameterData = {};
        this.isLoadingResults = false;
      },
    });
  }
}
