import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../../src/environments/environment';

import {
  DisbursementColumn,
  DisbursementRow,
  StateOverviewApiResponse,
} from './overview-card.models';
import { OverviewData } from '../../shared/overview-card/overview-card.component';

@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  private readonly http = inject(HttpClient);

  // private readonly baseUrl = 'http://localhost:3001/api/v2';
  private readonly baseUrl = environment.api.url2;

  getStateOverview(stateId: string): Observable<StateOverviewApiResponse> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('id_token') : null;
    const headers = new HttpHeaders(
      token ? { Authorization: `Bearer ${token}`, 'x-access-token': token } : {},
    );
    return this.http
      .get<{ success: boolean; data: StateOverviewApiResponse; timestamp: string }>(
        `${this.baseUrl}xvi-fc/state/${stateId}`,
        { headers },
      )
      .pipe(map((wrapper) => wrapper.data));
  }

  getOverviewViewModel(stateId: string): Observable<{
    stateOverviewData: OverviewData;
    disbursementColumns: DisbursementColumn[];
    disbursementRows: DisbursementRow[];
  }> {
    return this.getStateOverview(stateId).pipe(
      map((response) => {
        const stateOverviewData = this.mapToOverviewData(response);
        const disbursementColumns = this.mapToDisbursementColumns(response);
        const disbursementRows = this.mapToDisbursementRows(response);

        return {
          stateOverviewData,
          disbursementColumns,
          disbursementRows,
        };
      }),
    );
  }

  private mapToOverviewData(response: StateOverviewApiResponse): OverviewData {
    const firstYear = response.tableData[0]?.year ?? '-';
    const totalBasic = response.tableData.reduce((sum, row) => sum + row.basic, 0);
    const totalPerformance = response.tableData.reduce((sum, row) => sum + row.performance, 0);

    return {
      name: response.stateName,
      financialYear: `FY-${response.years}`,
      subHeader1: `TOTAL 5-YEAR ALLOCATION`,
      subHeader2: 'BASIC + PERFORMANCE',
      totalAllocation: this.formatCrore(response.totalAllocation),
      totalAllocationNote: `For ${response.totalUlbs} ULBs in ${response.stateName}`,
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
            'Released as part of the state’s overall grant support framework.',
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
        {
          id: 'specialInfrastructure ',
          label: 'Special Infrastructure',
          componentLabel: 'Grant Component',
          title: 'Special Infrastructure Grants',
          amount: '₹56,100 crore',
          points: [
            'Covers 60% of project cost',
            'Remaining cost to be shared by state governments and ULBs',
            'Eligible cities in AP: Visakhapatnam, Vijayawada',
          ],
        },
        {
          id: 'urbanizationPremium',
          label: 'Urbanization Premium',
          componentLabel: 'Grant Component',
          title: 'Urbanization Premium Grants',
          amount: '₹10,000 crore',
          points: [
            'A one-time grant to support the integration of peri-urban villages into cities with populations above 1 lakh.',
            'Requires states to adopt a rural–urban transition policy.',
          ],
        },
      ],
    };
  }

  private mapToDisbursementColumns(response: StateOverviewApiResponse): DisbursementColumn[] {
    return response.tableData.map((row, index) => ({
      key: this.toColumnKey(row.year),
      label: row.year.replace('FY', 'FY '),
      highlight: index === 0,
    }));
  }

  private mapToDisbursementRows(response: StateOverviewApiResponse): DisbursementRow[] {
    const basicValues: Record<string, string> = {};
    const performanceValues: Record<string, string> = {};

    response.tableData.forEach((row) => {
      const key = this.toColumnKey(row.year);

      basicValues[key] = this.formatCrore(row.basic);
      performanceValues[key] = row.performance > 0 ? this.formatCrore(row.performance) : '—';
    });

    return [
      {
        id: 'basic',
        label: 'Basic',
        values: basicValues,
      },
      {
        id: 'performance',
        label: 'Performance',
        values: performanceValues,
      },
    ];
  }

  private toColumnKey(year: string): string {
    return year.toLowerCase().replace(/\s+/g, '').replace(/-/g, '_');
  }

  private formatCrore(value: number): string {
    return `₹${new Intl.NumberFormat('en-IN').format(value)} crore`;
  }
}
