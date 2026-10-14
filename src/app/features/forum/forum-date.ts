const absoluteFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const DAY_MS = 24 * 3600 * 1000;
const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'week', ms: 7 * DAY_MS },
  { unit: 'day', ms: DAY_MS },
  { unit: 'hour', ms: 3600 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

/** Absolute date, e.g. "Oct 13, 2026, 4:30 PM". Returns '' for invalid input. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : absoluteFormatter.format(date);
}

/** Relative date, e.g. "3 hours ago"; falls back to the absolute format after 30 days. */
export function formatRelativeDate(
  value: string | Date | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = date.getTime() - now.getTime();
  const abs = Math.abs(diff);
  if (abs > 30 * DAY_MS) return absoluteFormatter.format(date);
  for (const { unit, ms } of UNITS) {
    if (abs >= ms) return relativeFormatter.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}
