import { Component, input, OnInit, signal } from '@angular/core';
import { NoDataFoundComponent } from '../../../../shared/components/shared-ui/no-data-found.component';
import { TabButtonsComponent } from '../../../../shared/components/shared-ui/tab-buttons.component';

@Component({
  selector: 'app-borrowing-credit-rating',
  imports: [NoDataFoundComponent, TabButtonsComponent],
  templateUrl: './borrowing-credit-rating.component.html',
  styleUrl: './borrowing-credit-rating.component.scss',
})
export class BorrowingCreditRatingComponent implements OnInit {
  readonly buttons = [
    { key: 'borrowing', label: 'Borrowing' },
    { key: 'creditRating', label: 'Credit Rating' },
  ];
  currentSelectedButtonKey = signal<string>('');
  readonly borrowingYears = input.required<string[]>();

  ngOnInit() {
    console.log('bonds years: ', this.borrowingYears());
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key);
  }
}
