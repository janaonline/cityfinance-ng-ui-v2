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
  values: Record<string, string>;
}
