export interface StateOverviewApiResponse {
  totalAllocation: number;
  stateId: string;
  stateName: string;
  totalUlbs: number;
  years: string;
  tableData: StateOverviewTableRow[];
}

export interface StateOverviewTableRow {
  year: string;
  basic: number;
  performance: number;
}

export interface DisbursementColumn {
  key: string;
  label: string;
  highlight?: boolean;
}

export interface DisbursementRow {
  id: string;
  label: string;
  /** Raw amounts, `null` where there's nothing to show (e.g. zero performance grant) — formatted
   *  at render time so the display reacts live to `AmountDisplayModeService`'s override. */
  values: Record<string, number | null>;
}
