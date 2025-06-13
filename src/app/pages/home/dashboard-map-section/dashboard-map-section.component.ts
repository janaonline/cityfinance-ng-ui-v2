import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import L from 'leaflet';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import { InrCurrencyPipe } from '../../../core/directives/inr-currency.pipe';
// import { ICreditRatingData } from '../../../core/models/creditRating/creditRatingResponse';
import { IState } from '../../../core/models/state/state';
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
// import { ReUseableHeatMapComponent } from '../../../shared/components/re-useable-heat-map/re-useable-heat-map.component';

@Component({
  selector: 'app-dashboard-map-section',
  imports: [MaterialModule, InrCurrencyPipe, PreLoaderComponent, MapComponent],
  templateUrl: './dashboard-map-section.component.html',
  styleUrl: './dashboard-map-section.component.scss',
})
export class DashboardMapSectionComponent implements OnDestroy, OnInit {
  @ViewChild('map') mapComponent!: MapComponent;

  totalCreditRating: number = 0;
  cr_above_BBB_minus: number = 0;
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
  myForm!: FormGroup;
  selectedStateCode: string = '';
  selected_state: string = '';
  stateselected!: IState;
  creditRating: any = {};
  stateList!: States[];
  filteredStates: Observable<any[]> = of([]);
  cityData: any = [];
  cityName = '';
  filteredUlbs!: Observable<any[]>;
  stateData: any;
  constructor(
    protected _commonService: CommonService,
    private fb: FormBuilder,
    private assetService: AssetsService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.fetchDataForVisualization();
  }

  ngOnInit(): void {
    this.initializeform();
    this.fetchBondIssuances();
    this.fetchCreditRatingsData();
    this.fetchMinMaxFinancialYears();
    this.fetchStateList();
    this.fetchLastUpdatedDate();
    this.searchUlb();
  }

  private initializeform() {
    this.myForm = this.fb.group({
      stateId: [''],
      ulb: [''],
    });
  }

  // Get municipal bonds data.
  private fetchBondIssuances(stateId: string = ''): void {
    this._commonService.getBondIssuerItemAmount(stateId).subscribe({
      next: (res: BondIssuances) => (this.bondIssuances = { ...res, inProgress: false }),
      error: (error) => console.error('Error in fetching bonds data: ', error),
      complete: () => (this.bondIssuances['inProgress'] = false),
    });
  }

  // Get credit rating data.
  private fetchCreditRatingsData(): void {
    this.assetService.fetchCreditRatingReport().subscribe({
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
    const selected = this.selected_state || 'India';
    const ratingData = this.creditRating[selected] || { total: 0, creditRatingAboveBBB_Minus: 0 };

    this.totalCreditRating = ratingData['total'];
    this.cr_above_BBB_minus = ratingData['creditRatingAboveBBB_Minus'];
  }

  // Get start and end year - ledgers.
  private fetchMinMaxFinancialYears() {
    this._commonService.getFinancialYearBasedOnData().subscribe({
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
    return this.myForm.get('stateId') as FormControl;
  }

  // Get states list.
  private fetchStateList() {
    this._commonService.fetchStateList().subscribe({
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
  private fetchLastUpdatedDate(stateCode: string = '', ulbId: string = '') {
    this._commonService.fetchLastUpdatedDate(stateCode, ulbId).subscribe({
      next: (res: LastModifiedAt) => (this.date = res['lastModifiedAt']),
      error: (error) => console.error('Failed to fetch last modified date', error),
    });
  }

  // Global search feature.
  private searchUlb(): void {
    this.myForm
      .get('ulb')
      ?.valueChanges?.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          if (!value) {
            this.noDataFound = false;
            return of([]);
          }

          // TODO: use stateId variable.
          const stateId = this.stateList.find(
            (e) => e?.name.toLowerCase() == this.selected_state.toLowerCase(),
          )?._id;
          return this._commonService.postGlobalSearchData(value, 'ulb', stateId);
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

  // Reset map to india.
  public resetMap(): void {
    this.mapComponent?.resetMap();
    this.onSelectingStateFromDropDown({ _id: '', name: '' });
    this.updateDropdownStateSelection({ _id: '', name: '' });
    this.myForm.get('ulb')?.setValue('');
  }

  stateId: string = '';
  dataForVisualization: {
    financialStatements?: number;
    totalMunicipalBonds?: number;
    totalULB?: number;
    coveredUlbCount?: number;
    ulbDataCount?: any;
    loading: boolean;
  } = { loading: true };
  totalUsersVisit: number = 0;

  absCreditInfo: any = {};
  isLoading: boolean = true;
  cid: string = '';
  creditRatingList!: any[];
  globalFormControl = new FormControl();

  isBondIssueAmountInProgress = false;

  date: any;
  districtMap!: L.Map;
  highestYear: any;
  highestDataAvailability: any;
  dataAvailTooltip = '';
  private homePageSubscription!: Subscription;
  ngOnDestroy(): void {
    this.homePageSubscription?.unsubscribe();
  }

  noDataFound = true;

  stateDim = false;
  stateLevelData() {
    this.stateDim = false;
  }
  cityInfo: any;
  cityLevelData() {
    this.stateDim = true;
  }

  dashboardNav(option: any) {
    this.selectCity(option);
  }

  cidChange(ulbId: string): void {
    const ulbData = this.cityData?.find((e: { _id: string }) => e?._id === ulbId);
    this.myForm.get('ulb')?.setValue(ulbData?.name);
    this.selectCity(ulbData?.code || '');
  }

  selectCity(city: string) {
    const filterCity: Ulbs = this.cityData.find((e: Ulbs) => {
      return e.code == city;
    });
    this.cityName = filterCity.name;
    this.stateDim = true;
    this.cid = filterCity._id;
    this.authService.getCityData(this.cid).subscribe((res: { [x: string]: any }) => {
      this.cityInfo = res['data'];
    });
  }
  viewDashboard() {
    const searchValue = this.stateList.find(
      (e) => e?.name.toLowerCase() == this.selected_state.toLowerCase(),
    );
    this.router.navigateByUrl(`/dashboard/state?stateId=${searchValue?._id}`);
  }
  viewCityDashboard() {
    this.router.navigateByUrl(`/dashboard/city?cityId=${this.cid}`);
  }

  selectedStateCodeChange(stateCode: string) {
    const stateData = this.stateList.find((ele) => ele.code === stateCode);
    if (stateData) {
      this.updateDropdownStateSelection(stateData);
      this.onSelectingStateFromDropDown(stateData);
    }
  }
  onSelectingStateFromDropDown(state: any | null) {
    this.selectedStateCode = state.code;
    this.cityName = '';
    this.cid = '';
    this.stateDim = false;
    this._commonService.getUlbByState(state ? state?.code : null).subscribe((res: any) => {
      const ulbsData: any = res;
      this.cityData = ulbsData?.data?.ulbs;
    });
    this.selected_state = state ? state?.name : 'India';
    if (state._id == null) this.updateDropdownStateSelection(state);
    this.fetchDataForVisualization(state ? state._id : null);
    this.fetchBondIssuances(state._id);
    this.updateRatingSummary();
    this.fetchLastUpdatedDate(this.selectedStateCode, this.cid);
  }

  private fetchDataForVisualization(stateId?: string) {
    this.dataForVisualization.loading = true;
    this.homePageSubscription?.unsubscribe();
    this.homePageSubscription = this._commonService
      .fetchDataForHomepageMap(stateId)
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
          if (!stateId) {
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

  private updateDropdownStateSelection(state: IState) {
    this.stateselected = state;
    this.myForm.controls['stateId'].setValue(state ? state.name : '');
  }

  openStateDashboard() {
    this.router.navigateByUrl(`/dashboard/state?stateCode=${this.selectedStateCode}`);
  }
}
