import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { of } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { SUBMIT_CONFIRM_DIALOG_DEFAULTS } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SfcStatusComponent } from './sfc-status.component';

@Component({ selector: 'app-dynamic-form', standalone: true, template: '' })
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
}

@Component({ selector: 'app-pre-loader', standalone: true, template: '' })
class MockPreLoaderComponent {}

describe('SfcStatusComponent', () => {
  let fixture: ComponentFixture<SfcStatusComponent>;
  let component: SfcStatusComponent;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;

  beforeEach(async () => {
    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, SfcStatusComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        DynamicFormService,
        DynamicFormVisibilityService,
        { provide: UtilityService, useValue: utilityService },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
      ],
    })
      .overrideComponent(SfcStatusComponent, {
        remove: { imports: [HttpClientTestingModule, RouterTestingModule, DynamicFormComponent, PreLoaderComponent] },
        add: { imports: [HttpClientTestingModule, RouterTestingModule, MockDynamicFormComponent, MockPreLoaderComponent] },
      })
      .compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(SfcStatusComponent);
    component = fixture.componentInstance;
  }

  function completeInitialLoad(): void {
    fixture.detectChanges();
    tick(1);
    fixture.detectChanges();
  }

  function getControl(key: string): AbstractControl<unknown, unknown> | null {
    return component.form.get(key);
  }

  function visibleKeys(): string[] {
    return component.visibleFields().map((f) => f.key);
  }

  // ─── Initialization ────────────────────────────────────────────────────────

  it('creates the component and initializes the dynamic form', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    expect(component.isLoading()).toBeTrue();

    tick(1);
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(component.fields().length).toBe(11);
    // isActiveSfc starts with value 'yes', so its dependents are shown immediately
    expect(visibleKeys()).toEqual([
      'isActiveSfc', 'awardPeriod', 'whichAwardPeriod', 'sfcReportStatus',
      'isNewSfcConstituted', 'raiseAnIssue', 'checkboxConfirmation',
    ]);
    expect(Object.keys(component.form.controls)).toEqual([
      'isActiveSfc', 'awardPeriod', 'whichAwardPeriod', 'sfcReportStatus',
      'reportSubmissionDate', 'sfcReport', 'atrReport',
      'isNewSfcConstituted', 'gazetteNotification', 'raiseAnIssue', 'checkboxConfirmation',
    ]);
    expect(fixture.nativeElement.querySelectorAll('app-dynamic-form').length).toBe(7);
  }));

  // ─── Visibility: isActiveSfc ───────────────────────────────────────────────

  it('awardPeriod, whichAwardPeriod, sfcReportStatus are visible when isActiveSfc = yes (default)', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // isActiveSfc starts as 'yes' — dependents are visible by default
    expect(visibleKeys()).toContain('awardPeriod');
    expect(visibleKeys()).toContain('whichAwardPeriod');
    expect(visibleKeys()).toContain('sfcReportStatus');
  }));

  it('hides isActiveSfc dependents and preserves their values when isActiveSfc changes to no', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // isActiveSfc starts as 'yes' — set values then hide
    getControl('awardPeriod')?.setValue('2026-2031');
    getControl('sfcReportStatus')?.setValue('toBeSubmitted');
    fixture.detectChanges();

    getControl('isActiveSfc')?.setValue('no');
    fixture.detectChanges();

    expect(visibleKeys()).not.toContain('awardPeriod');
    expect(visibleKeys()).not.toContain('whichAwardPeriod');
    expect(visibleKeys()).not.toContain('sfcReportStatus');

    // Values preserved for when isActiveSfc goes back to yes
    expect(getControl('awardPeriod')?.value).toBe('2026-2031');
    expect(getControl('sfcReportStatus')?.value).toBe('toBeSubmitted');
  }));

  // ─── Visibility: sfcReportStatus ───────────────────────────────────────────

  it('shows only reportSubmissionDate when sfcReportStatus = toBeSubmitted', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // isActiveSfc already 'yes' — just set sfcReportStatus
    getControl('sfcReportStatus')?.setValue('toBeSubmitted');
    fixture.detectChanges();

    expect(visibleKeys()).toContain('reportSubmissionDate');
    expect(visibleKeys()).not.toContain('sfcReport');
    expect(visibleKeys()).not.toContain('atrReport');
  }));

  it('shows only sfcReport when sfcReportStatus = reportSubmittedAtrNotYetTabled', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('sfcReportStatus')?.setValue('reportSubmittedAtrNotYetTabled');
    fixture.detectChanges();

    expect(visibleKeys()).toContain('sfcReport');
    expect(visibleKeys()).not.toContain('reportSubmissionDate');
    expect(visibleKeys()).not.toContain('atrReport');
  }));

  it('shows sfcReport and atrReport when sfcReportStatus = reportSubmittedAtrTabled', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('sfcReportStatus')?.setValue('reportSubmittedAtrTabled');
    fixture.detectChanges();

    expect(visibleKeys()).toContain('sfcReport');
    expect(visibleKeys()).toContain('atrReport');
    expect(visibleKeys()).not.toContain('reportSubmissionDate');
  }));

  it('hides sfcReport and atrReport when isActiveSfc changes to no (cascade)', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('sfcReportStatus')?.setValue('reportSubmittedAtrTabled');
    fixture.detectChanges();

    // Both visible while active
    expect(visibleKeys()).toContain('sfcReport');
    expect(visibleKeys()).toContain('atrReport');

    getControl('isActiveSfc')?.setValue('no');
    fixture.detectChanges();

    // Both hidden when parent condition fails
    expect(visibleKeys()).not.toContain('sfcReport');
    expect(visibleKeys()).not.toContain('atrReport');
  }));

  // ─── Visibility: isNewSfcConstituted ───────────────────────────────────────

  it('shows gazetteNotification when isNewSfcConstituted = yes', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('isNewSfcConstituted')?.setValue('yes');
    fixture.detectChanges();

    expect(visibleKeys()).toContain('gazetteNotification');
  }));

  it('hides gazetteNotification when isNewSfcConstituted = no', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('isNewSfcConstituted')?.setValue('no');
    fixture.detectChanges();

    expect(visibleKeys()).not.toContain('gazetteNotification');
  }));

  it('hides gazetteNotification when isNewSfcConstituted = notApplicable', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('isNewSfcConstituted')?.setValue('notApplicable');
    fixture.detectChanges();

    expect(visibleKeys()).not.toContain('gazetteNotification');
  }));

  // ─── Validation: awardPeriod (yearRange) ──────────────────────────────────

  it('applies yearRange validation to awardPeriod', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // isActiveSfc already 'yes' — awardPeriod control is enabled
    const ctrl = getControl('awardPeriod')!;

    // Invalid format
    ctrl.setValue('bad-format');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // Start year outside 2020–2029
    ctrl.setValue('2019-2024');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // End year out of 2000–2099
    ctrl.setValue('2026-2100');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // End year <= start year
    ctrl.setValue('2026-2026');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // Valid award period
    ctrl.setValue('2026-2031');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeFalse();
  }));

  // ─── Validation: checkboxConfirmation ─────────────────────────────────────

  it('checkboxConfirmation is invalid when false (requiredTrue)', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const ctrl = getControl('checkboxConfirmation')!;
    expect(ctrl.value).toBeFalse();
    ctrl.markAsTouched();
    expect(ctrl.hasError('required')).toBeTrue();
  }));

  it('checkboxConfirmation is valid when true', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const ctrl = getControl('checkboxConfirmation')!;
    ctrl.setValue(true);
    ctrl.updateValueAndValidity();
    expect(ctrl.valid).toBeTrue();
  }));

  // ─── Submit flow ───────────────────────────────────────────────────────────

  it('shows validation feedback and does not open dialog when form is invalid', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // isActiveSfc starts valid ('yes'), but awardPeriod, whichAwardPeriod, sfcReportStatus,
    // isNewSfcConstituted, and checkboxConfirmation are all required and empty
    component.onSubmit();

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    expect(getControl('awardPeriod')?.touched).toBeTrue();
    expect(getControl('awardPeriod')?.invalid).toBeTrue();
    expect(getControl('sfcReportStatus')?.touched).toBeTrue();
    expect(getControl('sfcReportStatus')?.invalid).toBeTrue();
    expect(getControl('isNewSfcConstituted')?.touched).toBeTrue();
    expect(getControl('checkboxConfirmation')?.touched).toBeTrue();
    expect(getControl('checkboxConfirmation')?.invalid).toBeTrue();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Please correct the errors in the form before submitting.',
      'snackbar-danger',
    );
  }));

  it('opens confirmation dialog with SUBMIT_CONFIRM_DIALOG_DEFAULTS when form is valid', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // Switch isActiveSfc to 'no' — hides awardPeriod/whichAwardPeriod/sfcReportStatus
    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit();

    expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
    const dialogData = confirmDialogService.confirm.calls.mostRecent().args[0];
    expect(dialogData).toEqual(SUBMIT_CONFIRM_DIALOG_DEFAULTS);
  }));

  it('submits visible payload and shows success snackbar when dialog confirmed', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const logSpy = spyOn(console, 'log');
    confirmDialogService.confirm.and.returnValue(of(true));

    // Use isActiveSfc = 'no' path for the simplest valid form
    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit();

    const payload = logSpy.calls.mostRecent().args[1] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      ['isActiveSfc', 'isNewSfcConstituted', 'raiseAnIssue', 'checkboxConfirmation'].sort(),
    );
    expect(payload['isActiveSfc']).toBe('no');
    expect(payload['isNewSfcConstituted']).toBe('no');
    expect(payload['checkboxConfirmation']).toBeTrue();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submitted successfully!');
  }));

  it('submits only visible fields when isActiveSfc = yes with ATR tabled', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const logSpy = spyOn(console, 'log');
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('yes');
    fixture.detectChanges();

    getControl('awardPeriod')?.setValue('2026-2031');
    getControl('whichAwardPeriod')?.setValue('6th SFC');
    getControl('sfcReportStatus')?.setValue('reportSubmittedAtrTabled');
    fixture.detectChanges();

    const sfcReportFile = { fileName: 'report.pdf', fileUrl: '/report.pdf', fileSize: 1024, mimeType: 'application/pdf' };
    const atrReportFile = { fileName: 'atr.pdf', fileUrl: '/atr.pdf', fileSize: 512, mimeType: 'application/pdf' };
    getControl('sfcReport')?.setValue(sfcReportFile);
    getControl('atrReport')?.setValue(atrReportFile);
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit();

    const payload = logSpy.calls.mostRecent().args[1] as Record<string, unknown>;
    expect(payload['isActiveSfc']).toBe('yes');
    expect(payload['awardPeriod']).toBe('2026-2031');
    expect(payload['sfcReportStatus']).toBe('reportSubmittedAtrTabled');
    expect(payload['sfcReport']).toEqual(sfcReportFile);
    expect(payload['atrReport']).toEqual(atrReportFile);
    // reportSubmissionDate is hidden — must not be in payload
    expect(payload['reportSubmissionDate']).toBeUndefined();
    // gazetteNotification is hidden — must not be in payload
    expect(payload['gazetteNotification']).toBeUndefined();
  }));

  it('does not submit or show success snackbar when dialog is dismissed', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const logSpy = spyOn(console, 'log');
    confirmDialogService.confirm.and.returnValue(of(false));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit();

    expect(logSpy).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).not.toHaveBeenCalled();
  }));

  // ─── Cancel flow ───────────────────────────────────────────────────────────

  it('opens the confirmation dialog when onCancel is called', () => {
    createComponent();
    component.onCancel();
    expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
  });

  it('shows cancellation snackbar when cancel dialog is confirmed', () => {
    confirmDialogService.confirm.and.returnValue(of(true));
    createComponent();
    component.onCancel();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Form submission cancelled.',
      'snackbar-danger',
    );
  });

  it('does not show cancellation snackbar when cancel dialog is dismissed', () => {
    confirmDialogService.confirm.and.returnValue(of(false));
    createComponent();
    component.onCancel();
    expect(utilityService.triggerSnackbar).not.toHaveBeenCalled();
  });

  // ─── data-cy selectors ─────────────────────────────────────────────────────

  it('cancel button has data-cy="sfc-status-cancel-test"', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cy="sfc-status-cancel-test"]');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('button');
  }));

  it('submit button has data-cy="sfc-status-submit-test"', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cy="sfc-status-submit-test"]');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('submit');
  }));

  // ─── Edge cases / field creation ──────────────────────────────────────────

  it('keeps readonly date controls enabled so their values stay in form state', () => {
    createComponent();

    component.fields.set([
      {
        formFieldType: 'date',
        label: 'Readonly date',
        key: 'readonlyDate',
        readonly: true,
        minDate: '2026-02-01',
        maxDate: '2026-12-31',
      } as ConditionalFieldConfig,
    ]);

    component.createFormControls();

    const control = component.form.get('readonlyDate');
    expect(component.fields()[0].readonly).toBeTrue();
    expect(control).toBeTruthy();
    expect(control?.disabled).toBeFalse();
  });

  it('allows readonly text fields without an initial value to become editable', () => {
    createComponent();

    component.fields.set([
      {
        formFieldType: 'text',
        label: 'Editable fallback',
        key: 'editableFallback',
        readonly: true,
        value: '',
      } as ConditionalFieldConfig,
    ]);

    component.createFormControls();

    const control = component.form.get('editableFallback');
    expect(component.fields()[0].readonly).toBeFalse();
    expect(control).toBeTruthy();
    expect(control?.disabled).toBeFalse();
  });

  it('stops control creation and reports invalid field configuration', () => {
    createComponent();

    component.fields.set([
      { formFieldType: 'text', label: 'Broken field' } as ConditionalFieldConfig,
    ]);

    component.createFormControls();

    expect(Object.keys(component.form.controls)).toEqual([]);
    expect(component.isLoading()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Invalid field configuration.',
      'snackbar-danger',
    );
  });
});
