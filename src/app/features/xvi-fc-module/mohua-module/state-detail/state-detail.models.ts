import { ApiStage, StateForm, StateStatus } from '../overview/overview.models';

export interface StateDetailUlbForm {
  key: string;
  label: string;
  /** ULBs (of totalUlbs) that have submitted this form to the State. */
  completed: number;
}

export interface StateDetailData {
  year: { id: string; label: string };
  state: { id: string; code: string; name: string; status: StateStatus };
  /** Crore: the year's allocation (basic + performance). */
  allocation: number;
  forms: StateForm[];
  formsDone: number;
  ulbForms: { totalUlbs: number; items: StateDetailUlbForm[] };
}

// ── API response (GET xvi-fc/mohua/state/:stateId/:yearId) ───────────────────
export interface MohuaStateDetailApiData {
  year: { id: string; label: string };
  state: { id: string; code: string; name: string; slug: string; stage: ApiStage };
  allocation: number;
  forms: StateForm[];
  formsDone: number;
  ulbForms: { totalUlbs: number; items: StateDetailUlbForm[] };
}

// ── ULB-wise progress (GET xvi-fc/mohua/state/:stateId/:yearId/ulbs) ─────────
export type UlbSortField = 'ulbName' | 'allocation';

export interface StateUlbRow {
  ulbId: string;
  name: string;
  censusCode: string | null;
  /** Crore; null when the state has not uploaded a Devolution Formula. */
  allocation: number | null;
  /** The elected-body status as uploaded by the state. */
  electedBody: string | null;
  forms: { audited: boolean; unaudited: boolean; pfms: boolean; slb: boolean; dur: boolean };
}

export interface StateUlbsPage {
  items: StateUlbRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface StateUlbsQuery {
  page: number;
  limit: number;
  search: string;
  sortBy: UlbSortField;
  sortDir: 'asc' | 'desc';
}
