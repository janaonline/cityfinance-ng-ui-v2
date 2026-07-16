import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { FcUnspentMohuaReviewService } from '../../fc-unspent-review.service';
import { MohuaRemarksDialogComponent, MohuaRemarksDialogData } from './mohua-remarks-dialog.component';

describe('MohuaRemarksDialogComponent', () => {
  let fixture: ComponentFixture<MohuaRemarksDialogComponent>;
  let component: MohuaRemarksDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<MohuaRemarksDialogComponent, boolean>>;
  let service: FcUnspentMohuaReviewService;

  const data: MohuaRemarksDialogData = {
    stateId: 'state-1',
    yearId: 'year-1',
    title: 'Reject FC Unspent Declaration',
    description: 'Provide remarks explaining the rejection.',
    submitLabel: 'Reject',
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<MohuaRemarksDialogComponent, boolean>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MohuaRemarksDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MohuaRemarksDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FcUnspentMohuaReviewService);
    fixture.detectChanges();
  });

  it('blocks submit and shows a required error when remarks are blank/whitespace', () => {
    const submitSpy = spyOn(service, 'rejectForm');
    component.remarks.setValue('   ');

    component.submit();
    fixture.detectChanges();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(component.showRequiredError).toBe(true);
    const feedback = fixture.debugElement.query(By.css('.invalid-feedback'));
    expect(feedback.nativeElement.textContent).toContain('Remarks are required');
  });

  it('trims and submits mohuaRemarks, closing with true on success', () => {
    const submitSpy = spyOn(service, 'rejectForm').and.returnValue(of({ currentFormStatus: 6, currentFormStatusLabel: 'Returned' }));
    component.remarks.setValue('  Needs revision  ');

    component.submit();

    expect(submitSpy).toHaveBeenCalledWith('state-1', 'year-1', { mohuaRemarks: 'Needs revision' });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('stays open, preserves the entered value, and shows the backend error on failure', () => {
    spyOn(service, 'rejectForm').and.returnValue(
      throwError(() => ({ success: false, message: 'Validation failed.', errors: { mohuaRemarks: [{ field: 'mohuaRemarks', message: 'Too short.' }] } })),
    );
    component.remarks.setValue('short');

    component.submit();
    fixture.detectChanges();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.remarks.value).toBe('short');
    expect(component.remarks.errors?.['apiError']).toBe('Too short.');
  });

  it('shows a general form error when the backend error has no field-routable entries', () => {
    spyOn(service, 'rejectForm').and.returnValue(throwError(() => ({ success: false, message: 'One or more rows are already active.' })));
    component.remarks.setValue('Some remark');

    component.submit();
    fixture.detectChanges();

    expect(component.formError()).toBe('One or more rows are already active.');
  });

  it('prevents duplicate submission while a request is pending', () => {
    const pending = new Subject<{ currentFormStatus: number; currentFormStatusLabel: string }>();
    const submitSpy = spyOn(service, 'rejectForm').and.returnValue(pending);
    component.remarks.setValue('Valid remark');

    component.submit();
    component.submit();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('closes with false on cancel', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
