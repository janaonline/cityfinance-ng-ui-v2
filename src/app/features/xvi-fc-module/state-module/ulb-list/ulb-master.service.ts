import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpUtility } from '../../../../core/util/httpUtil';
import {
  IApiEnvelope,
  IUlbMaster,
  IUlbMasterListQuery,
  IUlbMasterPage,
  IUlbType,
} from '../../../../core/models/ulb-master';
import { IState } from '../../../../core/models/state/state';
import { StateService } from '../../../../core/services/state/state.service';
import { FormSectionConfig } from '../../../../shared/dynamic-form/field.interface';

@Injectable({ providedIn: 'root' })
export class UlbMasterService {
  private readonly baseUrl = environment.api.url2 + 'master/ulb';
  private readonly httpUtil = new HttpUtility();

  constructor(
    private http: HttpClient,
    private stateService: StateService,
  ) {}

  list(query: IUlbMasterListQuery): Observable<IApiEnvelope<IUlbMasterPage>> {
    const params = this.httpUtil.convertToHttpParams(query as unknown as { [key: string]: string });
    return this.http.get<IApiEnvelope<IUlbMasterPage>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<IApiEnvelope<IUlbMaster>> {
    return this.http.get<IApiEnvelope<IUlbMaster>>(`${this.baseUrl}/${id}`);
  }

  create(data: Record<string, unknown>): Observable<IApiEnvelope<IUlbMaster>> {
    return this.http.post<IApiEnvelope<IUlbMaster>>(this.baseUrl, { data });
  }

  update(id: string, data: Record<string, unknown>): Observable<IApiEnvelope<IUlbMaster>> {
    return this.http.patch<IApiEnvelope<IUlbMaster>>(`${this.baseUrl}/${id}`, { data });
  }

  remove(id: string): Observable<IApiEnvelope<{ message: string }>> {
    return this.http.delete<IApiEnvelope<{ message: string }>>(`${this.baseUrl}/${id}`);
  }

  approve(id: string): Observable<IApiEnvelope<IUlbMaster>> {
    return this.http.patch<IApiEnvelope<IUlbMaster>>(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: string, reason: string): Observable<IApiEnvelope<IUlbMaster>> {
    return this.http.patch<IApiEnvelope<IUlbMaster>>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  getTypes(): Observable<IApiEnvelope<IUlbType[]>> {
    return this.http.get<IApiEnvelope<IUlbType[]>>(`${this.baseUrl}/types`);
  }

  /** Fully-resolved section/field config for the Register ULB page (label, validations, grid, hints, live ulbType options — all pre-merged server-side). */
  getRegisterSections(): Observable<IApiEnvelope<FormSectionConfig[]>> {
    return this.http.get<IApiEnvelope<FormSectionConfig[]>>(`${this.baseUrl}/register-sections`);
  }

  /** Fully-resolved section/field config for the Edit ULB dialog (ADMIN only) — covers every ULB field, with live `state` and `ulbType` options pre-merged server-side. */
  getEditSections(): Observable<IApiEnvelope<FormSectionConfig[]>> {
    return this.http.get<IApiEnvelope<FormSectionConfig[]>>(`${this.baseUrl}/edit-sections`);
  }

  getStates(): Observable<IApiEnvelope<IState[]>> {
    return this.stateService.getStates();
  }
}
