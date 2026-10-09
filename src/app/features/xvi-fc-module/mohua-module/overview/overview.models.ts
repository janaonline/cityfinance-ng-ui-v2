/** Stage of a state on the Overview, derived by the API from the five state-condition forms. */
export type StateStatus = 'review' | 'progress' | 'notStarted';

export interface StateForm {
  key: string;
  label: string;
  statusCode: number;
  /** Whether MoHUA may open the form's read-only screen — decided by the API (PMU's status gate). */
  canView: boolean;
  /** Display text of the form's status, e.g. "Under Review by MoHUA". */
  statusLabel: string;
  completed: boolean;
}

export interface StateRow {
  /** The state's database id — also the route param of the State pages. */
  stateId: string;
  /** Two-letter code shown on the state's bubble. */
  code: string;
  name: string;
  status: StateStatus;
  /** For under-review states: when all five condition forms were submitted (ISO); used to pick the default state. */
  underReviewSince: string | null;
  /** Amounts in crore; null when not available yet. */
  allocation: number;
  eligible: number | null;
  ulbsDone: number | null;
  ulbsTotal: number;
  formsDone: number;
  forms: StateForm[];
}

export interface OverviewTotals {
  stateCount: number;
  ulbsCovered: number;
  /** Crore. */
  allocation: number;
  /** Crore. */
  instalment1: number;
}

export interface OverviewData {
  year: { id: string; label: string };
  totals: OverviewTotals;
  rows: StateRow[];
}

export const STAGE_TO_STATUS: Record<ApiStage, StateStatus> = {
  underReview: 'review',
  inProgress: 'progress',
  notStarted: 'notStarted',
};

// ── API response (GET xvi-fc/mohua/overview/:yearId) ─────────────────────────
export type ApiStage = 'underReview' | 'inProgress' | 'notStarted';

export interface MohuaOverviewApiState {
  id: string;
  code: string;
  name: string;
  slug: string;
  stage: ApiStage;
  underReviewSince: string | null;
  allocation: number;
  eligible: number | null;
  ulbsDone: number | null;
  ulbsTotal: number;
  formsDone: number;
  forms: { key: string; label: string; statusCode: number; statusLabel: string; completed: boolean; canView: boolean }[];
}

export interface MohuaOverviewApiData {
  year: { id: string; label: string };
  totals: {
    stateCount: number;
    ulbsCovered: number;
    allocation: number;
    instalment1: number;
  };
  states: MohuaOverviewApiState[];
}

export const formatCrore = (value: number | null): string => (value === null ? '--' : `₹${value.toLocaleString('en-IN')} cr`);
