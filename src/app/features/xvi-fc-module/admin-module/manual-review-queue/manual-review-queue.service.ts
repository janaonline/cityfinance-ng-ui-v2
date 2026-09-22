import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
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

// ManualReviewQueueQueryDto rejects pageSize > 100 on both backends — this is the widest page
// either one will hand back per request, not a cap on how many rows we'll merge in total (see
// fetchAllRows, which pages through everything before merging).
const PAGE_SIZE = 100;
// ponytail: defensive cap on how many pages we'll fetch per backend (50 * 100 = 5,000 rows) so a
// pagination bug (e.g. a backend that never reports rows.length < pageSize) can't loop forever.
// A real backlog anywhere near this size needs a merged backend query, not a bigger cap.
const MAX_PAGES = 50;

@Injectable({ providedIn: 'root' })
export class ManualReviewQueueService {
  private readonly http = inject(HttpClient);
  private readonly annualAccountBaseUrl = `${environment.api.url2}xvi-fc/annual-account/`;
  private readonly durBaseUrl = `${environment.api.url2}xvi-fc/dur/`;

  getQueue(query: ManualReviewQueueQuery): Observable<ManualReviewQueueResult> {
    return forkJoin([
      this.fetchAllRows(this.annualAccountBaseUrl, 'ANNUAL_ACCOUNT', query.search),
      this.fetchAllRows(this.durBaseUrl, 'DUR', query.search),
    ]).pipe(
      map(([annualAccount, dur]) => {
        const merged = [...annualAccount.rows, ...dur.rows].sort(
          (a, b) => new Date(a.manualReviewRequestedAt ?? 0).getTime() - new Date(b.manualReviewRequestedAt ?? 0).getTime(),
        );
        const start = (query.page - 1) * query.pageSize;
        const failedSources: ManualReviewFormType[] = [
          ...(annualAccount.failed ? (['ANNUAL_ACCOUNT'] as const) : []),
          ...(dur.failed ? (['DUR'] as const) : []),
        ];
        return {
          total: merged.length,
          page: query.page,
          pageSize: query.pageSize,
          rows: merged.slice(start, start + query.pageSize),
          failedSources,
        };
      }),
    );
  }

  /** Pages through every matching row for one backend — a single page's `total` tells us how many
   *  more pages exist, so the rest are fetched in parallel rather than guessed at or truncated.
   *  Errors are caught here, per backend, so a failure on one side (network blip, 500, etc.) never
   *  fails the whole combined forkJoin in getQueue() and hides the other side's rows — it just
   *  contributes zero rows and reports itself in `failed`. */
  private fetchAllRows(
    baseUrl: string,
    formType: ManualReviewFormType,
    search?: string,
  ): Observable<{ rows: ManualReviewQueueRow[]; failed: boolean }> {
    const params = (page: number) => {
      let p = new HttpParams().set('page', String(page)).set('pageSize', String(PAGE_SIZE));
      if (search) p = p.set('search', search);
      return p;
    };
    const fetchPage = (page: number) =>
      this.http.get<ApiResponse<RawQueueResult>>(`${baseUrl}manual-review-queue`, { params: params(page) });

    return fetchPage(1)
      .pipe(
        switchMap((first) => {
          const totalPages = Math.min(Math.ceil(first.data.total / PAGE_SIZE), MAX_PAGES);
          if (totalPages <= 1) return of(first.data.rows);

          const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
          return forkJoin(remainingPages.map((page) => fetchPage(page).pipe(map((r) => r.data.rows)))).pipe(
            map((rest) => [first.data.rows, ...rest].flat()),
          );
        }),
        map((rawRows) => ({ rows: rawRows.map((row) => this.tagRow(row, formType)), failed: false })),
      )
      .pipe(
        catchError((err) => {
          console.error(`[manual-review-queue] failed to load ${formType} rows`, err);
          return of({ rows: [], failed: true });
        }),
      );
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
