import { HttpErrorResponse } from '@angular/common/http';
import {
  buildPmuUndoConfirm,
  extractApiErrorResponse,
  extractFormLevelErrorMessage,
  isLongSnackbarMessage,
} from './pmu-review.utils';

function httpError(body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ error: body });
}

describe('extractApiErrorResponse', () => {
  it('reads the body off an HttpErrorResponse', () => {
    const response = httpError({ success: false, message: 'Bad request.' });
    expect(extractApiErrorResponse(response)).toEqual(jasmine.objectContaining({ message: 'Bad request.' }));
  });

  it('passes through a thrown success:false object as-is', () => {
    const err = { success: false, message: 'Validation failed.' } as const;
    expect(extractApiErrorResponse(err)).toBe(err);
  });

  it('returns null for an HttpErrorResponse with a non-object body', () => {
    expect(extractApiErrorResponse(httpError('plain text'))).toBeNull();
  });

  it('returns null for an unrelated thrown value', () => {
    expect(extractApiErrorResponse(new Error('network down'))).toBeNull();
  });
});

describe('extractFormLevelErrorMessage', () => {
  it('joins _form error messages when present', () => {
    const err = { success: false, errors: { _form: [{ code: 'x', message: 'One.' }, { code: 'y', message: 'Two.' }] } };
    expect(extractFormLevelErrorMessage(err, 'fallback')).toBe('One. Two.');
  });

  it('falls back to the response message when there is no _form entry', () => {
    const err = { success: false, message: 'Server message.' };
    expect(extractFormLevelErrorMessage(err, 'fallback')).toBe('Server message.');
  });

  it('falls back to the provided fallback when neither is present', () => {
    expect(extractFormLevelErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});

describe('isLongSnackbarMessage', () => {
  it('returns false for a short, single-clause message', () => {
    expect(isLongSnackbarMessage('A rejection remark is required for every selected row.')).toBeFalse();
  });

  it('returns true for the "rowsAlreadyApproved" message', () => {
    expect(
      isLongSnackbarMessage(
        'One or more rows have already been approved. Use row-level review to reject the remaining pending rows instead of rejecting the complete form.',
      ),
    ).toBeTrue();
  });

  it('returns true for the "rowsNotApprovable" message', () => {
    expect(
      isLongSnackbarMessage(
        'One or more rows are rejected, need update, or have not been submitted for review. Resolve them via row-level review before approving the complete form.',
      ),
    ).toBeTrue();
  });

  it('returns true for the "notPending" bulk-row message', () => {
    expect(
      isLongSnackbarMessage('One or more selected rows are not awaiting review (already decided or not yet submitted).'),
    ).toBeTrue();
  });

  it('returns false right at the threshold (80 chars) and true just over it (81)', () => {
    expect(isLongSnackbarMessage('x'.repeat(80))).toBeFalse();
    expect(isLongSnackbarMessage('x'.repeat(81))).toBeTrue();
  });
});

describe('buildPmuUndoConfirm', () => {
  const base = { formLabel: 'SFC Status', stateName: 'Rajasthan', hasRows: false };

  it('states the concrete outcome of undoing an approval', () => {
    const dialog = buildPmuUndoConfirm({ ...base, status: 5 });
    expect(dialog.title).toBe('Undo your approval?');
    expect(dialog.message).toBe(
      'SFC Status for Rajasthan goes back to Under Review by PMU and your approval is withdrawn. You can then approve or return it again.',
    );
  });

  it('states the concrete outcome of undoing a return, and that every row is reviewed again for row forms', () => {
    const dialog = buildPmuUndoConfirm({ ...base, formLabel: 'FC Unspent Declaration', status: 14, hasRows: true });
    expect(dialog.title).toBe('Undo your return?');
    expect(dialog.message).toContain('your return remark is cleared');
    expect(dialog.message).toContain('Every ULB row goes back to pending too');
  });
});
