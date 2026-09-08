import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ApiResponse,
  ManualReviewHistoryQuery,
  ManualReviewHistoryResult,
  ManualReviewHistoryRow,
} from './manual-review-history.models';

@Injectable({ providedIn: 'root' })
export class ManualReviewHistoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/annual-account/`;

  getHistory(query: ManualReviewHistoryQuery): Observable<ManualReviewHistoryResult> {
    let params = new HttpParams().set('page', String(query.page)).set('pageSize', String(query.pageSize));
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.stateId) params = params.set('stateId', query.stateId);
    if (query.requestedFrom) params = params.set('requestedFrom', query.requestedFrom);
    if (query.requestedTo) params = params.set('requestedTo', query.requestedTo);
    if (query.decidedFrom) params = params.set('decidedFrom', query.decidedFrom);
    if (query.decidedTo) params = params.set('decidedTo', query.decidedTo);
    if (query.breachedOnly) params = params.set('breachedOnly', 'true');

    return this.http
      .get<ApiResponse<ManualReviewHistoryResult>>(`${this.baseUrl}manual-review-history`, { params })
      .pipe(map((response) => response.data));
  }

  getById(requestId: string): Observable<ManualReviewHistoryRow> {
    return this.http
      .get<ApiResponse<ManualReviewHistoryRow>>(`${this.baseUrl}manual-review-history/${requestId}`)
      .pipe(map((response) => response.data));
  }
}
