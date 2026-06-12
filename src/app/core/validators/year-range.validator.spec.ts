import { FormControl } from '@angular/forms';
import { YearRangeValidatorConfig, getYearRangeDuration, yearRangeValidator } from './year-range.validator';

function control(value: unknown): FormControl {
  return new FormControl(value);
}

/** Shorthand: assert a reason string inside { yearRange: { reason } }. */
function expectReason(result: unknown, reason: string): void {
  expect(result).toEqual({ yearRange: { reason } });
}

const BASE_SFC_CONFIG: YearRangeValidatorConfig = {
  startYearMin: 2015,
  startYearMax: 2027,
  endYearMin: 2020,
  endYearMax: 2029,
  requireEndGreaterThanStart: true,
  allowedDurations: [1, 5, 6],
  requiredIncludedYear: 2026,
};

// ─── empty values ─────────────────────────────────────────────────────────────

describe('yearRangeValidator — empty values', () => {
  const validate = yearRangeValidator(BASE_SFC_CONFIG);

  it('returns null for null', () => expect(validate(control(null))).toBeNull());
  it('returns null for empty string', () => expect(validate(control(''))).toBeNull());
  it('returns null for undefined', () => expect(validate(control(undefined))).toBeNull());
});

// ─── format validation ────────────────────────────────────────────────────────

describe('yearRangeValidator — format validation', () => {
  const validate = yearRangeValidator();

  it('accepts a valid YYYY-YYYY value', () => {
    expect(validate(control('2026-2031'))).toBeNull();
  });

  it('rejects when end year is only two digits', () => {
    expectReason(validate(control('2026-31')), 'invalidFormat');
  });

  it('rejects non-hyphen separator', () => {
    expectReason(validate(control('2026/2031')), 'invalidFormat');
  });

  it('rejects letters', () => {
    expectReason(validate(control('abcd-efgh')), 'invalidFormat');
  });

  it('rejects extra digits in end year', () => {
    expectReason(validate(control('2026-20310')), 'invalidFormat');
  });
});

// ─── startYearMin / startYearMax ──────────────────────────────────────────────

describe('yearRangeValidator — startYearMin constraint', () => {
  const validate = yearRangeValidator({ startYearMin: 2020, requireEndGreaterThanStart: false });

  it('passes when start year equals min', () => expect(validate(control('2020-2025'))).toBeNull());
  it('passes when start year is above min', () => expect(validate(control('2025-2030'))).toBeNull());
  it('fails when start year is below min', () => expectReason(validate(control('2019-2024')), 'startOutOfRange'));
});

describe('yearRangeValidator — startYearMax constraint', () => {
  const validate = yearRangeValidator({ startYearMax: 2029, requireEndGreaterThanStart: false });

  it('passes when start year equals max', () => expect(validate(control('2029-2034'))).toBeNull());
  it('fails when start year exceeds max', () => expectReason(validate(control('2030-2035')), 'startOutOfRange'));
});

// ─── endYearMin / endYearMax ──────────────────────────────────────────────────

describe('yearRangeValidator — endYearMin constraint', () => {
  const validate = yearRangeValidator({ endYearMin: 2000, requireEndGreaterThanStart: false });

  it('passes when end year equals min', () => expect(validate(control('2026-2000'))).toBeNull());
  it('fails when end year is below min', () => expectReason(validate(control('2026-1999')), 'endOutOfRange'));
});

describe('yearRangeValidator — endYearMax constraint', () => {
  const validate = yearRangeValidator({ endYearMax: 2099, requireEndGreaterThanStart: false });

  it('passes when end year equals max', () => expect(validate(control('2026-2099'))).toBeNull());
  it('fails when end year exceeds max', () => expectReason(validate(control('2026-2100')), 'endOutOfRange'));
});

// ─── requireEndGreaterThanStart ───────────────────────────────────────────────

describe('yearRangeValidator — requireEndGreaterThanStart', () => {
  const validate = yearRangeValidator({ requireEndGreaterThanStart: true });

  it('passes when end year is greater than start year', () => expect(validate(control('2026-2031'))).toBeNull());
  it('fails when end year equals start year', () => expectReason(validate(control('2026-2026')), 'endNotGreater'));
  it('fails when end year is less than start year', () =>
    expectReason(validate(control('2026-2025')), 'endNotGreater'));

  it('passes equal years when requireEndGreaterThanStart is false', () => {
    const v = yearRangeValidator({ requireEndGreaterThanStart: false });
    expect(v(control('2026-2026'))).toBeNull();
  });
});

// ─── allowedDurations ─────────────────────────────────────────────────────────

describe('yearRangeValidator — allowedDurations', () => {
  const validate = yearRangeValidator({ allowedDurations: [1, 5, 6] });

  it('accepts duration 1 (2025-2026)', () => expect(validate(control('2025-2026'))).toBeNull());
  it('accepts duration 5 (2021-2026)', () => expect(validate(control('2021-2026'))).toBeNull());
  it('accepts duration 6 (2020-2026)', () => expect(validate(control('2020-2026'))).toBeNull());
  it('rejects duration 4 with invalidDuration reason', () =>
    expectReason(validate(control('2022-2026')), 'invalidDuration'));
  it('rejects duration 2 with invalidDuration reason', () =>
    expectReason(validate(control('2024-2026')), 'invalidDuration'));
});

// ─── requiredIncludedYear ─────────────────────────────────────────────────────

describe('yearRangeValidator — requiredIncludedYear', () => {
  const validate = yearRangeValidator({ requiredIncludedYear: 2026 });

  it('passes when the included year is inside the range (2022-2030)', () => {
    expect(validate(control('2022-2030'))).toBeNull();
  });
  it('passes when the included year equals start (2026-2031)', () => {
    expect(validate(control('2026-2031'))).toBeNull();
  });
  it('passes when the included year equals end (2021-2026)', () => {
    expect(validate(control('2021-2026'))).toBeNull();
  });
  it('passes for 2025-2026 (year at end)', () => {
    expect(validate(control('2025-2026'))).toBeNull();
  });
  it('passes for 2026-2027 (year at start)', () => {
    expect(validate(control('2026-2027'))).toBeNull();
  });
  it('passes for 2022-2027 (year falls within the range)', () => {
    expect(validate(control('2022-2027'))).toBeNull();
  });
  it('fails when the range ends before the included year (2021-2025)', () => {
    expectReason(validate(control('2021-2025')), 'requiredIncludedYearMissing');
  });
  it('fails when the range starts after the included year (2027-2032)', () => {
    expectReason(validate(control('2027-2032')), 'requiredIncludedYearMissing');
  });
  it('fails for 2017-2022 (year is outside the range)', () => {
    expectReason(validate(control('2017-2022')), 'requiredIncludedYearMissing');
  });
});

// ─── full SFC config — passes ─────────────────────────────────────────────────

describe('yearRangeValidator — full SFC config passes', () => {
  const validate = yearRangeValidator(BASE_SFC_CONFIG);

  it('accepts 2025-2026 (duration 1, includes 2026 at end)', () => expect(validate(control('2025-2026'))).toBeNull());
  it('accepts 2021-2026 (duration 5, includes 2026 at end)', () => expect(validate(control('2021-2026'))).toBeNull());
  it('accepts 2020-2026 (duration 6, includes 2026 at end)', () => expect(validate(control('2020-2026'))).toBeNull());
  it('accepts 2026-2027 (duration 1, includes 2026 at start)', () => expect(validate(control('2026-2027'))).toBeNull());
  it('accepts 2022-2027 (duration 5, 2026 falls within the range)', () => expect(validate(control('2022-2027'))).toBeNull());
});

// ─── full SFC config — fails ──────────────────────────────────────────────────

describe('yearRangeValidator — full SFC config fails', () => {
  const validate = yearRangeValidator(BASE_SFC_CONFIG);

  it('rejects bad format', () => expectReason(validate(control('26-31')), 'invalidFormat'));
  it('rejects start year before 2015', () => expectReason(validate(control('2014-2026')), 'startOutOfRange'));
  it('rejects start year after 2027', () => expectReason(validate(control('2028-2029')), 'startOutOfRange'));
  it('rejects end year below 2020', () => expectReason(validate(control('2026-2019')), 'endOutOfRange'));
  it('rejects end year above 2029', () => expectReason(validate(control('2026-2030')), 'endOutOfRange'));
  it('rejects equal years', () => expectReason(validate(control('2026-2026')), 'endNotGreater'));
  it('rejects duration not in [1,5,6] (e.g. 2022-2026 = 4)', () =>
    expectReason(validate(control('2022-2026')), 'invalidDuration'));
  it('rejects range not including 2026 (2020-2025)', () =>
    expectReason(validate(control('2020-2025')), 'requiredIncludedYearMissing'));
});

// ─── reusability ──────────────────────────────────────────────────────────────

describe('yearRangeValidator — reusability', () => {
  it('works for a grant period with different constraints', () => {
    const validate = yearRangeValidator({ startYearMin: 2026, startYearMax: 2030, endYearMin: 2027, endYearMax: 2035 });
    expect(validate(control('2027-2032'))).toBeNull();
    expectReason(validate(control('2025-2032')), 'startOutOfRange');
    expectReason(validate(control('2027-2036')), 'endOutOfRange');
  });

  it('works with a custom separator', () => {
    const validate = yearRangeValidator({ separator: '/' });
    expect(validate(control('2026/2031'))).toBeNull();
    expectReason(validate(control('2026-2031')), 'invalidFormat');
  });
});

// ─── getYearRangeDuration ─────────────────────────────────────────────────────

describe('getYearRangeDuration', () => {
  it('returns 1 for "2025-2026"', () => expect(getYearRangeDuration('2025-2026')).toBe(1));
  it('returns 5 for "2021-2026"', () => expect(getYearRangeDuration('2021-2026')).toBe(5));
  it('returns 6 for "2020-2026"', () => expect(getYearRangeDuration('2020-2026')).toBe(6));
  it('returns null for an invalid format string', () => expect(getYearRangeDuration('bad-format')).toBeNull());
  it('returns null for equal years', () => expect(getYearRangeDuration('2026-2026')).toBeNull());
  it('returns null when end is before start', () => expect(getYearRangeDuration('2026-2020')).toBeNull());
  it('returns null for a non-string value', () => expect(getYearRangeDuration(null)).toBeNull());
  it('returns null for undefined', () => expect(getYearRangeDuration(undefined)).toBeNull());

  it('works with a custom separator', () => {
    expect(getYearRangeDuration('2020/2026', '/')).toBe(6);
    expect(getYearRangeDuration('2020-2026', '/')).toBeNull();
  });
});
