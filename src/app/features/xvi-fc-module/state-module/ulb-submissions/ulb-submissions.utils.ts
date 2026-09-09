import { ReviewStatus, STATUS_LABELS, UlbSubmissionRow } from './ulb-submissions.models';

const STATUS_BADGE_CLASS: Readonly<Record<ReviewStatus, string>> = {
  NOT_STARTED: 'text-bg-light text-dark border',
  IN_PROGRESS: 'text-bg-info',
  UNDER_REVIEW_BY_STATE: 'text-bg-warning',
  RETURNED_BY_STATE: 'text-bg-danger',
  UNDER_REVIEW_BY_MOHUA: 'text-bg-success',
  RETURNED_BY_MOHUA: 'text-bg-danger',
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 'text-bg-success',
  APPROVED_BY_STATE: 'text-bg-success',
  AWAITING_CLAIM_LETTER: 'text-bg-info',
};

export function getStatusBadgeClass(status: ReviewStatus): string {
  return STATUS_BADGE_CLASS[status];
}

export function getStatusLabel(status: ReviewStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Whole days elapsed since this row entered state review — "Pending Since" is exclusively an
 * Under Review by State concept, so every other status shows nothing (null), not a stale
 * last-updated figure left over from whatever last touched the doc. `lastUpdatedAt` is used only
 * as a fallback anchor for a review-bucket row whose `enteredReviewAt` is missing (e.g. a form
 * that reached this status through a path other than the normal submit-for-review flow) — better
 * than showing a blank dash on a row that's actually awaiting review right now.
 */
export function daysPending(row: Pick<UlbSubmissionRow, 'formStatus' | 'lastUpdatedAt' | 'enteredReviewAt'>): number | null {
  if (row.formStatus !== 'UNDER_REVIEW_BY_STATE') return null;
  const anchor = row.enteredReviewAt ?? row.lastUpdatedAt;
  if (!anchor) return null;
  const elapsedMs = Date.now() - new Date(anchor).getTime();
  return Math.max(0, Math.floor(elapsedMs / (24 * 60 * 60 * 1000)));
}

/** A row can be bulk-approved/returned only while it's awaiting state action. */
export function isRowReviewable(row: UlbSubmissionRow): boolean {
  return row.formStatus === 'UNDER_REVIEW_BY_STATE';
}

/** Action-column label: `null` means the row has nothing actionable right now. */
export function getRowActionLabel(row: UlbSubmissionRow): 'Review' | 'View' | null {
  if (!row.recordId) return null;
  if (row.formStatus === 'UNDER_REVIEW_BY_STATE') return 'Review';
  return 'View';
}
