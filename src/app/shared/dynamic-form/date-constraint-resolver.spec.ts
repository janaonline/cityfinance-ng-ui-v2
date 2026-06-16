import { FormControl } from '@angular/forms';
import { maxDateValidator, minDateValidator } from '../../core/validators/date-range.validator';
import { resolveDateConstraint } from './date-constraint-resolver';

/** January 15, 2025 at local midnight — fixed reference date for deterministic tests. */
const BASE = new Date(2025, 0, 15);

function dateOnly(year: number, month: number, day: number): Date {
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

describe('resolveDateConstraint', () => {
  describe('relative expressions', () => {
    it('resolves TODAY to the base date', () => {
      expect(resolveDateConstraint('TODAY', BASE)?.getTime()).toBe(BASE.getTime());
    });

    it('resolves TODAY+0D to the base date', () => {
      expect(resolveDateConstraint('TODAY+0D', BASE)?.getTime()).toBe(BASE.getTime());
    });

    it('resolves TODAY+5Y to five years ahead', () => {
      expect(resolveDateConstraint('TODAY+5Y', BASE)?.getTime()).toBe(dateOnly(2030, 1, 15).getTime());
    });

    it('resolves TODAY+6M to six months ahead', () => {
      expect(resolveDateConstraint('TODAY+6M', BASE)?.getTime()).toBe(dateOnly(2025, 7, 15).getTime());
    });

    it('resolves TODAY-7D to seven days earlier', () => {
      expect(resolveDateConstraint('TODAY-7D', BASE)?.getTime()).toBe(dateOnly(2025, 1, 8).getTime());
    });

    it('resolves TODAY+30D to thirty days ahead', () => {
      expect(resolveDateConstraint('TODAY+30D', BASE)?.getTime()).toBe(dateOnly(2025, 2, 14).getTime());
    });
  });

  describe('fixed date strings', () => {
    it('resolves an ISO YYYY-MM-DD string', () => {
      expect(resolveDateConstraint('2027-04-01')?.getTime()).toBe(dateOnly(2027, 4, 1).getTime());
    });

    it('resolves a DD-MM-YYYY string', () => {
      expect(resolveDateConstraint('01-04-2027')?.getTime()).toBe(dateOnly(2027, 4, 1).getTime());
    });
  });

  describe('Date object input', () => {
    it('resolves a Date object to date-only midnight', () => {
      const input = new Date(2026, 5, 20, 14, 30);
      expect(resolveDateConstraint(input)?.getTime()).toBe(dateOnly(2026, 6, 20).getTime());
    });
  });

  describe('invalid and empty inputs', () => {
    it('returns null for null', () => {
      expect(resolveDateConstraint(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(resolveDateConstraint(undefined)).toBeNull();
    });

    it('returns null for an empty string', () => {
      expect(resolveDateConstraint('')).toBeNull();
    });

    it('returns null for an unrecognised relative expression', () => {
      expect(resolveDateConstraint('TOMORROW')).toBeNull();
    });

    it('returns null for TODAY with an unsupported unit', () => {
      expect(resolveDateConstraint('TODAY+5X')).toBeNull();
    });

    it('returns null for a partial TODAY expression without a full offset', () => {
      expect(resolveDateConstraint('TODAY+')).toBeNull();
    });
  });

  describe('minDateValidator integration', () => {
    it('rejects a date before the resolved relative constraint', () => {
      const min = resolveDateConstraint('TODAY+0D', BASE);
      const validator = minDateValidator(min);

      const before = new FormControl(dateOnly(2025, 1, 14));
      expect(validator(before)?.['minDate']).toBeTruthy();
    });

    it('accepts a date equal to the resolved relative constraint', () => {
      const min = resolveDateConstraint('TODAY+0D', BASE);
      const validator = minDateValidator(min);

      const equal = new FormControl(dateOnly(2025, 1, 15));
      expect(validator(equal)).toBeNull();
    });

    it('accepts a date after the resolved relative constraint', () => {
      const min = resolveDateConstraint('TODAY+0D', BASE);
      const validator = minDateValidator(min);

      const after = new FormControl(dateOnly(2025, 1, 16));
      expect(validator(after)).toBeNull();
    });
  });

  describe('maxDateValidator integration', () => {
    it('rejects a date after the resolved relative constraint', () => {
      const max = resolveDateConstraint('TODAY+5Y', BASE);
      const validator = maxDateValidator(max);

      const after = new FormControl(dateOnly(2030, 1, 16));
      expect(validator(after)?.['maxDate']).toBeTruthy();
    });

    it('accepts a date equal to the resolved relative constraint', () => {
      const max = resolveDateConstraint('TODAY+5Y', BASE);
      const validator = maxDateValidator(max);

      const equal = new FormControl(dateOnly(2030, 1, 15));
      expect(validator(equal)).toBeNull();
    });

    it('accepts a date before the resolved relative constraint', () => {
      const max = resolveDateConstraint('TODAY+5Y', BASE);
      const validator = maxDateValidator(max);

      const before = new FormControl(dateOnly(2025, 6, 1));
      expect(validator(before)).toBeNull();
    });
  });

  describe('static date validation still works', () => {
    it('minDateValidator rejects a date before a fixed ISO constraint', () => {
      const min = resolveDateConstraint('2025-06-01');
      const validator = minDateValidator(min);

      const before = new FormControl(dateOnly(2025, 5, 31));
      expect(validator(before)?.['minDate']).toBeTruthy();
    });

    it('maxDateValidator accepts a date equal to a fixed ISO constraint', () => {
      const max = resolveDateConstraint('2025-12-31');
      const validator = maxDateValidator(max);

      const equal = new FormControl(dateOnly(2025, 12, 31));
      expect(validator(equal)).toBeNull();
    });
  });
});
