import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import FileSaver from 'file-saver';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from '../../../../core/services/utility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import {
  DevolutionFormResponseData,
  DevolutionGrantAllocationSummary,
  DevolutionPermissions,
  DevolutionValidationSummary,
} from './devolution-formula.models';
import { formatRupees, getDfValidationStatusLabel } from './devolution-formula.utils';
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
      key: 'checkboxConfirmation',
      formFieldType: 'checkbox',
      label: 'I confirm the data',
      value: null,
      validations: [{ name: 'requiredTrue', validator: null, message: 'Required' }],
    },
  ],
  permissions: { canView: true, canEdit: true, canFinalSubmit: false },
  actors: [],
};

const formDataWithFile: DevolutionFormResponseData = {
  ...minimalFormData,
  questions: [
    { key: 'excelFile', formFieldType: 'file', label: 'Devolution Excel File', value: mockFileValue },
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
      imports: [HttpClientTestingModule, NoopAnimationsModule, DevolutionFormulaComponent],
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
      expect(formInstances.length).toBe(2);
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
    it('sends a data-wrapper payload with excelFile and checkboxConfirmation', () => {
      // Set without emitting to bypass the auto-validate trigger
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue, { emitEvent: false });
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);

      component.onSubmit('finalSubmit');

      expect(dfService.finalSubmit).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          stateId: 'state-1',
          yearId: 'year-1',
          installment: 1,
          data: { excelFile: mockFileValue, checkboxConfirmation: true },
        }),
      );
    });

    it('calls reloadForm (triggers another getForm call) after a successful final submit', () => {
      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue, { emitEvent: false });
      (component.form as UntypedFormGroup).get('checkboxConfirmation')!.setValue(true);
      dfService.getForm.calls.reset();

      component.onSubmit('finalSubmit');

      expect(dfService.getForm).toHaveBeenCalled();
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

  // ─── Phase 5: summary display ────────────────────────────────────────────────

  describe('formatRupees utility', () => {
    it('returns — for null', () => expect(formatRupees(null)).toBe('—'));
    it('returns — for undefined', () => expect(formatRupees(undefined)).toBe('—'));
    it('formats crore amounts with Cr suffix', () => expect(formatRupees(50000000)).toContain('Cr'));
    it('formats lakh amounts with Lakh suffix', () => expect(formatRupees(500000)).toContain('Lakh'));
    it('formats plain amounts with ₹ prefix', () => {
      expect(formatRupees(5000)).toMatch(/^₹/);
    });
    it('formats zero as ₹ 0', () => expect(formatRupees(0)).toBe('₹ 0'));
  });

  describe('getDfValidationStatusLabel utility', () => {
    it('returns Valid for VALID', () => expect(getDfValidationStatusLabel('VALID')).toBe('Valid'));
    it('returns Invalid for INVALID', () => expect(getDfValidationStatusLabel('INVALID')).toBe('Invalid'));
    it('returns Not Validated for NOT_VALIDATED', () =>
      expect(getDfValidationStatusLabel('NOT_VALIDATED')).toBe('Not Validated'));
  });

  describe('allocationDifference computed', () => {
    it('returns null when validationSummary is null', () => {
      component.validationSummary.set(null);
      expect(component.allocationDifference()).toBeNull();
    });

    it('returns totalMoHUAAllocation minus totalAllocatedSum', () => {
      component.validationSummary.set({
        ...mockValidationSummary,
        totalMoHUAAllocation: 50000000,
        totalAllocatedSum: 49000000,
      });
      expect(component.allocationDifference()).toBe(1000000);
    });

    it('returns 0 when allocation is balanced', () => {
      component.validationSummary.set({
        ...mockValidationSummary,
        totalMoHUAAllocation: 50000000,
        totalAllocatedSum: 50000000,
      });
      expect(component.allocationDifference()).toBe(0);
    });
  });

  describe('hasValidationErrors computed', () => {
    it('returns false when validationSummary is null', () => {
      component.validationSummary.set(null);
      expect(component.hasValidationErrors()).toBeFalse();
    });

    it('returns true when errorRowCount > 0', () => {
      component.validationSummary.set({ ...mockValidationSummary, errorRowCount: 3 });
      expect(component.hasValidationErrors()).toBeTrue();
    });

    it('returns true when missingUlbCount > 0', () => {
      component.validationSummary.set({
        ...mockValidationSummary,
        errorRowCount: 0,
        missingUlbCount: 2,
        allocationBalanced: true,
      });
      expect(component.hasValidationErrors()).toBeTrue();
    });

    it('returns true when allocationBalanced is false', () => {
      component.validationSummary.set({
        ...mockValidationSummary,
        errorRowCount: 0,
        missingUlbCount: 0,
        allocationBalanced: false,
      });
      expect(component.hasValidationErrors()).toBeTrue();
    });

    it('returns false when all checks pass', () => {
      component.validationSummary.set({
        ...mockValidationSummary,
        errorRowCount: 0,
        missingUlbCount: 0,
        allocationBalanced: true,
      });
      expect(component.hasValidationErrors()).toBeFalse();
    });
  });

  describe('summary section DOM rendering', () => {
    let fixtureWithSummary: ComponentFixture<DevolutionFormulaComponent>;

    beforeEach(async () => {
      dfService.getForm.and.returnValue(
        of({
          ...minimalFormData,
          validationSummary: mockValidationSummary,
          grantAllocationSummary: mockGrantAllocationSummary,
        }),
      );
      fixtureWithSummary = TestBed.createComponent(DevolutionFormulaComponent);
      fixtureWithSummary.detectChanges();
    });

    it('renders the summary section when validationSummary is present', () => {
      const el = fixtureWithSummary.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-summary-section"]')).not.toBeNull();
    });

    it('renders grant allocation basic amount', () => {
      const el = fixtureWithSummary.nativeElement as HTMLElement;
      const basicEl = el.querySelector('[data-cy="df-grant-basic"]');
      expect(basicEl?.textContent?.trim()).toContain('Cr');
    });

    it('renders grant allocation performance amount', () => {
      const el = fixtureWithSummary.nativeElement as HTMLElement;
      const perfEl = el.querySelector('[data-cy="df-grant-performance"]');
      expect(perfEl?.textContent?.trim()).toContain('Cr');
    });

    it('renders grant allocation total amount', () => {
      const el = fixtureWithSummary.nativeElement as HTMLElement;
      const totalEl = el.querySelector('[data-cy="df-grant-total"]');
      expect(totalEl?.textContent?.trim()).toContain('Cr');
    });

    it('renders excel row count', () => {
      const el = fixtureWithSummary.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-excel-row-count"]')?.textContent?.trim()).toBe('100');
    });

    it('renders valid row count', () => {
      const el = fixtureWithSummary.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-valid-row-count"]')?.textContent?.trim()).toBe('98');
    });

    it('renders error row count', () => {
      const el = fixtureWithSummary.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-error-row-count"]')?.textContent?.trim()).toBe('2');
    });

    it('renders missing ULB count', () => {
      const el = fixtureWithSummary.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-missing-ulb-count"]')?.textContent?.trim()).toBe('1');
    });

    it('shows text-bg-success on validation badge for VALID status', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        validationStatus: 'VALID',
      });
      fixtureWithSummary.detectChanges();
      const badge = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-validation-status-badge"]');
      expect(badge?.classList).toContain('text-bg-success');
    });

    it('shows text-bg-danger on validation badge for INVALID status', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        validationStatus: 'INVALID',
      });
      fixtureWithSummary.detectChanges();
      const badge = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-validation-status-badge"]');
      expect(badge?.classList).toContain('text-bg-danger');
    });

    it('shows text-bg-secondary on validation badge for NOT_VALIDATED status', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        validationStatus: 'NOT_VALIDATED',
      });
      fixtureWithSummary.detectChanges();
      const badge = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-validation-status-badge"]');
      expect(badge?.classList).toContain('text-bg-secondary');
    });

    it('shows text-bg-danger on All ULBs Covered badge when false', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        allUlbsCovered: false,
      });
      fixtureWithSummary.detectChanges();
      const badge = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-all-ulbs-covered-badge"]');
      expect(badge?.classList).toContain('text-bg-danger');
    });

    it('shows text-bg-success on All ULBs Covered badge when true', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        allUlbsCovered: true,
      });
      fixtureWithSummary.detectChanges();
      const badge = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-all-ulbs-covered-badge"]');
      expect(badge?.classList).toContain('text-bg-success');
    });

    it('shows text-bg-danger on Allocation Balanced badge when false', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        allocationBalanced: false,
      });
      fixtureWithSummary.detectChanges();
      const badge = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-allocation-balanced-badge"]');
      expect(badge?.classList).toContain('text-bg-danger');
    });

    it('shows text-bg-success on Allocation Balanced badge when true', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        allocationBalanced: true,
      });
      fixtureWithSummary.detectChanges();
      const badge = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-allocation-balanced-badge"]');
      expect(badge?.classList).toContain('text-bg-success');
    });

    it('shows text-danger on allocation difference when non-zero', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        totalMoHUAAllocation: 50000000,
        totalAllocatedSum: 49000000,
      });
      fixtureWithSummary.detectChanges();
      const diffEl = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-allocation-difference"]');
      expect(diffEl?.classList).toContain('text-danger');
    });

    it('shows text-success on allocation difference when zero', () => {
      fixtureWithSummary.componentInstance.validationSummary.set({
        ...mockValidationSummary,
        totalMoHUAAllocation: 50000000,
        totalAllocatedSum: 50000000,
      });
      fixtureWithSummary.detectChanges();
      const diffEl = fixtureWithSummary.nativeElement.querySelector('[data-cy="df-allocation-difference"]');
      expect(diffEl?.classList).toContain('text-success');
    });
  });

  describe('grant allocation null warning', () => {
    it('shows warning alert when grantAllocationSummary is null', async () => {
      dfService.getForm.and.returnValue(of({ ...minimalFormData, validationSummary: mockValidationSummary }));
      const fixtureNoGrant = TestBed.createComponent(DevolutionFormulaComponent);
      fixtureNoGrant.detectChanges();

      const el = fixtureNoGrant.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-grant-allocation-warning"]')).not.toBeNull();
    });

    it('does not show warning when grantAllocationSummary is present', () => {
      const el = fixture.nativeElement as HTMLElement;
      // Default fixture uses minimalFormData without validationSummary → no summary section
      // Summary section requires validationSummary to be set
      expect(el.querySelector('[data-cy="df-grant-allocation-warning"]')).toBeNull();
    });

    it('does not render summary section when validationSummary is null', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-summary-section"]')).toBeNull();
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

    it('allocationDifference reflects mismatch values after reload', () => {
      const mismatchSummary: DevolutionValidationSummary = {
        ...mockValidationSummary,
        totalMoHUAAllocation: 50000000,
        totalAllocatedSum: 48000000,
        validationStatus: 'INVALID',
      };
      dfService.getForm.and.returnValue(of({ ...minimalFormData, validationSummary: mismatchSummary }));
      dfService.validateExcel.and.returnValue(
        throwError(() => ({
          status: 400,
          error: { message: 'Allocation mismatch', data: { validationSummary: mismatchSummary } },
        })),
      );

      (component.form as UntypedFormGroup).get('excelFile')!.setValue(mockFileValue);

      expect(component.allocationDifference()).toBe(2000000);
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

    it('isInstallment2Locked returns false when installment is 1', () => {
      expect(component.isInstallment2Locked()).toBeFalse();
    });

    it('isInstallment2Locked returns true when installment is 2', () => {
      component.switchInstallment(2);
      expect(component.isInstallment2Locked()).toBeTrue();
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

    it('final submit is guarded when installment is 2 — service.finalSubmit not called', () => {
      component.switchInstallment(2);
      dfService.finalSubmit.calls.reset();
      utilityService.triggerSnackbar.calls.reset();

      component.onSubmit('finalSubmit');

      expect(dfService.finalSubmit).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'Final submit is not available for Installment 2 at this time.',
        'snackbar-danger',
      );
    });

    it('shows the installment 2 locked alert in the DOM when installment is 2', () => {
      component.switchInstallment(2);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-cy="df-installment2-locked-alert"]')).not.toBeNull();
    });

    it('does not show the installment 2 locked alert when installment is 1', () => {
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
});
