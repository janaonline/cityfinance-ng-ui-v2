import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import {
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SfcStatusComponent } from './sfc-status.component';
import { SfcStatusService } from './sfc-status.service';
import { ApiErrorMap, SfcStatusFormData, SfcStatusSubmitData } from './sfc-status.models';
import { FormProgressComponent } from '../../shared/form-progress/form-progress.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';

@Component({ selector: 'app-dynamic-form', standalone: true, template: '' })
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
  @Input() mode: unknown;
}

@Component({ selector: 'app-pre-loader', standalone: true, template: '' })
class MockPreLoaderComponent {}

@Component({ selector: 'app-form-progress', standalone: true, template: '' })
class MockFormProgressComponent {
  @Input() formType: unknown;
  @Input() formStatus: unknown;
  @Input() actors: unknown;
}

function createSfcFormResponse(): SfcStatusFormData {
  const v = (
    key: string,
    conditions: ConditionalFieldConfig['visibleWhen'],
  ): Pick<ConditionalFieldConfig, 'key' | 'visibleWhen'> => ({ key, visibleWhen: conditions });
  void v; // used inline below

  const isActiveSfcEq = (val: string): ConditionalFieldConfig['visibleWhen'] => ({
    mode: 'all',
    conditions: [{ key: 'isActiveSfc', operator: 'equals', value: val }],
  });

  return {
    _id: 'sfc-form-test',
    formKey: 'sfc-status',
    formName: 'State Finance Commission Verification',
    formType: 'state',
    stateId: 'state-test-id',
    yearId: 'year-test-id',
    stateName: 'Test State',
    currentFormStatus: 1,
    currentFormStatusLabel: 'Not Started',
    permissions: { canView: true, canEdit: true, canFinalSubmit: false },
    actors: [],
    instructions: [],
    meta: { version: 1 },
    questions: [
      {
        key: 'isActiveSfc',
        label: 'Is SFC Active?',
        formFieldType: 'radio',
        value: 'yes',
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
      },
      {
        key: 'awardPeriod',
        label: 'Award Period',
        formFieldType: 'text',
        value: null,
        validations: [
          { name: 'required', validator: true, message: 'Award period is required.' },
          {
            name: 'yearRange',
            validator: { endYearMax: 2029, allowedDurations: [1, 5, 6], requiredIncludedYear: 2026 },
            message: 'Invalid year range.',
          },
        ],
        visibleWhen: isActiveSfcEq('yes'),
      },
      {
        key: 'awardPeriodDuration',
        label: 'Award Period Duration',
        formFieldType: 'number',
        value: null,
        render: false,
        includeInPayload: false,
      },
      {
        key: 'sfcConstitutedForInterim',
        label: 'SFC Constituted for Interim?',
        formFieldType: 'radio',
        value: null,
        visibleWhen: { mode: 'all', conditions: [{ key: 'awardPeriodDuration', operator: 'equals', value: 1 }] },
      },
      {
        key: 'sfcAwardPeriodExtended',
        label: 'SFC Award Period Extended?',
        formFieldType: 'radio',
        value: null,
        visibleWhen: { mode: 'all', conditions: [{ key: 'awardPeriodDuration', operator: 'equals', value: 6 }] },
      },
      {
        key: 'extensionOrder',
        label: 'Extension Order',
        formFieldType: 'file',
        value: null,
        visibleWhen: {
          mode: 'all',
          conditions: [{ key: 'sfcAwardPeriodExtended', operator: 'equals', value: 'yes' }],
        },
      },
      {
        key: 'whichAwardPeriod',
        label: 'Which Award Period?',
        formFieldType: 'text',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
        visibleWhen: isActiveSfcEq('yes'),
      },
      {
        key: 'sfcReportStatus',
        label: 'SFC Report Status',
        formFieldType: 'radio',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
        visibleWhen: isActiveSfcEq('yes'),
      },
      {
        key: 'reportSubmissionDate',
        label: 'Report Submission Date',
        formFieldType: 'date',
        value: null,
        visibleWhen: {
          mode: 'all',
          conditions: [{ key: 'sfcReportStatus', operator: 'equals', value: 'toBeSubmitted' }],
        },
      },
      {
        key: 'sfcReport',
        label: 'SFC Report',
        formFieldType: 'file',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'SFC report is required.' }],
        visibleWhen: {
          mode: 'all',
          conditions: [
            {
              key: 'sfcReportStatus',
              operator: 'in',
              value: ['reportSubmittedAtrNotYetTabled', 'reportSubmittedAtrTabled'],
            },
          ],
        },
      },
      {
        key: 'atrReport',
        label: 'ATR Report',
        formFieldType: 'file',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'ATR report is required.' }],
        visibleWhen: {
          mode: 'all',
          conditions: [{ key: 'sfcReportStatus', operator: 'equals', value: 'reportSubmittedAtrTabled' }],
        },
      },
      {
        key: 'isNewSfcConstituted',
        label: 'Is New SFC Constituted?',
        formFieldType: 'radio',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
      },
      {
        key: 'gazetteNotification',
        label: 'Gazette Notification',
        formFieldType: 'file',
        value: null,
        visibleWhen: {
          mode: 'all',
          conditions: [{ key: 'isNewSfcConstituted', operator: 'equals', value: 'yes' }],
        },
      },
      {
        key: 'raiseAnIssue',
        label: 'Raise an Issue',
        formFieldType: 'textarea',
        value: null,
      },
      {
        key: 'checkboxConfirmation',
        label: 'Confirmation',
        formFieldType: 'checkbox',
        value: false,
        validations: [{ name: 'requiredTrue', validator: true, message: 'Confirmation is required.' }],
      },
    ] as ConditionalFieldConfig[],
  };
}

describe('SfcStatusComponent', () => {
  let fixture: ComponentFixture<SfcStatusComponent>;
  let component: SfcStatusComponent;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let moduleService: jasmine.SpyObj<XvifcModuleService>;
  let getSfcStatusFormSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-test-id' }));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(false));
    moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, SfcStatusComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        DynamicFormService,
        DynamicFormVisibilityService,
        { provide: UtilityService, useValue: utilityService },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
        { provide: XvifcModuleService, useValue: moduleService },
      ],
    })
      .overrideComponent(SfcStatusComponent, {
        remove: {
          imports: [
            HttpClientTestingModule,
            RouterTestingModule,
            DynamicFormComponent,
            PreLoaderComponent,
            FormProgressComponent,
          ],
        },
        add: {
          imports: [
            HttpClientTestingModule,
            RouterTestingModule,
            MockDynamicFormComponent,
            MockPreLoaderComponent,
            MockFormProgressComponent,
          ],
        },
      })
      .compileComponents();

    getSfcStatusFormSpy = spyOn(TestBed.inject(SfcStatusService), 'getSfcStatusForm').and.returnValue(
      of(createSfcFormResponse()),
    );
  });

  afterEach(() => {
    localStorage.removeItem('userData');
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
    const responseSubject = new Subject<SfcStatusFormData>();
    getSfcStatusFormSpy.and.returnValue(responseSubject);

    createComponent();
    fixture.detectChanges();
    expect(component.isLoading()).toBeTrue();

    responseSubject.next(createSfcFormResponse());
    responseSubject.complete();
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    // 14 user-facing fields + 1 derived (awardPeriodDuration)
    expect(component.fields().length).toBe(15);
    // isActiveSfc starts 'yes'; sfcConstitutedForInterim/sfcAwardPeriodExtended hidden (no duration yet);
    // awardPeriodDuration excluded by render:false
    expect(visibleKeys()).toEqual([
      'isActiveSfc',
      'awardPeriod',
      'whichAwardPeriod',
      'sfcReportStatus',
      'isNewSfcConstituted',
      'raiseAnIssue',
      'checkboxConfirmation',
    ]);
    expect(Object.keys(component.form.controls)).toEqual([
      'isActiveSfc',
      'awardPeriod',
      'awardPeriodDuration',
      'sfcConstitutedForInterim',
      'sfcAwardPeriodExtended',
      'extensionOrder',
      'whichAwardPeriod',
      'sfcReportStatus',
      'reportSubmissionDate',
      'sfcReport',
      'atrReport',
      'isNewSfcConstituted',
      'gazetteNotification',
      'raiseAnIssue',
      'checkboxConfirmation',
    ]);
    // 7 rendered visible fields (awardPeriodDuration is render:false; others hidden)
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

    const ctrl = getControl('awardPeriod')!;

    ctrl.setValue('bad-format');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // end year exceeds endYearMax (DESIGN_YEAR+3 = 2029)
    ctrl.setValue('2026-2030');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // end year <= start year
    ctrl.setValue('2026-2026');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // duration not in [1,5,6]
    ctrl.setValue('2022-2026');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // missing boundary year 2026
    ctrl.setValue('2020-2025');
    ctrl.updateValueAndValidity();
    expect(ctrl.hasError('yearRange')).toBeTrue();

    // valid: duration 5, boundary at end
    ctrl.setValue('2021-2026');
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
    component.onSubmit('finalSubmit');

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

    component.onSubmit('finalSubmit');

    expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
    const dialogData = confirmDialogService.confirm.calls.mostRecent().args[0];
    expect(dialogData).toEqual(SUBMIT_CONFIRM_DIALOG_DEFAULTS);
  }));

  it('submits visible payload and shows success snackbar when dialog confirmed', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    const submitSpy = spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(of({}));
    confirmDialogService.confirm.and.returnValue(of(true));

    // Use isActiveSfc = 'no' path for the simplest valid form
    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit('finalSubmit');

    expect(submitSpy).toHaveBeenCalledTimes(1);
    const submittedData = submitSpy.calls.mostRecent().args[0].data;
    expect(Object.keys(submittedData).sort()).toEqual(
      ['isActiveSfc', 'isNewSfcConstituted', 'raiseAnIssue', 'checkboxConfirmation'].sort(),
    );
    expect(submittedData['isActiveSfc']).toBe('no');
    expect(submittedData['isNewSfcConstituted']).toBe('no');
    expect(submittedData['checkboxConfirmation']).toBeTrue();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submitted successfully.');
  }));

  it('submits only visible fields when isActiveSfc = yes with ATR tabled', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    const submitSpy = spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(of({}));
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('yes');
    fixture.detectChanges();

    getControl('awardPeriod')?.setValue('2021-2026');
    getControl('whichAwardPeriod')?.setValue('6th SFC');
    getControl('sfcReportStatus')?.setValue('reportSubmittedAtrTabled');
    fixture.detectChanges();

    const sfcReportFile = {
      fileName: 'report.pdf',
      fileUrl: '/report.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    };
    const atrReportFile = { fileName: 'atr.pdf', fileUrl: '/atr.pdf', fileSize: 512, mimeType: 'application/pdf' };
    getControl('sfcReport')?.setValue(sfcReportFile);
    getControl('atrReport')?.setValue(atrReportFile);
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit('finalSubmit');

    expect(submitSpy).toHaveBeenCalledTimes(1);
    const submittedData = submitSpy.calls.mostRecent().args[0].data;
    expect(submittedData['isActiveSfc']).toBe('yes');
    expect(submittedData['awardPeriod']).toBe('2021-2026');
    expect(submittedData['sfcReportStatus']).toBe('reportSubmittedAtrTabled');
    expect(submittedData['sfcReport']).toEqual(sfcReportFile);
    expect(submittedData['atrReport']).toEqual(atrReportFile);
    // reportSubmissionDate is hidden — must not be in payload
    expect(submittedData['reportSubmissionDate']).toBeUndefined();
    // gazetteNotification is hidden — must not be in payload
    expect(submittedData['gazetteNotification']).toBeUndefined();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submitted successfully.');
  }));

  it('does not call the submit API and shows the cancellation snackbar when dialog is dismissed', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    const submitSpy = spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(of({}));
    confirmDialogService.confirm.and.returnValue(of(false));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit('finalSubmit');

    expect(submitSpy).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submission cancelled.', 'snackbar-danger');
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
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submission cancelled.', 'snackbar-danger');
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

  // ─── awardPeriodDuration derived control ──────────────────────────────────

  it('creates an awardPeriodDuration form control', fakeAsync(() => {
    createComponent();
    completeInitialLoad();
    expect(getControl('awardPeriodDuration')).toBeTruthy();
  }));

  it('awardPeriodDuration starts as null when awardPeriod is empty', fakeAsync(() => {
    createComponent();
    completeInitialLoad();
    expect(getControl('awardPeriodDuration')?.value).toBeNull();
  }));

  it('populates awardPeriodDuration when a valid awardPeriod is set', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('awardPeriod')?.setValue('2021-2026');
    fixture.detectChanges();

    expect(getControl('awardPeriodDuration')?.value).toBe(5);
  }));

  it('updates awardPeriodDuration when awardPeriod changes', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('awardPeriod')?.setValue('2021-2026');
    fixture.detectChanges();
    expect(getControl('awardPeriodDuration')?.value).toBe(5);

    getControl('awardPeriod')?.setValue('2026-2027');
    fixture.detectChanges();
    expect(getControl('awardPeriodDuration')?.value).toBe(1);
  }));

  it('does not update awardPeriodDuration when a different awardPeriod yields the same duration', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    let updateCount = 0;
    getControl('awardPeriodDuration')?.valueChanges.subscribe(() => updateCount++);

    getControl('awardPeriod')?.setValue('2021-2026'); // duration 5
    fixture.detectChanges();
    const countAfterFirst = updateCount;

    getControl('awardPeriod')?.setValue('2020-2025'); // also duration 5
    fixture.detectChanges();
    expect(getControl('awardPeriodDuration')?.value).toBe(5);
    expect(updateCount).toBe(countAfterFirst); // no additional emission
  }));

  it('shows sfcConstitutedForInterim when awardPeriodDuration is 1', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('awardPeriod')?.setValue('2026-2027');
    fixture.detectChanges();

    expect(visibleKeys()).toContain('sfcConstitutedForInterim');
    expect(visibleKeys()).not.toContain('sfcAwardPeriodExtended');
  }));

  it('shows sfcAwardPeriodExtended when awardPeriodDuration is 6', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('awardPeriod')?.setValue('2020-2026');
    fixture.detectChanges();

    expect(visibleKeys()).toContain('sfcAwardPeriodExtended');
    expect(visibleKeys()).not.toContain('sfcConstitutedForInterim');
  }));

  it('hides both sfcConstitutedForInterim and sfcAwardPeriodExtended for duration 5', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('awardPeriod')?.setValue('2021-2026');
    fixture.detectChanges();

    expect(visibleKeys()).not.toContain('sfcConstitutedForInterim');
    expect(visibleKeys()).not.toContain('sfcAwardPeriodExtended');
  }));

  it('awardPeriodDuration is not rendered in the UI', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const renderedKeys = component.visibleFields().map((f) => f.key);
    expect(renderedKeys).not.toContain('awardPeriodDuration');
  }));

  it('awardPeriodDuration is excluded from the visible payload', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    const payload = component['visibilityService'].getVisiblePayload(component.form, component.fields());
    expect(Object.prototype.hasOwnProperty.call(payload, 'awardPeriodDuration')).toBeFalse();
  }));

  // ─── reloadForm subscription lifecycle ───────────────────────────────────────

  it('tears down form subscriptions on reload — stale old control cannot corrupt new form visibility', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // Capture the old awardPeriodDuration control before reload
    const oldDurationControl = getControl('awardPeriodDuration')!;

    // Trigger a successful final-submit which calls reloadForm()
    const sfcService = TestBed.inject(SfcStatusService);
    spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(of({}));
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();
    component.onSubmit('finalSubmit');
    tick(1);
    fixture.detectChanges();

    // After reload: new form is active. Make sfcConstitutedForInterim visible via new form.
    const newAwardPeriodControl = getControl('awardPeriod')!;
    expect(newAwardPeriodControl).not.toBe(oldDurationControl);
    newAwardPeriodControl.setValue('2026-2027'); // duration 1 → sfcConstitutedForInterim visible
    fixture.detectChanges();
    expect(visibleKeys()).toContain('sfcConstitutedForInterim');

    // Drive the OLD awardPeriodDuration control directly.
    // Without the fix the old visibility subscription is still alive; it evaluates
    // sfcConstitutedForInterim against the OLD form's stale null value and hides it.
    // With the fix the old subscription was torn down in reloadForm(), so this has no effect.
    oldDurationControl.setValue(null, { emitEvent: true });
    fixture.detectChanges();
    expect(visibleKeys()).toContain('sfcConstitutedForInterim'); // must remain visible

    // Positive check: the new awardPeriod control still drives duration normally.
    newAwardPeriodControl.setValue('2020-2026'); // duration 6 → sfcAwardPeriodExtended visible
    fixture.detectChanges();
    expect(visibleKeys()).toContain('sfcAwardPeriodExtended');
    expect(visibleKeys()).not.toContain('sfcConstitutedForInterim');
  }));

  it('stops control creation and reports invalid field configuration', () => {
    createComponent();

    component.fields.set([{ formFieldType: 'text', label: 'Broken field' } as ConditionalFieldConfig]);

    component.createFormControls();

    expect(Object.keys(component.form.controls)).toEqual([]);
    expect(component.isLoading()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Invalid field configuration.', 'snackbar-danger');
  });

  // ─── Save draft flow ───────────────────────────────────────────────────────

  it('opens SAVE_AS_DRAFT_DIALOG_DEFAULTS confirmation dialog when form is valid for draft', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // checkboxConfirmation is requiredTrue — must be true even in draft
    getControl('checkboxConfirmation')?.setValue(true);
    // Other required fields intentionally left empty — allowed for saveAsDraft
    fixture.detectChanges();

    component.onSubmit('saveAsDraft');

    expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
    const [dialogData] = confirmDialogService.confirm.calls.mostRecent().args;
    expect(dialogData).toEqual(SAVE_AS_DRAFT_DIALOG_DEFAULTS);
  }));

  it('calls saveSfcStatusDraft and shows success snackbar when draft dialog is confirmed', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    const draftSpy = spyOn(sfcService, 'saveSfcStatusDraft').and.returnValue(of({}));
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('saveAsDraft');

    expect(draftSpy).toHaveBeenCalledTimes(1);
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Draft saved successfully.');
    // reloadForm() calls loadForm() which calls getSfcStatusForm again
    expect(getSfcStatusFormSpy).toHaveBeenCalledTimes(2);
  }));

  it('shows draft cancellation snackbar when save draft dialog is dismissed', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    const draftSpy = spyOn(sfcService, 'saveSfcStatusDraft').and.returnValue(of({}));
    confirmDialogService.confirm.and.returnValue(of(false));

    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('saveAsDraft');

    expect(draftSpy).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Draft save cancelled.', 'snackbar-danger');
  }));

  it('allows save draft when only required errors are present on visible fields', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // isActiveSfc = 'yes': awardPeriod, whichAwardPeriod, sfcReportStatus, isNewSfcConstituted
    // all required and empty — saveAsDraft skips plain `required` errors for these
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('saveAsDraft');

    // Reached the dialog (not blocked by isValidForSubmitType)
    expect(confirmDialogService.confirm).toHaveBeenCalledTimes(1);
  }));

  it('blocks save draft when a non-required error exists on a visible field', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // yearRange error on awardPeriod (not a plain `required` error) blocks saveAsDraft
    getControl('awardPeriod')?.setValue('bad-format');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('saveAsDraft');

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Please correct the errors in the form before saving as draft.',
      'snackbar-danger',
    );
  }));

  // ─── Submit signals ────────────────────────────────────────────────────────

  it('sets isFinalSubmitting true during API call and false after success', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    const pendingCall$ = new Subject<SfcStatusSubmitData>();
    spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(pendingCall$.asObservable());
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('finalSubmit');
    expect(component.isFinalSubmitting()).toBeTrue();

    pendingCall$.next({});
    pendingCall$.complete();
    fixture.detectChanges();

    expect(component.isFinalSubmitting()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submitted successfully.');
  }));

  it('sets isSavingDraft true during API call and false after error', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    const pendingCall$ = new Subject<SfcStatusSubmitData>();
    spyOn(sfcService, 'saveSfcStatusDraft').and.returnValue(pendingCall$.asObservable());
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('saveAsDraft');
    expect(component.isSavingDraft()).toBeTrue();

    pendingCall$.error({ success: false, message: 'Draft failed.' });
    fixture.detectChanges();

    expect(component.isSavingDraft()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Draft failed.', 'snackbar-danger');
  }));

  // ─── Submit error handling ─────────────────────────────────────────────────

  it('shows backend message and stamps field error when final submit response has success:false', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Validation failed from server.',
        errors: {
          isActiveSfc: [{ field: 'isActiveSfc', message: 'Server says invalid.', code: 'apiCode' }],
        },
      })),
    );
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('finalSubmit');

    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Validation failed from server.',
      'snackbar-danger',
    );
    expect(getControl('isActiveSfc')?.hasError('apiCode')).toBeTrue();
    expect(getControl('isActiveSfc')?.touched).toBeTrue();
  }));

  it('shows HTTP error message when final submit returns HTTP 4xx body', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(
      throwError(() => ({
        error: { statusCode: 422, message: 'Unprocessable entity from HTTP.' },
      })),
    );
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('finalSubmit');

    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Unprocessable entity from HTTP.',
      'snackbar-danger',
    );
  }));

  it('shows HTTP error message when 4xx body includes success:false, timestamp, path, and data fields', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(
      throwError(() => ({
        error: {
          success: false,
          statusCode: 422,
          message: 'Standardised 4xx body.',
          timestamp: '2026-01-01T00:00:00.000Z',
          path: '/api/v2/xvi-fc/state/sfc-status/final-submit',
          data: null,
        },
      })),
    );
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('finalSubmit');

    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Standardised 4xx body.', 'snackbar-danger');
  }));

  it('shows fallback message when final submit error has no recognized shape', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(throwError(() => new Error('Network error')));
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('finalSubmit');

    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Unable to submit form. Please correct the errors and try again.',
      'snackbar-danger',
    );
  }));

  it('shows backend message and stamps field error when save draft response has success:false', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    spyOn(sfcService, 'saveSfcStatusDraft').and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Draft validation failed.',
        errors: {
          isNewSfcConstituted: [{ field: 'isNewSfcConstituted', message: 'Draft error.', code: 'draftCode' }],
        },
      })),
    );
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('saveAsDraft');

    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Draft validation failed.', 'snackbar-danger');
    expect(getControl('isNewSfcConstituted')?.hasError('draftCode')).toBeTrue();
  }));

  it('does not reload the form when final submit fails', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(
      throwError(() => ({ success: false, message: 'Error.' })),
    );
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('finalSubmit');

    // getSfcStatusForm was called once during initial load only — no reload after error
    expect(getSfcStatusFormSpy).toHaveBeenCalledTimes(1);
  }));

  // ─── API error stamping ────────────────────────────────────────────────────

  it('stamps errors on visible controls but skips hidden fields', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcService = TestBed.inject(SfcStatusService);
    // isActiveSfc='no' → sfcReport is force-hidden via cascade fix from Phase 1.6
    spyOn(sfcService, 'finalSubmitSfcStatus').and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Errors.',
        errors: {
          isNewSfcConstituted: [{ field: 'isNewSfcConstituted', message: 'Visible error.', code: 'visibleCode' }],
          sfcReport: [{ field: 'sfcReport', message: 'Hidden error.', code: 'hiddenCode' }],
        },
      })),
    );
    confirmDialogService.confirm.and.returnValue(of(true));

    getControl('isActiveSfc')?.setValue('no');
    getControl('isNewSfcConstituted')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    component.onSubmit('finalSubmit');

    // Visible field receives the error
    expect(getControl('isNewSfcConstituted')?.hasError('visibleCode')).toBeTrue();
    // Hidden field is skipped — sfcReport disabled with null errors when isActiveSfc='no'
    expect(getControl('sfcReport')?.hasError('hiddenCode')).toBeFalse();
  }));

  it('merges server errors with pre-existing control errors on the same field', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // isNewSfcConstituted left empty → has 'required' error (visible, always rendered)
    // saveAsDraft skips plain required errors → form is valid for draft
    getControl('isActiveSfc')?.setValue('no');
    getControl('checkboxConfirmation')?.setValue(true);
    fixture.detectChanges();

    const sfcService = TestBed.inject(SfcStatusService);
    spyOn(sfcService, 'saveSfcStatusDraft').and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Merge test.',
        errors: {
          isNewSfcConstituted: [{ field: 'isNewSfcConstituted', message: 'Server merge.', code: 'apiMerge' }],
        },
      })),
    );
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('saveAsDraft');

    // Both errors present: required (pre-existing) + apiMerge (server-stamped)
    const ctrl = getControl('isNewSfcConstituted')!;
    expect(ctrl.hasError('required')).toBeTrue();
    expect(ctrl.hasError('apiMerge')).toBeTrue();
  }));

  // ─── API error clearing ────────────────────────────────────────────────────

  it('clearAllApiErrors removes server-stamped errors but preserves non-server errors', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    // Access private methods via unknown cast (avoids 'any'; declares only what we need)
    const internals = component as unknown as {
      applyApiErrors: (errors: ApiErrorMap) => void;
      clearAllApiErrors: () => void;
    };

    const ctrl = getControl('isActiveSfc')!;

    // Stamp a server error (simulates a failed submit response)
    internals.applyApiErrors({
      isActiveSfc: [{ field: 'isActiveSfc', message: 'Server error.', code: 'serverCode' }],
    });
    // Also set a client-side error on the same control
    ctrl.setErrors({ ...ctrl.errors, clientError: true });

    expect(ctrl.hasError('serverCode')).toBeTrue();
    expect(ctrl.hasError('clientError')).toBeTrue();

    // clearAllApiErrors removes only the server-tracked key
    internals.clearAllApiErrors();

    expect(ctrl.hasError('serverCode')).toBeFalse();
    expect(ctrl.hasError('clientError')).toBeTrue();
  }));
});
