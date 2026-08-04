/**
 * Formats an already Crore-denominated, display-ready amount. Never rescales — the backend has
 * already done the paise→Crore conversion; this only appends the unit, mirroring Claim Letter's
 * local `formatCrore` convention (`claim-letter.utils.ts`).
 */
export function formatCrore(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  if (isNaN(n)) return '—';
  return `${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.`;
}

/** Full-precision sibling of `formatCrore`, for hover/title text — never rounds. */
export function formatCroreFull(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  if (isNaN(n)) return '—';
  return `${n.toLocaleString('en-IN', { maximumFractionDigits: 20 })} Cr.`;
}
