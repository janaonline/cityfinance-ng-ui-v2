import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import FileSaver from 'file-saver';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { UtilityService } from '../../../../core/services/utility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import {
  DevolutionFormResponseData,
  DevolutionGrantAllocationSummary,
  DevolutionInstallmentAccess,
  DevolutionPermissions,
  DevolutionValidationSummary,
} from './devolution-formula.models';
import { DevolutionFormulaService } from './devolution-formula.service';
import { DevolutionFormulaComponent } from './devolution-formula.component';
import { DevolutionFormulaRowsDialogComponent } from './dialogs/rows-dialog/devolution-formula-rows-dialog.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';

const mockFileValue = { fileName: 'test.xlsx', fileUrl: 'https://example.com/test.xlsx' };

const mockValidationSummary: DevolutionValidationSummary = {
  validationStatus: 'VALID',
  excelRowCount: 100,
  validRowCount: 98,
  errorRowCount: 2,
  missingUlbCount: 1,
  totalMoHUAAllocation: 50000000,
  totalAllocatedSum: 49000000,
  allUlbsCovered: false,
  allocationBalanced: false,
  activeDatasetVersion: 3,
};

const mockGrantAllocationSummary: DevolutionGrantAllocationSummary = {
  grantAllocationId: 'ga-1',
  basic: 30000000,
  performance: 20000000,
  total: 50000000,
};

const unlockedInstallmentAccess: DevolutionInstallmentAccess = {
  installment1: { canSelect: true, locked: false, lockReason: null },
  installment2: { canSelect: true, locked: false, lockReason: null },
};

const lockedInstallmentAccess: DevolutionInstallmentAccess = {
  installment1: { canSelect: true, locked: false, lockReason: null },
  installment2: { canSelect: false, locked: true, lockReason: null },
};

const minimalFormData: DevolutionFormResponseData = {
  _id: 'form-1',
  formName: 'Devolution Formula',
  stateId: 'state-1',
  yearId: 'year-1',
  installment: 1,
  stateName: 'Test State',
  currentFormStatus: 1,
  currentFormStatusLabel: 'Not Started',
  questions: [
    { key: 'excelFile', formFieldType: 'file', label: 'Devolution Excel File', value: null },
    {
      key: 'ulbCount',
      formFieldType: 'number',
      label: 'How many ULBs are there in the state as of March 31, 2026?',
      value: null,
      validations: [
        { name: 'required', validator: null, message: 'ULB count is required.' },
        { name: 'min', validator: 1, message: 'ULB count must be at least 1.' },
      ],
    },
    {
      key: 'checkboxConfirmation',
      formFieldType: 'checkbox',
      label: 'I confirm the data',
      value: null,
      validations: [{ name: 'requiredTrue', validator: null, message: 'Required' }],
    },
  ],
  permissions: { canView: true, canEdit: true, canFinalSubmit: false },
  actors: [],
  installmentAccess: unlockedInstallmentAccess,
};

const formDataWithFile: DevolutionFormResponseData = {
  ...minimalFormData,
  questions: [
    { key: 'excelFile', formFieldType: 'file', label: 'Devolution Excel File', value: mockFileValue },
    {
      key: 'ulbCount',
      formFieldType: 'number',
      label: 'How many ULBs are there in the state as of March 31, 2026?',
      value: 100,
      validations: [
        { name: 'required', validator: null, message: 'ULB count is required.' },
        { name: 'min', validator: 1, message: 'ULB count must be at least 1.' },
      ],
    },
    {
      key: 'checkboxConfirmation',
      formFieldType: 'checkbox',
      label: 'I confirm the data',
      value: null,
      validations: [{ name: 'requiredTrue', validator: null, message: 'Required' }],
    },
  ],
};

describe('DevolutionFormulaComponent', () => {
  let component: DevolutionFormulaComponent;
  let fixture: ComponentFixture<DevolutionFormulaComponent>;
  let dfService: jasmine.SpyObj<DevolutionFormulaService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let dialogOpenSpy: jasmine.Spy;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<unknown>>;
  let moduleService: { yearId: ReturnType<typeof signal<string | null>> };

  beforeEach(async () => {
    dfService = jasmine.createSpyObj<DevolutionFormulaService>('DevolutionFormulaService', [
      'getForm',
      'saveDraft',
      'finalSubmit',
      'validateExcel',
      'revalidateExcel',
      'downloadTemplate',
      'downloadErrorSheet',
      'deleteUploadedExcel',
    ]);
    dfService.getForm.and.returnValue(of(minimalFormData));
    dfService.saveDraft.and.returnValue(of(undefined));
    dfService.finalSubmit.and.returnValue(of(undefined));
    const fullValidationSummaryMock: DevolutionValidationSummary = {
      validationStatus: 'VALID',
      excelRowCount: 10,
      validRowCount: 10,
      errorRowCount: 0,
      missingUlbCount: 0,
      totalMoHUAAllocation: 5000000,
      totalAllocatedSum: 5000000,
      allUlbsCovered: true,
      allocationBalanced: true,
      activeDatasetVersion: 1,
    };
    dfService.validateExcel.and.returnValue(
      of({
        success: true,
        data: { validationStatus: 'VALID' as const, validationSummary: fullValidationSummaryMock },
        timestamp: '',
      }),
    );
    dfService.revalidateExcel.and.returnValue(
      of({
        success: true,
        data: { validationSummary: fullValidationSummaryMock },
        timestamp: '',
      }),
    );
    dfService.downloadTemplate.and.returnValue(of(new Blob(['template'])));
    dfService.downloadErrorSheet.and.returnValue(of(new Blob(['errors'])));
    dfService.deleteUploadedExcel.and.returnValue(of({ success: true, data: {}, timestamp: '' }));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', [
      'triggerSnackbar',
      'getNonEmptyString',
      'formatBytes',
      'getFileNameFromUrl',
    ]);
    utilityService.getNonEmptyString.and.callFake((value: unknown): string | null =>
      typeof value === 'string' && value.trim().length > 0 ? value.trim() : null,
    );
    utilityService.formatBytes.and.callFake((bytes: number): string => `${bytes} Bytes`);
    utilityService.getFileNameFromUrl.and.callFake((fileUrl: string): string => {
      const pathSegment = fileUrl.split(/[?#]/)[0];
      const segments = pathSegment.split('/');
      return segments[segments.length - 1] ?? '';
    });

    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(true));

    mockDialogRef = jasmine.createSpyObj<MatDialogRef<unknown>>('MatDialogRef', ['afterClosed', 'close']);
    mockDialogRef.afterClosed.and.returnValue(of({}));
    dialogOpenSpy = jasmine.createSpy('MatDialog.open').and.returnValue(mockDialogRef);

    moduleService = { yearId: signal<string | null>('year-1') };

    spyOn(Storage.prototype, 'getItem').and.returnValue(JSON.stringify({ state: 'state-1' }));
    spyOn(FileSaver, 'saveAs');

    await TestBed.configureTestingModule({
      providers: [
        { provide: DevolutionFormulaService, useValue: dfService },
        { provide: UtilityService, useValue: utilityService },
        { provide: XvifcModuleService, useValue: moduleService },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
      ],
      imports: [HttpClientTestingModule, NoopAnimationsModule, RouterTestingModule, DevolutionFormulaComponent],
    })
      // overrideProvider forcefully replaces even providedIn:'root' singletons
      .overrideProvider(MatDialog, { useValue: { open: dialogOpenSpy } })
      .compileComponents();

    fixture = TestBed.createComponent(DevolutionFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── loadForm() ──────────────────────────────────────────────────────────────

  describe('loadForm()', () => {
    it('calls getForm with stateId, yearId, and installment 1 on init', () => {
      expect(dfService.getForm).toHaveBeenCalledOnceWith('state-1', 'year-1', 1);
    });

    it('populates stateName signal from the API response', () => {
      expect(component.stateName()).toBe('Test State');
    });

    it('populates permissions signal from the API response', () => {
      const expected: DevolutionPermissions = { canView: true, canEdit: true, canFinalSubmit: false };
      expect(component.permissions()).toEqual(expected);
    });

    it('sets isLoading to false after a successful response', () => {
      expect(component.isLoading()).toBeFalse();
    });

    it('stores rowEditFields from the GET form response', () => {
      const fields = [{ key: 'totalGrantAllocation', formFieldType: 'number', label: 'Total', validations: [] }];
      dfService.getForm.and.returnValue(of({ ...minimalFormData, rowEditFields: fields }));

      const fixture5 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture5.detectChanges();

      expect(fixture5.componentInstance.rowEditFields()).toEqual(fields);
    });

    it('defaults rowEditFields to an empty array when absent from the response', () => {
      expect(component.rowEditFields()).toEqual([]);
    });

    it('shows a snackbar and does not call getForm when stateId is missing', async () => {
      (Storage.prototype.getItem as jasmine.Spy).and.returnValue(JSON.stringify({ state: '' }));
      dfService.getForm.calls.reset();
      utilityService.triggerSnackbar.calls.reset();

      const fixture2 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture2.detectChanges();

      expect(dfService.getForm).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
        'Unable to load Devolution Formula form. Please try again.',
        'snackbar-danger',
      );
    });

    it('shows a snackbar and does not call getForm when yearId is missing', async () => {
      moduleService.yearId.set(null);
      dfService.getForm.calls.reset();
      utilityService.triggerSnackbar.calls.reset();

      const fixture3 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture3.detectChanges();

      expect(dfService.getForm).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
        'Unable to load Devolution Formula form. Please try again.',
        'snackbar-danger',
      );
    });

    it('shows a snackbar and sets isLoading to false on API error', () => {
      dfService.getForm.and.returnValue(throwError(() => new Error('network error')));
      utilityService.triggerSnackbar.calls.reset();

      const fixture4 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture4.detectChanges();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
        'Unable to load Devolution Formula form. Please try again.',
        'snackbar-danger',
      );
      expect(fixture4.componentInstance.isLoading()).toBeFalse();
    });
  });

  // ─── canEdit / canFinalSubmit computed ───────────────────────────────────────

  describe('canEdit / canFinalSubmit computed', () => {
    it('derives canEdit from the permissions signal', () => {
      expect(component.canEdit()).toBeTrue();
    });

    it('derives canFinalSubmit from the permissions signal', () => {
      expect(component.canFinalSubmit()).toBeFalse();
    });
  });

  // ─── createFormControls() ────────────────────────────────────────────────────

  describe('createFormControls()', () => {
    it('creates an excelFile form control from the API questions', () => {
      expect(component.form.get('excelFile')).not.toBeNull();
    });

    it('creates a checkboxConfirmation form control from the API questions', () => {
      expect(component.form.get('checkboxConfirmation')).not.toBeNull();
    });

    it('shows a snackbar and stops form build when field.key is missing', () => {
      component.fields.set([{ key: '', formFieldType: 'text', label: 'Bad' }]);
      utilityService.triggerSnackbar.calls.reset();

      component.createFormControls();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Invalid field configuration.', 'snackbar-danger');
      expect(component.isLoading()).toBeFalse();
    });

    it('shows a snackbar and stops form build when field.formFieldType is missing', () => {
      component.fields.set([{ key: 'someKey', formFieldType: '', label: 'Bad' }]);
      utilityService.triggerSnackbar.calls.reset();

      component.createFormControls();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Invalid field configuration.', 'snackbar-danger');
      expect(component.form.get('someKey')).toBeNull();
    });

    it('disables all form controls when canEdit is false', () => {
      const viewOnlyData: DevolutionFormResponseData = {
        ...minimalFormData,
        permissions: { canView: true, canEdit: false, canFinalSubmit: false },
      };
      dfService.getForm.and.returnValue(of(viewOnlyData));

      const fixture7 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture7.detectChanges();

      const comp = fixture7.componentInstance;
      expect(comp.form.disabled).toBeTrue();
    });

    it('renders one DynamicFormComponent per visible field', () => {
      fixture.detectChanges();
      const formInstances = fixture.debugElement.queryAll(By.directive(DynamicFormComponent));
      expect(formInstances.length).toBe(3);
    });

    it('stores the backend-sent ulbCount question in fields() and creates a matching form control', () => {
      fixture.detectChanges();
      expect(component.fields().some((f) => f.key === 'ulbCount')).toBeTrue();
      expect(component.form.get('ulbCount')).not.toBeNull();
    });

    it('hydrates the ulbCount control value from the GET form response', () => {
      dfService.getForm.and.returnValue(
        of({
          ...minimalFormData,
          questions: minimalFormData.questions.map((q) => (q.key === 'ulbCount' ? { ...q, value: 245 } : q)),
        }),
      );

      const fixture8 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture8.detectChanges();

      const form8 = fixture8.componentInstance.form as UntypedFormGroup;
      expect(form8.get('ulbCount')?.value).toBe(245);
    });
  });

  // ─── saveDraft ────────────────────────────────────────────────────────────────

  describe('saveDraft', () => {
    beforeEach(() => {
      // checkboxConfirmation has requiredTrue — set true so isValidForSubmitType passes
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);
    });

    it('sends a data-wrapper payload with stateId, yearId, and installment', () => {
      component.onSubmit('saveAsDraft');

      expect(dfService.saveDraft).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          stateId: 'state-1',
          yearId: 'year-1',
          installment: 1,
          data: jasmine.any(Object),
        }),
      );
    });

    it('does NOT include raw form.value directly — excelFile is undefined when control is empty', () => {
      component.onSubmit('saveAsDraft');

      const payload = dfService.saveDraft.calls.mostRecent().args[0];
      // buildDevolutionDraftPayloadData returns undefined for null file (not raw null)
      expect(payload.data?.excelFile).toBeUndefined();
    });

    it('calls reloadForm (triggers a second getForm call) after a successful save', () => {
      dfService.getForm.calls.reset();
      component.onSubmit('saveAsDraft');
      expect(dfService.getForm).toHaveBeenCalled();
    });

    it('includes ulbCount in the draft payload when set', () => {
      (component.form as UntypedFormGroup).get('ulbCount')!.setValue(120);
      component.onSubmit('saveAsDraft');

      const payload = dfService.saveDraft.calls.mostRecent().args[0];
      expect(payload.data?.ulbCount).toBe(120);
    });

    it('omits ulbCount from the draft payload when left empty', () => {
      component.onSubmit('saveAsDraft');

      const payload = dfService.saveDraft.calls.mostRecent().args[0];
      expect(payload.data?.ulbCount).toBeUndefined();
    });

    it('shows a danger snackbar on draft save error', () => {
      dfService.saveDraft.and.returnValue(throwError(() => ({ error: { message: 'Draft failed.', statusCode: 400 } })));
      utilityService.triggerSnackbar.calls.reset();

      component.onSubmit('saveAsDraft');

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        jasmine.stringContaining('Draft failed.'),
        'snackbar-danger',
      );
    });
  });

  // ─── validateExcel (auto-triggered on file upload) ────────────────────────────

  describe('validateExcel (auto-trigger on file upload)', () => {
    it('sends a flat excelFile payload — not wrapped in data', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      const call = dfService.validateExcel.calls.mostRecent();
      expect(call).toBeDefined();
      const args = call.args[0];
      expect(args).toEqual(
        jasmine.objectContaining({ stateId: 'state-1', yearId: 'year-1', installment: 1, excelFile: mockFileValue }),
      );
      expect((args as unknown as Record<string, unknown>)['data']).toBeUndefined();
    });

    it('calls reloadForm (triggers another getForm call) after a VALID response', () => {
      dfService.getForm.calls.reset();
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);
      expect(dfService.getForm).toHaveBeenCalled();
    });

    it('updates validationSummary from err.error.data.validationSummary on allocation mismatch', () => {
      const mismatchSummary: DevolutionValidationSummary = {
        validationStatus: 'INVALID',
        excelRowCount: 5,
        validRowCount: 3,
        errorRowCount: 2,
        missingUlbCount: 1,
        totalMoHUAAllocation: 5000000,
        totalAllocatedSum: 4000000,
        allUlbsCovered: false,
        allocationBalanced: false,
        activeDatasetVersion: 1,
      };
      // The reload will call getForm which should return the updated summary
      dfService.getForm.and.returnValue(of({ ...minimalFormData, validationSummary: mismatchSummary }));
      dfService.validateExcel.and.returnValue(
        throwError(() => ({
          status: 400,
          error: { message: 'Allocation mismatch', data: { validationSummary: mismatchSummary } },
        })),
      );

      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(component.validationSummary()).toEqual(jasmine.objectContaining({ validationStatus: 'INVALID' }));
    });
  });

  // ─── finalSubmit ─────────────────────────────────────────────────────────────

  describe('finalSubmit', () => {
    it('sends a data-wrapper payload with ulbCount, excelFile, and checkboxConfirmation', () => {
      // Set without emitting to bypass the auto-validate trigger
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue, { emitEvent: false });
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);
      (component.form as UntypedFormGroup).get('ulbCount')!.setValue(100);

      component.onSubmit('finalSubmit');

      expect(dfService.finalSubmit).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          stateId: 'state-1',
          yearId: 'year-1',
          installment: 1,
          data: { ulbCount: 100, excelFile: mockFileValue, checkboxConfirmation: true },
        }),
      );
    });

    it('calls reloadForm (triggers another getForm call) after a successful final submit', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue, { emitEvent: false });
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);
      (component.form as UntypedFormGroup).get('ulbCount')!.setValue(100);
      dfService.getForm.calls.reset();

      component.onSubmit('finalSubmit');

      expect(dfService.getForm).toHaveBeenCalled();
    });

    it('shows a danger snackbar and does not call service when ulbCount is missing', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue, { emitEvent: false });
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);
      utilityService.triggerSnackbar.calls.reset();

      component.onSubmit('finalSubmit');

      expect(dfService.finalSubmit).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        jasmine.stringContaining('errors'),
        'snackbar-danger',
      );
    });

    it('blocks final submit via client-side validation when ulbCount fails its backend min validator', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue, { emitEvent: false });
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);
      (component.form as UntypedFormGroup).get('ulbCount')!.setValue(0);
      utilityService.triggerSnackbar.calls.reset();

      component.onSubmit('finalSubmit');

      expect(component.form.get('ulbCount')?.hasError('min')).toBeTrue();
      expect(dfService.finalSubmit).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        jasmine.stringContaining('errors'),
        'snackbar-danger',
      );
    });

    it('shows a danger snackbar and does not call service when excelFile is missing', () => {
      // checkboxConfirmation = true but no file → buildDevolutionFinalSubmitPayloadData returns null
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);
      utilityService.triggerSnackbar.calls.reset();

      component.onSubmit('finalSubmit');

      expect(dfService.finalSubmit).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        jasmine.stringContaining('errors'),
        'snackbar-danger',
      );
    });
  });

  // ─── onSupportingAction ──────────────────────────────────────────────────────

  describe('onSupportingAction', () => {
    it('download-template calls service.downloadTemplate', () => {
      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'download-template' });
      expect(dfService.downloadTemplate).toHaveBeenCalledOnceWith('state-1', 'year-1', 1);
    });

    it('download-error-sheet calls service.downloadErrorSheet', () => {
      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'download-error-sheet' });
      expect(dfService.downloadErrorSheet).toHaveBeenCalledOnceWith('state-1', 'year-1', 1);
    });

    it('revalidate-excel calls service.revalidateExcel', () => {
      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'revalidate-excel' });
      expect(dfService.revalidateExcel).toHaveBeenCalledOnceWith('state-1', 'year-1', 1);
    });

    it('view-uploaded-data opens the rows dialog with stateId, yearId, and installment', () => {
      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'view-uploaded-data' });
      expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
        DevolutionFormulaRowsDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            stateId: 'state-1',
            yearId: 'year-1',
            installment: 1,
          }),
        }),
      );
    });

    it('view-uploaded-data passes canEdit from permissions into the dialog data', () => {
      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'view-uploaded-data' });
      const callArgs = dialogOpenSpy.calls.mostRecent().args[1] as { data: { canEdit: boolean } };
      expect(callArgs.data.canEdit).toBeTrue();
    });

    it('view-uploaded-data passes rowEditFields from the form response into the dialog data', () => {
      const fields = [{ key: 'totalGrantAllocation', formFieldType: 'number', label: 'Total', validations: [] }];
      dfService.getForm.and.returnValue(of({ ...minimalFormData, rowEditFields: fields }));

      const fixture5 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture5.detectChanges();
      fixture5.componentInstance.onSupportingAction({ fieldKey: 'excelFile', actionId: 'view-uploaded-data' });

      const callArgs = dialogOpenSpy.calls.mostRecent().args[1] as {
        data: { rowEditFields: unknown };
      };
      expect(callArgs.data.rowEditFields).toEqual(fields);
    });

    it('reloads form after dialog closes with updatedSummary', () => {
      mockDialogRef.afterClosed.and.returnValue(of({ updatedSummary: mockValidationSummary }));
      dfService.getForm.calls.reset();

      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'view-uploaded-data' });

      expect(dfService.getForm).toHaveBeenCalledWith('state-1', 'year-1', 1);
    });

    it('does not reload form when dialog closes without updatedSummary', () => {
      mockDialogRef.afterClosed.and.returnValue(of({}));
      dfService.getForm.calls.reset();

      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'view-uploaded-data' });

      expect(dfService.getForm).not.toHaveBeenCalled();
    });

    it('ignores events for unrecognised field keys', () => {
      component.onSupportingAction({ fieldKey: 'checkboxConfirmation', actionId: 'download-template' });
      expect(dfService.downloadTemplate).not.toHaveBeenCalled();
    });

    it('saves downloaded template blob via FileSaver', () => {
      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'download-template' });
      expect(FileSaver.saveAs).toHaveBeenCalledWith(jasmine.any(Blob), 'devolution-formula-template.xlsx');
    });

    it('saves downloaded error sheet blob via FileSaver', () => {
      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'download-error-sheet' });
      expect(FileSaver.saveAs).toHaveBeenCalledWith(jasmine.any(Blob), 'devolution-formula-error-sheet.xlsx');
    });
  });

  // ─── deleteUploadedExcel ─────────────────────────────────────────────────────

  describe('deleteUploadedExcel', () => {
    it('shows a confirm dialog when the file control is cleared and a persisted file exists', () => {
      dfService.getForm.and.returnValue(of(formDataWithFile));
      const fixtureWithFile = TestBed.createComponent(DevolutionFormulaComponent);
      fixtureWithFile.detectChanges();

      confirmDialogService.confirm.calls.reset();
      (fixtureWithFile.componentInstance.form as UntypedFormGroup).get('excelFile')!.setValue(null);

      expect(confirmDialogService.confirm).toHaveBeenCalled();
    });

    it('calls service.deleteUploadedExcel when the user confirms', () => {
      dfService.getForm.and.returnValue(of(formDataWithFile));
      const fixtureWithFile = TestBed.createComponent(DevolutionFormulaComponent);
      fixtureWithFile.detectChanges();

      dfService.deleteUploadedExcel.calls.reset();
      (fixtureWithFile.componentInstance.form as UntypedFormGroup).get('excelFile')!.setValue(null);

      expect(dfService.deleteUploadedExcel).toHaveBeenCalledWith('state-1', 'year-1', 1);
    });
  });

  describe('allocation mismatch from validate-excel error reflects in UI', () => {
    it('sets validationSummary signal from allocation-mismatch error body (via reload)', () => {
      const mismatchSummary: DevolutionValidationSummary = {
        validationStatus: 'INVALID',
        excelRowCount: 50,
        validRowCount: 45,
        errorRowCount: 5,
        missingUlbCount: 2,
        totalMoHUAAllocation: 50000000,
        totalAllocatedSum: 48000000,
        allUlbsCovered: false,
        allocationBalanced: false,
        activeDatasetVersion: 2,
      };
      // After the error reload, getForm returns the updated summary — mirrors real backend behaviour
      dfService.getForm.and.returnValue(of({ ...minimalFormData, validationSummary: mismatchSummary }));
      dfService.validateExcel.and.returnValue(
        throwError(() => ({
          status: 400,
          error: { message: 'Allocation mismatch', data: { validationSummary: mismatchSummary } },
        })),
      );

      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(component.validationSummary()).toEqual(
        jasmine.objectContaining({ validationStatus: 'INVALID', totalAllocatedSum: 48000000 }),
      );
    });
  });

  // ─── field-keyed API error injection ─────────────────────────────────────────

  describe('field-keyed API error injection', () => {
    beforeEach(() => {
      // checkboxConfirmation has requiredTrue — set true so isValidForSubmitType passes
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);
    });

    it('injects excelFile error code into the form control after a saveDraft failure', () => {
      dfService.saveDraft.and.returnValue(
        throwError(() => ({
          error: {
            message: 'Validation failed.',
            errors: {
              excelFile: [{ field: 'excelFile', message: 'Invalid file format.', code: 'invalidFileFormat' }],
            },
          },
        })),
      );

      component.onSubmit('saveAsDraft');

      const control = component.form.get('excelFile');
      expect(control?.hasError('invalidFileFormat')).toBeTrue();
    });

    it('injects checkboxConfirmation error code into the form control after a saveDraft failure', () => {
      dfService.saveDraft.and.returnValue(
        throwError(() => ({
          error: {
            message: 'Validation failed.',
            errors: {
              checkboxConfirmation: [
                { field: 'checkboxConfirmation', message: 'Must be accepted.', code: 'requiredTrue' },
              ],
            },
          },
        })),
      );

      component.onSubmit('saveAsDraft');

      const control = component.form.get('checkboxConfirmation');
      expect(control?.hasError('requiredTrue')).toBeTrue();
    });

    it('injects excelFile error into field validations config so DynamicForm can render the message', () => {
      dfService.saveDraft.and.returnValue(
        throwError(() => ({
          error: {
            message: 'Validation failed.',
            errors: {
              excelFile: [{ field: 'excelFile', message: 'File is too large.', code: 'fileTooLarge' }],
            },
          },
        })),
      );

      component.onSubmit('saveAsDraft');

      const fieldConfig = component.fields().find((f) => f.key === 'excelFile');
      expect(fieldConfig?.validations?.some((v) => v.name === 'fileTooLarge')).toBeTrue();
    });

    it('installment error does not crash and shows snackbar with its message', () => {
      dfService.saveDraft.and.returnValue(
        throwError(() => ({
          error: {
            message: 'Form failed.',
            errors: {
              installment: [{ message: 'Installment 2 is locked.', code: 'INSTALLMENT_LOCKED' }],
            },
          },
        })),
      );

      expect(() => component.onSubmit('saveAsDraft')).not.toThrow();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Installment 2 is locked.', 'snackbar-danger');
    });

    it('unknown error key does not crash and shows snackbar with its message', () => {
      dfService.saveDraft.and.returnValue(
        throwError(() => ({
          error: {
            message: 'Form failed.',
            errors: {
              unknownField: [{ message: 'Something went wrong on the server.', code: 'SERVER_ERROR' }],
            },
          },
        })),
      );

      expect(() => component.onSubmit('saveAsDraft')).not.toThrow();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'Something went wrong on the server.',
        'snackbar-danger',
      );
    });

    it('clearAllApiErrors removes injected API error codes but preserves client-side required errors', () => {
      // Stamp an API error via a failed save
      dfService.saveDraft.and.returnValue(
        throwError(() => ({
          error: {
            message: 'Validation failed.',
            errors: {
              excelFile: [{ field: 'excelFile', message: 'Bad file.', code: 'BAD_FILE' }],
            },
          },
        })),
      );
      component.onSubmit('saveAsDraft');

      // Manually add a client-side required error alongside the API error
      const ctrl = component.form.get('excelFile')!;
      ctrl.setErrors({ ...ctrl.errors, required: true });

      // Trigger revalidate-excel: clearAllApiErrors() is called at the top of revalidateExcel()
      // before the service call. Use throwError so the observable completes immediately.
      dfService.revalidateExcel.and.returnValue(throwError(() => new Error('network')));
      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'revalidate-excel' });

      // After clearAllApiErrors: API code removed, client-side required error preserved
      expect(ctrl.hasError('BAD_FILE')).toBeFalse();
      expect(ctrl.hasError('required')).toBeTrue();
    });
  });

  // ─── Phase 8: pendingPostReloadErrors and isRestoringExcelFile ───────────────

  describe('Phase 8 — post-reload error preservation and hydration guard', () => {
    it('re-applies pendingPostReloadErrors to the excelFile control after reload on allocation mismatch', () => {
      const mismatchSummary: DevolutionValidationSummary = {
        ...mockValidationSummary,
        excelRowCount: 10, // > 0 so hasPersistedValidationData returns true
        validationStatus: 'INVALID',
      };
      dfService.validateExcel.and.returnValue(
        throwError(() => ({
          status: 400,
          error: {
            message: 'Allocation mismatch.',
            errors: {
              excelFile: [{ message: 'Total allocation does not match MoHUA amount.', code: 'ALLOC_MISMATCH' }],
            },
            data: { validationSummary: mismatchSummary },
          },
        })),
      );

      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      // After reload, the pending errors should have been re-stamped on the new excelFile control
      expect(component.form.get('excelFile')?.hasError('ALLOC_MISMATCH')).toBeTrue();
    });

    it('does not trigger validateExcel when restoring the excel file after user cancels delete', () => {
      // Load form with a persisted file so lastPersistedExcelFile is set
      dfService.getForm.and.returnValue(of(formDataWithFile));
      const fixtureWithFile = TestBed.createComponent(DevolutionFormulaComponent);
      fixtureWithFile.detectChanges();

      // User cancels the delete dialog → file is restored
      confirmDialogService.confirm.and.returnValue(of(false));
      dfService.validateExcel.calls.reset();

      // Clearing the file triggers the delete flow, then cancel restores it via isRestoringExcelFile guard
      (fixtureWithFile.componentInstance.form as UntypedFormGroup).get('excelFile')!.setValue(null);

      // The restore sets isRestoringExcelFile=true during setValue so the validation trigger is skipped
      expect(dfService.validateExcel).not.toHaveBeenCalled();
    });

    it('does not crash when validate-excel error body has no validationSummary', () => {
      dfService.validateExcel.and.returnValue(throwError(() => ({ status: 400, error: { message: 'Bad request.' } })));

      expect(() => {
        (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);
      }).not.toThrow();

      expect(component.validationSummary()).toBeNull();
    });
  });

  // ─── Phase 9: installment selector and installment 2 lock ────────────────────

  describe('Phase 9 — installment selector and installment 2 lock', () => {
    it('installment signal defaults to 1', () => {
      expect(component.installment()).toBe(1);
    });

    it('isInstallment2Locked reflects backend installmentAccess.installment2.locked', () => {
      component.installmentAccess.set(unlockedInstallmentAccess);
      expect(component.isInstallment2Locked()).toBeFalse();

      component.installmentAccess.set(lockedInstallmentAccess);
      expect(component.isInstallment2Locked()).toBeTrue();
    });

    it('isInstallment2Locked does not depend on the currently selected installment', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      expect(component.isInstallment2Locked()).toBeTrue();

      component.installment.set(2);
      expect(component.isInstallment2Locked()).toBeTrue();
    });

    it('isInstallment2Locked defaults to true when installmentAccess is missing', () => {
      component.installmentAccess.set(null);
      expect(component.isInstallment2Locked()).toBeTrue();
    });

    it('stores installmentAccess from the GET response on load', () => {
      const customAccess: DevolutionInstallmentAccess = {
        installment1: { canSelect: true, locked: false, lockReason: null },
        installment2: { canSelect: true, locked: false, lockReason: 'Custom backend reason.' },
      };
      dfService.getForm.and.returnValue(of({ ...minimalFormData, installmentAccess: customAccess }));
      component.ngOnInit();
      expect(component.installmentAccess()).toEqual(customAccess);
    });

    it('defaults installmentAccess to null when the GET response omits it', () => {
      dfService.getForm.and.returnValue(of({ ...minimalFormData, installmentAccess: undefined }));
      component.ngOnInit();
      expect(component.installmentAccess()).toBeNull();
    });

    it('switchInstallment(2) calls dfService.getForm with installment 2', () => {
      dfService.getForm.calls.reset();
      component.switchInstallment(2);
      expect(dfService.getForm).toHaveBeenCalledOnceWith('state-1', 'year-1', 2);
    });

    it('switchInstallment does nothing when the requested installment is already active', () => {
      dfService.getForm.calls.reset();
      component.switchInstallment(1);
      expect(dfService.getForm).not.toHaveBeenCalled();
    });

    it('switchInstallment(2) is a no-op when installment 2 is locked', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      dfService.getForm.calls.reset();

      component.switchInstallment(2);

      expect(dfService.getForm).not.toHaveBeenCalled();
      expect(component.installment()).toBe(1);
    });

    it('switchInstallment clears validationSummary before loading new installment data', () => {
      component.validationSummary.set(mockValidationSummary);
      // getForm returns minimalFormData which carries no validationSummary → stays null after reload
      component.switchInstallment(2);
      expect(component.validationSummary()).toBeNull();
    });

    it('switchInstallment clears grantAllocationSummary before loading new installment data', () => {
      component.grantAllocationSummary.set(mockGrantAllocationSummary);
      component.switchInstallment(2);
      expect(component.grantAllocationSummary()).toBeNull();
    });

    it('final submit is guarded when installment 2 is locked by the backend — service.finalSubmit not called', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      component.installment.set(2);
      dfService.finalSubmit.calls.reset();
      utilityService.triggerSnackbar.calls.reset();

      component.onSubmit('finalSubmit');

      expect(dfService.finalSubmit).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'Final submit is not available for Installment 2 at this time.',
        'snackbar-danger',
      );
    });

    it('final submit is NOT blocked by installment 2 lock state when installment 1 is selected', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      dfService.finalSubmit.calls.reset();
      utilityService.triggerSnackbar.calls.reset();

      component.onSubmit('finalSubmit');

      expect(utilityService.triggerSnackbar).not.toHaveBeenCalledWith(
        'Final submit is not available for Installment 2 at this time.',
        'snackbar-danger',
      );
    });

    it('shows the installment 2 locked alert when on installment 2 and backend reports it locked (stale-state guard)', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      component.installment.set(2);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-installment2-locked-alert"]')).not.toBeNull();
    });

    it('does not show the installment 2 locked alert on installment 1, even though installment 2 is locked', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-installment2-locked-alert"]')).toBeNull();
    });

    it('passes the currently selected installment into the rows dialog data', () => {
      component.switchInstallment(2);
      dialogOpenSpy.calls.reset();

      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'view-uploaded-data' });

      expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
        DevolutionFormulaRowsDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({ installment: 2 }),
        }),
      );
    });

    it('reloads form with installment 2 after dialog closes with updatedSummary', () => {
      component.switchInstallment(2);
      mockDialogRef.afterClosed.and.returnValue(of({ updatedSummary: mockValidationSummary }));
      dfService.getForm.calls.reset();

      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'view-uploaded-data' });

      expect(dfService.getForm).toHaveBeenCalledWith('state-1', 'year-1', 2);
    });
  });

  // ─── Phase 15: installment selector Material buttons ───────────────────────────

  describe('Phase 15 — installment selector Material buttons', () => {
    function getInstallment1Button(): HTMLButtonElement {
      return (fixture.nativeElement as HTMLElement).querySelector(
        '[data-cy="df-installment-1-btn"]',
      ) as HTMLButtonElement;
    }

    function getInstallment2Button(): HTMLButtonElement {
      return (fixture.nativeElement as HTMLElement).querySelector(
        '[data-cy="df-installment-2-btn"]',
      ) as HTMLButtonElement;
    }

    it('does not render a mat-select anywhere in the installment selector', () => {
      expect(fixture.debugElement.query(By.css('mat-select'))).toBeNull();
    });

    it('renders Installment 1 as a Material button', () => {
      const debugEl = fixture.debugElement.query(By.css('[data-cy="df-installment-1-btn"]'));
      expect(debugEl.injector.get(MatButton, null)).not.toBeNull();
    });

    it('renders Installment 2 as a Material button', () => {
      const debugEl = fixture.debugElement.query(By.css('[data-cy="df-installment-2-btn"]'));
      expect(debugEl.injector.get(MatButton, null)).not.toBeNull();
    });

    it('disables Installment 2 before click when the backend reports it locked', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      fixture.detectChanges();
      expect(getInstallment2Button().disabled).toBeTrue();
    });

    it('defaults Installment 2 to locked/disabled when installmentAccess is missing', () => {
      component.installmentAccess.set(null);
      fixture.detectChanges();
      expect(getInstallment2Button().disabled).toBeTrue();
    });

    it('clicking disabled Installment 2 does not call switchInstallment / does not change installment', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      fixture.detectChanges();
      dfService.getForm.calls.reset();

      getInstallment2Button().click();
      fixture.detectChanges();

      expect(dfService.getForm).not.toHaveBeenCalled();
      expect(component.installment()).toBe(1);
    });

    it('shows the backend-provided lock reason as the tooltip message when locked', () => {
      component.installmentAccess.set({
        installment1: unlockedInstallmentAccess.installment1,
        installment2: { canSelect: false, locked: true, lockReason: 'Custom backend lock reason.' },
      });
      fixture.detectChanges();

      const tooltipDebugEl = fixture.debugElement.query(By.directive(MatTooltip));
      expect(tooltipDebugEl).not.toBeNull();
      expect(tooltipDebugEl.injector.get(MatTooltip).message).toBe('Custom backend lock reason.');
    });

    it('falls back to the default lock reason when the backend does not provide one', () => {
      component.installmentAccess.set(lockedInstallmentAccess);
      fixture.detectChanges();

      const tooltipDebugEl = fixture.debugElement.query(By.directive(MatTooltip));
      expect(tooltipDebugEl.injector.get(MatTooltip).message).toBe(
        'Installment 2 is locked until at least one Installment 1 claim batch is acknowledged by MoHUA.',
      );
    });

    it('does not set a tooltip message on Installment 2 when unlocked', () => {
      component.installmentAccess.set(unlockedInstallmentAccess);
      fixture.detectChanges();

      const tooltipDebugEl = fixture.debugElement.query(By.directive(MatTooltip));
      expect(tooltipDebugEl).not.toBeNull();
      expect(tooltipDebugEl.injector.get(MatTooltip).message).toBe('');
    });

    it('enables Installment 2 when the backend reports it unlocked and selectable', () => {
      component.installmentAccess.set(unlockedInstallmentAccess);
      fixture.detectChanges();
      expect(getInstallment2Button().disabled).toBeFalse();
    });

    it('clicking enabled Installment 2 switches installment and triggers the existing reload behavior', () => {
      dfService.getForm.calls.reset();

      getInstallment2Button().click();
      fixture.detectChanges();

      expect(component.installment()).toBe(2);
      expect(dfService.getForm).toHaveBeenCalledWith('state-1', 'year-1', 2);
    });

    it('marks the active installment with aria-pressed="true"', () => {
      expect(getInstallment1Button().getAttribute('aria-pressed')).toBe('true');
      expect(getInstallment2Button().getAttribute('aria-pressed')).toBe('false');
    });

    function getFinalSubmitButton(): HTMLButtonElement {
      return (fixture.nativeElement as HTMLElement).querySelector(
        '[data-cy="df-final-submit-test"]',
      ) as HTMLButtonElement;
    }

    it('does not disable Final Submit on installment 1 just because installment 2 is locked', () => {
      component.permissions.set({ canView: true, canEdit: true, canFinalSubmit: true });
      component.installmentAccess.set(lockedInstallmentAccess);
      fixture.detectChanges();

      expect(getFinalSubmitButton().disabled).toBeFalse();
    });

    it('disables Final Submit on installment 2 when the backend reports it locked', () => {
      component.permissions.set({ canView: true, canEdit: true, canFinalSubmit: true });
      component.installmentAccess.set(lockedInstallmentAccess);
      component.installment.set(2);
      fixture.detectChanges();

      expect(getFinalSubmitButton().disabled).toBeTrue();
    });
  });

  // ─── Phase 10: no manual summary blocks ──────────────────────────────────────

  describe('Phase 10 — no manual summary blocks', () => {
    it('does not render a df-summary-section element in the DOM', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-summary-section"]')).toBeNull();
    });

    it('does not render df-grant-basic or df-mohua-allocation or df-validation-status-badge even when signals are set', () => {
      component.validationSummary.set(mockValidationSummary);
      component.grantAllocationSummary.set(mockGrantAllocationSummary);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-grant-basic"]')).toBeNull();
      expect(el.querySelector('[data-cy="df-mohua-allocation"]')).toBeNull();
      expect(el.querySelector('[data-cy="df-validation-status-badge"]')).toBeNull();
    });

    it('validationSummary signal is still populated from the GET form response (used by reload logic)', () => {
      dfService.getForm.and.returnValue(of({ ...minimalFormData, validationSummary: mockValidationSummary }));
      const f = TestBed.createComponent(DevolutionFormulaComponent);
      f.detectChanges();
      expect(f.componentInstance.validationSummary()).toEqual(mockValidationSummary);
    });
  });

  // ─── Phase 11: allocationMismatch error shown below excelFile control ─────────

  describe('Phase 11 — allocationMismatch error shown below excelFile control', () => {
    const allocationMismatchError = {
      status: 400,
      error: {
        message: 'Validation failed.',
        errors: {
          excelFile: [
            {
              field: 'excelFile',
              code: 'allocationMismatch',
              message: 'Sum of ULB allocations (431000.00) does not equal Total MoHUA Allocation (6012.00).',
            },
          ],
        },
        data: {
          validationSummary: {
            validationStatus: 'INVALID',
            excelRowCount: 431,
            validRowCount: 0,
            errorRowCount: 431,
            missingUlbCount: 0,
            totalMoHUAAllocation: 6012,
            totalAllocatedSum: 431000,
            allUlbsCovered: false,
            allocationBalanced: false,
            activeDatasetVersion: 1,
          },
        },
      },
    };

    beforeEach(() => {
      dfService.validateExcel.and.returnValue(throwError(() => allocationMismatchError));
    });

    it('stamps allocationMismatch error on the excelFile control immediately (before reload)', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(component.form.get('excelFile')?.hasError('allocationMismatch')).toBeTrue();
    });

    it('marks the excelFile control as touched and dirty immediately so the error is visible', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(component.form.get('excelFile')?.touched).toBeTrue();
      expect(component.form.get('excelFile')?.dirty).toBeTrue();
    });

    it('adds allocationMismatch to fields() validations with the backend error message', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      const excelField = component.fields().find((f) => f.key === 'excelFile');
      const validation = excelField?.validations?.find((v) => v.name === 'allocationMismatch');
      expect(validation).toBeDefined();
      expect(validation?.message).toBe(
        'Sum of ULB allocations (431000.00) does not equal Total MoHUA Allocation (6012.00).',
      );
    });

    it('shows the backend error message in the DOM below the excelFile control', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('[data-cy="excelFile-error-test"]') as HTMLElement | null;
      expect(errorEl).not.toBeNull();
      expect(errorEl?.textContent?.trim()).toBe(
        'Sum of ULB allocations (431000.00) does not equal Total MoHUA Allocation (6012.00).',
      );
    });

    it('error persists on the excelFile control after the form reloads (pendingPostReloadErrors re-applied)', () => {
      // After allocationMismatch, reloadForm triggers a getForm call.
      // The returned form data has no excelFile value (the upload was rejected), so
      // createFormControls re-applies pendingPostReloadErrors to the fresh control.
      dfService.getForm.and.returnValue(of(minimalFormData));

      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(component.form.get('excelFile')?.hasError('allocationMismatch')).toBeTrue();
    });

    it('does not trigger the register-ULB snackbar for unrelated excelFile errors (allocationMismatch)', () => {
      utilityService.triggerSnackbar.calls.reset();
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      const registerCalls = utilityService.triggerSnackbar.calls
        .allArgs()
        .filter(([msg]) => typeof msg === 'string' && msg.toLowerCase().includes('register'));
      expect(registerCalls.length).toBe(0);
    });
  });

  // ─── Phase 12: newUlbsAdded error shown below excelFile control ───────────────

  describe('Phase 12 — newUlbsAdded error shown below excelFile control', () => {
    const newUlbsAddedError = {
      status: 400,
      error: {
        message: 'Validation failed.',
        errors: {
          excelFile: [
            {
              field: 'excelFile',
              code: 'newUlbsAdded',
              message: 'You have added 3 ULB(s). Please register before proceeding.',
            },
          ],
        },
        data: {
          validationSummary: {
            validationStatus: 'INVALID',
            excelRowCount: 431,
            validRowCount: 0,
            errorRowCount: 431,
            missingUlbCount: 0,
            totalMoHUAAllocation: 6012,
            totalAllocatedSum: 431000,
            allUlbsCovered: false,
            allocationBalanced: false,
            activeDatasetVersion: 1,
            newUlbCount: 3,
          },
        },
      },
    };

    beforeEach(() => {
      dfService.validateExcel.and.returnValue(throwError(() => newUlbsAddedError));
    });

    it('stamps newUlbsAdded error on the excelFile control immediately (before reload)', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(component.form.get('excelFile')?.hasError('newUlbsAdded')).toBeTrue();
    });

    it('shows the backend newUlbsAdded message in the DOM below the excelFile control', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('[data-cy="excelFile-error-test"]') as HTMLElement | null;
      expect(errorEl).not.toBeNull();
      expect(errorEl?.textContent?.trim()).toBe('You have added 3 ULB(s). Please register before proceeding.');
    });

    it('does not duplicate the newUlbsAdded message when applied more than once', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue, { emitEvent: false });
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);
      fixture.detectChanges();

      const excelField = component.fields().find((f) => f.key === 'excelFile');
      const matches = excelField?.validations?.filter((v) => v.name === 'newUlbsAdded') ?? [];
      expect(matches.length).toBe(1);
    });

    it('error persists on the excelFile control after the form reloads (pendingPostReloadErrors re-applied)', () => {
      dfService.getForm.and.returnValue(of(minimalFormData));

      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(component.form.get('excelFile')?.hasError('newUlbsAdded')).toBeTrue();
    });

    it('shows a danger snackbar with the backend newUlbsAdded message on validate-excel error', () => {
      utilityService.triggerSnackbar.calls.reset();
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'You have added 3 ULB(s). Please register before proceeding.',
        'snackbar-danger',
      );
    });

    it('shows a danger snackbar with the backend newUlbsAdded message on revalidate-excel error', () => {
      utilityService.triggerSnackbar.calls.reset();
      dfService.revalidateExcel.and.returnValue(throwError(() => newUlbsAddedError));

      component.onSupportingAction({ fieldKey: 'excelFile', actionId: 'revalidate-excel' });

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'You have added 3 ULB(s). Please register before proceeding.',
        'snackbar-danger',
      );
    });
  });

  describe('Phase 14 — register-ULB snackbar is not shown merely from GET form hydration', () => {
    it('does not show a register-ULB snackbar just because validationSummary.newUlbCount > 0 on load', () => {
      dfService.getForm.and.returnValue(
        of({
          ...minimalFormData,
          validationSummary: { ...mockValidationSummary, newUlbCount: 5 },
        }),
      );
      const f = TestBed.createComponent(DevolutionFormulaComponent);
      const freshUtilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
      freshUtilityService.triggerSnackbar.calls.reset();

      f.detectChanges();

      const registerCalls = freshUtilityService.triggerSnackbar.calls
        .allArgs()
        .filter(([msg]) => typeof msg === 'string' && msg.toLowerCase().includes('register'));
      expect(registerCalls.length).toBe(0);
    });
  });

  // ─── Phase 13: Register ULB supporting content action ─────────────────────────

  describe('Phase 13 — Register ULB supporting content action', () => {
    const registerUlbAction = {
      id: 'register-ulb',
      label: 'Register ULB',
      url: '/resigter-ulb',
      tone: 'success' as const,
      variant: 'link' as const,
      visible: true,
    };

    function formDataWithRegisterUlbAction(): DevolutionFormResponseData {
      return {
        ...minimalFormData,
        questions: minimalFormData.questions.map((q) =>
          q.key === 'excelFile'
            ? {
                ...q,
                supportingContent: [
                  { type: 'actions' as const, position: 'after' as const, actions: [registerUlbAction] },
                ],
              }
            : q,
        ),
      };
    }

    it('renders the Register ULB action with its backend label', () => {
      dfService.getForm.and.returnValue(of(formDataWithRegisterUlbAction()));
      const fixture9 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture9.detectChanges();

      const link = fixture9.nativeElement.querySelector('a[href="/resigter-ulb"]') as HTMLAnchorElement | null;
      expect(link).not.toBeNull();
      expect(link?.textContent?.trim()).toContain('Register ULB');
    });

    it('uses the backend-provided URL verbatim (does not correct the /resigter-ulb spelling)', () => {
      dfService.getForm.and.returnValue(of(formDataWithRegisterUlbAction()));
      const fixture10 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture10.detectChanges();

      const link = fixture10.nativeElement.querySelector('a[href="/resigter-ulb"]');
      expect(link).not.toBeNull();
    });

    it('applies success/green styling to the Register ULB action', () => {
      dfService.getForm.and.returnValue(of(formDataWithRegisterUlbAction()));
      const fixture11 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture11.detectChanges();

      const link = fixture11.nativeElement.querySelector('a[href="/resigter-ulb"]') as HTMLAnchorElement | null;
      expect(link?.className).toContain('link-success');
    });

    it('renders Register ULB alongside existing excelFile actions without hiding them', () => {
      const dataWithMultipleActions: DevolutionFormResponseData = {
        ...minimalFormData,
        questions: minimalFormData.questions.map((q) =>
          q.key === 'excelFile'
            ? {
                ...q,
                supportingContent: [
                  {
                    type: 'actions' as const,
                    position: 'after' as const,
                    actions: [
                      { id: 'download-template', label: 'Download Template', visible: true },
                      { id: 'view-uploaded-data', label: 'View Uploaded Data', visible: true },
                      { id: 'revalidate-excel', label: 'Revalidate', visible: true },
                      { id: 'download-error-sheet', label: 'Download Error Sheet', visible: true },
                      registerUlbAction,
                    ],
                  },
                ],
              }
            : q,
        ),
      };
      dfService.getForm.and.returnValue(of(dataWithMultipleActions));
      const fixture12 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture12.detectChanges();

      const text = (fixture12.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Download Template');
      expect(text).toContain('View Uploaded Data');
      expect(text).toContain('Revalidate');
      expect(text).toContain('Download Error Sheet');
      expect(text).toContain('Register ULB');
    });

    it('navigates via the Angular router when the backend sends the real /xvifc/:yearId/register-ulb URL', () => {
      const realUrlAction = { ...registerUlbAction, url: '/xvifc/year-1/register-ulb' };
      const dataWithRealUrl: DevolutionFormResponseData = {
        ...minimalFormData,
        questions: minimalFormData.questions.map((q) =>
          q.key === 'excelFile'
            ? {
                ...q,
                supportingContent: [{ type: 'actions' as const, position: 'after' as const, actions: [realUrlAction] }],
              }
            : q,
        ),
      };
      dfService.getForm.and.returnValue(of(dataWithRealUrl));
      const fixture13 = TestBed.createComponent(DevolutionFormulaComponent);
      const router = TestBed.inject(Router);
      const navigateSpy = spyOn(router, 'navigateByUrl');
      fixture13.detectChanges();

      const link = fixture13.nativeElement.querySelector(
        'a[href="/xvifc/year-1/register-ulb"]',
      ) as HTMLAnchorElement | null;
      expect(link).not.toBeNull();

      link?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      fixture13.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith('/xvifc/year-1/register-ulb');
    });

    it('does not render the Register ULB action when the backend marks it not visible', () => {
      const hiddenAction = { ...registerUlbAction, visible: false };
      const dataWithHiddenAction: DevolutionFormResponseData = {
        ...minimalFormData,
        questions: minimalFormData.questions.map((q) =>
          q.key === 'excelFile'
            ? {
                ...q,
                supportingContent: [{ type: 'actions' as const, position: 'after' as const, actions: [hiddenAction] }],
              }
            : q,
        ),
      };
      dfService.getForm.and.returnValue(of(dataWithHiddenAction));
      const fixture14 = TestBed.createComponent(DevolutionFormulaComponent);
      fixture14.detectChanges();

      const text = (fixture14.nativeElement as HTMLElement).textContent ?? '';
      expect(text).not.toContain('Register ULB');
    });
  });
});
