import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { toHttpParams, unwrapAdminResponse } from './admin-http.util';
import {
  XvFcAdminLineItemDecisionPayload,
  XvFcAdminReviewDetail,
  XvFcAdminReviewListQuery,
  XvFcAdminReviewListResponse,
  XvFcAdminYearSummary,
} from './models/xv-fc-review-admin.model';

/** Backs the admin-side AFS review screens with the real `/admin/xv-fc-review` API. */
@Injectable({ providedIn: 'root' })
export class XvFcReviewAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}admin/xv-fc-review/`;

  // ── List ────────────────────────────────────────────────────────────────
  readonly listResponse = signal<XvFcAdminReviewListResponse | null>(null);
  readonly listLoading = signal(false);
  readonly listError = signal(false);

  async loadList(query: XvFcAdminReviewListQuery): Promise<void> {
    this.listLoading.set(true);
    this.listError.set(false);
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(this.baseUrl, { params: toHttpParams(query) }),
      );
      this.listResponse.set(unwrapAdminResponse<XvFcAdminReviewListResponse>(res));
    } catch (err) {
      console.error('Failed to load AFS admin review list', err);
      this.listError.set(true);
    } finally {
      this.listLoading.set(false);
    }
  }

  // ── Years summary (year tabs) ──────────────────────────────────────────
  readonly yearsSummary = signal<XvFcAdminYearSummary[]>([]);
  readonly yearsSummaryLoading = signal(false);

  async loadYearsSummary(ulbId: string): Promise<void> {
    this.yearsSummaryLoading.set(true);
    try {
      const res = await firstValueFrom(this.http.get<unknown>(`${this.baseUrl}${ulbId}/years`));
      this.yearsSummary.set(unwrapAdminResponse<XvFcAdminYearSummary[]>(res) ?? []);
    } catch (err) {
      console.error('Failed to load AFS years summary for ulb ' + ulbId, err);
      this.yearsSummary.set([]);
    } finally {
      this.yearsSummaryLoading.set(false);
    }
  }

  // ── Detail ──────────────────────────────────────────────────────────────
  readonly detail = signal<XvFcAdminReviewDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal(false);

  async loadDetail(ulbId: string, yearId: string): Promise<void> {
    this.detailLoading.set(true);
    this.detailError.set(false);
    this.detail.set(null);
    try {
      const res = await firstValueFrom(this.http.get<unknown>(`${this.baseUrl}${ulbId}/${yearId}`));
      this.detail.set(unwrapAdminResponse<XvFcAdminReviewDetail>(res));
    } catch (err) {
      console.error('Failed to load AFS admin detail for ' + ulbId + '/' + yearId, err);
      this.detailError.set(true);
    } finally {
      this.detailLoading.set(false);
    }
  }

  // ── Mutations ───────────────────────────────────────────────────────────
  decideLineItem(
    ulbId: string,
    yearId: string,
    code: string,
    payload: XvFcAdminLineItemDecisionPayload,
  ): Observable<XvFcAdminReviewDetail> {
    return this.http
      .post<unknown>(`${this.baseUrl}${ulbId}/${yearId}/line-items/${code}/decision`, payload)
      .pipe(map((res) => unwrapAdminResponse<XvFcAdminReviewDetail>(res)));
  }

  acceptAll(ulbId: string, yearId: string): Observable<XvFcAdminReviewDetail> {
    return this.http
      .post<unknown>(`${this.baseUrl}${ulbId}/${yearId}/accept-all`, {})
      .pipe(map((res) => unwrapAdminResponse<XvFcAdminReviewDetail>(res)));
  }

  finalize(ulbId: string, yearId: string): Observable<XvFcAdminReviewDetail> {
    return this.http
      .post<unknown>(`${this.baseUrl}${ulbId}/${yearId}/finalize`, {})
      .pipe(map((res) => unwrapAdminResponse<XvFcAdminReviewDetail>(res)));
  }

  reopen(ulbId: string, yearId: string, reason?: string): Observable<XvFcAdminReviewDetail> {
    return this.http
      .post<unknown>(`${this.baseUrl}${ulbId}/${yearId}/reopen`, { reason })
      .pipe(map((res) => unwrapAdminResponse<XvFcAdminReviewDetail>(res)));
  }

  getDocumentSignedUrl(ulbId: string, yearId: string, targetCode: string): Observable<string> {
    return this.http
      .get<unknown>(`${this.baseUrl}${ulbId}/${yearId}/documents/${targetCode}/signed-url`)
      .pipe(map((res) => unwrapAdminResponse<{ url: string }>(res).url));
  }
}
