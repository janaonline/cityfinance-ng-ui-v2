import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Card {
  cardKey: string;
  cardUrl: string;
  cardLabel: string;
  cardDescription: string;
}
@Component({
  selector: 'app-assessment-parameters',
  templateUrl: './assessment-parameters.component.html',
  styleUrls: ['./assessment-parameters.component.scss'],
  standalone: true,
  imports: [RouterModule]
})
export class AssessmentParametersComponent {

  @Output() onGuidelinesPopup = new EventEmitter();
  data: Card[] = [];

  constructor() {}

  ngOnInit(): void {
    this.data = [
      {
        cardKey: 'resourceMobilization',
        cardUrl: './assets/fiscal-rankings/RM.svg',
        cardLabel: 'Resource Mobilization',
        cardDescription: 'Comprises assessment of the size and growth in receipts of the ULB',
      },
      {
        cardKey: 'expenditurePerformance',
        cardUrl: './assets/fiscal-rankings/EP.svg',
        cardLabel: 'Expenditure Performance',
        cardDescription: 'Comprises assessment of the size and quality of expenditure',
      },
      {
        cardKey: 'fiscalGovernance',
        cardUrl: './assets/fiscal-rankings/FG.svg',
        cardLabel: 'Fiscal Governance',
        cardDescription: 'Comprises assessment of Transparency and accountability',
      },
    ];
  }

}
