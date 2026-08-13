import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
});
