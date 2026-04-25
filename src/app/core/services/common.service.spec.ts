import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
import { USER_TYPE } from '../models/user/userType';
import { UtilityService } from './utility.service';
import { CommonService } from './common.service';

describe('CommonService', () => {
  let service: CommonService;
  let httpMock: HttpTestingController;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let utilitySpy: jasmine.SpyObj<UtilityService>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    utilitySpy = jasmine.createSpyObj('UtilityService', ['swalPopup']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CommonService,
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: UtilityService, useValue: utilitySpy },
        { provide: DomSanitizer, useValue: {} },
      ],
    });

    service = TestBed.inject(CommonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('emits parsed visualization counts only when a value is provided', () => {
    const values: any[] = [];
    service.dataForVisualizationCount.subscribe((value) => values.push(value));

    service.setDataForVisualizationCount('12,345.6');
    service.setDataForVisualizationCount('');

    expect(values).toEqual(['', 12345.6]);
  });

  it('maps website visit count responses to the data value with a zero fallback', () => {
    const received: any[] = [];

    service.getWebsiteVisitCount().subscribe((count) => received.push(count));
    httpMock.expectOne(`${environment.api.url}visit_count`).flush({ data: 25 });

    service.getWebsiteVisitCount().subscribe((count) => received.push(count));
    httpMock.expectOne(`${environment.api.url}visit_count`).flush({});

    expect(received).toEqual([25, 0]);
  });

  it('verifies a ULB code and name without calling the API for blank input', (done) => {
    service.verifyULBCodeAndName({ code: ' ', name: 'Bengaluru' }).subscribe((result) => {
      expect(result).toEqual({ isValid: false, ulb: null });
      done();
    });
  });

  it('verifies a ULB code and name against the returned ULB', () => {
    const results: any[] = [];

    service.verifyULBCodeAndName({ code: '123', name: 'City A' }).subscribe((result) => {
      results.push(result);
    });

    httpMock
      .expectOne(`${environment.api.url}ulb-by-code?code=123`)
      .flush({ data: { code: '123', name: 'City A' } });

    service.verifyULBCodeAndName({ code: '123', name: 'Wrong Name' }).subscribe((result) => {
      results.push(result);
    });

    httpMock
      .expectOne(`${environment.api.url}ulb-by-code?code=123`)
      .flush({ data: { code: '123', name: 'City A' } });

    expect(results).toEqual([
      { isValid: true, ulb: { code: '123', name: 'City A' } },
      { isValid: false, ulb: { code: '123', name: 'City A' } },
    ]);
  });

  it('builds ULB list query params while trimming filters and applying registration role', () => {
    service
      .fetchULBList(
        {
          registration: 'Yes',
          name: '  Mysuru  ',
          skip: '10',
          limit: '20',
        },
        { name: 1 },
      )
      .subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === `${environment.api.url}xv-fc-form/fc-grant/ulbList`,
    );
    const filter = JSON.parse(req.request.params.get('filter') || '{}');

    expect(req.request.method).toBe('GET');
    expect(filter).toEqual({ registration: 'Yes', name: 'Mysuru', role: USER_TYPE.ULB });
    expect(req.request.params.get('skip')).toBe('10');
    expect(req.request.params.get('limit')).toBe('20');
    expect(JSON.parse(req.request.params.get('sort') || '{}')).toEqual({ name: 1 });
  });

  it('returns a CSV ULB list API URL with object params stringified', () => {
    const url = service.getULBListApi({
      registration: 'Yes',
      state: { id: 'state-1' } as any,
      skip: 0,
      limit: 50,
    });

    expect(url).toContain(`${environment.api.url}xv-fc-form/fc-grant/ulbList?`);
    expect(url).toContain('csv=true');
    expect(url).toContain(`role=${encodeURIComponent(USER_TYPE.ULB)}`);
    expect(new URL(url).searchParams.get('state')).toBe(JSON.stringify({ id: 'state-1' }));
    expect(url).not.toContain('skip=');
    expect(url).not.toContain('limit=');
  });

  it('aggregates ULB statistics by state, unique ULB, year, and AMRUT status', () => {
    const result = service.getCount([
      {
        state: { _id: 's1', name: 'State One', code: 'S1' },
        ulb: { code: 'u1', amrut: 'Yes' },
        financialYear: '2022-23',
      },
      {
        state: { _id: 's1', name: 'State One', code: 'S1' },
        ulb: { code: 'u1', amrut: 'No' },
        financialYear: '2022-23',
      },
      {
        state: { _id: 's1', name: 'State One', code: 'S1' },
        ulb: { code: 'u2' },
        financialYear: '2023-24',
      },
      {
        state: { _id: '', name: 'Ignored', code: 'NA' },
        ulb: { code: 'ignored' },
        financialYear: '2023-24',
      },
    ] as any);

    expect(result['s1'].totalULBS.length).toBe(3);
    expect(result['s1'].uniqueULBS.map((ulb: any) => ulb.ulb.code)).toEqual(['u1', 'u2']);
    expect(result['s1'].ulbsByYears['2022-23']).toEqual({ total: 2, amrut: 1, nonAmrut: 1 });
    expect(result['s1'].ulbsByYears['2023-24']).toEqual({ total: 1, amrut: 0, nonAmrut: 1 });
  });

  it('sorts state and ULB responses by name', () => {
    service.getStateUlbCovered({ year: ['2023-24'] }).subscribe((res: any) => {
      expect(res.data.map((state: any) => state.name)).toEqual(['Alpha', 'Zulu']);
    });

    httpMock.expectOne(`${environment.api.url}states-with-ulb-count`).flush({
      data: [{ name: 'Zulu' }, { name: 'Alpha' }],
    });

    service.getULBSWithPopulationAndCoordinates({ year: ['2023-24'] }).subscribe((res: any) => {
      expect(res.data.map((ulb: any) => ulb.name)).toEqual(['A City', 'B City']);
    });

    httpMock.expectOne(`${environment.api.url}ulb-list`).flush({
      data: [{ name: 'B City' }, { name: 'A City' }],
    });
  });

  it('builds HttpParams from truthy values and preserves zero', () => {
    const params = service.getHttpClientParams({ state: 'KA', page: 0, empty: '', nil: null });

    expect(params.get('state')).toBe('KA');
    expect(params.get('page')).toBe('0');
    expect(params.has('empty')).toBeFalse();
    expect(params.has('nil')).toBeFalse();
  });

  it('handles utility formatting and array helpers', () => {
    expect(service.getUniqueArrayByKey([{ id: 1 }, { id: 1 }, { id: 2 }] as any, 'id') as any).toEqual([
      1,
      2,
    ]);
    expect(service.getUniqueArrayByKey('not-array' as any, 'id')).toEqual([]);
    expect(service.formatNumber(1234567)).toBe('12,34,567');
    expect(service.changeCountFormat(26000000, 'croreBarChartOptions')).toBe(3);
    expect(service.changeCountFormat(260000, 'lakhBarChartOptions')).toBe(3);
    expect(service.changeCountFormat(2.6)).toBe(3);
    expect(service.toTitleCase('city FINANCE portal')).toBe('City Finance Portal');
  });

  it('creates and decodes embed/query helper values', () => {
    spyOn(console, 'log');

    const url = service.createEmbedUrl({ state: 'KA', year: '2023-24' }, 'dashboard');
    expect(url).toBe(`${window.location.origin}/dashboard?widgetMode=true&state=KA&year=2023-24`);

    expect(service.decodeIframeUrl(btoa('state=KA'))).toBe('state=KA');
    expect(service.paramsToObject('state=KA&year=2023-24')).toEqual({
      state: 'KA',
      year: '2023-24',
    });
  });

  it('shows snackbar messages and copies values to the clipboard', () => {
    spyOn(document, 'execCommand').and.returnValue(true);

    service.copyToClipboard('copy-me', 'Copied');

    expect(snackBarSpy.open).toHaveBeenCalledWith('Copied', '', {
      duration: 1500,
      verticalPosition: 'bottom',
    });
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('warns when city details are requested without a ULB id', () => {
    service.getCityData('').subscribe();

    expect(utilitySpy.swalPopup).toHaveBeenCalledWith('Error', 'ULB Id is mandatory!', 'error');
    httpMock.expectOne(`${environment.api.url}dashboard/city/city-details?ulbId=`);
  });
});
