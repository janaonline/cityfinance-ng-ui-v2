export type StateDashboardTaskStatus = 'DONE' | 'PENDING';
export type StateDashboardClaimStatus = 'AVAILABLE' | 'LOCKED';
export type StateDashboardSummaryTone = 'neutral' | 'progress' | 'review' | 'eligible' | 'exemption';

export interface StateDashboardMetric {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly description: string;
}

export interface StateDashboardTask {
  readonly key: string;
  readonly title: string;
  readonly subtitle: string;
  readonly status: StateDashboardTaskStatus;
  readonly actionLabel?: string;
}

export interface StateDashboardSubmissionSummary {
  readonly key: string;
  readonly label: string;
  readonly count: number;
  readonly description: string;
  readonly tone: StateDashboardSummaryTone;
}

export interface StateDashboardFormCompletionRow {
  readonly label: string;
  readonly completed: number;
  readonly total: number;
}

export interface StateDashboardClaimLetter {
  readonly key: string;
  readonly title: string;
  readonly subtitle: string;
  readonly status: StateDashboardClaimStatus;
  readonly actionLabel?: string;
}

export interface StateDashboardData {
  readonly stateName: string;
  readonly financialYear: string;
  readonly roleLabel: string;
  readonly overviewLabel: string;
  readonly metrics: readonly StateDashboardMetric[];
  readonly stateDataTasks: readonly StateDashboardTask[];
  readonly ulbSubmissionSummary: readonly StateDashboardSubmissionSummary[];
  readonly formCompletionRows: readonly StateDashboardFormCompletionRow[];
  readonly claimLetters: readonly StateDashboardClaimLetter[];
}
