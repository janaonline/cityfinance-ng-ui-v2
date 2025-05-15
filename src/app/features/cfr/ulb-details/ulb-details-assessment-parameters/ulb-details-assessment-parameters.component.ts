import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../material.module';
import { MatCommonTableComponent } from '../../mat-common-table/mat-common-table.component';

@Component({
  selector: 'app-ulb-details-assessment-parameters',
  templateUrl: './ulb-details-assessment-parameters.component.html',
  styleUrls: ['./ulb-details-assessment-parameters.component.scss'],
  standalone: true,
  imports: [MaterialModule, MatCommonTableComponent, RouterModule],
})
export class UlbDetailsAssessmentParametersComponent implements OnInit, OnChanges {
  @Input() tables: any;

  filter: FormGroup;
  tableData: any = {};
  isLoadingResults: boolean = true;

  parameters: any[] = [
    { key: 'resourceMobilization', label: 'Resource Mobilization' },
    { key: 'expenditurePerformance', label: 'Expenditure Performance' },
    { key: 'fiscalGovernance', label: 'Fiscal Governance' },
  ];

  constructor(private fb: FormBuilder) {
    this.filter = this.fb.group({ category: 'resourceMobilization' });
  }

  ngOnInit(): void {
    // console.log("--->", this.filter)
    this.isLoadingResults = true;
    this.filter.get('category')?.valueChanges.subscribe((value) => {
      this.tableData = this.tables?.[value];
    });
    this.isLoadingResults = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoadingResults = true;
    // Check if `tables` has been initialized or updated
    if (changes['tables'] && this.tables) {
      this.tableData = this.tables[this.filter.get('category')?.value];
    }
    this.isLoadingResults = false;
  }
}
