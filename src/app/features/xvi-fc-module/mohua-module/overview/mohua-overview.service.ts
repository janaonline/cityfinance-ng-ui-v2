import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEnvelope, unwrapResponse } from '../api-response.util';
import { MohuaOverviewApiData, OverviewData, STAGE_TO_STATUS, StateRow } from './overview.models';

@Injectable({ providedIn: 'root' })
export class MohuaOverviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/mohua/overview/`;

  getOverview(yearId: string): Observable<OverviewData> {
    return this.http
      .get<ApiEnvelope<MohuaOverviewApiData> | MohuaOverviewApiData>(`${this.baseUrl}${yearId}`)
      .pipe(map((response) => this.toOverview(unwrapResponse(response))));
  }

  private toOverview(data: MohuaOverviewApiData): OverviewData {
    const rows = data.states.map(
      (state): StateRow => ({
        stateId: state.id,
        code: state.code,
        name: state.name,
        status: STAGE_TO_STATUS[state.stage],
        underReviewSince: state.underReviewSince,
        allocation: state.allocation,
        eligible: state.eligible,
        ulbsDone: state.ulbsDone,
        ulbsTotal: state.ulbsTotal,
        formsDone: state.formsDone,
        forms: state.forms,
      }),
    );
    return { year: data.year, totals: data.totals, rows };
  }
}
