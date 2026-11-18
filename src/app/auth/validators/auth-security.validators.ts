import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Rejects HTML tags, inline event handlers, and javascript: URLs.
 * Applies to identifier fields. Angular's template engine escapes {{ }} by default,
 * but this stops the payload from reaching the backend at all.
 */
export function noHtmlOrScript(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  if (
    /<[a-z][\s\S]*?>/i.test(value) || // <tag ...>
    /javascript\s*:/i.test(value) || // javascript: URL
    /on\w+\s*=/i.test(value) // onerror=, onclick=, etc.
  ) {
    return { unsafeInput: true };
  }
  return null;
}

/**
 * Rejects MongoDB operator injection patterns.
 * MongoDB operators start with $ (e.g. $ne, $gt, $where).
 * A leading { signals an attempted JSON operator object like {"$ne": null}.
 */
export function noMongoOperators(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  if (
    /\$[a-z]/i.test(value) || // $ne, $gt, $where, etc.
    /^\s*\{/.test(value) // {"$ne": ...} style injection
  ) {
    return { unsafeInput: true };
  }
  return null;
}

/**
 * Rejects common SQL injection keyword patterns.
 * Unlikely to trigger on a real email or census code;
 * acts as a last line of client-side defense before the request is sent.
 */
export function noSqlInjection(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) return null;
  const SQL_PATTERN =
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|TRUNCATE|ALTER|CREATE)\b|--|'[\s]*OR[\s]*'?1'?\s*=|;[\s]*-{2}/i;
  if (SQL_PATTERN.test(value)) {
    return { unsafeInput: true };
  }
  return null;
}

/**
 * Rejects null bytes. These can cause C-level string truncation bugs and
 * confuse some parsers even in Node.js/MongoDB contexts.
 */
export function noNullBytes(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  return value.includes('\0') ? { unsafeInput: true } : null;
}

/** What a new password still lacks: the error value of `passwordComplexity`. */
export interface PasswordComplexityMissing {
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
}

/**
 * Requires an uppercase letter, a lowercase letter, a number and a special character (any symbol that is not a
 * letter, digit or space). This is the API's own rule (cf-nest-api-v2 `src/module/auth/password-policy.ts`), so a
 * password this form accepts is never refused there; change both together. Length (8–128) is checked by the
 * control's min/max length validators. The error lists what is missing, for `passwordComplexityMessage`.
 *
 * Only wire this into flows that SET a new password (registration, reset) — never into a login-password control,
 * where an existing account's password may predate this rule and would then be unable to log in at all.
 */
export function passwordComplexity(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  const missing: PasswordComplexityMissing = {
    upper: !/[A-Z]/.test(value),
    lower: !/[a-z]/.test(value),
    digit: !/\d/.test(value),
    special: !/[^A-Za-z0-9\s]/.test(value),
  };
  return Object.values(missing).some(Boolean) ? { passwordComplexity: missing } : null;
}

const PASSWORD_PART_LABEL: Record<keyof PasswordComplexityMissing, string> = {
  upper: 'an uppercase letter',
  lower: 'a lowercase letter',
  digit: 'a number',
  special: 'a special character',
};

/** "Password must also include a lowercase letter and a number." for a `passwordComplexity` error, else null. */
export function passwordComplexityMessage(errors: ValidationErrors | null): string | null {
  const missing = errors?.['passwordComplexity'] as PasswordComplexityMissing | undefined;
  if (!missing) return null;
  const parts = (Object.keys(PASSWORD_PART_LABEL) as (keyof PasswordComplexityMissing)[])
    .filter((key) => missing[key])
    .map((key) => PASSWORD_PART_LABEL[key]);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  return `Password must also include ${list}.`;
}

/**
 * Rejects email-format input in a field that expects a census/ULB code.
 * Prevents users from accidentally (or intentionally) entering an email
 * in the ULB code field.
 */
export function noEmailFormat(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) return null;
  return value.includes('@') ? { emailNotAllowed: true } : null;
}

/**
 * Rejects purely numeric input in a field that expects an email address.
 * Prevents users from entering a census code where an email is required.
 */
export function noNumericCode(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) return null;
  return /^\d+$/.test(value) ? { numericCodeNotAllowed: true } : null;
}

// ─── Convenience validator arrays ─────────────────────────────────────────────

/**
 * Security validators for email/identifier fields.
 * Pair with Validators.maxLength(254) for RFC 5321 compliance.
 */
export const IDENTIFIER_SECURITY_VALIDATORS: ValidatorFn[] = [
  noHtmlOrScript,
  noMongoOperators,
  noSqlInjection,
  noNullBytes,
];

/**
 * Security validators for password fields.
 * Deliberately excludes SQL/NoSQL checks — those would reject legitimate
 * passwords like "SELECT_my_p@ss!".
 * Pair with Validators.maxLength(128) to prevent bcrypt DoS.
 */
export const PASSWORD_SECURITY_VALIDATORS: ValidatorFn[] = [noNullBytes];
