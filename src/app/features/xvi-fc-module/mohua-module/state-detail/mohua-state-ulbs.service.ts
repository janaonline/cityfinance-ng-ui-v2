import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEnvelope, unwrapResponse } from '../api-response.util';
import { StateUlbsPage, StateUlbsQuery } from './state-detail.models';

@Injectable({ providedIn: 'root' })
export class MohuaStateUlbsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/mohua/state/`;

  getUlbs(stateId: string, yearId: string, query: StateUlbsQuery): Observable<StateUlbsPage> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('limit', String(query.limit))
      .set('sortBy', query.sortBy)
      .set('sortDir', query.sortDir);
    if (query.search.trim()) params = params.set('search', query.search.trim());

    return this.http
      .get<ApiEnvelope<StateUlbsPage> | StateUlbsPage>(`${this.baseUrl}${stateId}/${yearId}/ulbs`, { params })
      .pipe(map((response) => unwrapResponse(response)));
  }
}
