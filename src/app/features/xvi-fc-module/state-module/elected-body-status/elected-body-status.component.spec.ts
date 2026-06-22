import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import {
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { FieldSupportingActionEvent } from '../../../../shared/dynamic-form/field.interface';
import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { FormActor, FormProgressComponent } from '../../shared/form-progress/form-progress.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { ElectedBodyStatusComponent } from './elected-body-status.component';
import {
  EulbFileValue,
  EulbFinalSubmitPayload,
  EulbFormResponseData,
  EulbSaveDraftPayload,
} from './eulb-status.models';
import { EulbStatusService } from './eulb-status.service';

@Component({ selector: 'app-dynamic-form', standalone: true, template: '' })
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
  @Input() mode: unknown;
  @Output() supportingAction = new EventEmitter<FieldSupportingActionEvent>();
}

@Component({ selector: 'app-pre-loader', standalone: true, template: '' })
class MockPreLoaderComponent {}

@Component({ selector: 'app-form-progress', standalone: true, template: '' })
class MockFormProgressComponent {
  @Input() formType: unknown;
  @Input() formStatus: unknown;
  @Input() actors: FormActor[] = [];
}

describe('ElectedBodyStatusComponent', () => {
  const stateId = 'state-1';
  const yearId = 'year-1';
  const fileValue: EulbFileValue = {
    fileName: 'eulb.xlsx',
    fileUrl: 'https://example.test/eulb.xlsx',
    fileSize: 1024,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  let component: ElectedBodyStatusComponent;
  let fixture: ComponentFixture<ElectedBodyStatusComponent>;
  let eulbService: jasmine.SpyObj<EulbStatusService>;
  let moduleService: jasmine.SpyObj<XvifcModuleService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let utilityService: jasmine.SpyObj<UtilityService>;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: stateId }));

    eulbService = jasmine.createSpyObj<EulbStatusService>('EulbStatusService', [
      'getFormData',
      'saveDraft',
      'finalSubmit',
      'validateExcel',
      'revalidateUploadedExcel',
      'downloadTemplate',
      'downloadErrorSheet',
      'deleteUploadedExcel',
    ]);
    eulbService.getFormData.and.returnValue(of(createFormResponse()));
    eulbService.saveDraft.and.returnValue(of(undefined));
    eulbService.finalSubmit.and.returnValue(of(undefined));

    moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue(yearId);

    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(false));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', [
      'triggerSnackbar',
      'getNonEmptyString',
      'formatBytes',
    ]);

    await TestBed.configureTestingModule({
      imports: [ElectedBodyStatusComponent],
      providers: [
        { provide: EulbStatusService, useValue: eulbService },
        { provide: XvifcModuleService, useValue: moduleService },
        { provide: MatDialog, useValue: dialog },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
        { provide: UtilityService, useValue: utilityService },
      ],
    })
      .overrideComponent(ElectedBodyStatusComponent, {
        remove: { imports: [DynamicFormComponent, PreLoaderComponent, FormProgressComponent] },
        add: { imports: [MockDynamicFormComponent, MockPreLoaderComponent, MockFormProgressComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ElectedBodyStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  it('creates the component and loads the current EULB form from services', () => {
    expect(component).toBeTruthy();
    expect(eulbService.getFormData).toHaveBeenCalledOnceWith(stateId, yearId);
    expect(component.isLoading()).toBeFalse();
    expect(component.fields().map((field) => field.key)).toEqual([
      'ulbCount',
      'electedBodyExcelFile',
      'checkboxConfirmation',
    ]);
    expect(Object.keys(component.form.controls)).toEqual(['ulbCount', 'electedBodyExcelFile', 'checkboxConfirmation']);
  });

  it('uses the current data-cy selectors for footer actions', () => {
    expect(fixture.debugElement.query(By.css('[data-cy="eulb-status-cancel-test"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="eulb-status-save-draft-test"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="eulb-status-final-submit-test"]'))).not.toBeNull();
  });

  it('blocks save-as-draft when required confirmation is not checked', () => {
    component.onSubmit('saveAsDraft');

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    expect(eulbService.saveDraft).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Please correct the errors in the form before saving as draft.',
      'snackbar-danger',
    );
  });

  it('opens the save-as-draft confirmation and sends the current draft payload when confirmed', () => {
    setControlValue('checkboxConfirmation', true);
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('saveAsDraft');

    expect(confirmDialogService.confirm).toHaveBeenCalledOnceWith(SAVE_AS_DRAFT_DIALOG_DEFAULTS, undefined);
    expect(eulbService.saveDraft).toHaveBeenCalledTimes(1);

    const payload: EulbSaveDraftPayload = eulbService.saveDraft.calls.mostRecent().args[0];
    expect(payload).toEqual({
      stateId,
      yearId,
      data: {
        ulbCount: undefined,
        electedBodyExcelFile: undefined,
        checkboxConfirmation: true,
      },
    });
  });

  it('handles save-as-draft success:false as an error without showing success or reloading', () => {
    eulbService.saveDraft.and.returnValue(throwError(() => createApiFailure('Draft rejected by backend.')));
    setControlValue('checkboxConfirmation', true);
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('saveAsDraft');

    expect(eulbService.saveDraft).toHaveBeenCalledTimes(1);
    expect(eulbService.getFormData).toHaveBeenCalledTimes(1);
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Draft rejected by backend.', 'snackbar-danger');
    expect(utilityService.triggerSnackbar).not.toHaveBeenCalledWith('Draft saved successfully.');
  });

  it('blocks final submit when required controls are invalid', () => {
    component.onSubmit('finalSubmit');

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    expect(eulbService.finalSubmit).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Please correct the errors in the form before submitting.',
      'snackbar-danger',
    );
  });

  it('opens the final-submit confirmation with the current submit action', () => {
    setValidFinalSubmitValues(15);

    component.onSubmit('finalSubmit');

    expect(confirmDialogService.confirm).toHaveBeenCalledOnceWith(SUBMIT_CONFIRM_DIALOG_DEFAULTS, undefined);
    expect(eulbService.finalSubmit).not.toHaveBeenCalled();
  });

  it('sends a complete, typed final-submit payload when confirmation is accepted', () => {
    setValidFinalSubmitValues('15');
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(eulbService.finalSubmit).toHaveBeenCalledTimes(1);
    const payload: EulbFinalSubmitPayload = eulbService.finalSubmit.calls.mostRecent().args[0];
    expect(payload).toEqual({
      stateId,
      yearId,
      data: {
        ulbCount: 15,
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      },
    });
  });

  it('handles final-submit success:false errors without showing success or reloading', () => {
    eulbService.finalSubmit.and.returnValue(
      throwError(() =>
        createApiFailure('Final submit rejected by backend.', {
          ulbCount: [{ field: 'ulbCount', message: 'ULB count is invalid.', code: 'invalidUlbCount' }],
        }),
      ),
    );
    setValidFinalSubmitValues(15);
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(eulbService.finalSubmit).toHaveBeenCalledTimes(1);
    expect(eulbService.getFormData).toHaveBeenCalledTimes(1);
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Final submit rejected by backend.', 'snackbar-danger');
    expect(utilityService.triggerSnackbar).not.toHaveBeenCalledWith('Form submitted successfully.');
    expect(getControl('ulbCount')?.hasError('invalidUlbCount')).toBeTrue();
    expect(getControl('ulbCount')?.dirty).toBeTrue();
    expect(getControl('ulbCount')?.touched).toBeTrue();
  });

  it('handles success:false body with optional data field — data is ignored, message and errors still applied', () => {
    eulbService.finalSubmit.and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Rejected with context data.',
        errors: {
          ulbCount: [{ field: 'ulbCount', message: 'Invalid ULB count.', code: 'invalidUlbCount' }],
        },
        data: { someContext: 'this must not break error parsing' },
      })),
    );
    setValidFinalSubmitValues(15);
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Rejected with context data.', 'snackbar-danger');
    expect(getControl('ulbCount')?.hasError('invalidUlbCount')).toBeTrue();
    expect(eulbService.getFormData).toHaveBeenCalledTimes(1); // no reload on error
  });

  it('does not call final-submit API when the final payload builder cannot narrow values', () => {
    setControlValue('electedBodyExcelFile', fileValue);
    setControlValue('ulbCount', 'not-a-number');
    setControlValue('checkboxConfirmation', true);
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(confirmDialogService.confirm).toHaveBeenCalledOnceWith(SUBMIT_CONFIRM_DIALOG_DEFAULTS, undefined);
    expect(eulbService.finalSubmit).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Please correct the errors in the form before submitting.',
      'snackbar-danger',
    );
  });

  it('does not keep delete-trigger subscriptions from a previous form after reload', () => {
    const previousFileControl = getControl('electedBodyExcelFile');
    expect(previousFileControl).withContext('Expected the initial file control to exist').not.toBeNull();

    eulbService.getFormData.and.returnValue(of(createFormResponse(fileValue)));
    setValidFinalSubmitValues(15);
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(eulbService.getFormData).toHaveBeenCalledTimes(2);
    confirmDialogService.confirm.calls.reset();
    confirmDialogService.confirm.and.returnValue(of(false));

    previousFileControl?.setValue(null);

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
  });

  function setValidFinalSubmitValues(ulbCount: number | string): void {
    setControlValue('electedBodyExcelFile', fileValue);
    setControlValue('ulbCount', ulbCount);
    setControlValue('checkboxConfirmation', true);
  }

  function setControlValue(key: string, value: unknown): void {
    const control = getControl(key);
    expect(control).withContext(`Expected control ${key} to exist`).not.toBeNull();
    control?.setValue(value);
    control?.markAsDirty();
    control?.updateValueAndValidity();
    fixture.detectChanges();
  }

  function getControl(key: string): AbstractControl<unknown, unknown> | null {
    return component.form.get(key);
  }

  function createApiFailure(
    message: string,
    errors: Record<string, { message: string; field?: string; code?: string }[]> = {},
  ) {
    return {
      success: false,
      message,
      errors,
    };
  }

  function createFormResponse(restoredFileValue: EulbFileValue | null = null): EulbFormResponseData {
    return {
      _id: 'eulb-form-1',
      formName: 'Elected Urban Local Bodies',
      stateId,
      yearId,
      stateName: 'Test State',
      currentFormStatus: 1,
      currentFormStatusLabel: 'In Progress',
      permissions: {
        canView: true,
        canEdit: true,
        canFinalSubmit: true,
      },
      actors: [],
      rowEditFields: [],
      questions: createQuestions(restoredFileValue),
    };
  }

  function createQuestions(restoredFileValue: EulbFileValue | null): ConditionalFieldConfig[] {
    return [
      {
        label: 'ULB count',
        key: 'ulbCount',
        formFieldType: 'number',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'ULB count is required.' }],
      },
      {
        label: 'Elected body Excel file',
        key: 'electedBodyExcelFile',
        formFieldType: 'file',
        value: restoredFileValue,
        validations: [{ name: 'required', validator: true, message: 'Excel file is required.' }],
      },
      {
        label: 'Confirmation',
        key: 'checkboxConfirmation',
        formFieldType: 'checkbox',
        value: false,
        validations: [{ name: 'requiredTrue', validator: true, message: 'Confirmation is required.' }],
      },
    ];
  }
});
