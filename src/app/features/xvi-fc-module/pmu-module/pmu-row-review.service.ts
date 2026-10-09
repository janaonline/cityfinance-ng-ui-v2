import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PmuFormOption } from './pmu-review.config';
import {
  PmuApiResponse,
  PmuBulkActionData,
  PmuBulkApprovePayload,
  PmuBulkRejectPayload,
  PmuFormReviewData,
  PmuFormSubmitData,
  PmuRow,
  PmuRowsQuery,
  PmuRowsResult,
} from './pmu-review.models';

function ensureSuccessfulResponse<T>(response: PmuApiResponse<T>): PmuApiResponse<T> {
  if (!response.success) {
    // Throw the full response so the caller can read message + field-keyed errors.
    throw response;
  }
  return response;
}

/** Generic HTTP wrapper for the 2 row-level PMU reviewers (Elected Body / FC Unspent) —
 *  parameterized by `basePath` from `PmuFormOption`, mirroring `FcUnspentMohuaReviewService`'s own
 *  conventions exactly. `eligibility` is accepted on every call but only meaningful for FC Unspent
 *  — Elected Body's own backend endpoint simply ignores a query param it doesn't define. */
@Injectable({ providedIn: 'root' })
export class PmuRowReviewService {
  private readonly http = inject(HttpClient);

  getReview(form: PmuFormOption, stateId: string, yearId: string): Observable<PmuFormReviewData> {
    return this.http
      .get<PmuApiResponse<PmuFormReviewData>>(`${environment.api.url2}${form.basePath}${stateId}/${yearId}`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as PmuFormReviewData));
  }

  getRows(form: PmuFormOption, stateId: string, yearId: string, query: PmuRowsQuery): Observable<PmuRowsResult> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));
    if (query.rowStatus?.length) params = params.set('rowStatus', query.rowStatus.join(','));
    if (query.eligibility !== undefined) params = params.set('eligibility', String(query.eligibility));
    if (query.sortBy !== undefined) params = params.set('sortBy', query.sortBy);
    if (query.sortDir !== undefined) params = params.set('sortDir', query.sortDir);

    return this.http
      .get<PmuApiResponse<{ rows: PmuRow[] }>>(`${environment.api.url2}${form.basePath}${stateId}/${yearId}/rows`, {
        params,
      })
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
            pendingTotal: typeof meta['pendingTotal'] === 'number' ? meta['pendingTotal'] : rows.length,
          };
        }),
      );
  }

  bulkApproveRows(form: PmuFormOption, payload: PmuBulkApprovePayload): Observable<PmuBulkActionData> {
    return this.http
      .post<PmuApiResponse<PmuBulkActionData>>(`${environment.api.url2}${form.basePath}rows/approve`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as PmuBulkActionData));
  }

  bulkRejectRows(form: PmuFormOption, payload: PmuBulkRejectPayload): Observable<PmuBulkActionData> {
    return this.http
      .post<PmuApiResponse<PmuBulkActionData>>(`${environment.api.url2}${form.basePath}rows/reject`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as PmuBulkActionData));
  }

  approveForm(form: PmuFormOption, stateId: string, yearId: string): Observable<PmuFormSubmitData> {
    return this.http
      .post<
        PmuApiResponse<PmuFormSubmitData>
      >(`${environment.api.url2}${form.basePath}${stateId}/${yearId}/approve`, {})
      .pipe(map((response) => ensureSuccessfulResponse(response).data as PmuFormSubmitData));
  }

  rejectForm(form: PmuFormOption, stateId: string, yearId: string, pmuRemarks: string): Observable<PmuFormSubmitData> {
    return this.http
      .post<PmuApiResponse<PmuFormSubmitData>>(`${environment.api.url2}${form.basePath}${stateId}/${yearId}/reject`, {
        pmuRemarks,
      })
      .pipe(map((response) => ensureSuccessfulResponse(response).data as PmuFormSubmitData));
  }
}
