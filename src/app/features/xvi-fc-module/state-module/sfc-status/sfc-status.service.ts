import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  SfcStatusApiResponse,
  SfcStatusDraftPayload,
  SfcStatusFinalSubmitPayload,
  SfcStatusFormData,
  SfcStatusSubmitData,
  SfcStatusSubmitResponse,
} from './sfc-status.models';

@Injectable({ providedIn: 'root' })
export class SfcStatusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.url2;

  getSfcStatusForm(stateId: string, yearId: string): Observable<SfcStatusFormData> {
    return this.http.get<SfcStatusApiResponse>(`${this.baseUrl}xvi-fc/state/sfc-status/${stateId}/${yearId}`).pipe(
      map((response) => {
        if (!response.success) {
          throw response;
        }
        return response.data;
      }),
    );
  }

  saveSfcStatusDraft(payload: SfcStatusDraftPayload): Observable<SfcStatusSubmitData> {
    return this.http.post<SfcStatusSubmitResponse>(`${this.baseUrl}xvi-fc/state/sfc-status/save-draft`, payload).pipe(
      map((response) => {
        if (!response.success) {
          // Throw the full response so the component can read message + errors
          throw response;
        }
        return response.data ?? {};
      }),
    );
  }

  finalSubmitSfcStatus(payload: SfcStatusFinalSubmitPayload): Observable<SfcStatusSubmitData> {
    return this.http.post<SfcStatusSubmitResponse>(`${this.baseUrl}xvi-fc/state/sfc-status/final-submit`, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw response;
        }
        return response.data ?? {};
      }),
    );
  }
}
