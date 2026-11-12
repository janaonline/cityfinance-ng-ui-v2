import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { MohuaOverviewService } from './mohua-overview.service';
import { MohuaOverviewApiData, OverviewData } from './overview.models';

const OVERVIEW_URL = `${environment.api.url2}xvi-fc/mohua/overview/year-1`;

const form = {
  key: 'SFC_STATUS',
  label: 'SFC Status',
  statusCode: 5,
  statusLabel: 'Under Review by MoHUA',
  completed: true,
  canView: true,
};

const apiData: MohuaOverviewApiData = {
  year: { id: 'year-1', label: '2026-27' },
  totals: { stateCount: 2, ulbsCovered: 50, allocation: 37272, instalment1: 18636 },
  states: [
    {
      id: 'state-ap',
      code: 'AP',
      name: 'Andhra Pradesh',
      slug: 'andhra-pradesh',
      stage: 'underReview',
      underReviewSince: '2026-08-14T08:53:33.231Z',
      allocation: 1562,
      eligible: null,
      ulbsDone: 3,
      ulbsTotal: 30,
      formsDone: 5,
      forms: [form],
    },
    {
      id: 'state-mh',
      code: 'MH',
      name: 'Maharashtra',
      slug: 'maharashtra',
      stage: 'inProgress',
      underReviewSince: null,
      allocation: 6012,
      eligible: null,
      ulbsDone: 0,
      ulbsTotal: 20,
      formsDone: 1,
      forms: [{ ...form, statusCode: 2, statusLabel: 'In Progress', completed: false }],
    },
  ],
};

describe('MohuaOverviewService', () => {
  let service: MohuaOverviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(MohuaOverviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('calls the overview endpoint for the year and maps each stage to the UI status and state id', () => {
    let overview: OverviewData | undefined;
    service.getOverview('year-1').subscribe((value) => (overview = value));

    const request = httpMock.expectOne(OVERVIEW_URL);
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: apiData });

    expect(overview?.totals).toEqual(apiData.totals);
    expect(overview?.rows.map((row) => [row.stateId, row.status])).toEqual([
      ['state-ap', 'review'],
      ['state-mh', 'progress'],
    ]);
    expect(overview?.rows[0].underReviewSince).toBe('2026-08-14T08:53:33.231Z');
  });

  it('also accepts an unwrapped payload', () => {
    let count = 0;
    service.getOverview('year-1').subscribe((overview) => (count = overview.rows.length));

    httpMock.expectOne(OVERVIEW_URL).flush(apiData);

    expect(count).toBe(2);
  });

  it('surfaces an unsuccessful response as an error', () => {
    let failed = false;
    service.getOverview('year-1').subscribe({ error: () => (failed = true) });

    httpMock.expectOne(OVERVIEW_URL).flush({ success: false, message: 'Year not found' });

    expect(failed).toBeTrue();
  });
});
