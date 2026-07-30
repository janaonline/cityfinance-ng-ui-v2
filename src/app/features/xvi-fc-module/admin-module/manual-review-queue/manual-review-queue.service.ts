import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  AnnualAccountSectionKey,
  ApiResponse,
  ManualReviewDecisionPayload,
  ManualReviewQueueQuery,
  ManualReviewQueueResult,
} from './manual-review-queue.models';

@Injectable({ providedIn: 'root' })
export class ManualReviewQueueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/annual-account/`;

  getQueue(query: ManualReviewQueueQuery): Observable<ManualReviewQueueResult> {
    let params = new HttpParams().set('page', String(query.page)).set('pageSize', String(query.pageSize));
    if (query.search) params = params.set('search', query.search);

    return this.http
      .get<ApiResponse<ManualReviewQueueResult>>(`${this.baseUrl}manual-review-queue`, { params })
      .pipe(map((response) => response.data));
  }

  decide(
    annualAccountId: string,
    section: AnnualAccountSectionKey,
    docId: string,
    payload: ManualReviewDecisionPayload,
  ): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(
        `${this.baseUrl}${annualAccountId}/documents/${docId}/manual-review/decision?section=${section}`,
        payload,
      )
      .pipe(map(() => undefined));
  }
}
