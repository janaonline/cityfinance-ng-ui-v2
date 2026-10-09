export type Tone = 'teal' | 'orange' | 'good' | 'bad' | 'grey';
export type UlbStatus = 'eligible' | 'notStarted' | 'inProgress' | 'underReview' | 'exemption';
export type IconMotion = 'grow' | 'pop' | 'bob' | 'flip' | 'back' | 'fly';

export interface StatItem {
  value: string;
  label: string;
  note: string;
  icon: string;
  tone: Tone;
  motion: IconMotion;
}

export interface ClaimLetter {
  id: string;
  ulbCount: number;
  /** Display text, e.g. "5 Jul 2026". */
  received: string;
  /** ISO date (yyyy-mm-dd) used only for sorting. */
  receivedOn: string;
  amount: string;
  statusLabel: string;
  tone: Tone;
}

export interface Condition {
  label: string;
  icon: string;
}

export interface UlbFormItem {
  label: string;
  icon: string;
  approved: number;
}

export interface UlbRow {
  name: string;
  census: number;
  /** Allocation in crore. */
  allocation: number;
  electedBody: 'Constituted' | 'Exempt';
  audited: boolean;
  provisional: boolean;
  pfms: boolean;
  slb: boolean;
  dur: boolean;
  status: UlbStatus;
}

export interface StateDetail {
  fy: string;
  grantType: string;
  allocationLabel: string;
  overallStatus: string;
  totalUlbs: number;
  stats: StatItem[];
  claimLetters: ClaimLetter[];
  claimSummary: string;
  conditions: Condition[];
  conditionsStatus: string;
  ulbForms: UlbFormItem[];
  ulbs: UlbRow[];
}

const eligible = (name: string, census: number, allocation: number, electedBody: UlbRow['electedBody']): UlbRow => ({
  name,
  census,
  allocation,
  electedBody,
  audited: true,
  provisional: true,
  pfms: true,
  slb: true,
  dur: true,
  status: 'eligible',
});

const notStarted = (name: string, census: number, allocation: number): UlbRow => ({
  name,
  census,
  allocation,
  electedBody: 'Constituted',
  audited: false,
  provisional: false,
  pfms: false,
  slb: false,
  dur: false,
  status: 'notStarted',
});

// Placeholder state detail until the MoHUA state-detail API exists — replace with the real response.
// The same figures are shown for every state id.
export const STATE_DETAIL: StateDetail = {
  fy: 'FY 2026-27',
  grantType: 'Basic Grants',
  allocationLabel: '₹1,562 cr allocated',
  overallStatus: 'Under Review by MoHUA',
  totalUlbs: 123,
  stats: [
    { value: '₹1,562 cr', label: 'Annual Allocation', note: 'Instalment 1 ₹781 cr', icon: 'bi-bank', tone: 'teal', motion: 'grow' },
    { value: '₹432 cr', label: 'Eligible Amount', note: '62 of 123 ULBs', icon: 'bi-check-circle', tone: 'teal', motion: 'pop' },
    { value: '₹432 cr', label: 'Under Review by MoHUA', note: '3 claims', icon: 'bi-hourglass-split', tone: 'orange', motion: 'flip' },
    { value: '₹0 cr', label: 'Returned by MoHUA', note: '0 claims', icon: 'bi-arrow-return-left', tone: 'bad', motion: 'back' },
    { value: '₹354 cr', label: 'Approved by MoHUA', note: '2 claims', icon: 'bi-shield-check', tone: 'good', motion: 'pop' },
    { value: '₹196 cr', label: 'Recommended to DoE', note: '1 claim', icon: 'bi-send', tone: 'good', motion: 'fly' },
  ],
  claimLetters: [
    { id: 'AP-CL-001', ulbCount: 50, received: '5 Jul 2026', receivedOn: '2026-07-05', amount: '₹196 cr', statusLabel: 'Approved by MoHUA', tone: 'teal' },
    { id: 'AP-CL-002', ulbCount: 12, received: '12 Jul 2026', receivedOn: '2026-07-12', amount: '₹158 cr', statusLabel: 'Approved by MoHUA', tone: 'teal' },
    { id: 'AP-CL-003', ulbCount: 10, received: '22 Jul 2026', receivedOn: '2026-07-22', amount: '₹78 cr', statusLabel: 'Under Review by MoHUA', tone: 'orange' },
    { id: 'AP-CL-004', ulbCount: 8, received: '28 Jul 2026', receivedOn: '2026-07-28', amount: '₹45 cr', statusLabel: 'Under Review by MoHUA', tone: 'orange' },
    { id: 'AP-CL-005', ulbCount: 6, received: '3 Aug 2026', receivedOn: '2026-08-03', amount: '₹32 cr', statusLabel: 'Under Review by MoHUA', tone: 'orange' },
  ],
  claimSummary: '5 claim letters · 2 approved · 3 under review by MoHUA',
  conditions: [
    { label: 'SFC Status', icon: 'bi-bank' },
    { label: 'Elected Bodies', icon: 'bi-people' },
    { label: 'Devolution', icon: 'bi-diagram-3' },
    { label: 'FC Unspent Disclosure', icon: 'bi-wallet2' },
    { label: 'Grant Transfer Certificate', icon: 'bi-file-earmark-check' },
  ],
  conditionsStatus: 'Under Review by MoHUA',
  ulbForms: [
    { label: 'Annual Accounts', icon: 'bi-file-earmark-text', approved: 98 },
    { label: 'Provisional Accounts', icon: 'bi-clipboard-check', approved: 87 },
    { label: 'PFMS Bank Account', icon: 'bi-bank', approved: 84 },
    { label: 'Service Level Benchmarks', icon: 'bi-speedometer2', approved: 84 },
    { label: 'DUR', icon: 'bi-file-earmark-bar-graph', approved: 79 },
  ],
  ulbs: [
    eligible('Amadalavalasa', 459811, 4.9, 'Constituted'),
    eligible('Amalapuram', 459812, 5.3, 'Constituted'),
    eligible('Anantapur', 459813, 31, 'Constituted'),
    eligible('Atmakur (N)', 459814, 4.0, 'Exempt'),
    eligible('Chimakurthy (TP)', 459815, 2.0, 'Exempt'),
    eligible('Chirala', 459816, 6.4, 'Constituted'),
    eligible('Gollaprolu', 459817, 3.0, 'Exempt'),
    eligible('Hindupur', 459818, 8.9, 'Constituted'),
    eligible('Ichapuram', 459840, 4.4, 'Constituted'),
    eligible('Kakinada', 459841, 32, 'Constituted'),
    eligible('Kandukur', 459842, 5.3, 'Exempt'),
    eligible('Ponnur', 459845, 4.2, 'Constituted'),
    eligible('Puttaparthi', 459847, 3.5, 'Constituted'),
    eligible('Puttur', 459848, 4.6, 'Constituted'),
    notStarted('Kondapalli', 460832, 4.5),
    notStarted('Kuppam', 460833, 5.3),
    notStarted('Penukonda (TP)', 460834, 2.3),
    notStarted('Piduguralla', 460835, 4.2),
    notStarted('Rajahmundry', 460836, 42),
    notStarted('YSR Tadigadapa', 460837, 6.2),
    notStarted('B. Kothakota (TP)', 460839, 1.8),
    notStarted('Chinthalapudi (TP)', 460840, 2.2),
    notStarted('Podili (TP)', 460841, 2.4),
  ],
};
