import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { SUBMIT_CONFIRM_DIALOG_DEFAULTS } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ElectedBodyStatusComponent } from './elected-body-status.component';

describe('ElectedBodyStatusComponent', () => {
  let component: ElectedBodyStatusComponent;
  let fixture: ComponentFixture<ElectedBodyStatusComponent>;
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
      imports: [HttpClientTestingModule, RouterTestingModule, ElectedBodyStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ElectedBodyStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Initialization ────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes form controls after loading', fakeAsync(() => {
    tick(1);
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(component.fields().length).toBe(3);
    expect(Object.keys(component.form.controls)).toEqual(['ulbCount', 'electedBodyExcelFile', 'checkboxConfirmation']);
  }));

  it('shows preloader while loading and form after load', fakeAsync(() => {
    expect(component.isLoading()).toBeTrue();
    expect(fixture.nativeElement.querySelector('app-pre-loader')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();

    tick(1);
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  }));

  // ─── data-cy selectors ─────────────────────────────────────────────────────

  it('cancel button has data-cy="elected-body-status-cancel-test"', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cy="elected-body-status-cancel-test"]');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('button');
  });

  it('submit button has data-cy="elected-body-status-submit-test"', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cy="elected-body-status-submit-test"]');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('submit');
  });

  // ─── Validation ────────────────────────────────────────────────────────────

  it('checkboxConfirmation uses requiredTrue validation', fakeAsync(() => {
    tick(1);
    fixture.detectChanges();

    const ctrl = component.form.get('checkboxConfirmation') as unknown as FormControl;
    expect(ctrl.value).toBeFalse();
    ctrl.markAsTouched();
    expect(ctrl.hasError('required')).toBeTrue();

    ctrl.setValue(true);
    ctrl.updateValueAndValidity();
    expect(ctrl.valid).toBeTrue();
  }));

  // ─── onSubmit() ────────────────────────────────────────────────────────────

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

  it('marks required fields touched on invalid submit after form loads', fakeAsync(() => {
    tick(1);
    fixture.detectChanges();

    component.onSubmit();

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    expect(component.form.get('ulbCount')?.touched).toBeTrue();
    expect(component.form.get('ulbCount')?.invalid).toBeTrue();
    expect(component.form.get('checkboxConfirmation')?.touched).toBeTrue();
    expect(component.form.get('checkboxConfirmation')?.invalid).toBeTrue();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Please correct the errors in the form before submitting.',
      'snackbar-danger',
    );
  }));

  it('opens confirmation dialog with submit-specific content when form is valid', () => {
    confirmDialogService.confirm.and.returnValue(of(false));

    component.onSubmit();

    expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
    const dialogData = confirmDialogService.confirm.calls.mostRecent().args[0];
    expect(dialogData).toEqual(SUBMIT_CONFIRM_DIALOG_DEFAULTS);
  });

  it('opens confirmation dialog with valid loaded form', fakeAsync(() => {
    tick(1);
    fixture.detectChanges();

    (component.form.get('ulbCount') as unknown as FormControl)?.setValue(50);
    (component.form.get('checkboxConfirmation') as unknown as FormControl)?.setValue(true);
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit();

    expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
    const dialogData = confirmDialogService.confirm.calls.mostRecent().args[0];
    expect(dialogData).toEqual(SUBMIT_CONFIRM_DIALOG_DEFAULTS);
  }));

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

  // ─── onCancel() ────────────────────────────────────────────────────────────

  it('opens the confirmation dialog when onCancel is called', () => {
    confirmDialogService.confirm.and.returnValue(of(false));
    component.onCancel();
    expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
  });

  it('resets form and shows cancellation snackbar when cancel dialog is confirmed', () => {
    confirmDialogService.confirm.and.returnValue(of(true));
    const resetSpy = spyOn(component.form, 'reset');

    component.onCancel();

    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submission cancelled.', 'snackbar-danger');
  });

  it('does not reset form or show snackbar when cancel dialog is dismissed', () => {
    confirmDialogService.confirm.and.returnValue(of(false));
    const resetSpy = spyOn(component.form, 'reset');

    component.onCancel();

    expect(resetSpy).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).not.toHaveBeenCalled();
  });
});
