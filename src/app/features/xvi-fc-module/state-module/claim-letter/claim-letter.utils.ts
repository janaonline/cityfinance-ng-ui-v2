import {
  ClaimLetterApiErrorMap,
  ClaimLetterApiErrorResponse,
  ClaimLetterExemptionNote,
  ClaimLetterInstallment,
  ClaimLetterUlbEligibilityTally,
} from './claim-letter.models';

/** Typing-time preview only; the backend decides at save. */
export function computeClaimDifferencePercentage(allocationAmount: number, claimedAmount: number): number {
  if (allocationAmount === 0) return 0;
  return ((claimedAmount - allocationAmount) / allocationAmount) * 100;
}

/** Cross-multiplied like the backend's `isClaimedAmountWithinVariance`, so the boundary matches exactly. */
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

/** `SOME_TOKEN` -> `Some Token`, so a new backend code renders without a UI change. */
export function humanizeToken(token: string): string {
  return token
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** `displayLabel`, else a humanized `formType`, so a source never renders blank. */
export function describeEligibilitySourceLabel(source: { formType: string; displayLabel?: string }): string {
  return source.displayLabel ?? humanizeToken(source.formType);
}

/** `displayDescription`, else a generated sentence in the checklist's "must be submitted" phrasing. */
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

/** `"100 eligible, 3 exempted (1 under review), 20 ineligible out of 123 ULBs"`: the two that meet
 *  the condition first, then the ones that do not. */
export function formatUlbBreakdown(tally: ClaimLetterUlbEligibilityTally): string {
  return `${tally.eligible} eligible, ${tally.exempted} exempted${formatUnderReviewSuffix(tally)}, ${tally.ineligible} ineligible out of ${tally.total} ULBs`;
}

/** `" (1 under review)"` after the exempted count; empty when no exemption is still under review. */
export function formatUnderReviewSuffix(tally: ClaimLetterUlbEligibilityTally): string {
  return tally.exemptedUnderReview ? ` (${tally.exemptedUnderReview} under review)` : '';
}

export interface ClaimLetterExemptionBadge {
  status: ClaimLetterExemptionNote['status'];
  text: string;
  /** Names the criteria. */
  tooltip: string;
}

/** One badge per status, under review first. */
export function buildExemptionBadges(
  notes: readonly ClaimLetterExemptionNote[] | undefined,
): ClaimLetterExemptionBadge[] {
  const badges: ClaimLetterExemptionBadge[] = [];
  const labels = (status: ClaimLetterExemptionNote['status']) =>
    (notes ?? []).filter((n) => n.status === status).map((n) => n.label);
  const underReview = labels('UNDER_REVIEW');
  if (underReview.length) {
    badges.push({
      status: 'UNDER_REVIEW',
      text: 'Exemption under review',
      tooltip: `Exemption request under MoHUA review: ${underReview.join(', ')}`,
    });
  }
  const rejected = labels('REJECTED');
  if (rejected.length) {
    badges.push({
      status: 'REJECTED',
      text: 'Exemption rejected by MoHUA',
      tooltip: `Exemption request rejected by MoHUA: ${rejected.join(', ')}`,
    });
  }
  return badges;
}

/** One decimal, like the table's difference badge. */
function formatPercent(value: number): string {
  return value.toFixed(1);
}

/** Amounts are whole Rupees. */
export interface BatchNarrativeInput {
  /** Rows in the table now, unsaved ones included. */
  rowCount: number;
  expectedUlbCount: number;
  liveClaimedTotal: number;
  totalInstallmentAllocation: number;
  /** State-wide remainder at this batch's live claim total. */
  remainingAfterThisBatch: number;
  /** Batches that could still be created after this one; 0 or less means none. */
  slotsRemaining: number;
  installment: ClaimLetterInstallment;
  /** Passed in because this file has no DI access to `AmountDisplayModeService`. */
  formatAmount: (value: number) => string;
}

/** What this batch means for the State's allocation, shown while the batch is editable. */
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
