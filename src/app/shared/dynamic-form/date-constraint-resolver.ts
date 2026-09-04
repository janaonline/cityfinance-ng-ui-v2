import { DateRangeValue, normalizeDateValue } from '../../core/validators/date-range.validator';

/**
 * Matches relative date expressions:
 *   - TODAY, TODAY+30D, TODAY-7D, TODAY+6M, TODAY+5Y (relative to now)
 *   - FIELD:<key>, FIELD:<key>+5Y, etc. (relative to another field's current value, resolved via
 *     `fieldValueLookup`)
 */
const RELATIVE_DATE_PATTERN = /^(TODAY|FIELD:([A-Za-z0-9_]+))(?:([+-])(\d+)([DMY]))?$/;

/**
 * Resolve a date constraint value to a concrete `Date`.
 *
 * Supported relative expressions (units: D = days, M = months, Y = years):
 *   TODAY, TODAY+0D, TODAY+30D, TODAY-7D, TODAY+6M, TODAY+5Y
 *   FIELD:dateOfConstitution, FIELD:dateOfConstitution+5Y (needs `fieldValueLookup`)
 *
 * Also accepts any value supported by normalizeDateValue:
 *   Date objects, YYYY-MM-DD strings, DD-MM-YYYY strings, ISO datetime strings.
 *
 * Returns null for null, undefined, empty strings, unrecognised patterns, or a `FIELD:<key>`
 * expression when no `fieldValueLookup` is supplied or the referenced field has no resolvable
 * value.
 *
 * @param value             Raw constraint value from field config or validations array.
 * @param baseDate          Reference date for `TODAY` expressions. Defaults to today.
 * @param fieldValueLookup  Resolves a sibling field's current raw value by key, for `FIELD:<key>`
 *                          expressions (e.g. `(key) => form.get(key)?.value`).
 */
export function resolveDateConstraint(
  value: unknown,
  baseDate?: Date,
  fieldValueLookup?: (key: string) => unknown,
): Date | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = RELATIVE_DATE_PATTERN.exec(trimmed);

    if (match) {
      const fieldKey = match[2];
      let base: Date;

      if (fieldKey) {
        const siblingValue = fieldValueLookup?.(fieldKey);
        const siblingDate = siblingValue != null ? resolveDateConstraint(siblingValue) : null;
        if (!siblingDate) return null;
        base = siblingDate;
      } else {
        base = baseDate ?? new Date();
      }

      const result = new Date(base.getFullYear(), base.getMonth(), base.getDate());

      if (!match[3]) {
        return result;
      }

      const sign = match[3] === '+' ? 1 : -1;
      const amount = Number(match[4]) * sign;
      const unit = match[5] as 'D' | 'M' | 'Y';

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
