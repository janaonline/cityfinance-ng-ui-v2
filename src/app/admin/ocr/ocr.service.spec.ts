/**
 * Scope: only the DUR (Utilisation Report) validation methods added to OcrService.
 * OcrService also hosts OCR/auditor-report/eval methods with their own history —
 * those are intentionally out of scope here.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { IULB } from '../../core/models/ulb';
import { OcrService } from './ocr.service';

const BASE_URL = environment.api.url3;

function makeUlb(overrides: Partial<IULB> = {}): IULB {
  return {
    amrut: 'No',
    _id: 'ulb-1',
    area: 10,
    code: 'ULB1',
    name: 'Karad Municipal Council',
    natureOfUlb: 'Municipality',
    population: 100000,
    type: 'Municipality' as IULB['type'],
    wards: 10,
    state: 'Maharashtra',
    financialYear: '2026-27',
    ...overrides,
  };
}

describe('OcrService — DUR validation API', () => {
  let service: OcrService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(OcrService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('submitDurValidationJob', () => {
    it('posts a multipart form with the file and ULB alias key built from name|slug|keywords', () => {
      const file = new File(['%PDF-1.4'], 'dur.pdf', { type: 'application/pdf' });
      const ulb = makeUlb({ slug: 'karad-mc', keywords: 'karad municipal' });

      service.submitDurValidationJob(file, ulb, '2026-27', 'gemini-3.1-pro-preview').subscribe();

      const req = httpMock.expectOne(`${BASE_URL}dur-validation/jobs`);
      expect(req.request.method).toBe('POST');
      const body = req.request.body as FormData;
      expect(body.get('file')).toBe(file);
      expect(body.get('ulb_name')).toBe('Karad Municipal Council|karad-mc|karad municipal');
      expect(body.get('financial_year')).toBe('2026-27');
      expect(body.get('model')).toBe('gemini-3.1-pro-preview');
      req.flush({ job_id: 'job-1', status: 'queued', message: 'queued' });
    });

    it('omits optional fields entirely when not provided', () => {
      const file = new File(['%PDF-1.4'], 'dur.pdf', { type: 'application/pdf' });

      service.submitDurValidationJob(file, null, null, null).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}dur-validation/jobs`);
      const body = req.request.body as FormData;
      expect(body.has('ulb_name')).toBeFalse();
      expect(body.has('financial_year')).toBeFalse();
      expect(body.has('model')).toBeFalse();
      req.flush({ job_id: 'job-1', status: 'queued', message: 'queued' });
    });

    it('sends a free-typed ULB string as-is', () => {
      const file = new File(['%PDF-1.4'], 'dur.pdf', { type: 'application/pdf' });

      service.submitDurValidationJob(file, '  Some ULB  ', null, null).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}dur-validation/jobs`);
      const body = req.request.body as FormData;
      expect(body.get('ulb_name')).toBe('Some ULB');
      req.flush({ job_id: 'job-1', status: 'queued', message: 'queued' });
    });
  });

  it('getDurJobStatus() GETs the job status endpoint', () => {
    service.getDurJobStatus('job-1').subscribe();

    const req = httpMock.expectOne(`${BASE_URL}dur-validation/jobs/job-1/status`);
    expect(req.request.method).toBe('GET');
    req.flush({ job_id: 'job-1', status: 'processing', filename: 'dur.pdf', model: 'x', message: 'x' });
  });

  it('getDurJobResult() GETs the job result endpoint', () => {
    service.getDurJobResult('job-1').subscribe();

    const req = httpMock.expectOne(`${BASE_URL}dur-validation/jobs/job-1/result`);
    expect(req.request.method).toBe('GET');
    req.flush({ job_id: 'job-1', status: 'completed', filename: 'dur.pdf', result: null, message: 'x' });
  });

  describe('listDurValidationJobs', () => {
    it('sends only the filters that were provided', () => {
      service
        .listDurValidationJobs({ status: 'failed', ulb_name: 'Karad', skip: 20, limit: 10, sort_order: 'asc' })
        .subscribe();

      // The list endpoint always carries query params, so match on `req.url` (path only) —
      // `expectOne(string)` compares against the full url+query string and would never match.
      const req = httpMock.expectOne((r) => r.url === `${BASE_URL}dur-validation/jobs`);
      expect(req.request.params.get('status')).toBe('failed');
      expect(req.request.params.get('ulb_name')).toBe('Karad');
      expect(req.request.params.get('skip')).toBe('20');
      expect(req.request.params.get('limit')).toBe('10');
      expect(req.request.params.get('sort_order')).toBe('asc');
      expect(req.request.params.has('filename')).toBeFalse();
      req.flush({ jobs: [], total: 0, skip: 20, limit: 10, total_pages: 0 });
    });

    it('sends no params at all when called with no filters', () => {
      service.listDurValidationJobs().subscribe();

      const req = httpMock.expectOne(`${BASE_URL}dur-validation/jobs`);
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ jobs: [], total: 0, skip: 0, limit: 50, total_pages: 0 });
    });
  });
});
