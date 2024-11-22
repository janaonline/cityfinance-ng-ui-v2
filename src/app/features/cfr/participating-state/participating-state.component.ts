import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { ColorDetails, IndiaMapComponent } from '../india-map/india-map.component';
import { MatCommonTableComponent } from '../mat-common-table/mat-common-table.component';
import { Table } from '../services/common-table.interface';
import { FiscalRankingService, FrFilter } from '../services/fiscal-ranking.service';
// import { StatewiseMapComponent } from "../statewise-map/statewise-map.component";
import { MapStateRankComponent } from "../map-state-rank/map-state-rank.component";

@Component({
  selector: 'app-participating-state',
  templateUrl: './participating-state.component.html',
  styleUrls: ['./participating-state.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    IndiaMapComponent,
    MatCommonTableComponent,
    PreLoaderComponent,
    // StatewiseMapComponent,
    MapStateRankComponent
  ],
})
export class ParticipatingStateComponent implements OnInit {
  stateType: string = 'All';
  ulbParticipation: string = 'All';
  ulbRankingStatus: string = 'All';
  table = {} as Table;
  isLoadingResults: boolean = false;
  skip: number = 0;
  limit: number = 40;
  colorCoding: any[] = [];

  constructor(private fiscalRankingService: FiscalRankingService) {
    this.getFilters();
  }

  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/cfr/home',
    },
    {
      label: 'Participated States and UT ',
      url: '/cfr/participated-states-ut',
      class: 'disabled',
    },
  ];

  stateTypeFilter: FrFilter[] = [
    {
      label: 'All',
      id: '1',
      key: 'all',
      value: 'all',
    },
    {
      label: 'Large state',
      id: '2',
      key: 'largeState',
      value: 'Large',
    },
    {
      label: 'Small state',
      id: '3',
      key: 'smallState',
      value: 'Small',
    },
    {
      label: 'Union territory',
      id: '4',
      key: 'unionTerritory',
      value: 'UT',
    },
  ];
  ulbParticipationFilter: FrFilter[] = [
    {
      label: 'All',
      id: '1',
      key: 'all',
      value: 'all',
    },
    {
      label: 'Participated',
      id: '2',
      key: 'participated',
      value: 'participated',
    },
    {
      label: 'Non Participated',
      id: '3',
      key: 'nonParticipated',
      value: 'nonParticipated',
    },
  ];
  ulbRankingStatusFilter: FrFilter[] = [
    {
      label: 'All',
      id: '1',
      key: 'all',
      value: 'all',
    },
    {
      label: 'Ranked',
      id: '2',
      key: 'ranked',
      value: 'ranked',
    },
    {
      label: 'Non Ranked',
      id: '3',
      key: 'nonRanked',
      value: 'nonRanked',
    },
  ];

  colorDetails: ColorDetails[] = [
    { color: '#06668F', text: '76%-100%', min: 76, max: 100 },
    { color: '#0B8CC3', text: '51%-75%', min: 51, max: 75 },
    { color: '#73BFE0', text: '26%-50%', min: 26, max: 50 },
    { color: '#BCE2F2', text: '1%-25%', min: 1, max: 25 },
    { color: '#E5E5E5', text: '0%', min: 0, max: 0 },
  ];

  ngOnInit(): void {
    this.getTableData(this.table, '');
  }
  dropDownValueChanges(e: any) {
    this.getTableData(this.table, '');
  }
  // ulbParticipationChange(e) {
  //   this.getTableData();

  // }
  // ulbRankingStatusFilterChange(e) {
  //   this.getTableData();
  // }

  pageChange(event: any) {
    this.limit = event.pageSize;
    this.skip = event.pageIndex * event.pageSize;
    this.getTableData(this.table, '');
  }

  getTableData(table: Table, queryParams: string) {
    this.colorCoding = [];
    this.isLoadingResults = true;
    const filterObj = {
      stateType: this.stateType,
      ulbParticipationFilter: this.ulbParticipation,
      ulbRankingStatusFilter: this.ulbRankingStatus,
      skip: this.skip,
      limit: this.limit,
    };
    const endpoint = `scoring-fr/participated-state`;
    this.fiscalRankingService
      .getTableResponse(
        endpoint,
        queryParams,
        table?.response?.columns,
        'data.tableData',
        filterObj,
      )
      .subscribe({
        next: (res: any) => {
          this.table['response'] = res?.data?.tableData;
          this.colorCoding = res?.data?.mapData;
          this.isLoadingResults = false;
        },
        error: (error) => {
          // console.error('participated-state table error', error);
          this.isLoadingResults = false;
        },
      });
  }

  // reset all filter
  resetFilter() {
    // this.stateType = this.stateTypeFilter[0]?.value;
    // this.ulbParticipation = this.ulbParticipationFilter[0]?.value;
    // this.ulbRankingStatus = this.ulbRankingStatusFilter[0]?.value;
    this.getTableData(this.table, '');
  }

  // for all filters

  getFilters() {
    this.fiscalRankingService.callGetMethod('scoring-fr/filters', null).subscribe(
      (res: any) => {
        // console.log('scoring-fr/participated-state-filter', res);
        // const filter: Filter = res?.data;
        // this.stateTypeFilter = filter?.stateTypeFilter;
        // this.ulbParticipationFilter = filter?.ulbParticipationFilter;
        // this.ulbRankingStatusFilter = filter?.ulbRankingStatusFilter;
      },
      (error) => {
        Swal.fire('Error', error?.message ?? 'Something went wrong', 'error');
      },
    );
  }

  onUpdate(table: Table, event: any) {
    this.getTableData(table, event?.queryParams);
  }

  updateSorting() { }
}
