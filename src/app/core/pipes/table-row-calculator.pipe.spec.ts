import { TableRowCalculatorPipe } from './table-row-calculator.pipe';

describe('TableRowCalculatorPipe', () => {
  it('create an instance', () => {
    const pipe = new TableRowCalculatorPipe();
    expect(pipe).toBeTruthy();
  });

  it('sums numeric values for the requested key', () => {
    const pipe = new TableRowCalculatorPipe();

    expect(
      pipe.transform('$sum', 'amount', [{ amount: 10.234 }, { amount: 2 }, { other: 9 }], false),
    ).toBe(12.23);
  });

  it('can exclude the first item before summing', () => {
    const pipe = new TableRowCalculatorPipe();

    expect(pipe.transform('$sum', 'amount', [{ amount: 100 }, { amount: 2 }], true)).toBe(2);
  });

  it('returns non formula values unchanged', () => {
    const pipe = new TableRowCalculatorPipe();

    expect(pipe.transform('label', 'amount', [{ amount: 2 }], false)).toBe('label');
  });
});
