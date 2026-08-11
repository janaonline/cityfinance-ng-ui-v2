import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { ClaimLetterService } from './claim-letter.service';
import { CLAIM_LETTER_ULB_ROWS_PAGE_SIZE, ClaimLetterApiResponse, ClaimLetterBatchSummary } from './claim-letter.models';

const BASE_URL = `${environment.api.url2}xvi-fc/state/claim-letter/`;

const stateId = 'state-1';
const yearId = 'year-1';
const claimLetterId = 'claim-1';

const financialSummary = {
  totalInstallmentAllocation: 0,
  totalAlreadyAcknowledged: 0,
  totalClaimInProgress: 0,
  totalClaimInDraft: 0,
  availableToClaim: 0,
  selectedAllocation: 0,
  currentSelectedClaim: 0,
  remainingIfAcknowledged: 0,
};

function sampleRow(ulbId: string) {
  return {
    ulbId,
    ulbName: `ULB ${ulbId}`,
    censusCode: '800123',
    sbCode: null,
    allocationAmount: 10,
    claimAmount: 10,
    differencePercentage: 0,
    eligible: true,
  };
}

const sampleSummary: ClaimLetterBatchSummary = {
  claimLetterId,
  installment: 1,
  batchNumber: 1,
  version: 1,
  currentFormStatus: 2,
  currentFormStatusLabel: 'In Progress',
  assemblyStatus: 'READY',
  ulbCount: 1,
  isAbandoned: false,
  hasSignedFile: false,
  financialSummary,
  revision: 0,
  submittedAt: null,
  resolvedAt: null,
  supersedes: null,
  supersededBy: null,
  createdAt: '2026-07-01T00:00:00.000Z',
  permissions: { canView: true, canEdit: true, canFinalSubmit: true },
};

describe('ClaimLetterService', () => {
  let service: ClaimLetterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimLetterService],
    });
    service = TestBed.inject(ClaimLetterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getEligibilitySummary', () => {
    const url = `${BASE_URL}${stateId}/${yearId}/1/eligibility-summary`;

    it('calls the exact GET URL and emits the response data on success', () => {
      let result: unknown;
      service.getEligibilitySummary(stateId, yearId, 1).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      const summary = {
        installment: 1,
        stateLevelGate: { passed: true, sources: [] },
        expectedUlbCount: 10,
        batchSlotsUsed: 1,
        batchSlotsMax: 3,
      };
      req.flush({ success: true, message: 'OK', data: summary });

      expect(result).toEqual(summary);
    });

    it('throws the original response object when success:false', () => {
      const errorBody: ClaimLetterApiResponse = { success: false, message: 'Forbidden' };
      let caughtError: unknown;
      service.getEligibilitySummary(stateId, yearId, 1).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  describe('getClaimContext', () => {
    const url = `${BASE_URL}${stateId}/${yearId}/1/claim-context`;

    it('calls the exact GET URL and emits the response data on success', () => {
      let result: unknown;
      service.getClaimContext(stateId, yearId, 1).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      const context = {
        expectedUlbCount: 10,
        batchSlotsUsed: 1,
        batchSlotsMax: 3,
        nextBatchNumber: 2,
        financialOverview: {
          totalInstallmentAllocation: 25,
          totalAlreadyAcknowledged: 5,
          totalClaimInProgress: 0,
          totalClaimInDraft: 0,
          availableToClaim: 20,
        },
        remainingUlbCount: 3,
      };
      req.flush({ success: true, message: 'OK', data: context });

      expect(result).toEqual(context);
    });

    it('throws the original response object when success:false', () => {
      const errorBody: ClaimLetterApiResponse = { success: false, message: 'Forbidden' };
      let caughtError: unknown;
      service.getClaimContext(stateId, yearId, 1).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  describe('getUlbOptions', () => {
    const url = `${BASE_URL}${stateId}/${yearId}/1/ulb-options`;

    it('sends no query params when the query is empty', () => {
      service.getUlbOptions(stateId, yearId, 1, {}).subscribe();

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ success: true, message: 'OK', data: [], meta: { page: 1, limit: 20, total: 0 } });
    });

    it('sends search/eligibilityFilter/claimLetterId/page/limit as query params', () => {
      service
        .getUlbOptions(stateId, yearId, 1, {
          search: 'nagar',
          eligibilityFilter: 'ELIGIBLE',
          claimLetterId,
          page: 2,
          limit: 50,
        })
        .subscribe();

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.params.get('search')).toBe('nagar');
      expect(req.request.params.get('eligibilityFilter')).toBe('ELIGIBLE');
      expect(req.request.params.get('claimLetterId')).toBe(claimLetterId);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('50');
      req.flush({ success: true, message: 'OK', data: [], meta: { page: 2, limit: 50, total: 0 } });
    });

    it('resolves options + pagination meta on success', () => {
      const options = [
        {
          ulbId: 'ulb-1',
          ulbName: 'Sample ULB',
          censusCode: '800123',
          sbCode: null,
          allocationAmount: 12.5,
          eligible: true,
          ineligibleReasonCode: null,
          ineligibleReasonDetail: null,
        },
      ];
      let result: unknown;
      service.getUlbOptions(stateId, yearId, 1, {}).subscribe((r) => (result = r));

      httpMock
        .expectOne((r) => r.url === url)
        .flush({ success: true, message: 'OK', data: options, meta: { page: 1, limit: 20, total: 1 } });

      expect(result).toEqual({ options, page: 1, limit: 20, total: 1 });
    });
  });

  describe('createDraft', () => {
    const url = `${BASE_URL}${stateId}/${yearId}/1/draft`;
    const payload = { ulbSelections: [{ ulbId: 'ulb-1', claimedAmount: 10 }] };

    it('posts the exact URL and body, resolving the mapped summary on success', () => {
      let result: unknown;
      service.createDraft(stateId, yearId, 1, payload).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ success: true, message: 'Created.', data: sampleSummary });

      expect(result).toEqual(sampleSummary);
    });

    it('throws the original response object when success:false', () => {
      const errorBody: ClaimLetterApiResponse = { success: false, message: 'Ineligible ULB.' };
      let caughtError: unknown;
      service.createDraft(stateId, yearId, 1, payload).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  describe('updateDraft', () => {
    const url = `${BASE_URL}${claimLetterId}/draft`;
    const payload = { ulbSelections: [{ ulbId: 'ulb-1', claimedAmount: 10 }], expectedRevision: 2 };

    it('sends a PATCH with the exact body, resolving the mapped summary on success', () => {
      let result: unknown;
      service.updateDraft(claimLetterId, payload).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush({ success: true, message: 'Updated.', data: sampleSummary });

      expect(result).toEqual(sampleSummary);
    });
  });

  describe('abandonDraft', () => {
    const url = `${BASE_URL}${claimLetterId}/abandon`;

    it('posts with an empty body, resolving the mapped summary on success', () => {
      let result: unknown;
      service.abandonDraft(claimLetterId).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ success: true, message: 'Abandoned.', data: { ...sampleSummary, isAbandoned: true } });

      expect(result).toEqual({ ...sampleSummary, isAbandoned: true });
    });
  });

  describe('uploadSignedFile', () => {
    const url = `${BASE_URL}${claimLetterId}/signed-file`;
    const fileRef = {
      originalName: 'signed.pdf',
      path: 'x/signed.pdf',
      mimeType: 'application/pdf',
      sizeKb: 100,
      pageCount: 2,
    };

    it('posts the exact file ref body, resolving the mapped summary on success', () => {
      let result: unknown;
      service.uploadSignedFile(claimLetterId, fileRef).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(fileRef);
      req.flush({ success: true, message: 'Uploaded.', data: { ...sampleSummary, hasSignedFile: true } });

      expect(result).toEqual({ ...sampleSummary, hasSignedFile: true });
    });
  });

  describe('submit', () => {
    const url = `${BASE_URL}${claimLetterId}/submit`;

    it('posts with an empty body, resolving the mapped summary on success', () => {
      let result: unknown;
      service.submit(claimLetterId).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, message: 'Submitted.', data: { ...sampleSummary, currentFormStatus: 5 } });

      expect(result).toEqual({ ...sampleSummary, currentFormStatus: 5 });
    });
  });

  describe('listHistory', () => {
    const url = `${BASE_URL}${stateId}/${yearId}/history`;

    it('sends installment/page/limit as query params when provided', () => {
      service.listHistory(stateId, yearId, { installment: 1, page: 2, limit: 10 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.params.get('installment')).toBe('1');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush({ success: true, message: 'OK', data: [], meta: { page: 2, limit: 10, total: 0 } });
    });

    it('resolves claims + pagination meta on success', () => {
      let result: unknown;
      service.listHistory(stateId, yearId, {}).subscribe((r) => (result = r));

      httpMock
        .expectOne((r) => r.url === url)
        .flush({ success: true, message: 'OK', data: [sampleSummary], meta: { page: 1, limit: 20, total: 1 } });

      expect(result).toEqual({ claims: [sampleSummary], page: 1, limit: 20, total: 1 });
    });
  });

  describe('getDetail', () => {
    const url = `${BASE_URL}${claimLetterId}`;

    it('calls the exact GET URL and emits the response data on success', () => {
      let result: unknown;
      service.getDetail(claimLetterId).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'OK', data: sampleSummary });

      expect(result).toEqual(sampleSummary);
    });

    it('throws the original response object when success:false', () => {
      const errorBody: ClaimLetterApiResponse = { success: false, message: 'Not found.' };
      let caughtError: unknown;
      service.getDetail(claimLetterId).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  describe('getDocumentData', () => {
    const url = `${BASE_URL}${claimLetterId}/document`;

    it('calls the exact GET URL and emits the response data on success', () => {
      const document = {
        refNo: 'CL/AP/2026-27/1-1',
        letterDate: '2026-07-01T00:00:00.000Z',
        stateName: 'Andhra Pradesh',
        departmentName: 'Directorate of Municipal Administration',
        designYearLabel: '2026-27',
        installment: 1,
        batchNumber: 1,
        priorFcCycleLabel: '14th FC',
        subjectLine: 'Claim Letter',
        introParagraph: 'Intro',
        closingParagraph: 'Closing',
        signatoryName: 'Vikram Rao',
        signatoryDesignation: 'Finance Analyst',
        coveringLetterRows: [],
        totalClaimAmount: 0,
        annexure1Rows: [],
        annexure2Rows: [],
      };
      let result: unknown;
      service.getDocumentData(claimLetterId).subscribe((data) => (result = data));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'OK', data: document });

      expect(result).toEqual(document);
    });

    it('throws the original response object when success:false', () => {
      const errorBody: ClaimLetterApiResponse = { success: false, message: 'Not found.' };
      let caughtError: unknown;
      service.getDocumentData(claimLetterId).subscribe({ error: (err: unknown) => (caughtError = err) });

      httpMock.expectOne(url).flush(errorBody);

      expect(caughtError).toBe(errorBody);
    });
  });

  describe('downloadDocumentPdf', () => {
    it('GETs the PDF endpoint as a blob', () => {
      const url = `${BASE_URL}${claimLetterId}/document/pdf`;
      const sampleBlob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
      let result: Blob | undefined;

      service.downloadDocumentPdf(claimLetterId).subscribe((blob) => (result = blob));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(sampleBlob);

      expect(result).toBe(sampleBlob);
    });
  });

  describe('getUlbs', () => {
    const url = `${BASE_URL}${claimLetterId}/ulbs`;

    it('sends search/page/limit as query params when provided', () => {
      service.getUlbs(claimLetterId, { search: 'nagar', page: 2, limit: 10 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.params.get('search')).toBe('nagar');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush({ success: true, message: 'OK', data: [], meta: { page: 2, limit: 10, total: 0 } });
    });

    it('resolves rows + pagination meta on success', () => {
      const rows = [
        {
          ulbId: 'ulb-1',
          ulbName: 'Sample ULB',
          censusCode: '800123',
          sbCode: null,
          allocationAmount: 10,
          claimAmount: 10,
          differencePercentage: 0,
          eligible: true,
        },
      ];
      let result: unknown;
      service.getUlbs(claimLetterId, {}).subscribe((r) => (result = r));

      httpMock
        .expectOne((r) => r.url === url)
        .flush({ success: true, message: 'OK', data: rows, meta: { page: 1, limit: 20, total: 1 } });

      expect(result).toEqual({ rows, page: 1, limit: 20, total: 1 });
    });
  });

  describe('getAllUlbs', () => {
    const url = `${BASE_URL}${claimLetterId}/ulbs`;

    it('resolves every row in one page when the batch fits within the page size', () => {
      const rows = [sampleRow('ulb-1'), sampleRow('ulb-2')];
      let result: unknown;
      service.getAllUlbs(claimLetterId).subscribe((r) => (result = r));

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe(String(CLAIM_LETTER_ULB_ROWS_PAGE_SIZE));
      req.flush({ success: true, message: 'OK', data: rows, meta: { page: 1, limit: CLAIM_LETTER_ULB_ROWS_PAGE_SIZE, total: 2 } });

      expect(result).toEqual(rows);
    });

    it('pages through until every row is fetched when the batch spans more than one page', () => {
      const total = CLAIM_LETTER_ULB_ROWS_PAGE_SIZE + 5;
      const page1Rows = Array.from({ length: CLAIM_LETTER_ULB_ROWS_PAGE_SIZE }, (_, i) => sampleRow(`ulb-${i}`));
      const page2Rows = Array.from({ length: 5 }, (_, i) => sampleRow(`ulb-${CLAIM_LETTER_ULB_ROWS_PAGE_SIZE + i}`));

      let result: unknown;
      service.getAllUlbs(claimLetterId).subscribe((r) => (result = r));

      const req1 = httpMock.expectOne((r) => r.url === url && r.params.get('page') === '1');
      req1.flush({
        success: true,
        message: 'OK',
        data: page1Rows,
        meta: { page: 1, limit: CLAIM_LETTER_ULB_ROWS_PAGE_SIZE, total },
      });

      const req2 = httpMock.expectOne((r) => r.url === url && r.params.get('page') === '2');
      expect(req2.request.params.get('limit')).toBe(String(CLAIM_LETTER_ULB_ROWS_PAGE_SIZE));
      req2.flush({
        success: true,
        message: 'OK',
        data: page2Rows,
        meta: { page: 2, limit: CLAIM_LETTER_ULB_ROWS_PAGE_SIZE, total },
      });

      expect(result).toEqual([...page1Rows, ...page2Rows]);
    });

    it('passes the search term through to every page request', () => {
      service.getAllUlbs(claimLetterId, 'nagar').subscribe();

      const req = httpMock.expectOne((r) => r.url === url);
      expect(req.request.params.get('search')).toBe('nagar');
      req.flush({ success: true, message: 'OK', data: [], meta: { page: 1, limit: CLAIM_LETTER_ULB_ROWS_PAGE_SIZE, total: 0 } });
    });
  });
});
