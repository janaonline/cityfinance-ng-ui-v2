import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../../environments/environment';
import { XviFcBankAccountService } from './xvi-fc-bank-account.service';
import { SubmitXviFcBankAccountPayload, XviFcBankAccountResponse } from './xvi-fc-bank-account.models';

const BASE_URL = environment.api.url2;

const proof = {
  fileName: 'cancelled-cheque.pdf',
  fileUrl: 'https://bucket.s3.amazonaws.com/bank-account/proof/cancelled-cheque.pdf',
  fileSize: 1024,
  mimeType: 'application/pdf',
};

const responseRecord: XviFcBankAccountResponse = {
  _id: 'record-id',
  ulb: 'ulb-id',
  designYear: 'year-id',
  ifscCode: 'SBIN0123456',
  bankDetails: {
    name: 'State Bank of India',
    branch: 'Main Branch',
    address: 'MG Road',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    micr: null,
  },
  accountNumberMasked: '********9012',
  accountNumberLast4: '9012',
  proof,
  currentFormStatus: 3,
  currentFormStatusLabel: 'Under Review by State',
};

describe('XviFcBankAccountService', () => {
  let service: XviFcBankAccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [XviFcBankAccountService],
    });
    service = TestBed.inject(XviFcBankAccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getBankAccount calls GET /xvi-fc/bank-account with yearId and ulbId', () => {
    let result: XviFcBankAccountResponse | null | undefined;

    service.getBankAccount({ yearId: 'year-id', ulbId: 'ulb-id' }).subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${BASE_URL}xvi-fc/bank-account?yearId=year-id&ulbId=ulb-id`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: responseRecord });

    expect(result).toEqual(responseRecord);
  });

  it('lookupIfsc calls backend IFSC endpoint', () => {
    let result: unknown;

    service.lookupIfsc('UTIB0005157').subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${BASE_URL}xvi-fc/bank-account/ifsc/UTIB0005157`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        ifscCode: 'UTIB0005157',
        bankDetails: responseRecord.bankDetails,
      },
    });

    expect(result).toEqual({ ifscCode: 'UTIB0005157', bankDetails: responseRecord.bankDetails });
  });
  it('submitBankAccount calls POST /xvi-fc/bank-account with SFC-style proof only', () => {
    const payload: SubmitXviFcBankAccountPayload = {
      ulbId: 'ulb-id',
      designYearId: 'year-id',
      ifscCode: 'SBIN0123456',
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789012',
      bankDetails: responseRecord.bankDetails,
      proof,
    };

    service.submitBankAccount(payload).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}xvi-fc/bank-account`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.proof).toEqual(proof);
    expect(req.request.body.proof).not.toEqual(jasmine.objectContaining({ filepath: jasmine.any(String) }));
    expect(req.request.body.proof).not.toEqual(jasmine.objectContaining({ originalName: jasmine.any(String) }));
    expect(req.request.body.proof).not.toEqual(jasmine.objectContaining({ sizeKb: jasmine.any(Number) }));
    req.flush({ success: true, data: responseRecord });
  });

  it('getProofSignedUrl calls POST /xvi-fc/bank-account/proof/signed-url', () => {
    const payload = {
      ulbId: 'ulb-id',
      designYearId: 'year-id',
      fileName: 'cancelled-cheque.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    };

    service.getProofSignedUrl(payload).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}xvi-fc/bank-account/proof/signed-url`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      success: true,
      data: {
        url: 'https://signed.example.com/upload',
        fileUrl: proof.fileUrl,
      },
    });
  });

  it('uploadProofToS3 sends PUT request to signed URL', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 200 })));
    const file = new File(['proof'], 'cancelled-cheque.pdf', { type: 'application/pdf' });

    await new Promise<void>((resolve, reject) => {
      service.uploadProofToS3('https://signed.example.com/upload', file).subscribe({
        next: () => undefined,
        error: reject,
        complete: resolve,
      });
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://signed.example.com/upload', {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': 'application/pdf' },
    });
  });
});

