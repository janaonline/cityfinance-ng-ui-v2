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
import { Marker } from '../map-state-rank/map-state-rank.component';
import { MatCommonTableComponent } from '../mat-common-table/mat-common-table.component';
import { Table, TableResponse } from '../services/common-table.interface';
import { FiscalRankingService } from '../services/fiscal-ranking.service';
// import { StatewiseMapComponent } from '../statewise-map/statewise-map.component';
import { SearchPopupComponent } from '../ulb-details/search-popup/search-popup.component';
import { MapStateRankComponent } from "../map-state-rank/map-state-rank.component";


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
    MatCommonTableComponent,
    // StatewiseMapComponent,
    PreLoaderComponent,
    LoaderComponent,
    MapStateRankComponent
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
    response: {} as TableResponse,
  };
  selectedMap: string = 'topUlbs'; // Initialize to default value
  stateList: { _id: string, name: string }[] = [];
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
  params: any;

  constructor(
    private authService: AuthService,
    private matDialog: MatDialog,
    private fiscalRankingService: FiscalRankingService,
    private fb: FormBuilder,
  ) {
    this.isLoggedIn = this.authService.loggedIn();

    this.filter = this.fb.group({
      populationBucket: '1',
      state: '',
      category: 'overAllRank',
    });


  }

  ngOnInit(): void {

    this.filter.valueChanges.subscribe(() => {
      this.skip = 0;
      this.loadTopRankedUlbs();
    });

    this.loadStates();
    this.loadTopRankedUlbs();
  }

  pageChange(event: any) {
    this.limit = event.pageSize;
    this.skip = event.pageIndex;
    this.loadTopRankedUlbs();
  }

  loadTopRankedUlbs() {
    this.isLoadingResults = true;
    const pageParams = {
      skip: this.skip * this.limit,
      limit: this.limit,
    }
    const params = { ...this.filter.value, ...pageParams };

    this.fiscalRankingService
      .topRankedUlbs(params)
      .subscribe({
        next: (res: any) => {
          // console.log("res--->", res)
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

  loadStates() {
    this.fiscalRankingService.states().subscribe((res: any) => {
      this.stateList = res.data;
    });
  }

  resetFilter() {
    this.filter.patchValue({ state: "" });
    this.filter.patchValue({ populationBucket: "1" });
    this.filter.patchValue({ category: "overAllRank" });
    this.loadTopRankedUlbs();
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
