import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import FileSaver from 'file-saver';
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
  EulbStatusSummary,
  EulbValidationSummary,
} from './eulb-status.models';
import { EulbStatusService } from './eulb-status.service';
import { EulbRowsDialogComponent } from './dialogs/rows-dialog/eulb-rows-dialog.component';

const mockValidationSummary: EulbValidationSummary = {
  dbUlbCount: 42,
  maxAllowedExcelRows: 42,
  excelRowCount: 42,
  matchedDbUlbCount: 42,
  missingDbUlbCount: 0,
  extraExcelRowCount: 0,
  duplicateUlbCount: 0,
  errorRowCount: 0,
  validationStatus: 'VALID',
  activeDatasetVersion: 1,
};

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
      'downloadElectedBodiesListDocument',
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
      'signedElectedbodyFile',
      'checkboxConfirmation',
    ]);
    expect(Object.keys(component.form.controls)).toEqual([
      'ulbCount',
      'electedBodyExcelFile',
      'signedElectedbodyFile',
      'checkboxConfirmation',
      'electedBodyExcelValidationStatus',
    ]);
  });

  // ─── electedBodyExcelValidationStatus synthetic control ───────────────────
  // Bridges validationSummary (a plain signal, sibling to `questions` in the GET response) into
  // the reactive form so signedElectedbodyFile's backend-driven visibleWhen can gate on Excel
  // *validity*, not just presence — see createFormControls() in the component.

  /**
   * `component.form` is a strictly-typed `FormGroup<{}>` (built via `this.fb.group({})`, then
   * mutated at runtime with `addControl`) — TypeScript doesn't see runtime-added keys, so
   * `.get('electedBodyExcelValidationStatus')` needs an explicit cast rather than the inferred
   * (and here, overly narrow) type.
   */
  function syntheticStatusControl(form: { get(path: string): AbstractControl | null }): AbstractControl | null {
    return form.get('electedBodyExcelValidationStatus');
  }

  it('defaults electedBodyExcelValidationStatus to NOT_VALIDATED when the form has no validationSummary yet', () => {
    expect(syntheticStatusControl(component.form)?.value).toBe('NOT_VALIDATED');
  });

  it('initializes electedBodyExcelValidationStatus from the loaded validationSummary.validationStatus', () => {
    eulbService.getFormData.and.returnValue(
      of({ ...createFormResponse(), validationSummary: { ...mockValidationSummary, validationStatus: 'VALID' } }),
    );
    const summaryFixture = TestBed.createComponent(ElectedBodyStatusComponent);
    summaryFixture.detectChanges();

    expect(syntheticStatusControl(summaryFixture.componentInstance.form)?.value).toBe('VALID');
  });

  it('hides signedElectedbodyFile until electedBodyExcelValidationStatus is VALID, per its visibleWhen', () => {
    const questionsWithGate = createQuestions(fileValue).map((q) =>
      q.key === 'signedElectedbodyFile'
        ? {
            ...q,
            visibleWhen: {
              mode: 'all' as const,
              conditions: [
                { key: 'electedBodyExcelValidationStatus', operator: 'equals' as const, value: 'VALID' as const },
              ],
            },
          }
        : q,
    );
    eulbService.getFormData.and.returnValue(
      of({
        ...createFormResponse(fileValue),
        questions: questionsWithGate,
        validationSummary: { ...mockValidationSummary, validationStatus: 'NOT_VALIDATED' },
      }),
    );
    const gatedFixture = TestBed.createComponent(ElectedBodyStatusComponent);
    gatedFixture.detectChanges();
    const gatedComponent = gatedFixture.componentInstance;

    expect(gatedComponent.fields().find((f) => f.key === 'signedElectedbodyFile')?.hidden).toBeTrue();

    syntheticStatusControl(gatedComponent.form)?.setValue('VALID');

    expect(gatedComponent.fields().find((f) => f.key === 'signedElectedbodyFile')?.hidden).toBeFalse();
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

  describe('showStatusSummary', () => {
    const summary: EulbStatusSummary = {
      totalUlbCount: 10,
      constitutedCount: 7,
      notConstitutedCount: 2,
      exemptCount: 1,
    };

    it('is false when canEdit is true, regardless of formStatus', () => {
      component.permissions.set({ canView: true, canEdit: true, canFinalSubmit: false });
      component.formStatus.set(FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA);
      fixture.detectChanges();

      expect(component.showStatusSummary()).toBeFalse();
    });

    it('is false when formStatus is below UNDER_REVIEW_BY_MOHUA, even if canEdit is false', () => {
      component.permissions.set({ canView: true, canEdit: false, canFinalSubmit: false });
      component.formStatus.set(FORM_STATUS.IN_PROGRESS);
      fixture.detectChanges();

      expect(component.showStatusSummary()).toBeFalse();
    });

    it('is true, and renders the shared summary component, when canEdit is false and formStatus is UNDER_REVIEW_BY_MOHUA or later', () => {
      component.permissions.set({ canView: true, canEdit: false, canFinalSubmit: false });
      component.formStatus.set(FORM_STATUS.UNDER_REVIEW_BY_MOHUA);
      component.statusSummary.set(summary);
      fixture.detectChanges();

      expect(component.showStatusSummary()).toBeTrue();
      expect(fixture.debugElement.query(By.css('[data-testid="status-summary-section"]'))).not.toBeNull();
    });

    // Regression-lock: RETURNED_BY_MOHUA (6) is >= UNDER_REVIEW_BY_MOHUA (5), but the form is
    // editable again in that status, so canEdit is true and the summary must stay hidden.
    it('is false at RETURNED_BY_MOHUA even though its status value is >= UNDER_REVIEW_BY_MOHUA, because the form is editable again', () => {
      component.permissions.set({ canView: true, canEdit: true, canFinalSubmit: false });
      component.formStatus.set(FORM_STATUS.RETURNED_BY_MOHUA);
      component.statusSummary.set(summary);
      fixture.detectChanges();

      expect(component.showStatusSummary()).toBeFalse();
      expect(fixture.debugElement.query(By.css('[data-testid="status-summary-section"]'))).toBeNull();
    });
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
        signedElectedbodyFile: undefined,
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
        signedElectedbodyFile: fileValue,
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
    setControlValue('signedElectedbodyFile', fileValue);
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
      duplicateUlbCount: 0,
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

  it('validateExcel 400 with newUlbsAdded shows a danger snackbar with the specific backend message', () => {
    eulbService.validateExcel.and.returnValue(
      throwError(() => ({
        error: {
          statusCode: 400,
          message: 'Validation failed.',
          errors: {
            electedBodyExcelFile: [
              {
                field: 'electedBodyExcelFile',
                message: 'You have added 1 ULB(s) not registered in City Finance. Please register before proceeding.',
                code: 'newUlbsAdded',
              },
            ],
          },
        },
      })),
    );
    utilityService.triggerSnackbar.calls.reset();

    setControlValue('electedBodyExcelFile', fileValue);

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'You have added 1 ULB(s) not registered in City Finance. Please register before proceeding.',
      'snackbar-danger',
    );
  });

  it('revalidateUploadedExcel 400 with newUlbsAdded shows a danger snackbar with the specific backend message', () => {
    eulbService.revalidateUploadedExcel.and.returnValue(
      throwError(() => ({
        error: {
          statusCode: 400,
          message: 'Validation failed.',
          errors: {
            electedBodyExcelFile: [
              {
                field: 'electedBodyExcelFile',
                message: 'You have added 2 ULB(s) not registered in City Finance. Please register before proceeding.',
                code: 'newUlbsAdded',
              },
            ],
          },
        },
      })),
    );
    utilityService.triggerSnackbar.calls.reset();

    component.onSupportingAction({ fieldKey: 'electedBodyExcelFile', actionId: 'revalidate-excel' });

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'You have added 2 ULB(s) not registered in City Finance. Please register before proceeding.',
      'snackbar-danger',
    );
  });

  it('validateExcel 200 INVALID with a duplicate row shows the specific duplicate message as a second snackbar', () => {
    const summary = {
      dbUlbCount: 42,
      maxAllowedExcelRows: 42,
      excelRowCount: 42,
      matchedDbUlbCount: 42,
      missingDbUlbCount: 0,
      extraExcelRowCount: 0,
      duplicateUlbCount: 0,
      errorRowCount: 1,
      validationStatus: 'INVALID' as const,
      activeDatasetVersion: 1,
    };
    eulbService.validateExcel.and.returnValue(
      of({
        data: {
          validationStatus: 'INVALID',
          summary,
          errors: [
            {
              field: 'censusCode',
              code: 'duplicate',
              message: 'A ULB with this census code already exists for the selected design year.',
            },
          ],
        },
      }),
    );
    utilityService.triggerSnackbar.calls.reset();

    setControlValue('electedBodyExcelFile', fileValue);

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Excel validation completed with errors. Please review uploaded data.',
      'snackbar-danger',
    );
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'A ULB with this census code already exists for the selected design year.',
      'snackbar-danger',
    );
  });

  it('revalidateUploadedExcel success with a duplicate row shows the specific duplicate message as a second snackbar', () => {
    const validationSummary = {
      dbUlbCount: 42,
      maxAllowedExcelRows: 42,
      excelRowCount: 42,
      matchedDbUlbCount: 42,
      missingDbUlbCount: 0,
      extraExcelRowCount: 0,
      duplicateUlbCount: 0,
      errorRowCount: 1,
      validationStatus: 'INVALID' as const,
      activeDatasetVersion: 1,
    };
    eulbService.revalidateUploadedExcel.and.returnValue(
      of({
        success: true,
        message: 'Excel revalidation completed with errors.',
        data: {
          validationSummary,
          errors: [
            {
              field: 'censusCode',
              code: 'duplicate',
              message: 'A ULB with this census code already exists for the selected design year.',
            },
          ],
        },
      }),
    );
    utilityService.triggerSnackbar.calls.reset();

    component.onSupportingAction({ fieldKey: 'electedBodyExcelFile', actionId: 'revalidate-excel' });

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Excel revalidation completed with errors.');
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'A ULB with this census code already exists for the selected design year.',
      'snackbar-danger',
    );
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

  // ─── view-uploaded-data supporting action ─────────────────────────────────

  describe('view-uploaded-data supporting action', () => {
    beforeEach(() => {
      dialog.open.and.returnValue({ afterClosed: () => of({}) } as unknown as MatDialogRef<unknown>);
    });

    it('opens the rows dialog with stateId, yearId, rowEditFields, and canEdit', () => {
      component.onSupportingAction({ fieldKey: 'electedBodyExcelFile', actionId: 'view-uploaded-data' });

      expect(dialog.open).toHaveBeenCalledOnceWith(
        EulbRowsDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({ stateId, yearId, canEdit: true }),
        }),
      );
    });

    it('passes initialValidationStatusFilter: INVALID when the loaded form has row errors', () => {
      eulbService.getFormData.and.returnValue(
        of({ ...createFormResponse(), validationSummary: { ...mockValidationSummary, errorRowCount: 3 } }),
      );
      const summaryFixture = TestBed.createComponent(ElectedBodyStatusComponent);
      summaryFixture.detectChanges();
      dialog.open.calls.reset();

      summaryFixture.componentInstance.onSupportingAction({
        fieldKey: 'electedBodyExcelFile',
        actionId: 'view-uploaded-data',
      });

      const callArgs = dialog.open.calls.mostRecent().args[1] as { data: { initialValidationStatusFilter?: string } };
      expect(callArgs.data.initialValidationStatusFilter).toBe('INVALID');
    });

    it('passes no filter (defaults to All) when there are no row errors', () => {
      eulbService.getFormData.and.returnValue(
        of({ ...createFormResponse(), validationSummary: { ...mockValidationSummary, errorRowCount: 0 } }),
      );
      const summaryFixture = TestBed.createComponent(ElectedBodyStatusComponent);
      summaryFixture.detectChanges();
      dialog.open.calls.reset();

      summaryFixture.componentInstance.onSupportingAction({
        fieldKey: 'electedBodyExcelFile',
        actionId: 'view-uploaded-data',
      });

      const callArgs = dialog.open.calls.mostRecent().args[1] as { data: { initialValidationStatusFilter?: string } };
      expect(callArgs.data.initialValidationStatusFilter).toBeUndefined();
    });

    it('passes no filter when the form has never loaded a validationSummary', () => {
      component.onSupportingAction({ fieldKey: 'electedBodyExcelFile', actionId: 'view-uploaded-data' });

      const callArgs = dialog.open.calls.mostRecent().args[1] as { data: { initialValidationStatusFilter?: string } };
      expect(callArgs.data.initialValidationStatusFilter).toBeUndefined();
    });
  });

  // ─── downloadElectedBodiesListDocument (signedElectedbodyFile field) ──────

  describe('download-elected-bodies-list supporting action', () => {
    it('routes download-elected-bodies-list actions on signedElectedbodyFile to the download service call', () => {
      eulbService.downloadElectedBodiesListDocument.and.returnValue(of({ blob: new Blob(['docx']), fileName: null }));

      component.onSupportingAction({ fieldKey: 'signedElectedbodyFile', actionId: 'download-elected-bodies-list' });

      expect(eulbService.downloadElectedBodiesListDocument).toHaveBeenCalledOnceWith(stateId, yearId);
    });

    it('does not dispatch when the action id is for a different field', () => {
      component.onSupportingAction({ fieldKey: 'electedBodyExcelFile', actionId: 'download-elected-bodies-list' });

      expect(eulbService.downloadElectedBodiesListDocument).not.toHaveBeenCalled();
    });

    it('saves the returned blob via FileSaver and shows a success snackbar, falling back to a literal filename when Content-Disposition is absent', () => {
      const blob = new Blob(['docx content']);
      eulbService.downloadElectedBodiesListDocument.and.returnValue(of({ blob, fileName: null }));
      spyOn(FileSaver, 'saveAs');
      utilityService.triggerSnackbar.calls.reset();

      component.onSupportingAction({ fieldKey: 'signedElectedbodyFile', actionId: 'download-elected-bodies-list' });

      expect(FileSaver.saveAs).toHaveBeenCalledOnceWith(blob, 'Elected-body-list.docx');
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Elected bodies list downloaded successfully.');
      expect(component.isDownloadingElectedBodiesList()).toBeFalse();
    });

    it('saves the returned blob under the backend Content-Disposition filename verbatim when present', () => {
      const blob = new Blob(['docx content']);
      eulbService.downloadElectedBodiesListDocument.and.returnValue(
        of({ blob, fileName: 'CF_Test-State_elected-bodies-list_2024-25.docx' }),
      );
      spyOn(FileSaver, 'saveAs');

      component.onSupportingAction({ fieldKey: 'signedElectedbodyFile', actionId: 'download-elected-bodies-list' });

      expect(FileSaver.saveAs).toHaveBeenCalledOnceWith(blob, 'CF_Test-State_elected-bodies-list_2024-25.docx');
    });

    it('on a 400 gate failure, shows the backend message and stamps it onto the signedElectedbodyFile control', async () => {
      const body = {
        message: 'No elected-body rows found for this state and year.',
        statusCode: 400,
        errors: {
          signedElectedbodyFile: [
            {
              field: 'signedElectedbodyFile',
              code: 'noRows',
              message: 'No elected-body rows found for this state and year.',
            },
          ],
        },
      };
      eulbService.downloadElectedBodiesListDocument.and.returnValue(
        throwError(() => ({ error: new Blob([JSON.stringify(body)], { type: 'application/json' }) })),
      );
      utilityService.triggerSnackbar.calls.reset();

      component.onSupportingAction({ fieldKey: 'signedElectedbodyFile', actionId: 'download-elected-bodies-list' });
      // Blob.text() (used by parseBlobErrorResponse) resolves via the browser's real async I/O,
      // not zone.js-tracked microtasks alone — fixture.whenStable() doesn't reliably wait for it.
      // A fixed delay is flaky under a heavier test-suite load (observed failing at 50ms when run
      // alongside ~1400 other specs), so poll for the actual outcome instead of guessing a duration.
      await waitUntil(() => utilityService.triggerSnackbar.calls.count() > 0);

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'No elected-body rows found for this state and year.',
        'snackbar-danger',
      );
      const control = getControl('signedElectedbodyFile');
      expect(control?.errors?.['noRows']).toBeTruthy();
      // The control is untouched/empty at this point (state hasn't uploaded yet — that's the
      // whole point of clicking "download" first), so Angular's own `required` validator is also
      // tripped at the same time as the stamped `noRows` error. FileComponent.errorMessage()
      // displays whichever validation entry comes FIRST in the field's `validations` array among
      // those present in control.errors — regression guard for the bug where `noRows` landed
      // after `required` (via .push()) and got shadowed by the generic "This field is required."
      // message. `noRows` must be unshifted to the front so it wins display priority.
      expect(control?.errors?.['required']).toBeTruthy();
      const signedField = component.fields().find((f) => f.key === 'signedElectedbodyFile');
      expect(signedField?.validations?.[0]?.name).toBe('noRows');
      expect(signedField?.validations?.[0]?.message).toBe('No elected-body rows found for this state and year.');
      expect(component.isDownloadingElectedBodiesList()).toBeFalse();
    });
  });

  // ─── action loading state (effectiveVisibleFields) ─────────────────────────

  describe('effectiveVisibleFields — download button loading state', () => {
    beforeEach(() => {
      // The default fixture's electedBodyExcelFile/signedElectedbodyFile questions carry no
      // supportingContent (it's backend-injected in production) — add realistic action configs so
      // effectiveVisibleFields() has something to patch.
      component.fields.update((fields) =>
        fields.map((field) => {
          if (field.key === 'electedBodyExcelFile') {
            return {
              ...field,
              supportingContent: [
                {
                  type: 'actions' as const,
                  actions: [
                    { id: 'download-template', label: 'Download the template' },
                    { id: 'download-error-sheet', label: 'Download error sheet' },
                  ],
                },
              ],
            };
          }
          if (field.key === 'signedElectedbodyFile') {
            return {
              ...field,
              supportingContent: [
                {
                  type: 'actions' as const,
                  actions: [{ id: 'download-elected-bodies-list', label: 'Download elected bodies list' }],
                },
              ],
            };
          }
          return field;
        }),
      );
    });

    function findAction(fieldKey: string, actionId: string) {
      const field = component.effectiveVisibleFields().find((f) => f.key === fieldKey);
      const block = field?.supportingContent?.find((b) => b.type === 'actions');
      return block && block.type === 'actions' ? block.actions.find((a) => a.id === actionId) : undefined;
    }

    it('passes an unrelated field through by reference', () => {
      const confirmationField = component.fields().find((f) => f.key === 'checkboxConfirmation');
      expect(component.effectiveVisibleFields().find((f) => f.key === 'checkboxConfirmation')).toBe(confirmationField);
    });

    it('shows loading on download-template while downloadTemplate() is in flight, independent of download-error-sheet', () => {
      const subject = new Subject<{ blob: Blob; fileName: null }>();
      eulbService.downloadTemplate.and.returnValue(subject);

      component.downloadTemplate();

      expect(findAction('electedBodyExcelFile', 'download-template')?.loading).toBeTrue();
      expect(findAction('electedBodyExcelFile', 'download-template')?.loadingLabel).toBe('Downloading template…');
      expect(findAction('electedBodyExcelFile', 'download-error-sheet')?.loading).toBeFalsy();

      subject.next({ blob: new Blob(['x']), fileName: null });
      subject.complete();

      expect(findAction('electedBodyExcelFile', 'download-template')?.loading).toBeFalsy();
    });

    it('shows loading on download-error-sheet while downloadErrorSheet() is in flight', () => {
      const subject = new Subject<{ blob: Blob; fileName: null }>();
      eulbService.downloadErrorSheet.and.returnValue(subject);

      component.downloadErrorSheet();

      expect(findAction('electedBodyExcelFile', 'download-error-sheet')?.loading).toBeTrue();
      expect(findAction('electedBodyExcelFile', 'download-template')?.loading).toBeFalsy();

      subject.next({ blob: new Blob(['x']), fileName: null });
      subject.complete();

      expect(findAction('electedBodyExcelFile', 'download-error-sheet')?.loading).toBeFalsy();
    });

    it('shows loading on download-elected-bodies-list while downloadElectedBodiesListDocument() is in flight', () => {
      const subject = new Subject<{ blob: Blob; fileName: null }>();
      eulbService.downloadElectedBodiesListDocument.and.returnValue(subject);

      component.onSupportingAction({ fieldKey: 'signedElectedbodyFile', actionId: 'download-elected-bodies-list' });

      expect(findAction('signedElectedbodyFile', 'download-elected-bodies-list')?.loading).toBeTrue();
      expect(findAction('signedElectedbodyFile', 'download-elected-bodies-list')?.loadingLabel).toBe(
        'Downloading list…',
      );

      subject.next({ blob: new Blob(['docx']), fileName: null });
      subject.complete();

      expect(findAction('signedElectedbodyFile', 'download-elected-bodies-list')?.loading).toBeFalsy();
    });
  });

  function setValidFinalSubmitValues(): void {
    setControlValue('electedBodyExcelFile', fileValue);
    setControlValue('signedElectedbodyFile', fileValue);
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

  /** Polls `predicate` until it's true, instead of guessing a fixed delay — needed for assertions
   *  that depend on `Blob.text()`'s real async I/O, which isn't tracked by zone.js/`fixture.whenStable()`
   *  and so can't be reliably awaited with a single fixed-duration `setTimeout`. */
  async function waitUntil(predicate: () => boolean, timeoutMs = 2000, intervalMs = 10): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (!predicate()) {
      if (Date.now() > deadline) throw new Error('waitUntil: timed out waiting for condition');
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
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
        label: 'Upload Signed elected bodies list',
        key: 'signedElectedbodyFile',
        formFieldType: 'file',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
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

  // ─── hasUnsavedChanges (read by unsavedChangesGuard / beforeunload) ────────

  describe('hasUnsavedChanges', () => {
    it('is false right after the form loads', () => {
      expect(component.hasUnsavedChanges()).toBeFalse();
    });

    it('is true once the user edits a field', () => {
      getControl('ulbCount')?.markAsDirty();

      expect(component.hasUnsavedChanges()).toBeTrue();
    });

    it('is false when the form is dirty but the page is read-only (canEdit is false)', () => {
      component.permissions.set({ canView: true, canEdit: false, canFinalSubmit: false });
      component.form.markAsDirty();

      expect(component.hasUnsavedChanges()).toBeFalse();
    });
  });
});
