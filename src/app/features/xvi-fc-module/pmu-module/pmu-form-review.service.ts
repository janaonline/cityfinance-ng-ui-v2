import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PmuFormOption } from './pmu-review.config';
import {
  PmuApiResponse,
  PmuDevolutionRow,
  PmuDevolutionRowsQuery,
  PmuDevolutionRowsResult,
  PmuFormReviewData,
  PmuFormSubmitData,
} from './pmu-review.models';

function ensureSuccessfulResponse<T>(response: PmuApiResponse<T>): PmuApiResponse<T> {
  if (!response.success) {
    // Throw the full response so the caller can read message + field-keyed errors.
    throw response;
  }
  return response;
}

/** Generic HTTP wrapper for the 3 form-level-only PMU reviewers (SFC Status / GTC / Devolution
 *  Formula) — parameterized by `basePath`/`installmentScoped` from `PmuFormOption` rather than one
 *  copy per form, since these methods carry no business logic of their own (just URL-building +
 *  envelope-unwrapping), unlike the backend's deliberately-separate per-form services. Mirrors
 *  `FcUnspentMohuaReviewService`'s own conventions exactly. */
@Injectable({ providedIn: 'root' })
export class PmuFormReviewService {
  private readonly http = inject(HttpClient);

  private buildUrl(
    form: Pick<PmuFormOption, 'basePath' | 'installmentScoped'>,
    stateId: string,
    yearId: string,
    installment: 1 | 2 | undefined,
    ...segments: string[]
  ): string {
    const base = `${environment.api.url2}${form.basePath}${stateId}/${yearId}`;
    const withInstallment = form.installmentScoped ? `${base}/${installment}` : base;
    return [withInstallment, ...segments].join('/');
  }

  getReview(form: PmuFormOption, stateId: string, yearId: string, installment?: 1 | 2): Observable<PmuFormReviewData> {
    return this.http
      .get<PmuApiResponse<PmuFormReviewData>>(this.buildUrl(form, stateId, yearId, installment))
      .pipe(map((response) => ensureSuccessfulResponse(response).data as PmuFormReviewData));
  }

  /** Read-only — only called when `form.hasReadOnlyRows` is true (Devolution Formula today). */
  getRows(
    form: PmuFormOption,
    stateId: string,
    yearId: string,
    installment: 1 | 2 | undefined,
    query: PmuDevolutionRowsQuery,
  ): Observable<PmuDevolutionRowsResult> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));

    return this.http
      .get<PmuApiResponse<{ rows: PmuDevolutionRow[] }>>(this.buildUrl(form, stateId, yearId, installment, 'rows'), {
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
          };
        }),
      );
  }

  approveForm(
    form: PmuFormOption,
    stateId: string,
    yearId: string,
    installment?: 1 | 2,
  ): Observable<PmuFormSubmitData> {
    return this.http
      .post<PmuApiResponse<PmuFormSubmitData>>(this.buildUrl(form, stateId, yearId, installment, 'approve'), {})
      .pipe(map((response) => ensureSuccessfulResponse(response).data as PmuFormSubmitData));
  }

  rejectForm(
    form: PmuFormOption,
    stateId: string,
    yearId: string,
    pmuRemarks: string,
    installment?: 1 | 2,
  ): Observable<PmuFormSubmitData> {
    return this.http
      .post<PmuApiResponse<PmuFormSubmitData>>(this.buildUrl(form, stateId, yearId, installment, 'reject'), {
        pmuRemarks,
      })
      .pipe(map((response) => ensureSuccessfulResponse(response).data as PmuFormSubmitData));
  }
}
