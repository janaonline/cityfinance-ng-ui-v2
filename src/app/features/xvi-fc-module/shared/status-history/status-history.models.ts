import { Observable } from 'rxjs';
import { FORM_STATUS } from '../../common/constants/form-status.constants';

export type StatusHistoryActorRole = 'State' | 'PMU' | 'MoHUA';

/** One step of a form's status path, as returned by `GET xvi-fc/form-history/:form/:stateId/:yearId`
 *  (newest first). `changedAt` is an ISO-8601 UTC string — format it for display, never parse by hand. */
export interface StatusHistoryEntry {
  id: string;
  fromStatusLabel: string | null;
  toStatus: number;
  toStatusLabel: string;
  actorRole: StatusHistoryActorRole;
  changedAt: string;
  /** Only present on "returned" entries. */
  remarks?: string;
}

/** One page of history (newest first). Pass `nextCursor` back to fetch the next, older page. */
export interface StatusHistoryPage {
  entries: StatusHistoryEntry[];
  hasMore: boolean;
  nextCursor: string | null;
}

/** What a reviewer table supplies per row: fetch the first page (no cursor) or the next one. */
export type StatusHistoryLoader = (cursor?: string) => Observable<StatusHistoryPage>;

/** Timeline dot colour (Bootstrap background class) for a status — same palette semantics as the
 *  worklist's status pills: neutral before review, warning while awaiting a reviewer, danger on a
 *  return, success once past PMU. */
export function statusHistoryDotClass(toStatus: number): string {
  switch (toStatus) {
    case FORM_STATUS.RETURNED_BY_STATE:
    case FORM_STATUS.RETURNED_BY_PMU:
    case FORM_STATUS.RETURNED_BY_MOHUA:
      return 'bg-danger';
    case FORM_STATUS.UNDER_REVIEW_BY_STATE:
    case FORM_STATUS.UNDER_REVIEW_BY_PMU:
      return 'bg-warning';
    case FORM_STATUS.UNDER_REVIEW_BY_MOHUA:
    case FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA:
    case FORM_STATUS.APPROVED_BY_STATE:
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
}
