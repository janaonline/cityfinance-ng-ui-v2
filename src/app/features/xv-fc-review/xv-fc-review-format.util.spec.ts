import { formatXvFcAmount, groupXvFcLineItems } from './xv-fc-review-format.util';
import { XvFcLineItem } from './models/xv-fc-review.model';

describe('formatXvFcAmount', () => {
  it('returns an em dash for null or undefined amounts', () => {
    expect(formatXvFcAmount(null, 'lakhs')).toBe('—');
    expect(formatXvFcAmount(undefined, 'lakhs')).toBe('—');
  });

  it('shows a genuine zero as "0.00" rather than an em dash', () => {
    expect(formatXvFcAmount(0, 'lakhs')).toBe('0.00');
  });

  it('treats the base amount as already being in lakhs when unit is lakhs', () => {
    expect(formatXvFcAmount(6, 'lakhs')).toBe('6.00');
    expect(formatXvFcAmount(121.22, 'lakhs')).toBe('121.22');
  });

  it('converts lakhs to whole rupees by multiplying by 1,00,000', () => {
    expect(formatXvFcAmount(6, 'whole')).toBe('6,00,000.00');
    expect(formatXvFcAmount(0.5, 'whole')).toBe('50,000.00');
  });

  it('converts lakhs to crores by dividing by 100', () => {
    expect(formatXvFcAmount(600, 'crores')).toBe('6.00');
    expect(formatXvFcAmount(6, 'crores')).toBe('0.06');
  });

  it('falls back to extra decimal precision in crores so small-but-nonzero lakh amounts do not disappear', () => {
    // 0.5 lakh = 0.005 crore, which would round to "0.00" at 2 decimals.
    expect(formatXvFcAmount(0.5, 'crores')).toBe('0.005000');
  });

  it('does not apply the extra-precision fallback once the crore value is large enough to survive rounding', () => {
    expect(formatXvFcAmount(1, 'crores')).toBe('0.01');
  });
});

describe('groupXvFcLineItems', () => {
  const item = (code: string, section: string) => ({ code, section }) as unknown as XvFcLineItem;

  it('groups line items by section, preserving first-seen section order', () => {
    const items = [item('1.1', 'Revenue'), item('2.1', 'Expenditure'), item('1.2', 'Revenue')];

    const groups = groupXvFcLineItems(items);

    expect(groups.map((g) => g.section)).toEqual(['Revenue', 'Expenditure']);
    expect(groups[0].items.map((i) => i.code)).toEqual(['1.1', '1.2']);
    expect(groups[1].items.map((i) => i.code)).toEqual(['2.1']);
  });

  it('returns an empty array for an empty input', () => {
    expect(groupXvFcLineItems([])).toEqual([]);
  });
});
