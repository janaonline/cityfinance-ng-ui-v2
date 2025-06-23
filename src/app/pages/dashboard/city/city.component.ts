import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../core/services/common.service';
import { MapComponent } from '../../../shared/components/map/map.component';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import { CitySearchComponent } from '../../../shared/components/shared-ui/city-search.component';
import { GridViewComponent } from '../../../shared/components/shared-ui/grid-view.component';
import { StateSearchComponent } from '../../../shared/components/shared-ui/state-search.component';
import { ExploresectionTable, States, Ulbs } from '../../home/dashboard-map-section/interfaces';
import { DashboardService } from '../dashboard.service';
import { InfoCardsComponent } from '../shared/components/info-cards.component';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [
    CommonModule,
    StateSearchComponent,
    MapComponent,
    MatTooltipModule,
    InfoCardsComponent,
    GridViewComponent,
    CitySearchComponent,
    PreLoaderComponent,
  ],
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss',
})
export class CityComponent implements OnInit {
  // Reactive Signals for stateId and cityName
  selectedStateIdSignal = signal<string>(''); // For city search - 5dcf9d7316a06aed41c748ec
  selectedStateNameSignal = signal<string>(''); // For state search - Karnataka
  stateCode: string = ''; // KA

  selectedCityNameSignal = signal<string>(''); // Bruhat Bengaluru Mahanagara Palike
  ulbId: string = ''; // 5f5610b3aab0f778b2d2cac0

  exploreData!: ExploresectionTable[];
  popCat: string = '';
  lastModifiedAt: string | null = null;

  // Money info cards.
  moneyInfoSignal = signal<ExploresectionTable[]>([]);
  yearSignal = signal<string>('2021-22');
  audit_status: string = '';

  isLoading1: boolean = true;
  isLoading2: boolean = true;

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
      if (cityId) {
        this.ulbId = cityId;
        this.getCityDetails();
        this.getMoneyInfo();
      }
    });
  }

  // ----- Search Section -----
  // Callback: From child when state is selected
  onStateSelected = (stateObj: States): void => {
    console.log('Value of state sent by child to parent', stateObj);
    this.setCityName('');
    this.setStateData(stateObj.name, stateObj._id, stateObj.code);
  };

  // Callback: From child when ULB/city is selected
  onUlbSelected = (ulbObj: Ulbs): void => {
    console.log('Value of ULB sent by child to parent:', ulbObj);
    if (ulbObj._id) this.updateUlbIdAndNavigate(ulbObj._id);
  };

  // Helper: Set state ID signal
  setStateData(name: string, _id: string, code: string): void {
    this.selectedStateNameSignal.set(name);
    this.selectedStateIdSignal.set(_id);
    this.stateCode = code;
  }

  // Helper: Set city/ULB name signal
  setCityName(ulbName: string): void {
    this.selectedCityNameSignal.set(ulbName);
  }

  // ----- Map Section -----
  public selectedCityIdChange($event: string): void {
    // this.ulbId = $event;
    if ($event) this.updateUlbIdAndNavigate($event);
    console.log('ulbIdChange from map', this.ulbId, $event);
  }

  // ----- Get necessary data -----
  private getCityDetails(): void {
    this.isLoading1 = true;
    this._commonService
      .getCityData(this.ulbId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log(res);
          this.exploreData = res.gridDetails;
          this.popCat = res.popCat;
          this.lastModifiedAt = res.lastModifiedAt;

          this.setStateData(res.state.name, res.state._id, res.state.code);
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
      .getMoneyInfo(this.yearSignal(), this.selectedStateIdSignal(), this.ulbId)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.audit_status = res.audit_status === 'Audited' ? 'Audited' : 'Provisional';
          this.moneyInfoSignal.set(res.result);
          this.isLoading2 = false;
        },
        error: (error) => console.error('Error in fetching money info: ', error),
      });
  }

  ngDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
