import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import {
  SlbApiResponse,
  SlbDraftPayload,
  SlbFinalSubmitPayload,
  SlbFormData,
  SlbSubmitData,
  SlbSubmitResponse,
} from './slb.models';

@Injectable({ providedIn: 'root' })
export class SlbService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.url2;

  getSlbForm(ulbId: string, yearId: string): Observable<SlbFormData> {
    return this.http.get<SlbApiResponse>(`${this.baseUrl}xvi-fc/ulb/slb/${ulbId}/${yearId}`).pipe(
      map((response) => {
        if (!response.success) {
          throw response;
        }
        return response.data;
      }),
    );
  }

  saveSlbDraft(payload: SlbDraftPayload): Observable<SlbSubmitData> {
    return this.http.post<SlbSubmitResponse>(`${this.baseUrl}xvi-fc/ulb/slb/save-draft`, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw response;
        }
        return response.data ?? {};
      }),
    );
  }

  finalSubmitSlb(payload: SlbFinalSubmitPayload): Observable<SlbSubmitData> {
    return this.http.post<SlbSubmitResponse>(`${this.baseUrl}xvi-fc/ulb/slb/final-submit`, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw response;
        }
        return response.data ?? {};
      }),
    );
  }
}
