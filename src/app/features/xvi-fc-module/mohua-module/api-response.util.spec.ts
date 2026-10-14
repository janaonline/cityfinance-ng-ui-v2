import { unwrapNullableResponse, unwrapResponse } from './api-response.util';

describe('api-response.util', () => {
  describe('unwrapResponse', () => {
    it('returns the data of a successful envelope', () => {
      expect(unwrapResponse({ success: true, data: { id: 1 } })).toEqual({ id: 1 });
    });

    it('passes a raw payload straight through', () => {
      expect(unwrapResponse({ id: 1 })).toEqual({ id: 1 });
    });

    it('throws an unsuccessful envelope as-is so callers can read its message', () => {
      const failure = { success: false, message: 'nope' };
      expect(() => unwrapResponse<{ id: number }>(failure)).toThrow();
      try {
        unwrapResponse<{ id: number }>(failure);
      } catch (error) {
        expect(error).toBe(failure);
      }
    });

    it('treats a successful envelope without data as a failure', () => {
      expect(() => unwrapResponse<{ id: number }>({ success: true })).toThrow();
      expect(() => unwrapResponse<{ id: number }>({ success: true, data: undefined })).toThrow();
    });
  });

  describe('unwrapNullableResponse', () => {
    it('returns null for a null response or an envelope with no data', () => {
      expect(unwrapNullableResponse<{ id: number }>(null)).toBeNull();
      expect(unwrapNullableResponse<{ id: number }>({ success: true })).toBeNull();
      expect(unwrapNullableResponse<{ id: number }>({ success: true, data: undefined })).toBeNull();
    });

    it('returns the data of a successful envelope and passes a raw payload through', () => {
      expect(unwrapNullableResponse({ success: true, data: { id: 1 } })).toEqual({ id: 1 });
      expect(unwrapNullableResponse({ id: 2 })).toEqual({ id: 2 });
    });

    it('still throws an unsuccessful envelope', () => {
      expect(() => unwrapNullableResponse<{ id: number }>({ success: false })).toThrow();
    });
  });
});
