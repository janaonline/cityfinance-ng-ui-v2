import { extractApiErrorMessage } from './xv-fc-review-error.util';

describe('extractApiErrorMessage', () => {
  it('returns the backend message from a standard HttpErrorResponse-shaped error', () => {
    const error = {
      error: {
        success: false,
        statusCode: 400,
        message: 'A signed declaration must be uploaded before submitting',
      },
    };
    expect(extractApiErrorMessage(error, 'fallback')).toBe(
      'A signed declaration must be uploaded before submitting',
    );
  });

  it('joins a string-array message (e.g. validation-pipe errors) into one line', () => {
    const error = {
      error: {
        message: ['lineItems.1.property proposedValue should not exist', 'lineItems.14.property proposedValue should not exist'],
      },
    };
    expect(extractApiErrorMessage(error, 'fallback')).toBe(
      'lineItems.1.property proposedValue should not exist lineItems.14.property proposedValue should not exist',
    );
  });

  it('falls back when there is no error body (e.g. a network failure)', () => {
    expect(extractApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(extractApiErrorMessage(undefined, 'fallback')).toBe('fallback');
    expect(extractApiErrorMessage({}, 'fallback')).toBe('fallback');
  });

  it('falls back when the body has no usable message', () => {
    expect(extractApiErrorMessage({ error: {} }, 'fallback')).toBe('fallback');
    expect(extractApiErrorMessage({ error: { message: '' } }, 'fallback')).toBe('fallback');
    expect(extractApiErrorMessage({ error: { message: [] } }, 'fallback')).toBe('fallback');
    expect(extractApiErrorMessage({ error: { message: 42 } }, 'fallback')).toBe('fallback');
  });

  it('falls back when the error body is a plain string, not JSON', () => {
    expect(extractApiErrorMessage({ error: 'Internal Server Error' }, 'fallback')).toBe('fallback');
  });
});
