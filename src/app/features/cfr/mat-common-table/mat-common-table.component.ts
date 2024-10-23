import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
// import { responseJson } from './res-json';
// import { TableResponse } from '../services/common-table.interface';

@Component({
  selector: 'app-mat-common-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, CommonModule],
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
  columnsToDisplay: string[] = [];

  @Input() response: any;
  tableColumns: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    const res = changes['response'].currentValue;
    this.tableColumns = res?.columns.map((e: { key: string; }) => e.key);
    // if (tableResponces.currentValue?.data?.length > 0) {
    //   this.isSearchable = Boolean(this.response?.columns?.some(column => column.hasOwnProperty('query')));
    // }
  }

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    // return this.response.data.map((t: { cost: any; }) => t.cost).reduce((acc: any, value: any) => acc + value, 0);
  }
}
