import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { buildMockUlbSubmissionRows, MOCK_GRANT_NAME, MOCK_STATE_NAME } from './ulb-submissions.mock-data';
import {
  BulkReviewPayload,
  BulkReviewResult,
  UlbSubmissionRow,
  UlbSubmissionsListResponse,
  UlbSubmissionsQuery,
} from './ulb-submissions.models';
import { filterRows, paginateRows, sortRows } from './ulb-submissions.utils';

const MOCK_LATENCY_MS = 350;

/**
 * Mocked until the backend `xvi-fc/state/ulb-submissions` endpoints exist.
 * Every public method mirrors the HTTP contract it will eventually call, so
 * swapping the bodies for `this.http.get/post(...)` later needs no signature changes.
 */
@Injectable({ providedIn: 'root' })
export class UlbSubmissionsService {
  private readonly rows = signal<UlbSubmissionRow[]>(buildMockUlbSubmissionRows());

  list(query: UlbSubmissionsQuery): Observable<UlbSubmissionsListResponse> {
    const filtered = filterRows(this.rows(), query);
    const sorted = sortRows(filtered, query.sortField, query.sortDirection);
    const page = paginateRows(sorted, query.page, query.pageSize);

    return of<UlbSubmissionsListResponse>({
      stateName: MOCK_STATE_NAME,
      grantName: MOCK_GRANT_NAME,
      totalUlbCount: this.rows().length,
      total: filtered.length,
      rows: page,
    }).pipe(delay(MOCK_LATENCY_MS));
  }

  bulkReview(payload: BulkReviewPayload): Observable<BulkReviewResult> {
    const nextStatus = payload.action === 'APPROVE' ? 'APPROVED' : 'RETURNED';
    const targetIds = new Set(payload.ulbIds);

    this.rows.update((rows) => rows.map((row) => (targetIds.has(row.ulbId) ? { ...row, formStatus: nextStatus } : row)));

    return of<BulkReviewResult>({ success: true, updatedCount: payload.ulbIds.length }).pipe(delay(MOCK_LATENCY_MS));
  }

  exportList(query: UlbSubmissionsQuery): Observable<Blob> {
    const filtered = sortRows(filterRows(this.rows(), query), query.sortField, query.sortDirection);
    const csv = buildCsv(filtered);
    return of(new Blob([csv], { type: 'text/csv;charset=utf-8;' })).pipe(delay(MOCK_LATENCY_MS));
  }
}

function buildCsv(rows: readonly UlbSubmissionRow[]): string {
  const header = 'ULB Code,ULB Name,Elected Body Status,FC Unspent,Form Status,Overall Status\n';
  const lines = rows.map(
    (row) =>
      `${row.ulbCode},${row.ulbName},${row.electedBodyStatus},${row.fcUnspentStatus},${row.formStatus},${row.overallStatus.completed}/${row.overallStatus.total}`,
  );
  return header + lines.join('\n');
}
