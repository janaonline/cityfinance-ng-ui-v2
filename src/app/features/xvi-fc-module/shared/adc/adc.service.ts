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

export type AdcAdminStatus = 'ACTIVE' | 'INVITED' | 'NOT_SET';
export type AdcSortDir = 1 | -1;

/** One row of the Portal Admin's ADC page (`GET master/adc/manage`). `memberCount` includes the Admin. */
export interface IAdcRow {
  _id: string;
  name: string;
  state: { _id: string; name: string };
  ulbCount: number;
  memberCount: number;
  admin: { _id: string; name: string; email: string; isXVIFCProfileVerified: boolean } | null;
  adminStatus?: AdcAdminStatus;
}

/** The ADC detail page's header (`GET master/adc/:id`). */
export interface IAdcDetail extends IAdcRow {
  createdAt: string | null;
}

/** An active ADC member (`GET master/adc/:id/members`). SUBMITTER is the current Admin. */
export interface IAdcMember {
  _id: string;
  name: string;
  designation: string;
  email: string;
  mobile: string;
  subRole: 'SUBMITTER' | 'EDITOR' | 'VIEWER';
  isXVIFCProfileVerified: boolean;
  lastActive: string | null;
}

export type AdcUlbApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXISTING';

/** A ULB owned by the ADC (`GET master/adc/:id/ulbs`). */
export interface IAdcUlb {
  _id: string;
  name: string;
  code: string;
  ulbTypeName: string;
  district: string;
  isActive: boolean;
  approvalStatus: AdcUlbApprovalStatus;
}

interface IAdcPageQuery {
  page: number;
  limit: number;
  search?: string;
  sortDir?: AdcSortDir;
}

export interface IAdcManageQuery extends IAdcPageQuery {
  stateId?: string;
  adminStatus?: AdcAdminStatus;
  sortBy?: 'name' | 'state' | 'ulbCount' | 'memberCount';
}

export interface IAdcMembersQuery extends IAdcPageQuery {
  level?: 'ADMIN' | 'EDITOR' | 'VIEWER';
  status?: 'ACTIVE' | 'INVITED';
  excludeAdmin?: boolean;
  sortBy?: 'name' | 'lastActive';
}

export interface IAdcUlbsQuery extends IAdcPageQuery {
  ulbType?: string;
  approvalStatus?: AdcUlbApprovalStatus;
  isActive?: boolean;
  sortBy?: 'name' | 'code';
}

export interface IPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type IAdcPage = IPage<IAdcRow>;

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
    return this.getPage<IAdcRow>(`${this.baseUrl}/manage`, query);
  }

  detail(id: string): Observable<IAdcDetail> {
    return this.http.get<unknown>(`${this.baseUrl}/${id}`).pipe(map((res) => unwrapObject<IAdcDetail>(res)));
  }

  members(id: string, query: IAdcMembersQuery): Observable<IPage<IAdcMember>> {
    return this.getPage<IAdcMember>(`${this.baseUrl}/${id}/members`, query);
  }

  ulbs(id: string, query: IAdcUlbsQuery): Observable<IPage<IAdcUlb>> {
    return this.getPage<IAdcUlb>(`${this.baseUrl}/${id}/ulbs`, query);
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

  private getPage<T>(url: string, query: IAdcPageQuery & object): Observable<IPage<T>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    const empty: IPage<T> = { data: [], total: 0, page: query.page, limit: query.limit, totalPages: 0 };
    return this.http.get<unknown>(url, { params }).pipe(map((res) => unwrapPage<T>(res) ?? empty));
  }
}

// The dev backend may return a bare array instead of the { success, data } envelope.
function unwrapList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const data = (response as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as T[]) : [];
}

// A page is `{ data: rows[], total, ... }`, normally inside the `{ success, data }` envelope.
function unwrapPage<T>(response: unknown): IPage<T> | null {
  const body = response as Record<string, unknown> | null;
  if (body && Array.isArray(body['data']) && 'total' in body) return body as unknown as IPage<T>;
  const inner = body?.['data'];
  return inner && typeof inner === 'object' && !Array.isArray(inner) ? (inner as IPage<T>) : null;
}

function unwrapObject<T>(response: unknown): T {
  const body = response as Record<string, unknown> | null;
  return (body && 'success' in body && body['data'] ? body['data'] : body) as T;
}
