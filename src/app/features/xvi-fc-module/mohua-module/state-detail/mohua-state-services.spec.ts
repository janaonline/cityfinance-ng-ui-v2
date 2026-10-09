import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { MohuaStateDetailService } from './mohua-state-detail.service';
import { MohuaStateUlbsService } from './mohua-state-ulbs.service';
import { MohuaStateDetailApiData, StateDetailData, StateUlbsPage, StateUlbsQuery } from './state-detail.models';

const BASE = `${environment.api.url2}xvi-fc/mohua/state/`;

describe('MohuaStateDetailService', () => {
  let service: MohuaStateDetailService;
  let httpMock: HttpTestingController;

  const apiData: MohuaStateDetailApiData = {
    year: { id: 'year-1', label: '2026-27' },
    state: { id: 'state-1', code: 'TR', name: 'Tripura', slug: 'tripura', stage: 'inProgress' },
    allocation: 130,
    formsDone: 1,
    forms: [
      {
        key: 'GTC',
        label: 'Grant Transfer Certificate',
        statusCode: 13,
        statusLabel: 'Under Review by PMU',
        completed: true,
        canView: true,
      },
    ],
    ulbForms: { totalUlbs: 21, items: [{ key: 'DUR', label: 'DUR', completed: 20 }] },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(MohuaStateDetailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the state for the year and maps the API stage to the UI status', () => {
    let detail: StateDetailData | undefined;
    service.getDetail('state-1', 'year-1').subscribe((value) => (detail = value));

    const request = httpMock.expectOne(`${BASE}state-1/year-1`);
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: apiData });

    expect(detail?.state).toEqual({ id: 'state-1', code: 'TR', name: 'Tripura', status: 'progress' });
    expect(detail?.allocation).toBe(130);
    expect(detail?.forms[0].canView).toBeTrue();
    expect(detail?.ulbForms.totalUlbs).toBe(21);
  });

  it('surfaces an unsuccessful response as an error', () => {
    let failed = false;
    service.getDetail('state-1', 'year-1').subscribe({ error: () => (failed = true) });

    httpMock.expectOne(`${BASE}state-1/year-1`).flush({ success: false, message: 'State not found' });

    expect(failed).toBeTrue();
  });
});

describe('MohuaStateUlbsService', () => {
  let service: MohuaStateUlbsService;
  let httpMock: HttpTestingController;

  const query: StateUlbsQuery = { page: 2, limit: 15, search: '  chirala ', sortBy: 'allocation', sortDir: 'desc' };
  const page: StateUlbsPage = {
    items: [
      {
        ulbId: 'ulb-1',
        name: 'Chirala',
        censusCode: '459816',
        allocation: 6.4,
        electedBody: 'Constituted',
        forms: { audited: true, unaudited: false, pfms: true, slb: false, dur: true },
      },
    ],
    pagination: { page: 2, limit: 15, total: 16, totalPages: 2 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(MohuaStateUlbsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends page, limit and sort, with the search trimmed', () => {
    let result: StateUlbsPage | undefined;
    service.getUlbs('state-1', 'year-1', query).subscribe((value) => (result = value));

    const request = httpMock.expectOne((req) => req.url === `${BASE}state-1/year-1/ulbs`);
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('15');
    expect(request.request.params.get('sortBy')).toBe('allocation');
    expect(request.request.params.get('sortDir')).toBe('desc');
    expect(request.request.params.get('search')).toBe('chirala');
    request.flush({ success: true, data: page });

    expect(result).toEqual(page);
  });

  it('leaves the search parameter out when it is blank', () => {
    service.getUlbs('state-1', 'year-1', { ...query, search: '   ' }).subscribe();

    const request = httpMock.expectOne((req) => req.url === `${BASE}state-1/year-1/ulbs`);
    expect(request.request.params.has('search')).toBeFalse();
    request.flush({ success: true, data: page });
  });
});
