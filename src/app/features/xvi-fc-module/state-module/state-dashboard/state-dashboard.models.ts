export interface StateDashboardApiResponse {
  success: boolean;
  message: string;
  data: StateDashboardData;
  timestamp: string;
  requestId: string;
}

export interface StateDashboardContext {
  stateId: string;
  stateName: string;
  yearId: string;
  financialYear: string;
  userRole: string;
  grantType: string | null;
}

export interface StateDashboardCompliance {
  rate: number;
  compliantUlbs: number;
  totalUlbs: number;
}

export interface StateDashboardMetrics {
  totalUlbs: number;
  /** Whole Rupees, no decimals (see amountUnit). */
  allocatedAmount: number;
  claimedAmount: number;
  /** Informational only — display no longer branches on this. `AmountDisplayModeService.format()`
   *  always treats amounts as whole Rupees regardless of this field's value. */
  amountUnit: 'RUPEE';
  currency: 'INR';
  compliance: StateDashboardCompliance;
}

export type StateDashboardTaskStatus = 'DONE' | 'PENDING';

export interface StateDashboardTask {
  key: 'ulb-registration' | 'devolution-formula' | 'state-conditions';
  title: string;
  subtitle: string;
  status: StateDashboardTaskStatus;
  actionLabel: string | null;
  route: string | null;
}

export type StateDashboardUlbSubmissionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'ELIGIBLE'
  | 'EXEMPTION_REQUESTED';

export interface StateDashboardUlbSubmissionSummaryItem {
  key: StateDashboardUlbSubmissionStatus;
  label: string;
  count: number;
  description: string;
}

export type StateDashboardFormKey =
  | 'annual-accounts'
  | 'provisional-accounts'
  | 'pfms-bank-account'
  | 'fc-unspent-balance'
  | 'service-level-benchmarks';

export interface StateDashboardFormCompletionItem {
  key: StateDashboardFormKey;
  label: string;
  completed: number;
  total: number;
}

export type StateDashboardClaimLetterStatus = 'AVAILABLE' | 'LOCKED';

export interface StateDashboardClaimLetterItem {
  key: 'installment-1-batch-1' | 'installment-2';
  title: string;
  subtitle: string;
  installment: number;
  status: StateDashboardClaimLetterStatus;
  actionLabel: string | null;
  lockReason: string | null;
  route: string | null;
}

export interface StateDashboardData {
  context: StateDashboardContext;
  metrics: StateDashboardMetrics;
  stateDataTasks: StateDashboardTask[];
  ulbSubmissionSummary: StateDashboardUlbSubmissionSummaryItem[];
  formCompletion: StateDashboardFormCompletionItem[];
  claimLetters: StateDashboardClaimLetterItem[];
}

export type StateDashboardMetricKey = 'total-ulbs' | 'allocated' | 'claimed' | 'compliance-rate';

export interface StateDashboardMetricView {
  key: StateDashboardMetricKey;
  label: string;
  value: string;
  description: string;
}

export type StateDashboardSummaryTone = 'neutral' | 'progress' | 'review' | 'eligible' | 'exemption';
