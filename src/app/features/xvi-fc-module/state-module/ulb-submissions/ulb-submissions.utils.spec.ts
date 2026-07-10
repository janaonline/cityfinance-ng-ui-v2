import { UlbSubmissionRow } from './ulb-submissions.models';
import {
  filterRows,
  formatOverallStatus,
  getRowActionLabel,
  getStatusBadgeClass,
  isRowReviewable,
  paginateRows,
  sortRows,
} from './ulb-submissions.utils';

function makeRow(overrides: Partial<UlbSubmissionRow>): UlbSubmissionRow {
  return {
    ulbId: 'ulb-1',
    ulbCode: 'AP-001',
    ulbName: 'Adanki (TP)',
    electedBodyStatus: 'CONSTITUTED',
    fcUnspentStatus: 'NOT_STARTED',
    formStatus: 'SUBMITTED',
    overallStatus: { completed: 2, total: 5 },
    lastUpdatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('ulb-submissions.utils', () => {
  it('getStatusBadgeClass maps every status to a non-empty class', () => {
    expect(getStatusBadgeClass('APPROVED')).toBe('text-bg-success');
    expect(getStatusBadgeClass('RETURNED')).toBe('text-bg-danger');
    expect(getStatusBadgeClass('EXEMPT')).toBe('text-bg-secondary');
  });

  it('isRowReviewable is true only for SUBMITTED rows', () => {
    expect(isRowReviewable(makeRow({ formStatus: 'SUBMITTED' }))).toBe(true);
    expect(isRowReviewable(makeRow({ formStatus: 'APPROVED' }))).toBe(false);
    expect(isRowReviewable(makeRow({ formStatus: 'EXEMPT' }))).toBe(false);
  });

  it('getRowActionLabel returns Review for SUBMITTED, View for APPROVED, null otherwise', () => {
    expect(getRowActionLabel(makeRow({ formStatus: 'SUBMITTED' }))).toBe('Review');
    expect(getRowActionLabel(makeRow({ formStatus: 'APPROVED' }))).toBe('View');
    expect(getRowActionLabel(makeRow({ formStatus: 'EXEMPT' }))).toBeNull();
    expect(getRowActionLabel(makeRow({ formStatus: 'RETURNED' }))).toBeNull();
  });

  it('formatOverallStatus renders a completed/total fraction', () => {
    expect(formatOverallStatus(makeRow({ overallStatus: { completed: 3, total: 5 } }))).toBe('3/5');
  });

  it('filterRows matches by ULB name or code, case-insensitively', () => {
    const rows = [makeRow({ ulbName: 'Kakinada', ulbCode: 'AP-011' }), makeRow({ ulbName: 'Guntur', ulbCode: 'AP-012' })];
    expect(filterRows(rows, { search: 'kaki', status: 'ALL', overallStatus: 'ALL' })).toHaveLength(1);
    expect(filterRows(rows, { search: 'ap-012', status: 'ALL', overallStatus: 'ALL' })).toHaveLength(1);
  });

  it('filterRows applies the form-status filter', () => {
    const rows = [makeRow({ formStatus: 'APPROVED' }), makeRow({ formStatus: 'SUBMITTED' })];
    expect(filterRows(rows, { search: '', status: 'APPROVED', overallStatus: 'ALL' })).toHaveLength(1);
  });

  it('filterRows buckets overall status into NOT_STARTED / IN_PROGRESS / FULLY_APPROVED', () => {
    const rows = [
      makeRow({ overallStatus: { completed: 0, total: 5 } }),
      makeRow({ overallStatus: { completed: 2, total: 5 } }),
      makeRow({ overallStatus: { completed: 5, total: 5 } }),
    ];
    expect(filterRows(rows, { search: '', status: 'ALL', overallStatus: 'NOT_STARTED' })).toHaveLength(1);
    expect(filterRows(rows, { search: '', status: 'ALL', overallStatus: 'IN_PROGRESS' })).toHaveLength(1);
    expect(filterRows(rows, { search: '', status: 'ALL', overallStatus: 'FULLY_APPROVED' })).toHaveLength(1);
  });

  it('sortRows orders by ulbName ascending/descending', () => {
    const rows = [makeRow({ ulbName: 'Guntur' }), makeRow({ ulbName: 'Adanki (TP)' })];
    expect(sortRows(rows, 'ulbName', 'asc').map((r) => r.ulbName)).toEqual(['Adanki (TP)', 'Guntur']);
    expect(sortRows(rows, 'ulbName', 'desc').map((r) => r.ulbName)).toEqual(['Guntur', 'Adanki (TP)']);
  });

  it('sortRows orders by overallStatus completed count', () => {
    const rows = [makeRow({ overallStatus: { completed: 4, total: 5 } }), makeRow({ overallStatus: { completed: 1, total: 5 } })];
    expect(sortRows(rows, 'overallStatus', 'asc').map((r) => r.overallStatus.completed)).toEqual([1, 4]);
  });

  it('paginateRows slices the correct page window', () => {
    const rows = Array.from({ length: 25 }, (_, i) => makeRow({ ulbId: `ulb-${i}` }));
    expect(paginateRows(rows, 1, 10)).toHaveLength(10);
    expect(paginateRows(rows, 3, 10)).toHaveLength(5);
    expect(paginateRows(rows, 1, 10)[0].ulbId).toBe('ulb-0');
  });
});
