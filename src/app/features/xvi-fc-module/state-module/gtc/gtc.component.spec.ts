import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { DynamicFormVisibilityService } from '../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { GtcComponent } from './gtc.component';
import { GtcService } from './gtc.service';
import { ApiErrorMap, GtcFormData, GtcInstallmentAccess, GtcTemplateData } from './gtc.models';
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

// Matches the real backend default: installment 2 has no configured questionnaire yet, so it's
// always locked (see GtcService.isInstallment2Unlocked). Tests that need to reach installment 2
// pass UNLOCKED_INSTALLMENT_ACCESS explicitly.
const LOCKED_INSTALLMENT_ACCESS: GtcInstallmentAccess = {
  installment1: { canSelect: true, locked: false, lockReason: null },
  installment2: {
    canSelect: false,
    locked: true,
    lockReason: 'Installment 2 is not yet available for this design year.',
  },
};

const UNLOCKED_INSTALLMENT_ACCESS: GtcInstallmentAccess = {
  installment1: { canSelect: true, locked: false, lockReason: null },
  installment2: { canSelect: true, locked: false, lockReason: null },
};

function createGtcFormResponse(
  installment: 1 | 2 = 1,
  installmentAccess: GtcInstallmentAccess = LOCKED_INSTALLMENT_ACCESS,
): GtcFormData {
  return {
    _id: 'gtc-form-test',
    formName: 'Grant Transfer Certificate',
    formId: 35,
    stateName: 'Test State',
    stateId: 'state-test-id',
    yearId: 'year-test-id',
    installment,
    currentFormStatus: 1,
    currentFormStatusLabel: 'Not Started',
    permissions: { canView: true, canEdit: true, canFinalSubmit: false },
    actors: [],
    instructions: [],
    installmentAccess,
    questions: [
      {
        key: 'transferDate',
        label: 'Date of Transfer',
        formFieldType: 'date',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
      },
    ],
  };
}

describe('GtcComponent', () => {
  let fixture: ComponentFixture<GtcComponent>;
  let component: GtcComponent;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let moduleService: jasmine.SpyObj<XvifcModuleService>;
  let getGtcFormSpy: jasmine.Spy;
  let saveGtcDraftSpy: jasmine.Spy;
  let finalSubmitGtcSpy: jasmine.Spy;
  let getGtcTemplateSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-test-id' }));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(true));
    moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, GtcComponent],
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
      .overrideComponent(GtcComponent, {
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

    const gtcService = TestBed.inject(GtcService);
    getGtcFormSpy = spyOn(gtcService, 'getGtcForm').and.returnValue(of(createGtcFormResponse()));
    saveGtcDraftSpy = spyOn(gtcService, 'saveGtcDraft').and.returnValue(of({ currentFormStatus: 2 }));
    finalSubmitGtcSpy = spyOn(gtcService, 'finalSubmitGtc').and.returnValue(of({ currentFormStatus: 3 }));
    getGtcTemplateSpy = spyOn(gtcService, 'getGtcTemplate');
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(GtcComponent);
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

  // ─── Initialization ────────────────────────────────────────────────────────

  it('loads the form for installment 1 by default', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    expect(getGtcFormSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id', 1);
    expect(component.installment()).toBe(1);
    expect(component.isLoading()).toBeFalse();
    expect(getControl('transferDate')).toBeTruthy();
  }));

  // ─── Installment switching ─────────────────────────────────────────────────

  it('reloads the form with the new installment on switchInstallment', fakeAsync(() => {
    getGtcFormSpy.and.returnValue(of(createGtcFormResponse(1, UNLOCKED_INSTALLMENT_ACCESS)));
    createComponent();
    completeInitialLoad();

    getGtcFormSpy.and.returnValue(of(createGtcFormResponse(2, UNLOCKED_INSTALLMENT_ACCESS)));
    component.switchInstallment(2);
    tick(1);
    fixture.detectChanges();

    expect(getGtcFormSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id', 2);
    expect(component.installment()).toBe(2);
  }));

  it('is a no-op when switching to the currently active installment', fakeAsync(() => {
    createComponent();
    completeInitialLoad();
    getGtcFormSpy.calls.reset();

    component.switchInstallment(1);

    expect(getGtcFormSpy).not.toHaveBeenCalled();
  }));

  it('is a no-op when switching to a locked installment 2', fakeAsync(() => {
    createComponent();
    completeInitialLoad();
    getGtcFormSpy.calls.reset();

    component.switchInstallment(2);

    expect(getGtcFormSpy).not.toHaveBeenCalled();
    expect(component.installment()).toBe(1);
  }));

  // ─── Save draft / final submit ─────────────────────────────────────────────

  it('saves a draft with the active installment and reloads on success', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('transferDate')?.setValue('2026-04-01');
    component.onSubmit('saveAsDraft');
    tick(1);

    expect(saveGtcDraftSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ stateId: 'state-test-id', yearId: 'year-test-id', installment: 1 }),
    );
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Draft saved successfully.');
  }));

  it('final-submits with the active installment', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('transferDate')?.setValue('2026-04-01');
    component.onSubmit('finalSubmit');
    tick(1);

    expect(finalSubmitGtcSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ stateId: 'state-test-id', yearId: 'year-test-id', installment: 1 }),
    );
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Form submitted successfully.');
  }));

  it('blocks final submit to installment 2 while it is locked', fakeAsync(() => {
    createComponent();
    completeInitialLoad();
    component.installment.set(2); // simulate a stale/forced installment selection

    component.onSubmit('finalSubmit');
    tick(1);

    expect(finalSubmitGtcSpy).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Installment 2 is not yet available for this design year.',
      'snackbar-danger',
    );
  }));

  // ─── API error mapping ──────────────────────────────────────────────────────

  it('applies backend field errors onto the matching control on save failure', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const errors: ApiErrorMap = {
      transferDate: [{ field: 'transferDate', code: 'required', message: 'Date of Transfer is required.' }],
    };
    saveGtcDraftSpy.and.returnValue(throwError(() => ({ success: false, message: 'Validation failed.', errors })));

    getControl('transferDate')?.setValue('2026-04-01');
    component.onSubmit('saveAsDraft');
    tick(1);

    expect(getControl('transferDate')?.hasError('required')).toBeTrue();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Validation failed.', 'snackbar-danger');
  }));

  // ─── Template download ──────────────────────────────────────────────────────

  it('opens the signed template URL in a new tab on success', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const template: GtcTemplateData = { fileName: 'GTC-Template.docx', mimeType: 'application/msword', url: 'https://signed-url' };
    getGtcTemplateSpy.and.returnValue(of(template));
    const windowOpenSpy = spyOn(window, 'open');

    component.downloadTemplate();
    tick(1);

    expect(windowOpenSpy).toHaveBeenCalledWith('https://signed-url', '_blank', 'noopener,noreferrer');
    expect(component.isDownloadingTemplate()).toBeFalse();
  }));

  it('shows a snackbar and clears the loading flag when the template is not configured', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getGtcTemplateSpy.and.returnValue(
      throwError(() => ({ success: false, message: 'The download template is not configured.' })),
    );

    component.downloadTemplate();
    tick(1);

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'The download template is not configured.',
      'snackbar-danger',
    );
    expect(component.isDownloadingTemplate()).toBeFalse();
  }));

  it('routes the download-template supporting action to downloadTemplate', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const template: GtcTemplateData = { fileName: 'GTC-Template.docx', mimeType: 'application/msword', url: 'https://signed-url' };
    getGtcTemplateSpy.and.returnValue(of(template));
    const windowOpenSpy = spyOn(window, 'open');

    component.onSupportingAction({ fieldKey: 'i2GtcFile', actionId: 'download-template' });
    tick(1);

    expect(windowOpenSpy).toHaveBeenCalled();
  }));

  // ─── Unsaved changes guard ──────────────────────────────────────────────────

  it('reports unsaved changes only when editable and dirty', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    expect(component.hasUnsavedChanges()).toBeFalse();

    component.form.markAsDirty();
    expect(component.hasUnsavedChanges()).toBeTrue();
  }));
});
