import { Component, OnInit, OnDestroy } from '@angular/core';
import { FrFilter, Filter, FiscalRankingService, Table } from '../services/fiscal-ranking.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

// import { SweetAlert } from "sweetalert/typings/core";
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { CommonTableComponent } from '../common-table/common-table.component';
import { MaterialModule } from '../../../material.module';
import { MatCommonTableComponent } from '../mat-common-table/mat-common-table.component';
// import { participatedULBRes } from './participatin-ulb-json';
// const swal: SweetAlert = require("sweetalert");
@Component({
  selector: 'app-participating-ulbs',
  templateUrl: './participating-ulbs.component.html',
  styleUrls: ['./participating-ulbs.component.scss'],
  standalone: true,
  imports: [CommonTableComponent, MaterialModule, BreadcrumbComponent, MatCommonTableComponent],
})
export class ParticipatingUlbsComponent implements OnInit, OnDestroy {
  stateId!: string;

  constructor(
    private fiscalRankingService: FiscalRankingService,
    private route: ActivatedRoute,
  ) {


  }
  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/rankings/home',
      class: ''
    },
    {
      label: 'Participated States & UT ',
      url: '/rankings/participated-states-ut',
      class: ''
    },
    {
      label: 'Participated ULBs',
      url: '/rankings/participated-ulbs',
      class: 'disabled'
    },

  ];

  populationCategoryFilter: FrFilter[] | undefined = [];
  ulbParticipationFilter: FrFilter[] | undefined = [];
  ulbRankingStatusFilter: FrFilter[] | undefined = [];
  populationBucket: string = 'All';
  ulbParticipation: string = 'All';
  ulbRankingStatus: string = 'All';
  stateList = [];
  routerSubs: any;
  selectedStateId: string = '';
  selectedStateName: string = '';
  allowedExtensions: string[] = ['pdf', 'excel'];
  targetExtension: string = 'pdf';
  table: Table = {
    endpoint: 'scoring-fr/ulbs',
    response: null,
    info: "Note: The '-' sign denotes data that has not been submitted on the portal."
  };

  ngOnInit(): void {
    this.selectedStateId = <string>this.route.snapshot.paramMap.get('stateId');
    console.log('this.selectedStateId', this.selectedStateId);

    this.getFilters();
    this.getTableData(this.table, '');
  }
  dropDownValueChanges(e: any) {
    this.getTableData(this.table, '');
  }

  resetFilter() {
    // this.populationBucket = this.populationCategoryFilter ? this.populationCategoryFilter[0]?.value : '';
    // this.ulbParticipation = this.ulbParticipationFilter[0]?.value;
    // this.ulbRankingStatus = this.ulbRankingStatusFilter[0]?.value;
    this.getTableData(this.table, '');
  }

  ngOnDestroy() {
    this.routerSubs.unsubscribe();
  }

  // get the ulbs data 
  getTableData(table: Table, queryParams: string = '') {
    const filterObj = {
      populationBucket: this.populationBucket,
      ulbParticipationFilter: this.ulbParticipation,
      ulbRankingStatusFilter: this.ulbRankingStatus,
    }

    const endpoint = `${this.table.endpoint}/${this.selectedStateId}`;

    this.fiscalRankingService.getTableResponse(endpoint, queryParams, table?.response?.columns, 'data', filterObj).subscribe((res: any) => {
      // console.log('participated-state table responces', res);
      this.table["response"] = res?.data;
      // this.table["response"] = participatedULBRes.data;
      this.selectedStateName = res?.data?.state?.name
    },
      (error) => {
        console.log('participated-state table error', error);
      }
    );

  }

  // for all filters
  getFilters() {
    this.fiscalRankingService.callGetMethod('scoring-fr/filters', null).subscribe((res: any) => {
      console.log('scoring-fr/participated-state-filter', res);
      const filter: Filter = res?.data;
      this.populationCategoryFilter = filter?.populationBucketFilter;
      this.ulbParticipationFilter = filter?.ulbParticipationFilter;
      this.ulbRankingStatusFilter = filter?.ulbRankingStatusFilter;

    },
      (error) => {
        // swal('Error', error?.message ?? 'Something went wrong', 'error');
      }
    )
  }

  onUpdate(table: Table, event: any) {
    this.getTableData(table, event?.queryParams);
  }
}
