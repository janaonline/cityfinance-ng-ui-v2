import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../../environments/environment';
import { XviFcBudgetDocumentService } from './xvi-fc-budget-document.service';
import { BudgetDocumentResponse, UploadBudgetDocumentPayload } from './xvi-fc-budget-document.models';

const BASE_URL = environment.api.url2;

const responseWithFile: BudgetDocumentResponse = {
  designYearId: 'year-id',
  designYear: '2026-27',
  file: { name: 'Budget-2026-27.pdf', url: 'https://signed.example/budget.pdf', uploadedAt: '2026-08-14T00:00:00.000Z' },
};

describe('XviFcBudgetDocumentService', () => {
  let service: XviFcBudgetDocumentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [XviFcBudgetDocumentService],
    });
    service = TestBed.inject(XviFcBudgetDocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getBudgetDocument calls GET /xvi-fc/budget-document with yearId', () => {
    let result: BudgetDocumentResponse | undefined;

    service.getBudgetDocument('year-id').subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${BASE_URL}xvi-fc/budget-document?yearId=year-id`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: responseWithFile });

    expect(result).toEqual(responseWithFile);
  });

  it('getBudgetDocument unwraps a flat (non-wrapped) response', () => {
    let result: BudgetDocumentResponse | undefined;

    service.getBudgetDocument('year-id').subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${BASE_URL}xvi-fc/budget-document?yearId=year-id`);
    req.flush(responseWithFile);

    expect(result).toEqual(responseWithFile);
  });

  it('uploadBudgetDocument calls POST /xvi-fc/budget-document with the payload', () => {
    const payload: UploadBudgetDocumentPayload = {
      designYearId: 'year-id',
      originalName: 'Budget-2026-27.pdf',
      sizeKb: 512,
      s3Key: 'budgets/2026-27/Budget-2026-27_abc123.pdf',
    };

    let result: BudgetDocumentResponse | undefined;
    service.uploadBudgetDocument(payload).subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${BASE_URL}xvi-fc/budget-document`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: responseWithFile });

    expect(result).toEqual(responseWithFile);
  });

  it('getSignedUrls calls shared POST /file/signed-url with an array payload', () => {
    const payload = [
      { fileName: 'Budget-2026-27.pdf', folder: 'budgets/2026-27', mimeType: 'application/pdf', fileSize: 2048, expiresIn: 300 },
    ];

    let result: unknown;
    service.getSignedUrls(payload).subscribe((value) => (result = value));

    const req = httpMock.expectOne(`${BASE_URL}file/signed-url`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      success: true,
      data: [{ url: 'https://signed.example/put', fileUrl: 'https://bucket.example/budgets/2026-27/x.pdf', path: 'budgets/2026-27/x.pdf' }],
    });

    expect(result).toEqual([
      { url: 'https://signed.example/put', fileUrl: 'https://bucket.example/budgets/2026-27/x.pdf', path: 'budgets/2026-27/x.pdf' },
    ]);
  });

  it('uploadToS3 sends PUT request to signed URL', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 200 })));
    const file = new File(['budget'], 'Budget-2026-27.pdf', { type: 'application/pdf' });

    await new Promise<void>((resolve, reject) => {
      service.uploadToS3('https://signed.example.com/upload', file).subscribe({
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
