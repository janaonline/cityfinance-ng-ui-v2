export interface UlbOverviewApiResponse {
  totalAllocation: number;
  ulbId: string;
  ulbName: string;
  stateName: string;
  years: string;
  tableData: UlbOverviewTableRow[];
}

export interface UlbOverviewTableRow {
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
