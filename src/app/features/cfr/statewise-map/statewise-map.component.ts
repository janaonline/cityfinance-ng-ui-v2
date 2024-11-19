import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import { ColorDetails, IndiaMapComponent } from '../india-map/india-map.component';
import { FiscalRankingService } from '../services/fiscal-ranking.service';

@Component({
  selector: 'app-statewise-map',
  standalone: true,
  imports: [IndiaMapComponent, PreLoaderComponent, CommonModule],
  templateUrl: './statewise-map.component.html',
  styleUrl: './statewise-map.component.scss'
})
export class StatewiseMapComponent implements OnInit {

  @Input() data: any;
  @Input() markers: any[] = [];

  isLoadingResults: boolean = false;

  stateType: string = 'All';
  ulbParticipation: string = 'All';
  ulbRankingStatus: string = 'All';

  colorCoding: any[] = [];
  limit = 100;

  colorDetails: ColorDetails[] = [
    { color: '#06668F', text: '76%-100%', min: 75, max: 100 },
    { color: '#0B8CC3', text: '51%-75%', min: 50, max: 75 },
    { color: '#73BFE0', text: '26%-50%', min: 25, max: 50 },
    { color: '#BCE2F2', text: '1%-25%', min: 1, max: 25 },
    { color: '#E5E5E5', text: '0%', min: 0, max: 0 },
  ];
  ulbResponse: any = {};

  constructor(private fiscalRankingService: FiscalRankingService,) { }


  ngOnInit(): void {
    this.getStateData();
  }

  getStateData() {
    this.colorCoding = [];
    this.isLoadingResults = true;
    const queryParams = {
      // stateType: this.stateType,
      // ulbParticipationFilter: this.ulbParticipation,
      // ulbRankingStatusFilter: this.ulbRankingStatus,
      // skip: this.skip,
      limit: this.limit,
    };
    // const endpoint = `scoring-fr/participated-state`;
    const endpoint = `scoring-fr/participated-state-map`;
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
