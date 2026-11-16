import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, concatMap, forkJoin, from, map, of, reduce, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  AnnualAccountSectionKey,
  ApiResponse,
  ManualReviewDecisionPayload,
  ManualReviewFormType,
  ManualReviewQueueQuery,
  ManualReviewQueueResult,
  ManualReviewQueueRow,
} from './manual-review-queue.models';

/** Raw shape returned by each backend before it's tagged with formType/formId here. */
interface RawQueueRow extends Omit<ManualReviewQueueRow, 'formType' | 'formId' | 'section'> {
  annualAccountId?: string;
  durId?: string;
  section?: AnnualAccountSectionKey;
}

interface RawQueueResult {
  total: number;
  page: number;
  pageSize: number;
  rows: RawQueueRow[];
}

/** The widest page either backend will hand back (`@Max(100)` on ManualReviewQueueQueryDto). */
const MAX_BACKEND_PAGE_SIZE = 100;

@Injectable({ providedIn: 'root' })
export class ManualReviewQueueService {
  private readonly http = inject(HttpClient);
  private readonly annualAccountBaseUrl = `${environment.api.url2}xvi-fc/annual-account/`;
  private readonly durBaseUrl = `${environment.api.url2}xvi-fc/dur/`;

  /**
   * One page of the two backends' queues merged oldest first. Both backends sort by
   * manualReviewRequestedAt asc, so page p of the merged list can only contain each backend's first
   * p x pageSize rows: that is all we fetch, never the whole queue.
   */
  getQueue(query: ManualReviewQueueQuery): Observable<ManualReviewQueueResult> {
    const needed = query.page * query.pageSize;
    const empty = of({ rows: [] as ManualReviewQueueRow[], total: 0, failed: false });
    return forkJoin([
      query.formType && query.formType !== 'ANNUAL_ACCOUNT'
        ? empty
        : this.fetchTopRows(this.annualAccountBaseUrl, 'ANNUAL_ACCOUNT', needed, query.search),
      query.formType && query.formType !== 'DUR' ? empty : this.fetchTopRows(this.durBaseUrl, 'DUR', needed, query.search),
    ]).pipe(
      map(([annualAccount, dur]) => {
        const merged = [...annualAccount.rows, ...dur.rows].sort(
          (a, b) => new Date(a.manualReviewRequestedAt ?? 0).getTime() - new Date(b.manualReviewRequestedAt ?? 0).getTime(),
        );
        const start = (query.page - 1) * query.pageSize;
        // A source that errored contributes no rows; the "may be incomplete" banner names it.
        const failedSources: ManualReviewFormType[] = [
          ...(annualAccount.failed ? (['ANNUAL_ACCOUNT'] as const) : []),
          ...(dur.failed ? (['DUR'] as const) : []),
        ];
        return {
          total: annualAccount.total + dur.total,
          page: query.page,
          pageSize: query.pageSize,
          rows: merged.slice(start, start + query.pageSize),
          failedSources,
        };
      }),
    );
  }

  /** One backend's oldest `needed` queue rows (and its total), in pages of at most 100 fetched one
   *  after another — usually a single request, since `needed` is page x pageSize. Errors are caught
   *  per backend, so one side failing never hides the other side's rows. */
  private fetchTopRows(
    baseUrl: string,
    formType: ManualReviewFormType,
    needed: number,
    search?: string,
  ): Observable<{ rows: ManualReviewQueueRow[]; total: number; failed: boolean }> {
    const pageSize = Math.min(needed, MAX_BACKEND_PAGE_SIZE);
    const fetchPage = (page: number) => {
      let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
      if (search) params = params.set('search', search);
      return this.http
        .get<ApiResponse<RawQueueResult>>(`${baseUrl}manual-review-queue`, { params })
        .pipe(map((response) => response.data));
    };

    return fetchPage(1).pipe(
      switchMap((first) => {
        const pages = Math.min(Math.ceil(needed / pageSize), Math.ceil(first.total / pageSize));
        if (pages <= 1) return of({ rawRows: first.rows, total: first.total });
        const rest = Array.from({ length: pages - 1 }, (_, i) => i + 2);
        return from(rest).pipe(
          concatMap((page) => fetchPage(page)),
          reduce((rows, next) => rows.concat(next.rows), first.rows),
          map((rawRows) => ({ rawRows, total: first.total })),
        );
      }),
      map(({ rawRows, total }) => ({
        rows: rawRows.slice(0, needed).map((row) => this.tagRow(row, formType)),
        total,
        failed: false,
      })),
      catchError((err) => {
        console.error(`[manual-review-queue] failed to load ${formType} rows`, err);
        return of({ rows: [], total: 0, failed: true });
      }),
    );
  }

  /** DUR-only: streams the document straight from S3 via an authenticated, non-expiring endpoint
   *  (no signed-URL token) — Annual Account rows keep using the v3 vendor's own download route
   *  instead (see ManualReviewQueueComponent.ocrDownloadUrl). */
  downloadDurDocument(row: Pick<ManualReviewQueueRow, 'formId' | 'docId' | 'uploadId'>): Observable<Blob> {
    const params = new HttpParams().set('uploadId', row.uploadId);
    return this.http.get(`${this.durBaseUrl}${row.formId}/documents/${row.docId}/download`, {
      params,
      responseType: 'blob',
    });
  }

  decide(row: Pick<ManualReviewQueueRow, 'formType' | 'formId' | 'section' | 'docId'>, payload: ManualReviewDecisionPayload): Observable<void> {
    const url =
      row.formType === 'DUR'
        ? `${this.durBaseUrl}${row.formId}/documents/${row.docId}/manual-review/decision`
        : `${this.annualAccountBaseUrl}${row.formId}/documents/${row.docId}/manual-review/decision?section=${row.section}`;

    return this.http.post<ApiResponse<unknown>>(url, payload).pipe(map(() => undefined));
  }

  private tagRow(row: RawQueueRow, formType: ManualReviewFormType): ManualReviewQueueRow {
    const { annualAccountId, durId, ...rest } = row;
    return { ...rest, formType, formId: (formType === 'DUR' ? durId : annualAccountId) as string, section: row.section ?? null };
  }
}
