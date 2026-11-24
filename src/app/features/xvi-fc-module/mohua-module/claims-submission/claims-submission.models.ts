/** The only installment the claim letter flow supports so far. */
export const CLAIMS_INSTALLMENT = 1;

export type FirstClaimStatus = 'RECEIVED' | 'PENDING';
export type ClaimLetterUlbStatus = 'ELIGIBLE' | 'ELIGIBLE_VIA_EXEMPTION';

/** All money is whole Rupees; use `formatRupeesInCrore` to show it. */
export interface ClaimLettersStateRow {
  stateId: string;
  name: string;
  code: string;
  firstClaimStatus: FirstClaimStatus;
  installmentAllocation: number | null;
  amountClaimed: number | null;
  ulbsIncluded: number | null;
  /** The state's expected ULBs for the year: the "of N" in the ULBs included column. Missing from an older API. */
  totalUlbs?: number;
  claimLetterCount: number;
  /** The highest claim letter number the state has submitted (1, 2, 3...), null when none. */
  latestClaimNumber: number | null;
}

/** Claim letters at one stage: how many, from how many States, and their amount (whole Rupees). */
export interface ClaimStage {
  claims: number;
  states: number;
  amount: number;
}

/** The national figures above the States table (see the API's MohuaClaimLettersOverview). Released isn't tracked yet. */
export interface ClaimLettersOverview {
  totalAllocation: number;
  stateCount: number;
  /** Every letter received (returned ones too); the amount leaves returned letters out. */
  submitted: ClaimStage;
  /** Under SO review. */
  underReview: ClaimStage;
  /** Verified by the SO or acknowledged by MoHUA. */
  approved: ClaimStage;
  returned: ClaimStage;
}

export interface ClaimLettersStates {
  year: { id: string; label: string };
  installment: number;
  overview: ClaimLettersOverview;
  states: ClaimLettersStateRow[];
}

export interface ClaimLetterListItem {
  id: string;
  number: string;
  /** Which claim letter of the state this is (1, 2, 3...). */
  batchNumber: number;
  receivedOn: string | null;
  ulbCount: number;
  amount: number;
  status: number;
  statusLabel: string;
  /** Set when the letter was returned because another letter's State form was returned. */
  returnedWith?: ClaimLetterReturnedWith | null;
}

/** The letter whose return reopened a State form this letter relied on, and those forms. */
export interface ClaimLetterReturnedWith {
  letterId: string;
  number: string;
  formNames: string[];
}

/** Why SFC or GTC can't be returned with this letter (the API decides). */
export type ClaimLetterStateFormLockReason = 'ACCEPTED' | 'EXEMPTED' | 'NOT_IN_REVIEW';

/** SFC or GTC as the return dialog offers them: returnable only while no approval has accepted them. */
export interface ClaimLetterReturnableStateForm {
  formId: number;
  name: string;
  returnable: boolean;
  /** Null while returnable. */
  lockReason: ClaimLetterStateFormLockReason | null;
  /** e.g. "Claim Letter 1": the letter whose approval accepted it; null unless ACCEPTED and found. */
  acceptedWithLetter: string | null;
  /** The letter relied on the State's own exemption request for this form, still under review: ticking it rejects it. */
  rejectsExemption?: boolean;
  /** Live status of that State exemption request (5, 6 or 7); null or absent when the letter relied on none. */
  exemptionStatus?: number | null;
}

/** The band under a state's claim letters. Money is whole Rupees. */
export interface StateClaimLettersSummary {
  claimedUlbs: number;
  pendingUlbs: number;
  approvedUlbs: number;
  underReviewUlbs: number;
  returnedUlbs: number;
  amountClaimed: number;
  balance: number;
}

export interface StateClaimLetters {
  state: { id: string; name: string };
  installment: number;
  summary: StateClaimLettersSummary;
  claimLetters: ClaimLetterListItem[];
}

export interface ClaimLetterFile {
  name: string;
  url: string;
  sizeKb: number;
}

export interface ClaimLetterDetail {
  id: string;
  /** Sent back with an approval so a letter changed in the meantime is not approved blind. */
  revision: number;
  number: string;
  /** Which claim letter of the State this is; the Claim Eligibility link filters to it. */
  batchNumber: number;
  state: { id: string; name: string };
  yearId: string;
  installment: number;
  receivedOn: string | null;
  status: number;
  statusLabel: string;
  signedClaimFile: ClaimLetterFile | null;
  /** Money is whole Rupees. `exemption*` is this letter's ULBs that came in through an exemption request;
   *  `submitted*` is every letter the State submitted for the installment, under review or acknowledged. */
  summary: {
    claimAmountReceived: number;
    totalCities: number;
    exemptionsApplied: number;
    exemptionAmount: number;
    submittedClaimAmount: number;
    submittedUlbs: number;
  };
  /** Set only on a returned letter: what the return actually reopened. */
  returnDetails: ClaimLetterReturnDetails | null;
  /** How many ULBs the SO has marked for return (all pages); Approve is blocked while it is above 0. */
  returnedUlbCount: number;
  /** ULB exemptions the letter relied on that are still under MoHUA review; approving the letter approves them. */
  pendingExemptionCount: number;
  /** Under SO review only: SFC and GTC as the return dialog offers them. */
  stateForms?: ClaimLetterReturnableStateForm[];
  /** Under SO review only: the State's other letters under review, returned too when this return reopens a State form. */
  otherLettersUnderReview?: { id: string; number: string }[];
  /** Under SO review only: ULBs marked returned with a State-form row picked (each reopens that whole form). */
  returnedRowUlbCount?: number;
  returnedWith?: ClaimLetterReturnedWith | null;
}

/** A form the return reopened; `ulbCount` is how many ULBs' forms/rows it covers (0 for a State form with no rows). */
export interface ClaimLetterReturnedForm {
  formId: number;
  ulbCount: number;
}

export interface ClaimLetterReturnDetails {
  returnedAt: string;
  returnedBy: string | null;
  stateRemark: string | null;
  stateForms: ClaimLetterReturnedForm[];
  ulbForms: ClaimLetterReturnedForm[];
  returnedUlbCount: number;
}

export interface ClaimLetterUlbRow {
  ulbId: string;
  name: string;
  censusCode: string | null;
  installmentShare: number;
  claimedAmount: number;
  ulbStatus: ClaimLetterUlbStatus;
  /** Null on a returned letter for a ULB the return did not touch. */
  reviewStatus: number | null;
  reviewStatusLabel: string | null;
  /** On a returned letter, the formIds reopened for this ULB; else empty. */
  returnedFormIds: number[];
  /** The SO's return mark on this ULB; null = not marked (counts as fine). */
  soDecision: ClaimLetterSoDecision | null;
  /** The ULB's own discretionary exemptions the letter relied on; when any, the ULB is returned only through them. */
  exemptions: ClaimLetterUlbExemption[];
}

export interface ClaimLetterUlbExemption {
  formId: number;
  exemptionId: string;
  /** Live: 5 under MoHUA review, 7 approved, 6 rejected. */
  status: number;
}

export interface ClaimLetterSoDecision {
  status: 'RETURNED';
  /** The ULB's own forms the letter's return will reopen. */
  ulbFormIds: number[];
  /** State forms whose row for this ULB the letter's return will reopen. */
  rowFormIds: number[];
  /** Forms whose pending exemption the letter's return will reject. */
  rejectExemptionFormIds: number[];
  remark: string | null;
  decidedAt: string;
}

export interface ClaimLetterUlbs {
  items: ClaimLetterUlbRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const RUPEES_PER_CRORE = 10_000_000;

/** Whole Rupees as crore, e.g. 1,305,000,000 -> "₹130.5 cr"; null/undefined -> "—". */
export function formatRupeesInCrore(rupees: number | null | undefined): string {
  if (rupees === null || rupees === undefined) return '—';
  const crore = Math.round((rupees / RUPEES_PER_CRORE) * 10) / 10;
  return `₹${crore.toLocaleString('en-IN', { maximumFractionDigits: 1 })} cr`;
}

/** 1 -> "1st", 2 -> "2nd", 11 -> "11th", 23 -> "23rd". */
export function formatOrdinal(n: number): string {
  const lastTwo = n % 100;
  const suffix =
    lastTwo >= 11 && lastTwo <= 13 ? 'th' : (({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th');
  return `${n}${suffix}`;
}

/** Status of a claim letter MoHUA has finally approved: 7. */
export const CLAIM_LETTER_APPROVED_STATUSES: readonly number[] = [7];

/** Returned by the SO (16) or by MoHUA (6). */
export const CLAIM_LETTER_RETURNED_STATUSES: readonly number[] = [6, 16];

/** A letter the SO approved (now under MoHUA review, 5): shown as "Approved" on the Claims & Submissions and OM screens. */
export const CLAIM_LETTER_VERIFIED_STATUS = 5;

/** Under SO review (15): shown as "Under Review by MoHUA" on the Claims & Submissions screens. */
const CLAIM_LETTER_UNDER_SO_REVIEW_STATUS = 15;

/** The label to show for a claim letter's status: "Approved" for 5, "Under Review by MoHUA" for 15, else the API's. */
export function claimStatusLabel(status: number, label: string): string {
  if (status === CLAIM_LETTER_VERIFIED_STATUS) return 'Approved';
  if (status === CLAIM_LETTER_UNDER_SO_REVIEW_STATUS) return 'Under Review by MoHUA';
  return label;
}

/** Badge colour for a claim letter's status: returned red, approved (5 or 7) green, otherwise amber (under review). */
export function claimStatusBadgeClass(status: number): string {
  if (CLAIM_LETTER_APPROVED_STATUSES.includes(status) || status === CLAIM_LETTER_VERIFIED_STATUS)
    return 'cs-badge--good';
  if (CLAIM_LETTER_RETURNED_STATUSES.includes(status)) return 'cs-badge--bad';
  return 'cs-badge--review';
}

export function formatReceivedOn(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

// ─── ULB Eligibility page (see the API's MohuaUlbEligibility) ────────────────

export type UlbEligibilityFilter = 'ELIGIBLE' | 'INELIGIBLE';

/** The failed-condition key for a ULB with no devolution allocation. */
export const ULB_ELIGIBILITY_NO_ALLOCATION = 'NO_ALLOCATION';
/** The batch filter value for ULBs held by no letter. */
export const ULB_ELIGIBILITY_NOT_IN_LETTER = 'NONE';
export const ULB_ELIGIBILITY_PAGE_SIZE = 10;

/** Statuses of a letter that holds ULBs, with MoHUA's labels. */
export const ULB_ELIGIBILITY_LETTER_STATUSES: readonly { status: number; label: string }[] = [
  { status: 2, label: 'Draft' },
  { status: 15, label: 'Under Review by MoHUA' },
  { status: CLAIM_LETTER_VERIFIED_STATUS, label: 'Verified' },
  { status: 7, label: 'Acknowledged by MoHUA' },
];

export interface UlbEligibilityColumn {
  key: string;
  label: string;
  header: string;
  kind: 'serial' | 'name' | 'value' | 'yesNo' | 'amount';
}

export interface UlbEligibilityBatch {
  claimLetterId: string;
  batchNumber: number;
  status: number;
  statusLabel: string;
  /** False for a draft: MoHUA can't open it. */
  linkable: boolean;
}

export interface UlbEligibilityRow {
  slNo: number;
  ulbId: string;
  name: string;
  censusCode: string | null;
  sbCode: string | null;
  /** Whole Rupees; null when the ULB has no allocation. */
  tied: number | null;
  untied: number | null;
  /** One per column. For an amount column, only its note (e.g. "Exempted"). */
  cells: string[];
  /** Whole Rupees for an amount column (0 = Nil), null for the others. Missing from a check cached before it existed. */
  amounts?: (number | null)[];
  eligible: boolean;
  failedConditions: string[];
  batch: UlbEligibilityBatch | null;
}

export interface UlbEligibility {
  /** ISO time of the cached condition check. */
  asOn: string;
  stateName: string;
  designYearLabel: string;
  installment: number;
  stateGate: { passed: boolean; failedConditions: { label: string; statusLabel: string }[] };
  noneStarted: boolean;
  columns: UlbEligibilityColumn[];
  conditions: { key: string; label: string }[];
  /** State-wide, before filters. */
  counts: {
    total: number;
    eligible: number;
    ineligible: number;
    inLetter: number;
    notInLetter: number;
    /** Eligible ULBs no letter holds yet. */
    eligibleNotInLetter: number;
    batches: { batchNumber: number; count: number }[];
    letterStatuses: { status: number; count: number }[];
  };
  /** Over every row matching the filters. */
  totals: { tied: number; untied: number };
  items: UlbEligibilityRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface UlbEligibilityQuery {
  search?: string;
  eligibility?: UlbEligibilityFilter;
  batch?: string;
  letterStatus?: number;
  condition?: string;
  page?: number;
  limit?: number;
  refresh?: boolean;
}
