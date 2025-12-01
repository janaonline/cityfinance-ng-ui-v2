import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AfsService } from '../afs.service';
import { ToStorageUrlPipe } from "../../../core/pipes/to-storage-url.pipe";
import { DatePipe, NgClass } from '@angular/common';

interface Years {
  name: string;
  _id: string;
}


interface State {
  _id: string;
  name: string;
}

interface City {
  name: string;
  stateId: string;
  populationCategory: string;
}

interface RawRow {
  position: number;
  city: string;
  stateId: string;
  stateName: string;
  populationCategory: string;
  year: string;
  docType: string;
  docTypeLabel: string;
  isAudited: 'audited' | 'unAudited';
}


@Component({
  selector: 'app-afs-table',
  imports: [
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
    ToStorageUrlPipe,
    DatePipe,
    NgClass,
  ],
  templateUrl: './afs-table.component.html',
  styleUrl: './afs-table.component.scss'
})
export class AfsTableComponent implements AfterViewInit, OnInit {

  filters = {
    docType: 'bal_sheet_schedules',
    yearId: '606aadac4dff55e6c075c507',
    auditType: 'audited',
    states: [] as State[],
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

  MASTER_FORM_STATUS: { [key: number]: string } = {
    [-1]: 'No Status',
    1: 'Not Started',
    2: 'In Progress',
    3: 'Under Review By State',
    4: 'Under Review By MoHUA',
    5: 'Returned By State',
    6: 'Submission Acknowledged By MoHUA',
    7: 'Returned By MoHUA',
    8: 'Verification Not Started',
    9: 'Verification In Progress',
    10: 'Returned by PMU',
    11: 'Submission Acknowledged by PMU',
  };
  states: State[] = [
    { _id: 'assam', name: 'Assam' },
    { _id: 'karnataka', name: 'Karnataka' }
  ];

  cities: City[] = [
    { name: 'Guwahati', stateId: 'assam', populationCategory: '1 Million - 4 Million' },
    { name: 'Silchar', stateId: 'assam', populationCategory: '100 Thousand - 500 Thousand' },
    { name: 'Bengaluru', stateId: 'karnataka', populationCategory: '4 Million+' }
  ];



  docTypes = {
    bal_sheet: 'Balance Sheet',
    bal_sheet_schedules: 'Schedules To Balance Sheet',
    inc_exp: 'Income And Expenditure',
    inc_exp_schedules: 'Schedules To Income And Expenditure',
    cash_flow: 'Cash Flow Statement',
  }
  private allRows: RawRow[] = [
    {
      position: 1,
      city: 'Guwahati',
      stateId: 'assam',
      stateName: 'Assam',
      populationCategory: '1 Million - 4 Million',
      year: '2020-21',
      docType: 'bs',
      docTypeLabel: 'Balance Sheet',
      isAudited: 'audited'
    },

  ];

  selection = new SelectionModel<RawRow>(true, []);

  isTableLoading: boolean = false;
  constructor(private afsService: AfsService,) { }

  ngOnInit(): void {
    this.getAfsList();
  }

  getAfsList(): void {
    this.isTableLoading = true;
    this.afsService.getAfsList(this.filters).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.isTableLoading = false;
      },
      error: (err) => {
        console.error('Failed to load AFS list:', err);
      }
    });
  }

  getStatusText(doc: any): string {
    const ulbDigitizedFiles =
      doc.afsexcelfiles?.files && doc.afsexcelfiles.files.length !== 0 ? doc.afsexcelfiles.files[0] : null;

    const ulbDigitizedStatus = ulbDigitizedFiles
      ? ulbDigitizedFiles.fileUrl === 'https://placeholder-link.com/none'
        ? 'Failed'
        : 'Digitized'
      : 'Not-Digitized';

    const afsDigitizedFiles =
      doc.afsexcelfiles?.files && doc.afsexcelfiles.files.length === 2 ? doc.afsexcelfiles.files[1] : null;
    return ulbDigitizedStatus;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: RawRow): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  dataSource = new MatTableDataSource<RawRow>(this.allRows);
  displayedColumns: string[] = [
    'select',
    'state',
    'city',
    'ulbUploadedPdf',
    'formStatus',
    'digitizeStatus',
    // 'populationCategory',
    'year',
    'docType',
    // 'auditStatus'
    'formUploadedOn',
    'digitizedOn',
    'requestIdLog',
  ];

  activeFilterSummary = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
