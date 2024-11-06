import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { AuthService } from '../../../core/services/auth.service';
import { UserUtility } from '../../../core/util/user/user';
import { MaterialModule } from '../../../material.module';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { CommonTableComponent } from '../common-table/common-table.component';
import { IndiaMapComponent, Marker } from '../india-map/india-map.component';
import { MatCommonTableComponent } from '../mat-common-table/mat-common-table.component';
import { FiscalRankingService, Table } from '../services/fiscal-ranking.service';
import { StatewiseMapComponent } from '../statewise-map/statewise-map.component';
import { SearchPopupComponent } from '../ulb-details/search-popup/search-popup.component';

@Component({
  selector: 'app-top-rankings',
  templateUrl: './top-rankings.component.html',
  styleUrls: ['./top-rankings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    BreadcrumbComponent,
    AngularMultiSelectModule,
    CommonTableComponent,
    IndiaMapComponent,
    MatCommonTableComponent,
    StatewiseMapComponent,
    PreLoaderComponent,
    LoaderComponent,
  ],
})
export class TopRankingsComponent implements OnInit {
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  userRole: string = this.loggedInUserDetails.role;
  isLoggedIn: boolean = false;
  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/cfr/home',
    },
    {
      label: 'Top rankings',
      url: '/cfr/top-rankings',
      class: 'disabled',
    },
  ];
  markers: Marker[] = [];
  types = [
    {
      key: 'overAllRank',
      label: 'Overall',
    },
    {
      key: 'resourceMobilizationRank',
      label: 'Resource Mobilization',
    },
    {
      key: 'expenditurePerformanceRank',
      label: 'Expenditure Performance',
    },
    {
      key: 'fiscalGovernanceRank',
      label: 'Fiscal Governance',
    },
  ];

  filter: FormGroup;
  table: Table = {
    response: null,
  };
  selectedMap: string = 'topUlbs'; // Initialize to default value
  stateList = [];
  populationCategories = [
    { _id: '1', name: '4M+' },
    { _id: '2', name: '1M to 4M' },
    { _id: '3', name: '100K to 1M' },
    { _id: '4', name: '<100K' },
  ];
  dropdownSettings = {
    singleSelection: true,
    text: 'India',
    enableSearchFilter: true,
    labelKey: 'name',
    primaryKey: '_id',
    showCheckbox: false,
    classes: 'homepage-stateList custom-class',
  };

  isLoadingResults: boolean = false;
  limit: number = 10;
  skip: number = 0;

  constructor(
    private authService: AuthService,
    private matDialog: MatDialog,
    private fiscalRankingService: FiscalRankingService,
    private fb: FormBuilder,
  ) {
    this.isLoggedIn = this.authService.loggedIn();

    this.filter = this.fb.group({
      populationBucket: '1',
      stateData: [''],
      state: '',
      category: 'overAllRank',
      limit: this.limit,
      skip: this.skip,
    });

    this.filter.get('stateData')?.valueChanges.subscribe((value) => {
      this.table.response = null;
      this.filter.patchValue({ state: value?.[0]?._id || '' }, { emitEvent: false });
    });
    this.filter.get('category')?.valueChanges.subscribe(() => {
      this.table.response = null;
    });
    this.filter.valueChanges.subscribe(() => this.loadData());
  }

  ngOnInit(): void {
    this.loadStates();
    this.loadData();
  }

  get params() {
    const params = this.filter.value;
    delete params.stateData;
    return params;
  }

  get footnote() {
    if (this.filter.value?.populationBucket == '1') {
      return 'Note: These are the ULBs that submitted their records to complete the ranking.';
    }
    return '';
  }

  pageChange(event: any) {
    // console.log("event ~~~~~>", event);
    this.params.limit = event.pageSize;
    this.params.skip = event.pageIndex * event.pageSize;
    this.loadData();
  }

  loadData() {
    // this.loadTopRankedStatesMap();
    this.loadTopRankedUlbs(this.table, '');
  }

  loadTopRankedUlbs(table: Table, queryParams: string = '') {
    this.isLoadingResults = true;
    this.fiscalRankingService
      .topRankedUlbs(queryParams, table?.response?.columns, this.params)
      .subscribe({
        next: (res: any) => {
          // console.log("api Response --->", res.tableData)
          this.table.response = res.tableData;
          if (this.table.response) this.table.response.total = res.total;
          this.markers = res.mapDataTopUlbs;
          this.isLoadingResults = false;
        },
        error: (error) => {
          console.error('Error in loading top ranked ulbs: ', error);
          this.isLoadingResults = false;
        },
      });
  }

  onUpdate(table: any, event: any) {
    this.loadTopRankedUlbs(table, event?.queryParams);
  }

  loadStates() {
    this.fiscalRankingService.states().subscribe((res: any) => {
      this.stateList = res.data;
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

  downloadRankings() {
    this.isLoadingResults = true;
    this.fiscalRankingService.downloadRankings().subscribe({
      next: (blob) => {
        this.fiscalRankingService.downloadFile(
          blob,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'CFR_Top_Ranked_Ulbs.xlsx',
        );
        this.isLoadingResults = false;
      },
      error: (error) => {
        console.error('Failed to download: ', error);
        this.isLoadingResults = false;
      },
    });
  }
}
