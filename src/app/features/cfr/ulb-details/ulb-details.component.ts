import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
// import { FiscalRankingService, UlbData } from '../fiscal-ranking.service';
import { MaterialModule } from '../../../material.module';
import { FiscalRankingService, UlbData } from '../services/fiscal-ranking.service';
import { UlbDetailsHeaderComponent } from './ulb-details-header/ulb-details-header.component';
import { UlbDetailsAssessmentParametersComponent } from './ulb-details-assessment-parameters/ulb-details-assessment-parameters.component';
import { PerformanceFourMComponent } from './performance-four-m/performance-four-m.component';
import { ComparisonComponent } from './comparison/comparison.component';


interface APIResponse {
  assessmentParameter: any;
  fsData: {
    [key: string]: {
      value: string | null;
      status: 'APPROVED' | 'REJECTED' | 'PENDING';
    }
  },
  topUlbs: UlbData[];
  ulb: any;
}

@Component({
  selector: 'app-ulb-details',
  templateUrl: './ulb-details.component.html',
  styleUrls: ['./ulb-details.component.scss'],
  standalone: true,
  imports: [MaterialModule, BreadcrumbComponent, UlbDetailsHeaderComponent, UlbDetailsAssessmentParametersComponent,
    PerformanceFourMComponent, ComparisonComponent
  ],
})
export class UlbDetailsComponent implements OnInit {


  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/cfr/home'
    },
    {
      label: 'Top rankings',
      url: '/cfr/top-rankings'
    }
  ];

  data!: APIResponse;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fiscalRankingService: FiscalRankingService
  ) { }

  get ulbId() {
    return this.activatedRoute.snapshot.params['ulbId'];
  }


  ngOnInit(): void {
    this.breadcrumbLinks.push({
      label: 'ULB details',
      url: `/cfr/ulb/${this.ulbId}`,
      class: 'disabled'
    });

    this.loadUlbData();
  }

  loadUlbData() {
    this.fiscalRankingService.ulbDetails(this.ulbId).subscribe((res: any) => {
      console.log(res);
      this.data = res.data;
    })
  }

}
