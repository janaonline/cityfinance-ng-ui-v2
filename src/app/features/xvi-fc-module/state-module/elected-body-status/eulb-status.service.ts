import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { parseContentDispositionFileName, XviFcDownloadedFile } from '../../download-file-name.util';
import {
  EulbDeleteUploadedExcelResponse,
  EulbFinalSubmitPayload,
  EulbFormApiResponse,
  EulbFormResponseData,
  EulbMutationApiResponse,
  EulbPostSubmissionUpdateMetadata,
  EulbPostSubmissionUpdateMetadataResponse,
  EulbPostSubmissionUpdateRowsData,
  EulbPostSubmissionUpdateRowsQuery,
  EulbPostSubmissionUpdateRowsResponse,
  EulbPostSubmissionUpdateSubmitPayload,
  EulbPostSubmissionUpdateSubmitResponse,
  EulbPostSubmissionUpdateValidatePayload,
  EulbPostSubmissionUpdateValidateResponse,
  EulbRevalidateExcelResponse,
  EulbRowsApiResponse,
  EulbRowsQuery,
  EulbSaveDraftPayload,
  EulbUpdateRowPayload,
  EulbUpdateRowResponse,
  EulbValidateExcelPayload,
  EulbValidateExcelResponse,
} from './eulb-status.models';
import { isRecord } from './eulb-status.utils';

function ensureSuccessfulResponse<T>(response: T): T {
  if (isRecord(response) && response['success'] === false) {
    throw response;
  }

  return response;
}

function ensureSuccessfulVoidResponse(response: EulbMutationApiResponse): void {
  ensureSuccessfulResponse(response);
  return undefined;
}

/** HTTP service for all Elected Urban Local Bodies API endpoints. */
@Injectable({ providedIn: 'root' })
export class EulbStatusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/state/elected-urban-local-bodies/`;

  /**
   * Fetches the form config, permissions, actors, and current state for a given state/year.
   * Throws if the API response indicates failure (`success: false`).
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  getFormData(stateId: string, yearId: string): Observable<EulbFormResponseData> {
    return this.http.get<EulbFormApiResponse>(`${this.baseUrl}${stateId}/${yearId}`).pipe(
      map((res) => {
        const response = ensureSuccessfulResponse(res);
        return response.data;
      }),
    );
  }

  /**
   * Downloads the EULB Excel template. `observe: 'response'` (rather than the default body-only
   * observe) lets the caller read the backend's complete `Content-Disposition` filename via
   * `download-file-name.util.ts`'s `parseContentDispositionFileName` — the component saves it
   * verbatim rather than reconstructing it client-side.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  downloadTemplate(stateId: string, yearId: string): Observable<XviFcDownloadedFile> {
    return this.http
      .get(`${this.baseUrl}${stateId}/${yearId}/template`, { responseType: 'blob', observe: 'response' })
      .pipe(map((response) => this.toDownloadedFile(response)));
  }

  /**
   * Fetches an on-demand error sheet for rows that failed validation. Returns HTTP 400 if no
   * uploaded data exists yet.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  downloadErrorSheet(stateId: string, yearId: string): Observable<XviFcDownloadedFile> {
    return this.http
      .get(`${this.baseUrl}${stateId}/${yearId}/error-sheet`, { responseType: 'blob', observe: 'response' })
      .pipe(map((response) => this.toDownloadedFile(response)));
  }

  /**
   * Fetches the "Elected Bodies List" declaration letter (Word doc), generated on demand from the
   * state's active elected-body row dataset. Returns HTTP 400 if there are no active rows, or if any
   * active row has not passed validation.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  downloadElectedBodiesListDocument(stateId: string, yearId: string): Observable<XviFcDownloadedFile> {
    return this.http
      .get(`${this.baseUrl}${stateId}/${yearId}/elected-bodies-list-document`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(map((response) => this.toDownloadedFile(response)));
  }

  /** Shared by the three blob downloads above. */
  private toDownloadedFile(response: HttpResponse<Blob>): XviFcDownloadedFile {
    return {
      blob: response.body as Blob,
      fileName: parseContentDispositionFileName(response.headers.get('Content-Disposition')),
    };
  }

  /**
   * Saves the form data as a draft without final validation constraints.
   * @param payload - Draft payload including `stateId`, `yearId`, and partial form data.
   */
  saveDraft(payload: EulbSaveDraftPayload): Observable<void> {
    return this.http
      .post<EulbMutationApiResponse>(`${this.baseUrl}save-draft`, payload)
      .pipe(map(ensureSuccessfulVoidResponse));
  }

  /**
   * Validates the uploaded Excel file against the expected ULB list.
   * A 200 response with `validationStatus: 'INVALID'` is still a success; HTTP errors indicate
   * structural or auth failures.
   * @param payload - Validation payload including the file reference and expected ULB count.
   */
  validateExcel(payload: EulbValidateExcelPayload): Observable<EulbValidateExcelResponse> {
    return this.http
      .post<EulbValidateExcelResponse>(`${this.baseUrl}validate-excel`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  /**
   * Performs the final submission of the EULB status form.
   * @param payload - Full submit payload including `stateId`, `yearId`, and all required fields.
   */
  finalSubmit(payload: EulbFinalSubmitPayload): Observable<void> {
    return this.http
      .post<EulbMutationApiResponse>(`${this.baseUrl}final-submit`, payload)
      .pipe(map(ensureSuccessfulVoidResponse));
  }

  /**
   * Fetches a paginated, filterable list of uploaded EULB rows.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   * @param query - Optional filters: `page`, `limit`, `search`, `validationStatus`, `errorField`.
   */
  getRows(stateId: string, yearId: string, query: EulbRowsQuery = {}): Observable<EulbRowsApiResponse> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));
    if (query.search) params = params.set('search', query.search);
    if (query.validationStatus) params = params.set('validationStatus', query.validationStatus);
    if (query.errorField) params = params.set('errorField', query.errorField);

    return this.http
      .get<EulbRowsApiResponse>(`${this.baseUrl}${stateId}/${yearId}/rows`, { params })
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  /**
   * Deletes the uploaded Excel file reference and its associated row dataset for a given state/year.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  deleteUploadedExcel(stateId: string, yearId: string): Observable<EulbDeleteUploadedExcelResponse> {
    return this.http
      .delete<EulbDeleteUploadedExcelResponse>(`${this.baseUrl}${stateId}/${yearId}/uploaded-excel`)
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  /**
   * Re-validates the already-uploaded Excel against the backend-maintained ULB list.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  revalidateUploadedExcel(stateId: string, yearId: string): Observable<EulbRevalidateExcelResponse> {
    return this.http
      .post<EulbRevalidateExcelResponse>(`${this.baseUrl}${stateId}/${yearId}/revalidate-excel`, {})
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  /**
   * Patches a single EULB row with corrected field values.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   * @param rowId - The unique row identifier.
   * @param payload - Fields to update on the row.
   */
  updateRow(
    stateId: string,
    yearId: string,
    rowId: string,
    payload: EulbUpdateRowPayload,
  ): Observable<EulbUpdateRowResponse> {
    return this.http
      .patch<EulbUpdateRowResponse>(`${this.baseUrl}${stateId}/${yearId}/rows/${rowId}`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  /**
   * Fetches post-submission update metadata: canUpdate flag, permissions, summary, and row edit fields.
   * Returns `success:true` even when `canUpdate` is false; use `data.canUpdate` to gate the UI.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  getPostSubmissionUpdateMetadata(stateId: string, yearId: string): Observable<EulbPostSubmissionUpdateMetadata> {
    return this.http
      .get<EulbPostSubmissionUpdateMetadataResponse>(`${this.baseUrl}${stateId}/${yearId}/post-submission-update`)
      .pipe(map((res) => ensureSuccessfulResponse(res).data));
  }

  /**
   * Fetches a paginated, filterable list of rows eligible for post-submission update.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   * @param query - Optional filters: `page`, `limit`, `search`, `electedBodyStatus`, `validationStatus`.
   */
  getPostSubmissionUpdateRows(
    stateId: string,
    yearId: string,
    query: EulbPostSubmissionUpdateRowsQuery = {},
  ): Observable<EulbPostSubmissionUpdateRowsData> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));
    if (query.search) params = params.set('search', query.search);
    if (query.electedBodyStatus) params = params.set('electedBodyStatus', query.electedBodyStatus);
    if (query.validationStatus) params = params.set('validationStatus', query.validationStatus);

    return this.http
      .get<EulbPostSubmissionUpdateRowsResponse>(`${this.baseUrl}${stateId}/${yearId}/post-submission-update/rows`, {
        params,
      })
      .pipe(map((res) => ensureSuccessfulResponse(res).data));
  }

  /**
   * Validates locally changed post-submission update rows without submitting them.
   * Business-invalid rows still return `success:true`; callers must inspect `data.validationStatus`.
   */
  validatePostSubmissionUpdateRows(
    stateId: string,
    yearId: string,
    payload: EulbPostSubmissionUpdateValidatePayload,
  ): Observable<EulbPostSubmissionUpdateValidateResponse> {
    return this.http
      .post<EulbPostSubmissionUpdateValidateResponse>(
        `${this.baseUrl}${stateId}/${yearId}/post-submission-update/validate`,
        payload,
      )
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  /**
   * Submits validated post-submission update rows with one already-uploaded combined PDF document.
   * The request body is JSON; the document must be uploaded before this call.
   */
  submitPostSubmissionUpdate(
    stateId: string,
    yearId: string,
    payload: EulbPostSubmissionUpdateSubmitPayload,
  ): Observable<EulbPostSubmissionUpdateSubmitResponse> {
    return this.http
      .post<EulbPostSubmissionUpdateSubmitResponse>(
        `${this.baseUrl}${stateId}/${yearId}/post-submission-update/submit`,
        payload,
      )
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }
}
