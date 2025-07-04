import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ExploresectionTable } from '../../../core/models/interfaces';
import { IState } from '../../../core/models/state/state';
import { IULB } from '../../../core/models/ulb';
import { CommonService } from '../../../core/services/common.service';
import { ChartConfig, ChartsComponent } from '../../../shared/components/charts/charts.component';
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
    ChartsComponent,
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
  audit_status: string = '';
  isActive: boolean = true;
  selectedLedgerYear = signal<string>('');
  ledgerYears = signal<string[]>([]);
  slbYears = signal<string[]>([]);
  borrowingYears = signal<string[]>([]);

  isLoading1: boolean = true;
  isLoading2: boolean = true;

  loadedTabs: boolean[] = [true, false, false, false];
  isSlbDisabled: boolean = true;
  isLedgerDisabled: boolean = true;
  isBorrowingDisabled: boolean = true;
  isCreditDisabled: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _commonService: CommonService,
    private _dashboardService: DashboardService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const cityId = params.get('cityId') || '';
      this.selectedLedgerYear.set('');
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
    this._dashboardService
      .getMoneyInfo(this.selectedLedgerYear(), '', this.ulbIdSignal())
      .subscribe({
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
    if (this.selectedLedgerYear()) this.getMoneyInfo();
  });

  // Drop down selection.
  public onMoneyInfoYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) this.selectedLedgerYear.set(yearSelected);
  }

  // Get distinct years list.
  private getDistinctYearsList(): void {
    // Distinct ledger years.
    this._commonService.getLedgerYears('', this.ulbIdSignal()).subscribe({
      next: (res) => {
        this.isLedgerDisabled = false;
        if (res.ledgerYears.length === 0) this.isLedgerDisabled = true;
        this.ledgerYears.set(res.ledgerYears);
        this.selectedLedgerYear.set(this.ledgerYears()?.[0]);

        console.log(
          'Ledger years: ',
          res.ledgerYears,
          res.ledgerYears.length,
          this.isLedgerDisabled,
        );
      },
      error: (error) => console.error('Failed to fetch years list: getDistinctYearsList()', error),
    });

    // Distinct slb years.
    this._commonService.slbYears(this.ulbIdSignal()).subscribe({
      next: (res) => {
        this.isSlbDisabled = false;
        if (res.slbYears.length === 0) this.isSlbDisabled = true;
        this.slbYears.set(res.slbYears);

        console.log('slb years: ', res.slbYears, res.slbYears.length, this.isSlbDisabled);
      },
      error: (error) => console.log('Failed to get slbYears: ', error),
    });

    // Distinct bonds years.
    this._commonService.borrowingYears(this.ulbIdSignal(), this.selectedStateIdSignal()).subscribe({
      next: (res) => {
        this.isBorrowingDisabled = false;
        if (res.borrowingYears.length === 0) this.isBorrowingDisabled = true;
        this.borrowingYears.set(res.borrowingYears);

        console.log(
          'bonds years: ',
          res.borrowingYears,
          res.borrowingYears.length,
          this.isBorrowingDisabled,
        );
      },
      error: (error) => console.log('Failed to get borrowingYears: ', error),
    });
  }

  // On tab changes call the chid components.
  public onTabChange(idx: number): void {
    this.loadedTabs[idx] = true;
  }

  ngDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  chartData: ChartConfig = {
    chartId: 'barChart',
    chartType: 'barChart',
    labels: ['2020-21', '2021-22', '2022-23'],
    datasets: [
      {
        label: '2023-24',
        data: [12, 19, 3],
        backgroundColor: ['#65D2F3'],
        borderRadius: 5,
      },
      {
        label: '2022-23',
        data: [10, 8, 6],
        backgroundColor: ['#1596E6'],
        borderRadius: 5,
      },
      {
        label: '2021-22',
        data: [12, 10, 14],
        backgroundColor: ['#245ABF'],
        borderRadius: 5,
      },
    ],
  };

  // // Half Donut
  // chartData: ChartConfig = {
  //   chartId: 'slb',
  //   chartType: 'gaugeChart',
  //   labels: ['Own Source Revenue'],
  //   datasets: [
  //     {
  //       label: 'Own source revenue',
  //       data: [80, 20],
  //       backgroundColor: ['#65D2F3', '#f8f9fa'],
  //       borderWidth: 1,
  //       borderRadius: 5,
  //     },
  //     {
  //       label: 'label 2',
  //       data: [40, 60],
  //       backgroundColor: ['#65D2F3', '#f8f9fa'],
  //       borderWidth: 1,
  //       borderRadius: 5,
  //     },
  //     {
  //       label: 'label 3',
  //       data: [70, 30],
  //       backgroundColor: ['#65D2F3', '#f8f9fa'],
  //       borderWidth: 1,
  //       borderRadius: 5,
  //     },
  //   ],
  //   options: gaugeChartOptions,
  // };
}

// const gaugeChartOptions: ChartOptions<'doughnut'> = {
//   circumference: 180,
//   rotation: 270,
//   cutout: '65%',
//   plugins: {
//     legend: { display: false },
//     tooltip: {
//       filter: (tooltipItem) => tooltipItem.dataIndex === 0,
//     },
//   },
// };
