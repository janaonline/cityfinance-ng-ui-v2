import { UlbSubmissionRow } from './ulb-submissions.models';
import { getRowActionLabel, getStatusBadgeClass, isRowReviewable } from './ulb-submissions.utils';

function makeRow(overrides: Partial<UlbSubmissionRow>): UlbSubmissionRow {
  return {
    ulbId: 'ulb-1',
    ulbCode: 'AP-001',
    ulbName: 'Adanki (TP)',
    formStatus: 'UNDER_REVIEW_BY_STATE',
    formStatusId: 3,
    lastUpdatedAt: '2026-01-01',
    recordId: 'account-1',
    ...overrides,
  };
}

describe('ulb-submissions.utils', () => {
  it('getStatusBadgeClass maps every status to a non-empty class', () => {
    expect(getStatusBadgeClass('SUBMISSION_ACKNOWLEDGED_BY_MOHUA')).toBe('text-bg-success');
    expect(getStatusBadgeClass('RETURNED_BY_STATE')).toBe('text-bg-danger');
    expect(getStatusBadgeClass('NOT_STARTED')).toBe('text-bg-light text-dark border');
  });

  it('isRowReviewable is true only for UNDER_REVIEW_BY_STATE rows', () => {
    expect(isRowReviewable(makeRow({ formStatus: 'UNDER_REVIEW_BY_STATE' }))).toBe(true);
    expect(isRowReviewable(makeRow({ formStatus: 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA' }))).toBe(false);
    expect(isRowReviewable(makeRow({ formStatus: 'NOT_STARTED' }))).toBe(false);
  });

  it('getRowActionLabel returns Review while under state review, View once an account exists, null before one exists', () => {
    expect(getRowActionLabel(makeRow({ formStatus: 'UNDER_REVIEW_BY_STATE' }))).toBe('Review');
    expect(getRowActionLabel(makeRow({ formStatus: 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA' }))).toBe('View');
    expect(getRowActionLabel(makeRow({ formStatus: 'NOT_STARTED', recordId: null }))).toBeNull();
  });
});
