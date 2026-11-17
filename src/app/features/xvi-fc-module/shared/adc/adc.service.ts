import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

/** An Autonomous District Council, as returned by `GET master/adc`. */
export interface IAdc {
  _id: string;
  name: string;
  state: string;
}

/** One row of the Portal Admin's ADC page (`GET master/adc/manage`). `memberCount` includes the Admin. */
export interface IAdcRow {
  _id: string;
  name: string;
  state: { _id: string; name: string };
  ulbCount: number;
  memberCount: number;
  admin: { _id: string; name: string; email: string; isXVIFCProfileVerified: boolean } | null;
}

/** An active ADC member (`GET master/adc/:id/members`). SUBMITTER is the current Admin. */
export interface IAdcMember {
  _id: string;
  name: string;
  email: string;
  subRole: 'SUBMITTER' | 'EDITOR' | 'VIEWER';
  isXVIFCProfileVerified: boolean;
}

export interface IAdcManageQuery {
  page: number;
  limit: number;
  stateId?: string;
  search?: string;
}

export interface IAdcPage {
  data: IAdcRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAdcAdminInput {
  name: string;
  email: string;
  mobile: string;
  designation: string;
}

/** `restore` re-sends after an `EMAIL_XVIFC_REMOVED` conflict to bring the removed member back. */
export type AdcInviteAction = 'invite' | 'restore';

export interface ICreateAdcBody {
  stateId: string;
  name: string;
  admin: IAdcAdminInput;
  action?: AdcInviteAction;
}

export type ISetAdcAdminBody =
  | { mode: 'promote'; userId: string }
  | ({ mode: 'invite'; action?: AdcInviteAction } & IAdcAdminInput);

@Injectable({ providedIn: 'root' })
export class AdcService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}master/adc`;

  /**
   * Active ADCs. ADMIN gets the given state's ADCs (or every state's when `stateId` is omitted); a State user
   * always gets its own state's regardless of the param, so only ADMIN callers need to pass it.
   */
  list(stateId?: string): Observable<IAdc[]> {
    let params = new HttpParams();
    if (stateId) params = params.set('stateId', stateId);
    return this.http.get<unknown>(this.baseUrl, { params }).pipe(map((res) => unwrapList<IAdc>(res)));
  }

  /** Portal Admin's paginated ADC list (the API caps `limit` at 20). */
  manage(query: IAdcManageQuery): Observable<IAdcPage> {
    let params = new HttpParams().set('page', query.page).set('limit', query.limit);
    if (query.stateId) params = params.set('stateId', query.stateId);
    if (query.search) params = params.set('search', query.search);
    const empty: IAdcPage = { data: [], total: 0, page: query.page, limit: query.limit, totalPages: 0 };
    return this.http.get<unknown>(`${this.baseUrl}/manage`, { params }).pipe(map((res) => unwrapPage(res) ?? empty));
  }

  members(id: string): Observable<IAdcMember[]> {
    return this.http.get<unknown>(`${this.baseUrl}/${id}/members`).pipe(map((res) => unwrapList<IAdcMember>(res)));
  }

  create(body: ICreateAdcBody): Observable<unknown> {
    return this.http.post(this.baseUrl, body);
  }

  rename(id: string, name: string): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${id}`, { name });
  }

  setAdmin(id: string, body: ISetAdcAdminBody): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${id}/admin`, body);
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

// The dev backend may return a bare array instead of the { success, data } envelope.
function unwrapList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const data = (response as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as T[]) : [];
}

// A page is `{ data: rows[], total, ... }`, normally inside the `{ success, data }` envelope.
function unwrapPage(response: unknown): IAdcPage | null {
  const body = response as Record<string, unknown> | null;
  if (body && Array.isArray(body['data']) && 'total' in body) return body as unknown as IAdcPage;
  const inner = body?.['data'];
  return inner && typeof inner === 'object' && !Array.isArray(inner) ? (inner as IAdcPage) : null;
}
