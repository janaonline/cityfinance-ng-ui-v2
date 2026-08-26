import { DateRangeValue, normalizeDateValue } from '../../core/validators/date-range.validator';

/** Matches relative date expressions: TODAY, TODAY+30D, TODAY-7D, TODAY+6M, TODAY+5Y */
const RELATIVE_DATE_PATTERN = /^TODAY(?:([+-])(\d+)([DMY]))?$/;

/**
 * Resolve a date constraint value to a concrete `Date`.
 *
 * Supported relative expressions (units: D = days, M = months, Y = years):
 *   TODAY, TODAY+0D, TODAY+30D, TODAY-7D, TODAY+6M, TODAY+5Y
 *
 * Also accepts any value supported by normalizeDateValue:
 *   Date objects, YYYY-MM-DD strings, DD-MM-YYYY strings, ISO datetime strings.
 *
 * Returns null for null, undefined, empty strings, or unrecognised patterns.
 *
 * @param value     Raw constraint value from field config or validations array.
 * @param baseDate  Reference date for relative expressions. Defaults to today.
 */
export function resolveDateConstraint(value: unknown, baseDate?: Date): Date | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = RELATIVE_DATE_PATTERN.exec(trimmed);

    if (match) {
      const base = baseDate ?? new Date();
      const result = new Date(base.getFullYear(), base.getMonth(), base.getDate());

      if (!match[1]) {
        return result;
      }

      const sign = match[1] === '+' ? 1 : -1;
      const amount = Number(match[2]) * sign;
      const unit = match[3] as 'D' | 'M' | 'Y';

      switch (unit) {
        case 'D':
          result.setDate(result.getDate() + amount);
          break;
        case 'M':
          result.setMonth(result.getMonth() + amount);
          break;
        case 'Y':
          result.setFullYear(result.getFullYear() + amount);
          break;
      }

      return result;
    }

    return normalizeDateValue(trimmed);
  }

  return normalizeDateValue(value as DateRangeValue);
}
