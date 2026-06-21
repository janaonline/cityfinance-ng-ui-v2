import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import {
  EulbFinalSubmitPayload,
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
    fileName: 'eulb.xlsx',
    fileUrl: 'https://example.test/eulb.xlsx',
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
        call: () => service.revalidateUploadedExcel(stateId, yearId, 10),
      },
      {
        name: 'update row',
        method: 'PATCH',
        urlPart: `${stateId}/${yearId}/rows/${rowId}`,
        call: () => service.updateRow(stateId, yearId, rowId, createRowUpdatePayload()),
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
        ulbCount: 10,
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      },
    };
  }

  function createValidatePayload(): EulbValidateExcelPayload {
    return {
      stateId,
      yearId,
      ulbCount: 10,
      electedBodyExcelFile: fileValue,
    };
  }

  function createRowUpdatePayload(): EulbUpdateRowPayload {
    return {
      remarks: 'Updated',
    };
  }
});
