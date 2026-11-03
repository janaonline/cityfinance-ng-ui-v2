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
  claimLetterCount: number;
  /** The highest claim letter number the state has submitted (1, 2, 3...), null when none. */
  latestClaimNumber: number | null;
}

export interface ClaimLettersStates {
  year: { id: string; label: string };
  installment: number;
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
  state: { id: string; name: string };
  yearId: string;
  installment: number;
  receivedOn: string | null;
  status: number;
  statusLabel: string;
  signedClaimFile: ClaimLetterFile | null;
  summary: { claimAmountReceived: number; totalCities: number; exemptionsApplied: number };
  /** Set only on a returned letter: what the return actually reopened. */
  returnDetails: ClaimLetterReturnDetails | null;
  /** How many ULBs the SO has marked for return (all pages); Approve is blocked while it is above 0. */
  returnedUlbCount: number;
  /** ULB exemptions the letter relied on that are still under MoHUA review; approving the letter approves them. */
  pendingExemptionCount: number;
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
  const suffix = lastTwo >= 11 && lastTwo <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/** Status of a claim letter MoHUA has finally approved: 7. */
export const CLAIM_LETTER_APPROVED_STATUSES: readonly number[] = [7];

/** Returned by the SO (16) or by MoHUA (6). */
export const CLAIM_LETTER_RETURNED_STATUSES: readonly number[] = [6, 16];

/** A letter the SO approved (now under MoHUA review, 5): shown as "Verified" on the Claims & Submissions screens. */
export const CLAIM_LETTER_VERIFIED_STATUS = 5;

/** Under SO review (15): shown as "Under Review by MoHUA" on the Claims & Submissions screens. */
const CLAIM_LETTER_UNDER_SO_REVIEW_STATUS = 15;

/** The label to show for a claim letter's status: "Verified" for 5, "Under Review by MoHUA" for 15, else the API's. */
export function claimStatusLabel(status: number, label: string): string {
  if (status === CLAIM_LETTER_VERIFIED_STATUS) return 'Verified';
  if (status === CLAIM_LETTER_UNDER_SO_REVIEW_STATUS) return 'Under Review by MoHUA';
  return label;
}

/** Badge colour for a claim letter's status: returned red, approved or verified green, otherwise amber (under review). */
export function claimStatusBadgeClass(status: number): string {
  if (CLAIM_LETTER_APPROVED_STATUSES.includes(status) || status === CLAIM_LETTER_VERIFIED_STATUS) return 'cs-badge--good';
  if (CLAIM_LETTER_RETURNED_STATUSES.includes(status)) return 'cs-badge--bad';
  return 'cs-badge--review';
}

export function formatReceivedOn(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}
