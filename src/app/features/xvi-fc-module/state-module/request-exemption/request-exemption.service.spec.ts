import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { RequestExemptionService } from './request-exemption.service';
import { RequestExemptionReasonOption } from './request-exemption.models';

const BASE_URL = `${environment.api.url2}xvi-fc/state/request-exemption/`;

describe('RequestExemptionService', () => {
  let service: RequestExemptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(RequestExemptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // Never hardcode this list on the frontend - the real set of reasons is per-year `formjsons`
  // data, so it's always fetched from the backend rather than compiled in.
  it('getReasonOptions() fetches this year\'s reason options from the backend', () => {
    let result: RequestExemptionReasonOption[] | undefined;
    service.getReasonOptions('state-1', 'year-1').subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${BASE_URL}state-1/year-1/reason-options`);
    expect(req.request.method).toBe('GET');

    const options: RequestExemptionReasonOption[] = [
      { id: 23, label: 'Election / duly constituted ULB exemption' },
      { id: 30, label: 'Audited Financial Statement' },
      { id: 31, label: 'Provisional Financial Statement' },
    ];
    req.flush({ success: true, message: 'ok', data: options });

    expect(result).toEqual(options);
  });
});
