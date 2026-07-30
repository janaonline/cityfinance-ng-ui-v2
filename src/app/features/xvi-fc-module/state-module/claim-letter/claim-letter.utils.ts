import { ClaimLetterInstallment, ClaimLetterUlbEligibilityTally } from './claim-letter.models';

/**
 * Formats an already Crore-denominated, display-ready amount. Never rescales — the backend has
 * already done the paise→Crore conversion (see `claim-letter.models.ts`'s `ClaimLetterFinancialSummary`
 * doc comment); this only appends the unit, mirroring Devolution's local `formatRupees` convention.
 */
export function formatCrore(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  if (isNaN(n)) return '—';
  return `${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.`;
}

/**
 * Client-side preview of the backend's ±10% claimed-vs-allocated variance check
 * (`isClaimedAmountWithinVariance`/`computeDifferencePercentageBasisPoints` in
 * `claim-letter-financial.helpers.ts`), operating on Crore floats rather than the backend's exact
 * paise integers — a live typing-time preview only; the backend remains authoritative at save time.
 */
export function computeClaimDifferencePercentage(allocationAmount: number, claimedAmount: number): number {
  if (allocationAmount === 0) return 0;
  return ((claimedAmount - allocationAmount) / allocationAmount) * 100;
}

/** Mirrors `isClaimedAmountWithinVariance`'s ±10% band (90%–110% of allocation), scaled the same
 *  way to avoid the boundary case dividing before comparing. */
export function isClaimWithinVariance(allocationAmount: number, claimedAmount: number): boolean {
  return claimedAmount * 100 >= allocationAmount * 90 && claimedAmount * 100 <= allocationAmount * 110;
}

/**
 * Generic `SOME_TOKEN` → `Some Token` display formatter for backend enum-like strings
 * (`ClaimLetterEligibilitySource.formType`/`reasonCode`) whose exact value set isn't hardcoded here —
 * a new eligibility source or reason code added on the backend renders sensibly without a UI change.
 */
export function humanizeToken(token: string): string {
  return token
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Short display name for an eligibility source — `displayLabel` when the backend configured one,
 *  else a humanized `formType` so an unconfigured source never renders blank. */
export function describeEligibilitySourceLabel(source: { formType: string; displayLabel?: string }): string {
  return source.displayLabel ?? humanizeToken(source.formType);
}

/** One-line requirement statement for an eligibility source — `displayDescription` when the backend
 *  configured one, else a generated sentence in the same "must be submitted" phrasing used by every
 *  configured source today, so an unconfigured source still reads like the rest of the checklist.
 *  When `ulbBreakdown` is present, the per-ULB tally is appended in parentheses — e.g. "Elected Body
 *  constitution must be submitted by the state. (100 eligible, 20 ineligible, 3 exempted out of 123
 *  ULBs)" — applied uniformly to every criterion that carries a tally, not just row-level ones. */
export function describeEligibilitySourceDescription(source: {
  formType: string;
  displayDescription?: string;
  ulbBreakdown?: ClaimLetterUlbEligibilityTally;
}): string {
  const description = source.displayDescription ?? `${humanizeToken(source.formType)} must be submitted by the state.`;
  return source.ulbBreakdown ? `${description} (${formatUlbBreakdown(source.ulbBreakdown)})` : description;
}

/** `"100 eligible, 20 ineligible, 3 exempted out of 123 ULBs"` — shared phrasing for every
 *  per-ULB tally shown in the eligibility checklist (see `describeEligibilitySourceDescription`). */
export function formatUlbBreakdown(tally: ClaimLetterUlbEligibilityTally): string {
  return `${tally.eligible} eligible, ${tally.ineligible} ineligible, ${tally.exempted} exempted out of ${tally.total} ULBs`;
}

/** One decimal place, matching the live difference-percentage badge's existing rounding convention
 *  (`claim-ulb-table.component.html`'s `number:'1.0-1'` pipe usage). */
function formatPercent(value: number): string {
  return value.toFixed(1);
}

export interface BatchNarrativeInput {
  /** Live count of ULBs currently in the batch's ULB table (including unsaved additions). */
  rowCount: number;
  /** State-wide expected ULB count, from the eligibility summary. */
  expectedUlbCount: number;
  /** Live sum of claimed amounts across the batch's current rows (Crore). */
  liveClaimedTotal: number;
  /** State-wide Installment allocation pool (Crore). */
  totalInstallmentAllocation: number;
  /** What would remain state-wide after this batch, at its current live claim total (Crore). */
  remainingAfterThisBatch: number;
  /** How many more batches (of `CLAIM_LETTER_MAX_BATCH_NUMBER`) could still be created after this
   *  one — 0 or negative means none. */
  slotsRemaining: number;
  installment: ClaimLetterInstallment;
}

/**
 * Short, live-updating story of what this batch means for the state's overall allocation — shown
 * between the summary tiles and the ULB table while a batch is editable (create mode, or an
 * existing draft). Deliberately not installment-specific text ("Installment 1") baked in as a
 * literal — interpolates `installment` so this needs no change once Installment 2 is enabled.
 */
export function buildBatchNarrative(input: BatchNarrativeInput): string[] {
  if (input.rowCount === 0) {
    return ["Add ULBs below to see how this batch affects your state's overall allocation."];
  }

  const ulbPercent =
    input.expectedUlbCount > 0 ? formatPercent((input.rowCount / input.expectedUlbCount) * 100) : '0.0';
  const claimPercent =
    input.totalInstallmentAllocation > 0
      ? formatPercent((input.liveClaimedTotal / input.totalInstallmentAllocation) * 100)
      : '0.0';
  const slotsRemaining = Math.max(input.slotsRemaining, 0);
  const batchWord = slotsRemaining === 1 ? 'batch' : 'batches';

  return [
    `This batch includes ${input.rowCount} of ${input.expectedUlbCount} eligible ULBs (${ulbPercent}%).`,
    `You're claiming ${formatCrore(input.liveClaimedTotal)} — ${claimPercent}% of the state's total ` +
      `Installment ${input.installment} allocation (${formatCrore(input.totalInstallmentAllocation)}).`,
    `${formatCrore(input.remainingAfterThisBatch)} will remain available for other ULBs after this batch — ` +
      `enough for ${slotsRemaining} more ${batchWord}.`,
  ];
}
