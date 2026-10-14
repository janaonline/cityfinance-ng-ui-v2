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

  /**
   * The table as an Excel file — the same search and sort the table is showing, every page. The API names the file
   * (Content-Disposition); `fileName` is null when the browser does not expose that header.
   */
  exportUlbs(
    stateId: string,
    yearId: string,
    query: Pick<StateUlbsQuery, 'search' | 'sortBy' | 'sortDir'>,
  ): Observable<{ blob: Blob; fileName: string | null }> {
    let params = new HttpParams().set('sortBy', query.sortBy).set('sortDir', query.sortDir);
    if (query.search.trim()) params = params.set('search', query.search.trim());

    return this.http
      .get(`${this.baseUrl}${stateId}/${yearId}/ulbs/export`, { params, responseType: 'blob', observe: 'response' })
      .pipe(
        map((response) => ({
          blob: response.body as Blob,
          fileName: /filename="([^"]+)"/.exec(response.headers.get('Content-Disposition') ?? '')?.[1] ?? null,
        })),
      );
  }
}
