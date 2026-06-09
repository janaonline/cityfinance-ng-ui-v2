import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface YearRangeValidatorConfig {
  separator?: string;
  startYearMin?: number;
  startYearMax?: number;
  endYearMin?: number;
  endYearMax?: number;
  requireEndGreaterThanStart?: boolean;
}

/**
 * Validates that a text value represents a valid year range in the form `YYYY<separator>YYYY`.
 *
 * All constraints are optional. `requireEndGreaterThanStart` defaults to `true`.
 * Returns `{ yearRange: true }` on any constraint violation, `null` on success.
 * Returns `null` for empty values so the field stays optional-compatible.
 *
 * @example
 * // SFC award period: 2020–2029 start, any 20xx end, end > start
 * yearRangeValidator({ startYearMin: 2020, startYearMax: 2029, endYearMin: 2000, endYearMax: 2099 })
 *
 * @example
 * // Grant period with custom separator
 * yearRangeValidator({ separator: '/', startYearMin: 2026, endYearMax: 2035 })
 */
export function yearRangeValidator(config: YearRangeValidatorConfig = {}): ValidatorFn {
  const {
    separator = '-',
    startYearMin,
    startYearMax,
    endYearMin,
    endYearMax,
    requireEndGreaterThanStart = true,
  } = config;

  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const FORMAT_PATTERN = new RegExp(`^\\d{4}${escapedSeparator}\\d{4}$`);

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;

    const str = String(value);
    if (!FORMAT_PATTERN.test(str)) return { yearRange: true };

    const parts = str.split(separator);
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);

    if (startYearMin !== undefined && start < startYearMin) return { yearRange: true };
    if (startYearMax !== undefined && start > startYearMax) return { yearRange: true };
    if (endYearMin !== undefined && end < endYearMin) return { yearRange: true };
    if (endYearMax !== undefined && end > endYearMax) return { yearRange: true };
    if (requireEndGreaterThanStart && end <= start) return { yearRange: true };

    return null;
  };
}
