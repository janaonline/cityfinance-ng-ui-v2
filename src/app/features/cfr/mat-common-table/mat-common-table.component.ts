import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { environment } from '../../../../environments/environment';
import { ToStorageUrlPipe } from '../../../core/pipes/to-storage-url.pipe';
import { MaterialModule } from '../../../material.module';
import { TableResponse } from '../services/common-table.interface';
import { isEmpty } from 'lodash-es';

@Component({
    selector: 'app-mat-common-table',
    imports: [MatTableModule, MatButtonModule, CommonModule, ToStorageUrlPipe, MaterialModule],
    templateUrl: './mat-common-table.component.html',
    styleUrl: './mat-common-table.component.scss'
})
export class MatCommonTableComponent implements OnChanges {
  @Input() response: TableResponse = {} as TableResponse;
  @Input() isPagination = false;
  // @Input() response: any;
  @Input() isLoadingResults = false;
  @Input() pageSize = 10;
  @Input() tableHeight = 110;
  columnsToDisplay: string[] = [];
  decimalPlace = 2;

  @Output() pageChange = new EventEmitter();
  prefixUrl = environment.prefixUrl;

  tableColumns: any[] = [];
  columnData: any[] = [];
  subHeaderColumns: string[] = [];

  resultsLength = 0;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() skip: number = 0;
  lastRow!: any[];
  lastRowColumns: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['response']) {
      return;
    }

    if (isEmpty(changes['response'].currentValue)) {
      return;
    }
    const res = changes['response'].currentValue;
    this.tableColumns = res?.columns.filter((e: any) => !e.hidden).map((e: { key: string; }) => e.key);
    this.columnData = res?.columns.map((e: { key: string; }) => e.key);
    this.subHeaderColumns = res?.subHeaders?.map((e: { key: string; }) => 'id-' + e.key);
    this.getLastRow(res);
  }

  getLastRow(res: TableResponse) {
    this.lastRow = res?.lastRow;
    if (this.lastRow) {
      this.lastRow.map((e: any) => {
        if (e['sum'] || e['avg']) {
          const opr = e['sum'] ? 'sum' : 'avg';
          e.value = this.getTotal(res.data, e, opr)
        }
        return e;
      })

      this.lastRowColumns = this.lastRow?.map((e: { key: string; }) => 'lastRowId-' + e.key);

    }
  }

  pageChanged(event: any) {
    this.skip = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageChange.emit(event);
  }

  /** Gets the total. */
  getTotal(data: any, columnData: any, operator: string) {
    const column = columnData[operator];
    let total = data.map((t: any) => t[column]).reduce((acc: any, value: any) => Number(acc) + Number(value), 0);
    if (operator === 'avg') {
      total = total / data.length;
    }
    return Number(total.toFixed(columnData.decimalPlace)).toLocaleString('ta-IN');
  }
}
