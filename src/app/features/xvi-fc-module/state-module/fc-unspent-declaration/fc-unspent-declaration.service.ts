import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  FcUnspentApiResponse,
  FcUnspentDeclarationData,
  FcUnspentSavePayload,
  FcUnspentUlbOption,
  FcUnspentUlbOptionsQuery,
  FcUnspentUlbOptionsResult,
} from './fc-unspent-declaration.models';

function ensureSuccessfulResponse<T>(response: FcUnspentApiResponse<T>): FcUnspentApiResponse<T> {
  if (!response.success) {
    // Throw the full response so the component can read message + field-keyed errors.
    throw response;
  }
  return response;
}

@Injectable({ providedIn: 'root' })
export class FcUnspentDeclarationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/state/fc-unspent-declaration/`;

  /**
   * Never includes the full ULB options list — that is served separately by `getUlbOptions()`,
   * only on real edit intent.
   */
  getForm(stateId: string, yearId: string): Observable<FcUnspentDeclarationData> {
    return this.http
      .get<FcUnspentApiResponse<FcUnspentDeclarationData>>(`${this.baseUrl}${stateId}/${yearId}`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as FcUnspentDeclarationData));
  }

  /** Lazy, paginated, State-scoped ULB lookup list for the Yes-branch row picker. */
  getUlbOptions(
    stateId: string,
    yearId: string,
    query: FcUnspentUlbOptionsQuery = {},
  ): Observable<FcUnspentUlbOptionsResult> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));

    return this.http
      .get<FcUnspentApiResponse<FcUnspentUlbOption[]>>(`${this.baseUrl}${stateId}/${yearId}/ulb-options`, { params })
      .pipe(
        map((res) => {
          const response = ensureSuccessfulResponse(res);
          const options = response.data ?? [];
          const meta = response.meta ?? {};
          return {
            options,
            page: typeof meta['page'] === 'number' ? meta['page'] : (query.page ?? 1),
            limit: typeof meta['limit'] === 'number' ? meta['limit'] : (query.limit ?? options.length),
            total: typeof meta['total'] === 'number' ? meta['total'] : options.length,
          };
        }),
      );
  }

  /**
   * Downloads the generated FC Unspent Declaration document (Word doc) — the nil-balance
   * declaration for the No branch, or the ULB-wise unspent-balance certification for the Yes
   * branch, chosen server-side by the form's stored `isFcUnspent`. Fetched as a raw `Blob`
   * (mirrors `EulbStatusService.downloadElectedBodiesListDocument`), not the signed-URL envelope
   * the old static-template endpoint used — the document is generated fresh per request now, so
   * there's no separate static asset to link to.
   */
  downloadDeclarationDocument(stateId: string, yearId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${stateId}/${yearId}/fc-unspent-declaration-document`, {
      responseType: 'blob',
    });
  }

  saveDraft(payload: FcUnspentSavePayload): Observable<void> {
    return this.http
      .post<FcUnspentApiResponse>(`${this.baseUrl}save-draft`, payload)
      .pipe(map((response) => void ensureSuccessfulResponse(response)));
  }

  finalSubmit(payload: FcUnspentSavePayload): Observable<void> {
    return this.http
      .post<FcUnspentApiResponse>(`${this.baseUrl}final-submit`, payload)
      .pipe(map((response) => void ensureSuccessfulResponse(response)));
  }
}
