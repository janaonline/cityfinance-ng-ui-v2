import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ManualReviewQueueService } from './manual-review-queue.service';
import { ManualReviewQueueResult } from './manual-review-queue.models';

const row = (id: string, manualReviewRequestedAt: string, idKey: 'annualAccountId' | 'durId') => ({
  uploadId: id,
  [idKey]: `${id}-form`,
  manualReviewRequestedAt,
});

describe('ManualReviewQueueService', () => {
  let service: ManualReviewQueueService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ManualReviewQueueService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks each backend only for the rows the page needs, then merges them oldest first', () => {
    let result: ManualReviewQueueResult | undefined;
    service.getQueue({ page: 1, pageSize: 2 }).subscribe((r) => (result = r));

    const aa = http.expectOne((r) => r.url.endsWith('annual-account/manual-review-queue'));
    const dur = http.expectOne((r) => r.url.endsWith('dur/manual-review-queue'));
    expect(aa.request.params.get('pageSize')).toBe('2');
    aa.flush({
      data: {
        total: 300,
        page: 1,
        pageSize: 2,
        rows: [row('a1', '2026-11-01T10:00:00Z', 'annualAccountId'), row('a2', '2026-11-05T10:00:00Z', 'annualAccountId')],
      },
    });
    dur.flush({ data: { total: 40, page: 1, pageSize: 2, rows: [row('d1', '2026-11-03T10:00:00Z', 'durId')] } });

    expect(result?.total).toBe(340);
    expect(result?.rows.map((r) => r.uploadId)).toEqual(['a1', 'd1']);
    expect(result?.failedSources).toEqual([]);
  });

  it('marks a backend that failed and still shows the other one', () => {
    let result: ManualReviewQueueResult | undefined;
    spyOn(console, 'error');
    service.getQueue({ page: 1, pageSize: 20 }).subscribe((r) => (result = r));

    http
      .expectOne((r) => r.url.endsWith('dur/manual-review-queue'))
      .flush(null, { status: 500, statusText: 'Server Error' });
    http
      .expectOne((r) => r.url.endsWith('annual-account/manual-review-queue'))
      .flush({ data: { total: 1, page: 1, pageSize: 20, rows: [row('a1', '2026-11-01T10:00:00Z', 'annualAccountId')] } });

    expect(result?.failedSources).toEqual(['DUR']);
    expect(result?.total).toBe(1);
  });
});
