import { formatCrore, formatCroreFull } from './fc-unspent-review.utils';

describe('formatCrore', () => {
  it('returns "—" for null', () => expect(formatCrore(null)).toBe('—'));
  it('returns "—" for undefined', () => expect(formatCrore(undefined)).toBe('—'));
  it('appends "Cr." without rescaling', () => expect(formatCrore(13.948)).toBe('13.95 Cr.'));
  it('formats zero', () => expect(formatCrore(0)).toBe('0 Cr.'));
});

describe('formatCroreFull', () => {
  it('returns "—" for null', () => expect(formatCroreFull(null)).toBe('—'));
  it('returns "—" for undefined', () => expect(formatCroreFull(undefined)).toBe('—'));
  it('appends "Cr." without rounding', () => expect(formatCroreFull(13.948235)).toBe('13.948235 Cr.'));
  it('formats zero', () => expect(formatCroreFull(0)).toBe('0 Cr.'));
});
