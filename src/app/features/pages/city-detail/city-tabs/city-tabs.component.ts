import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FinancialPerformanceComponent } from './financial-performance/financial-performance.component';
import { BalancesheetIncomestatementComponent } from './balancesheet-incomestatement/balancesheet-incomestatement.component';
import { BorrowCreditRatingComponent } from './borrow-credit-rating/borrow-credit-rating.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-city-tabs',
  standalone: true,
  imports: [
    FinancialPerformanceComponent,
    BalancesheetIncomestatementComponent,
    BorrowCreditRatingComponent,
    CommonModule,
  ],
  templateUrl: './city-tabs.component.html',
  styleUrl: './city-tabs.component.scss',
})
export class CityTabsComponent {
  tabs = [
    {
      title: 'Financial Performance',
      content: 'This is the overview section.',
      component: 'performance',
    },
    {
      title: 'Balance Sheet and Income Statement',
      content: 'Here are the statistics.',
      component: 'balance',
    },
    { title: 'Borrowing and Credit Rating', content: 'View reports here.', component: 'borrow' },
  ];

  activeTabIndex = 0;
  underlineLeft = 0;
  underlineWidth = 0;

  @ViewChildren('tabButtons', { read: ElementRef })
  tabElements!: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    this.updateUnderline();
  }

  setActiveTab(index: number) {
    this.activeTabIndex = index;
    this.updateUnderline();
  }

  updateUnderline() {
    const tab = this.tabElements.get(this.activeTabIndex)?.nativeElement;
    if (tab) {
      const button = tab.querySelector('button');
      if (button) {
        const rect = button.getBoundingClientRect();
        const parentRect = tab.parentElement.getBoundingClientRect();
        this.underlineLeft = rect.left - parentRect.left;
        this.underlineWidth = rect.width;
      }
    }
  }
}
