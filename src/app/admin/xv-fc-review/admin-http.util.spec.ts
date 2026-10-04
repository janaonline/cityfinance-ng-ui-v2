import { toHttpParams, unwrapAdminResponse } from './admin-http.util';

describe('toHttpParams', () => {
  it('stringifies every defined, non-empty field', () => {
    expect(toHttpParams({ page: 2, limit: 50, search: 'Sadri' })).toEqual({
      page: '2',
      limit: '50',
      search: 'Sadri',
    });
  });

  it('drops undefined, null, and empty-string fields', () => {
    expect(toHttpParams({ page: 1, search: undefined, stateId: null, censusCode: '' })).toEqual({ page: '1' });
  });

  it('returns an empty object for an all-empty query', () => {
    expect(toHttpParams({})).toEqual({});
  });
});

describe('unwrapAdminResponse', () => {
  it('unwraps the { success, data, timestamp } envelope', () => {
    const response = { success: true, data: { total: 5 }, timestamp: '2024-01-01' };
    expect(unwrapAdminResponse<{ total: number }>(response)).toEqual({ total: 5 });
  });

  it('returns the response as-is when there is no data envelope', () => {
    const response = { total: 5 };
    expect(unwrapAdminResponse<{ total: number }>(response)).toEqual({ total: 5 });
  });

  it('returns the value as-is for a non-object response (e.g. an array)', () => {
    const response = [1, 2, 3];
    expect(unwrapAdminResponse<number[]>(response)).toEqual([1, 2, 3]);
  });
});
