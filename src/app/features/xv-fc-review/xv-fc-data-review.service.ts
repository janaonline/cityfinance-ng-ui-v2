import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  XvFcConfirmUploadRequest,
  XvFcCurrencyUnit,
  XvFcDraftLineItemPayload,
  XvFcFinalAction,
  XvFcFyDetail,
  XvFcFySummary,
  XvFcPresignRequest,
  XvFcPresignResponse,
  XV_FC_CURRENCY_UNIT_TO_API,
} from './models/xv-fc-review.model';

function unwrap<T>(response: unknown): T {
  const r = response as Record<string, unknown>;
  return (r && typeof r === 'object' && 'data' in r ? r['data'] : r) as T;
}

/**
 * Backs the ULB-side XV-FC data review screens with the real `/xv-fc-review` API.
 * `ulbId` is resolved from the logged-in user's stored profile, matching the
 * convention used by `OverviewComponent`/`UlbOverviewService` elsewhere in this module.
 */
@Injectable({ providedIn: 'root' })
export class XvFcDataReviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xv-fc-review/`;

  get ulbId(): string {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
    return raw ? ((JSON.parse(raw) as { ulb?: string })?.ulb ?? '') : '';
  }

  // ── FY tabs ─────────────────────────────────────────────────────────────
  readonly summaries = signal<XvFcFySummary[]>([]);
  readonly summaryLoading = signal(false);
  readonly summaryError = signal(false);

  async loadSummary(): Promise<void> {
    this.summaryLoading.set(true);
    this.summaryError.set(false);
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(`${this.baseUrl}${this.ulbId}/summary`),
      );
      const list = unwrap<XvFcFySummary[]>(res) ?? [];
      this.summaries.set([...list].sort((a, b) => a.financialYear.localeCompare(b.financialYear)));
    } catch (err) {
      console.error('Failed to load XV-FC review summary', err);
      this.summaries.set([]);
      this.summaryError.set(true);
    } finally {
      this.summaryLoading.set(false);
    }
  }

  // ── FY detail (also the preview-screen payload) ────────────────────────
  readonly fyDetail = signal<XvFcFyDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal(false);

  async loadFyDetail(yearId: string): Promise<void> {
    this.detailLoading.set(true);
    this.detailError.set(false);
    this.fyDetail.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}`),
      );
      this.fyDetail.set(unwrap<XvFcFyDetail>(res));
    } catch (err) {
      console.error('Failed to load XV-FC review detail for year ' + yearId, err);
      this.detailError.set(true);
    } finally {
      this.detailLoading.set(false);
    }
  }

  /** Local-only edit of the currently loaded FY's line-item flag/proposedValue/comment — persisted via `saveDraft`. */
  setLineItemFlagLocally(
    code: string,
    flagged: boolean,
    proposedValue: number | null,
    comment: string,
  ): void {
    const detail = this.fyDetail();
    if (!detail) return;
    this.fyDetail.set({
      ...detail,
      lineItems: detail.lineItems.map((item) =>
        item.code === code ? { ...item, flagged, proposedValue, comment } : item,
      ),
    });
  }

  /** Local-only clear of the shared supporting document — there's no delete endpoint, this just re-opens the upload zone. */
  clearSupportingDocumentLocally(): void {
    const detail = this.fyDetail();
    if (!detail) return;
    this.fyDetail.set({ ...detail, supportingDocument: null });
  }

  /** Local-only clear of the declaration — there's no delete endpoint, this just re-opens the upload zone. */
  clearDeclarationLocally(): void {
    const detail = this.fyDetail();
    if (!detail) return;
    this.fyDetail.set({ ...detail, declaration: null });
  }

  // ── Save as draft ───────────────────────────────────────────────────────
  saveDraft(yearId: string, lineItems: XvFcDraftLineItemPayload[]): Observable<void> {
    return this.http
      .put<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}/draft`, { lineItems })
      .pipe(map(() => undefined));
  }

  // ── Document upload: presign → PUT bytes to S3 → confirm ───────────────
  private presign(yearId: string, request: XvFcPresignRequest): Observable<XvFcPresignResponse> {
    return this.http
      .post<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}/documents/presign`, request)
      .pipe(map((res) => unwrap<XvFcPresignResponse>(res)));
  }

  private confirmUpload(yearId: string, request: XvFcConfirmUploadRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}/documents/confirm`, request);
  }

  /**
   * Presigns, uploads the raw bytes to S3, then confirms. The confirm response's exact shape
   * is unconfirmed and not used here — callers should reload the FY detail afterwards to pick
   * up the canonical declaration/supportingDocument shape from the GET response.
   */
  uploadDocument(yearId: string, targetCode: string, file: File): Observable<void> {
    return this.presign(yearId, { targetCode, fileName: file.name, fileSize: file.size }).pipe(
      switchMap((presigned) =>
        this.http.put(presigned.presignedUrl, file).pipe(
          switchMap(() =>
            this.confirmUpload(yearId, {
              uploadId: presigned.uploadId,
              s3Key: presigned.s3Key,
              targetCode,
              originalName: file.name,
              fileSize: file.size,
            }),
          ),
        ),
      ),
      map(() => undefined),
    );
  }

  getDocumentSignedUrl(yearId: string, targetCode: string): Observable<string> {
    return this.http
      .get<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}/documents/${targetCode}/signed-url`)
      .pipe(map((res) => unwrap<{ url: string }>(res).url));
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  submit(yearId: string, finalAction: XvFcFinalAction): Observable<XvFcFyDetail> {
    return this.http
      .post<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}/submit`, { finalAction })
      .pipe(map((res) => unwrap<XvFcFyDetail>(res)));
  }

  // ── PDF export ───────────────────────────────────────────────────────────
  downloadPdf(yearId: string, unit: XvFcCurrencyUnit): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.ulbId}/${yearId}/pdf`, {
      params: { currency: XV_FC_CURRENCY_UNIT_TO_API[unit] },
      responseType: 'blob',
    });
  }
}
