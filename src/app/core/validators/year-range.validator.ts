import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface YearRangeValidatorConfig {
  separator?: string;
  startYearMin?: number;
  startYearMax?: number;
  endYearMin?: number;
  endYearMax?: number;
  requireEndGreaterThanStart?: boolean;
  /** When set, `endYear - startYear` must be one of these values. */
  allowedDurations?: number[];
  /** When set, the range must include (contain) this year (inclusive on both ends). */
  requiredIncludedYear?: number;
}

/** Discriminated reason returned inside the `yearRange` error object. */
export type YearRangeErrorReason =
  | 'invalidFormat'
  | 'startOutOfRange'
  | 'endOutOfRange'
  | 'endNotGreater'
  | 'invalidDuration'
  | 'requiredIncludedYearMissing';

function yearRangeError(reason: YearRangeErrorReason): ValidationErrors {
  return { yearRange: { reason } };
}

/**
 * Validates that a text value represents a valid year range in the form `YYYY<separator>YYYY`.
 *
 * All constraints are optional. `requireEndGreaterThanStart` defaults to `true`.
 * Returns `{ yearRange: { reason } }` on any constraint violation, `null` on success.
 * Returns `null` for empty values so the field stays optional-compatible.
 *
 * @example
 * yearRangeValidator({
 *   startYearMin: 2015, startYearMax: 2027,
 *   endYearMin: 2020,   endYearMax: 2029,
 *   allowedDurations: [1, 5, 6],
 *   requiredIncludedYear: 2026,
 * })
 */
export function yearRangeValidator(config: YearRangeValidatorConfig = {}): ValidatorFn {
  const {
    separator = '-',
    startYearMin,
    startYearMax,
    endYearMin,
    endYearMax,
    requireEndGreaterThanStart = true,
    allowedDurations,
    requiredIncludedYear,
  } = config;

  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const FORMAT_PATTERN = new RegExp(`^\\d{4}${escapedSeparator}\\d{4}$`);

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;

    const str = String(value);
    if (!FORMAT_PATTERN.test(str)) return yearRangeError('invalidFormat');

    const parts = str.split(separator);
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);

    if (startYearMin !== undefined && start < startYearMin) return yearRangeError('startOutOfRange');
    if (startYearMax !== undefined && start > startYearMax) return yearRangeError('startOutOfRange');
    if (endYearMin !== undefined && end < endYearMin) return yearRangeError('endOutOfRange');
    if (endYearMax !== undefined && end > endYearMax) return yearRangeError('endOutOfRange');
    if (requireEndGreaterThanStart && end <= start) return yearRangeError('endNotGreater');

    if (allowedDurations !== undefined) {
      const duration = end - start;
      if (!allowedDurations.includes(duration)) return yearRangeError('invalidDuration');
    }

    if (
      requiredIncludedYear !== undefined &&
      (requiredIncludedYear < start || requiredIncludedYear > end)
    ) {
      return yearRangeError('requiredIncludedYearMissing');
    }

    return null;
  };
}

/**
 * Parse a `YYYY<separator>YYYY` string and return `endYear - startYear`.
 *
 * Returns `null` when:
 * - value is not a string
 * - the format does not match
 * - end year is not strictly greater than start year
 *
 * @param value     Raw value to parse (typically from a form control).
 * @param separator Character(s) that separate start and end year. Defaults to `'-'`.
 */
export function getYearRangeDuration(value: unknown, separator = '-'): number | null {
  if (typeof value !== 'string') return null;

  const str = value.trim();
  const escapedSep = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const FORMAT_PATTERN = new RegExp(`^\\d{4}${escapedSep}\\d{4}$`);

  if (!FORMAT_PATTERN.test(str)) return null;

  const parts = str.split(separator);
  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);

  return end > start ? end - start : null;
}
