import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SlbService } from '../../ulb-module/ulb-forms/slb/slb.service';
import { UploadDocumentsService } from '../../ulb-module/ulb-forms/upload-documents/upload-documents.service';
import { MohuaUlbFormsService } from './mohua-ulb-forms.service';
import { UlbFormsData } from './ulb-detail.models';

const API = `${environment.api.url2}xvi-fc/`;
const ULB = 'ulb-1';
const YEAR = 'year-1';

describe('MohuaUlbFormsService', () => {
  let service: MohuaUlbFormsService;
  let httpMock: HttpTestingController;
  let slbService: { getSlbForm: jasmine.Spy };
  let uploadDocuments: { getUploadConfig: jasmine.Spy };

  beforeEach(() => {
    slbService = {
      getSlbForm: jasmine.createSpy('getSlbForm').and.returnValue(of({ ulbName: 'Kekri', currentFormStatus: 8 })),
    };
    uploadDocuments = {
      getUploadConfig: jasmine.createSpy('getUploadConfig').and.callFake((type: string) => of({ type, documents: [] })),
    };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: SlbService, useValue: slbService },
        { provide: UploadDocumentsService, useValue: uploadDocuments },
      ],
    });
    service = TestBed.inject(MohuaUlbFormsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the five forms and the API-owned statuses in one go', () => {
    let result: UlbFormsData | undefined;
    service.load(ULB, YEAR).subscribe((value) => (result = value));

    // two annual-account sections, bank account, statuses and DUR — each a separate GET
    const annual = httpMock.match((req) => req.url === `${API}annual-account/by-ulb/${ULB}/${YEAR}`);
    expect(annual.map((req) => req.request.params.get('section')).sort()).toEqual(['auditedData', 'unauditedData']);
    annual.forEach((req) =>
      req.flush({ success: true, data: { annualAccountId: 'a1', ulbName: 'Kekri', ulbCode: '800', data: null } }),
    );

    const bank = httpMock.expectOne((req) => req.url === `${API}bank-account`);
    expect(bank.request.params.get('ulbId')).toBe(ULB);
    expect(bank.request.params.get('yearId')).toBe(YEAR);
    bank.flush({ success: true, data: null });

    httpMock.expectOne(`${API}mohua/ulb/${ULB}/${YEAR}/forms`).flush({
      success: true,
      data: { forms: { audited: { statusCode: 3, statusLabel: 'Under Review by State', submitted: true } } },
    });
    httpMock.expectOne(`${API}dur/by-ulb/${ULB}/${YEAR}`).flush({ success: true, data: null });

    expect(result?.audited.failed).toBeFalse();
    expect(result?.audited.data?.ulbName).toBe('Kekri');
    expect(result?.bank).toEqual({ data: null, failed: false });
    expect(result?.statuses.data?.forms.audited.submitted).toBeTrue();
    expect(result?.slb.data?.currentFormStatus).toBe(8);
    expect(slbService.getSlbForm).toHaveBeenCalledWith(ULB, YEAR);
    expect(uploadDocuments.getUploadConfig).toHaveBeenCalledWith('audited', YEAR);
    expect(uploadDocuments.getUploadConfig).toHaveBeenCalledWith('provisional', YEAR);
  });

  it('keeps the page alive when one call fails: that form is marked failed, the others load', () => {
    slbService.getSlbForm.and.returnValue(throwError(() => new Error('slb down')));
    let result: UlbFormsData | undefined;
    service.load(ULB, YEAR).subscribe((value) => (result = value));

    httpMock
      .match((req) => req.url === `${API}annual-account/by-ulb/${ULB}/${YEAR}`)
      .forEach((req) => req.flush({ success: true, data: null }));
    httpMock
      .expectOne((req) => req.url === `${API}bank-account`)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    httpMock.expectOne(`${API}mohua/ulb/${ULB}/${YEAR}/forms`).flush({ success: true, data: null });
    httpMock.expectOne(`${API}dur/by-ulb/${ULB}/${YEAR}`).flush({ success: true, data: null });

    expect(result?.bank).toEqual({ data: null, failed: true });
    expect(result?.slb).toEqual({ data: null, failed: true });
    expect(result?.dur.failed).toBeFalse();
    expect(result?.statuses.failed).toBeFalse();
  });
});
