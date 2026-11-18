import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { AdcService, IAdcPage } from './adc.service';

describe('AdcService', () => {
  let service: AdcService;
  let httpMock: HttpTestingController;
  const base = `${environment.api.url2}master/adc`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AdcService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() keeps calling the picker endpoint, with an optional stateId', () => {
    service.list('s1').subscribe();
    const req = httpMock.expectOne((r) => r.url === base);
    expect(req.request.params.get('stateId')).toBe('s1');
    req.flush({ data: [] });
  });

  it('manage() sends page, limit and only the filters that are set, and unwraps the page', () => {
    const page: IAdcPage = { data: [], total: 0, page: 2, limit: 20, totalPages: 0 };
    let result: IAdcPage | undefined;
    service.manage({ page: 2, limit: 20, search: 'bodo' }).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${base}/manage`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('search')).toBe('bodo');
    expect(req.request.params.has('stateId')).toBeFalse();
    req.flush({ success: true, data: page });

    expect(result).toEqual(page);
  });

  it('manage() sends the Admin status and sort', () => {
    service.manage({ page: 1, limit: 10, adminStatus: 'INVITED', sortBy: 'ulbCount', sortDir: -1 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/manage`);
    expect(req.request.params.get('adminStatus')).toBe('INVITED');
    expect(req.request.params.get('sortBy')).toBe('ulbCount');
    expect(req.request.params.get('sortDir')).toBe('-1');
    req.flush({ data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 } });
  });

  it('detail() unwraps the ADC header', () => {
    let name: string | undefined;
    service.detail('a1').subscribe((d) => (name = d.name));
    const req = httpMock.expectOne(`${base}/a1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { _id: 'a1', name: 'Bodoland' } });
    expect(name).toBe('Bodoland');
  });

  it("members() pages an ADC's members with its filters, including false flags", () => {
    service.members('a1', { page: 1, limit: 20, status: 'ACTIVE', excludeAdmin: true, search: 'das' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/a1/members`);
    expect(req.request.params.get('status')).toBe('ACTIVE');
    expect(req.request.params.get('excludeAdmin')).toBe('true');
    expect(req.request.params.get('search')).toBe('das');
    expect(req.request.params.has('level')).toBeFalse();
    req.flush({ data: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 } });

    service.ulbs('a1', { page: 2, limit: 10, isActive: false, approvalStatus: 'PENDING', sortBy: 'code' }).subscribe();
    const ulbs = httpMock.expectOne((r) => r.url === `${base}/a1/ulbs`);
    expect(ulbs.request.params.get('isActive')).toBe('false');
    expect(ulbs.request.params.get('approvalStatus')).toBe('PENDING');
    expect(ulbs.request.params.get('sortBy')).toBe('code');
    expect(ulbs.request.params.get('page')).toBe('2');
    ulbs.flush({ data: { data: [], total: 0, page: 2, limit: 10, totalPages: 0 } });
  });

  it('create, rename, setAdmin and remove hit the matching routes', () => {
    const admin = { name: 'A', email: 'a@x.gov.in', mobile: '9876543210', designation: 'Officer' };

    service.create({ stateId: 's1', name: 'Bodoland', admin }).subscribe();
    const create = httpMock.expectOne(base);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ stateId: 's1', name: 'Bodoland', admin });
    create.flush({});

    service.rename('a1', 'New name').subscribe();
    const rename = httpMock.expectOne(`${base}/a1`);
    expect(rename.request.method).toBe('PATCH');
    expect(rename.request.body).toEqual({ name: 'New name' });
    rename.flush({});

    service.setAdmin('a1', { mode: 'promote', userId: 'u2' }).subscribe();
    const setAdmin = httpMock.expectOne(`${base}/a1/admin`);
    expect(setAdmin.request.method).toBe('PUT');
    expect(setAdmin.request.body).toEqual({ mode: 'promote', userId: 'u2' });
    setAdmin.flush({});

    service.remove('a1').subscribe();
    const remove = httpMock.expectOne(`${base}/a1`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush({});
  });
});
