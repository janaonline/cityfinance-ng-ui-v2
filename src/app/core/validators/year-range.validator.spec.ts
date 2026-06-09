import { FormControl } from '@angular/forms';
import { yearRangeValidator, YearRangeValidatorConfig } from './year-range.validator';

function control(value: unknown): FormControl {
  return new FormControl(value);
}

const SFC_CONFIG: YearRangeValidatorConfig = {
  startYearMin: 2020,
  startYearMax: 2029,
  endYearMin: 2000,
  endYearMax: 2099,
  requireEndGreaterThanStart: true,
};

describe('yearRangeValidator', () => {
  describe('empty values', () => {
    const validate = yearRangeValidator(SFC_CONFIG);

    it('returns null for null', () => expect(validate(control(null))).toBeNull());
    it('returns null for empty string', () => expect(validate(control(''))).toBeNull());
    it('returns null for undefined', () => expect(validate(control(undefined))).toBeNull());
  });

  describe('format validation', () => {
    const validate = yearRangeValidator();

    it('accepts a valid YYYY-YYYY value', () => {
      expect(validate(control('2026-2031'))).toBeNull();
    });

    it('rejects when end year is only two digits', () => {
      expect(validate(control('2026-31'))).toEqual({ yearRange: true });
    });

    it('rejects non-hyphen separator', () => {
      expect(validate(control('2026/2031'))).toEqual({ yearRange: true });
    });

    it('rejects letters', () => {
      expect(validate(control('abcd-efgh'))).toEqual({ yearRange: true });
    });

    it('rejects extra digits in end year', () => {
      expect(validate(control('2026-20310'))).toEqual({ yearRange: true });
    });
  });

  describe('startYearMin constraint', () => {
    const validate = yearRangeValidator({ startYearMin: 2020, requireEndGreaterThanStart: false });

    it('passes when start year equals min', () => {
      expect(validate(control('2020-2025'))).toBeNull();
    });

    it('passes when start year is above min', () => {
      expect(validate(control('2025-2030'))).toBeNull();
    });

    it('fails when start year is below min', () => {
      expect(validate(control('2019-2024'))).toEqual({ yearRange: true });
    });
  });

  describe('startYearMax constraint', () => {
    const validate = yearRangeValidator({ startYearMax: 2029, requireEndGreaterThanStart: false });

    it('passes when start year equals max', () => {
      expect(validate(control('2029-2034'))).toBeNull();
    });

    it('fails when start year exceeds max', () => {
      expect(validate(control('2030-2035'))).toEqual({ yearRange: true });
    });
  });

  describe('endYearMin constraint', () => {
    const validate = yearRangeValidator({ endYearMin: 2000, requireEndGreaterThanStart: false });

    it('passes when end year equals min', () => {
      expect(validate(control('2026-2000'))).toBeNull();
    });

    it('fails when end year is below min', () => {
      expect(validate(control('2026-1999'))).toEqual({ yearRange: true });
    });
  });

  describe('endYearMax constraint', () => {
    const validate = yearRangeValidator({ endYearMax: 2099, requireEndGreaterThanStart: false });

    it('passes when end year equals max', () => {
      expect(validate(control('2026-2099'))).toBeNull();
    });

    it('fails when end year exceeds max', () => {
      expect(validate(control('2026-2100'))).toEqual({ yearRange: true });
    });
  });

  describe('requireEndGreaterThanStart', () => {
    const validate = yearRangeValidator({ requireEndGreaterThanStart: true });

    it('passes when end year is greater than start year', () => {
      expect(validate(control('2026-2031'))).toBeNull();
    });

    it('fails when end year equals start year', () => {
      expect(validate(control('2026-2026'))).toEqual({ yearRange: true });
    });

    it('fails when end year is less than start year', () => {
      expect(validate(control('2026-2025'))).toEqual({ yearRange: true });
    });

    it('passes equal years when requireEndGreaterThanStart is false', () => {
      const v = yearRangeValidator({ requireEndGreaterThanStart: false });
      expect(v(control('2026-2026'))).toBeNull();
    });
  });

  describe('full SFC config — passes', () => {
    const validate = yearRangeValidator(SFC_CONFIG);

    it('accepts 2026-2031', () => expect(validate(control('2026-2031'))).toBeNull());
    it('accepts 2020-2021 (boundary start year)', () => expect(validate(control('2020-2021'))).toBeNull());
    it('accepts 2029-2099 (boundary end year)', () => expect(validate(control('2029-2099'))).toBeNull());
  });

  describe('full SFC config — fails', () => {
    const validate = yearRangeValidator(SFC_CONFIG);

    it('rejects bad format', () => expect(validate(control('26-31'))).toEqual({ yearRange: true }));
    it('rejects start year before 2020', () => expect(validate(control('2019-2024'))).toEqual({ yearRange: true }));
    it('rejects start year after 2029', () => expect(validate(control('2030-2035'))).toEqual({ yearRange: true }));
    it('rejects end year below 2000', () => expect(validate(control('2026-1999'))).toEqual({ yearRange: true }));
    it('rejects end year above 2099', () => expect(validate(control('2026-2100'))).toEqual({ yearRange: true }));
    it('rejects equal years', () => expect(validate(control('2026-2026'))).toEqual({ yearRange: true }));
    it('rejects end year less than start year', () => expect(validate(control('2026-2025'))).toEqual({ yearRange: true }));
  });

  describe('reusability — different config', () => {
    it('works for a grant period with different year constraints', () => {
      const validate = yearRangeValidator({
        startYearMin: 2026,
        startYearMax: 2030,
        endYearMin: 2027,
        endYearMax: 2035,
      });

      expect(validate(control('2027-2032'))).toBeNull();
      expect(validate(control('2025-2032'))).toEqual({ yearRange: true }); // start < min
      expect(validate(control('2027-2036'))).toEqual({ yearRange: true }); // end > max
    });

    it('works with a custom separator', () => {
      const validate = yearRangeValidator({ separator: '/' });
      expect(validate(control('2026/2031'))).toBeNull();
      expect(validate(control('2026-2031'))).toEqual({ yearRange: true });
    });
  });
});
