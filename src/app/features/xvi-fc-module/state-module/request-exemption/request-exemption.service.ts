import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  RequestExemptionApiResponse,
  RequestExemptionData,
  RequestExemptionListQuery,
  RequestExemptionListResponseData,
  RequestExemptionReasonOption,
  RequestExemptionSavePayload,
  RequestExemptionSaveResponseData,
} from './request-exemption.models';

function ensureSuccessfulResponse<T>(response: RequestExemptionApiResponse<T>): RequestExemptionApiResponse<T> {
  if (!response.success) {
    // Throw the full response so the component can read message + field-keyed errors.
    throw response;
  }
  return response;
}

@Injectable({ providedIn: 'root' })
export class RequestExemptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/state/request-exemption/`;

  /** Always the blank field config for starting a new request — see the backend service's own
   *  doc comment for why this isn't a "resume my one request for this state+year" endpoint. */
  getForm(stateId: string, yearId: string): Observable<RequestExemptionData> {
    return this.http
      .get<RequestExemptionApiResponse<RequestExemptionData>>(`${this.baseUrl}${stateId}/${yearId}`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as RequestExemptionData));
  }

  /** The only write path for this form — no draft step. The backend transparently resolves the
   *  right document by `{ulb, year}` and merges each submitted `formId` into it, so this page
   *  never needs to know or send which document/entry (if any) already exists — see
   *  `RequestExemptionSavePayload`'s own doc-comment. */
  finalSubmit(payload: RequestExemptionSavePayload): Observable<RequestExemptionSaveResponseData> {
    return this.http
      .post<RequestExemptionApiResponse<RequestExemptionSaveResponseData>>(`${this.baseUrl}final-submit`, payload)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as RequestExemptionSaveResponseData));
  }

  /** Paginated, filterable list of this state's own requests for the year - backs the "Exemption
   *  Status" table. `search`/`reasonForExemption`/`status` are all optional and applied server-side. */
  list(stateId: string, yearId: string, query: RequestExemptionListQuery): Observable<RequestExemptionListResponseData> {
    return this.http
      .get<RequestExemptionApiResponse<RequestExemptionListResponseData>>(`${this.baseUrl}${stateId}/${yearId}/list`, {
        params: {
          ...(query.page != null && { page: query.page }),
          ...(query.limit != null && { limit: query.limit }),
          ...(query.search?.trim() && { search: query.search.trim() }),
          ...(query.reasonForExemption != null && { reasonForExemption: query.reasonForExemption }),
          ...(query.status != null && { status: query.status }),
        },
      })
      .pipe(map((response) => ensureSuccessfulResponse(response).data as RequestExemptionListResponseData));
  }

  /** This year's Reason for Exemption options - sourced from `formjsons` server-side (not
   *  hardcoded here), backs the "Exemption Status" list's Reason filter dropdown. */
  getReasonOptions(stateId: string, yearId: string): Observable<RequestExemptionReasonOption[]> {
    return this.http
      .get<RequestExemptionApiResponse<RequestExemptionReasonOption[]>>(`${this.baseUrl}${stateId}/${yearId}/reason-options`)
      .pipe(map((response) => ensureSuccessfulResponse(response).data as RequestExemptionReasonOption[]));
  }
}
