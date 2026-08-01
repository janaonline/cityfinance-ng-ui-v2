/** One of the XVI-FC forms a state reviews, one at a time, across all its ULBs. */
export type ReviewFormId =
  | 'AUDITED_STATEMENTS'
  | 'PROVISIONAL_STATEMENTS'
  | 'PFMS_BANK_ACCOUNT'
  | 'SERVICE_LEVEL_BENCHMARKS'
  | 'FORM_5_TBD';

/** "Select Form" dropdown options. Annual Accounts and PFMS Bank Account map to a real backend today. */
export const FORM_OPTIONS: ReadonlyArray<{ readonly value: ReviewFormId; readonly label: string; readonly live: boolean }> = [
  { value: 'AUDITED_STATEMENTS', label: 'Audited Statements', live: true },
  { value: 'PROVISIONAL_STATEMENTS', label: 'Provisional Statements', live: true },
  { value: 'PFMS_BANK_ACCOUNT', label: 'PFMS Bank Account', live: true },
  { value: 'SERVICE_LEVEL_BENCHMARKS', label: 'Service Level Benchmarks (coming soon)', live: false },
  { value: 'FORM_5_TBD', label: 'Form 5 (coming soon)', live: false },
];

/** Maps a live `ReviewFormId` to the Annual Account section the backend understands. */
export const FORM_TO_SECTION: Partial<Record<ReviewFormId, 'auditedData' | 'unauditedData'>> = {
  AUDITED_STATEMENTS: 'auditedData',
  PROVISIONAL_STATEMENTS: 'unauditedData',
};

/** Maps a live `ReviewFormId` to the review-page tab it should open on — passed as the `?section=` query param. */
export const FORM_TO_TAB: Partial<Record<ReviewFormId, string>> = {
  AUDITED_STATEMENTS: 'auditedData',
  PROVISIONAL_STATEMENTS: 'unauditedData',
  PFMS_BANK_ACCOUNT: 'PFMS',
};

/** The Annual Account form-status lifecycle, shared with the backend's AnnualAccountFormStatus enum. */
export type ReviewStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW_BY_STATE'
  | 'RETURNED_BY_STATE'
  | 'UNDER_REVIEW_BY_MOHUA'
  | 'RETURNED_BY_MOHUA'
  | 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA'
  | 'APPROVED_BY_STATE'
  | 'AWAITING_CLAIM_LETTER';

/** One clickable stat card, grouping one or more underlying statuses into a single reviewer-facing bucket. */
export interface StatusBucket {
  readonly key: string;
  readonly label: string;
  readonly statuses: readonly ReviewStatus[];
  /** Bootstrap icon name (without the "bi-" prefix) shown as a corner badge on the stat card. */
  readonly icon: string;
}

export const STATUS_BUCKETS: readonly StatusBucket[] = [
  { key: 'NOT_STARTED', label: 'ULB Not Started', statuses: ['NOT_STARTED'], icon: 'circle' },
  {
    key: 'IN_PROGRESS',
    label: 'ULB In Progress',
    statuses: ['IN_PROGRESS', 'RETURNED_BY_MOHUA'],
    icon: 'hourglass-split',
  },
  { key: 'UNDER_STATE_REVIEW', label: 'Under Review by State', statuses: ['UNDER_REVIEW_BY_STATE'], icon: 'pencil-square' },
  {
    key: 'APPROVED_BY_STATE',
    label: 'Approved by State',
    statuses: ['APPROVED_BY_STATE'],
    icon: 'check-circle',
  },
  {
    key: 'RETURNED_BY_STATE',
    label: 'Returned by State',
    statuses: ['RETURNED_BY_STATE'],
    icon: 'arrow-counterclockwise',
  },
  {
    key: 'UNDER_REVIEW_BY_MOHUA',
    label: 'Under Review by MoHUA',
    statuses: ['UNDER_REVIEW_BY_MOHUA'],
    icon: 'send-check',
  },
];

export const STATUS_LABELS: Readonly<Record<ReviewStatus, string>> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW_BY_STATE: 'Under Review',
  RETURNED_BY_STATE: 'Returned by State',
  UNDER_REVIEW_BY_MOHUA: 'Forwarded to MoHUA',
  RETURNED_BY_MOHUA: 'Returned by MoHUA',
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 'Approved by MoHUA',
  APPROVED_BY_STATE: 'Approved by State',
  AWAITING_CLAIM_LETTER: 'Awaiting Claim Letter',
};

export interface UlbSubmissionRow {
  readonly ulbId: string;
  readonly ulbCode: string;
  readonly censusCode: string;
  readonly ulbName: string;
  readonly formStatus: ReviewStatus;
  readonly formStatusId: number;
  readonly lastUpdatedAt: string | null;
  /** The selected form's own record id (annual account doc, bank account doc, ...) — null if not started. */
  readonly recordId: string | null;
}

export interface UlbSubmissionsListResponse {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly rows: readonly UlbSubmissionRow[];
  readonly counts: Readonly<Record<ReviewStatus, number>>;
}

export type UlbSubmissionSortField = 'ulbName' | 'formStatus';

export interface UlbSubmissionsQuery {
  readonly designYearId: string;
  readonly form: ReviewFormId;
  readonly search: string;
  /** Underlying statuses for the currently selected stat-card bucket, or null to show every status. */
  readonly status: readonly ReviewStatus[] | null;
  readonly page: number;
  readonly pageSize: number;
  readonly sortField: UlbSubmissionSortField;
  readonly sortDirection: 'asc' | 'desc';
}

export type BulkReviewAction = 'APPROVE' | 'RETURN';

export interface BulkReviewPayload {
  readonly recordIds: readonly string[];
  readonly form: ReviewFormId;
  readonly action: BulkReviewAction;
  readonly reason?: string;
}

export interface BulkReviewResult {
  readonly total: number;
  readonly succeeded: number;
  readonly failed: number;
}
