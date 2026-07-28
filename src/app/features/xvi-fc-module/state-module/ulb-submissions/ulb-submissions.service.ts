import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  BulkReviewPayload,
  BulkReviewResult,
  FORM_TO_SECTION,
  ReviewStatus,
  UlbSubmissionRow,
  UlbSubmissionsListResponse,
  UlbSubmissionsQuery,
} from './ulb-submissions.models';

const ANNUAL_ACCOUNT_API = `${environment.api.url2}xvi-fc/annual-account/`;
const BANK_ACCOUNT_API = `${environment.api.url2}xvi-fc/bank-account/`;

// The bank-account module's FORM_STATUS constant uses this exact 1-7 numbering,
// matching the Annual Account module's form_status_id — one shared status vocabulary.
const NUMERIC_TO_REVIEW_STATUS: Record<number, ReviewStatus> = {
  1: 'NOT_STARTED',
  2: 'IN_PROGRESS',
  3: 'UNDER_REVIEW_BY_STATE',
  4: 'RETURNED_BY_STATE',
  5: 'UNDER_REVIEW_BY_MOHUA',
  6: 'RETURNED_BY_MOHUA',
  7: 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA',
};

const REVIEW_STATUS_TO_NUMERIC: Record<ReviewStatus, number> = {
  NOT_STARTED: 1,
  IN_PROGRESS: 2,
  UNDER_REVIEW_BY_STATE: 3,
  RETURNED_BY_STATE: 4,
  UNDER_REVIEW_BY_MOHUA: 5,
  RETURNED_BY_MOHUA: 6,
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 7,
};

// The dev backend may return bare objects instead of { success, data } wrappers.
function unwrap<T>(response: unknown): T {
  const r = response as Record<string, unknown>;
  return (r && 'data' in r ? r['data'] : r) as T;
}

interface AnnualAccountSubmissionRow {
  ulbId: string;
  ulbCode: string;
  ulbName: string;
  formStatus: ReviewStatus;
  formStatusId: number;
  lastUpdatedAt: string | null;
  annualAccountId: string | null;
}

interface AnnualAccountListResponse {
  total: number;
  page: number;
  pageSize: number;
  rows: AnnualAccountSubmissionRow[];
  counts: Record<ReviewStatus, number>;
}

interface BankAccountSubmissionRow {
  ulbId: string;
  ulbCode: string;
  ulbName: string;
  formStatus: number;
  lastUpdatedAt: string | null;
  bankAccountId: string | null;
}

interface BankAccountListResponse {
  total: number;
  page: number;
  pageSize: number;
  rows: BankAccountSubmissionRow[];
  counts: Record<number, number>;
}

@Injectable({ providedIn: 'root' })
export class UlbSubmissionsService {
  private readonly http = inject(HttpClient);

  list(query: UlbSubmissionsQuery): Observable<UlbSubmissionsListResponse> {
    if (query.form === 'PFMS_BANK_ACCOUNT') return this.listBankAccounts(query);
    return this.listAnnualAccounts(query);
  }

  bulkReview(payload: BulkReviewPayload): Observable<BulkReviewResult> {
    if (payload.form === 'PFMS_BANK_ACCOUNT') return this.bulkReviewBankAccounts(payload);
    return this.bulkReviewAnnualAccounts(payload);
  }

  private listAnnualAccounts(query: UlbSubmissionsQuery): Observable<UlbSubmissionsListResponse> {
    const section = FORM_TO_SECTION[query.form];
    if (!section) throw new Error(`No backend support yet for form: ${query.form}`);

    let params = new HttpParams()
      .set('designYearId', query.designYearId)
      .set('section', section)
      .set('page', query.page)
      .set('pageSize', query.pageSize)
      .set('sortField', query.sortField)
      .set('sortDirection', query.sortDirection);

    if (query.search.trim()) params = params.set('search', query.search.trim());
    if (query.status?.length) params = params.set('status', query.status.join(','));

    return this.http.get<unknown>(`${ANNUAL_ACCOUNT_API}state/ulb-submissions`, { params }).pipe(
      map((res) => {
        const raw = unwrap<AnnualAccountListResponse>(res);
        const rows: UlbSubmissionRow[] = raw.rows.map((row) => ({
          ulbId: row.ulbId,
          ulbCode: row.ulbCode,
          ulbName: row.ulbName,
          formStatus: row.formStatus,
          formStatusId: row.formStatusId,
          lastUpdatedAt: row.lastUpdatedAt,
          recordId: row.annualAccountId,
        }));

        return { total: raw.total, page: raw.page, pageSize: raw.pageSize, rows, counts: raw.counts };
      }),
    );
  }

  private listBankAccounts(query: UlbSubmissionsQuery): Observable<UlbSubmissionsListResponse> {
    let params = new HttpParams()
      .set('designYearId', query.designYearId)
      .set('page', query.page)
      .set('pageSize', query.pageSize)
      .set('sortField', query.sortField)
      .set('sortDirection', query.sortDirection);

    if (query.search.trim()) params = params.set('search', query.search.trim());
    if (query.status?.length) {
      const numericStatuses = query.status.map((status) => REVIEW_STATUS_TO_NUMERIC[status]);
      params = params.set('status', numericStatuses.join(','));
    }

    return this.http.get<unknown>(`${BANK_ACCOUNT_API}state/ulb-submissions`, { params }).pipe(
      map((res) => {
        const raw = unwrap<BankAccountListResponse>(res);
        const rows: UlbSubmissionRow[] = raw.rows.map((row) => ({
          ulbId: row.ulbId,
          ulbCode: row.ulbCode,
          ulbName: row.ulbName,
          formStatus: NUMERIC_TO_REVIEW_STATUS[row.formStatus] ?? 'NOT_STARTED',
          formStatusId: row.formStatus,
          lastUpdatedAt: row.lastUpdatedAt,
          recordId: row.bankAccountId,
        }));
        const counts = Object.fromEntries(
          Object.entries(raw.counts).map(([numeric, count]) => [NUMERIC_TO_REVIEW_STATUS[Number(numeric)], count]),
        ) as Record<ReviewStatus, number>;

        return { total: raw.total, page: raw.page, pageSize: raw.pageSize, rows, counts };
      }),
    );
  }

  private bulkReviewAnnualAccounts(payload: BulkReviewPayload): Observable<BulkReviewResult> {
    const section = FORM_TO_SECTION[payload.form];
    if (!section) throw new Error(`No backend support yet for form: ${payload.form}`);

    const body = {
      section,
      decision: payload.action === 'APPROVE' ? 'APPROVED' : 'RETURNED',
      note: payload.reason ?? null,
      ids: payload.recordIds,
    };
    return this.http
      .post<unknown>(`${ANNUAL_ACCOUNT_API}bulk-decision`, body)
      .pipe(map((res) => unwrap<BulkReviewResult>(res)));
  }

  private bulkReviewBankAccounts(payload: BulkReviewPayload): Observable<BulkReviewResult> {
    void payload; // unused while the bulk-decision endpoint below is commented out
    // Backend's POST /xvi-fc/bank-account/bulk-decision is commented out for now —
    // bulk approve/return for PFMS Bank Account ships in a later push. Uncomment together.
    // const body = {
    //   decision: payload.action === 'APPROVE' ? 'APPROVED' : 'RETURNED',
    //   note: payload.reason ?? null,
    //   ids: payload.recordIds,
    // };
    // return this.http
    //   .post<unknown>(`${BANK_ACCOUNT_API}bulk-decision`, body)
    //   .pipe(map((res) => unwrap<BulkReviewResult>(res)));
    return throwError(() => new Error('Bulk approve/return for PFMS Bank Account is not available yet.'));
  }
}
