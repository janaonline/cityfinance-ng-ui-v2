import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { ColorDetails, IndiaMapComponent } from '../../india-map/india-map.component';
import { MatCommonTableComponent } from '../../mat-common-table/mat-common-table.component';
import { Table } from '../../services/common-table.interface';
import { FiscalRankingService } from '../../services/fiscal-ranking.service';
// import { StatewiseMapComponent } from '../../statewise-map/statewise-map.component';
import { SearchPopupComponent } from '../../ulb-details/search-popup/search-popup.component';
import { MapStateRankComponent } from '../../map-state-rank/map-state-rank.component';
import { GoogleAnalyticsService } from '../../../../core/services/google-analytics.service';

@Component({
    selector: 'app-ulbs-in-india',
    templateUrl: './ulbs-in-india.component.html',
    styleUrls: ['./ulbs-in-india.component.scss'],
    imports: [
        CommonModule,
        PreLoaderComponent,
        IndiaMapComponent,
        MatCommonTableComponent,
        RouterModule,
        MapStateRankComponent,
    ]
})
export class UlbsInIndiaComponent implements OnInit, OnChanges {
  @Input() data: any;

  isLoadingResults: boolean = false;

  stateType: string = 'All';
  ulbParticipation: string = 'All';
  ulbRankingStatus: string = 'All';

  table: Table = {} as Table;
  skip: number = 0;
  limit: number = 100;
  colorCoding: any[] = [];

  colorDetails: ColorDetails[] = [
    { color: '#06668F', text: '76%-100%', min: 76, max: 100 },
    { color: '#0B8CC3', text: '51%-75%', min: 51, max: 75 },
    { color: '#73BFE0', text: '26%-50%', min: 26, max: 50 },
    { color: '#BCE2F2', text: '1%-25%', min: 1, max: 25 },
    { color: '#E5E5E5', text: '0%', min: 0, max: 0 },
  ];
  ulbResponse: any = {};

  constructor(
    private fiscalRankingService: FiscalRankingService,
    private matDialog: MatDialog,
    public gaService: GoogleAnalyticsService
  ) { }

  ngOnInit(): void {
    this.getStateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.data.data = changes['data'].currentValue.bucketWiseTopUlbs.bucketWiseTopUlbsArr;
      this.data.columns = changes['data'].currentValue.bucketWiseTopUlbs.columns;
    }
  }

  getStateData() {
    this.colorCoding = [];
    this.isLoadingResults = true;
    const queryParams = {
      // stateType: this.stateType,
      // ulbParticipationFilter: this.ulbParticipation,
      // ulbRankingStatusFilter: this.ulbRankingStatus,
      skip: this.skip,
      limit: this.limit,
    };
    const endpoint = `scoring-fr/participated-state`;
    this.fiscalRankingService.getApiResponse(endpoint, queryParams).subscribe({
      next: (res: any) => {
        // this.table['response'] = res?.data?.tableData;
        this.colorCoding = res?.data?.mapData;
        this.isLoadingResults = false;
      },
      error: (error: any) => {
        // console.error('participated-state table error', error);
        this.isLoadingResults = false;
      },
    });
  }

  openSearch() {
    this.matDialog.open(SearchPopupComponent, {
      width: '100vw',
      height: '100%',
      maxWidth: '100%',
      panelClass: 'search-page',
    });
  }
}
