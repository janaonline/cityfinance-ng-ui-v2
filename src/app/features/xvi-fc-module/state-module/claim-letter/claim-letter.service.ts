import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UploadedFileMetadata } from '../../../../shared/dynamic-form/components/file/file-metadata.types';
import {
  ClaimLetterApiResponse,
  ClaimLetterBatchSummary,
  ClaimLetterEligibilitySummary,
  ClaimLetterHistoryQuery,
  ClaimLetterHistoryResult,
  ClaimLetterInstallment,
  ClaimLetterUlbOption,
  ClaimLetterUlbOptionsQuery,
  ClaimLetterUlbOptionsResult,
  ClaimLetterUlbRow,
  ClaimLetterUlbRowsQuery,
  ClaimLetterUlbRowsResult,
  CreateClaimLetterDraftPayload,
  UpdateClaimLetterDraftPayload,
} from './claim-letter.models';

function ensureSuccessfulResponse<T>(response: ClaimLetterApiResponse<T>): ClaimLetterApiResponse<T> {
  if (!response.success) {
    // Throw the full response so the component can read message + errors, same as FC Unspent.
    throw response;
  }
  return response;
}

@Injectable({ providedIn: 'root' })
export class ClaimLetterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/state/claim-letter/`;

  getEligibilitySummary(
    stateId: string,
    yearId: string,
    installment: ClaimLetterInstallment,
  ): Observable<ClaimLetterEligibilitySummary> {
    return this.http
      .get<
        ClaimLetterApiResponse<ClaimLetterEligibilitySummary>
      >(`${this.baseUrl}${stateId}/${yearId}/${installment}/eligibility-summary`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterEligibilitySummary));
  }

  /** Lazy, paginated, State-scoped ULB lookup list for the select dialog. */
  getUlbOptions(
    stateId: string,
    yearId: string,
    installment: ClaimLetterInstallment,
    query: ClaimLetterUlbOptionsQuery = {},
  ): Observable<ClaimLetterUlbOptionsResult> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.eligibilityFilter) params = params.set('eligibilityFilter', query.eligibilityFilter);
    if (query.claimLetterId) params = params.set('claimLetterId', query.claimLetterId);
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));

    return this.http
      .get<
        ClaimLetterApiResponse<ClaimLetterUlbOption[]>
      >(`${this.baseUrl}${stateId}/${yearId}/${installment}/ulb-options`, { params })
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

  createDraft(
    stateId: string,
    yearId: string,
    installment: ClaimLetterInstallment,
    payload: CreateClaimLetterDraftPayload,
  ): Observable<ClaimLetterBatchSummary> {
    return this.http
      .post<
        ClaimLetterApiResponse<ClaimLetterBatchSummary>
      >(`${this.baseUrl}${stateId}/${yearId}/${installment}/draft`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterBatchSummary));
  }

  updateDraft(claimLetterId: string, payload: UpdateClaimLetterDraftPayload): Observable<ClaimLetterBatchSummary> {
    return this.http
      .patch<ClaimLetterApiResponse<ClaimLetterBatchSummary>>(`${this.baseUrl}${claimLetterId}/draft`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterBatchSummary));
  }

  abandonDraft(claimLetterId: string): Observable<ClaimLetterBatchSummary> {
    return this.http
      .post<ClaimLetterApiResponse<ClaimLetterBatchSummary>>(`${this.baseUrl}${claimLetterId}/abandon`, {})
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterBatchSummary));
  }

  uploadSignedFile(claimLetterId: string, fileRef: UploadedFileMetadata): Observable<ClaimLetterBatchSummary> {
    return this.http
      .post<ClaimLetterApiResponse<ClaimLetterBatchSummary>>(`${this.baseUrl}${claimLetterId}/signed-file`, fileRef)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterBatchSummary));
  }

  submit(claimLetterId: string): Observable<ClaimLetterBatchSummary> {
    return this.http
      .post<ClaimLetterApiResponse<ClaimLetterBatchSummary>>(`${this.baseUrl}${claimLetterId}/submit`, {})
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterBatchSummary));
  }

  listHistory(
    stateId: string,
    yearId: string,
    query: ClaimLetterHistoryQuery = {},
  ): Observable<ClaimLetterHistoryResult> {
    let params = new HttpParams();
    if (query.installment !== undefined) params = params.set('installment', String(query.installment));
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));

    return this.http
      .get<ClaimLetterApiResponse<ClaimLetterBatchSummary[]>>(`${this.baseUrl}${stateId}/${yearId}/history`, { params })
      .pipe(
        map((res) => {
          const response = ensureSuccessfulResponse(res);
          const claims = response.data ?? [];
          const meta = response.meta ?? {};
          return {
            claims,
            page: typeof meta['page'] === 'number' ? meta['page'] : (query.page ?? 1),
            limit: typeof meta['limit'] === 'number' ? meta['limit'] : (query.limit ?? claims.length),
            total: typeof meta['total'] === 'number' ? meta['total'] : claims.length,
          };
        }),
      );
  }

  getDetail(claimLetterId: string): Observable<ClaimLetterBatchSummary> {
    return this.http
      .get<ClaimLetterApiResponse<ClaimLetterBatchSummary>>(`${this.baseUrl}${claimLetterId}`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterBatchSummary));
  }

  getUlbs(claimLetterId: string, query: ClaimLetterUlbRowsQuery = {}): Observable<ClaimLetterUlbRowsResult> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));

    return this.http
      .get<ClaimLetterApiResponse<ClaimLetterUlbRow[]>>(`${this.baseUrl}${claimLetterId}/ulbs`, { params })
      .pipe(
        map((res) => {
          const response = ensureSuccessfulResponse(res);
          const rows = response.data ?? [];
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
