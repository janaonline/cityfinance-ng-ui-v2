import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import {
  UploadDocument,
  UploadDocumentsComponent,
  UploadDocumentDef,
  UploadPageConfig,
} from './upload-documents.component';
import { AuthPermissionService } from '../../../../../core/auth/auth-permission.service';
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
    hasRetried: false,
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
});

describe('UploadDocumentsComponent — masks provisional STATE decisions during review', () => {
  let component: UploadDocumentsComponent;
  let fixture: ComponentFixture<UploadDocumentsComponent>;
  let httpMock: HttpTestingController;

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

  it(
    'hides a RETURNED decision while the section is still UNDER_REVIEW_BY_STATE',
    fakeAsync(() => {
      component.ngOnInit();
      tick();
      const req = httpMock.expectOne((r) => r.url.includes('/by-ulb/ulb-1/year-1'));
      req.flush({ success: true, data: backendDoc('UNDER_REVIEW_BY_STATE') });
      tick();

      const doc = component.documents().find((d) => d.id === 'auditors-report');
      expect(doc?.latestDecision).toBeNull();
    }),
  );

  it(
    'reveals the RETURNED decision once the section is finalized (RETURNED_BY_STATE)',
    fakeAsync(() => {
      component.ngOnInit();
      tick();
      const req = httpMock.expectOne((r) => r.url.includes('/by-ulb/ulb-1/year-1'));
      req.flush({ success: true, data: backendDoc('RETURNED_BY_STATE') });
      tick();

      const doc = component.documents().find((d) => d.id === 'auditors-report');
      expect(doc?.latestDecision?.status).toBe('RETURNED');
    }),
  );
});
