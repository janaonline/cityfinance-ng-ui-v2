import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { UlbSubmissionsComponent } from './ulb-submissions.component';

describe('UlbSubmissionsComponent', () => {
  let component: UlbSubmissionsComponent;
  let fixture: ComponentFixture<UlbSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule, UlbSubmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UlbSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is bulk-reviewable for a live approve/return form like PFMS Bank Account', () => {
    component.filterForm.controls.form.setValue('PFMS_BANK_ACCOUNT');
    fixture.detectChanges();

    expect(component.isBulkReviewable()).toBeTrue();
    expect(component.displayedColumns()).toContain('select');
  });

  it('is not bulk-reviewable for Service Level Benchmarks — no approve/return workflow applies', () => {
    component.filterForm.controls.form.setValue('SERVICE_LEVEL_BENCHMARKS');
    fixture.detectChanges();

    expect(component.isBulkReviewable()).toBeFalse();
    expect(component.displayedColumns()).not.toContain('select');
  });

  it('lists Service Level Benchmarks as a live (non-disabled) dropdown option', () => {
    const slbOption = component.filterSelects[0].options.find((opt) => opt.value === 'SERVICE_LEVEL_BENCHMARKS');
    expect(slbOption?.live).toBeTrue();
    expect(component.filterSelects[0].options.some((opt) => opt.value === 'FORM_5_TBD')).toBeFalse();
  });

  it('disables the review/returned/MoHUA stat-card buckets for Service Level Benchmarks', () => {
    component.filterForm.controls.form.setValue('SERVICE_LEVEL_BENCHMARKS');
    fixture.detectChanges();

    expect(component.isBucketDisabled('UNDER_STATE_REVIEW')).toBeTrue();
    expect(component.isBucketDisabled('RETURNED_BY_STATE')).toBeTrue();
    expect(component.isBucketDisabled('UNDER_REVIEW_BY_MOHUA')).toBeTrue();
    expect(component.isBucketDisabled('NOT_STARTED')).toBeFalse();
    expect(component.isBucketDisabled('IN_PROGRESS')).toBeFalse();
    expect(component.isBucketDisabled('APPROVED_BY_STATE')).toBeFalse();
    expect(component.isBucketDisabled('EXEMPTED')).toBeFalse();
  });

  it('disables the review/returned/MoHUA stat-card buckets for PFMS Bank Account, and disables the Exemption Status card too (no exemption mechanism wired for it)', () => {
    component.filterForm.controls.form.setValue('PFMS_BANK_ACCOUNT');
    fixture.detectChanges();

    expect(component.isBucketDisabled('UNDER_STATE_REVIEW')).toBeFalse();
    expect(component.isBucketDisabled('RETURNED_BY_STATE')).toBeFalse();
    expect(component.isBucketDisabled('UNDER_REVIEW_BY_MOHUA')).toBeFalse();
    expect(component.isBucketDisabled('EXEMPTED')).toBeTrue();
  });

  it('enables the Exemption Status card for Audited/Provisional Statements (automatic + discretionary exemption both apply)', () => {
    component.filterForm.controls.form.setValue('AUDITED_STATEMENTS');
    fixture.detectChanges();
    expect(component.isBucketDisabled('EXEMPTED')).toBeFalse();

    component.filterForm.controls.form.setValue('PROVISIONAL_STATEMENTS');
    fixture.detectChanges();
    expect(component.isBucketDisabled('EXEMPTED')).toBeFalse();
  });

  it('treats the EXEMPTED bucket as nothing-to-review-yet, same as NOT_STARTED/IN_PROGRESS - no action column, regardless of recordId', () => {
    component.filterForm.controls.form.setValue('AUDITED_STATEMENTS');
    component.selectedBucketKey.set('EXEMPTED');
    fixture.detectChanges();

    expect(component.hasNothingToReviewYet()).toBeTrue();
    expect(component.displayedColumns()).not.toContain('action');
    expect(component.displayedColumns()).not.toContain('daysPending');
    expect(component.displayedColumns()).toContain('formStatus');
  });

  it('buildQuery() sends only the discretionary-overlay statuses for the EXEMPTED bucket when Audited Statements is selected', () => {
    component.filterForm.controls.form.setValue('AUDITED_STATEMENTS');
    component.selectedBucketKey.set('EXEMPTED');

    const query = (component as unknown as { buildQuery(): { status: readonly string[] | null } }).buildQuery();

    expect(query.status).toEqual(['EXEMPTION_PENDING', 'EXEMPTION_REJECTED', 'EXEMPTION_APPROVED', 'AUTO_EXEMPTED']);
  });

  it('buildQuery() sends only EXEMPTED (not the Annual-Accounts-only statuses) for the EXEMPTED bucket when SLB is selected', () => {
    component.filterForm.controls.form.setValue('SERVICE_LEVEL_BENCHMARKS');
    component.selectedBucketKey.set('EXEMPTED');

    const query = (component as unknown as { buildQuery(): { status: readonly string[] | null } }).buildQuery();

    expect(query.status).toEqual(['EXEMPTED']);
  });

  it('selectBucket() is a no-op for a disabled bucket', () => {
    component.filterForm.controls.form.setValue('SERVICE_LEVEL_BENCHMARKS');
    fixture.detectChanges();
    const before = component.selectedBucketKey();

    component.selectBucket('UNDER_STATE_REVIEW');

    expect(component.selectedBucketKey()).toBe(before);
  });

  it('switching to Service Level Benchmarks falls back off a now-disabled bucket', () => {
    // Default selected bucket is UNDER_STATE_REVIEW, which SLB doesn't have.
    expect(component.selectedBucketKey()).toBe('UNDER_STATE_REVIEW');

    component.filterForm.controls.form.setValue('SERVICE_LEVEL_BENCHMARKS');
    fixture.detectChanges();

    expect(component.selectedBucketKey()).toBe('NOT_STARTED');
  });

  describe('export', () => {
    let httpMock: HttpTestingController;

    beforeEach(() => {
      httpMock = TestBed.inject(HttpTestingController);
    });

    it('exportData() requests the combined all-forms export with just the design year', () => {
      component.exportData();

      const req = httpMock.expectOne((r) => r.url.endsWith('xvi-fc/state/ulb-submissions/export'));
      expect(req.request.params.has('form')).toBeFalse();
      expect(req.request.params.has('status')).toBeFalse();
      req.flush(new Blob(['csv']));
    });
  });
});
