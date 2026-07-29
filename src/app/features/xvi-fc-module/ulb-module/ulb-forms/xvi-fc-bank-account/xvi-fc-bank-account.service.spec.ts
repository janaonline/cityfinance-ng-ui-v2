import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../../environments/environment';
import { XviFcBankAccountService } from './xvi-fc-bank-account.service';
import {
  SubmitXviFcBankAccountPayload,
  XviFcBankAccountProofFile,
  XviFcBankAccountResponse,
} from './xvi-fc-bank-account.models';

const BASE_URL = environment.api.url2;
const proofPath = 'xvi-fc/bank-account/ulb-id/year-id/proof/cancelled-cheque.pdf';
const fullProofUrl = `https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com/${proofPath}`;
const signedPutUrl = `${fullProofUrl}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=secret`;

const proofFile: XviFcBankAccountProofFile = {
  originalName: 'cancelled-cheque.pdf',
  mimeType: 'application/pdf',
  pages: 2,
  sizeKb: 12.25,
  s3Key: proofPath,
  sha256: 'a'.repeat(64),
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
  proofFile,
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
  it('submitBankAccount calls POST /xvi-fc/bank-account with proofFile only', () => {
    const payload: SubmitXviFcBankAccountPayload = {
      ulbId: 'ulb-id',
      stateId: 'state-id',
      designYearId: 'year-id',
      ifscCode: 'SBIN0123456',
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789012',
      bankDetails: responseRecord.bankDetails,
      proofFile,
    };

    service.submitBankAccount(payload).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}xvi-fc/bank-account`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.proofFile).toEqual(proofFile);
    expect(req.request.body).not.toEqual(jasmine.objectContaining({ proof: jasmine.any(Object) }));
    expect(req.request.body.proofFile.s3Key).toBe(proofPath);
    expect(req.request.body.proofFile.s3Key).not.toBe(signedPutUrl);
    expect(req.request.body.proofFile.s3Key).not.toBe(fullProofUrl);
    req.flush({ success: true, data: responseRecord });
  });

  it('getSignedUrls calls shared POST /s3/signed-url with an array payload', () => {
    const payload = [{
      fileName: 'cancelled-cheque.pdf',
      folder: 'xvi-fc/bank-account/ulb-id/year-id/proof',
      mimeType: 'application/pdf',
      fileSize: 2048,
      pages: 2,
      uploadId: 'upload-id',
      expiresIn: 300,
    }];

    let result: unknown;

    service.getSignedUrls(payload).subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${BASE_URL}s3/signed-url`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      success: true,
      data: [{
        fileAlias: 'cancelled-cheque.pdf',
        url: signedPutUrl,
        fileUrl: fullProofUrl,
        path: proofPath,
        uploadId: 'upload-id',
      }],
    });

    expect(result).toEqual([{
      fileAlias: 'cancelled-cheque.pdf',
      url: signedPutUrl,
      fileUrl: fullProofUrl,
      path: proofPath,
      uploadId: 'upload-id',
    }]);
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

