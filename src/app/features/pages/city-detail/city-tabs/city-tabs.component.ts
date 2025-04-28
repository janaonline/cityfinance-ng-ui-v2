import { Component } from '@angular/core';
import { FinancialPerformanceComponent } from './financial-performance/financial-performance.component';
import { BalancesheetIncomestatementComponent } from './balancesheet-incomestatement/balancesheet-incomestatement.component';
import { BorrowCreditRatingComponent } from './borrow-credit-rating/borrow-credit-rating.component';

@Component({
  selector: 'app-city-tabs',
  standalone: true,
  imports: [FinancialPerformanceComponent, BalancesheetIncomestatementComponent, BorrowCreditRatingComponent],
  templateUrl: './city-tabs.component.html',
  styleUrl: './city-tabs.component.scss'
})
export class CityTabsComponent {

}
