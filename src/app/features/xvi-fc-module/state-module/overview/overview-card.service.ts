import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, forkJoin } from 'rxjs';
import { environment } from '../../../../../environments/environment';

import {
  DisbursementColumn,
  DisbursementRow,
  StateOverviewApiResponse,
} from './overview-card.models';
import { getEligibleCitiesLabel } from './eligible-cities.data';
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
      .get<any>(`${this.baseUrl}xvi-fc/state/${stateId}`, { headers })
      .pipe(map((wrapper) => (wrapper?.data ?? wrapper) as StateOverviewApiResponse));
  }

  getStateName(stateId: string): Observable<string> {
    return this.http
      .get<any>(`${this.baseUrl}xvi-fc/state-info/${stateId}`)
      .pipe(
        map((res) => ((res?.data ?? res) as { stateName: string }).stateName),
        catchError(() => of('')),
      );
  }

  getOverviewViewModel(stateId: string): Observable<{
    stateOverviewData: OverviewData;
    disbursementColumns: DisbursementColumn[];
    disbursementRows: DisbursementRow[];
  }> {
    return forkJoin({
      overview: this.getStateOverview(stateId),
      stateName: this.getStateName(stateId),
    }).pipe(
      map(({ overview, stateName }) => {
        const merged = { ...overview, stateName: stateName || overview.stateName };
        return {
          stateOverviewData: this.mapToOverviewData(merged),
          disbursementColumns: this.mapToDisbursementColumns(merged),
          disbursementRows: this.mapToDisbursementRows(merged),
        };
      }),
    );
  }

  private mapToOverviewData(response: StateOverviewApiResponse): OverviewData {
    const totalBasic = response.tableData.reduce((sum, row) => sum + row.basic, 0);
    const totalPerformance = response.tableData.reduce((sum, row) => sum + row.performance, 0);
    const eligibleCities = getEligibleCitiesLabel(response.stateName);

    return {
      name: response.stateName,
      financialYear: `FY-${response.years}`,
      subHeader1: 'TOTAL 5-YEAR ALLOCATION',
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
          description: 'Basic grants are allocated as 50% tied and 50% untied, subject to:',
          points: [
            'Confirmation of an active SFC and timely submission of the ATR',
            'Confirmation of elected bodies in the ULB',
            'Submission of audited and provisional financial statements',
          ],
        },
        {
          id: 'performance',
          label: 'Performance Grants',
          componentLabel: 'Grant Component',
          title: 'Performance Grants',
          amount: this.formatCrore(totalPerformance),
          description: 'Untied performance grants contingent on:',
          points: [
            'Achievement of 5% annual increase in OSR',
            "States transferring a matching grant of at least 20% of the Union Finance Commission's basic grants to local governments",
          ],
        },
        {
          id: 'specialInfrastructure',
          label: 'Special Infrastructure',
          componentLabel: 'Grant Component',
          title: 'Special Infrastructure Grants',
          amount: '₹56,100 crore',
          amountSuffix: 'for 22 cities',
          description: 'Grants for cities with 1–4M population to undertake wastewater management projects:',
          points: [
            'Covers 60% of project cost',
            'Remaining cost to be shared by state governments and ULBs',
            ...(eligibleCities ? [eligibleCities] : []),
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
