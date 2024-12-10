import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-performance-four-m',
  templateUrl: './performance-four-m.component.html',
  styleUrls: ['./performance-four-m.component.scss'],
  standalone: true,
  imports: [MaterialModule],
})
export class PerformanceFourMComponent implements OnChanges {
  @Input() data: any;

  parameterkey: string = 'overAll';
  populationCategory: number = 1;
  ulb: any;
  selectedRank!: string;
  parameterlabel: any = {
    overAll: 'OverAll',
    resourceMobilization: 'Resource Mobilization',
    expenditurePerformance: 'Expenditure Performance',
    fiscalGovernance: 'Fiscal Governance',
  };
  parameters: any = [
    { key: 'overAll', code: 'OA', label: 'Over All', maxScore: 1200 },
    { key: 'resourceMobilization', code: 'RM', label: 'Resource Mobilization', maxScore: 600 },
    { key: 'expenditurePerformance', code: 'EP', label: 'Expenditure Performance', maxScore: 300 },
    { key: 'fiscalGovernance', code: 'FG', label: 'Fiscal Governance', maxScore: 300 },
  ];
  popCat: any = {
    1: '4M+',
    2: '1M-4M',
    3: '100K to 1M',
    4: '<100K',
  };

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) this.updatePortalData('overAll');
  }

  updatePortalData(key: string) {
    this.parameterkey = key;
    this.ulb = this.data?.ulb;
    this.selectedRank = this.ulb?.[key]?.rank;
    this.populationCategory = this.popCat[this.ulb?.populationBucket];
  }
}
