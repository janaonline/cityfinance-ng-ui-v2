import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { ExploresectionTable } from '../../../core/models/interfaces';
import { IState } from '../../../core/models/state/state';
import { IULB } from '../../../core/models/ulb';
import { CommonService } from '../../../core/services/common.service';
import { MapComponent } from '../../../shared/components/map/map.component';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import { CitySearchComponent } from '../../../shared/components/shared-ui/city-search.component';
import { GridViewComponent } from '../../../shared/components/shared-ui/grid-view.component';
import { StateSearchComponent } from '../../../shared/components/shared-ui/state-search.component';
import { DashboardService } from '../dashboard.service';
import { InfoCardsComponent } from '../shared/components/info-cards.component';
import { BalancesheetIncomestatementComponent } from './balancesheet-incomestatement/balancesheet-incomestatement.component';
import { BorrowingCreditRatingComponent } from './borrowing-credit-rating/borrowing-credit-rating.component';
import { FinancialIndicatorComponent } from './financial-indicator/financial-indicator.component';
import { SlbComponent } from './slb/slb.component';
Chart.register(...registerables);
@Component({
  selector: 'app-city',
  standalone: true,
  imports: [
    CommonModule,
    StateSearchComponent,
    MapComponent,
    MatTabsModule,
    MatTooltipModule,
    InfoCardsComponent,
    GridViewComponent,
    CitySearchComponent,
    PreLoaderComponent,
    BorrowingCreditRatingComponent,
    SlbComponent,
    BalancesheetIncomestatementComponent,
    FinancialIndicatorComponent,
  ],
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss',
  // encapsulation: ViewEncapsulation.None
})
export class CityComponent implements OnInit {
  // Reactive Signals for stateId and cityName
  selectedStateIdSignal = signal<string>(''); // For city search - 5dcf9d7316a06aed41c748ec
  selectedStateNameSignal = signal<string>(''); // For state search - Karnataka
  stateCodeSignal = signal<string>('');

  selectedCityNameSignal = signal<string>(''); // Bruhat Bengaluru Mahanagara Palike
  ulbIdSignal = signal<string>(''); // 5f5610b3aab0f778b2d2cac0

  exploreData!: ExploresectionTable[];
  popCat: string = '';
  lastModifiedAt: string | null = null;

  // Money info cards.
  moneyInfoSignal = signal<ExploresectionTable[]>([]);
  yearSignal = signal<string>('');
  audit_status: string = '';
  isActive: boolean = true;
  // years: string[] = [];
  yearsSignal = signal<string[]>([]);

  isLoading1: boolean = true;
  isLoading2: boolean = true;

  loadedTabs: boolean[] = [true, false, false, false];

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _commonService: CommonService,
    private _dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const cityId = params.get('cityId') || '';
      this.yearSignal.set('');
      if (cityId) {
        // this.ulbId = cityId;
        this.ulbIdSignal.set(cityId);
        this.getDistinctYearsList();
        this.getCityDetails();
        // this.getMoneyInfo();
      }
    });
  }

  // ----- Search Section -----
  // Callback: From child when state is selected
  onStateSelected = (stateObj: IState): void => {
    console.log('Value of state sent by child to parent', stateObj);
    this.setCityName('');
    this.setStateData(stateObj.name, stateObj._id, stateObj.code);
  };

  // Callback: From child when ULB/city is selected
  onUlbSelected = (ulbObj: IULB): void => {
    console.log('Value of ULB sent by child to parent:', ulbObj);
    if (ulbObj._id) this.updateUlbIdAndNavigate(ulbObj._id);
  };

  // Helper: Set state ID signal
  setStateData(name: string = '', _id: string = '', code: string = ''): void {
    this.selectedStateNameSignal.set(name);
    this.selectedStateIdSignal.set(_id);
    this.stateCodeSignal.set(code);
  }

  // Helper: Set city/ULB name signal
  setCityName(ulbName: string): void {
    this.selectedCityNameSignal.set(ulbName);
  }

  // ----- Map Section -----
  public selectedCityIdChange($event: string): void {
    // this.ulbId = $event;
    if ($event) this.updateUlbIdAndNavigate($event);
    console.log('ulbIdChange from map', this.ulbIdSignal(), $event);
  }

  // ----- Get necessary data -----
  private getCityDetails(): void {
    this.isLoading1 = true;
    this._commonService
      .getCityData(this.ulbIdSignal())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // console.log(res);
          this.exploreData = res.gridDetails;
          this.popCat = res.popCat;
          // this.lastModifiedAt = res.lastModifiedAt;

          this.setStateData(res.state.name, res.state._id, res.state.code || '');
          this.setCityName(res.ulbName);
          this.isLoading1 = false;
        },
        error: (error) => {
          this.isLoading2 = false;
          console.error('Error in fetching city details', error);
        },
      });
  }

  // Navigate to other ulb.
  private updateUlbIdAndNavigate(newUlbId: string): void {
    this.router.navigate(['/dashboard/city', newUlbId]);
  }

  // ----- Get money info -----
  private getMoneyInfo(): void {
    this.isLoading2 = true;
    this._dashboardService.getMoneyInfo(this.yearSignal(), '', this.ulbIdSignal()).subscribe({
      next: (res) => {
        console.log('Money info cards: ', res);
        this.audit_status = res.audit_status === 'Audited' ? 'Audited' : 'Provisional';
        this.isActive = res.isActive;
        this.moneyInfoSignal.set(res.result);
        this.lastModifiedAt = res.lastModifiedAt;
        this.isLoading2 = false;
      },
      error: (error) => console.error('Error in fetching money info: ', error),
    });
  }

  readonly moneyInfoYearChange = effect(() => {
    if (this.yearSignal()) this.getMoneyInfo();
  });

  // Drop down selection.
  public onMoneyInfoYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.yearSignal() !== yearSelected) this.yearSignal.set(yearSelected);
  }

  // Get distinct years list.
  private getDistinctYearsList(): void {
    this._commonService.getLedgerYears('', this.ulbIdSignal()).subscribe({
      next: (res) => {
        console.log('Ledger years: ', res.ledgerYears);
        this.yearsSignal.set(res.ledgerYears);
        this.yearSignal.set(this.yearsSignal()?.[0]);
      },
      error: (error) => console.error('Failed to fetch years list: getDistinctYearsList()', error),
    });
  }

  // On tab changes call the chid components.
  public onTabChange(idx: number): void {
    this.loadedTabs[idx] = true;
  }

  // // Chart.js Sample.
  // @ViewChild('barCanvas') barCanvas!: ElementRef;
  // @ViewChild('lineCanvas') lineCanvas!: ElementRef;
  // @ViewChild('pieCanvas') pieCanvas!: ElementRef;
  // @ViewChild('mixedChartCanvas') mixedChartCanvas!: ElementRef;

  // ngAfterViewInit(): void {
  //   // Bar Chart
  //   new Chart(this.barCanvas.nativeElement, {
  //     type: 'bar',
  //     data: {
  //       labels: ['Own Source Revenue', 'Grants', 'Assigned Revenue'],
  //       datasets: [{
  //         label: '2023-24',
  //         data: [12, 19, 3],
  //         backgroundColor: ['#65D2F3'],
  //         borderRadius: 5,
  //       },
  //       {
  //         label: '2022-23',
  //         data: [10, 8, 6],
  //         backgroundColor: ['#1596E6'],
  //         borderRadius: 5,
  //       },
  //       {
  //         label: '2021-22',
  //         data: [12, 10, 14],
  //         backgroundColor: ['#245ABF'],
  //         borderRadius: 5,
  //       }]
  //     },
  //     options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr')
  //   });

  //   // Mixed Chart
  //   new Chart(this.mixedChartCanvas.nativeElement, {
  //     type: 'bar',
  //     data: {
  //       labels: ['Own Source Revenue', 'Grants', 'Assigned Revenue'],
  //       datasets: [
  //         {
  //           type: 'line',
  //           label: 'Y-o-Y Growth',
  //           data: [25, 45, 35, 55],
  //           borderWidth: 2,
  //           borderColor: '#f43f5e',
  //           pointBackgroundColor: '#f43f5e',
  //           fill: false,
  //           tension: 0.3,
  //         },
  //         {
  //           type: 'bar',
  //           label: 'ULB Name',
  //           data: [30, 50, 40, 60],
  //           backgroundColor: ['#1596E6'],
  //           borderRadius: 5,
  //         },
  //         {
  //           type: 'bar',
  //           label: 'State Avg',
  //           data: [12, 10, 14],
  //           backgroundColor: ['#245ABF'],
  //           borderRadius: 5,
  //         },
  //       ]
  //     },
  //     options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Revenue', 'Amt in ₹ Cr')
  //   });

  //   // Line Chart
  //   new Chart(this.lineCanvas.nativeElement, {
  //     type: 'line',
  //     data: {
  //       labels: ['Jan', 'Feb', 'Mar'],
  //       datasets: [{
  //         label: 'Dataset Label',
  //         data: [10, 15, 30],
  //         borderWidth: 2,
  //         borderColor: '#FF6384',
  //         pointBackgroundColor: '#FF6384',
  //         fill: false,
  //         tension: 0.3,
  //       }],
  //     },
  //     options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Months', 'Amt in ₹ Cr')
  //   });

  //   // Pie Chart
  //   new Chart(this.pieCanvas.nativeElement, {
  //     type: 'doughnut',
  //     data: {
  //       labels: ['Own Source Revenue', 'Grants', 'Assigned Revenue'],
  //       datasets: [{
  //         label: 'Pie Dataset',
  //         data: [30, 50, 20],
  //         backgroundColor: ['#65D2F3', '#1596E6', '#245ABF'],
  //         borderRadius: 5,
  //         borderWidth: 1,
  //       }]
  //     },
  //     options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '')
  //   });
  // }
  ngDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// // chart-config.ts
// export const DEFAULT_FONT_FAMILY = 'Montserrat';
// const TEXT_LIGHT = '#374151';
// const DEFAULT_FONT_SIZE = 11;
// export const baseChartOptions = (
//   fontFamily = 'Montserrat',
//   showAxes = true,
//   xAxisLabel = 'X Axis',
//   yAxisLabel = 'Y Axis'
// ): ChartOptions => ({
//   // responsive: true,
//   font: { family: fontFamily, size: 11 },
//   interaction: {
//     mode: 'index',
//     intersect: false
//   },
//   plugins: {
//     legend: { labels: { font: { family: fontFamily, size: 12 } } },
//     tooltip: {
//       titleFont: { family: fontFamily },
//       bodyFont: { family: fontFamily }
//     }
//   },
//   layout: { padding: 5 },
//   scales: {
//     x: {
//       display: showAxes,
//       ticks: { font: { family: fontFamily } },
//       title: {
//         display: showAxes,
//         text: xAxisLabel,
//         font: {
//           family: fontFamily,
//           size: DEFAULT_FONT_SIZE,
//           weight: 'bold'
//         },
//         color: TEXT_LIGHT
//       }
//     },
//     y: {
//       display: showAxes,
//       ticks: { font: { family: fontFamily } },
//       title: {
//         display: showAxes,
//         text: yAxisLabel,
//         font: {
//           family: fontFamily,
//           size: DEFAULT_FONT_SIZE,
//           weight: 'bold'
//         },
//         color: TEXT_LIGHT
//       }
//     }
//   }
// });
