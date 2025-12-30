import { Component, OnInit, signal } from '@angular/core';
// import { RouterModule } from '@angular/router';

+
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { IState } from '../../core/models/state/state';
import { AfsFilterComponent } from './afs-filter/afs-filter.component';
import { AfsTableComponent } from "./afs-table/afs-table.component";
import { AfsService, FilterValues } from './afs.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';


interface Years {
  name: string;
  _id: string;
}

interface DashboardCard {
  id: number;
  icon: string;
  title: string;
  value: string;
  class: string;
}


// interface State {
//   _id: string;
//   name: string;
// }

// interface City {
//   name: string;
//   stateId: string;
//   populationCategory: string;
// }

// interface RawRow {
//   position: number;
//   city: string;
//   stateId: string;
//   stateName: string;
//   populationCategory: string;
//   year: string;
//   docType: string;
//   docTypeLabel: string;
//   isAudited: 'audited' | 'unAudited';
// }
@Component({
  standalone: true,
  selector: 'app-afs-dashboard',
  imports: [CommonModule, FormsModule, MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    // PopulationPipe,
    AfsFilterComponent, AfsTableComponent],
  templateUrl: './afs-dashboard.component.html',
  styleUrl: './afs-dashboard.component.scss'
})
export class AfsDashboardComponent implements OnInit {
  // username = localStorage.getItem('loggedInUser') || 'User';
  // fullName = localStorage.getItem('userFullName') || '';
  // email = localStorage.getItem('userEmail') || '';
  // role = localStorage.getItem('userRole') || '';
  // lastLoginTime = localStorage.getItem('lastLoginTime') || '';

  filtersObj = signal<FilterValues>({
    docType: 'bal_sheet_schedules',
    yearId: '606aadac4dff55e6c075c507',
    auditType: 'audited',
    populationCategory: '1M-4M',
    stateId: [],
    ulbId: [],
  });


  dashboardCards: DashboardCard[] = [
    // {
    //   id: 1,
    //   icon: "bi bi-folder-check",
    //   label: "642",
    //   desc: "Files Digitized",
    //   class: "text-info",
    // },
    // {
    //   id: 2,
    //   icon: "bi bi-file-earmark-text",
    //   label: "4,550",
    //   desc: "Pages Digitized",
    //   class: "text-info",
    // },
    // {
    //   id: 3,
    //   icon: "bi bi-folder-x",
    //   label: "679",
    //   desc: "Files Failed",
    //   class: "text-danger",
    // },
    // {
    //   id: 4,
    //   icon: "bi bi-file-earmark-x",
    //   label: "679",
    //   desc: "Pages Failed",
    //   class: "text-danger",
    // },
    // {
    //   id: 5,
    //   icon: "bi bi-check-circle",
    //   label: "49%",
    //   desc: "Successful",
    //   class: "text-success",
    // },
  ];

  constructor(private afsService: AfsService) { }

  ngOnInit(): void {
    this.getDashboardCards();
  }

  getDashboardCards() {
    this.afsService.getDashboardCards().subscribe((res) => {
      console.log('dashboard stats:', res);
      this.dashboardCards = res.data.cards;
    });
  }
  onFiltersChanged(filters: FilterValues): void {
    console.log('filters received in dashboard:', filters);
    if ('citySearch' in filters) delete filters.citySearch;
    if ('stateSearch' in filters) delete filters.stateSearch;
    if (filters.populationCategory === 'All') delete filters.populationCategory;
    if (!filters.digitizationStatus) delete filters.digitizationStatus;
    this.filtersObj.set(filters)
    this.showSideBar.set(false);
    // this.getAfsList();

  }

  filters = {
    docType: 'bal_sheet_schedules',
    yearId: '606aadac4dff55e6c075c507',
    auditType: 'audited',
    states: [] as IState[],
    populationCategories: [] as string[],
    allCities: [] as any[],
    cities: [] as any[],
    years: [] as Years[],
    // documentTypes: [] as { key: string, name: string }[]
    documentTypes: [] as {
      heading: string;
      items: { key: string; name: string }[];
    }[]

  };

  showSideBar = signal<boolean>(false);
  toggleSideBar(toggleStatus: boolean = !this.showSideBar()) {
    this.showSideBar.set(toggleStatus);
  }

}