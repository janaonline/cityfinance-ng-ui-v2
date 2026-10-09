import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PmuApiResponse, PmuWorklistQuery, PmuWorklistResult, PmuWorklistRow } from './pmu-review.models';

function ensureSuccessfulResponse<T>(response: PmuApiResponse<T>): PmuApiResponse<T> {
  if (!response.success) {
    // Throw the full response so the caller can read message + field-keyed errors.
    throw response;
  }
  return response;
}

/** Cross-state worklist list, shared across all 5 PMU modules since the response shape is
 *  identical — only `basePath` differs per form (see `PmuFormOption.basePath`). Server-side
 *  filtered/sorted/paginated — mirrors `PmuRowReviewService.getRows()`'s own param-building and
 *  meta-parsing pattern exactly. */
@Injectable({ providedIn: 'root' })
export class PmuWorklistService {
  private readonly http = inject(HttpClient);

  getWorklist(basePath: string, yearId: string, query: PmuWorklistQuery): Observable<PmuWorklistResult> {
    let params = new HttpParams();
    if (query.stateId) params = params.set('stateId', query.stateId);
    if (query.status !== undefined) params = params.set('status', String(query.status));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortDir) params = params.set('sortDir', query.sortDir);
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));

    return this.http
      .get<
        PmuApiResponse<{ rows: PmuWorklistRow[] }>
      >(`${environment.api.url2}${basePath}worklist/${yearId}`, { params })
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
}
