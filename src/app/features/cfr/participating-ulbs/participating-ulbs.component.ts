import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, } from '@angular/router';
import { Filter, FiscalRankingService, FrFilter } from '../services/fiscal-ranking.service';

import Swal from 'sweetalert2';
import { MaterialModule } from '../../../material.module';
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { MatCommonTableComponent } from '../mat-common-table/mat-common-table.component';
import { Table, TableResponse } from '../services/common-table.interface';
@Component({
  selector: 'app-participating-ulbs',
  templateUrl: './participating-ulbs.component.html',
  styleUrls: ['./participating-ulbs.component.scss'],
  standalone: true,
  imports: [MaterialModule, BreadcrumbComponent, MatCommonTableComponent],
})
export class ParticipatingUlbsComponent implements OnInit {
  stateId!: string;
  limit: number = 10;
  skip: number = 0;

  constructor(
    private fiscalRankingService: FiscalRankingService,
    private route: ActivatedRoute,
  ) {


  }
  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/cfr/home',
      class: ''
    },
    {
      label: 'Participated States & UT ',
      url: '/cfr/participated-states-ut',
      class: ''
    },
    {
      label: 'Participated ULBs',
      url: '/cfr/participated-ulbs',
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
    response: {} as TableResponse,
    info: "Note: The '-' sign denotes data that has not been submitted on the portal."
  };

  isLoadingResults = false;

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
    this.populationBucket = 'All';
    this.ulbParticipation = 'All';
    this.ulbRankingStatus = 'All';
    this.getTableData(this.table, '');
  }

  pageChange(event: any) {
    this.limit = event.pageSize;
    this.skip = event.pageIndex * event.pageSize;
    this.getTableData(this.table, '');
  }
  // get the ulbs data 
  getTableData(table: Table, queryParams: string = '') {
    this.isLoadingResults = true;
    const filterObj = {
      populationBucket: this.populationBucket,
      ulbParticipationFilter: this.ulbParticipation,
      ulbRankingStatusFilter: this.ulbRankingStatus,
      skip: this.skip,
      limit: this.limit,
    }

    const endpoint = `${this.table.endpoint}/${this.selectedStateId}`;

    this.fiscalRankingService.getTableResponse(endpoint, queryParams, table?.response?.columns, 'data', filterObj).subscribe((res: any) => {
      // console.log('participated-state table responces', res);
      this.table["response"] = res?.data;
      // this.table["response"] = participatedULBRes.data;
      this.selectedStateName = res?.data?.state?.name;
      this.isLoadingResults = false;
    },
      (error) => {
        console.log('participated-state table error', error);
        this.isLoadingResults = false;
      }
    );

  }

  // for all filters
  getFilters() {
    this.fiscalRankingService.callGetMethod('scoring-fr/filters', null).subscribe((res: any) => {
      // console.log('scoring-fr/participated-state-filter', res);
      const filter: Filter = res?.data;
      this.populationCategoryFilter = filter?.populationBucketFilter;
      this.ulbParticipationFilter = filter?.ulbParticipationFilter;
      this.ulbRankingStatusFilter = filter?.ulbRankingStatusFilter;

    },
      (error) => {
        Swal.fire('Error', error?.message ?? 'Something went wrong', 'error');
      }
    )
  }

  onUpdate(table: Table, event: any) {
    this.getTableData(table, event?.queryParams);
  }
}
