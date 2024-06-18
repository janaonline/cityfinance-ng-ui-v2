import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-xvi-fc-review',
  standalone: true,
  imports: [
    MaterialModule,
    MatTableModule, 
    MatPaginatorModule
  ],
  templateUrl: './xvi-fc-review.component.html',
  styleUrl: './xvi-fc-review.component.scss'
})
export class XviFcReviewComponent implements AfterViewInit  {
  displayedColumns: string[] = ['position', 'ulbName', 'censusCode', 'formStatus', 'actions'];
  dataSource = new MatTableDataSource<DashboardElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'In progress':
        return 'status-in-progress';
      case 'Under review by state':
        return 'status-under-review';
      case 'Approved by XVIFC':
        return 'status-approved';
      default:
        return 'status-unknown';
    }
  }
}

export interface DashboardElement {
  position: number;
  ulbName: string;
  censusCode: number;
  formStatus: string;
  // dataSubmitted: string;
  actions: string;
}

const ELEMENT_DATA: DashboardElement[] = [
  {position: 1, ulbName: 'Kannur', censusCode: 1079, formStatus: 'In progress', actions:'View'},
  {position: 2, ulbName: 'Bangalore', censusCode: 79, formStatus: 'Under review by state',actions:'Review'},
  {position: 3, ulbName: 'Kannur', censusCode: 1079, formStatus: 'In progress',actions:'View'},
  {position: 4, ulbName: 'Hydrabad', censusCode: 179, formStatus: 'Approved by XVIFC',actions:'View'},
  {position: 5, ulbName: 'Bangalore', censusCode: 79, formStatus: 'Under review by state',actions:'Review'},
  {position: 6, ulbName: 'Hydrabad', censusCode: 179, formStatus: 'Approved by XVIFC', actions:'View'},
];

