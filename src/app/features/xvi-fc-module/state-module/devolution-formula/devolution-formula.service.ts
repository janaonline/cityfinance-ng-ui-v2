import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  DeleteUploadedExcelResponseData,
  DevolutionFormResponseData,
  DevolutionRowsQuery,
  DevolutionRowsResponseData,
  DfInstallment,
  FinalSubmitDevolutionPayload,
  RevalidateDevolutionResponseData,
  SaveDraftDevolutionPayload,
  UpdateDevolutionRowPayload,
  UpdateRowDevolutionResponseData,
  ValidateExcelDevolutionPayload,
  ValidateExcelDevolutionResponseData,
  XviFcApiResponse,
} from './devolution-formula.models';
import { isRecord } from './devolution-formula.utils';

function ensureSuccessfulResponse<T>(response: T): T {
  if (isRecord(response) && response['success'] === false) {
    throw response;
  }
  return response;
}

function ensureSuccessfulVoidResponse(response: XviFcApiResponse<unknown>): void {
  ensureSuccessfulResponse(response);
  return undefined;
}

@Injectable({ providedIn: 'root' })
export class DevolutionFormulaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/state/devolution-formula/`;

  getForm(stateId: string, yearId: string, installment: DfInstallment): Observable<DevolutionFormResponseData> {
    return this.http
      .get<XviFcApiResponse<DevolutionFormResponseData>>(`${this.baseUrl}${stateId}/${yearId}/${installment}`)
      .pipe(
        map((res) => {
          const response = ensureSuccessfulResponse(res);
          return response.data;
        }),
      );
  }

  saveDraft(payload: SaveDraftDevolutionPayload): Observable<void> {
    return this.http
      .post<XviFcApiResponse<unknown>>(`${this.baseUrl}save-draft`, payload)
      .pipe(map(ensureSuccessfulVoidResponse));
  }

  validateExcel(
    payload: ValidateExcelDevolutionPayload,
  ): Observable<XviFcApiResponse<ValidateExcelDevolutionResponseData>> {
    return this.http
      .post<XviFcApiResponse<ValidateExcelDevolutionResponseData>>(`${this.baseUrl}validate-excel`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  finalSubmit(payload: FinalSubmitDevolutionPayload): Observable<void> {
    return this.http
      .post<XviFcApiResponse<unknown>>(`${this.baseUrl}final-submit`, payload)
      .pipe(map(ensureSuccessfulVoidResponse));
  }

  downloadTemplate(stateId: string, yearId: string, installment: DfInstallment): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${stateId}/${yearId}/${installment}/template`, { responseType: 'blob' });
  }

  getRows(
    stateId: string,
    yearId: string,
    installment: DfInstallment,
    query: DevolutionRowsQuery = {},
  ): Observable<XviFcApiResponse<DevolutionRowsResponseData>> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined) params = params.set('limit', String(query.limit));
    if (query.search) params = params.set('search', query.search);
    if (query.validationStatus) params = params.set('validationStatus', query.validationStatus);

    return this.http
      .get<XviFcApiResponse<DevolutionRowsResponseData>>(`${this.baseUrl}${stateId}/${yearId}/${installment}/rows`, {
        params,
      })
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  updateRow(
    stateId: string,
    yearId: string,
    installment: DfInstallment,
    rowId: string,
    payload: UpdateDevolutionRowPayload,
  ): Observable<XviFcApiResponse<UpdateRowDevolutionResponseData>> {
    return this.http
      .patch<
        XviFcApiResponse<UpdateRowDevolutionResponseData>
      >(`${this.baseUrl}${stateId}/${yearId}/${installment}/rows/${rowId}`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  deleteUploadedExcel(
    stateId: string,
    yearId: string,
    installment: DfInstallment,
  ): Observable<XviFcApiResponse<DeleteUploadedExcelResponseData>> {
    return this.http
      .delete<
        XviFcApiResponse<DeleteUploadedExcelResponseData>
      >(`${this.baseUrl}${stateId}/${yearId}/${installment}/uploaded-excel`)
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  downloadErrorSheet(stateId: string, yearId: string, installment: DfInstallment): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${stateId}/${yearId}/${installment}/error-sheet`, { responseType: 'blob' });
  }

  revalidateExcel(
    stateId: string,
    yearId: string,
    installment: DfInstallment,
  ): Observable<XviFcApiResponse<RevalidateDevolutionResponseData>> {
    return this.http
      .post<
        XviFcApiResponse<RevalidateDevolutionResponseData>
      >(`${this.baseUrl}${stateId}/${yearId}/${installment}/revalidate-excel`, {})
      .pipe(map((response) => ensureSuccessfulResponse(response)));
  }

  downloadDump(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}dump`, { responseType: 'blob' });
  }
}
