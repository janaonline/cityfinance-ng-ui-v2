import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/** Matches ISO date-only strings such as "2024-03-25". */
const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Matches day-month-year date-only strings such as "25-03-2024". */
const DMY_DATE_ONLY_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;

/**
 * Matches ISO 8601 date-time strings such as:
 * - "2024-03-25T14:30:00Z"
 * - "2024-03-25T14:30:00.000Z"
 * - "2024-03-25T14:30:00+05:30"
 */
const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:[+-]\d{2}:\d{2}))$/;

/** Short month labels used for the custom date input display format. */
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Internal format token used by the adapter for date input display and parsing. */
export const DATE_INPUT_DISPLAY_FORMAT = 'utc-iso-date-input';

/**
 * Angular Material date formats configuration for the custom UTC-safe
 * ISO/date-only adapter used by the input field.
 */
export const UTC_ISO_DATE_FORMATS = {
  parse: {
    dateInput: DATE_INPUT_DISPLAY_FORMAT,
  },
  display: {
    dateInput: DATE_INPUT_DISPLAY_FORMAT,
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { day: '2-digit', month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};

/**
 * Custom Material date adapter that normalizes ISO-like values into local
 * date-only `Date` objects and formats the input as `DD Mon YYYY`.
 *
 * This avoids common timezone drift issues when the source value is an
 * ISO string such as `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`.
 */
@Injectable()
export class UtcIsoDateAdapter extends NativeDateAdapter {
  /**
   * Normalizes supported manual input values before delegating to the native
   * parser so ISO/date-like strings keep their intended calendar day.
   */
  override parse(value: unknown, parseFormat: unknown): Date | null {
    const normalizedValue = coerceDateLikeValue(value);

    if (normalizedValue !== undefined) {
      return normalizedValue;
    }

    return super.parse(value, parseFormat);
  }

  /**
   * Normalizes supported date-like values before falling back to the default
   * Material deserialization behavior.
   *
   * Returns:
   * - `Date` for supported valid values
   * - `null` for empty-like values
   * - `undefined` to delegate unsupported strings/types to the base adapter
   */
  override deserialize(value: unknown): Date | null {
    const normalizedValue = coerceDateLikeValue(value);

    if (normalizedValue !== undefined) {
      return normalizedValue;
    }

    return super.deserialize(value);
  }

  /**
   * Formats the date input using the custom `DD Mon YYYY` format for the input
   * field, while leaving all other Material display formats to the base adapter.
   */
  override format(date: Date, displayFormat: unknown): string {
    if (displayFormat === DATE_INPUT_DISPLAY_FORMAT) {
      return formatDateForInput(date);
    }

    return super.format(date, displayFormat as object);
  }
}

/**
 * Converts supported raw values into a local date-only `Date`.
 *
 * Supported inputs:
 * - `Date`
 * - day-month-year strings: `DD-MM-YYYY`
 * - ISO date-only strings: `YYYY-MM-DD`
 * - ISO date-time strings: `YYYY-MM-DDTHH:mm:ssZ` / with offset
 * - other natively parseable date strings as fallback
 *
 * Returns:
 * - `Date` for supported valid values
 * - `null` for empty-like values
 * - `undefined` for unsupported or invalid non-empty values so callers can
 *   decide whether to fall back to another parser
 */
export function coerceDateLikeValue(value: unknown): Date | null | undefined {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return isValidDate(value)
      ? createLocalDate(value.getFullYear(), value.getMonth(), value.getDate())
      : null;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const dmyMatch = DMY_DATE_ONLY_PATTERN.exec(trimmedValue);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return createLocalDate(Number(year), Number(month) - 1, Number(day));
  }

  // Parse explicit ISO date-only strings without relying on browser parsing.
  if (ISO_DATE_ONLY_PATTERN.test(trimmedValue)) {
    const [year, month, day] = trimmedValue.split('-').map(Number);
    return createLocalDate(year, month - 1, day);
  }

  const parsedDate = new Date(trimmedValue);
  if (!isValidDate(parsedDate)) {
    return undefined;
  }

  // For ISO date-time inputs, use UTC date parts to avoid timezone shifts.
  if (ISO_DATE_TIME_PATTERN.test(trimmedValue)) {
    return createLocalDate(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate(),
    );
  }

  // For other parseable values, use local date parts.
  return createLocalDate(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}

/**
 * Converts a supported date-like value into a canonical UTC ISO string.
 *
 * Behavior:
 * - returns `undefined` when the value is non-empty but unsupported or cannot be parsed
 * - returns `null` for empty-like values (`null`, `undefined`, `''`)
 * - returns an ISO string at UTC midnight for valid date-like inputs
 *
 * This is useful when the UI works with local date-only `Date` objects
 * but the backend expects a stable UTC ISO representation.
 *
 * Example:
 * - input: `2024-03-25`
 * - output: `2024-03-25T00:00:00.000Z`
 *
 * @param value - Raw date-like value from form state, API data, or component input.
 * @returns UTC ISO string, `null`, or `undefined` based on normalization outcome.
 */
export function toUtcIsoDateString(value: unknown): string | null | undefined {
  const normalizedDate = coerceDateLikeValue(value);

  if (normalizedDate === undefined) {
    return undefined;
  }

  if (normalizedDate === null) {
    return null;
  }

  return new Date(
    Date.UTC(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate()),
  ).toISOString();
}

/**
 * Formats a valid `Date` into the input display format: `DD Mon YYYY` eg: `25 Mar 2024`
 */
function formatDateForInput(date: Date): string {
  if (!isValidDate(date)) {
    throw new Error('UtcIsoDateAdapter: Cannot format invalid date.');
  }

  return `${padTwoDigits(date.getDate())} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Creates a validated local date-only `Date` at midnight for the provided calendar parts. */
function createLocalDate(year: number, month: number, day: number): Date | null {
  const localDate = new Date(year, month, day);
  localDate.setHours(0, 0, 0, 0);

  return localDate.getFullYear() === year &&
    localDate.getMonth() === month &&
    localDate.getDate() === day
    ? localDate
    : null;
}

/** Returns `true` when the given `Date` instance is valid. */
function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

/** Pads a number to two digits for day formatting. */
function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}
