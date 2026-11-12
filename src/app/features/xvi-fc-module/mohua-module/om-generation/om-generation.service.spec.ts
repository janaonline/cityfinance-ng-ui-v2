import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OmGenerationService } from './om-generation.service';

describe('OmGenerationService', () => {
  let service: OmGenerationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OmGenerationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists verified letters for the year and installment 1, unwrapping the envelope', () => {
    let result: unknown;
    service.getStates('y1').subscribe((r) => (result = r));

    http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/om/y1/1')).flush({ success: true, data: { states: [] } });

    expect(result).toEqual({ states: [] });
  });

  it('PATCHes only the boxes that changed', () => {
    service.saveDraft('c1', { omNumber: 'F-1/2026' }).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/om/letter/c1/draft'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ omNumber: 'F-1/2026' });
    req.flush({ success: true, data: {} });
  });

  it('generates as a file download, keeping the name the API sends', () => {
    let fileName: string | null = null;
    service.generate('c1').subscribe((f) => (fileName = f.fileName));

    const req = http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/om/letter/c1/generate'));
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['%PDF']), {
      headers: new HttpHeaders({ 'Content-Disposition': 'attachment; filename="CF_Tripura_office-memorandum-1_2026-27.pdf"' }),
    });

    expect(fileName).toBe('CF_Tripura_office-memorandum-1_2026-27.pdf');
  });

  it('PUTs the signed OM file reference', () => {
    const file = { originalName: 'om.pdf', path: 'mohua/om/om.pdf', mimeType: 'application/pdf', sizeKb: 120, pageCount: 3 };
    service.uploadSignedFile('o1', file).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('xvi-fc/mohua/om/o1/signed-file'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(file);
    req.flush({ success: true, data: {} });
  });
});
