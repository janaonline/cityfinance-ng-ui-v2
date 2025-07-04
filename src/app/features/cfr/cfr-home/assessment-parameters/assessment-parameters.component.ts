import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Card {
  id: string;
  cardKey: string;
  cardUrl: string;
  cardLabel: string;
  cardDescription: string;
}
@Component({
    selector: 'app-assessment-parameters',
    templateUrl: './assessment-parameters.component.html',
    styleUrls: ['./assessment-parameters.component.scss'],
    imports: [RouterModule]
})
export class AssessmentParametersComponent {

  @Output() onGuidelinesPopup = new EventEmitter();
  data: Card[] = [];

  constructor() { }

  ngOnInit(): void {
    this.data = [
      {
        id: 'resource',
        cardKey: 'resourceMobilization',
        cardUrl: './assets/fiscal-rankings/RM.svg',
        cardLabel: 'Resource Mobilization',
        cardDescription: 'Comprises assessment of the size and growth in receipts of the ULB',
      },
      {
        id: 'expenditure',
        cardKey: 'expenditurePerformance',
        cardUrl: './assets/fiscal-rankings/EP.svg',
        cardLabel: 'Expenditure Performance',
        cardDescription: 'Comprises assessment of the size and quality of expenditure',
      },
      {
        id: 'fiscal',
        cardKey: 'fiscalGovernance',
        cardUrl: './assets/fiscal-rankings/FG.svg',
        cardLabel: 'Fiscal Governance',
        cardDescription: 'Comprises assessment of Transparency and accountability',
      },
    ];
  }

}
