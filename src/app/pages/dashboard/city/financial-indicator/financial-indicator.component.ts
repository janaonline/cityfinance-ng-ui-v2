import { Component, input } from '@angular/core';
import { NoDataFoundComponent } from '../../../../shared/components/shared-ui/no-data-found.component';

@Component({
  selector: 'app-financial-indicator',
  imports: [NoDataFoundComponent],
  templateUrl: './financial-indicator.component.html',
  styleUrl: './financial-indicator.component.scss',
})
export class FinancialIndicatorComponent {
  yearsSignal = input.required<string[]>();
}
