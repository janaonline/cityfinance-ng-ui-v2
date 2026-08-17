import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { UlbSubmissionsService } from './ulb-submissions.service';
import { UlbSubmissionsQuery } from './ulb-submissions.models';

const BASE_URL = environment.api.url2;

const baseQuery: UlbSubmissionsQuery = {
  designYearId: 'year-1',
  form: 'SERVICE_LEVEL_BENCHMARKS',
  search: '',
  status: null,
  page: 1,
  pageSize: 20,
  sortField: 'ulbName',
  sortDirection: 'asc',
};

describe('UlbSubmissionsService', () => {
  let service: UlbSubmissionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UlbSubmissionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() routes SERVICE_LEVEL_BENCHMARKS to the SLB state/ulb-submissions endpoint', () => {
    let result: unknown;
    service.list(baseQuery).subscribe((value) => (result = value));

    const req = httpMock.expectOne(
      (r) => r.url === `${BASE_URL}xvi-fc/ulb/slb/state/ulb-submissions`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('designYearId')).toBe('year-1');
    req.flush({
      success: true,
      data: {
        total: 1,
        page: 1,
        pageSize: 20,
        rows: [
          {
            ulbId: 'ulb-1',
            ulbCode: 'ULB1',
            censusCode: '900001',
            ulbName: 'Test ULB',
            formStatus: 2,
            lastUpdatedAt: null,
            slbFormId: 'slb-1',
          },
        ],
        counts: { 1: 5, 2: 1 },
      },
    });

    expect(result).toEqual({
      total: 1,
      page: 1,
      pageSize: 20,
      rows: [
        {
          ulbId: 'ulb-1',
          ulbCode: 'ULB1',
          censusCode: '900001',
          ulbName: 'Test ULB',
          formStatus: 'IN_PROGRESS',
          formStatusId: 2,
          lastUpdatedAt: null,
          recordId: 'slb-1',
        },
      ],
      counts: { NOT_STARTED: 5, IN_PROGRESS: 1 },
    });
  });

  it('list() sends the search and mapped numeric status filters for SLB', () => {
    service
      .list({ ...baseQuery, search: 'Adib', status: ['UNDER_REVIEW_BY_STATE', 'RETURNED_BY_STATE'] })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url === `${BASE_URL}xvi-fc/ulb/slb/state/ulb-submissions`);
    expect(req.request.params.get('search')).toBe('Adib');
    expect(req.request.params.get('status')).toBe('3,4');
    req.flush({ success: true, data: { total: 0, page: 1, pageSize: 20, rows: [], counts: {} } });
  });

  it('list() still routes PFMS_BANK_ACCOUNT to the bank-account endpoint', () => {
    service.list({ ...baseQuery, form: 'PFMS_BANK_ACCOUNT' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${BASE_URL}xvi-fc/bank-account/state/ulb-submissions`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { total: 0, page: 1, pageSize: 20, rows: [], counts: {} } });
  });
});
