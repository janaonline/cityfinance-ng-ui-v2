import { RupeeConverterPipe } from './rupee-converter.pipe';

describe('RupeeConverterPipe', () => {
  let pipe: RupeeConverterPipe;

  beforeEach(() => {
    pipe = new RupeeConverterPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats numeric values using Indian digit grouping', () => {
    expect(pipe.transform(12345678.9)).toBe('1,23,45,678.9');
    expect(pipe.transform('123456')).toBe('1,23,456');
  });

  it('keeps percent suffixes and supports INR prefix option', () => {
    expect(pipe.transform('12.5%')).toBe('12.5%');
    expect(pipe.transform(1234, { showInr: true })).toBe('INR 1,234');
  });

  it('returns special ULB audit text when numOfUlb row has audited value', () => {
    expect(pipe.transform(10, { colId: 'numOfUlb', row: { audited: 8 } })).toBe('Audited : 8');
    expect(pipe.transform(10, { colId: 'numOfUlb', row: {} })).toBeUndefined();
  });

  it('returns non numeric strings and numeric zero unchanged', () => {
    expect(pipe.transform('Total')).toBe('Total');
    expect(pipe.transform(0)).toBe(0);
  });

  it('throws for null values because null is treated as an object by the current implementation', () => {
    expect(() => pipe.transform(null)).toThrowError(TypeError);
  });
});
