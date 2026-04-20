import { Component, OnInit, inject } from '@angular/core';
import {
  OverviewCardComponent,
  OverviewData,
} from '../../shared/overview-card/overview-card.component';
import { OverviewService } from './overview-card.service';
import { DisbursementColumn, DisbursementRow } from './overview-card.models';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [OverviewCardComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  private readonly overviewService = inject(OverviewService);

  private readonly stateId = '5dcf9d7316a06aed41c748ec';

  currentRequirementYear = 'FY 2026-27';
  isLoading = false;
  errorMessage = '';

  stateOverviewData: OverviewData | null = null;
  disbursementColumns: DisbursementColumn[] = [];
  disbursementRows: DisbursementRow[] = [];

  ngOnInit(): void {
    this.loadOverview();
    // this.isLoading = true;
    // setTimeout(() => {
    //   this.loadOverview();
    // }, 3000);
  }

  loadOverview(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.overviewService.getOverviewViewModel(this.stateId).subscribe({
      next: ({ stateOverviewData, disbursementColumns, disbursementRows }) => {
        this.stateOverviewData = stateOverviewData;
        this.disbursementColumns = disbursementColumns;
        this.disbursementRows = disbursementRows;
        this.currentRequirementYear = disbursementColumns[0]?.label ?? 'FY 2026-27';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load state overview', error);
        this.errorMessage = 'Failed to load overview data.';
        this.isLoading = false;
      },
    });
  }

  onViewRequirements(): void {
    console.log('Navigate to requirements page');
  }
}
