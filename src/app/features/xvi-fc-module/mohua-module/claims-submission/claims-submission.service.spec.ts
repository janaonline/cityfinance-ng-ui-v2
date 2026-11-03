import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { claimStatusBadgeClass, formatOrdinal, formatReceivedOn, formatRupeesInCrore } from './claims-submission.models';
import { ClaimsSubmissionService } from './claims-submission.service';

describe('ClaimsSubmissionService', () => {
  let service: ClaimsSubmissionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ClaimsSubmissionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches the states for installment 1 and unwraps the { success, data } envelope', () => {
    let result: unknown;
    service.getStates('y1').subscribe((r) => (result = r));

    const req = http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/claim-letters/y1/1'));
    req.flush({ success: true, data: { states: [] } });

    expect(result).toEqual({ states: [] });
  });

  it('approves a claim letter with the revision it showed, unwrapping the envelope', () => {
    let result: unknown;
    service.approveClaimLetter('c1', 3).subscribe((r) => (result = r));

    const req = http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/claim-letters/letter/c1/approve'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ expectedRevision: 3 });
    req.flush({ success: true, data: { id: 'c1', status: 15 } });

    expect(result).toEqual({ id: 'c1', status: 15 });
  });

  it("PUTs one ULB's decision and unwraps the saved mark", () => {
    let result: unknown;
    service
      .decideUlb('c1', 'u1', {
        status: 'RETURNED',
        ulbFormIds: [33],
        rowFormIds: [23],
        rejectExemptionFormIds: [],
        remark: 'Wrong IFSC',
      })
      .subscribe((r) => (result = r));

    const req = http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/claim-letters/letter/c1/ulb/u1/decision'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      status: 'RETURNED',
      ulbFormIds: [33],
      rowFormIds: [23],
      rejectExemptionFormIds: [],
      remark: 'Wrong IFSC',
    });
    req.flush({ success: true, data: { status: 'RETURNED' } });

    expect(result).toEqual({ status: 'RETURNED' });
  });

  it('returns a letter with only the State-wide items in the body, leaving out an empty remark', () => {
    service.returnClaimLetter('c1', 3, { stateFormIds: [22], stateRemark: '' }).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/claim-letters/letter/c1/return'));
    expect(req.request.body).toEqual({ expectedRevision: 3, stateFormIds: [22] });
    req.flush({ success: true, data: {} });
  });

  it('accepts a bare payload, as a dev server may return', () => {
    let result: unknown;
    service.getStateClaimLetters('s1', 'y1').subscribe((r) => (result = r));

    http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/claim-letters/state/s1/y1/1')).flush({ claimLetters: [] });

    expect(result).toEqual({ claimLetters: [] });
  });

  it('fetches one letter and its ULBs, sending only the query params that are set', () => {
    service.getClaimLetter('c1').subscribe();
    http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/claim-letters/letter/c1')).flush({ success: true, data: {} });

    service.getClaimLetterUlbs('c1', { search: 'agar', page: 2 }).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/claim-letters/letter/c1/ulbs'));
    expect(req.request.params.get('search')).toBe('agar');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.has('limit')).toBeFalse();
    req.flush({ success: true, data: { items: [] } });
  });
});

describe('claim letter formatters', () => {
  it('shows whole Rupees as crore to one decimal, Indian-grouped', () => {
    expect(formatRupeesInCrore(1_123_000_000)).toBe('₹112.3 cr');
    expect(formatRupeesInCrore(7_810_000_000)).toBe('₹781 cr');
    expect(formatRupeesInCrore(10_420_000_000_000)).toBe('₹10,42,000 cr');
  });

  it('shows a dash when there is no figure', () => {
    expect(formatRupeesInCrore(null)).toBe('—');
    expect(formatRupeesInCrore(undefined)).toBe('—');
  });

  it('writes ordinals, including the 11th-13th exceptions', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101].map(formatOrdinal)).toEqual([
      '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '101st',
    ]);
  });

  it('colours the status badge: approved (7) green, returned (6, 16) red, otherwise amber', () => {
    expect(claimStatusBadgeClass(7)).toBe('cs-badge--good');
    expect(claimStatusBadgeClass(6)).toBe('cs-badge--bad');
    expect(claimStatusBadgeClass(16)).toBe('cs-badge--bad');
    expect(claimStatusBadgeClass(15)).toBe('cs-badge--review');
    expect(claimStatusBadgeClass(5)).toBe('cs-badge--good');
  });

  it('formats a received date, and a dash when none', () => {
    expect(formatReceivedOn('2026-07-22T10:00:00.000Z')).toContain('2026');
    expect(formatReceivedOn(null)).toBe('—');
  });
});
