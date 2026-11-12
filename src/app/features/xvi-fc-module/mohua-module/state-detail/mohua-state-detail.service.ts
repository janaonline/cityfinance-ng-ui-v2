import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEnvelope, unwrapResponse } from '../api-response.util';
import { STAGE_TO_STATUS } from '../overview/overview.models';
import { MohuaStateDetailApiData, StateDetailData } from './state-detail.models';

@Injectable({ providedIn: 'root' })
export class MohuaStateDetailService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/mohua/state/`;

  getDetail(stateId: string, yearId: string): Observable<StateDetailData> {
    return this.http
      .get<ApiEnvelope<MohuaStateDetailApiData> | MohuaStateDetailApiData>(`${this.baseUrl}${stateId}/${yearId}`)
      .pipe(map((response) => this.toDetail(unwrapResponse(response))));
  }

  private toDetail(data: MohuaStateDetailApiData): StateDetailData {
    return {
      year: data.year,
      state: {
        id: data.state.id,
        code: data.state.code,
        name: data.state.name,
        status: STAGE_TO_STATUS[data.state.stage],
      },
      allocation: data.allocation,
      forms: data.forms,
      formsDone: data.formsDone,
      ulbForms: data.ulbForms,
    };
  }
}
