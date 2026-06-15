import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { DisbursementColumn, DisbursementRow, UlbOverviewApiResponse } from './overview-card.models';
import { OverviewData } from '../../shared/overview-card/overview-card.component';

const DUMMY_TABLE_DATA: UlbOverviewApiResponse['tableData'] = [
  { year: 'FY2026-27', basic: 312, performance: 148 },
  { year: 'FY2027-28', basic: 320, performance: 155 },
  { year: 'FY2028-29', basic: 335, performance: 162 },
  { year: 'FY2029-30', basic: 348, performance: 170 },
  { year: 'FY2030-31', basic: 360, performance: 148 },
];

@Injectable({
  providedIn: 'root',
})
export class UlbOverviewService {
  private readonly http = inject(HttpClient);

  getOverviewViewModel(ulbId: string): Observable<{
    ulbOverviewData: OverviewData;
    disbursementColumns: DisbursementColumn[];
    disbursementRows: DisbursementRow[];
  }> {
    return this.http
      .get<any>(`${environment.api.url2}xvi-fc/ulb/${ulbId}`)
      .pipe(
        tap((res) => {
          const d = res?.data ?? res;
          const raw = localStorage.getItem('xvifc_selectedYearString') ?? '';
          const selectedYear = raw.replace(/^FY-/, 'FY ');
          localStorage.setItem(
            'xvifc_ulb_details',
            JSON.stringify({ ulbName: d.ulbName, stateName: d.stateName, selectedYear }),
          );
        }),
        map((res) => {
          const d = res?.data ?? res;
          const { ulbName, stateName } = d as { ulbName: string; stateName: string };
          return this.buildViewModel(ulbId, ulbName, stateName);
        }),
        catchError(() => of(this.buildViewModel(ulbId, '', ''))),
      );
  }

  private buildViewModel(
    ulbId: string,
    ulbName: string,
    stateName: string,
  ): {
    ulbOverviewData: OverviewData;
    disbursementColumns: DisbursementColumn[];
    disbursementRows: DisbursementRow[];
  } {
    const response: UlbOverviewApiResponse = {
      totalAllocation: 0,
      ulbId,
      ulbName,
      stateName,
      years: '2026-27 to 2030-31',
      tableData: DUMMY_TABLE_DATA,
    };
    return {
      ulbOverviewData: this.mapToOverviewData(response),
      disbursementColumns: this.mapToDisbursementColumns(response),
      disbursementRows: this.mapToDisbursementRows(response),
    };
  }

  private mapToOverviewData(response: UlbOverviewApiResponse): OverviewData {
    return {
      name: response.ulbName,
      financialYear: 'FY 2026-27',
      subHeader1: 'BASIC GRANT ONLY',
      subHeader2: 'Based on SFC data, population figures, and CF calculations',
      totalAllocation: '₹___ crore',
      totalAllocationNote: `For ${response.ulbName}, ${response.stateName}`,
      grantSections: [
        {
          id: 'grantEstimate',
          label: 'Grant Estimate',
          componentLabel: 'Grant Component',
          title: 'Grant Estimate for FY 2026-27',
          amount: '₹___ crore',
          description: 'Grant structure:',
          points: [
            '₹___ crore — Tied grant (SWM & Water)',
            '₹___ crore — Untied grant (General use)',
          ],
          note: 'Grants cannot be used for salaries or establishment expenditure. Untied: max 20% on roads (₹___ crore).',
        },
        {
          id: 'eligibilityRequirements',
          label: 'Eligibility Requirements',
          componentLabel: 'Entry Conditions',
          title: 'Eligibility Requirements for FY 2026-27',
          description: 'The following conditions must be met:',
          points: [
            'State confirmation of SFC status and submission of the ATR report',
            'State confirmation of elected body status for the ULB',
            {
              text: 'ULB submission of financial statements:',
              subPoints: [
                'FY 2024-25 audited statements',
                'FY 2025-26 provisional statements',
              ],
            },
          ],
        },
        {
          id: 'grantRelease',
          label: 'Grant Release and Usage Guidelines',
          componentLabel: 'Release Process',
          title: 'Grant Release and Usage Guidelines',
          points: [
            'In the first year (FY 2026-27), only basic grants will apply. Performance-linked grants to begin from FY 2027-28.',
            'Funds will be released in two installments.',
            'Submissions are reviewed by MoHUA on a rolling basis, and funds are released by DoE after approvals are completed.',
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
      basicValues[key] = '___';
      performanceValues[key] = '___';
    });

    return [
      { id: 'basic', label: 'Basic', values: basicValues },
      { id: 'performance', label: 'Performance', values: performanceValues },
    ];
  }

  private toColumnKey(year: string): string {
    return year.toLowerCase().replace(/\s+/g, '').replace(/-/g, '_');
  }
}
