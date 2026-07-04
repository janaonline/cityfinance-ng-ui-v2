import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { SfcStatusService } from './sfc-status.service';
import {
  SfcStatusApiResponse,
  SfcStatusDraftPayload,
  SfcStatusFinalSubmitPayload,
  SfcStatusFormData,
  SfcStatusSubmitResponse,
} from './sfc-status.models';

const BASE_URL = environment.api.url2;

const minimalFormData: SfcStatusFormData = {
  _id: 'test-id',
  formKey: 'sfc-status',
  formName: 'SFC Status',
  formType: 'state',
  stateId: 'state-1',
  yearId: 'year-1',
  stateName: 'Test State',
  actors: [],
  currentFormStatus: 1,
  currentFormStatusLabel: 'Not Started',
  questions: [],
  permissions: { canView: true, canEdit: true, canFinalSubmit: false },
  instructions: [],
  meta: { version: 1 },
};

describe('SfcStatusService', () => {
  let service: SfcStatusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SfcStatusService],
    });
    service = TestBed.inject(SfcStatusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── getSfcStatusForm ──────────────────────────────────────────────────────

  describe('getSfcStatusForm', () => {
    const stateId = 'state-1';
    const yearId = 'year-1';
    const url = `${BASE_URL}xvi-fc/state/sfc-status/${stateId}/${yearId}`;

    it('emits form data when the response has success:true', () => {
      const successBody: SfcStatusApiResponse = {
        success: true,
        message: 'OK',
        data: minimalFormData,
        timestamp: '2026-01-01T00:00:00.000Z',
      };

      let result: SfcStatusFormData | undefined;
      service.getSfcStatusForm(stateId, yearId).subscribe({ next: (data) => (result = data) });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(successBody);

      expect(result).toEqual(minimalFormData);
    });

    it('throws the original response object (not a synthetic Error) when response has success:false', () => {
      const errorBody: SfcStatusApiResponse = {
        success: false,
        message: 'Unauthorized',
        data: null as unknown as SfcStatusFormData,
        timestamp: '2026-01-01T00:00:00.000Z',
      };

      let caughtError: unknown;
      service.getSfcStatusForm(stateId, yearId).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      // Must be the exact same object reference — not a wrapped Error
      expect(caughtError).toBe(errorBody);
      expect((caughtError as SfcStatusApiResponse).success).toBeFalse();
      expect((caughtError as SfcStatusApiResponse).message).toBe('Unauthorized');
    });
  });

  // ─── saveSfcStatusDraft ────────────────────────────────────────────────────

  describe('saveSfcStatusDraft', () => {
    const url = `${BASE_URL}xvi-fc/state/sfc-status/save-draft`;
    const payload: SfcStatusDraftPayload = { stateId: 'state-1', yearId: 'year-1', data: {} };

    it('emits response data when the response has success:true', () => {
      const successBody: SfcStatusSubmitResponse = {
        success: true,
        message: 'Draft saved.',
        data: { currentFormStatus: 2, currentFormStatusLabel: 'Draft Saved' },
      };

      let result: unknown;
      service.saveSfcStatusDraft(payload).subscribe({ next: (data) => (result = data) });

      httpMock.expectOne(url).flush(successBody);

      expect(result).toEqual({ currentFormStatus: 2, currentFormStatusLabel: 'Draft Saved' });
    });

    it('throws the original response object when response has success:false', () => {
      const errorBody: SfcStatusSubmitResponse = {
        success: false,
        message: 'Validation failed.',
        errors: { fieldA: [{ field: 'fieldA', message: 'Required.', code: 'required' }] },
      };

      let caughtError: unknown;
      service.saveSfcStatusDraft(payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
      expect((caughtError as SfcStatusSubmitResponse).message).toBe('Validation failed.');
    });
  });

  // ─── finalSubmitSfcStatus ─────────────────────────────────────────────────

  describe('finalSubmitSfcStatus', () => {
    const url = `${BASE_URL}xvi-fc/state/sfc-status/final-submit`;
    const payload: SfcStatusFinalSubmitPayload = { stateId: 'state-1', yearId: 'year-1', data: {} };

    it('emits response data when the response has success:true', () => {
      const successBody: SfcStatusSubmitResponse = {
        success: true,
        message: 'Submitted.',
        data: { currentFormStatus: 3, currentFormStatusLabel: 'Submitted' },
      };

      let result: unknown;
      service.finalSubmitSfcStatus(payload).subscribe({ next: (data) => (result = data) });

      httpMock.expectOne(url).flush(successBody);

      expect(result).toEqual({ currentFormStatus: 3, currentFormStatusLabel: 'Submitted' });
    });

    it('throws the original response object when response has success:false', () => {
      const errorBody: SfcStatusSubmitResponse = {
        success: false,
        message: 'Not allowed.',
      };

      let caughtError: unknown;
      service.finalSubmitSfcStatus(payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
      expect((caughtError as SfcStatusSubmitResponse).success).toBeFalse();
      expect((caughtError as SfcStatusSubmitResponse).message).toBe('Not allowed.');
    });
  });
});
