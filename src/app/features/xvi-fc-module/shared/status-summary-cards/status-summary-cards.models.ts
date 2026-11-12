import { FORM_STATUS } from '../../common/constants/form-status.constants';
import { StatusAccent, statusHistoryAccent } from '../status-history/status-history.models';

/** Raw counts returned by a reviewer worklist endpoint (`data.summary`) — mirrors the backend's
 *  `PmuWorklistSummary`. Role-neutral, so the MoHUA table can reuse it as-is. */
export interface WorklistStatusSummary {
  /** N: records in scope. */
  total: number;
  /** Distinct states in scope, for the "N per state" sub-text. */
  statesInScope: number;
  notStarted: number;
  inProgress: number;
  underReview: { mohua: number; pmu: number };
  returned: { mohua: number; pmu: number };
  acknowledged: number;
}

/** Total has no status of its own, so it uses the app's primary colour; the rest share the history
 *  dialog's status colours. */
export type SummaryCardAccent = StatusAccent | 'primary';

export interface StatusSummaryCard {
  key: string;
  label: string;
  value: number;
  subText: string;
  accent: SummaryCardAccent;
}

/** count / N x 100, whole numbers. N = 0 shows 0 rather than NaN. Rounded values need not add up to 100. */
export function summaryPercent(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

/** The overview cards, in display order:
 *  Not Started | In Progress | Under Review | Returned | Acknowledged.
 *  "Total Forms Expected" is commented out for now (its sub-text, "N per state", needs `statesInScope`);
 *  the other cards carry N in their own sub-text ("93% of 28") so the total stays visible. */
export function buildStatusSummaryCards(summary: WorklistStatusSummary): StatusSummaryCard[] {
  const { total } = summary;
  // const perState = summary.statesInScope > 0 ? total / summary.statesInScope : 0;
  const percentText = (count: number): string => `${summaryPercent(count, total)}% of ${total}`;
  const split = (parts: { mohua: number; pmu: number }): string => `MoHUA ${parts.mohua} · PMU ${parts.pmu}`;

  return [
    // {
    //   key: 'total',
    //   label: 'Total Forms Expected',
    //   value: total,
    //   subText: `${perState} per state`,
    //   accent: 'primary',
    // },
    {
      key: 'notStarted',
      label: 'Not Started',
      value: summary.notStarted,
      subText: percentText(summary.notStarted),
      accent: statusHistoryAccent(FORM_STATUS.NOT_STARTED),
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: summary.inProgress,
      subText: percentText(summary.inProgress),
      accent: statusHistoryAccent(FORM_STATUS.IN_PROGRESS),
    },
    {
      key: 'underReview',
      label: 'Under Review',
      value: summary.underReview.mohua + summary.underReview.pmu,
      subText: split(summary.underReview),
      accent: statusHistoryAccent(FORM_STATUS.UNDER_REVIEW_BY_PMU),
    },
    {
      key: 'returned',
      label: 'Returned',
      value: summary.returned.mohua + summary.returned.pmu,
      subText: split(summary.returned),
      accent: statusHistoryAccent(FORM_STATUS.RETURNED_BY_PMU),
    },
    {
      key: 'acknowledged',
      label: 'Acknowledged',
      value: summary.acknowledged,
      subText: percentText(summary.acknowledged),
      accent: statusHistoryAccent(FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA),
    },
  ];
}
