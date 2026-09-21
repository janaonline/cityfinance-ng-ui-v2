import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { GtcService } from './gtc.service';
import { GtcApiResponse, GtcDraftPayload, GtcFinalSubmitPayload, GtcFormData, GtcSubmitResponse, GtcTemplateResponse } from './gtc.models';

const BASE_URL = environment.api.url2;

const minimalFormData: GtcFormData = {
  _id: 'test-id',
  formName: 'Grant Transfer Certificate',
  formId: 35,
  stateName: 'Test State',
  stateId: 'state-1',
  yearId: 'year-1',
  installment: 1,
  currentFormStatus: 1,
  currentFormStatusLabel: 'Not Started',
  questions: [],
  permissions: { canView: true, canEdit: true, canFinalSubmit: false },
  actors: [],
  instructions: [],
};

describe('GtcService', () => {
  let service: GtcService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GtcService],
    });
    service = TestBed.inject(GtcService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── getGtcForm ────────────────────────────────────────────────────────────

  describe('getGtcForm', () => {
    const stateId = 'state-1';
    const yearId = 'year-1';
    const url = `${BASE_URL}xvi-fc/state/gtc/${stateId}/${yearId}/1`;

    it('emits form data when the response has success:true', () => {
      const successBody: GtcApiResponse = {
        success: true,
        message: 'OK',
        data: minimalFormData,
        timestamp: '2026-01-01T00:00:00.000Z',
      };

      let result: GtcFormData | undefined;
      service.getGtcForm(stateId, yearId, 1).subscribe({ next: (data) => (result = data) });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(successBody);

      expect(result).toEqual(minimalFormData);
    });

    it('throws the original response object (not a synthetic Error) when response has success:false', () => {
      const errorBody: GtcApiResponse = {
        success: false,
        message: 'Unauthorized',
        data: null as unknown as GtcFormData,
        timestamp: '2026-01-01T00:00:00.000Z',
      };

      let caughtError: unknown;
      service.getGtcForm(stateId, yearId, 1).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
      expect((caughtError as GtcApiResponse).message).toBe('Unauthorized');
    });

    it('folds the installment into the request URL', () => {
      service.getGtcForm(stateId, yearId, 2).subscribe();
      const req = httpMock.expectOne(`${BASE_URL}xvi-fc/state/gtc/${stateId}/${yearId}/2`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'OK', data: { ...minimalFormData, installment: 2 }, timestamp: '' });
    });
  });

  // ─── saveGtcDraft ──────────────────────────────────────────────────────────

  describe('saveGtcDraft', () => {
    const url = `${BASE_URL}xvi-fc/state/gtc/save-draft`;
    const payload: GtcDraftPayload = { stateId: 'state-1', yearId: 'year-1', installment: 1, data: {} };

    it('emits response data when the response has success:true', () => {
      const successBody: GtcSubmitResponse = {
        success: true,
        message: 'Draft saved.',
        data: { currentFormStatus: 2, currentFormStatusLabel: 'Draft Saved' },
      };

      let result: unknown;
      service.saveGtcDraft(payload).subscribe({ next: (data) => (result = data) });

      httpMock.expectOne(url).flush(successBody);

      expect(result).toEqual({ currentFormStatus: 2, currentFormStatusLabel: 'Draft Saved' });
    });

    it('throws the original response object when response has success:false', () => {
      const errorBody: GtcSubmitResponse = {
        success: false,
        message: 'Validation failed.',
        errors: { transferDate: [{ field: 'transferDate', message: 'Required.', code: 'required' }] },
      };

      let caughtError: unknown;
      service.saveGtcDraft(payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
      expect((caughtError as GtcSubmitResponse).message).toBe('Validation failed.');
    });
  });

  // ─── finalSubmitGtc ────────────────────────────────────────────────────────

  describe('finalSubmitGtc', () => {
    const url = `${BASE_URL}xvi-fc/state/gtc/final-submit`;
    const payload: GtcFinalSubmitPayload = { stateId: 'state-1', yearId: 'year-1', installment: 1, data: {} };

    it('emits response data when the response has success:true', () => {
      const successBody: GtcSubmitResponse = {
        success: true,
        message: 'Submitted.',
        data: { currentFormStatus: 3, currentFormStatusLabel: 'Submitted' },
      };

      let result: unknown;
      service.finalSubmitGtc(payload).subscribe({ next: (data) => (result = data) });

      httpMock.expectOne(url).flush(successBody);

      expect(result).toEqual({ currentFormStatus: 3, currentFormStatusLabel: 'Submitted' });
    });

    it('throws the original response object when response has success:false', () => {
      const errorBody: GtcSubmitResponse = { success: false, message: 'Not allowed.' };

      let caughtError: unknown;
      service.finalSubmitGtc(payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
      expect((caughtError as GtcSubmitResponse).message).toBe('Not allowed.');
    });
  });

  // ─── getGtcTemplate ────────────────────────────────────────────────────────

  describe('getGtcTemplate', () => {
    const stateId = 'state-1';
    const yearId = 'year-1';
    const url = `${BASE_URL}xvi-fc/state/gtc/${stateId}/${yearId}/1/gtc-template`;

    it('emits the signed template URL when the response has success:true', () => {
      const successBody: GtcTemplateResponse = {
        success: true,
        message: 'OK',
        data: { fileName: 'GTC-Template.docx', mimeType: 'application/msword', url: 'https://signed-url' },
        timestamp: '2026-01-01T00:00:00.000Z',
      };

      let result: unknown;
      service.getGtcTemplate(stateId, yearId, 1).subscribe({ next: (data) => (result = data) });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(successBody);

      expect(result).toEqual(successBody.data);
    });

    it('throws the original response object when the template is not configured', () => {
      const errorBody = { success: false, message: 'The download template is not configured.' };

      let caughtError: unknown;
      service.getGtcTemplate(stateId, yearId, 1).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toEqual(errorBody);
    });
  });
});
