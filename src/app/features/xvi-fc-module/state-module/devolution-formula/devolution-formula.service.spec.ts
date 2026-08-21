import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { DevolutionFormulaService } from './devolution-formula.service';
import { DevolutionFormResponseData, SaveDraftDevolutionPayload, XviFcApiResponse } from './devolution-formula.models';

const BASE_URL = `${environment.api.url2}xvi-fc/state/devolution-formula/`;

const minimalFormData: DevolutionFormResponseData = {
  _id: 'form-1',
  formName: 'ULB-wise Allocation',
  stateId: 'state-1',
  yearId: 'year-1',
  installment: 1,
  stateName: 'Test State',
  currentFormStatus: 1,
  currentFormStatusLabel: 'Not Started',
  questions: [],
  permissions: { canView: true, canEdit: true, canFinalSubmit: false },
};

describe('DevolutionFormulaService', () => {
  let service: DevolutionFormulaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DevolutionFormulaService],
    });
    service = TestBed.inject(DevolutionFormulaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── getForm ──────────────────────────────────────────────────────────────

  describe('getForm', () => {
    const stateId = 'state-1';
    const yearId = 'year-1';
    const installment = 1 as const;
    const url = `${BASE_URL}${stateId}/${yearId}/${installment}`;

    it('emits unwrapped form data when the response has success:true', () => {
      const successBody: XviFcApiResponse<DevolutionFormResponseData> = {
        success: true,
        data: minimalFormData,
        timestamp: '2026-01-01T00:00:00.000Z',
      };

      let result: DevolutionFormResponseData | undefined;
      service.getForm(stateId, yearId, installment).subscribe({ next: (data) => (result = data) });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(successBody);

      expect(result).toEqual(minimalFormData);
    });

    it('throws the original response object (not a synthetic Error) when response has success:false', () => {
      const errorBody = { success: false, data: null, timestamp: '2026-01-01T00:00:00.000Z' };

      let caughtError: unknown;
      service.getForm(stateId, yearId, installment).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
      expect((caughtError as { success: boolean }).success).toBeFalse();
    });
  });

  // ─── saveDraft ────────────────────────────────────────────────────────────

  describe('saveDraft', () => {
    const url = `${BASE_URL}save-draft`;
    const payload: SaveDraftDevolutionPayload = {
      stateId: 'state-1',
      yearId: 'year-1',
      installment: 1,
    };

    it('emits void when the response has success:true', () => {
      let emitted = false;
      service.saveDraft(payload).subscribe({ next: () => (emitted = true) });

      httpMock.expectOne(url).flush({ success: true, data: {}, timestamp: '' });

      expect(emitted).toBeTrue();
    });

    it('throws the original response object when response has success:false', () => {
      const errorBody = { success: false, message: 'Validation failed.' };

      let caughtError: unknown;
      service.saveDraft(payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  // ─── downloadTemplate ─────────────────────────────────────────────────────

  describe('downloadTemplate', () => {
    it('requests a blob and does not check success', () => {
      const stateId = 'state-1';
      const yearId = 'year-1';
      const installment = 1 as const;
      const url = `${BASE_URL}${stateId}/${yearId}/${installment}/template`;

      let result: { blob: Blob; fileName: unknown } | undefined;
      service.downloadTemplate(stateId, yearId, installment).subscribe({ next: (data) => (result = data) });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob(['data']));

      expect(result?.blob).toBeInstanceOf(Blob);
    });

    it('parses the backend Content-Disposition filename', () => {
      const stateId = 'state-1';
      const yearId = 'year-1';
      const installment = 1 as const;
      const url = `${BASE_URL}${stateId}/${yearId}/${installment}/template`;

      let result: { blob: Blob; fileName: string | null } | undefined;
      service.downloadTemplate(stateId, yearId, installment).subscribe({ next: (data) => (result = data) });

      httpMock.expectOne(url).flush(new Blob(['data']), {
        headers: { 'Content-Disposition': 'attachment; filename="ulb-wise-allocation-template_2026-08-14.xlsx"' },
      });

      expect(result?.fileName).toEqual('ulb-wise-allocation-template_2026-08-14.xlsx');
    });
  });

  // ─── downloadErrorSheet ───────────────────────────────────────────────────

  describe('downloadErrorSheet', () => {
    it('requests a blob and does not check success', () => {
      const stateId = 'state-1';
      const yearId = 'year-1';
      const installment = 1 as const;
      const url = `${BASE_URL}${stateId}/${yearId}/${installment}/error-sheet`;

      let result: { blob: Blob; fileName: unknown } | undefined;
      service.downloadErrorSheet(stateId, yearId, installment).subscribe({ next: (data) => (result = data) });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob(['errors']));

      expect(result?.blob).toBeInstanceOf(Blob);
    });
  });
});
