import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, concatMap, forkJoin, from, map, of, reduce, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ApiResponse,
  ManualReviewFormType,
  ManualReviewHistoryQuery,
  ManualReviewHistoryResult,
  ManualReviewHistoryRow,
  ManualReviewHistoryStats,
  ManualReviewHistoryStatsRange,
  RawManualReviewHistoryRow,
} from './manual-review-history.models';

interface RawHistoryResult {
  total: number;
  page: number;
  pageSize: number;
  rows: RawManualReviewHistoryRow[];
}

/** The widest page either backend will hand back (`@Max(100)` on the history query DTO). */
const MAX_BACKEND_PAGE_SIZE = 100;

// Recomputed here (not fetched) when merging two backends' stats under "All types" — mirrors the
// exact thresholds DurManualReviewService/AnnualAccountManualReviewService each apply server-side.
const OVERTURN_RATE_MIN_DECIDED = 5;
const OVERTURN_RATE_WARNING_THRESHOLD = 50;

@Injectable({ providedIn: 'root' })
export class ManualReviewHistoryService {
  private readonly http = inject(HttpClient);
  private readonly annualAccountBaseUrl = `${environment.api.url2}xvi-fc/annual-account/`;
  private readonly durBaseUrl = `${environment.api.url2}xvi-fc/dur/`;

  private baseUrlFor(formType: ManualReviewFormType): string {
    return formType === 'DUR' ? this.durBaseUrl : this.annualAccountBaseUrl;
  }

  /**
   * One page of the two backends' rows merged newest first. Both backends sort by requestedAt desc,
   * so page p of the merged list can only contain each backend's first p x pageSize rows: that is
   * all we fetch, never the whole history.
   */
  getHistory(query: ManualReviewHistoryQuery): Observable<ManualReviewHistoryResult> {
    const needed = query.page * query.pageSize;
    const empty = of({ rows: [] as ManualReviewHistoryRow[], total: 0, failed: false });
    return forkJoin([
      query.formType && query.formType !== 'ANNUAL_ACCOUNT'
        ? empty
        : this.fetchTopRows(this.annualAccountBaseUrl, 'ANNUAL_ACCOUNT', query, needed),
      query.formType && query.formType !== 'DUR' ? empty : this.fetchTopRows(this.durBaseUrl, 'DUR', query, needed),
    ]).pipe(
      map(([annualAccount, dur]) => {
        const merged = [...annualAccount.rows, ...dur.rows].sort(
          (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
        );
        const start = (query.page - 1) * query.pageSize;
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

  private buildListParams(query: ManualReviewHistoryQuery, page: number, pageSize: number): HttpParams {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.stateId) params = params.set('stateId', query.stateId);
    if (query.requestedFrom) params = params.set('requestedFrom', query.requestedFrom);
    if (query.requestedTo) params = params.set('requestedTo', query.requestedTo);
    if (query.decidedFrom) params = params.set('decidedFrom', query.decidedFrom);
    if (query.decidedTo) params = params.set('decidedTo', query.decidedTo);
    if (query.breachedOnly) params = params.set('breachedOnly', 'true');
    return params;
  }

  /** One backend's newest `needed` rows (and its total), in pages of at most 100 fetched one after
   *  another — usually a single request, since `needed` is page x pageSize. */
  private fetchTopRows(
    baseUrl: string,
    formType: ManualReviewFormType,
    query: ManualReviewHistoryQuery,
    needed: number,
  ): Observable<{ rows: ManualReviewHistoryRow[]; total: number; failed: boolean }> {
    const pageSize = Math.min(needed, MAX_BACKEND_PAGE_SIZE);
    const fetchPage = (page: number) =>
      this.http
        .get<ApiResponse<RawHistoryResult>>(`${baseUrl}manual-review-history`, {
          params: this.buildListParams(query, page, pageSize),
        })
        .pipe(map((response) => response.data));

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
        console.error(`[manual-review-history] failed to load ${formType} rows`, err);
        return of({ rows: [], total: 0, failed: true });
      }),
    );
  }

  private tagRow(row: RawManualReviewHistoryRow, formType: ManualReviewFormType): ManualReviewHistoryRow {
    const { annualAccountId, durId, ...rest } = row;
    return {
      ...rest,
      formType,
      formId: (formType === 'DUR' ? durId : annualAccountId) as string,
      section: row.section ?? null,
    };
  }

  getById(requestId: string, formType: ManualReviewFormType): Observable<ManualReviewHistoryRow> {
    return this.http
      .get<ApiResponse<RawManualReviewHistoryRow>>(`${this.baseUrlFor(formType)}manual-review-history/${requestId}`)
      .pipe(map((response) => this.tagRow(response.data, formType)));
  }

  /** Excel export of every row matching the current filters (unpaginated) — `page`/`pageSize` are
   *  accepted by the backend DTO but ignored by the dump endpoint, so they're omitted here.
   *  Each backend produces its own workbook (merging them client-side isn't practical), so the
   *  caller picks one form per download. */
  downloadDump(
    formType: ManualReviewFormType,
    query: Omit<ManualReviewHistoryQuery, 'page' | 'pageSize' | 'formType'>,
  ): Observable<Blob> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.stateId) params = params.set('stateId', query.stateId);
    if (query.requestedFrom) params = params.set('requestedFrom', query.requestedFrom);
    if (query.requestedTo) params = params.set('requestedTo', query.requestedTo);
    if (query.decidedFrom) params = params.set('decidedFrom', query.decidedFrom);
    if (query.decidedTo) params = params.set('decidedTo', query.decidedTo);
    if (query.breachedOnly) params = params.set('breachedOnly', 'true');

    return this.http.get(`${this.baseUrlFor(formType)}manual-review-history/dump`, { params, responseType: 'blob' });
  }

  /** Summary counts for the REQUESTED time-range tabs — independent of the table's own filters.
   *  With a specific Form Type selected, this is just that backend's own stats; with "All types",
   *  both backends' counts are summed and the derived fields (average response, overturn rate)
   *  recomputed from the combined totals. */
  getStats(range: ManualReviewHistoryStatsRange, formType?: ManualReviewFormType): Observable<ManualReviewHistoryStats> {
    const params = new HttpParams().set('range', range);
    const fetchStats = (baseUrl: string) =>
      this.http
        .get<ApiResponse<ManualReviewHistoryStats>>(`${baseUrl}manual-review-history/stats`, { params })
        .pipe(map((response) => response.data));

    if (formType === 'ANNUAL_ACCOUNT') return fetchStats(this.annualAccountBaseUrl);
    if (formType === 'DUR') return fetchStats(this.durBaseUrl);

    return forkJoin([fetchStats(this.annualAccountBaseUrl), fetchStats(this.durBaseUrl)]).pipe(
      map(([annualAccount, dur]) => this.mergeStats(annualAccount, dur, range)),
    );
  }

  private mergeStats(
    a: ManualReviewHistoryStats,
    b: ManualReviewHistoryStats,
    range: ManualReviewHistoryStatsRange,
  ): ManualReviewHistoryStats {
    const received = a.received + b.received;
    const pending = a.pending + b.pending;
    const approved = a.approved + b.approved;
    const rejected = a.rejected + b.rejected;
    const over48hCount = a.over48hCount + b.over48hCount;

    const aDecided = a.approved + a.rejected;
    const bDecided = b.approved + b.rejected;
    const totalDecided = aDecided + bDecided;
    const avgResponseHours =
      totalDecided > 0
        ? Math.round((((a.avgResponseHours ?? 0) * aDecided + (b.avgResponseHours ?? 0) * bDecided) / totalDecided) * 10) / 10
        : null;

    const overturnRatePercent = totalDecided > 0 ? Math.round((approved / totalDecided) * 100) : null;

    return {
      range,
      received,
      pending,
      approved,
      rejected,
      over48hCount,
      avgResponseHours,
      overturnRatePercent,
      overturnRateWarning:
        totalDecided >= OVERTURN_RATE_MIN_DECIDED &&
        overturnRatePercent !== null &&
        overturnRatePercent > OVERTURN_RATE_WARNING_THRESHOLD,
    };
  }
}
