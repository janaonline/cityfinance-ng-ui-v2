import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
      .get<any>(
        `${environment.api.url2}xvi-fc/ulb/${ulbId}`,
      )
      .pipe(
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
      financialYear: `FY-${response.years}`,
      subHeader1: 'TOTAL 5-YEAR ALLOCATION',
      subHeader2: 'BASIC + PERFORMANCE',
      totalAllocation: '₹___ crore',
      totalAllocationNote: `For ${response.ulbName}, ${response.stateName}`,
      grantSections: [
        {
          id: 'basic',
          label: 'Basic Grants',
          componentLabel: 'Grant Component',
          title: 'Basic Grants',
          amount: '₹___ crore',
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
          amount: '₹___ crore',
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
