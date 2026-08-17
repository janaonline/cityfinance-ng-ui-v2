import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Common webmail providers — personal addresses are allowed, but a typo of one of these
 *  (e.g. "gmial.com") is almost certainly a mistake, not a genuinely different domain. */
const KNOWN_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.in',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.in',
  'live.com',
  'live.in',
  'rediffmail.com',
  'rediff.com',
  'icloud.com',
  'me.com',
  'protonmail.com',
  'proton.me',
  'aol.com',
  'mail.com',
  'yandex.com',
];
const KNOWN_EMAIL_DOMAIN_SET = new Set(KNOWN_EMAIL_DOMAINS);

function domainOf(control: AbstractControl): string | null {
  const value = (control.value as string)?.trim().toLowerCase();
  if (!value || !value.includes('@')) return null;
  return value.split('@').pop() ?? null;
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, (_, i) => [i, ...new Array(cols - 1).fill(0)]);
  for (let j = 1; j < cols; j++) dp[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[rows - 1][cols - 1];
}

/** Flags likely typos of a well-known webmail provider (e.g. "gmial.com", "gmail.con"). An exact
 *  match to a known domain — including personal ones like gmail.com — always passes; only a
 *  near-miss (edit distance exactly 1 from a known domain, and not itself a different known
 *  domain) is flagged. */
export function noEmailDomainTypo(control: AbstractControl): ValidationErrors | null {
  const domain = domainOf(control);
  if (!domain || KNOWN_EMAIL_DOMAIN_SET.has(domain)) return null;

  const isTypoOf = KNOWN_EMAIL_DOMAINS.some((known) => levenshtein(domain, known) === 1);
  return isTypoOf ? { emailDomainTypo: true } : null;
}

/** Flags likely typos of an official .gov.in/.nic.in domain (e.g. "telangana.gv.in"). Only the
 *  segment right before the final .in label is fuzzy-matched, and only within edit distance 1 —
 *  narrow enough that legitimate suffixes like co.in/org.in/net.in/ac.in/edu.in (all distance ≥2
 *  from "gov"/"nic") never trigger it. */
export function noGovDomainTypo(control: AbstractControl): ValidationErrors | null {
  const domain = domainOf(control);
  if (!domain || !domain.endsWith('.in')) return null;
  if (domain.endsWith('.gov.in') || domain.endsWith('.nic.in')) return null;

  const labels = domain.split('.');
  const segment = labels.length >= 2 ? labels[labels.length - 2] : '';
  if (!segment) return null;

  const isNearMiss = (target: string) => segment !== target && levenshtein(segment, target) === 1;
  return isNearMiss('gov') || isNearMiss('nic') ? { governmentDomainTypo: true } : null;
}
