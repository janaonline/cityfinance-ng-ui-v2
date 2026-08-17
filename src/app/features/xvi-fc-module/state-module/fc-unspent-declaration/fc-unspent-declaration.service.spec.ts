import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { FcUnspentDeclarationService } from './fc-unspent-declaration.service';
import {
  FcUnspentApiResponse,
  FcUnspentDeclarationData,
  FcUnspentUlbOption,
} from './fc-unspent-declaration.models';

const BASE_URL = `${environment.api.url2}xvi-fc/state/fc-unspent-declaration/`;

const minimalFormData: FcUnspentDeclarationData = {
  stateName: 'Test State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: 1,
  permissions: { canView: true, canEdit: true, canSaveDraft: true, canFinalSubmit: false },
  dependency: {
    devolutionStatus: null,
    devolutionDatasetExists: false,
    editableDueToDevolutionReturn: false,
    blockingMessage: null,
  },
  actors: [],
  questions: [],
  unspentUlbData: [],
};

const sampleUlbOptions: FcUnspentUlbOption[] = [
  { ulbId: 'ulb-1', censusCode: '800123', sbCode: null, ulbName: 'Sample ULB', allocationAmount: 20 },
];

describe('FcUnspentDeclarationService', () => {
  let service: FcUnspentDeclarationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FcUnspentDeclarationService],
    });
    service = TestBed.inject(FcUnspentDeclarationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── getForm ────────────────────────────────────────────────────────────────

  describe('getForm', () => {
    const stateId = 'state-1';
    const yearId = 'year-1';
    const url = `${BASE_URL}${stateId}/${yearId}`;

    it('calls the exact GET URL and emits the response data on success', () => {
      const successBody: FcUnspentApiResponse<FcUnspentDeclarationData> = {
        success: true,
        message: 'OK',
        data: minimalFormData,
      };

      let result: FcUnspentDeclarationData | undefined;
      service.getForm(stateId, yearId).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(successBody);

      expect(result).toEqual(minimalFormData);
    });

    it('throws the original response object (not a synthetic Error) when success:false', () => {
      const errorBody: FcUnspentApiResponse<FcUnspentDeclarationData> = { success: false, message: 'Forbidden' };

      let caughtError: unknown;
      service.getForm(stateId, yearId).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  // ─── getUlbOptions ──────────────────────────────────────────────────────────

  describe('getUlbOptions', () => {
    const stateId = 'state-1';
    const yearId = 'year-1';
    const baseUrl = `${BASE_URL}${stateId}/${yearId}/ulb-options`;

    it('calls the exact URL with no query params when the query is empty', () => {
      service.getUlbOptions(stateId, yearId, {}).subscribe();

      const req = httpMock.expectOne((r) => r.url === baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ success: true, message: 'OK', data: [], meta: { page: 1, limit: 20, total: 0 } });
    });

    it('sends search/page/limit as query params', () => {
      service.getUlbOptions(stateId, yearId, { search: 'nagar', page: 2, limit: 50 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === baseUrl);
      expect(req.request.params.get('search')).toBe('nagar');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('50');
      req.flush({ success: true, message: 'OK', data: [], meta: { page: 2, limit: 50, total: 0 } });
    });

    it('resolves options + pagination meta on success', () => {
      let result: { options: FcUnspentUlbOption[]; page: number; limit: number; total: number } | undefined;
      service.getUlbOptions(stateId, yearId, {}).subscribe((r) => (result = r));

      httpMock
        .expectOne((r) => r.url === baseUrl)
        .flush({ success: true, message: 'OK', data: sampleUlbOptions, meta: { page: 1, limit: 20, total: 1 } });

      expect(result).toEqual({ options: sampleUlbOptions, page: 1, limit: 20, total: 1 });
    });

    it('throws the original response object when success:false', () => {
      const errorBody: FcUnspentApiResponse<FcUnspentUlbOption[]> = { success: false, message: 'Forbidden' };

      let caughtError: unknown;
      service.getUlbOptions(stateId, yearId, {}).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne((r) => r.url === baseUrl).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  // ─── downloadDeclarationDocument ────────────────────────────────────────────

  describe('downloadDeclarationDocument', () => {
    const stateId = 'state-1';
    const yearId = 'year-1';
    const url = `${BASE_URL}${stateId}/${yearId}/fc-unspent-declaration-document`;

    it('calls the exact GET URL and emits the raw blob on success', () => {
      const blob = new Blob(['docx content']);

      let result: Blob | undefined;
      service.downloadDeclarationDocument(stateId, yearId).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);

      expect(result).toEqual(blob);
    });

    it('requests a Blob response, not the JSON envelope the old static-template endpoint used', () => {
      service.downloadDeclarationDocument(stateId, yearId).subscribe();

      const requests = httpMock.match(() => true);
      expect(requests.length).toBe(1);
      expect(requests[0].request.url).toBe(url);
      expect(requests[0].request.responseType).toBe('blob');
      requests[0].flush(new Blob());
    });
  });

  // ─── saveDraft ──────────────────────────────────────────────────────────────

  describe('saveDraft', () => {
    const url = `${BASE_URL}save-draft`;
    const payload = { stateId: 'state-1', yearId: 'year-1', data: { isFcUnspent: null } };

    it('posts the exact URL and body, resolving on success', () => {
      let completed = false;
      service.saveDraft(payload).subscribe(() => (completed = true));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ success: true, message: 'Saved.' });

      expect(completed).toBeTrue();
    });

    it('throws the original response object (with field-keyed errors) when success:false', () => {
      const errorBody: FcUnspentApiResponse = {
        success: false,
        message: 'Validation failed.',
        errors: { isFcUnspent: [{ field: 'isFcUnspent', message: 'Required.', code: 'required' }] },
      };

      let caughtError: unknown;
      service.saveDraft(payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  // ─── finalSubmit ────────────────────────────────────────────────────────────

  describe('finalSubmit', () => {
    const url = `${BASE_URL}final-submit`;
    const payload = { stateId: 'state-1', yearId: 'year-1', data: { isFcUnspent: true, checkboxConfirmation: true } };

    it('posts the exact URL and body, resolving on success', () => {
      let completed = false;
      service.finalSubmit(payload).subscribe(() => (completed = true));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ success: true, message: 'Submitted.' });

      expect(completed).toBeTrue();
    });

    it('throws the original response object when success:false', () => {
      const errorBody: FcUnspentApiResponse = { success: false, message: 'Blocked.' };

      let caughtError: unknown;
      service.finalSubmit(payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });
});
