import { JsonPipe } from '@angular/common';
import { Component, effect, input, OnDestroy, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { cloneDeep } from 'lodash';
import { BorrowingsData, BorrowingsKeys } from '../../../../core/models/interfaces';
import { NoDataFoundComponent } from '../../../../shared/components/shared-ui/no-data-found.component';
import { TabButtonsComponent } from '../../../../shared/components/shared-ui/tab-buttons.component';
import { DashboardService } from '../../dashboard.service';
import { TABLE_STRUCTURE } from './constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-borrowing-credit-rating',
  imports: [NoDataFoundComponent, TabButtonsComponent, MatTableModule, JsonPipe],
  templateUrl: './borrowing-credit-rating.component.html',
  styleUrl: './borrowing-credit-rating.component.scss',
})
export class BorrowingCreditRatingComponent implements OnDestroy {
  readonly buttons = [
    { key: 'borrowing', label: 'Borrowing' },
    { key: 'creditRating', label: 'Credit Rating' },
  ];
  readonly displayedColumnsStructure: string[] = ['header'];
  currentSelectedButtonKey = signal<string>('');
  readonly borrowingYears = input.required<string[]>();
  readonly ulbIdSignal = input.required<string>();

  private readonly COLS_PER_PAGE = 3;
  currentPage = 0;
  totalPages = 0;

  isPrevDisabled = true;
  isNextDisabled = true;

  isLoading = true;
  displayedColumns: string[] = [];

  dataSource!: BorrowingsData[];
  dataSource_0!: BorrowingsData[];
  dataSource_1!: BorrowingsData[];
  dataSource_2!: BorrowingsData[];
  dataSource_3!: BorrowingsData[];
  dataSource_4!: BorrowingsData[];
  dataSource_5!: BorrowingsData[];
  dataSource_6!: BorrowingsData[];

  bondsData!: BorrowingsKeys[];

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  // ngOnInit() {
  // this.getBorrowingsData();
  // }

  onSelectedButtonChange(key: string): void {
    this.currentSelectedButtonKey.set(key);
  }

  readonly ulbIdChange = effect(() => {
    const ulbId = this.ulbIdSignal();
    if (ulbId) this.getBorrowingsData();
  });

  private getBorrowingsData(): void {
    // console.log('Get borrowings data called');
    if (!this.ulbIdSignal() && this.currentSelectedButtonKey() === this.buttons[1].key) return;

    this.isLoading = true;
    this.dashboardService
      .getBorrowingsData(this.ulbIdSignal())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.bondsData = res.data;
          this.totalPages = Math.ceil(this.bondsData.length / this.COLS_PER_PAGE);
          this.createStructure();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to fetch borrowings data: ', error);
        },
      });
  }

  private createStructure(): void {
    const tableStructure = cloneDeep(TABLE_STRUCTURE);
    this.displayedColumns = [...this.displayedColumnsStructure];

    this.bondsData.forEach((bondObj, index) => {
      for (const row of tableStructure) {
        const key = row.key;
        row[index.toString()] = bondObj[key] ?? '';
      }
    });

    this.dataSource_0 = tableStructure.filter((e) => e.table === '0');
    this.dataSource_1 = tableStructure.filter((e) => e.table === '1');
    this.dataSource_2 = tableStructure.filter((e) => e.table === '2');
    this.dataSource_3 = tableStructure.filter((e) => e.table === '3');
    this.dataSource_4 = tableStructure.filter((e) => e.table === '4');
    this.dataSource_5 = tableStructure.filter((e) => e.table === '5');
    this.dataSource_6 = tableStructure.filter((e) => e.table === '6');

    this.currentPage = 0;
    this.updateDisplayedColumns();
    this.isLoading = false;
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = [...this.displayedColumnsStructure];

    const startIndex = this.currentPage * this.COLS_PER_PAGE;
    const endIndex = Math.min(startIndex + this.COLS_PER_PAGE, this.bondsData.length);

    for (let i = startIndex; i < endIndex; i++) {
      this.displayedColumns.push(i.toString());
    }

    this.isPrevDisabled = this.currentPage === 0;
    this.isNextDisabled = this.currentPage >= this.totalPages - 1;

    // console.log(`Page: ${this.currentPage + 1}/${this.totalPages}`);
    // console.log('Displayed Columns:', this.displayedColumns);
  }

  // ---- Pagination -----
  get paginationRange(): (number | '..')[] {
    const pages: (number | '..')[] = [];
    const maxButtons = 1;

    if (this.totalPages <= maxButtons) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const left = Math.max(this.currentPage - 1, 1);
      const right = Math.min(this.currentPage + 1, this.totalPages - 2);

      pages.push(0); // always show first

      if (left > 1) pages.push('..');

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < this.totalPages - 2) pages.push('..');

      pages.push(this.totalPages - 1);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;

    this.currentPage = page;
    this.updateDisplayedColumns();
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.ulbIdChange) this.ulbIdChange;
  }
}
