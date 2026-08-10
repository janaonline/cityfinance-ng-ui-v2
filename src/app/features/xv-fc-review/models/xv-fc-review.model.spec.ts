import { isXvFcSubmittedStatus } from './xv-fc-review.model';

describe('isXvFcSubmittedStatus', () => {
  it('returns false for null, undefined, or an unrecognised status', () => {
    expect(isXvFcSubmittedStatus(null)).toBeFalse();
    expect(isXvFcSubmittedStatus(undefined)).toBeFalse();
    expect(isXvFcSubmittedStatus('DRAFT')).toBeFalse();
  });

  it('matches any status containing SUBMIT, COMPLETE, LOCK, ACCEPT, or APPROV, case-insensitively', () => {
    expect(isXvFcSubmittedStatus('SUBMITTED')).toBeTrue();
    expect(isXvFcSubmittedStatus('completed')).toBeTrue();
    expect(isXvFcSubmittedStatus('Locked')).toBeTrue();
    expect(isXvFcSubmittedStatus('ACCEPT_NO_CHANGES')).toBeTrue();
    expect(isXvFcSubmittedStatus('APPROVED')).toBeTrue();
  });
});
