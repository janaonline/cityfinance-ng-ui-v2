import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  FcUnspentApiResponse,
  FcUnspentMohuaBulkActionData,
  FcUnspentMohuaBulkApprovePayload,
  FcUnspentMohuaBulkRejectPayload,
  FcUnspentMohuaRejectFormPayload,
  FcUnspentMohuaReviewData,
  FcUnspentMohuaRow,
  FcUnspentMohuaRowsQuery,
  FcUnspentMohuaRowsResult,
  FcUnspentMohuaSubmitData,
} from './fc-unspent-review.models';

function ensureSuccessfulResponse<T>(response: FcUnspentApiResponse<T>): FcUnspentApiResponse<T> {
  if (!response.success) {
    // Throw the full response so the component can read message + field-keyed errors.
    throw response;
  }
  return response;
}

@Injectable({ providedIn: 'root' })
export class FcUnspentMohuaReviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/mohua/fc-unspent-declaration/`;

  getReview(stateId: string, yearId: string): Observable<FcUnspentMohuaReviewData> {
    return this.http
      .get<FcUnspentApiResponse<FcUnspentMohuaReviewData>>(`${this.baseUrl}${stateId}/${yearId}`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as FcUnspentMohuaReviewData));
  }

  getRows(stateId: string, yearId: string, query: FcUnspentMohuaRowsQuery): Observable<FcUnspentMohuaRowsResult> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));
    if (query.rowStatus !== undefined) params = params.set('rowStatus', String(query.rowStatus));
    if (query.eligibility !== undefined) params = params.set('eligibility', String(query.eligibility));

    return this.http
      .get<FcUnspentApiResponse<{ rows: FcUnspentMohuaRow[] }>>(`${this.baseUrl}${stateId}/${yearId}/rows`, { params })
      .pipe(
        map((res) => {
          const response = ensureSuccessfulResponse(res);
          const rows = response.data?.rows ?? [];
          const meta = response.meta ?? {};
          return {
            rows,
            page: typeof meta['page'] === 'number' ? meta['page'] : (query.page ?? 1),
            limit: typeof meta['limit'] === 'number' ? meta['limit'] : (query.limit ?? rows.length),
            total: typeof meta['total'] === 'number' ? meta['total'] : rows.length,
          };
        }),
      );
  }

  bulkApproveRows(payload: FcUnspentMohuaBulkApprovePayload): Observable<FcUnspentMohuaBulkActionData> {
    return this.http
      .post<FcUnspentApiResponse<FcUnspentMohuaBulkActionData>>(`${this.baseUrl}rows/approve`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as FcUnspentMohuaBulkActionData));
  }

  bulkRejectRows(payload: FcUnspentMohuaBulkRejectPayload): Observable<FcUnspentMohuaBulkActionData> {
    return this.http
      .post<FcUnspentApiResponse<FcUnspentMohuaBulkActionData>>(`${this.baseUrl}rows/reject`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as FcUnspentMohuaBulkActionData));
  }

  approveForm(stateId: string, yearId: string): Observable<FcUnspentMohuaSubmitData> {
    return this.http
      .post<FcUnspentApiResponse<FcUnspentMohuaSubmitData>>(`${this.baseUrl}${stateId}/${yearId}/approve`, {})
      .pipe(map((response) => ensureSuccessfulResponse(response).data as FcUnspentMohuaSubmitData));
  }

  rejectForm(stateId: string, yearId: string, payload: FcUnspentMohuaRejectFormPayload): Observable<FcUnspentMohuaSubmitData> {
    return this.http
      .post<FcUnspentApiResponse<FcUnspentMohuaSubmitData>>(`${this.baseUrl}${stateId}/${yearId}/reject`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as FcUnspentMohuaSubmitData));
  }
}
