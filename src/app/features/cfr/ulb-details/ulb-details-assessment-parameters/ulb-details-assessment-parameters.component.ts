import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { CommonTableComponent } from '../../common-table/common-table.component';
import { MatCommonTableComponent } from '../../mat-common-table/mat-common-table.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ulb-details-assessment-parameters',
  templateUrl: './ulb-details-assessment-parameters.component.html',
  styleUrls: ['./ulb-details-assessment-parameters.component.scss'],
  standalone: true,
  imports: [MaterialModule, CommonTableComponent, MatCommonTableComponent],
})
export class UlbDetailsAssessmentParametersComponent implements OnInit {
  @Input() tables: any;

  filter: FormGroup;
  tableData: any = {};

  parameters: any[] = [
    { key: 'resourceMobilization', label: 'Resource Mobilization' },
    { key: 'expenditurePerformance', label: 'Expenditure Performance' },
    { key: 'fiscalGovernance', label: 'Fiscal Governance' },
  ];

  constructor(private fb: FormBuilder) {
    this.filter = this.fb.group({ category: 'resourceMobilization' });
  }

  ngOnInit(): void {
    this.filter.get('category')?.valueChanges.subscribe((value) => {
      this.tableData = this.tables?.[value];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if `tables` has been initialized or updated
    if (changes['tables'] && this.tables) {
      this.tableData = this.tables[this.filter.get('category')?.value];
    }
  }
}
