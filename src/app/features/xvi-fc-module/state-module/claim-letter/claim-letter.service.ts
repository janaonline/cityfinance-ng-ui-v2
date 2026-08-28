import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { parseContentDispositionFileName, XviFcDownloadedFile } from '../../download-file-name.util';
import { UploadedFileMetadata } from '../../../../shared/dynamic-form/components/file/file-metadata.types';
import {
  CLAIM_LETTER_ULB_ROWS_PAGE_SIZE,
  ClaimLetterApiResponse,
  ClaimLetterBatchSummary,
  ClaimLetterClaimContext,
  ClaimLetterDocumentData,
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

  /** Lean sibling of `getEligibilitySummary` for the create/edit page — same financial/batch-slot/
   *  ULB-count fields, without the expensive eligibility-checklist evaluation neither page mode
   *  displays. */
  getClaimContext(
    stateId: string,
    yearId: string,
    installment: ClaimLetterInstallment,
  ): Observable<ClaimLetterClaimContext> {
    return this.http
      .get<
        ClaimLetterApiResponse<ClaimLetterClaimContext>
      >(`${this.baseUrl}${stateId}/${yearId}/${installment}/claim-context`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterClaimContext));
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

  /** Covering letter + Annexure 1 + Annexure 2 content for Preview Template — fetch once, also used
   *  by Download Template just to derive the filename (see `claim-letter-detail.component.ts`). The
   *  PDF itself comes from `downloadDocumentPdf()` below, not from this data. */
  getDocumentData(claimLetterId: string): Observable<ClaimLetterDocumentData> {
    return this.http
      .get<ClaimLetterApiResponse<ClaimLetterDocumentData>>(`${this.baseUrl}${claimLetterId}/document`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as ClaimLetterDocumentData));
  }

  /** Server-rendered PDF of the same document `getDocumentData()` returns as JSON — rendered
   *  backend-side (not client-side `pdfmake`, which needs `'unsafe-eval'` in `script-src` and
   *  breaks under a strict CSP) — mirrors Devolution Formula's `downloadTemplate()` blob pattern.
   *  `observe: 'response'` lets the caller read the backend's complete `Content-Disposition`
   *  filename via `download-file-name.util.ts`'s `parseContentDispositionFileName` — the component
   *  saves it verbatim (falling back to a literal derived from `getDocumentData()`'s `refNo` if
   *  that header is missing/unparseable), rather than reconstructing it client-side. */
  downloadDocumentPdf(claimLetterId: string): Observable<XviFcDownloadedFile> {
    return this.http
      .get(`${this.baseUrl}${claimLetterId}/document/pdf`, { responseType: 'blob', observe: 'response' })
      .pipe(
        map((response) => ({
          blob: response.body as Blob,
          fileName: parseContentDispositionFileName(response.headers.get('Content-Disposition')),
        })),
      );
  }

  /**
   * Pages through `getUlbs()` until every row of the batch has been fetched, rather than trusting a
   * single (backend-defaulted, ≤20-row) page — a batch can have 700+ ULBs, and both the displayed
   * total and the save payload must reflect all of them, not just the first page. Emits once, with
   * the fully-accumulated row list.
   */
  getAllUlbs(claimLetterId: string, search?: string): Observable<ClaimLetterUlbRow[]> {
    const limit = CLAIM_LETTER_ULB_ROWS_PAGE_SIZE;
    return this.getUlbs(claimLetterId, { search, page: 1, limit }).pipe(
      expand((result) =>
        result.rows.length > 0 && result.page * result.limit < result.total
          ? this.getUlbs(claimLetterId, { search, page: result.page + 1, limit })
          : EMPTY,
      ),
      reduce((allRows: ClaimLetterUlbRow[], result) => allRows.concat(result.rows), []),
    );
  }
}
