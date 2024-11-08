import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { environment } from '../../../../environments/environment';
import { ToStorageUrlPipe } from '../../../core/pipes/to-storage-url.pipe';
import { MaterialModule } from '../../../material.module';
// import { responseJson } from './res-json';
// import { TableResponse } from '../services/common-table.interface';

@Component({
  selector: 'app-mat-common-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, CommonModule, ToStorageUrlPipe, MaterialModule],
  templateUrl: './mat-common-table.component.html',
  styleUrl: './mat-common-table.component.scss',
})
export class MatCommonTableComponent implements OnChanges {
  // @Input({
  //   // transform: (value: any) => {
  //   //   return value?.map((e: { key: string; }) => e.key)
  //   // }
  // }) tableColumns: any;
  // @Input() response!: TableResponse;
  @Input() tableRow!: any[];
  @Input() isPagination = false;
  columnsToDisplay: string[] = [];

  @Input() response: any;
  @Input() isLoadingResults = false;
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter();
  prefixUrl = environment.prefixUrl;

  tableColumns: any[] = [];
  columnData: any[] = [];
  subHeaderColumns: string[] = [];

  resultsLength = 0;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  skip: number = 0;
  lastRows: any[] = [];
  lastRowColumns: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['response']) {
      return;
    }
    const res = changes['response'].currentValue;
    this.tableColumns = res?.columns.filter((e: any) => !e.hidden).map((e: { key: string; }) => e.key);
    this.columnData = res?.columns.map((e: { key: string; }) => e.key);
    this.subHeaderColumns = res?.subHeaders?.map((e: { key: string; }) => 'id-' + e.key);
    this.lastRows = res?.lastRow;
    this.lastRowColumns = this.lastRows?.map((e: { key: string; }) => 'lastRowId-' + e.key);

    // if (tableResponces.currentValue?.data?.length > 0) {
    //   this.isSearchable = Boolean(this.response?.columns?.some(column => column.hasOwnProperty('query')));
    // }
  }

  pageChanged(event: any) {
    // console.log('event',event);
    this.skip = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageChange.emit(event);
    // console.log('event', event);
    // this.onLoad();
  }
  /** Gets the total cost of all transactions. */
  getTotalCost() {
    // return this.response.data.map((t: { cost: any; }) => t.cost).reduce((acc: any, value: any) => acc + value, 0);
  }
}
