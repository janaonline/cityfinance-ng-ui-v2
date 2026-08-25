import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import {
  UploadDocument,
  UploadDocumentsComponent,
  UploadDocumentDef,
  UploadPageConfig,
} from './upload-documents.component';
import { AuthPermissionService } from '../../../../../core/auth/auth-permission.service';
import { UtilityService } from '../../../../../core/services/utility.service';
import { UploadDocumentsService } from './upload-documents.service';

// Mirrors the shape the private `emptyDoc()` produces — only the fields the
// gating computeds (totalCount/passedCount/allPassed) read are meaningful here.
function fakeDoc(def: UploadDocumentDef, status: 'pending' | 'passed'): UploadDocument {
  return {
    ...def,
    status,
    fileName: null,
    fileSize: null,
    sizeKb: null,
    fileUrl: null,
    localPreviewUrl: null,
    pageCount: null,
    mimeType: null,
    versionLabel: null,
    uploadedAt: null,
    uploaderUserId: null,
    uploaderRole: null,
    uploadId: null,
    ocrProgressStep: null,
    validationStatus: null,
    validationDetails: null,
    failedChecks: [],
    validationError: null,
    latestDecision: null,
    manualReviewDecision: null,
    retryValidationCount: 0,
    retryValidationAt: null,
    isManualReviewRequested: false,
    manualReviewError: null,
    isStale: false,
  };
}

describe('UploadDocumentsComponent — required/optional document gating', () => {
  let component: UploadDocumentsComponent;
  let fixture: ComponentFixture<UploadDocumentsComponent>;

  const requiredDoc: UploadDocumentDef = {
    id: 'auditors-report',
    title: 'Auditor Report',
    subtitle: '',
    required: true,
    allowedFileTypes: ['pdf'],
    maxFileSize: 50,
  };
  const optionalDoc: UploadDocumentDef = {
    id: 'notes-to-accounts',
    title: 'Notes to Accounts',
    subtitle: '',
    required: false,
    allowedFileTypes: ['pdf'],
    maxFileSize: 50,
  };

  const config: UploadPageConfig = {
    type: 'audited',
    description: '',
    confirmLabel: 'Submit',
    documentYearId: 'year-1',
    documentYear: 'FY 2024-25',
    actionGates: [],
    documents: [requiredDoc, optionalDoc],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDocumentsComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { uploadType: 'audited' }, paramMap: convertToParamMap({}) },
            parent: null,
          },
        },
        {
          provide: AuthPermissionService,
          useValue: {
            canUploadDocuments: () => true,
            canDeleteDocuments: () => true,
            canSubmitToStateDma: () => true,
          },
        },
        { provide: UploadDocumentsService, useValue: { getUploadConfig: () => of(config) } },
        {
          provide: UtilityService,
          useValue: jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadDocumentsComponent);
    component = fixture.componentInstance;
  });

  it('excludes an optional, unfilled document from totalCount/passedCount', () => {
    component.config.set(config);
    component.documents.set([fakeDoc(requiredDoc, 'passed'), fakeDoc(optionalDoc, 'pending')]);

    expect(component.totalCount()).toBe(1);
    expect(component.passedCount()).toBe(1);
    expect(component.allPassed()).toBe(true);
  });

  it('does not let a returned optional document block allPassed', () => {
    component.config.set(config);
    const returnedOptional: UploadDocument = {
      ...fakeDoc(optionalDoc, 'passed'),
      latestDecision: { status: 'RETURNED' as const, note: null, decidedAt: new Date().toISOString() },
    };
    component.documents.set([fakeDoc(requiredDoc, 'passed'), returnedOptional]);

    expect(component.hasReturnedDocs()).toBe(false);
    expect(component.allPassed()).toBe(true);
  });

  it('still blocks allPassed while a required document is unfilled', () => {
    component.config.set(config);
    component.documents.set([fakeDoc(requiredDoc, 'pending'), fakeDoc(optionalDoc, 'pending')]);

    expect(component.allPassed()).toBe(false);
  });

  describe('checkFileValidity() for a document not configured for pdf', () => {
    const docxDoc: UploadDocumentDef = {
      id: 'other-doc',
      title: 'Other Document',
      subtitle: '',
      required: true,
      allowedFileTypes: ['docx'],
      maxFileSize: 50,
    };

    function checkFileValidity(file: File, doc: UploadDocumentDef): Promise<string | null> {
      return (
        component as unknown as { checkFileValidity(file: File, doc: UploadDocumentDef): Promise<string | null> }
      ).checkFileValidity(file, doc);
    }

    it('accepts a file matching the configured (non-pdf) extension', async () => {
      const file = new File(['content'], 'report.docx', { type: 'application/vnd.openxmlformats' });

      const result = await checkFileValidity(file, docxDoc);

      expect(result).toBeNull();
    });

    it('rejects a file whose extension is not in allowedFileTypes, instead of accepting anything', async () => {
      const file = new File(['MZ...'], 'malware.exe', { type: 'application/octet-stream' });

      const result = await checkFileValidity(file, docxDoc);

      expect(result).toContain('Please upload a file of type');
    });

    it('rejects every file when allowedFileTypes is empty (misconfigured document)', async () => {
      const noTypesDoc: UploadDocumentDef = { ...docxDoc, allowedFileTypes: [] };
      const file = new File(['content'], 'anything.docx', { type: 'application/octet-stream' });

      const result = await checkFileValidity(file, noTypesDoc);

      expect(result).toContain('No file type is configured');
    });
  });
});

describe('UploadDocumentsComponent — masks provisional STATE decisions during review', () => {
  let component: UploadDocumentsComponent;
  let fixture: ComponentFixture<UploadDocumentsComponent>;
  let httpMock: HttpTestingController;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const requiredDoc: UploadDocumentDef = {
    id: 'auditors-report',
    title: 'Auditor Report',
    subtitle: '',
    required: true,
    allowedFileTypes: ['pdf'],
    maxFileSize: 50,
  };

  const config: UploadPageConfig = {
    type: 'audited',
    description: '',
    confirmLabel: 'Submit',
    documentYearId: 'year-1',
    documentYear: 'FY 2024-25',
    actionGates: [],
    documents: [requiredDoc],
  };

  const backendDoc = (formStatus: string) => ({
    annualAccountId: 'account-1',
    data: {
      form_status: formStatus,
      form_status_id: 3,
      yearId: 'year-1',
      year: '2024-25',
      stateDecision: null,
      mohuaDecision: null,
      documents: [
        {
          docId: 'auditors-report',
          uploadStatus: 'UPLOADED',
          processingStatus: 'PASSED',
          isStale: false,
          currentUpload: {
            uploadId: 'upload-1',
            version: 1,
            versionLabel: 'v1',
            file: { originalName: 'report.pdf', mimeType: 'application/pdf', pageCount: 3, sizeKb: 100 },
            ocrInfo: { progressStep: null, validationStatus: null, validationDetails: null, failedChecks: [] },
            userInfo: null,
            uploadedAt: '2026-01-01T00:00:00.000Z',
          },
          stateDecision: { status: 'RETURNED', note: 'Fix the totals', decidedAt: '2026-01-02T00:00:00.000Z' },
        },
      ],
    },
  });

  beforeEach(async () => {
    localStorage.setItem('xvifc_selectedYearId', 'year-1');
    localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-1' }));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [UploadDocumentsComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { uploadType: 'audited' }, paramMap: convertToParamMap({}) },
            parent: null,
          },
        },
        {
          provide: AuthPermissionService,
          useValue: {
            canUploadDocuments: () => true,
            canDeleteDocuments: () => true,
            canSubmitToStateDma: () => true,
          },
        },
        { provide: UploadDocumentsService, useValue: { getUploadConfig: () => of(config) } },
        { provide: UtilityService, useValue: utilityService },
        { provide: MatDialog, useValue: dialog },
      ],
    })
      // The component imports MatDialogModule directly (for typing, unused in its own template) —
      // that own-imports provider would otherwise shadow the TestBed-level MatDialog override above
      // for this component specifically, so it's re-overridden here at the component level too,
      // which always wins over a standalone component's own `imports`.
      .overrideComponent(UploadDocumentsComponent, {
        set: { providers: [{ provide: MatDialog, useValue: dialog }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UploadDocumentsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('hides a RETURNED decision while the section is still UNDER_REVIEW_BY_STATE', fakeAsync(() => {
    component.ngOnInit();
    tick();
    const req = httpMock.expectOne((r) => r.url.includes('/by-ulb/ulb-1/year-1'));
    req.flush({ success: true, data: backendDoc('UNDER_REVIEW_BY_STATE') });
    tick();

    const doc = component.documents().find((d) => d.id === 'auditors-report');
    expect(doc?.latestDecision).toBeNull();
  }));

  it('reveals the RETURNED decision once the section is finalized (RETURNED_BY_STATE)', fakeAsync(() => {
    component.ngOnInit();
    tick();
    const req = httpMock.expectOne((r) => r.url.includes('/by-ulb/ulb-1/year-1'));
    req.flush({ success: true, data: backendDoc('RETURNED_BY_STATE') });
    tick();

    const doc = component.documents().find((d) => d.id === 'auditors-report');
    expect(doc?.latestDecision?.status).toBe('RETURNED');
  }));

  it('keeps polling after a transient status-check failure, instead of leaving the document stuck processing', fakeAsync(() => {
    component.ngOnInit();
    tick();
    const initial = backendDoc('IN_PROGRESS');
    initial.data.documents[0].processingStatus = 'PROCESSING';
    // Must be recent — the polling loop stops for anything stuck PROCESSING past the timeout,
    // and this test's whole point is to observe polling continue through a transient failure.
    initial.data.documents[0].currentUpload.uploadedAt = new Date().toISOString();
    httpMock.expectOne((r) => r.url.includes('/by-ulb/ulb-1/year-1')).flush({ success: true, data: initial });
    tick();

    expect(component.documents().find((d) => d.id === 'auditors-report')?.status).toBe('processing');

    // First poll tick fails transiently.
    tick(5000);
    httpMock
      .expectOne((r) => r.url.includes('/account-1/status'))
      .flush('server error', { status: 500, statusText: 'Server Error' });

    // Polling must still be alive for the next tick — this is the regression this test guards:
    // an uncaught error inside switchMap would silently kill the outer interval subscription,
    // and this second expectOne would then find no request at all.
    tick(5000);
    httpMock
      .expectOne((r) => r.url.includes('/account-1/status'))
      .flush({
        success: true,
        data: {
          annualAccountId: 'account-1',
          data: {
            documents: [
              {
                docId: 'auditors-report',
                processingStatus: 'PASSED',
                isStale: false,
                currentUpload: {
                  uploadId: 'upload-1',
                  ocrInfo: { progressStep: null, validationStatus: null, validationDetails: null, failedChecks: [] },
                },
              },
            ],
          },
        },
      });
    tick();

    expect(component.documents().find((d) => d.id === 'auditors-report')?.status).toBe('passed');
  }));

  it('keeps the document and surfaces an error when server-side removal fails', fakeAsync(() => {
    component.ngOnInit();
    tick();
    httpMock
      .expectOne((r) => r.url.includes('/by-ulb/ulb-1/year-1'))
      .flush({ success: true, data: backendDoc('APPROVED_BY_STATE') });
    tick();

    const dialogRef = jasmine.createSpyObj<MatDialogRef<unknown, string>>('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of('remove'));
    dialog.open.and.returnValue(dialogRef);

    component.removeDocument('auditors-report');
    tick();

    httpMock
      .expectOne((r) => r.url.includes('/account-1/documents/auditors-report'))
      .flush('server error', { status: 500, statusText: 'Server Error' });
    tick();

    const doc = component.documents().find((d) => d.id === 'auditors-report');
    expect(doc?.status).toBe('passed');
    expect(doc?.fileName).toBe('report.pdf');
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
  }));
});

// A single global localStorage value shared across every open tab must never override what the
// URL itself says — otherwise a stale/cross-tab year could silently drive this page's document
// loads/uploads onto the wrong year's data. Separate TestBed setup since it needs a route with
// its own :yearId param, unlike the other describe blocks above.
describe('UploadDocumentsComponent — designYearId precedence (route over localStorage)', () => {
  let component: UploadDocumentsComponent;
  let fixture: ComponentFixture<UploadDocumentsComponent>;
  let httpMock: HttpTestingController;

  const config: UploadPageConfig = {
    type: 'audited',
    description: '',
    confirmLabel: 'Submit',
    documentYearId: 'year-route',
    documentYear: 'FY 2026-27',
    actionGates: [],
    documents: [
      {
        id: 'auditors-report',
        title: 'Auditor Report',
        subtitle: '',
        required: true,
        allowedFileTypes: ['pdf'],
        maxFileSize: 50,
      },
    ],
  };

  beforeEach(async () => {
    localStorage.setItem('xvifc_selectedYearId', 'year-stale');
    localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-1' }));

    await TestBed.configureTestingModule({
      imports: [UploadDocumentsComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { uploadType: 'audited' }, paramMap: convertToParamMap({}) },
            parent: {
              snapshot: { paramMap: convertToParamMap({ yearId: 'year-route' }) },
              parent: null,
            },
          },
        },
        {
          provide: AuthPermissionService,
          useValue: {
            canUploadDocuments: () => true,
            canDeleteDocuments: () => true,
            canSubmitToStateDma: () => true,
          },
        },
        { provide: UploadDocumentsService, useValue: { getUploadConfig: () => of(config) } },
        {
          provide: UtilityService,
          useValue: jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadDocumentsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it("uses the route's yearId even when localStorage holds a different (stale/cross-tab) value", fakeAsync(() => {
    component.ngOnInit();
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/by-ulb/ulb-1/year-route'));
    expect(req.request.url).toContain('year-route');
    req.flush({ success: true, data: null });
  }));
});
