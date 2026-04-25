import { JSONUtility } from './jsonUtil';

describe('JSONUtility', () => {
  let utility: JSONUtility;

  beforeEach(() => {
    utility = new JSONUtility();
  });

  it('flattens nested objects into a single level object', () => {
    expect(
      utility.convertToFlatJSON({
        city: {
          name: 'Pune',
          finance: {
            score: 91,
          },
        },
        year: 2026,
      }),
    ).toEqual({ name: 'Pune', score: 91, year: 2026 });
  });

  it('removes null, undefined and blank string values while trimming strings', () => {
    expect(
      utility.filterEmptyValue({
        name: '  Surat  ',
        empty: '   ',
        missing: null,
        unknown: undefined,
        amount: 0,
      }),
    ).toEqual({ name: 'Surat', amount: 0 });
  });

  it('deep filters nested objects and arrays', () => {
    expect(
      utility.filterEmptyValue(
        {
          state: {
            name: ' Gujarat ',
            code: '',
          },
          rows: [{ value: ' 10 ' }, { value: '' }, null, { nested: { amount: ' 12 ' } }],
        },
        true,
      ),
    ).toEqual({
      state: { name: 'Gujarat' },
      rows: [{ value: '10' }, { nested: { amount: '12' } }],
    });
  });

  it('returns null when filtering removes every value', () => {
    expect(utility.filterEmptyValue({ one: '', two: null }, true)).toBeNull();
    expect(utility.filterOutEmptyArray([null, undefined, { value: '' }])).toBeNull();
  });

  it('deep copies dates, arrays and objects without sharing references', () => {
    const original = {
      createdAt: new Date('2026-04-25T00:00:00.000Z'),
      rows: [{ amount: 12 }],
    };

    const copy = utility.deepCopy(original);

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.createdAt).not.toBe(original.createdAt);
    expect(copy.rows).not.toBe(original.rows);
    expect(copy.rows[0]).not.toBe(original.rows[0]);
  });

  it('converts numeric values in objects and arrays to two decimal string values', () => {
    expect(
      utility.convert({
        amount: 33,
        ratio: '12.345',
        label: 'not-a-number',
        nested: { value: 2.5 },
        rows: [1, [2.345], { amount: 4 }],
      }),
    ).toEqual({
      amount: '33.00',
      ratio: '12.35',
      label: 'not-a-number',
      nested: { value: '2.50' },
      rows: ['1.00', ['2.35'], { amount: '4.00' }],
    });
  });

  it('returns undefined for falsy convert input and primitives for simple deep copies', () => {
    expect(utility.convert(null)).toBeUndefined();
    expect(utility.deepCopy('city')).toBe('city');
  });
});
