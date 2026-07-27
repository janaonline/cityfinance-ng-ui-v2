import {
  computeClaimDifferencePercentage,
  formatCrore,
  humanizeToken,
  isClaimWithinVariance,
} from './claim-letter.utils';

describe('formatCrore', () => {
  it('returns "—" for null', () => expect(formatCrore(null)).toBe('—'));
  it('returns "—" for undefined', () => expect(formatCrore(undefined)).toBe('—'));
  it('appends "Cr." without rescaling', () => expect(formatCrore(13.948)).toBe('13.95 Cr.'));
  it('formats zero', () => expect(formatCrore(0)).toBe('0 Cr.'));
});

describe('computeClaimDifferencePercentage', () => {
  it('returns 0 when allocation is 0 (avoids divide-by-zero)', () =>
    expect(computeClaimDifferencePercentage(0, 5)).toBe(0));
  it('returns a positive percentage when claimed exceeds allocation', () =>
    expect(computeClaimDifferencePercentage(10, 11)).toBeCloseTo(10, 5));
  it('returns a negative percentage when claimed is below allocation', () =>
    expect(computeClaimDifferencePercentage(10, 9)).toBeCloseTo(-10, 5));
  it('returns 0 when claimed equals allocation', () => expect(computeClaimDifferencePercentage(10, 10)).toBe(0));
});

describe('isClaimWithinVariance', () => {
  it('is true exactly at the lower 90% boundary', () => expect(isClaimWithinVariance(10, 9)).toBe(true));
  it('is true exactly at the upper 110% boundary', () => expect(isClaimWithinVariance(10, 11)).toBe(true));
  it('is false just below the lower boundary', () => expect(isClaimWithinVariance(10, 8.9)).toBe(false));
  it('is false just above the upper boundary', () => expect(isClaimWithinVariance(10, 11.1)).toBe(false));
  it('is true when claimed equals allocation', () => expect(isClaimWithinVariance(10, 10)).toBe(true));
});

describe('humanizeToken', () => {
  it('title-cases an underscore-separated token', () =>
    expect(humanizeToken('DEVOLUTION_FORMULA')).toBe('Devolution Formula'));
  it('handles a single-word token', () => expect(humanizeToken('FAILED')).toBe('Failed'));
  it('handles a token with digits', () =>
    expect(humanizeToken('FORM_STATUS_3_NOT_ACCEPTED')).toBe('Form Status 3 Not Accepted'));
});
