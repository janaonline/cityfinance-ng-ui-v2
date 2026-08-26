import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { FcUnspentMohuaReviewService } from './fc-unspent-review.service';
import { FcUnspentApiResponse, FcUnspentMohuaReviewData, FcUnspentMohuaRow, ROW_STATUS } from './fc-unspent-review.models';

const BASE_URL = `${environment.api.url2}xvi-fc/mohua/fc-unspent-declaration/`;

const minimalReview: FcUnspentMohuaReviewData = {
  formId: 'form-1',
  stateId: 'state-1',
  stateName: 'Test State',
  yearId: 'year-1',
  designYear: '2025-26',
  applicableFc: '14TH_FC',
  isFcUnspent: true,
  fcDeclaration: null,
  checkboxConfirmation: true,
  currentFormStatus: 5,
  currentFormStatusLabel: 'Under Review by MoHUA',
  threshold: 10,
  rowSummary: { total: 2, active: 0, updatePending: 2, rejected: 0, needsUpdate: 0, eligible: 1, ineligible: 1 },
  permissions: { canView: true, canApproveForm: true, canRejectForm: true, canReviewRows: true },
  actors: [],
};

const sampleRow: FcUnspentMohuaRow = {
  _id: 'row-1',
  rowNumber: 1,
  ulbId: 'ulb-1',
  censusCode: '800123',
  sbCode: null,
  ulbName: 'Sample ULB',
  allocationAmount: 20,
  unspentAmount: 1.5,
  allocationPerc: 7.5,
  eligibility: true,
  rowStatus: ROW_STATUS.UPDATE_PENDING,
  rejectionRemark: null,
  permissions: { canApprove: true, canReject: true },
};

describe('FcUnspentMohuaReviewService', () => {
  let service: FcUnspentMohuaReviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FcUnspentMohuaReviewService],
    });
    service = TestBed.inject(FcUnspentMohuaReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getReview', () => {
    const url = `${BASE_URL}state-1/year-1`;

    it('calls the exact metadata URL and emits data on success', () => {
      let result: FcUnspentMohuaReviewData | undefined;
      service.getReview('state-1', 'year-1').subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'OK', data: minimalReview });

      expect(result).toEqual(minimalReview);
    });

    it('throws the original response object when success:false', () => {
      const errorBody: FcUnspentApiResponse<FcUnspentMohuaReviewData> = { success: false, message: 'Forbidden' };
      let caughtError: unknown;
      service.getReview('state-1', 'year-1').subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  describe('getRows', () => {
    const url = `${BASE_URL}state-1/year-1/rows`;

    it('calls the exact rows URL with no query params when the query is empty', () => {
      service.getRows('state-1', 'year-1', {}).subscribe();

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ success: true, message: 'OK', data: { rows: [] }, meta: { page: 1, limit: 20, total: 0 } });
    });

    it('sends search/page/limit/rowStatus/eligibility as query params', () => {
      service
        .getRows('state-1', 'year-1', {
          search: 'nagar',
          page: 2,
          limit: 50,
          rowStatus: ROW_STATUS.REJECTED,
          eligibility: true,
        })
        .subscribe();

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.params.get('search')).toBe('nagar');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('50');
      expect(req.request.params.get('rowStatus')).toBe(String(ROW_STATUS.REJECTED));
      expect(req.request.params.get('eligibility')).toBe('true');
      req.flush({ success: true, message: 'OK', data: { rows: [] }, meta: { page: 2, limit: 50, total: 0 } });
    });

    it('resolves rows + pagination meta on success', () => {
      let result: { rows: FcUnspentMohuaRow[]; page: number; limit: number; total: number } | undefined;
      service.getRows('state-1', 'year-1', {}).subscribe((r) => (result = r));

      httpMock
        .expectOne((r) => r.url === url)
        .flush({ success: true, message: 'OK', data: { rows: [sampleRow] }, meta: { page: 1, limit: 20, total: 1 } });

      expect(result).toEqual({ rows: [sampleRow], page: 1, limit: 20, total: 1 });
    });

    it('throws the original response object when success:false', () => {
      let caughtError: unknown;
      service.getRows('state-1', 'year-1', {}).subscribe({ error: (err: unknown) => (caughtError = err) });

      const errorBody = { success: false, message: 'Forbidden' };
      httpMock.expectOne((r) => r.url === url).flush(errorBody);

      expect(caughtError).toEqual(errorBody);
    });
  });

  describe('bulkApproveRows', () => {
    const url = `${BASE_URL}rows/approve`;

    it('posts the exact URL and body', () => {
      const payload = { stateId: 'state-1', yearId: 'year-1', rowIds: ['row-1', 'row-2'] };
      service.bulkApproveRows(payload).subscribe();

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({
        success: true,
        message: 'OK',
        data: {
          updatedRowCount: 2,
          rowSummary: minimalReview.rowSummary,
          currentFormStatus: 5,
          currentFormStatusLabel: 'x',
          parentAcknowledged: false,
        },
      });
    });
  });

  describe('bulkRejectRows', () => {
    const url = `${BASE_URL}rows/reject`;

    it('posts the exact URL and body', () => {
      const payload = {
        stateId: 'state-1',
        yearId: 'year-1',
        rows: [{ rowId: 'row-1', rejectionRemark: 'Missing docs' }],
      };
      service.bulkRejectRows(payload).subscribe();

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({
        success: true,
        message: 'OK',
        data: {
          updatedRowCount: 1,
          rowSummary: minimalReview.rowSummary,
          currentFormStatus: 5,
          currentFormStatusLabel: 'x',
          parentAcknowledged: false,
        },
      });
    });

    it('throws the original response object (with indexed row errors) when success:false', () => {
      const payload = { stateId: 'state-1', yearId: 'year-1', rows: [{ rowId: 'row-1', rejectionRemark: '' }] };
      const errorBody = {
        success: false,
        message: 'Validation failed.',
        errors: {
          'rows.rejectionRemark': [{ field: 'rows.0.rejectionRemark', message: 'Required.', code: 'required' }],
        },
      };

      let caughtError: unknown;
      service.bulkRejectRows(payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toEqual(errorBody);
    });
  });

  describe('approveForm', () => {
    const url = `${BASE_URL}state-1/year-1/approve`;

    it('posts the exact URL with an empty body', () => {
      service.approveForm('state-1', 'year-1').subscribe();

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({
        success: true,
        message: 'OK',
        data: { currentFormStatus: 7, currentFormStatusLabel: 'Acknowledged' },
      });
    });

    it('throws the original response object when success:false (e.g. a rejected row blocks approval)', () => {
      const errorBody = {
        success: false,
        message: 'Validation failed.',
        errors: { _form: [{ message: 'One or more rows are rejected.' }] },
      };
      let caughtError: unknown;
      service.approveForm('state-1', 'year-1').subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toEqual(errorBody);
    });
  });

  describe('rejectForm', () => {
    const url = `${BASE_URL}state-1/year-1/reject`;

    it('posts the exact URL and body', () => {
      const payload = { mohuaRemarks: 'Please revise the declaration.' };
      service.rejectForm('state-1', 'year-1', payload).subscribe();

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({
        success: true,
        message: 'OK',
        data: { currentFormStatus: 6, currentFormStatusLabel: 'Returned by MoHUA' },
      });
    });

    it('throws the original response object when success:false', () => {
      const errorBody = {
        success: false,
        message: 'Validation failed.',
        errors: { mohuaRemarks: [{ message: 'Required.', code: 'required' }] },
      };
      let caughtError: unknown;
      service
        .rejectForm('state-1', 'year-1', { mohuaRemarks: '' })
        .subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toEqual(errorBody);
    });
  });
});
