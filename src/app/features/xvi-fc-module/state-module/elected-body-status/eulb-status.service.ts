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

@Injectable({ providedIn: 'root' })
export class EulbStatusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/state/elected-urban-local-bodies/`;

  getFormData(stateId: string, yearId: string): Observable<EulbFormResponseData> {
    return this.http.get<EulbFormApiResponse>(`${this.baseUrl}${stateId}/${yearId}`).pipe(
      map((res) => {
        if (!res.success) throw new Error(res.message ?? 'Failed to load form data.');
        return res.data;
      }),
    );
  }

  downloadTemplate(stateId: string, yearId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${stateId}/${yearId}/template`, { responseType: 'blob' });
  }

  downloadErrorSheet(stateId: string, yearId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${stateId}/${yearId}/error-sheet`, { responseType: 'blob' });
  }

  saveDraft(payload: EulbSaveDraftPayload): Observable<void> {
    return this.http.post<{ message?: string }>(`${this.baseUrl}save-draft`, payload).pipe(map(() => undefined));
  }

  validateExcel(payload: EulbValidateExcelPayload): Observable<EulbValidateExcelResponse> {
    return this.http.post<EulbValidateExcelResponse>(`${this.baseUrl}validate-excel`, payload);
  }

  finalSubmit(payload: EulbFinalSubmitPayload): Observable<void> {
    return this.http.post<{ message?: string }>(`${this.baseUrl}final-submit`, payload).pipe(map(() => undefined));
  }

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

  updateRow(
    stateId: string,
    yearId: string,
    rowId: string,
    payload: EulbUpdateRowPayload,
  ): Observable<EulbUpdateRowResponse> {
    return this.http.patch<EulbUpdateRowResponse>(`${this.baseUrl}${stateId}/${yearId}/rows/${rowId}`, payload);
  }
}
