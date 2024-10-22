import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
// import { getPopulationCategory, PopulationCategory } from 'src/app/util/common';
import { MaterialModule } from '../../../../material.module';
import { getPopulationCategory, PopulationCategory } from '../../../../core/util/common';

type ActiveFilter = 'overAll' | 'resourceMobilization' | 'expenditurePerformance' | 'fiscalGovernance';

@Component({
  selector: 'app-performance-four-m',
  templateUrl: './performance-four-m.component.html',
  styleUrls: ['./performance-four-m.component.scss'],
  standalone: true,
  imports: [MaterialModule],
})
export class PerformanceFourMComponent implements OnChanges {

  @Input() data: any;

  activeFilter: ActiveFilter = 'overAll';
  populationCategory!: PopulationCategory;

  ulb: any;
  selectedRank!: string;


  get activeFilterName() {
    return {
      overAll: 'Over All',
      resourceMobilization: 'Resource Mobilization',
      expenditurePerformance: 'Expenditure Performance',
      fiscalGovernance: 'Fiscal Governance'
    }[this.activeFilter];
  }


  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) this.updateInputDataDependencies();
  }

  updateInputDataDependencies() {
    this.ulb = this.data?.ulb;
    this.selectedRank = this.ulb?.[this.activeFilter]?.rank;
    this.populationCategory = getPopulationCategory(this.ulb?.population);
  }

}
