import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { ColorDetails, IndiaMapComponent } from '../../india-map/india-map.component';
import { MatCommonTableComponent } from '../../mat-common-table/mat-common-table.component';
import { FiscalRankingService, Table } from '../../services/fiscal-ranking.service';
import { StatewiseMapComponent } from '../../statewise-map/statewise-map.component';

@Component({
  selector: 'app-ulbs-in-india',
  templateUrl: './ulbs-in-india.component.html',
  styleUrls: ['./ulbs-in-india.component.scss'],
  standalone: true,
  imports: [CommonModule, PreLoaderComponent, IndiaMapComponent, MatCommonTableComponent,
    RouterModule, StatewiseMapComponent]

})
export class UlbsInIndiaComponent implements OnInit {

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

  constructor(private fiscalRankingService: FiscalRankingService,) { }


  ngOnInit(): void {
    //  this.getStateWiseForm();
    this.getStateData();
    // this.ulbResponse = responseJson; // TODO: get response from api - Done in ngOnChange
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
    this.fiscalRankingService
      .getApiResponse(
        endpoint,
        queryParams,
      )
      .subscribe({
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
}
