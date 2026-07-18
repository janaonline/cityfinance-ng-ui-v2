import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
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
import { FORM_STATUS, FormActor, FormProgressComponent } from '../../shared/form-progress/form-progress.component';
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
    originalName: 'eulb.xlsx',
    path: 'https://example.test/eulb.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeKb: 1,
    pageCount: null,
  };

  let component: ElectedBodyStatusComponent;
  let fixture: ComponentFixture<ElectedBodyStatusComponent>;
  let eulbService: jasmine.SpyObj<EulbStatusService>;
  let moduleService: jasmine.SpyObj<XvifcModuleService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let router: jasmine.SpyObj<Router>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let parentRoute: object;

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
    eulbService.validateExcel.and.returnValue(EMPTY);

    moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue(yearId);

    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    parentRoute = {};

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
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { parent: parentRoute } },
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

  it('shows the post-submission update button when form status is under review by MoHUA', () => {
    component.formStatus.set(FORM_STATUS.UNDER_REVIEW_BY_MOHUA);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="update-elected-body-test"]'))).not.toBeNull();
  });

  it('shows the post-submission update button when form status is acknowledged by MoHUA', () => {
    component.formStatus.set(FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="update-elected-body-test"]'))).not.toBeNull();
  });

  it('hides the post-submission update button when form status is not eligible', () => {
    component.formStatus.set(FORM_STATUS.IN_PROGRESS);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="update-elected-body-test"]'))).toBeNull();
  });

  it('navigates to the post-submission update route when the update button is clicked', () => {
    component.formStatus.set(FORM_STATUS.UNDER_REVIEW_BY_MOHUA);
    fixture.detectChanges();

    fixture.debugElement.query(By.css('[data-cy="update-elected-body-test"]')).nativeElement.click();

    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['elected-body-post-update'],
      jasmine.objectContaining({ relativeTo: parentRoute }),
    );
  });

  it('allows save-as-draft when required confirmation is not checked (requiredTrue is temporarily not mandatory for drafts)', () => {
    component.onSubmit('saveAsDraft');

    expect(confirmDialogService.confirm).toHaveBeenCalledOnceWith(SAVE_AS_DRAFT_DIALOG_DEFAULTS, undefined);
    expect(utilityService.triggerSnackbar).not.toHaveBeenCalledWith(
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
    setValidFinalSubmitValues();

    component.onSubmit('finalSubmit');

    expect(confirmDialogService.confirm).toHaveBeenCalledOnceWith(SUBMIT_CONFIRM_DIALOG_DEFAULTS, undefined);
    expect(eulbService.finalSubmit).not.toHaveBeenCalled();
  });

  it('sends a complete, typed final-submit payload when confirmation is accepted', () => {
    setValidFinalSubmitValues();
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(eulbService.finalSubmit).toHaveBeenCalledTimes(1);
    const payload: EulbFinalSubmitPayload = eulbService.finalSubmit.calls.mostRecent().args[0];
    expect(payload).toEqual({
      stateId,
      yearId,
      data: {
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      },
    });
  });

  it('handles final-submit success:false errors without showing success or reloading', () => {
    eulbService.finalSubmit.and.returnValue(
      throwError(() =>
        createApiFailure('Final submit rejected by backend.', {
          electedBodyExcelFile: [{ field: 'electedBodyExcelFile', message: 'File is invalid.', code: 'invalidFile' }],
        }),
      ),
    );
    setValidFinalSubmitValues();
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(eulbService.finalSubmit).toHaveBeenCalledTimes(1);
    expect(eulbService.getFormData).toHaveBeenCalledTimes(1);
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Final submit rejected by backend.', 'snackbar-danger');
    expect(utilityService.triggerSnackbar).not.toHaveBeenCalledWith('Form submitted successfully.');
    expect(getControl('electedBodyExcelFile')?.hasError('invalidFile')).toBeTrue();
  });

  it('handles success:false body with optional data field — data is ignored, message and errors still applied', () => {
    eulbService.finalSubmit.and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Rejected with context data.',
        errors: {
          electedBodyExcelFile: [{ field: 'electedBodyExcelFile', message: 'File error.', code: 'invalidFile' }],
        },
        data: { someContext: 'this must not break error parsing' },
      })),
    );
    setValidFinalSubmitValues();
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Rejected with context data.', 'snackbar-danger');
    expect(getControl('electedBodyExcelFile')?.hasError('invalidFile')).toBeTrue();
    expect(eulbService.getFormData).toHaveBeenCalledTimes(1); // no reload on error
  });

  it('does not call final-submit API when electedBodyExcelFile fails the validity check', () => {
    // Partial file object: passes Angular required validator (non-null object) but fails isValidEulbFileValue
    setControlValue('electedBodyExcelFile', { originalName: '', path: '', sizeKb: 0 });
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
    setValidFinalSubmitValues();
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    expect(eulbService.getFormData).toHaveBeenCalledTimes(2);
    confirmDialogService.confirm.calls.reset();
    confirmDialogService.confirm.and.returnValue(of(false));

    previousFileControl?.setValue(null);

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
  });

  it('creates the ulbCount control as disabled with the backend-supplied value', () => {
    const control = getControl('ulbCount');
    expect(control?.disabled).toBeTrue();
    expect(control?.value).toBe(42);
  });

  it('save-draft payload sends ulbCount as undefined (excluded from JSON by includeInPayload:false)', () => {
    setControlValue('checkboxConfirmation', true);
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('saveAsDraft');

    const payload: EulbSaveDraftPayload = eulbService.saveDraft.calls.mostRecent().args[0];
    expect(payload.data.ulbCount)
      .withContext('ulbCount should not carry a numeric value to the backend')
      .toBeUndefined();
  });

  it('final-submit payload does not include ulbCount', () => {
    setValidFinalSubmitValues();
    confirmDialogService.confirm.and.returnValue(of(true));

    component.onSubmit('finalSubmit');

    const payload: EulbFinalSubmitPayload = eulbService.finalSubmit.calls.mostRecent().args[0];
    expect(Object.prototype.hasOwnProperty.call(payload.data, 'ulbCount'))
      .withContext('ulbCount key should not appear in final-submit payload')
      .toBeFalse();
  });

  it('validateExcel is called when file is uploaded even though ulbCount is backend-disabled', () => {
    const validationSummary = {
      dbUlbCount: 42,
      maxAllowedExcelRows: 42,
      excelRowCount: 42,
      matchedDbUlbCount: 42,
      missingDbUlbCount: 0,
      extraExcelRowCount: 0,
      errorRowCount: 0,
      validationStatus: 'VALID' as const,
      activeDatasetVersion: 1,
    };
    eulbService.validateExcel.and.returnValue(of({ data: { validationStatus: 'VALID', summary: validationSummary } }));

    setControlValue('electedBodyExcelFile', fileValue);

    const validateCallArg = eulbService.validateExcel.calls.mostRecent().args[0] as unknown as Record<string, unknown>;
    expect(validateCallArg['electedBodyExcelFile']).toEqual(fileValue);
    expect(Object.prototype.hasOwnProperty.call(validateCallArg, 'ulbCount'))
      .withContext('ulbCount must not be sent to validateExcel')
      .toBeFalse();
  });

  it('validateExcel 400 with newUlbsAdded applies field error to electedBodyExcelFile', () => {
    eulbService.validateExcel.and.returnValue(
      throwError(() => ({
        error: {
          statusCode: 400,
          message: 'Excel contains extra ULB rows not registered on City Finance.',
          errors: {
            electedBodyExcelFile: [
              { field: 'electedBodyExcelFile', message: 'Extra rows found.', code: 'newUlbsAdded' },
            ],
          },
        },
      })),
    );

    setControlValue('electedBodyExcelFile', fileValue);

    expect(eulbService.validateExcel).toHaveBeenCalledTimes(1);
    expect(getControl('electedBodyExcelFile')?.hasError('newUlbsAdded')).toBeTrue();
  });

  it('register-ulb supporting action navigates to /xvifc/:yearId/register-ulb', () => {
    component.onSupportingAction({ fieldKey: 'electedBodyExcelFile', actionId: 'register-ulb' });

    expect(router.navigate).toHaveBeenCalledOnceWith(['/xvifc', yearId, 'register-ulb']);
  });

  it('register-ulb is not navigated when action is for a different field', () => {
    router.navigate.calls.reset();
    component.onSupportingAction({ fieldKey: 'ulbCount', actionId: 'register-ulb' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  function setValidFinalSubmitValues(): void {
    setControlValue('electedBodyExcelFile', fileValue);
    setControlValue('checkboxConfirmation', true);
  }

  function setControlValue(key: string, value: unknown): void {
    const control = getControl(key);
    expect(control).withContext(`Expected control ${key} to exist`).not.toBeNull();
    control?.setValue(value);
    control?.markAsDirty();
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
        label: 'Active ULBs Registered on City Finance as of March 31, 2026',
        key: 'ulbCount',
        formFieldType: 'number',
        value: 42,
        disabled: true,
        includeInPayload: false,
        disabledReason: 'This value is automatically computed from City Finance registered active ULBs.',
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
