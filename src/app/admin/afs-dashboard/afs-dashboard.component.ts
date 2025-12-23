import { Component, HostListener, OnInit, signal } from '@angular/core';
// import { RouterModule } from '@angular/router';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../src/environments/environment';

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
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { IState } from '../../core/models/state/state';
import { AfsFilterComponent } from './afs-filter/afs-filter.component';
import { AfsTableComponent } from "./afs-table/afs-table.component";
import { AfsService, FilterValues } from './afs.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';


interface Years {
  name: string;
  _id: string;
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
export class AfsDashboardComponent {
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

  onFiltersChanged(filters: FilterValues): void {
    console.log('filters received in dashboard:', filters);
    if ('citySearch' in filters) delete filters.citySearch;
    if ('stateSearch' in filters) delete filters.stateSearch;
    if (!filters.digitizationStatus) delete filters.digitizationStatus;
    this.filtersObj.set(filters)
    this.showSideBar.set(false);
    // this.getAfsList();

  }




  constructor(private router: Router, private http: HttpClient,
    private afsService: AfsService,
  ) { }

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