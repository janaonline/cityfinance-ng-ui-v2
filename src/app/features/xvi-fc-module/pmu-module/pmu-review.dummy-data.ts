import { FieldConfig } from '../../../shared/dynamic-form/field.interface';

/** Phase 9a static mockup only — replaced by real PMU GET responses in Phase 9.3/9.4. */

export type PmuReviewFormId = 'SFC_STATUS' | 'GTC' | 'DEVOLUTION_FORMULA' | 'ELECTED_BODY' | 'FC_UNSPENT';

export type PmuDetailShape = 'FORM_LEVEL' | 'ROW_LEVEL';

export interface PmuFormOption {
  value: PmuReviewFormId;
  label: string;
  detailShape: PmuDetailShape;
  /** Route segment under pmu-module, e.g. '/xvifc/:yearId/<routeSegment>/:stateId'. */
  routeSegment: string;
}

/** Only 2 detail shapes exist across all 5 forms (Component-reuse architecture, Option C) — this
 *  is what lets one generic form-level and one generic row-level detail component serve all 5. */
export const PMU_FORM_OPTIONS: readonly PmuFormOption[] = [
  { value: 'SFC_STATUS', label: 'SFC Status', detailShape: 'FORM_LEVEL', routeSegment: 'sfc-status-review' },
  { value: 'GTC', label: 'Grant Transfer Certificate (GTC)', detailShape: 'FORM_LEVEL', routeSegment: 'gtc-review' },
  {
    value: 'DEVOLUTION_FORMULA',
    label: 'Devolution Formula',
    detailShape: 'FORM_LEVEL',
    routeSegment: 'devolution-formula-review',
  },
  {
    value: 'ELECTED_BODY',
    label: 'Elected Body Status',
    detailShape: 'ROW_LEVEL',
    routeSegment: 'elected-body-review',
  },
  { value: 'FC_UNSPENT', label: 'FC Unspent Declaration', detailShape: 'ROW_LEVEL', routeSegment: 'fc-unspent-review' },
];

export function pmuFormOption(value: PmuReviewFormId): PmuFormOption {
  return PMU_FORM_OPTIONS.find((f) => f.value === value)!;
}

export type PmuReviewStatus = 'Pending Review' | 'Approved' | 'Returned';

export const PMU_REVIEW_STATUS_BADGE_CLASS: Record<PmuReviewStatus, string> = {
  'Pending Review': 'bg-warning-subtle text-warning-emphasis',
  Approved: 'bg-success-subtle text-success-emphasis',
  Returned: 'bg-danger-subtle text-danger-emphasis',
};

export interface PmuReviewSubmissionRow {
  stateId: string;
  stateName: string;
  form: PmuReviewFormId;
  status: PmuReviewStatus;
  submittedOn: string;
  daysPending: number;
}

export interface PmuDummyState {
  stateId: string;
  stateName: string;
}

export const PMU_DUMMY_STATES: readonly PmuDummyState[] = [
  { stateId: 'mh', stateName: 'Maharashtra' },
  { stateId: 'ka', stateName: 'Karnataka' },
  { stateId: 'tn', stateName: 'Tamil Nadu' },
  { stateId: 'up', stateName: 'Uttar Pradesh' },
  { stateId: 'gj', stateName: 'Gujarat' },
  { stateId: 'rj', stateName: 'Rajasthan' },
  { stateId: 'wb', stateName: 'West Bengal' },
  { stateId: 'kl', stateName: 'Kerala' },
];

function stateName(stateId: string): string {
  return PMU_DUMMY_STATES.find((s) => s.stateId === stateId)!.stateName;
}

/** Combined worklist spanning all 5 forms — not every state has submitted every form yet. */
export const PMU_REVIEW_DUMMY_ROWS: PmuReviewSubmissionRow[] = [
  {
    stateId: 'mh',
    stateName: stateName('mh'),
    form: 'SFC_STATUS',
    status: 'Pending Review',
    submittedOn: '2026-09-28',
    daysPending: 8,
  },
  {
    stateId: 'mh',
    stateName: stateName('mh'),
    form: 'GTC',
    status: 'Approved',
    submittedOn: '2026-09-10',
    daysPending: 0,
  },
  {
    stateId: 'mh',
    stateName: stateName('mh'),
    form: 'ELECTED_BODY',
    status: 'Pending Review',
    submittedOn: '2026-09-30',
    daysPending: 6,
  },
  {
    stateId: 'ka',
    stateName: stateName('ka'),
    form: 'SFC_STATUS',
    status: 'Pending Review',
    submittedOn: '2026-09-30',
    daysPending: 6,
  },
  {
    stateId: 'ka',
    stateName: stateName('ka'),
    form: 'DEVOLUTION_FORMULA',
    status: 'Returned',
    submittedOn: '2026-09-18',
    daysPending: 0,
  },
  {
    stateId: 'ka',
    stateName: stateName('ka'),
    form: 'FC_UNSPENT',
    status: 'Pending Review',
    submittedOn: '2026-10-02',
    daysPending: 4,
  },
  {
    stateId: 'tn',
    stateName: stateName('tn'),
    form: 'SFC_STATUS',
    status: 'Approved',
    submittedOn: '2026-09-18',
    daysPending: 0,
  },
  {
    stateId: 'tn',
    stateName: stateName('tn'),
    form: 'ELECTED_BODY',
    status: 'Approved',
    submittedOn: '2026-09-14',
    daysPending: 0,
  },
  {
    stateId: 'up',
    stateName: stateName('up'),
    form: 'SFC_STATUS',
    status: 'Returned',
    submittedOn: '2026-09-20',
    daysPending: 0,
  },
  {
    stateId: 'up',
    stateName: stateName('up'),
    form: 'GTC',
    status: 'Pending Review',
    submittedOn: '2026-10-01',
    daysPending: 5,
  },
  {
    stateId: 'up',
    stateName: stateName('up'),
    form: 'FC_UNSPENT',
    status: 'Returned',
    submittedOn: '2026-09-22',
    daysPending: 0,
  },
  {
    stateId: 'gj',
    stateName: stateName('gj'),
    form: 'SFC_STATUS',
    status: 'Approved',
    submittedOn: '2026-09-15',
    daysPending: 0,
  },
  {
    stateId: 'gj',
    stateName: stateName('gj'),
    form: 'DEVOLUTION_FORMULA',
    status: 'Pending Review',
    submittedOn: '2026-09-29',
    daysPending: 7,
  },
  {
    stateId: 'rj',
    stateName: stateName('rj'),
    form: 'SFC_STATUS',
    status: 'Pending Review',
    submittedOn: '2026-10-01',
    daysPending: 4,
  },
  {
    stateId: 'rj',
    stateName: stateName('rj'),
    form: 'ELECTED_BODY',
    status: 'Pending Review',
    submittedOn: '2026-09-27',
    daysPending: 9,
  },
  {
    stateId: 'wb',
    stateName: stateName('wb'),
    form: 'SFC_STATUS',
    status: 'Returned',
    submittedOn: '2026-09-22',
    daysPending: 0,
  },
  {
    stateId: 'wb',
    stateName: stateName('wb'),
    form: 'FC_UNSPENT',
    status: 'Approved',
    submittedOn: '2026-09-11',
    daysPending: 0,
  },
  {
    stateId: 'kl',
    stateName: stateName('kl'),
    form: 'SFC_STATUS',
    status: 'Approved',
    submittedOn: '2026-09-12',
    daysPending: 0,
  },
  {
    stateId: 'kl',
    stateName: stateName('kl'),
    form: 'GTC',
    status: 'Pending Review',
    submittedOn: '2026-09-30',
    daysPending: 6,
  },
  {
    stateId: 'kl',
    stateName: stateName('kl'),
    form: 'DEVOLUTION_FORMULA',
    status: 'Approved',
    submittedOn: '2026-09-09',
    daysPending: 0,
  },
];

export function findReviewRow(stateId: string, form: PmuReviewFormId): PmuReviewSubmissionRow | undefined {
  return PMU_REVIEW_DUMMY_ROWS.find((r) => r.stateId === stateId && r.form === form);
}

// ─── Form-level dummy questions (SFC Status / GTC / Devolution Formula) ─────────────────────────

const SFC_STATUS_QUESTIONS: FieldConfig[] = [
  {
    key: 'sfcConstituted',
    label: 'Has the State Finance Commission (SFC) been constituted?',
    formFieldType: 'radio',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    value: 'yes',
  },
  { key: 'dateOfConstitution', label: 'Date of constitution of the SFC', formFieldType: 'date', value: '2024-04-15' },
  { key: 'memberCount', label: 'Number of members in the SFC', formFieldType: 'number', value: 5 },
  {
    key: 'recommendationsSubmitted',
    label: 'Has the SFC submitted its recommendations to the State Government?',
    formFieldType: 'radio',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    value: 'yes',
  },
  {
    key: 'remarks',
    label: 'Remarks',
    formFieldType: 'textarea',
    value:
      "SFC constituted as per the Governor's notification dated 15 April 2024; recommendations submitted to the State Legislature.",
  },
];

const GTC_QUESTIONS: FieldConfig[] = [
  {
    key: 'gtcIssued',
    label: 'Has the Grant Transfer Certificate (GTC) been issued for this installment?',
    formFieldType: 'radio',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    value: 'yes',
  },
  { key: 'dateOfIssue', label: 'Date of issue', formFieldType: 'date', value: '2026-08-20' },
  { key: 'certificateNumber', label: 'Certificate number', formFieldType: 'input', value: 'GTC/2026/0452' },
  {
    key: 'remarks',
    label: 'Remarks',
    formFieldType: 'textarea',
    value: 'Certificate issued and uploaded as per format.',
  },
];

const DEVOLUTION_FORMULA_QUESTIONS: FieldConfig[] = [
  {
    key: 'formulaNotified',
    label: 'Has the devolution formula been notified by the State Government?',
    formFieldType: 'radio',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    value: 'yes',
  },
  { key: 'dateOfNotification', label: 'Date of notification', formFieldType: 'date', value: '2026-07-01' },
  {
    key: 'remarks',
    label: 'Remarks',
    formFieldType: 'textarea',
    value: 'Per-ULB allocation uploaded via Excel; totals reconcile with the notified formula.',
  },
];

export function formLevelQuestionsFor(form: PmuReviewFormId): FieldConfig[] {
  switch (form) {
    case 'GTC':
      return GTC_QUESTIONS;
    case 'DEVOLUTION_FORMULA':
      return DEVOLUTION_FORMULA_QUESTIONS;
    case 'SFC_STATUS':
    default:
      return SFC_STATUS_QUESTIONS;
  }
}

// ─── Row-level dummy data (Elected Body / FC Unspent) ───────────────────────────────────────────

export type PmuRowStatus = 'Pending Review' | 'Approved' | 'Returned';

export interface PmuDummyRow {
  rowId: string;
  ulbName: string;
  censusCode: string;
  status: PmuRowStatus;
  /** Only populated for FC Unspent — Elected Body has no eligibility concept. */
  eligibility?: 'Eligible' | 'Not Eligible';
}

export const PMU_ROW_STATUS_BADGE_CLASS: Record<PmuRowStatus, string> = PMU_REVIEW_STATUS_BADGE_CLASS;

const ELECTED_BODY_ROWS: PmuDummyRow[] = [
  { rowId: 'r1', ulbName: 'Alpha City', censusCode: 'C001', status: 'Pending Review' },
  { rowId: 'r2', ulbName: 'Beta Town', censusCode: 'C002', status: 'Pending Review' },
  { rowId: 'r3', ulbName: 'Gamma Nagar', censusCode: 'C003', status: 'Approved' },
  { rowId: 'r4', ulbName: 'Delta Municipality', censusCode: 'C004', status: 'Returned' },
  { rowId: 'r5', ulbName: 'Epsilon City', censusCode: 'C005', status: 'Pending Review' },
  { rowId: 'r6', ulbName: 'Zeta Nagar', censusCode: 'C006', status: 'Pending Review' },
  { rowId: 'r7', ulbName: 'Eta Township', censusCode: 'C007', status: 'Approved' },
  { rowId: 'r8', ulbName: 'Theta City', censusCode: 'C008', status: 'Pending Review' },
  { rowId: 'r9', ulbName: 'Iota Municipality', censusCode: 'C009', status: 'Returned' },
  { rowId: 'r10', ulbName: 'Kappa Nagar', censusCode: 'C010', status: 'Pending Review' },
  { rowId: 'r11', ulbName: 'Lambda Town', censusCode: 'C011', status: 'Approved' },
  { rowId: 'r12', ulbName: 'Mu City', censusCode: 'C012', status: 'Pending Review' },
];

const FC_UNSPENT_ROWS: PmuDummyRow[] = [
  { rowId: 'r1', ulbName: 'Alpha City', censusCode: 'C001', status: 'Pending Review', eligibility: 'Eligible' },
  { rowId: 'r2', ulbName: 'Beta Town', censusCode: 'C002', status: 'Approved', eligibility: 'Eligible' },
  { rowId: 'r3', ulbName: 'Gamma Nagar', censusCode: 'C003', status: 'Pending Review', eligibility: 'Not Eligible' },
  { rowId: 'r4', ulbName: 'Delta Municipality', censusCode: 'C004', status: 'Pending Review', eligibility: 'Eligible' },
  { rowId: 'r5', ulbName: 'Epsilon City', censusCode: 'C005', status: 'Returned', eligibility: 'Eligible' },
  { rowId: 'r6', ulbName: 'Zeta Nagar', censusCode: 'C006', status: 'Pending Review', eligibility: 'Not Eligible' },
  { rowId: 'r7', ulbName: 'Eta Township', censusCode: 'C007', status: 'Approved', eligibility: 'Eligible' },
  { rowId: 'r8', ulbName: 'Theta City', censusCode: 'C008', status: 'Pending Review', eligibility: 'Eligible' },
  {
    rowId: 'r9',
    ulbName: 'Iota Municipality',
    censusCode: 'C009',
    status: 'Pending Review',
    eligibility: 'Not Eligible',
  },
  { rowId: 'r10', ulbName: 'Kappa Nagar', censusCode: 'C010', status: 'Returned', eligibility: 'Eligible' },
  { rowId: 'r11', ulbName: 'Lambda Town', censusCode: 'C011', status: 'Pending Review', eligibility: 'Eligible' },
  { rowId: 'r12', ulbName: 'Mu City', censusCode: 'C012', status: 'Approved', eligibility: 'Eligible' },
];

export function rowsFor(form: PmuReviewFormId): PmuDummyRow[] {
  return form === 'FC_UNSPENT' ? FC_UNSPENT_ROWS : ELECTED_BODY_ROWS;
}

export function hasEligibilityColumn(form: PmuReviewFormId): boolean {
  return form === 'FC_UNSPENT';
}

const ELECTED_BODY_FORM_QUESTIONS: FieldConfig[] = [
  { key: 'totalUlbsCovered', label: 'Total ULBs covered in this dataset', formFieldType: 'number', value: 5 },
  {
    key: 'remarks',
    label: 'Remarks',
    formFieldType: 'textarea',
    value: 'All ULB elected-body statuses uploaded and validated.',
  },
];

const FC_UNSPENT_FORM_QUESTIONS: FieldConfig[] = [
  {
    key: 'totalUnspentBalance',
    label: 'Total unspent balance carried forward (₹)',
    formFieldType: 'number',
    value: 1250000,
  },
  {
    key: 'remarks',
    label: 'Remarks',
    formFieldType: 'textarea',
    value: 'Unspent balances reconciled against prior installment records.',
  },
];

/** The row-level forms' own small set of form-level fields, shown above the row table. */
export function rowLevelFormQuestionsFor(form: PmuReviewFormId): FieldConfig[] {
  return form === 'FC_UNSPENT' ? FC_UNSPENT_FORM_QUESTIONS : ELECTED_BODY_FORM_QUESTIONS;
}
