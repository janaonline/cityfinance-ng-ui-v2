import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import {
  EulbFinalSubmitPayload,
  EulbPostSubmissionUpdateSubmitPayload,
  EulbPostSubmissionUpdateValidatePayload,
  EulbSaveDraftPayload,
  EulbUpdateRowPayload,
  EulbValidateExcelPayload,
} from './eulb-status.models';
import { EulbStatusService } from './eulb-status.service';

describe('EulbStatusService', () => {
  const stateId = 'state-1';
  const yearId = 'year-1';
  const rowId = 'row-1';
  const fileValue = {
    originalName: 'eulb.xlsx',
    path: 'https://example.test/eulb.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeKb: 2,
    pageCount: null,
  };

  let service: EulbStatusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EulbStatusService],
    });

    service = TestBed.inject(EulbStatusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('throws the original success:false body for JSON EULB endpoints', () => {
    const cases: Array<{
      name: string;
      method: string;
      urlPart: string;
      call: () => Observable<unknown>;
    }> = [
      {
        name: 'get form/details',
        method: 'GET',
        urlPart: `${stateId}/${yearId}`,
        call: () => service.getFormData(stateId, yearId),
      },
      {
        name: 'save draft',
        method: 'POST',
        urlPart: 'save-draft',
        call: () => service.saveDraft(createDraftPayload()),
      },
      {
        name: 'final submit',
        method: 'POST',
        urlPart: 'final-submit',
        call: () => service.finalSubmit(createFinalPayload()),
      },
      {
        name: 'validate Excel',
        method: 'POST',
        urlPart: 'validate-excel',
        call: () => service.validateExcel(createValidatePayload()),
      },
      {
        name: 'get rows',
        method: 'GET',
        urlPart: `${stateId}/${yearId}/rows`,
        call: () => service.getRows(stateId, yearId),
      },
      {
        name: 'delete uploaded Excel',
        method: 'DELETE',
        urlPart: `${stateId}/${yearId}/uploaded-excel`,
        call: () => service.deleteUploadedExcel(stateId, yearId),
      },
      {
        name: 'revalidate Excel',
        method: 'POST',
        urlPart: 'revalidate-excel',
        call: () => service.revalidateUploadedExcel(stateId, yearId),
      },
      {
        name: 'update row',
        method: 'PATCH',
        urlPart: `${stateId}/${yearId}/rows/${rowId}`,
        call: () => service.updateRow(stateId, yearId, rowId, createRowUpdatePayload()),
      },
      {
        name: 'post-submission update metadata',
        method: 'GET',
        urlPart: `${stateId}/${yearId}/post-submission-update`,
        call: () => service.getPostSubmissionUpdateMetadata(stateId, yearId),
      },
      {
        name: 'post-submission update rows',
        method: 'GET',
        urlPart: `${stateId}/${yearId}/post-submission-update/rows`,
        call: () => service.getPostSubmissionUpdateRows(stateId, yearId),
      },
      {
        name: 'post-submission update validate',
        method: 'POST',
        urlPart: `${stateId}/${yearId}/post-submission-update/validate`,
        call: () => service.validatePostSubmissionUpdateRows(stateId, yearId, createPostUpdateValidatePayload()),
      },
      {
        name: 'post-submission update submit',
        method: 'POST',
        urlPart: `${stateId}/${yearId}/post-submission-update/submit`,
        call: () => service.submitPostSubmissionUpdate(stateId, yearId, createPostUpdateSubmitPayload()),
      },
    ];

    for (const testCase of cases) {
      const failureBody = {
        success: false,
        message: `${testCase.name} rejected`,
        errors: {
          ulbCount: [{ field: 'ulbCount', code: 'invalidUlbCount', message: 'Invalid ULB count.' }],
        },
      };
      let capturedError: unknown;

      testCase.call().subscribe({
        error: (err: unknown) => {
          capturedError = err;
        },
      });

      const req = httpMock.expectOne(
        (request) => request.method === testCase.method && request.url.includes(testCase.urlPart),
      );
      req.flush(failureBody);

      expect(capturedError).withContext(testCase.name).toEqual(failureBody);
    }
  });

  it('passes blob downloads straight through without applying the success:false check', () => {
    const blobContent = new Blob(['test'], { type: 'application/vnd.ms-excel' });

    let templateResult: Blob | undefined;
    service.downloadTemplate(stateId, yearId).subscribe((blob) => (templateResult = blob));
    httpMock
      .expectOne((r) => r.method === 'GET' && r.url.includes('/template') && r.responseType === 'blob')
      .flush(blobContent);
    expect(templateResult).toBe(blobContent);

    let errorSheetResult: Blob | undefined;
    service.downloadErrorSheet(stateId, yearId).subscribe((blob) => (errorSheetResult = blob));
    httpMock
      .expectOne((r) => r.method === 'GET' && r.url.includes('/error-sheet') && r.responseType === 'blob')
      .flush(blobContent);
    expect(errorSheetResult).toBe(blobContent);
  });

  it('keeps successful save draft responses on the success path', () => {
    let completed = false;

    service.saveDraft(createDraftPayload()).subscribe({
      complete: () => {
        completed = true;
      },
    });

    const req = httpMock.expectOne((request) => request.method === 'POST' && request.url.includes('save-draft'));
    req.flush({ success: true, message: 'Saved' });

    expect(completed).toBeTrue();
  });

  it('fetches post-submission update rows with the expected query params', () => {
    let total = 0;

    service
      .getPostSubmissionUpdateRows(stateId, yearId, {
        page: 2,
        limit: 20,
        search: 'Bhopal',
        electedBodyStatus: 'Constituted',
        validationStatus: 'INVALID',
      })
      .subscribe((data) => {
        total = data.total;
      });

    const req = httpMock.expectOne(
      (request) => request.method === 'GET' && request.url.includes(`${stateId}/${yearId}/post-submission-update/rows`),
    );

    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('search')).toBe('Bhopal');
    expect(req.request.params.get('electedBodyStatus')).toBe('Constituted');
    expect(req.request.params.get('validationStatus')).toBe('INVALID');

    req.flush({
      success: true,
      data: {
        rows: [
          {
            _id: 'row-1',
            rowNumber: 1,
            censusCode: '100001',
            ulbName: 'Test ULB',
            electedBodyStatus: 'Constituted',
            dateOfConstitution: '2020-01-01',
            dateOfExpiry: '2030-01-01',
            remarks: null,
            validationStatus: 'INVALID',
            errors: [],
          },
        ],
        total: 1,
        page: 2,
        limit: 20,
        eligibleRule: { allowedFormStatuses: [4, 5], today: '2026-06-22' },
      },
    });

    expect(total).toBe(1);
  });

  it('passes post-submission update validate success responses through', () => {
    let validationStatus: 'VALID' | 'INVALID' | undefined;

    service.validatePostSubmissionUpdateRows(stateId, yearId, createPostUpdateValidatePayload()).subscribe((res) => {
      validationStatus = res.data.validationStatus;
    });

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'POST' && request.url.includes(`${stateId}/${yearId}/post-submission-update/validate`),
    );

    expect(req.request.body).toEqual(createPostUpdateValidatePayload());
    req.flush({
      success: true,
      message: 'All rows are valid.',
      data: {
        validationStatus: 'VALID',
        rows: [
          {
            rowId: rowId,
            rowNumber: 1,
            censusCode: '100001',
            ulbName: 'Test ULB',
            electedBodyStatus: 'Constituted',
            dateOfConstitution: '2020-01-01',
            dateOfExpiry: '2030-01-01',
            remarks: 'Updated',
            validationStatus: 'VALID',
            errors: [],
          },
        ],
        errorRowCount: 0,
        validRowCount: 1,
        totalRowCount: 1,
      },
      timestamp: '2026-06-22T00:00:00.000Z',
    });

    expect(validationStatus).toBe('VALID');
  });

  it('passes post-submission update submit success responses through with a JSON payload', () => {
    let updatedRowCount = 0;

    service.submitPostSubmissionUpdate(stateId, yearId, createPostUpdateSubmitPayload()).subscribe((res) => {
      updatedRowCount = res.data.updatedRowCount;
    });

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'POST' && request.url.includes(`${stateId}/${yearId}/post-submission-update/submit`),
    );

    expect(req.request.body).toEqual(createPostUpdateSubmitPayload());
    expect(req.request.body instanceof FormData).toBeFalse();
    req.flush({
      success: true,
      message: 'Elected Urban Local Bodies update submitted successfully.',
      data: {
        batchId: 'batch-1',
        updatedRowCount: 1,
        document: {
          originalName: 'combined.pdf',
          path: 'state/eulb-post-submission-update/combined.pdf',
          mimeType: 'application/pdf',
          sizeKb: 1,
          pageCount: 2,
        },
        validationSummary: {
          dbUlbCount: 1,
          maxAllowedExcelRows: 2,
          excelRowCount: 1,
          matchedDbUlbCount: 1,
          missingDbUlbCount: 0,
          extraExcelRowCount: 0,
          duplicateUlbCount: 0,
          errorRowCount: 0,
          validationStatus: 'VALID',
          activeDatasetVersion: 1,
        },
      },
      timestamp: '2026-06-22T00:00:00.000Z',
    });

    expect(updatedRowCount).toBe(1);
  });

  function createDraftPayload(): EulbSaveDraftPayload {
    return {
      stateId,
      yearId,
      data: {
        ulbCount: 10,
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      },
    };
  }

  function createFinalPayload(): EulbFinalSubmitPayload {
    return {
      stateId,
      yearId,
      data: {
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      },
    };
  }

  function createValidatePayload(): EulbValidateExcelPayload {
    return {
      stateId,
      yearId,
      electedBodyExcelFile: fileValue,
    };
  }

  function createRowUpdatePayload(): EulbUpdateRowPayload {
    return {
      remarks: 'Updated',
    };
  }

  function createPostUpdateValidatePayload(): EulbPostSubmissionUpdateValidatePayload {
    return {
      rows: [
        {
          rowId,
          electedBodyStatus: 'Constituted',
          dateOfConstitution: '2020-01-01',
          dateOfExpiry: '2030-01-01',
          remarks: 'Updated',
        },
      ],
    };
  }

  function createPostUpdateSubmitPayload(): EulbPostSubmissionUpdateSubmitPayload {
    return {
      rows: createPostUpdateValidatePayload().rows,
      document: {
        originalName: 'combined.pdf',
        path: 'state/eulb-post-submission-update/combined.pdf',
        mimeType: 'application/pdf',
        sizeKb: 1,
        pageCount: 2,
      },
    };
  }
});
