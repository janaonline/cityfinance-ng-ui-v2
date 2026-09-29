import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  GtcApiResponse,
  GtcDraftPayload,
  GtcFinalSubmitPayload,
  GtcFormData,
  GtcInstallment,
  GtcSubmitData,
  GtcSubmitResponse,
  GtcTemplateData,
  GtcTemplateResponse,
} from './gtc.models';

@Injectable({ providedIn: 'root' })
export class GtcService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.url2;

  getGtcForm(stateId: string, yearId: string, installment: GtcInstallment): Observable<GtcFormData> {
    return this.http
      .get<GtcApiResponse>(`${this.baseUrl}xvi-fc/state/gtc/${stateId}/${yearId}/${installment}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw response;
          }
          return response.data;
        }),
      );
  }

  saveGtcDraft(payload: GtcDraftPayload): Observable<GtcSubmitData> {
    return this.http.post<GtcSubmitResponse>(`${this.baseUrl}xvi-fc/state/gtc/save-draft`, payload).pipe(
      map((response) => {
        if (!response.success) {
          // Throw the full response so the component can read message + errors
          throw response;
        }
        return response.data ?? {};
      }),
    );
  }

  finalSubmitGtc(payload: GtcFinalSubmitPayload): Observable<GtcSubmitData> {
    return this.http.post<GtcSubmitResponse>(`${this.baseUrl}xvi-fc/state/gtc/final-submit`, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw response;
        }
        return response.data ?? {};
      }),
    );
  }

  /** Signed URL for the static GTC template - only meaningful when the design year/installment
   *  has one configured; otherwise the backend rejects with a `templateNotConfigured` error. */
  getGtcTemplate(stateId: string, yearId: string, installment: GtcInstallment): Observable<GtcTemplateData> {
    return this.http
      .get<GtcTemplateResponse>(`${this.baseUrl}xvi-fc/state/gtc/${stateId}/${yearId}/${installment}/gtc-template`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw response;
          }
          return response.data;
        }),
      );
  }
}
