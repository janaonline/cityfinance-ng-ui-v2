import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DevolutionFormulaComponent } from './devolution-formula.component';

describe('DevolutionFormulaComponent', () => {
  let component: DevolutionFormulaComponent;
  let fixture: ComponentFixture<DevolutionFormulaComponent>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let utilityService: jasmine.SpyObj<UtilityService>;

  beforeEach(async () => {
    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(false));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
        { provide: UtilityService, useValue: utilityService },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, DevolutionFormulaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DevolutionFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cancel button has data-cy="devolution-formula-cancel-test"', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cy="devolution-formula-cancel-test"]');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('button');
  });

  it('submit button has data-cy="devolution-formula-submit-test"', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cy="devolution-formula-submit-test"]');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('submit');
  });

  describe('onCancel()', () => {
    it('opens the confirmation dialog', () => {
      confirmDialogService.confirm.and.returnValue(of(false));
      component.onCancel();
      expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
    });

    it('resets form and shows snackbar when dialog is confirmed', () => {
      confirmDialogService.confirm.and.returnValue(of(true));
      const resetSpy = spyOn(component.form, 'reset');
      component.onCancel();
      expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submission cancelled.', 'snackbar-danger');
    });

    it('does not reset form or show snackbar when dialog is dismissed', () => {
      confirmDialogService.confirm.and.returnValue(of(false));
      const resetSpy = spyOn(component.form, 'reset');
      component.onCancel();
      expect(resetSpy).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit()', () => {
    it('does not open confirmation dialog when form is invalid', () => {
      component.form.addControl('required', new FormControl(null, Validators.required));

      component.onSubmit();

      expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    });

    it('marks all fields as touched and shows error snackbar when form is invalid', () => {
      component.form.addControl('required', new FormControl(null, Validators.required));
      const markTouchedSpy = spyOn(component.form, 'markAllAsTouched').and.callThrough();

      component.onSubmit();

      expect(markTouchedSpy).toHaveBeenCalledTimes(1);
      expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
        'Please correct the errors in the form before submitting.',
        'snackbar-danger',
      );
    });

    it('opens confirmation dialog with submit-specific content when form is valid', () => {
      confirmDialogService.confirm.and.returnValue(of(false));

      component.onSubmit();

      expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
      const dialogData = confirmDialogService.confirm.calls.mostRecent().args[0];
      expect(dialogData).toEqual(
        jasmine.objectContaining({
          title: 'Submit form?',
          confirmText: 'Yes, submit',
          cancelText: 'No, review again',
          confirmButtonColor: 'primary',
        }),
      );
    });

    it('submits form and shows success snackbar when dialog is confirmed', () => {
      const logSpy = spyOn(console, 'log');
      confirmDialogService.confirm.and.returnValue(of(true));

      component.onSubmit();

      expect(logSpy).toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submitted successfully!');
    });

    it('does not submit or show success snackbar when dialog is dismissed', () => {
      const logSpy = spyOn(console, 'log');
      confirmDialogService.confirm.and.returnValue(of(false));

      component.onSubmit();

      expect(logSpy).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).not.toHaveBeenCalled();
    });
  });
});
