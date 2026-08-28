import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../../environments/environment';
import { StateDashboardApiResponse, StateDashboardData } from './state-dashboard.models';
import { StateDashboardService } from './state-dashboard.service';

describe('StateDashboardService', () => {
  const stateId = '000000000000000000000001';
  const yearId = '000000000000000000000002';
  const expectedUrl = `${environment.api.url2}xvi-fc/state/${stateId}/${yearId}/dashboard`;

  let service: StateDashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StateDashboardService],
    });

    service = TestBed.inject(StateDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('calls the dashboard endpoint with GET', () => {
    service.getDashboard(stateId, yearId).subscribe();

    const request = httpMock.expectOne(expectedUrl);
    expect(request.request.method).toBe('GET');
    request.flush(apiResponse);
  });

  it('uses the supplied State ID', () => {
    service.getDashboard(stateId, yearId).subscribe();

    const request = httpMock.expectOne((candidate) => candidate.url.includes(`/state/${stateId}/`));
    expect(request.request.url).toContain(`/state/${stateId}/`);
    request.flush(apiResponse);
  });

  it('uses the supplied year ID', () => {
    service.getDashboard(stateId, yearId).subscribe();

    const request = httpMock.expectOne((candidate) => candidate.url.includes(`/${yearId}/dashboard`));
    expect(request.request.url).toContain(`/${yearId}/dashboard`);
    request.flush(apiResponse);
  });

  it('uses the configured API v2 prefix exactly once', () => {
    service.getDashboard(stateId, yearId).subscribe();

    const request = httpMock.expectOne(expectedUrl);
    expect(request.request.url).toBe(expectedUrl);
    expect(request.request.url.split('/api/v2/').length - 1).toBe(1);
    request.flush(apiResponse);
  });

  it('does not add query parameters', () => {
    service.getDashboard(stateId, yearId).subscribe();

    const request = httpMock.expectOne(expectedUrl);
    expect(request.request.params.keys()).toEqual([]);
    expect(request.request.urlWithParams).toBe(expectedUrl);
    request.flush(apiResponse);
  });

  it('parses the success envelope', () => {
    let result: StateDashboardApiResponse | undefined;
    service.getDashboard(stateId, yearId).subscribe((response) => (result = response));

    httpMock.expectOne(expectedUrl).flush(apiResponse);
    expect(result).toEqual(apiResponse);
  });

  it('returns dashboard data unchanged', () => {
    let result: StateDashboardData | undefined;
    service.getDashboard(stateId, yearId).subscribe((response) => (result = response.data));

    httpMock.expectOne(expectedUrl).flush(apiResponse);
    expect(result).toEqual(apiResponse.data);
  });

  for (const status of [401, 403, 404, 500]) {
    it(`propagates HTTP ${status} without swallowing it`, () => {
      let result: HttpErrorResponse | undefined;
      service.getDashboard(stateId, yearId).subscribe({ error: (error: HttpErrorResponse) => (result = error) });

      httpMock.expectOne(expectedUrl).flush({ message: 'Safe API error' }, { status, statusText: 'Error' });
      expect(result?.status).toBe(status);
    });
  }

  it('does not transform the raw allocated amount', () => {
    let allocatedAmount: number | undefined;
    service
      .getDashboard(stateId, yearId)
      .subscribe((response) => (allocatedAmount = response.data.metrics.allocatedAmount));

    httpMock.expectOne(expectedUrl).flush(apiResponse);
    expect(allocatedAmount).toBe(15_620_000_000);
  });

  it('does not format amounts in the service', () => {
    let allocatedAmount: number | undefined;
    service
      .getDashboard(stateId, yearId)
      .subscribe((response) => (allocatedAmount = response.data.metrics.allocatedAmount));

    httpMock.expectOne(expectedUrl).flush(apiResponse);
    expect(typeof allocatedAmount).toBe('number');
  });

  it('does not subscribe internally', () => {
    const request$ = service.getDashboard(stateId, yearId);

    httpMock.expectNone(expectedUrl);
    request$.subscribe();
    const request = httpMock.expectOne(expectedUrl);
    expect(request.request.method).toBe('GET');
    request.flush(apiResponse);
  });
});

const dashboardData: StateDashboardData = {
  context: {
    stateId: '000000000000000000000001',
    stateName: 'Test State',
    yearId: '000000000000000000000002',
    financialYear: '2026-27',
    userRole: 'STATE',
    grantType: null,
  },
  metrics: {
    totalUlbs: 2,
    allocatedAmount: 15_620_000_000,
    claimedAmount: 0,
    amountUnit: 'RUPEE',
    currency: 'INR',
    compliance: { rate: 50, compliantUlbs: 1, totalUlbs: 2 },
  },
  stateDataTasks: [],
  ulbSubmissionSummary: [],
  formCompletion: [],
  claimLetters: [],
};

const apiResponse: StateDashboardApiResponse = {
  success: true,
  message: 'State dashboard fetched successfully',
  data: dashboardData,
  timestamp: '2026-07-14T10:00:00.000Z',
  requestId: 'req-test',
};
