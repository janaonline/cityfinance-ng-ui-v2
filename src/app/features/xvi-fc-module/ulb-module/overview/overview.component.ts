import { Component, OnInit, inject } from '@angular/core';
import {
  OverviewCardComponent,
  OverviewData,
} from '../../shared/overview-card/overview-card.component';
import { UlbOverviewService } from './overview-card.service';
import { DisbursementColumn, DisbursementRow } from './overview-card.models';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [OverviewCardComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  private readonly overviewService = inject(UlbOverviewService);

  get selectedYear(): string | null {
    return localStorage.getItem('xvifc_selectedYearString') ?? null;
  }

  private get ulbId(): string {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
    return raw ? JSON.parse(raw)?.ulb ?? '' : '';
  }

  currentRequirementYear = 'FY 2026-27';
  isLoading = false;
  errorMessage = '';

  ulbOverviewData: OverviewData | null = null;
  disbursementColumns: DisbursementColumn[] = [];
  disbursementRows: DisbursementRow[] = [];

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.overviewService.getOverviewViewModel(this.ulbId).subscribe({
      next: ({ ulbOverviewData, disbursementColumns, disbursementRows }) => {
        this.ulbOverviewData = ulbOverviewData;
        this.disbursementColumns = disbursementColumns;
        this.disbursementRows = disbursementRows;
        this.currentRequirementYear = disbursementColumns[0]?.label ?? 'FY 2026-27';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load ULB overview', error);
        this.errorMessage = 'Failed to load overview data.';
        this.isLoading = false;
      },
    });
  }

  onViewRequirements(): void {
    console.log('Navigate to requirements page');
  }
}
