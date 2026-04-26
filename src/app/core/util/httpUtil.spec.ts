import { HttpUtility } from './httpUtil';

describe('HttpUtility', () => {
  let utility: HttpUtility;

  beforeEach(() => {
    utility = new HttpUtility();
  });

  it('converts truthy values into trimmed HttpParams', () => {
    const params = utility.convertToHttpParams({
      name: '  Pune  ',
      page: '1',
    });

    expect(params.get('name')).toBe('Pune');
    expect(params.get('page')).toBe('1');
  });

  it('skips empty values while preserving non-string values passed by callers', () => {
    const params = utility.convertToHttpParams({
      empty: '',
      count: 10,
      enabled: true,
    } as any);

    expect(params.has('empty')).toBeFalse();
    expect(params.get('count')).toBe('10');
    expect(params.get('enabled')).toBe('true');
  });
});
