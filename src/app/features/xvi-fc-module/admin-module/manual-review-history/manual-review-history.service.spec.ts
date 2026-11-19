import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ManualReviewHistoryService } from './manual-review-history.service';
import { ManualReviewHistoryResult } from './manual-review-history.models';

const row = (id: string, requestedAt: string, idKey: 'annualAccountId' | 'durId') => ({
  requestId: id,
  [idKey]: `${id}-form`,
  requestedAt,
});

describe('ManualReviewHistoryService', () => {
  let service: ManualReviewHistoryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ManualReviewHistoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks each backend only for the rows the page needs, then merges them newest first', () => {
    let result: ManualReviewHistoryResult | undefined;
    service.getHistory({ page: 1, pageSize: 2 }).subscribe((r) => (result = r));

    const aa = http.expectOne((r) => r.url.endsWith('annual-account/manual-review-history'));
    const dur = http.expectOne((r) => r.url.endsWith('dur/manual-review-history'));
    expect(aa.request.params.get('pageSize')).toBe('2');
    expect(dur.request.params.get('page')).toBe('1');
    aa.flush({
      data: {
        total: 5000,
        page: 1,
        pageSize: 2,
        rows: [row('a1', '2026-11-10T10:00:00Z', 'annualAccountId'), row('a2', '2026-11-08T10:00:00Z', 'annualAccountId')],
      },
    });
    dur.flush({
      data: { total: 841, page: 1, pageSize: 2, rows: [row('d1', '2026-11-09T10:00:00Z', 'durId')] },
    });

    expect(result?.total).toBe(5841);
    expect(result?.rows.map((r) => r.requestId)).toEqual(['a1', 'd1']);
    expect(result?.failedSources).toEqual([]);
  });

  it('fetches a deep page in 100-row pages, one after another', () => {
    service.getHistory({ page: 3, pageSize: 50, formType: 'DUR' }).subscribe();

    const first = http.expectOne((r) => r.url.endsWith('dur/manual-review-history'));
    expect(first.request.params.get('pageSize')).toBe('100');
    first.flush({ data: { total: 900, page: 1, pageSize: 100, rows: [] } });

    // 150 rows needed: page 2 is requested only after page 1 answered.
    const second = http.expectOne((r) => r.url.endsWith('dur/manual-review-history'));
    expect(second.request.params.get('page')).toBe('2');
    second.flush({ data: { total: 900, page: 2, pageSize: 100, rows: [] } });
  });

  it('marks a backend that failed and still shows the other one', () => {
    let result: ManualReviewHistoryResult | undefined;
    spyOn(console, 'error');
    service.getHistory({ page: 1, pageSize: 20 }).subscribe((r) => (result = r));

    http
      .expectOne((r) => r.url.endsWith('annual-account/manual-review-history'))
      .flush(null, { status: 500, statusText: 'Server Error' });
    http
      .expectOne((r) => r.url.endsWith('dur/manual-review-history'))
      .flush({ data: { total: 1, page: 1, pageSize: 20, rows: [row('d1', '2026-11-09T10:00:00Z', 'durId')] } });

    expect(result?.failedSources).toEqual(['ANNUAL_ACCOUNT']);
    expect(result?.total).toBe(1);
  });
});
