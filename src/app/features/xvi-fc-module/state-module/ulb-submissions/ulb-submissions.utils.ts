import {
  ElectedBodyStatus,
  OverallStatusFilter,
  ReviewStatus,
  STATUS_OPTIONS,
  UlbSubmissionRow,
  UlbSubmissionSortField,
  UlbSubmissionsQuery,
} from './ulb-submissions.models';

const STATUS_BADGE_CLASS: Readonly<Record<ReviewStatus, string>> = {
  APPROVED: 'text-bg-success',
  SUBMITTED: 'text-bg-warning',
  RETURNED: 'text-bg-danger',
  EXEMPT: 'text-bg-secondary',
  IN_PROGRESS: 'text-bg-info',
  NOT_STARTED: 'text-bg-light text-dark border',
};

export function getStatusBadgeClass(status: ReviewStatus): string {
  return STATUS_BADGE_CLASS[status];
}

export function getStatusLabel(status: ReviewStatus): string {
  return STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? status;
}

export function getElectedBodyLabel(status: ElectedBodyStatus): string {
  return status === 'CONSTITUTED' ? 'Constituted' : 'Not Constituted';
}

/** A row can be bulk-approved/returned only while it's awaiting state action. */
export function isRowReviewable(row: UlbSubmissionRow): boolean {
  return row.formStatus === 'SUBMITTED';
}

/** Action-column label: `null` means the row has nothing actionable right now. */
export function getRowActionLabel(row: UlbSubmissionRow): 'Review' | 'View' | null {
  if (row.formStatus === 'SUBMITTED') return 'Review';
  if (row.formStatus === 'APPROVED') return 'View';
  return null;
}

export function formatOverallStatus(row: UlbSubmissionRow): string {
  return `${row.overallStatus.completed}/${row.overallStatus.total}`;
}

function getOverallStatusBucket(row: UlbSubmissionRow): OverallStatusFilter {
  if (row.overallStatus.completed <= 0) return 'NOT_STARTED';
  if (row.overallStatus.completed >= row.overallStatus.total) return 'FULLY_APPROVED';
  return 'IN_PROGRESS';
}

export function filterRows(
  rows: readonly UlbSubmissionRow[],
  query: Pick<UlbSubmissionsQuery, 'search' | 'status' | 'overallStatus'>,
): UlbSubmissionRow[] {
  const search = query.search.trim().toLowerCase();

  return rows.filter((row) => {
    if (search && !row.ulbName.toLowerCase().includes(search) && !row.ulbCode.toLowerCase().includes(search)) {
      return false;
    }
    if (query.status !== 'ALL' && row.formStatus !== query.status) return false;
    if (query.overallStatus !== 'ALL' && getOverallStatusBucket(row) !== query.overallStatus) return false;
    return true;
  });
}

export function sortRows(
  rows: readonly UlbSubmissionRow[],
  field: UlbSubmissionSortField,
  direction: 'asc' | 'desc',
): UlbSubmissionRow[] {
  const factor = direction === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    switch (field) {
      case 'ulbName':
        return a.ulbName.localeCompare(b.ulbName) * factor;
      case 'fcUnspentStatus':
        return a.fcUnspentStatus.localeCompare(b.fcUnspentStatus) * factor;
      case 'formStatus':
        return a.formStatus.localeCompare(b.formStatus) * factor;
      case 'overallStatus':
        return (a.overallStatus.completed - b.overallStatus.completed) * factor;
    }
  });
}

export function paginateRows(rows: readonly UlbSubmissionRow[], page: number, pageSize: number): UlbSubmissionRow[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
