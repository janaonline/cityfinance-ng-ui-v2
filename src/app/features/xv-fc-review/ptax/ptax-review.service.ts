import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  PtaxConfirmUploadRequest,
  PtaxDraftMetricPayload,
  PtaxFinalAction,
  PtaxFyDetail,
  PtaxFySummary,
  PtaxPresignRequest,
  PtaxPresignResponse,
} from './ptax-review.model';
import { XvFcCurrencyUnit, XV_FC_CURRENCY_UNIT_TO_API } from '../models/xv-fc-review.model';

function unwrap<T>(response: unknown): T {
  const r = response as Record<string, unknown>;
  return (r && typeof r === 'object' && 'data' in r ? r['data'] : r) as T;
}

/**
 * Backs the ULB-side Ptax review screen with the real `/xv-fc-review/ptax` API.
 * `ulbId` is resolved the same way as `XvFcDataReviewService` (logged-in user's stored profile).
 */
@Injectable({ providedIn: 'root' })
export class PtaxReviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xv-fc-review/ptax/`;

  get ulbId(): string {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
    return raw ? ((JSON.parse(raw) as { ulb?: string })?.ulb ?? '') : '';
  }

  // ── FY tabs ─────────────────────────────────────────────────────────────
  readonly summaries = signal<PtaxFySummary[]>([]);
  readonly summaryLoading = signal(false);
  readonly summaryError = signal(false);

  async loadSummary(): Promise<void> {
    this.summaryLoading.set(true);
    this.summaryError.set(false);
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(`${this.baseUrl}${this.ulbId}/summary`),
      );
      const list = unwrap<PtaxFySummary[]>(res) ?? [];
      this.summaries.set([...list].sort((a, b) => a.financialYear.localeCompare(b.financialYear)));
    } catch (err) {
      console.error('Failed to load Ptax review summary', err);
      this.summaries.set([]);
      this.summaryError.set(true);
    } finally {
      this.summaryLoading.set(false);
    }
  }

  // ── FY detail (also the preview-screen payload) ────────────────────────
  readonly fyDetail = signal<PtaxFyDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal(false);
  /** Tracks the most recently requested year so a slow, superseded response can't clobber a faster later one. */
  private latestYearId: string | null = null;

  async loadFyDetail(yearId: string): Promise<void> {
    this.latestYearId = yearId;
    this.detailLoading.set(true);
    this.detailError.set(false);
    this.fyDetail.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}`),
      );
      if (this.latestYearId !== yearId) return; // a newer switchYear() has since superseded this request
      this.fyDetail.set(unwrap<PtaxFyDetail>(res));
    } catch (err) {
      if (this.latestYearId !== yearId) return;
      console.error('Failed to load Ptax review detail for year ' + yearId, err);
      this.detailError.set(true);
    } finally {
      if (this.latestYearId === yearId) {
        this.detailLoading.set(false);
      }
    }
  }

  /** Local-only edit of the currently loaded FY's metric flag/proposedValue/comment — persisted via `saveDraft`. */
  setMetricFlagLocally(
    code: string,
    flagged: boolean,
    proposedValue: number | null,
    comment: string,
  ): void {
    const detail = this.fyDetail();
    if (!detail) return;
    this.fyDetail.set({
      ...detail,
      metrics: detail.metrics.map((m) =>
        m.code === code ? { ...m, flagged, proposedValue, comment } : m,
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
  saveDraft(yearId: string, metrics: PtaxDraftMetricPayload[]): Observable<void> {
    return this.http
      .put<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}/draft`, { metrics })
      .pipe(map(() => undefined));
  }

  // ── Document upload: presign → PUT bytes to S3 → confirm ───────────────
  private presign(yearId: string, request: PtaxPresignRequest): Observable<PtaxPresignResponse> {
    return this.http
      .post<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}/documents/presign`, request)
      .pipe(map((res) => unwrap<PtaxPresignResponse>(res)));
  }

  private confirmUpload(yearId: string, request: PtaxConfirmUploadRequest): Observable<unknown> {
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

  // ── Submit / resubmit after rejection ───────────────────────────────────
  submit(yearId: string, finalAction: PtaxFinalAction): Observable<PtaxFyDetail> {
    return this.http
      .post<unknown>(`${this.baseUrl}${this.ulbId}/${yearId}/submit`, { finalAction })
      .pipe(map((res) => unwrap<PtaxFyDetail>(res)));
  }

  // ── PDF export ───────────────────────────────────────────────────────────
  downloadPdf(yearId: string, unit: XvFcCurrencyUnit): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.ulbId}/${yearId}/pdf`, {
      params: { currency: XV_FC_CURRENCY_UNIT_TO_API[unit] },
      responseType: 'blob',
    });
  }
}
