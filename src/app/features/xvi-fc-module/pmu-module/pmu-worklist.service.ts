import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PmuApiResponse, PmuWorklistRow } from './pmu-review.models';

function ensureSuccessfulResponse<T>(response: PmuApiResponse<T>): PmuApiResponse<T> {
  if (!response.success) {
    // Throw the full response so the caller can read message + field-keyed errors.
    throw response;
  }
  return response;
}

/** Cross-state worklist list, shared across all 5 PMU modules since the response shape is
 *  identical — only `basePath` differs per form (see `PmuFormOption.basePath`). */
@Injectable({ providedIn: 'root' })
export class PmuWorklistService {
  private readonly http = inject(HttpClient);

  getWorklist(basePath: string, yearId: string): Observable<PmuWorklistRow[]> {
    return this.http
      .get<PmuApiResponse<{ rows: PmuWorklistRow[] }>>(`${environment.api.url2}${basePath}worklist/${yearId}`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data?.rows ?? []));
  }
}
