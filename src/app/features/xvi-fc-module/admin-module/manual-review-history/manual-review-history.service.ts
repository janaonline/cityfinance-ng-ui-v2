import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
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

// Same reasoning as ManualReviewQueueService: the widest page either backend will hand back, and a
// defensive cap on how many pages we'll fetch per backend while merging everything client-side.
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

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

  getHistory(query: ManualReviewHistoryQuery): Observable<ManualReviewHistoryResult> {
    const empty = of({ rows: [] as ManualReviewHistoryRow[], failed: false, truncated: false });
    return forkJoin([
      query.formType && query.formType !== 'ANNUAL_ACCOUNT'
        ? empty
        : this.fetchAllRows(this.annualAccountBaseUrl, 'ANNUAL_ACCOUNT', query),
      query.formType && query.formType !== 'DUR' ? empty : this.fetchAllRows(this.durBaseUrl, 'DUR', query),
    ]).pipe(
      map(([annualAccount, dur]) => {
        const merged = [...annualAccount.rows, ...dur.rows].sort(
          (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
        );
        const start = (query.page - 1) * query.pageSize;
        const failedSources: ManualReviewFormType[] = [
          ...(annualAccount.failed || annualAccount.truncated ? (['ANNUAL_ACCOUNT'] as const) : []),
          ...(dur.failed || dur.truncated ? (['DUR'] as const) : []),
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

  private buildListParams(query: ManualReviewHistoryQuery, page: number): HttpParams {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(PAGE_SIZE));
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

  /** Pages through every matching row for one backend — same pattern as
   *  ManualReviewQueueService.fetchAllRows (see there for the full rationale). */
  private fetchAllRows(
    baseUrl: string,
    formType: ManualReviewFormType,
    query: ManualReviewHistoryQuery,
  ): Observable<{ rows: ManualReviewHistoryRow[]; failed: boolean; truncated: boolean }> {
    const fetchPage = (page: number) =>
      this.http.get<ApiResponse<RawHistoryResult>>(`${baseUrl}manual-review-history`, {
        params: this.buildListParams(query, page),
      });

    return fetchPage(1)
      .pipe(
        switchMap((first) => {
          const realTotalPages = Math.ceil(first.data.total / PAGE_SIZE);
          const totalPages = Math.min(realTotalPages, MAX_PAGES);
          const truncated = realTotalPages > MAX_PAGES;
          if (totalPages <= 1) return of({ rawRows: first.data.rows, truncated });

          const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
          return forkJoin(remainingPages.map((page) => fetchPage(page).pipe(map((r) => r.data.rows)))).pipe(
            map((rest) => ({ rawRows: [first.data.rows, ...rest].flat(), truncated })),
          );
        }),
        map(({ rawRows, truncated }) => ({
          rows: rawRows.map((row) => this.tagRow(row, formType)),
          failed: false,
          truncated,
        })),
      )
      .pipe(
        catchError((err) => {
          console.error(`[manual-review-history] failed to load ${formType} rows`, err);
          return of({ rows: [], failed: true, truncated: false });
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
   *  Requires a specific Form Type: merging two backends' Excel workbooks into one client-side
   *  isn't practical, so "All types" must be narrowed to one form before exporting. */
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
