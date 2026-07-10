/** One of the XVI-FC forms a state reviews, one at a time, across all its ULBs. */
export type ReviewFormId =
  | 'AUDITED_STATEMENTS'
  | 'PROVISIONAL_STATEMENTS'
  | 'PFMS_BANK_ACCOUNT'
  | 'SERVICE_LEVEL_BENCHMARKS'
  | 'FORM_5_TBD';

/** "Select Form" dropdown options. `FORM_5_TBD` is a placeholder until the 5th form (used in the Overall Status denominator) is confirmed. */
export const FORM_OPTIONS: ReadonlyArray<{ readonly value: ReviewFormId; readonly label: string }> = [
  { value: 'AUDITED_STATEMENTS', label: 'Audited Statements' },
  { value: 'PROVISIONAL_STATEMENTS', label: 'Provisional Statements' },
  { value: 'PFMS_BANK_ACCOUNT', label: 'PFMS Bank Account' },
  { value: 'SERVICE_LEVEL_BENCHMARKS', label: 'Service Level Benchmarks' },
  { value: 'FORM_5_TBD', label: 'Form 5 (TBD)' },
];

/** Per-form review status shown in the Form Status / FC Unspent columns. */
export type ReviewStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'RETURNED' | 'APPROVED' | 'EXEMPT';

export const STATUS_OPTIONS: ReadonlyArray<{ readonly value: 'ALL' | ReviewStatus; readonly label: string }> = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'EXEMPT', label: 'Exempt' },
];

/** Bucketed overall-progress filter, derived from `overallStatus.completed` vs `total`. */
export type OverallStatusFilter = 'ALL' | 'FULLY_APPROVED' | 'IN_PROGRESS' | 'NOT_STARTED';

export const OVERALL_STATUS_OPTIONS: ReadonlyArray<{ readonly value: OverallStatusFilter; readonly label: string }> = [
  { value: 'ALL', label: 'All Overall Statuses' },
  { value: 'FULLY_APPROVED', label: 'Fully Approved' },
  { value: 'IN_PROGRESS', label: 'Partially Complete' },
  { value: 'NOT_STARTED', label: 'Not Started' },
];

export type ElectedBodyStatus = 'CONSTITUTED' | 'NOT_CONSTITUTED';

export interface UlbSubmissionRow {
  readonly ulbId: string;
  readonly ulbCode: string;
  readonly ulbName: string;
  readonly electedBodyStatus: ElectedBodyStatus;
  readonly fcUnspentStatus: ReviewStatus;
  readonly formStatus: ReviewStatus;
  readonly overallStatus: { readonly completed: number; readonly total: number };
  readonly lastUpdatedAt: string;
}

export interface UlbSubmissionsListResponse {
  readonly stateName: string;
  readonly grantName: string;
  readonly totalUlbCount: number;
  readonly total: number;
  readonly rows: readonly UlbSubmissionRow[];
}

export type UlbSubmissionSortField = 'ulbName' | 'fcUnspentStatus' | 'formStatus' | 'overallStatus';

export interface UlbSubmissionsQuery {
  readonly form: ReviewFormId;
  readonly search: string;
  readonly status: 'ALL' | ReviewStatus;
  readonly overallStatus: OverallStatusFilter;
  readonly page: number;
  readonly pageSize: number;
  readonly sortField: UlbSubmissionSortField;
  readonly sortDirection: 'asc' | 'desc';
}

export type BulkReviewAction = 'APPROVE' | 'RETURN';

export interface BulkReviewPayload {
  readonly ulbIds: readonly string[];
  readonly form: ReviewFormId;
  readonly action: BulkReviewAction;
  readonly reason?: string;
}

export interface BulkReviewResult {
  readonly success: boolean;
  readonly updatedCount: number;
}
