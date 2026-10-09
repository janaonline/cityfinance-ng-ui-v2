import type { SlbFormData } from '../../ulb-module/ulb-forms/slb/slb.models';
import type { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

export interface UlbDocument {
  name: string;
  uploaded: string;
}

export interface BankDetails {
  ifsc: string;
  bank: string;
  branch: string;
  accountMasked: string;
  city: string;
  proofFile: string;
}

// Placeholder review content until the MoHUA ULB-detail API exists — replace with the real responses
// (annual-account/by-ulb, bank-account, slb, dur/by-ulb). The same content is shown for every ULB;
// which tabs show it depends on the ULB's own form flags in the state-detail placeholder.
export const AUDITED_DOCS: UlbDocument[] = [
  { name: 'Receipts and Payments Statement', uploaded: 'Mar 12, 2026' },
  { name: 'Balance Sheet', uploaded: 'Mar 12, 2026' },
  { name: 'Schedule to the Balance Sheet', uploaded: 'Mar 12, 2026' },
  { name: 'Income and Expenditure Statement', uploaded: 'Mar 13, 2026' },
  { name: 'Schedule to the I&E Statement', uploaded: 'Mar 13, 2026' },
  { name: 'Cash Flow Statement', uploaded: 'Mar 14, 2026' },
  { name: "Auditor's Report", uploaded: 'Mar 14, 2026' },
];

export const PROVISIONAL_DOCS: UlbDocument[] = [
  { name: 'Receipts and Payments Statement', uploaded: 'Mar 15, 2026' },
  { name: 'Balance Sheet', uploaded: 'Mar 15, 2026' },
  { name: 'Schedule to the Balance Sheet', uploaded: 'Mar 15, 2026' },
  { name: 'Income and Expenditure Statement', uploaded: 'Mar 16, 2026' },
  { name: 'Schedule to the I&E Statement', uploaded: 'Mar 16, 2026' },
  { name: 'Cash Flow Statement', uploaded: 'Mar 17, 2026' },
];

export const DUR_DOCS: UlbDocument[] = [
  { name: 'DUR for tied grants in FY 2025-26', uploaded: 'Mar 18, 2026' },
  { name: 'DUR for untied grants in FY 2025-26', uploaded: 'Mar 18, 2026' },
];

export const BANK_DETAILS: BankDetails = {
  ifsc: 'SBIN0001234',
  bank: 'State Bank of India',
  branch: 'Amadalavalasa',
  accountMasked: '••••••••1234',
  city: 'Srikakulam',
  proofFile: 'cancelled-cheque.pdf',
};

export const APPROVALS = {
  audited: 'Approved by Meena Krishnan on 5 Oct 2026, 2:39 pm',
  provisional: 'Approved by Rajesh Patel on 30 Sept 2026, 2:39 pm',
  pfms: 'Approved by Meena Krishnan on 5 Oct 2026, 2:50 pm',
  dur: 'Approved by Meena Krishnan on 5 Oct 2026, 3:05 pm',
  slb: 'Deemed approved on submission. No State review for this form.',
} as const;

export const CLAIM_LETTER_ID = 'AP-CL-001';

/** Placeholder file shown by every "View PDF" button until real file URLs come from the API
 *  (each document's own `fileUrl`, as on the State review page). */
export const SAMPLE_PDF_PATH = 'assets/files/sample-document-preview.pdf';

// [section, indicator, unit, actual (2025-26), target (2026-27)] — the 28 MoHUA service level benchmarks.
const SLB_INDICATORS: ReadonlyArray<readonly [string, string, string, number, number]> = [
  ['Water Supply', 'Coverage of water supply connections', '%', 82, 90],
  ['Water Supply', 'Per capita supply of water', 'lpcd', 118, 135],
  ['Water Supply', 'Extent of metering of water connections', '%', 46, 60],
  ['Water Supply', 'Extent of non-revenue water', '%', 38, 30],
  ['Water Supply', 'Continuity of water supply', 'hours', 6, 8],
  ['Water Supply', 'Efficiency in redressal of customer complaints', '%', 78, 90],
  ['Water Supply', 'Quality of water supplied', '%', 88, 95],
  ['Water Supply', 'Cost recovery in water supply service', '%', 55, 70],
  ['Water Supply', 'Efficiency in collection of water supply related charges', '%', 64, 80],
  ['Sewerage Management', 'Coverage of toilets', '%', 92, 98],
  ['Sewerage Management', 'Coverage of waste water network services', '%', 34, 45],
  ['Sewerage Management', 'Collection efficiency of waste water network', '%', 60, 75],
  ['Sewerage Management', 'Adequacy of waste water treatment capacity', '%', 48, 65],
  ['Sewerage Management', 'Quality of waste water treatment', '%', 70, 85],
  ['Sewerage Management', 'Extent of reuse and recycling of waste water', '%', 12, 25],
  ['Sewerage Management', 'Efficiency in redressal of customer complaints', '%', 74, 88],
  ['Sewerage Management', 'Extent of cost recovery in waste water management', '%', 40, 55],
  ['Sewerage Management', 'Efficiency in collection of sewerage related charges', '%', 58, 72],
  ['Solid Waste Management', 'Household level coverage of solid waste management services', '%', 90, 100],
  ['Solid Waste Management', 'Efficiency of collection of municipal solid waste', '%', 85, 95],
  ['Solid Waste Management', 'Extent of segregation of municipal solid waste', '%', 52, 70],
  ['Solid Waste Management', 'Extent of municipal solid waste recovered', '%', 44, 60],
  ['Solid Waste Management', 'Extent of scientific disposal of municipal solid waste', '%', 50, 68],
  ['Solid Waste Management', 'Extent of cost recovery in solid waste management services', '%', 36, 50],
  ['Solid Waste Management', 'Efficiency in collection of solid waste management user charges', '%', 48, 65],
  ['Solid Waste Management', 'Efficiency in redressal of customer complaints', '%', 80, 92],
  ['Storm Water Drainage', 'Coverage of storm water drainage network', '%', 58, 70],
  ['Storm Water Drainage', 'Incidence of water logging', 'number', 6, 3],
];

const SLB_QUESTIONS = SLB_INDICATORS.map(
  ([section, label, unit, actual, target], i) =>
    ({
      key: `ind${i + 1}`,
      label,
      position: i + 1,
      formFieldType: 'actualTarget',
      value: { actual, target },
      inputCardConfig: { suffixText: unit },
      validations: [],
      meta: { section },
    }) as unknown as ConditionalFieldConfig,
);

/** Placeholder SLB form in the exact shape the State review page's `<app-slb-review>` takes from
 *  `GET xvi-fc/ulb/slb/:ulbId/:yearId` — swap for the real response once MoHUA can read that endpoint. */
export const SLB_FORM_DATA: SlbFormData = {
  _id: null,
  formName: 'Service Level Benchmarks',
  formId: 0,
  ulbId: '',
  yearId: '',
  designYear: '2026-27',
  actualYearLabel: '2025-26',
  ulbName: '',
  actors: [],
  currentFormStatus: 7,
  currentFormStatusLabel: 'Deemed approved',
  questions: SLB_QUESTIONS,
  permissions: { canView: true, canEdit: false, canFinalSubmit: false },
  meta: { version: 1 },
};
