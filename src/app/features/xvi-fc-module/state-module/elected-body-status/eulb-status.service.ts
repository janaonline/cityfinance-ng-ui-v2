import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  EulbFinalSubmitPayload,
  EulbFormApiResponse,
  EulbFormResponseData,
  EulbRowsApiResponse,
  EulbRowsQuery,
  EulbSaveDraftPayload,
  EulbUpdateRowPayload,
  EulbUpdateRowResponse,
  EulbValidateExcelPayload,
  EulbValidateExcelResponse,
} from './eulb-status.models';

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
        if (!res.success) throw new Error(res.message ?? 'Failed to load form data.');
        return res.data;
      }),
    );
  }

  /**
   * Downloads the EULB Excel template as a blob.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  downloadTemplate(stateId: string, yearId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${stateId}/${yearId}/template`, { responseType: 'blob' });
  }

  /**
   * Fetches an on-demand error sheet blob for rows that failed validation.
   * Returns HTTP 400 if no uploaded data exists yet.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   */
  downloadErrorSheet(stateId: string, yearId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${stateId}/${yearId}/error-sheet`, { responseType: 'blob' });
  }

  /**
   * Saves the form data as a draft without final validation constraints.
   * @param payload - Draft payload including `stateId`, `yearId`, and partial form data.
   */
  saveDraft(payload: EulbSaveDraftPayload): Observable<void> {
    return this.http.post<{ message?: string }>(`${this.baseUrl}save-draft`, payload).pipe(map(() => undefined));
  }

  /**
   * Validates the uploaded Excel file against the expected ULB list.
   * A 200 response with `validationStatus: 'INVALID'` is still a success; HTTP errors indicate
   * structural or auth failures.
   * @param payload - Validation payload including the file reference and expected ULB count.
   */
  validateExcel(payload: EulbValidateExcelPayload): Observable<EulbValidateExcelResponse> {
    return this.http.post<EulbValidateExcelResponse>(`${this.baseUrl}validate-excel`, payload);
  }

  /**
   * Performs the final submission of the EULB status form.
   * @param payload - Full submit payload including `stateId`, `yearId`, and all required fields.
   */
  finalSubmit(payload: EulbFinalSubmitPayload): Observable<void> {
    return this.http.post<{ message?: string }>(`${this.baseUrl}final-submit`, payload).pipe(map(() => undefined));
  }

  /**
   * Fetches a paginated, filterable list of uploaded EULB rows.
   * @param stateId - The state identifier.
   * @param yearId - The finance commission year identifier.
   * @param query - Optional filters: `page`, `limit`, `search`, `validationStatus`, `rowType`, `errorField`.
   */
  getRows(stateId: string, yearId: string, query: EulbRowsQuery = {}): Observable<EulbRowsApiResponse> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));
    if (query.search) params = params.set('search', query.search);
    if (query.validationStatus) params = params.set('validationStatus', query.validationStatus);
    if (query.rowType) params = params.set('rowType', query.rowType);
    if (query.errorField) params = params.set('errorField', query.errorField);

    return this.http.get<EulbRowsApiResponse>(`${this.baseUrl}${stateId}/${yearId}/rows`, { params });
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
    return this.http.patch<EulbUpdateRowResponse>(`${this.baseUrl}${stateId}/${yearId}/rows/${rowId}`, payload);
  }
}
