import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from 'rxjs';
import { InrCurrencyPipe } from '../../../core/directives/inr-currency.pipe';
import { AssetsService } from '../../../core/services/assets/assets.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonService } from '../../../core/services/common.service';
import { MaterialModule } from '../../../material.module';
import { MapComponent } from '../../../shared/components/map/map.component';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import {
  BondIssuances,
  CreditRatingMap,
  CreditRatings,
  LastModifiedAt,
  States,
  Ulbs,
} from './interfaces';

@Component({
  selector: 'app-dashboard-map-section',
  imports: [MaterialModule, InrCurrencyPipe, PreLoaderComponent, MapComponent],
  templateUrl: './dashboard-map-section.component.html',
  styleUrl: './dashboard-map-section.component.scss',
})
export class DashboardMapSectionComponent implements OnDestroy, OnInit {
  @ViewChild('map') mapComponent!: MapComponent;

  myForm!: FormGroup;

  selectedStateCode: string = '';
  selectedStateId: string = '';
  selectedStateName: string = '';
  stateList!: States[];
  filteredStates: Observable<any[]> = of([]);

  selectedCityName = '';
  selectedCityId: string = '';
  cityData: any = [];
  filteredUlbs!: Observable<any[]>;

  creditRating: CreditRatingMap = {};
  totalCreditRating: number = 0;
  cr_above_BBB_minus: number = 0;

  lastModifiedDate: string | null = '';

  bondIssuances: BondIssuances = {
    bondIssueAmount: 0,
    totalMunicipalBonds: 0,
    inProgress: true,
  };
  private readonly ELIGIBLE_RATINGS = [
    'A',
    'A+',
    'AA',
    'AA+',
    'AA-',
    'AAA',
    'AAA+',
    'AAA-',
    'A-',
    'BBB',
    'BBB+',
    'BBB-',
  ];
  financialYearTexts = {
    startYear: '2015-16',
    endYear: '2022-23',
  };
  private destroy$ = new Subject<void>();

  constructor(
    protected _commonService: CommonService,
    private fb: FormBuilder,
    private assetService: AssetsService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initializeform();
    this.fetchCreditRatingsData();
    this.searchUlb();
    this.fetchStateList();
    this.fetchMinMaxFinancialYears();
    this.loadData();
  }

  private loadData(): void {
    this.fetchLastUpdatedDate();
    this.fetchBondIssuances();
    this.updateUlbsOfSelectedState();
    this.updateRatingSummary();
    this.fetchDataForVisualization();
  }

  private initializeform() {
    this.myForm = this.fb.group({
      stateName: [''],
      ulbName: [''],
    });
  }

  // Get municipal bonds data.
  private fetchBondIssuances(): void {
    this._commonService
      .getBondIssuerItemAmount(this.selectedStateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: BondIssuances) => (this.bondIssuances = { ...res, inProgress: false }),
        error: (error) => console.error('Error in fetching bonds data: ', error),
        complete: () => (this.bondIssuances['inProgress'] = false),
      });
  }

  // Get credit rating data.
  private fetchCreditRatingsData(): void {
    this.assetService
      .fetchCreditRatingReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: CreditRatings[]) => {
          const computedData = this.computeRatings(res);
          this.creditRating = computedData;
          this.updateRatingSummary();
        },
        error: (error) => console.error('Error fetching credit rating report:', error),
      });
  }

  // Compute total, creditRatingAboveBBB_Minus count.
  private computeRatings(res: CreditRatings[]): CreditRatingMap {
    const computedData: CreditRatingMap = { India: { total: 0, creditRatingAboveBBB_Minus: 0 } };

    for (const data of res) {
      const stateName = data.state;
      const rating = data.creditrating;

      if (!computedData[stateName]) {
        computedData[stateName] = { total: 0, creditRatingAboveBBB_Minus: 0 };
      }

      computedData[stateName]['total'] += 1;
      computedData['India']['total'] += 1;

      if (this.ELIGIBLE_RATINGS.includes(rating)) {
        computedData[stateName]['creditRatingAboveBBB_Minus'] += 1;
        computedData['India']['creditRatingAboveBBB_Minus'] += 1;
      }
    }

    return computedData;
  }

  // Update credit ratings summary.
  private updateRatingSummary(): void {
    const selected = this.selectedStateName || 'India';
    const ratingData = this.creditRating[selected] || { total: 0, creditRatingAboveBBB_Minus: 0 };

    this.totalCreditRating = ratingData['total'];
    this.cr_above_BBB_minus = ratingData['creditRatingAboveBBB_Minus'];
  }

  // Get start and end year - ledgers.
  private fetchMinMaxFinancialYears() {
    this._commonService
      .getFinancialYearBasedOnData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: { data: string[] }) => {
          const years = res?.['data'] || [];
          if (years.length) {
            this.financialYearTexts['startYear'] = years[years.length - 1];
            this.financialYearTexts['endYear'] = years[0];
          }
        },
        error: (error) => console.error('Failed to get years: ', error),
      });
  }

  get stateIdControl(): FormControl {
    return this.myForm.get('stateName') as FormControl;
  }

  // Get states list.
  private fetchStateList() {
    this._commonService
      .fetchStateList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: States[]) => {
          this.stateList = res;

          this.filteredStates = this.stateIdControl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            map((value) => this._filterStates(value || '')),
          );
        },
      });
  }

  // Helper: To filter states.
  private _filterStates(value: string): States[] {
    const filterValue = value?.toLowerCase();
    return !filterValue
      ? this.stateList
      : this.stateList?.filter((option) => option.name?.toLowerCase().includes(filterValue));
  }

  // Last modfied date from ledger.
  private fetchLastUpdatedDate() {
    this._commonService
      .fetchLastUpdatedDate(this.selectedStateCode, this.selectedCityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: LastModifiedAt) => (this.lastModifiedDate = res['lastModifiedAt']),
        error: (error) => console.error('Failed to fetch last modified date', error),
      });
  }

  // Global search feature.
  private searchUlb(): void {
    this.myForm
      .get('ulbName')
      ?.valueChanges?.pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          if (!value) {
            this.noDataFound = false;
            return of([]);
          }

          return this._commonService.postGlobalSearchData(value, 'ulb', this.selectedStateId);
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.filteredUlbs = of(res?.['data']);
          this.noDataFound = res?.['data']?.length === 0;
        },
        error: (error) => {
          console.error('Error in fetching ulbs: ', error);
        },
      });
  }

  // Get all the ulbs for selected state.
  updateUlbsOfSelectedState(): void {
    if (this.selectedStateCode) {
      this._commonService
        .getUlbByState(this.selectedStateCode)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            const ulbsData = res;
            this.cityData = ulbsData?.data?.ulbs;
          },
          error: (error) => console.error('Failed to fetch ulbs: ', error),
        });
    }
  }

  // Update data when state is changed from map.
  selectedStateCodeChange(stateCode: string) {
    const stateData = this.stateList.find((ele) => ele.code === stateCode);
    if (stateData) {
      this.onSelectingStateFromDropDown(stateData);
    }
  }

  // Action when state is selected from drop down.
  onSelectingStateFromDropDown(state: any | null) {
    // console.log('state: ', state);
    this.selectedStateName = state.name || 'India';
    this.selectedStateCode = state.code;
    this.selectedStateId = state._id;
    this.selectedCityName = '';
    this.selectedCityId = '';
    this.stateDim = false;
    this.myForm?.get('stateName')?.setValue(state.name || '');
    this.loadData();
  }

  // Update data when ulb is changed from map.
  selectedCityIdChange(ulbId: string): void {
    const ulbData = this.cityData?.find((e: { _id: string }) => e?._id === ulbId);
    this.myForm.get('ulbName')?.setValue(ulbData?.name);
    this.onSelectingCityFromDropDown(ulbData?.code || '');
  }

  // Get ulb data.
  onSelectingCityFromDropDown(city: string) {
    const filterCity: Ulbs = this.cityData.find((e: Ulbs) => {
      return e.code == city;
    });
    this.selectedCityId = filterCity._id;
    this.selectedCityName = filterCity.name;
    this.stateDim = true;
    this.fetchUlbData();
  }

  // When ulb is selected get ULB data.
  private fetchUlbData(): void {
    if (this.selectedCityId) {
      this.authService
        .getCityData(this.selectedCityId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: { [x: string]: any }) => {
            this.cityInfo = res['data'];
          },
          error: (error) => console.error('Error in fetching ulbData: ', error),
        });
    }
  }

  // View state/ city dashboard.
  public viewDashboard(key: string): void {
    if (key === 'state')
      this.router.navigateByUrl(`/dashboard/state?stateId=${this.selectedStateId}`);
    else if (key === 'city')
      this.router.navigateByUrl(`/dashboard/city?cityId=${this.selectedCityId}`);
  }

  // Reset map to india.
  public resetMap(): void {
    this.mapComponent?.resetMap();
    this.myForm.get('ulbName')?.setValue('');
    this.onSelectingStateFromDropDown({ _id: '', name: '' });
  }

  // Unsubscribe.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ngOnDestroy(): void {
  //   this.homePageSubscription?.unsubscribe();
  // }
  // stateId: string = '';
  dataForVisualization: {
    financialStatements?: number;
    totalMunicipalBonds?: number;
    totalULB?: number;
    coveredUlbCount?: number;
    ulbDataCount?: any;
    loading: boolean;
  } = { loading: true };

  highestYear: any;
  highestDataAvailability: any;
  dataAvailTooltip = '';
  private homePageSubscription!: Subscription;

  noDataFound = true;

  stateDim = false;
  stateLevelData() {
    this.stateDim = false;
  }
  cityInfo: any;
  cityLevelData() {
    this.stateDim = true;
  }

  private fetchDataForVisualization() {
    this.dataForVisualization.loading = true;
    this.homePageSubscription?.unsubscribe();
    this.homePageSubscription = this._commonService
      .fetchDataForHomepageMap(this.selectedStateId)
      .subscribe(
        (res: {
          financialStatements?: number;
          totalMunicipalBonds?: number;
          totalULB?: number;
          coveredUlbCount?: number;
          ulbDataCount?: any;
          loading: boolean;
        }) => {
          this.dataForVisualization = { ...res, loading: false };
          if (!this.selectedStateId) {
            this._commonService.setDataForVisualizationCount(this.dataForVisualization);
          }
          this.highestYear = null;
          this.highestDataAvailability = null;
          if (this.dataForVisualization?.ulbDataCount?.length > 0) {
            this.dataForVisualization.ulbDataCount = this.dataForVisualization?.ulbDataCount?.sort(
              (a: { year: string }, b: { year: string }) =>
                +a?.year.split('-')[0] - +b?.year.split('-')[0],
            );
            const ublsArray = this.dataForVisualization?.ulbDataCount;
            let highestData = -1;
            for (const item of ublsArray) {
              if (item.ulbs > highestData) {
                highestData = item?.ulbs;
                this.highestYear = item?.year;
              }
            }
            this.highestDataAvailability = (
              (+highestData / +Number(this.dataForVisualization?.totalULB)) *
              100
            ).toFixed(0);
          }
          this.dataAvailTooltip = '';
          this.dataForVisualization?.ulbDataCount?.forEach((element: { year: any; ulbs: any }) => {
            this.dataAvailTooltip = this.dataAvailTooltip + `${element.year} : ${element.ulbs} \n `;
          });
        },
      );
  }
}
