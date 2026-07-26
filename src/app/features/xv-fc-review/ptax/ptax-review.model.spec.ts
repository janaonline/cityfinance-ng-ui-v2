import { isPtaxLockedStatus, isPtaxRejectedStatus, isPtaxSubmittedStatus } from './ptax-review.model';

describe('isPtaxSubmittedStatus', () => {
  it('returns false for null, undefined, or an unrecognised status', () => {
    expect(isPtaxSubmittedStatus(null)).toBeFalse();
    expect(isPtaxSubmittedStatus(undefined)).toBeFalse();
    expect(isPtaxSubmittedStatus('DRAFT')).toBeFalse();
  });

  it('matches any status containing SUBMIT, COMPLETE, LOCK, ACCEPT, or APPROV, case-insensitively', () => {
    expect(isPtaxSubmittedStatus('SUBMITTED')).toBeTrue();
    expect(isPtaxSubmittedStatus('completed')).toBeTrue();
    expect(isPtaxSubmittedStatus('Locked')).toBeTrue();
    expect(isPtaxSubmittedStatus('ACCEPT_NO_CHANGES')).toBeTrue();
    // Regression: the backend's locked status is "APPROVED", which none of the other
    // keywords matched — this caused the FE to keep showing the submit form for an
    // already-approved FY, leading to a 409 on the next submit attempt.
    expect(isPtaxSubmittedStatus('APPROVED')).toBeTrue();
  });
});

describe('isPtaxRejectedStatus', () => {
  it('matches only statuses containing REJECT', () => {
    expect(isPtaxRejectedStatus('REJECTED')).toBeTrue();
    expect(isPtaxRejectedStatus('APPROVED')).toBeFalse();
    expect(isPtaxRejectedStatus(null)).toBeFalse();
  });
});

describe('isPtaxLockedStatus', () => {
  it('is locked once submitted/approved and not rejected', () => {
    expect(isPtaxLockedStatus('APPROVED')).toBeTrue();
    expect(isPtaxLockedStatus('SUBMITTED')).toBeTrue();
  });

  it('stays editable when rejected, even though rejection also implies a prior submission', () => {
    expect(isPtaxLockedStatus('REJECTED')).toBeFalse();
  });

  it('is not locked for a draft status', () => {
    expect(isPtaxLockedStatus('DRAFT')).toBeFalse();
    expect(isPtaxLockedStatus(null)).toBeFalse();
  });
});
