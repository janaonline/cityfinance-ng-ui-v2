import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: any[] = [
  {
    _id: '5dcf9d7216a06aed41c748dd',
    sNo: 1,
    name: 'Andhra Pradesh',
    totalULBs: 123,
    participatedUlbs: 123,
    rankedUlbs: 88,
    nonRankedUlbs: 35,
    rankedtoTotal: 71.54,
    nameLink: '/rankings/participated-ulbs/5dcf9d7216a06aed41c748dd',
  },
  {
    _id: '5dcf9d7216a06aed41c748e2',
    sNo: 2,
    name: 'Chhattisgarh',
    totalULBs: 169,
    participatedUlbs: 169,
    rankedUlbs: 118,
    nonRankedUlbs: 51,
    rankedtoTotal: 69.82,
    nameLink: '/rankings/participated-ulbs/5dcf9d7216a06aed41c748e2',
  },
];

@Component({
  selector: 'app-mat-common-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, CommonModule],
  templateUrl: './mat-common-table.component.html',
  styleUrl: './mat-common-table.component.scss',
})
export class MatCommonTableComponent {
  @Input() response!: any;
  @Input() classLists!: string;
  @Input() tableName!: string;

  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  // data: any[] = ELEMENT_DATA;

  // addColumn() {
  //   const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
  //   this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
  // }

  // removeColumn() {
  //   if (this.columnsToDisplay.length) {
  //     this.columnsToDisplay.pop();
  //   }
  // }

  // shuffle() {
  //   let currentIndex = this.columnsToDisplay.length;
  //   while (0 !== currentIndex) {
  //     let randomIndex = Math.floor(Math.random() * currentIndex);
  //     currentIndex -= 1;

  //     // Swap
  //     let temp = this.columnsToDisplay[currentIndex];
  //     this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
  //     this.columnsToDisplay[randomIndex] = temp;
  //   }
  // }
}
