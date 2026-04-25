import { InrFormatPipe } from './inr-format.pipe';

describe('InrFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new InrFormatPipe();
    expect(pipe).toBeTruthy();
  });

  it('returns dash for null, undefined and non-numeric values', () => {
    const pipe = new InrFormatPipe();

    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
    expect(pipe.transform('not-a-number')).toBe('-');
  });

  it('auto formats values into crore, lakh, thousand and plain INR ranges', () => {
    const pipe = new InrFormatPipe();

    expect(pipe.transform(25000000, 'auto', { showSymbol: false, max: 1 })).toBe('2.5 Cr');
    expect(pipe.transform(250000, 'auto', { showSymbol: false, max: 1 })).toBe('2.5 Lakh');
    expect(pipe.transform(2500, 'auto', { showSymbol: false, max: 1 })).toBe('2.5 K');
    expect(pipe.transform(250, 'auto', { showSymbol: false })).toBe('250');
  });

  it('supports explicit formats and display options', () => {
    const pipe = new InrFormatPipe();

    expect(pipe.transform(12345678, 'cr', { showSymbol: false, max: 2 })).toBe('1.23 Cr');
    expect(pipe.transform(125000, 'lakh', { showSymbol: false, min: 1, max: 1 })).toBe(
      '1.3 Lakh',
    );
    expect(pipe.transform(1200, 'k', { showSymbol: false, showUnit: false, max: 1 })).toBe('1.2');
    expect(pipe.transform(123456, 'inr', { showSymbol: false })).toBe('1,23,456');
    expect(pipe.transform(123456, 'raw', { showSymbol: false })).toBe('123456');
  });
});
