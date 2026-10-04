import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toHttpParams, unwrapAdminResponse } from '../admin-http.util';
import {
  XvFcOverviewAnalytics,
  XvFcOverviewAnalyticsQuery,
  XvFcOverviewExportQuery,
  XvFcOverviewListQuery,
  XvFcOverviewListResponse,
} from '../models/xv-fc-review-overview.model';

/** Backs the admin dashboard home screen with the real `/admin/xv-fc-review/overview` API. */
@Injectable({ providedIn: 'root' })
export class XvFcReviewOverviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}admin/xv-fc-review/overview/`;

  // ── List ────────────────────────────────────────────────────────────────
  readonly listResponse = signal<XvFcOverviewListResponse | null>(null);
  readonly listLoading = signal(false);
  readonly listError = signal(false);

  async loadList(query: XvFcOverviewListQuery): Promise<void> {
    this.listLoading.set(true);
    this.listError.set(false);
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(this.baseUrl, { params: toHttpParams(query) }),
      );
      this.listResponse.set(unwrapAdminResponse<XvFcOverviewListResponse>(res));
    } catch (err) {
      console.error('Failed to load the XV-FC review overview list', err);
      this.listError.set(true);
    } finally {
      this.listLoading.set(false);
    }
  }

  // ── Analytics (KPI cards) ───────────────────────────────────────────────
  readonly analytics = signal<XvFcOverviewAnalytics | null>(null);
  readonly analyticsLoading = signal(false);

  async loadAnalytics(query: XvFcOverviewAnalyticsQuery): Promise<void> {
    this.analyticsLoading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(`${this.baseUrl}analytics`, { params: toHttpParams(query) }),
      );
      this.analytics.set(unwrapAdminResponse<XvFcOverviewAnalytics>(res));
    } catch (err) {
      console.error('Failed to load the XV-FC review overview analytics', err);
      this.analytics.set(null);
    } finally {
      this.analyticsLoading.set(false);
    }
  }

  // ── CSV export ──────────────────────────────────────────────────────────
  exportCsv(query: XvFcOverviewExportQuery): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}export`, { params: toHttpParams(query), responseType: 'blob' }),
    );
  }
}
