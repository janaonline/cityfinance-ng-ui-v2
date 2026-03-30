import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export type DateRangeValue = Date | string | null | undefined;

/** Matches ISO date-only strings eg: "2024-03-25" */
const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Matches day-month-year date strings eg: "25-03-2024" */
const DMY_DATE_ONLY_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;

/**
 * Matches ISO 8601 date-time strings such as:
 * - "2024-03-25T14:30:00Z"
 * - "2024-03-25T14:30:00.000Z"
 * - "2024-03-25T14:30:00+05:30"
 */
const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:[+-]\d{2}:\d{2}))$/;

/**
 * Shared formatter used in validation messages so date labels are consistent across the UI.
 * Example output: 25 Mar 2024
 */
const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/**
 * Create validator that fails when the control value is < provided minimum date.
 *
 * Validation behavior:
 * - returns `null` when no min date is configured
 * - returns `null` for empty control values
 * - returns `null` when the control value cannot be normalized into a valid date
 * - returns a `minDate` error when the date is before the allowed minimum
 *
 * The comparison is date-only. Time values are stripped so that:
 * - `2024-03-25T00:00:00`
 * - `2024-03-25T18:30:00`
 * are treated as the same calendar day.
 *
 * @param minDate - Lowest allowed date for the control.
 * Can be a `Date`, supported date string, or empty-like value.
 *
 * @returns Angular `ValidatorFn` that adds:
 * ```ts
 * {
 *   minDate: {
 *     min: Date,
 *     actual: Date
 *   }
 * }
 * ```
 * when validation fails.
 */
export function minDateValidator(minDate: DateRangeValue): ValidatorFn {
  const resolvedMinDate = normalizeDateValue(minDate);

  return (control: AbstractControl): ValidationErrors | null => {
    if (!resolvedMinDate || isEmptyDateValue(control.value)) {
      return null;
    }

    const controlDate = normalizeDateValue(control.value);
    if (!controlDate) {
      return null;
    }

    return compareDateOnly(controlDate, resolvedMinDate) < 0
      ? {
          minDate: {
            min: resolvedMinDate,
            actual: controlDate,
          },
        }
      : null;
  };
}

/**
 * Create validator that fails when the control value > than provided maximum date.
 *
 * Validation behavior:
 * - returns `null` when no max date is configured
 * - returns `null` for empty control values
 * - returns `null` when the control value cannot be normalized into a valid date
 * - returns a `maxDate` error when the date is after the allowed maximum
 *
 * The comparison is date-only. Time values are stripped before comparison.
 *
 * @param maxDate - Highest allowed date for the control.
 * Can be a `Date`, supported date string, or empty-like value.
 *
 * @returns Angular `ValidatorFn` that adds:
 * ```ts
 * {
 *   maxDate: {
 *     max: Date,
 *     actual: Date
 *   }
 * }
 * ```
 * when validation fails.
 */
export function maxDateValidator(maxDate: DateRangeValue): ValidatorFn {
  const resolvedMaxDate = normalizeDateValue(maxDate);

  return (control: AbstractControl): ValidationErrors | null => {
    if (!resolvedMaxDate || isEmptyDateValue(control.value)) {
      return null;
    }

    const controlDate = normalizeDateValue(control.value);
    if (!controlDate) {
      return null;
    }

    return compareDateOnly(controlDate, resolvedMaxDate) > 0
      ? {
          maxDate: {
            max: resolvedMaxDate,
            actual: controlDate,
          },
        }
      : null;
  };
}

/**
 * Normalize supported date input values into a validated, local, date-only `Date`.
 *
 * Why this helper exists:
 * - form controls may contain `Date` objects or strings
 * - string parsing with `new Date(string)` is inconsistent across formats
 * - date validation should compare calendar dates, not time-of-day
 * - invalid dates like `31-02-2024` must be rejected safely
 *
 * Supported inputs:
 * - native `Date`
 * - `DD-MM-YYYY` string, e.g. `"25-03-2024"`
 * - `YYYY-MM-DD` string, e.g. `"2024-03-25"`
 * - ISO date-time string, e.g. `"2024-03-25T14:30:00Z"`
 * - empty-like values (`null`, `undefined`, `''`) => `null`
 *
 * Parsing rules:
 * - `Date` objects are converted into a local midnight date-only value
 * - `DD-MM-YYYY` and `YYYY-MM-DD` are parsed explicitly
 * - ISO date-time strings use UTC date parts to avoid timezone drift
 * - generic date strings fall back to native parsing only as a last resort
 *
 * @param value - Raw date-like input value from config, form state, or API.
 *
 * @returns A validated `Date` set to local midnight, or `null` when:
 * - the value is empty
 * - the type is unsupported
 * - the string is invalid
 * - the date parts do not form a real calendar date
 *
 * @example
 * ```ts
 * normalizeDateValue('25-03-2024');
 * // Date(2024-03-25 00:00:00 local time)
 *
 * normalizeDateValue('2024-03-25');
 * // Date(2024-03-25 00:00:00 local time)
 *
 * normalizeDateValue('2024-03-25T23:30:00Z');
 * // Date using the UTC calendar day component only
 *
 * normalizeDateValue('31-02-2024');
 * // null
 *
 * normalizeDateValue('');
 * // null
 * ```
 */
export function normalizeDateValue(value: DateRangeValue): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : createValidatedDate(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const dmyMatch = DMY_DATE_ONLY_PATTERN.exec(trimmedValue);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return createValidatedDate(Number(year), Number(month) - 1, Number(day));
  }

  if (ISO_DATE_ONLY_PATTERN.test(trimmedValue)) {
    const [year, month, day] = trimmedValue.split('-').map(Number);
    return createValidatedDate(year, month - 1, day);
  }

  const parsedDate = new Date(trimmedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return ISO_DATE_TIME_PATTERN.test(trimmedValue)
    ? createValidatedDate(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
      )
    : createValidatedDate(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}

/**
 * Format a raw date-like value into a user-friendly label for validation messages.
 *
 * This helper is typically used when rendering error text such as:
 * - "Date must be on or after 25 Mar 2024"
 * - "Date must be on or before 31 Mar 2024"
 *
 * @param value - Raw date-like value to format.
 *
 * @returns Formatted date string in `en-GB`, or `null` if value cannot be normalized into valid date.
 */
export function formatDateForValidationMessage(value: DateRangeValue): string | null {
  const normalizedDate = normalizeDateValue(value);
  return normalizedDate ? DATE_LABEL_FORMATTER.format(normalizedDate) : null;
}

/**
 * Compare two normalized date-only values.
 *
 * This function assumes both inputs are already valid `Date` objects that
 * represent calendar dates at midnight. The return value follows the same
 * contract as standard comparator functions:
 *
 * - negative => left is earlier than right
 * - zero => same date
 * - positive => left is later than right
 *
 * @param left - First date to compare.
 * @param right - Second date to compare.
 *
 * @returns Millisecond difference between the two date-only values.
 *
 * @example
 * ```ts
 * compareDateOnly(new Date(2024, 2, 10), new Date(2024, 2, 15)); // < 0
 * compareDateOnly(new Date(2024, 2, 15), new Date(2024, 2, 15)); // 0
 * compareDateOnly(new Date(2024, 2, 20), new Date(2024, 2, 15)); // > 0
 * ```
 */
function compareDateOnly(left: Date, right: Date): number {
  return left.getTime() - right.getTime();
}

/**
 * Safely construct a local date-only `Date` object and verify that the
 * provided year/month/day form a real calendar date.
 *
 * This validation step prevents JavaScript's native date rollover from
 * silently converting invalid dates into different valid ones.
 *
 * Example:
 * - `new Date(2024, 1, 31)` becomes `02 Mar 2024` internally
 * - this helper detects that rollover and returns `null` instead
 *
 * The returned date is always normalized to local midnight.
 *
 * @param year - Full year, e.g. `2024`
 * @param month - Zero-based month index, e.g. `0 = Jan`, `2 = Mar`
 * @param day - Day of month, e.g. `25`
 *
 * @returns A valid local date at midnight, or `null` if the parts do not
 * represent a real calendar date.
 *
 * @example
 * ```ts
 * createValidatedDate(2024, 2, 25);
 * // Date(25 Mar 2024 00:00:00 local time)
 *
 * createValidatedDate(2024, 1, 31);
 * // null because 31 Feb 2024 is invalid
 * ```
 */
function createValidatedDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);

  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? date
    : null;
}

/**
 * Check whether a raw form value should be treated as "empty" for date validation.
 * @param value - Raw control value.
 * @returns `true` when the value is considered empty and range validation
 * should be skipped.
 */
function isEmptyDateValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}
