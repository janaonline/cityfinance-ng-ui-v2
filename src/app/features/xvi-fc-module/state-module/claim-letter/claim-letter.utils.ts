import {
  ClaimLetterApiErrorMap,
  ClaimLetterApiErrorResponse,
  ClaimLetterInstallment,
  ClaimLetterUlbEligibilityTally,
} from './claim-letter.models';

/**
 * Client-side preview of the backend's ±10% claimed-vs-allocated variance check
 * (`isClaimedAmountWithinVariance`/`computeDifferencePercentageBasisPoints` in
 * `claim-letter-financial.helpers.ts`) — a live typing-time preview only; the backend remains
 * authoritative at save time.
 */
export function computeClaimDifferencePercentage(allocationAmount: number, claimedAmount: number): number {
  if (allocationAmount === 0) return 0;
  return ((claimedAmount - allocationAmount) / allocationAmount) * 100;
}

/** Mirrors `isClaimedAmountWithinVariance`'s claimed-vs-allocated band, scaled the same way to
 *  avoid the boundary case dividing before comparing. `lowerPercent`/`upperPercent` come from the
 *  backend (`ClaimLetterClaimContext`/`ClaimLetterBatchSummary`'s `varianceLowerPercent`/
 *  `varianceUpperPercent`) — never hardcoded here. */
export function isClaimWithinVariance(
  allocationAmount: number,
  claimedAmount: number,
  lowerPercent: number,
  upperPercent: number,
): boolean {
  return (
    claimedAmount * 100 >= allocationAmount * lowerPercent && claimedAmount * 100 <= allocationAmount * upperPercent
  );
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
 *  configured source today, so an unconfigured source still reads like the rest of the checklist. */
export function describeEligibilitySourceRequirement(source: {
  formType: string;
  displayDescription?: string;
}): string {
  return source.displayDescription ?? `${humanizeToken(source.formType)} must be submitted by the state.`;
}

/** The requirement plus, when `ulbBreakdown` is present, the per-ULB tally in parentheses - e.g.
 *  "Elected Body constitution must be submitted by the state. (100 eligible, 3 exempted, 20
 *  ineligible out of 123 ULBs)". Plain text; the checklist draws the tally itself, in colour. */
export function describeEligibilitySourceDescription(source: {
  formType: string;
  displayDescription?: string;
  ulbBreakdown?: ClaimLetterUlbEligibilityTally;
}): string {
  const description = describeEligibilitySourceRequirement(source);
  return source.ulbBreakdown ? `${description} (${formatUlbBreakdown(source.ulbBreakdown)})` : description;
}

/** `"100 eligible, 3 exempted, 20 ineligible out of 123 ULBs"`: the two that meet the condition
 *  first, then the ones that do not. */
export function formatUlbBreakdown(tally: ClaimLetterUlbEligibilityTally): string {
  return `${tally.eligible} eligible, ${tally.exempted} exempted, ${tally.ineligible} ineligible out of ${tally.total} ULBs`;
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
  /** Live sum of claimed amounts across the batch's current rows (whole Rupees). */
  liveClaimedTotal: number;
  /** State-wide Installment allocation pool (whole Rupees). */
  totalInstallmentAllocation: number;
  /** What would remain state-wide after this batch, at its current live claim total (whole Rupees). */
  remainingAfterThisBatch: number;
  /** How many more batches (of `CLAIM_LETTER_MAX_BATCH_NUMBER`) could still be created after this
   *  one — 0 or negative means none. */
  slotsRemaining: number;
  installment: ClaimLetterInstallment;
  /** Renders a whole-Rupee amount per the caller's current display mode — plain function param since
   *  this file has no DI access to `AmountDisplayModeService`. */
  formatAmount: (value: number) => string;
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
    `You're claiming ${input.formatAmount(input.liveClaimedTotal)} - ${claimPercent}% of the state's total ` +
      `Installment ${input.installment} allocation (${input.formatAmount(input.totalInstallmentAllocation)}).`,
    `${input.formatAmount(input.remainingAfterThisBatch)} will remain available for other ULBs after this batch - ` +
      `enough for ${slotsRemaining} more ${batchWord}.`,
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function isApiErrorMap(value: unknown): value is ClaimLetterApiErrorMap {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (list) => Array.isArray(list) && list.every((e: unknown) => isRecord(e) && typeof e['message'] === 'string'),
    )
  );
}

/** Status, message(s), `code` and field errors from an `HttpErrorResponse` body or a thrown
 *  `success: false` response; empty when the error carries none. */
export function readApiError(err: unknown): ClaimLetterApiErrorResponse {
  const body = isRecord(err) && isRecord(err['error']) ? err['error'] : err;
  if (!isRecord(body)) return {};
  const raw = body['message'];
  const messages = typeof raw === 'string' ? [raw] : isStringArray(raw) ? raw : [];
  return {
    statusCode: typeof body['statusCode'] === 'number' ? body['statusCode'] : undefined,
    message: messages.length ? messages.join(' ') : undefined,
    messages,
    code: typeof body['code'] === 'string' ? body['code'] : undefined,
    errors: isApiErrorMap(body['errors']) ? body['errors'] : undefined,
  };
}

/** `readApiError` for requests made with `responseType: 'blob' | 'arraybuffer'`, whose error body
 *  is the JSON bytes. */
export async function readBinaryApiError(err: unknown): Promise<ClaimLetterApiErrorResponse> {
  const body = isRecord(err) ? err['error'] : null;
  try {
    const text =
      body instanceof Blob ? await body.text() : body instanceof ArrayBuffer ? new TextDecoder().decode(body) : null;
    if (text) return readApiError({ error: JSON.parse(text) as unknown });
  } catch {
    // Not JSON - fall back to whatever the error object itself carries.
  }
  return readApiError(err);
}
