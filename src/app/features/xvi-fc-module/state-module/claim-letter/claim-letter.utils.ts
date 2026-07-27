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
