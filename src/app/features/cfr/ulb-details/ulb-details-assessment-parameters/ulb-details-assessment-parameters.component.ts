import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { CommonTableComponent } from '../../common-table/common-table.component';
import { MatCommonTableComponent } from '../../mat-common-table/mat-common-table.component';

@Component({
  selector: 'app-ulb-details-assessment-parameters',
  templateUrl: './ulb-details-assessment-parameters.component.html',
  styleUrls: ['./ulb-details-assessment-parameters.component.scss'],
  standalone: true,
  imports: [MaterialModule, CommonTableComponent, MatCommonTableComponent],
})
export class UlbDetailsAssessmentParametersComponent {
  @Input() tables: any;

  activeFilter: 'resourceMobilization' | 'expenditurePerformance' | 'fiscalGovernance' =
    'resourceMobilization';

  constructor() {}

  get footnotes() {
    return this.activeFilter == 'fiscalGovernance'
      ? `
      Note:  <br />
      For 10a &b, 'Yes' means the average time taken for the ULB to close their audit is less than 12 months in a financial year. If yes, the marks allotted are 25. 
      <br />
      For 11a & b, if the answer to this question is 'Yes', the ULB will be awarded 25 marks.
    `
      : '';
  }

  get table() {
    return {
      response: this.tables?.[this.activeFilter],
    };
  }
}
