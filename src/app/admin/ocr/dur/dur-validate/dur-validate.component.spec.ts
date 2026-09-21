import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { CommonService } from '../../../../core/services/common.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { DurValidateComponent } from './dur-validate.component';

const BASE_URL = environment.api.url3;

function makePdfFile(name = 'dur.pdf', sizeBytes = 1024, type = 'application/pdf'): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

function selectFile(component: DurValidateComponent, file: File | null): void {
  const input = document.createElement('input');
  input.type = 'file';
  if (file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
  }
  component.onFileSelected({ target: input } as unknown as Event);
}

describe('DurValidateComponent', () => {
  let component: DurValidateComponent;
  let fixture: ComponentFixture<DurValidateComponent>;
  let httpMock: HttpTestingController;
  let utilitySpy: jasmine.SpyObj<UtilityService>;

  beforeEach(async () => {
    utilitySpy = jasmine.createSpyObj('UtilityService', ['swalPopup']);
    const commonSpy = jasmine.createSpyObj('CommonService', ['searchUlb']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, NoopAnimationsModule, DurValidateComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: CommonService, useValue: commonSpy },
        { provide: UtilityService, useValue: utilitySpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DurValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFileSelected', () => {
    it('rejects a non-PDF file', () => {
      selectFile(component, new File(['x'], 'notes.txt', { type: 'text/plain' }));

      expect(component.selectedFile).toBeNull();
      expect(utilitySpy.swalPopup).toHaveBeenCalledWith('Invalid file', 'Only PDF files are accepted.', 'error');
    });

    it('rejects a PDF larger than the max size', () => {
      const oversized = makePdfFile('big.pdf', (component.maxFileSizeMb + 1) * 1024 * 1024);

      selectFile(component, oversized);

      expect(component.selectedFile).toBeNull();
      expect(utilitySpy.swalPopup).toHaveBeenCalledWith(
        'File too large',
        `PDF must be smaller than ${component.maxFileSizeMb} MB.`,
        'error',
      );
    });

    it('accepts a valid PDF within the size limit', () => {
      const file = makePdfFile();

      selectFile(component, file);

      expect(component.selectedFile).toBe(file);
      expect(utilitySpy.swalPopup).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('shows an error and makes no request when no file is selected', () => {
      component.submit();

      expect(utilitySpy.swalPopup).toHaveBeenCalledWith(
        'File required',
        'Please choose a scanned DUR PDF.',
        'error',
      );
      httpMock.expectNone(() => true);
    });

    it('requires a grant type and makes no request when it is not selected', () => {
      selectFile(component, makePdfFile('dur.pdf'));

      component.submit();

      expect(component.form.controls.grantType.hasError('required')).toBeTrue();
      expect(component.form.controls.grantType.touched).toBeTrue();
      httpMock.expectNone(() => true);
    });

    it('defaults the model to Gemini 3.5 Flash-Lite', () => {
      expect(component.form.controls.model.value).toBe('gemini-3.5-flash-lite');
    });

    it('offers only Tied and Untied as grant type options', () => {
      expect(component.grantTypes.map((g) => g.value)).toEqual(['tied', 'untied']);
    });

    it('submits the job, polls status, and fetches the result once completed', fakeAsync(() => {
      selectFile(component, makePdfFile('dur.pdf'));
      component.form.patchValue({ grantType: 'untied' });

      component.submit();

      const submitReq = httpMock.expectOne(`${BASE_URL}dur-validation/jobs`);
      expect(submitReq.request.method).toBe('POST');
      expect((submitReq.request.body as FormData).get('grant_type')).toBe('untied');
      submitReq.flush({ job_id: 'job-1', status: 'queued', message: 'DUR validation job has been queued.' });

      expect(component.jobs().length).toBe(1);
      expect(component.jobs()[0].status).toBe('queued');
      expect(component.selectedFile).toBeNull(); // cleared after successful submit

      // First poll fires immediately (timer(0, 5000)).
      tick(0);
      const statusReq1 = httpMock.expectOne(`${BASE_URL}dur-validation/jobs/job-1/status`);
      statusReq1.flush({
        job_id: 'job-1',
        status: 'processing',
        filename: 'dur.pdf',
        model: 'gemini-3.1-pro-preview',
        expected: null,
        progress_step: 'extracting_and_validating',
        error_message: null,
        checks: null,
        created_at: null,
        updated_at: null,
        started_at: null,
        completed_at: null,
        message: 'Job is processing: extracting_and_validating.',
      });
      expect(component.jobs()[0].status).toBe('processing');

      // Next poll tick — job completes.
      tick(5000);
      const statusReq2 = httpMock.expectOne(`${BASE_URL}dur-validation/jobs/job-1/status`);
      statusReq2.flush({
        job_id: 'job-1',
        status: 'completed',
        filename: 'dur.pdf',
        model: 'gemini-3.1-pro-preview',
        expected: null,
        progress_step: 'completed',
        error_message: null,
        checks: { ulb_name_match: null, financial_year_match: null, format_valid: true, signature_present: true, overall_valid: true },
        created_at: null,
        updated_at: null,
        started_at: null,
        completed_at: null,
        message: 'Job completed successfully.',
      });

      const resultReq = httpMock.expectOne(`${BASE_URL}dur-validation/jobs/job-1/result`);
      resultReq.flush({
        job_id: 'job-1',
        status: 'completed',
        filename: 'dur.pdf',
        expected: null,
        progress_step: 'completed',
        error_message: null,
        created_at: null,
        updated_at: null,
        started_at: null,
        completed_at: null,
        message: 'Job completed successfully.',
        result: {
          filename: 'dur.pdf',
          doc_id: 'job-1',
          model: 'gemini-3.1-pro-preview',
          processing_time_seconds: 4.2,
          expected: null,
          extraction: {
            state_name: 'Karnataka',
            ulb_name: 'Karad Municipal Council',
            financial_year: '2026-27',
            grant_financial_year: '2025-26',
            grant_type: 'tied',
            is_dur_format: true,
            format_issues: [],
            signature_present: true,
            seal_present: true,
            extraction_notes: null,
          },
          checks: { ulb_name_match: null, financial_year_match: null, grant_type_match: null, format_valid: true, signature_present: true, seal_present: true, overall_valid: true },
          failed_checks: [],
          usage_metadata: null,
          total_tokens: null,
        },
      });

      expect(component.jobs()[0].status).toBe('completed');
      expect(component.jobs()[0].result?.extraction.ulb_name).toBe('Karad Municipal Council');

      // Polling stops once completed — no further status requests outstanding.
      tick(5000);
      httpMock.expectNone(`${BASE_URL}dur-validation/jobs/job-1/status`);
    }));
  });

  describe('pure display helpers', () => {
    it('getStatusLabel maps each status to a human label', () => {
      expect(component.getStatusLabel('queued')).toBe('Queued');
      expect(component.getStatusLabel('processing')).toBe('Processing');
      expect(component.getStatusLabel('completed')).toBe('Completed');
      expect(component.getStatusLabel('failed')).toBe('Failed');
    });

    it('getMatchClass/getMatchIcon reflect true/false/null', () => {
      expect(component.getMatchClass(true)).toBe('text-success');
      expect(component.getMatchClass(false)).toBe('text-danger');
      expect(component.getMatchClass(null)).toBe('text-secondary');

      expect(component.getMatchIcon(true)).toBe('bi-check-circle-fill');
      expect(component.getMatchIcon(false)).toBe('bi-x-circle-fill');
      expect(component.getMatchIcon(null)).toBe('bi-dash-circle');
    });
  });

  describe('getUsageInfo', () => {
    it('returns null when there is no usage metadata', () => {
      expect(
        component.getUsageInfo({
          filename: 'x.pdf',
          doc_id: '1',
          model: 'gemini-3.1-pro-preview',
          processing_time_seconds: 1,
          expected: null,
          extraction: {} as any,
          checks: { ulb_name_match: null, financial_year_match: null, grant_type_match: null, format_valid: null, signature_present: null, seal_present: null, overall_valid: false },
          failed_checks: [],
          usage_metadata: null,
          total_tokens: null,
        }),
      ).toBeNull();
    });

    it('computes estimated USD/INR cost from token counts and model pricing', () => {
      const usage = component.getUsageInfo({
        filename: 'x.pdf',
        doc_id: '1',
        model: 'gemini-3.1-pro-preview',
        processing_time_seconds: 1,
        expected: null,
        extraction: {} as any,
        checks: { ulb_name_match: null, financial_year_match: null, grant_type_match: null, format_valid: null, signature_present: null, seal_present: null, overall_valid: false },
        failed_checks: [],
        usage_metadata: { prompt_token_count: 1000, candidates_token_count: 500, total_token_count: 1500 },
        total_tokens: 1500,
      });

      expect(usage).not.toBeNull();
      expect(usage!.promptTokens).toBe(1000);
      expect(usage!.candidatesTokens).toBe(500);
      expect(usage!.estimatedCostUsd).not.toBeNull();
      expect(usage!.estimatedCostInr).toBeCloseTo(usage!.estimatedCostUsd! * 96.28, 5);
    });
  });
});
