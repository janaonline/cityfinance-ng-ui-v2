import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AnnualAccountReviewComponent } from './annual-account-review.component';
import { UtilityService } from '../../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { NoteDialogService } from '../../../../../shared/components/note-dialog/note-dialog.service';
import type { UploadPageConfig } from '../../../ulb-module/ulb-forms/upload-documents/upload-documents.component';

describe('AnnualAccountReviewComponent — optional document gating', () => {
  let component: AnnualAccountReviewComponent;
  let fixture: ComponentFixture<AnnualAccountReviewComponent>;

  const config: UploadPageConfig = {
    type: 'audited',
    description: '',
    confirmLabel: 'Submit',
    documentYearId: 'year-1',
    documentYear: 'FY 2024-25',
    documents: [
      {
        id: 'auditors-report',
        title: 'Auditor Report',
        subtitle: '',
        required: true,
        allowedFileTypes: ['pdf'],
        maxFileSize: 50,
      },
      {
        id: 'notes-to-accounts',
        title: 'Notes to Accounts',
        subtitle: '',
        required: false,
        allowedFileTypes: ['pdf'],
        maxFileSize: 50,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualAccountReviewComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ ulbId: 'ulb-1' }),
              queryParamMap: convertToParamMap({}),
              data: {},
            },
            parent: null,
          },
        },
        { provide: UtilityService, useValue: {} },
        { provide: ConfirmDialogService, useValue: {} },
        { provide: NoteDialogService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnualAccountReviewComponent);
    component = fixture.componentInstance;
  });

  it('excludes an unfilled optional document from allPassed', () => {
    component.activeSection.set('auditedData');
    component.configBySection.set({ auditedData: config });
    component.statusData.set({
      annualAccountId: 'account-1',
      ulbName: 'Test ULB',
      ulbCode: 'T1',
      auditedData: {
        form_status: 'UNDER_REVIEW_BY_STATE',
        form_status_id: 3,
        yearId: 'year-1',
        year: '2024-25',
        permissions: {
          canView: true,
          canUpload: false,
          canReview: true,
          canApprove: true,
          canMohuaReview: false,
          canMohuaApprove: false,
        },
        stateDecision: null,
        mohuaDecision: null,
        documents: [
          {
            docId: 'auditors-report',
            uploadStatus: 'UPLOADED',
            processingStatus: 'PASSED',
            currentUpload: null,
            stateDecision: null,
          },
          {
            docId: 'notes-to-accounts',
            uploadStatus: 'NOT_UPLOADED',
            processingStatus: 'NOT_STARTED',
            currentUpload: null,
            stateDecision: null,
          },
        ],
      },
      unauditedData: null,
    });

    const rows = component.rows();
    expect(rows.find((r) => r.docId === 'notes-to-accounts')?.required).toBe(false);
    expect(component.allPassed()).toBe(true);
    expect(component.canApproveSection()).toBe(true);
  });

  it('undoDocument DELETEs the per-document decision endpoint and refreshes statusData from the response', async () => {
    const httpMock = TestBed.inject(HttpTestingController);
    component.activeSection.set('auditedData');
    component.configBySection.set({ auditedData: config });
    component.statusData.set({
      annualAccountId: 'account-1',
      ulbName: 'Test ULB',
      ulbCode: 'T1',
      auditedData: {
        form_status: 'UNDER_REVIEW_BY_STATE',
        form_status_id: 3,
        yearId: 'year-1',
        year: '2024-25',
        permissions: {
          canView: true,
          canUpload: false,
          canReview: true,
          canApprove: true,
          canMohuaReview: false,
          canMohuaApprove: false,
        },
        stateDecision: null,
        mohuaDecision: null,
        documents: [
          {
            docId: 'auditors-report',
            uploadStatus: 'UPLOADED',
            processingStatus: 'PASSED',
            currentUpload: null,
            stateDecision: { status: 'APPROVED', note: null, decidedAt: new Date().toISOString() },
          },
          {
            docId: 'notes-to-accounts',
            uploadStatus: 'NOT_UPLOADED',
            processingStatus: 'NOT_STARTED',
            currentUpload: null,
            stateDecision: null,
          },
        ],
      },
      unauditedData: null,
    });

    const pending = component.undoDocument('auditors-report');

    const req = httpMock.expectOne(
      (r) => r.method === 'DELETE' && r.urlWithParams.includes('/account-1/documents/auditors-report/decision'),
    );
    expect(req.request.urlWithParams).toContain('section=auditedData');
    req.flush({
      annualAccountId: 'account-1',
      auditedData: {
        form_status: 'UNDER_REVIEW_BY_STATE',
        form_status_id: 3,
        yearId: 'year-1',
        year: '2024-25',
        permissions: component.statusData()!.auditedData!.permissions,
        stateDecision: null,
        mohuaDecision: null,
        documents: [
          {
            docId: 'auditors-report',
            uploadStatus: 'UPLOADED',
            processingStatus: 'PASSED',
            currentUpload: null,
            stateDecision: null,
          },
        ],
      },
      unauditedData: null,
    });

    await pending;

    const updatedRow = component.rows().find((r) => r.docId === 'auditors-report');
    expect(updatedRow?.latestDecision).toBeNull();

    httpMock.verify();
  });
});
