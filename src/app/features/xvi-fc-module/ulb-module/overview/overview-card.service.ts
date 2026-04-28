import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { DisbursementColumn, DisbursementRow, UlbOverviewApiResponse } from './overview-card.models';
import { OverviewData } from '../../shared/overview-card/overview-card.component';

const DUMMY_ULB_RESPONSES: Record<string, UlbOverviewApiResponse> = {
  default: {
    totalAllocation: 2158,
    ulbId: 'default',
    ulbName: 'Greater Visakhapatnam Municipal Corporation',
    stateName: 'Andhra Pradesh',
    years: '2026-27 to 2030-31',
    tableData: [
      { year: 'FY2026-27', basic: 312, performance: 148 },
      { year: 'FY2027-28', basic: 320, performance: 155 },
      { year: 'FY2028-29', basic: 335, performance: 162 },
      { year: 'FY2029-30', basic: 348, performance: 170 },
      { year: 'FY2030-31', basic: 360, performance: 148 },
    ],
  },
};

@Injectable({
  providedIn: 'root',
})
export class UlbOverviewService {
  getUlbOverview(ulbId: string): Observable<UlbOverviewApiResponse> {
    const data = DUMMY_ULB_RESPONSES[ulbId] ?? DUMMY_ULB_RESPONSES['default'];
    return of({ ...data, ulbId }).pipe(delay(600));
  }

  getOverviewViewModel(ulbId: string): Observable<{
    ulbOverviewData: OverviewData;
    disbursementColumns: DisbursementColumn[];
    disbursementRows: DisbursementRow[];
  }> {
    return this.getUlbOverview(ulbId).pipe(
      map((response) => ({
        ulbOverviewData: this.mapToOverviewData(response),
        disbursementColumns: this.mapToDisbursementColumns(response),
        disbursementRows: this.mapToDisbursementRows(response),
      })),
    );
  }

  private mapToOverviewData(response: UlbOverviewApiResponse): OverviewData {
    const totalBasic = response.tableData.reduce((sum, row) => sum + row.basic, 0);
    const totalPerformance = response.tableData.reduce((sum, row) => sum + row.performance, 0);

    return {
      name: response.ulbName,
      financialYear: `FY-${response.years}`,
      subHeader1: 'TOTAL 5-YEAR ALLOCATION',
      subHeader2: 'BASIC + PERFORMANCE',
      totalAllocation: this.formatCrore(response.totalAllocation),
      totalAllocationNote: `For ${response.ulbName}, ${response.stateName}`,
      grantSections: [
        {
          id: 'basic',
          label: 'Basic Grants',
          componentLabel: 'Grant Component',
          title: 'Basic Grants',
          amount: this.formatCrore(totalBasic),
          points: [
            'Supports delivery of core municipal services across eligible Urban Local Bodies.',
            'Focused on improving service continuity, maintenance, and local civic infrastructure.',
            "Released as part of the state's overall grant support framework.",
          ],
        },
        {
          id: 'performance',
          label: 'Performance Grants',
          componentLabel: 'Grant Component',
          title: 'Performance Grants',
          amount: this.formatCrore(totalPerformance),
          points: [
            'Linked to achievement of reform-linked performance indicators by eligible ULBs.',
            'Encourages stronger financial management, reporting, and governance outcomes.',
            'Designed to reward measurable improvements in urban administration.',
          ],
        },
      ],
    };
  }

  private mapToDisbursementColumns(response: UlbOverviewApiResponse): DisbursementColumn[] {
    return response.tableData.map((row, index) => ({
      key: this.toColumnKey(row.year),
      label: row.year.replace('FY', 'FY '),
      highlight: index === 0,
    }));
  }

  private mapToDisbursementRows(response: UlbOverviewApiResponse): DisbursementRow[] {
    const basicValues: Record<string, string> = {};
    const performanceValues: Record<string, string> = {};

    response.tableData.forEach((row) => {
      const key = this.toColumnKey(row.year);
      basicValues[key] = this.formatCrore(row.basic);
      performanceValues[key] = row.performance > 0 ? this.formatCrore(row.performance) : '—';
    });

    return [
      { id: 'basic', label: 'Basic', values: basicValues },
      { id: 'performance', label: 'Performance', values: performanceValues },
    ];
  }

  private toColumnKey(year: string): string {
    return year.toLowerCase().replace(/\s+/g, '').replace(/-/g, '_');
  }

  private formatCrore(value: number): string {
    return `₹${new Intl.NumberFormat('en-IN').format(value)} crore`;
  }
}
