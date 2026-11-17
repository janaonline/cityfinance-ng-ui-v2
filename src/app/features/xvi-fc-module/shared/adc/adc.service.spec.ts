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

  it('members() reads an ADC\'s active members', () => {
    service.members('a1').subscribe();
    const req = httpMock.expectOne(`${base}/a1/members`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
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
