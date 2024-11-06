import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { FiscalRankingService, UlbData } from '../services/fiscal-ranking.service';
import { ComparisonComponent } from './comparison/comparison.component';
import { PerformanceFourMComponent } from './performance-four-m/performance-four-m.component';
import { UlbDetailsAssessmentParametersComponent } from './ulb-details-assessment-parameters/ulb-details-assessment-parameters.component';
import { UlbDetailsHeaderComponent } from './ulb-details-header/ulb-details-header.component';

interface APIResponse {
  assessmentParameter: any;
  fsData: {
    [key: string]: {
      value: string | null;
      status: 'APPROVED' | 'REJECTED' | 'PENDING';
    };
  };
  topUlbs: UlbData[];
  ulb: any;
}

@Component({
  selector: 'app-ulb-details',
  templateUrl: './ulb-details.component.html',
  styleUrls: ['./ulb-details.component.scss'],
  standalone: true,
  imports: [
    MaterialModule,
    BreadcrumbComponent,
    UlbDetailsHeaderComponent,
    UlbDetailsAssessmentParametersComponent,
    PerformanceFourMComponent,
    ComparisonComponent,
    LoaderComponent,
  ],
})
export class UlbDetailsComponent implements OnInit {
  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/cfr/home',
    },
    {
      label: 'Top rankings',
      url: '/cfr/top-rankings',
    },
  ];

  data: APIResponse = {} as APIResponse;
  isLoading: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fiscalRankingService: FiscalRankingService,
  ) {}

  get ulbId() {
    return this.activatedRoute.snapshot.params['ulbId'];
  }

  ngOnInit(): void {
    this.breadcrumbLinks.push({
      label: 'ULB details',
      url: `/cfr/ulb/${this.ulbId}`,
      class: 'disabled',
    });

    this.loadUlbData();
    // Swal.fire('Error', 'Something went wrong', 'error');
  }

  loadUlbData() {
    this.isLoading = true;
    this.fiscalRankingService.ulbDetails(this.ulbId).subscribe((res: any) => {
      // console.log(res);
      this.data = res.data;
      this.isLoading = false;
    });
  }
}
