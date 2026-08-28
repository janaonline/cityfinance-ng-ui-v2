import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { UtilityService } from '../../../../../../core/services/utility.service';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import { EulbStatusService } from '../../eulb-status.service';
import {
  EulbRow,
  EulbRowsApiResponse,
  EulbRowsDialogData,
  EulbUpdateRowResponse,
  EulbValidationSummary,
} from '../../eulb-status.models';
import { EulbRowsDialogComponent } from './eulb-rows-dialog.component';

describe('EulbRowsDialogComponent', () => {
  const stateId = 'state-1';
  const yearId = 'year-1';
  const row = createRow();

  let fixture: ComponentFixture<EulbRowsDialogComponent>;
  let component: EulbRowsDialogComponent;
  let service: jasmine.SpyObj<EulbStatusService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EulbRowsDialogComponent>>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<EulbStatusService>('EulbStatusService', ['getRows', 'updateRow']);
    service.getRows.and.returnValue(of({ data: { rows: [row], total: 1, page: 1, limit: 20 } }));
    service.updateRow.and.returnValue(of(createUpdateResponse(row)));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    dialogRef = jasmine.createSpyObj<MatDialogRef<EulbRowsDialogComponent>>('MatDialogRef', ['close']);

    const dialogData: EulbRowsDialogData = {
      stateId,
      yearId,
      rowEditFields: [],
      canEdit: true,
    };

    await TestBed.configureTestingModule({
      imports: [EulbRowsDialogComponent],
      providers: [
        { provide: EulbStatusService, useValue: service },
        { provide: UtilityService, useValue: utilityService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EulbRowsDialogComponent);
    component = fixture.componentInstance;
  });

  // ─── initialValidationStatusFilter ─────────────────────────────────────────
  // `MAT_DIALOG_DATA` is provided by reference (`useValue`), and the component reads `this.data`
  // in `ngOnInit()` — not yet triggered by the shared `beforeEach` above (no `detectChanges()`
  // there) — so mutating the already-injected data object before `detectChanges()` here reaches it.

  describe('initialValidationStatusFilter', () => {
    it('pre-selects the Invalid filter and includes it in the first getRows call', () => {
      const data = TestBed.inject(MAT_DIALOG_DATA) as EulbRowsDialogData;
      data.initialValidationStatusFilter = 'INVALID';

      fixture.detectChanges();

      expect(component.filterForm.get('validationStatus')!.value).toBe('INVALID');
      expect(service.getRows).toHaveBeenCalledWith(
        stateId,
        yearId,
        jasmine.objectContaining({ validationStatus: 'INVALID' }),
      );
    });

    it('defaults to the "All" filter when no initialValidationStatusFilter is provided', () => {
      fixture.detectChanges();

      expect(component.filterForm.get('validationStatus')!.value).toBe('');
      expect(service.getRows).toHaveBeenCalledWith(
        stateId,
        yearId,
        jasmine.objectContaining({ validationStatus: undefined }),
      );
    });
  });

  // ─── "Error field" filter removed (now matches Devolution Formula, which never had one) ────

  it('no longer has an errorField control on the filter form', () => {
    fixture.detectChanges();
    expect(component.filterForm.contains('errorField')).toBeFalse();
  });

  it('no longer renders the "Error field" dropdown', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#eulb-efield'))).toBeNull();
  });

  it('saveRow calls update API with the same row edit payload shape', () => {
    component.editForm = createEditForm({
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2026-01-01',
      dateOfExpiry: '',
      remarks: '',
    });

    component.saveRow(row._id);

    expect(service.updateRow).toHaveBeenCalledOnceWith(stateId, yearId, row._id, {
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2026-01-01',
      dateOfExpiry: undefined,
      remarks: '',
    });
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Row updated successfully.');
  });

  it('saveRow never includes censusCode or ulbName in the payload — identity fields are not portal-editable', () => {
    component.rows.set([row]);
    component.editingRowId.set(row._id);
    component.editForm = createEditForm({
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '',
      dateOfExpiry: '',
      remarks: '',
    });

    component.saveRow(row._id);

    const payload = service.updateRow.calls.mostRecent().args[3];
    expect(Object.prototype.hasOwnProperty.call(payload, 'censusCode')).toBeFalse();
    expect(Object.prototype.hasOwnProperty.call(payload, 'ulbName')).toBeFalse();
  });

  it('renders editable field cells as native td elements, with no Type column', () => {
    fixture.detectChanges();

    const rowCells = fixture.debugElement.queryAll(By.css('tbody tr td'));
    const fieldCells = fixture.debugElement.queryAll(By.css('tbody tr td[app-eulb-editable-field-cell]'));

    // First cell is the row number; second is now the census code field cell (no Type column).
    expect(rowCells[1].nativeElement.textContent.trim()).toBe(row.censusCode);
    expect(fieldCells).toHaveSize(6);
    expect(fixture.debugElement.query(By.css('app-eulb-editable-field-cell'))).toBeNull();
  });

  it('getEditableFieldsForRow always returns rowEditFields — the same for every row', () => {
    const commonFields = createRowEditFields();
    component.rowEditFields.set(commonFields);

    expect(component.getEditableFieldsForRow()).toBe(commonFields);
  });

  it('censusCode and ulbName cells show an error icon when the row has those errors', () => {
    const errorRow: EulbRow = {
      ...row,
      errors: [
        { field: 'censusCode', code: 'invalid', message: 'Census code not found.' },
        { field: 'ulbName', code: 'invalid', message: 'ULB name is required.' },
      ],
    };
    service.getRows.and.returnValue(of({ data: { rows: [errorRow], total: 1, page: 1, limit: 20 } }));
    fixture.detectChanges();

    const censusIcon = fixture.debugElement.query(
      By.css('td[app-eulb-editable-field-cell][field="censusCode"] button'),
    );
    const ulbNameIcon = fixture.debugElement.query(By.css('td[app-eulb-editable-field-cell][field="ulbName"] button'));

    expect(censusIcon).not.toBeNull();
    expect(ulbNameIcon).not.toBeNull();
  });

  it('renders one tooltip source for an invalid electedBodyStatus dialog cell', () => {
    const errorRow: EulbRow = {
      ...row,
      errors: [
        {
          field: 'electedBodyStatus',
          code: 'required',
          message: 'Elected Body Status is required.',
        },
      ],
    };
    service.getRows.and.returnValue(of({ data: { rows: [errorRow], total: 1, page: 1, limit: 20 } }));
    fixture.detectChanges();

    const cell = fixture.debugElement.query(By.css('td[app-eulb-editable-field-cell][field="electedBodyStatus"]'));
    const tooltips = getTooltipSources(cell);

    expect(tooltips).toHaveSize(1);
    expect(tooltips[0].message).toBe('Elected Body Status is required.');
    expect(tooltips[0].disabled).toBeFalse();
    expect(cell.classes['eulb-cell-invalid']).toBeTrue();
    expect(cell.query(By.css('button[aria-label="Elected body status has a validation error"]'))).not.toBeNull();
  });

  it('renders one tooltip source for an invalid date dialog cell', () => {
    const errorRow: EulbRow = {
      ...row,
      errors: [
        {
          field: 'dateOfConstitution',
          code: 'required',
          message: 'Date on which the elected body is in place is required.',
        },
      ],
    };
    service.getRows.and.returnValue(of({ data: { rows: [errorRow], total: 1, page: 1, limit: 20 } }));
    fixture.detectChanges();

    const cell = fixture.debugElement.query(By.css('td[app-eulb-editable-field-cell][field="dateOfConstitution"]'));
    const tooltips = getTooltipSources(cell);

    expect(tooltips).toHaveSize(1);
    expect(tooltips[0].message).toBe('Date on which the elected body is in place is required.');
    expect(tooltips[0].disabled).toBeFalse();
    expect(cell.classes['eulb-cell-invalid']).toBeTrue();
    expect(
      cell.query(By.css('button[aria-label="Date on which the elected body is in place has a validation error"]')),
    ).not.toBeNull();
  });

  it('clicking an errored dialog cell enters edit mode and preserves the focus selector', fakeAsync(() => {
    const errorRow: EulbRow = {
      ...row,
      errors: [{ field: 'remarks', code: 'invalid', message: 'Remarks are required.' }],
    };
    service.getRows.and.returnValue(of({ data: { rows: [errorRow], total: 1, page: 1, limit: 20 } }));
    component.rowEditFields.set(createRowEditFields());
    fixture.detectChanges();

    const remarksCell = fixture.debugElement.query(By.css('td[app-eulb-editable-field-cell][field="remarks"]'));
    remarksCell.nativeElement.click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const remarksInput = fixture.debugElement.query(By.css('[data-eulb-edit-field="remarks"]'));
    expect(component.editingRowId()).toBe(row._id);
    expect(remarksInput).not.toBeNull();
    expect(remarksInput.nativeElement.getAttribute('data-eulb-edit-field')).toBe('remarks');
  }));

  it('saveRow applies backend row update field errors', () => {
    component.rows.set([row]);
    component.editForm = createEditForm({
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2026-01-01',
      dateOfExpiry: '2025-01-01',
      remarks: 'Needs review',
    });
    service.updateRow.and.returnValue(
      throwError(() => ({
        error: {
          success: false,
          statusCode: 400,
          message: 'Row validation failed.',
          errors: {
            dateOfExpiry: [
              {
                field: 'dateOfExpiry',
                message: 'Expiry date cannot be before constitution date.',
                code: 'invalidDate',
              },
            ],
          },
        },
      })),
    );

    component.saveRow(row._id);

    expect(component.editForm.get('dateOfExpiry')?.hasError('apiErrors')).toBeTrue();
    expect(component.getEditFieldErrors('dateOfExpiry')).toEqual(['Expiry date cannot be before constitution date.']);
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      `${row.ulbName} has errors. Please validate it.`,
      'snackbar-danger',
    );
  });

  it('shows dateOfExpiry minDate API error from the full backend shape including data context', () => {
    component.rows.set([row]);
    component.editForm = createEditForm({
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2026-01-01',
      dateOfExpiry: '2020-01-01',
      remarks: '',
    });
    service.updateRow.and.returnValue(
      throwError(() => ({
        error: {
          success: false,
          statusCode: 400,
          message: 'Validation failed.',
          errors: {
            dateOfExpiry: [
              { field: 'dateOfExpiry', code: 'minDate', message: 'Date of expiry cannot be in the past.' },
            ],
          },
          data: { rowId: row._id, rowNumber: 1, censusCode: '123', ulbName: row.ulbName },
        },
      })),
    );

    component.saveRow(row._id);

    expect(component.editForm.get('dateOfExpiry')?.hasError('apiErrors')).toBeTrue();
    expect(component.getEditFieldErrors('dateOfExpiry')).toEqual(['Date of expiry cannot be in the past.']);
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      `${row.ulbName} has errors. Please validate it.`,
      'snackbar-danger',
    );
  });

  describe('rowViewModels precomputed error data', () => {
    it('sets cellHasError and cellErrorText for rows with errors', () => {
      const errorRow: EulbRow = {
        ...row,
        errors: [
          { field: 'electedBodyStatus', code: 'invalid', message: 'Status is required.' },
          { field: 'dateOfConstitution', code: 'invalid', message: 'Invalid date.' },
        ],
      };
      component.rows.set([errorRow]);

      const vm = component.rowViewModels()[0];
      expect(vm.cellHasError['electedBodyStatus']).toBeTrue();
      expect(vm.cellErrorText['electedBodyStatus']).toBe('Status is required.');
      expect(vm.cellHasError['dateOfConstitution']).toBeTrue();
      expect(vm.cellErrorText['dateOfConstitution']).toBe('Invalid date.');
      expect(vm.cellHasError['remarks']).toBeFalsy();
      expect(vm.cellErrorText['remarks']).toBeUndefined();
    });

    it('joins multiple errors for the same field with newlines', () => {
      const multiErrorRow: EulbRow = {
        ...row,
        errors: [
          { field: 'electedBodyStatus', code: 'a', message: 'Error one.' },
          { field: 'electedBodyStatus', code: 'b', message: 'Error two.' },
        ],
      };
      component.rows.set([multiErrorRow]);

      const vm = component.rowViewModels()[0];
      expect(vm.cellErrorText['electedBodyStatus']).toBe('Error one.\nError two.');
    });

    it('produces no cellHasError entries for rows without errors', () => {
      const cleanRow: EulbRow = { ...row, errors: [] };
      component.rows.set([cleanRow]);

      const vm = component.rowViewModels()[0];
      expect(vm.cellHasError['electedBodyStatus']).toBeFalsy();
      expect(vm.cellHasError['dateOfConstitution']).toBeFalsy();
      expect(vm.cellHasError['dateOfExpiry']).toBeFalsy();
      expect(vm.cellHasError['remarks']).toBeFalsy();
    });

    it('preserves original row data on the view model', () => {
      component.rows.set([row]);

      const vm = component.rowViewModels()[0];
      expect(vm.row).toBe(row);
      expect(vm.row.ulbName).toBe(row.ulbName);
    });
  });

  describe('loadRows request ordering', () => {
    it('does not overwrite rows when a stale response arrives after a newer one', () => {
      const req1 = new Subject<EulbRowsApiResponse>();
      const req2 = new Subject<EulbRowsApiResponse>();

      let callCount = 0;
      service.getRows.and.callFake(() => {
        callCount++;
        return callCount === 1 ? req1.asObservable() : req2.asObservable();
      });

      const staleRow: EulbRow = { ...row, _id: 'stale', ulbName: 'Stale ULB' };
      const freshRow: EulbRow = { ...row, _id: 'fresh', ulbName: 'Fresh ULB' };

      component.loadRows(); // request 1 (older, slower)
      component.loadRows(); // request 2 (newer, faster)

      req2.next({ data: { rows: [freshRow], total: 5, page: 1, limit: 20 } });
      req2.complete();

      expect(component.rows()).toEqual([freshRow]);
      expect(component.total()).toBe(5);
      expect(component.isLoading()).toBeFalse();

      req1.next({ data: { rows: [staleRow], total: 99, page: 1, limit: 20 } });
      req1.complete();

      expect(component.rows()).toEqual([freshRow]);
      expect(component.total()).toBe(5);
    });

    it('does not show error snackbar when a stale request fails after the newer one succeeds', () => {
      const req1 = new Subject<EulbRowsApiResponse>();
      const req2 = new Subject<EulbRowsApiResponse>();

      let callCount = 0;
      service.getRows.and.callFake(() => {
        callCount++;
        return callCount === 1 ? req1.asObservable() : req2.asObservable();
      });

      component.loadRows(); // request 1 (older)
      component.loadRows(); // request 2 (newer)

      req2.next({ data: { rows: [row], total: 1, page: 1, limit: 20 } });
      req2.complete();

      utilityService.triggerSnackbar.calls.reset();
      req1.error(new Error('network error'));

      expect(utilityService.triggerSnackbar).not.toHaveBeenCalled();
      expect(component.isLoading()).toBeFalse();
    });

    it('applies result from the latest request when called once', () => {
      const freshRow: EulbRow = { ...row, _id: 'fresh', ulbName: 'Fresh ULB' };
      service.getRows.and.returnValue(of({ data: { rows: [freshRow], total: 3, page: 1, limit: 20 } }));

      component.loadRows();

      expect(component.rows()).toEqual([freshRow]);
      expect(component.total()).toBe(3);
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('close()', () => {
    it('passes an empty result when no row has been saved', () => {
      component.close();
      expect(dialogRef.close).toHaveBeenCalledOnceWith({});
    });

    it('includes the latest validation summary when a save returned one', () => {
      const summary = createSummary();
      service.updateRow.and.returnValue(of(createUpdateResponse(row, summary)));
      component.editForm = createEditForm({
        electedBodyStatus: 'Constituted',
        dateOfConstitution: '',
        dateOfExpiry: '',
        remarks: '',
      });

      component.saveRow(row._id);
      component.close();

      expect(dialogRef.close).toHaveBeenCalledOnceWith({ updatedSummary: summary });
    });
  });

  describe('cancelEdit()', () => {
    it('sets editingRowId to null', () => {
      component.editingRowId.set(row._id);
      component.cancelEdit();
      expect(component.editingRowId()).toBeNull();
    });

    it('resets the edit form so it has no controls', () => {
      component.editForm = createEditForm({
        electedBodyStatus: '',
        dateOfConstitution: '',
        dateOfExpiry: '',
        remarks: '',
      });
      component.cancelEdit();
      expect(Object.keys(component.editForm.controls)).toHaveSize(0);
    });

    it('clears API errors from controls before replacing the form', () => {
      const form = createEditForm({ electedBodyStatus: '', dateOfConstitution: '', dateOfExpiry: '', remarks: '' });
      component.editForm = form;
      form.get('remarks')?.setErrors({ apiErrors: ['Stale server error'] });

      component.cancelEdit();

      // clearAllEditApiErrors ran before editForm was replaced — the old control has no apiErrors
      expect(form.get('remarks')?.hasError('apiErrors')).toBeFalse();
    });
  });

  describe('goToPage boundary behavior', () => {
    it('does not call getRows for out-of-range page numbers', () => {
      component.total.set(20); // totalPages = ceil(20/20) = 1

      component.goToPage(0); // below minimum
      component.goToPage(2); // above totalPages

      expect(service.getRows).not.toHaveBeenCalled();
    });

    it('updates page and loads rows when given a valid page number', () => {
      component.total.set(40); // totalPages = ceil(40/20) = 2

      component.goToPage(2);

      expect(component.page()).toBe(2);
      expect(service.getRows).toHaveBeenCalledTimes(1);
    });
  });

  function createEditForm(values: {
    electedBodyStatus: string;
    dateOfConstitution: string;
    dateOfExpiry: string;
    remarks: string;
  }): FormGroup {
    return new FormGroup({
      electedBodyStatus: new FormControl(values.electedBodyStatus),
      dateOfConstitution: new FormControl(values.dateOfConstitution),
      dateOfExpiry: new FormControl(values.dateOfExpiry),
      remarks: new FormControl(values.remarks),
    });
  }

  function createUpdateResponse(updatedRow: EulbRow, validationSummary?: EulbValidationSummary): EulbUpdateRowResponse {
    return {
      data: {
        row: updatedRow,
        ...(validationSummary && { validationSummary }),
      },
    };
  }

  function createSummary(): EulbValidationSummary {
    return {
      dbUlbCount: 10,
      maxAllowedExcelRows: 20,
      excelRowCount: 12,
      matchedDbUlbCount: 10,
      missingDbUlbCount: 0,
      extraExcelRowCount: 2,
      duplicateUlbCount: 0,
      errorRowCount: 1,
      validationStatus: 'INVALID',
      activeDatasetVersion: 1,
    };
  }

  function createRowEditFields(): ConditionalFieldConfig[] {
    return [
      {
        key: 'electedBodyStatus',
        label: 'Elected Body Status',
        formFieldType: 'select',
        options: ['Constituted', 'Not Constituted', '6th Schedule'],
      },
      { key: 'dateOfConstitution', label: 'Date on which the elected body is in place', formFieldType: 'date' },
      { key: 'dateOfExpiry', label: 'Date of Expiry', formFieldType: 'date' },
      { key: 'remarks', label: 'Remarks', formFieldType: 'text' },
    ];
  }

  function createRow(): EulbRow {
    return {
      _id: 'row-1',
      rowNumber: 1,
      censusCode: '123',
      ulbName: 'Test ULB',
      electedBodyStatus: 'Not Constituted',
      dateOfConstitution: '',
      dateOfExpiry: '',
      remarks: '',
      validationStatus: 'INVALID',
      errors: [],
    };
  }

  function getTooltipSources(cell: DebugElement): MatTooltip[] {
    const sources = new Set<MatTooltip>([cell.injector.get(MatTooltip)]);
    for (const tooltipElement of cell.queryAll(By.directive(MatTooltip))) {
      sources.add(tooltipElement.injector.get(MatTooltip));
    }
    return [...sources];
  }
});

describe('EulbRowsDialogComponent buildEditForm', () => {
  const stateId = 'state-1';
  const yearId = 'year-1';

  let fixture: ComponentFixture<EulbRowsDialogComponent>;
  let component: EulbRowsDialogComponent;

  beforeEach(async () => {
    const service = jasmine.createSpyObj<EulbStatusService>('EulbStatusService', ['getRows', 'updateRow']);
    service.getRows.and.returnValue(of({ data: { rows: [], total: 0, page: 1, limit: 20 } }));

    const utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    const dialogRef = jasmine.createSpyObj<MatDialogRef<EulbRowsDialogComponent>>('MatDialogRef', ['close']);

    const dynamicFormSpy = jasmine.createSpyObj<DynamicFormService>('DynamicFormService', [
      'createContorl',
      'bindValidations',
    ]);
    dynamicFormSpy.createContorl.and.callFake(() => new FormControl(''));
    dynamicFormSpy.bindValidations.and.returnValue(Validators.nullValidator);

    const dialogData: EulbRowsDialogData = {
      stateId,
      yearId,
      rowEditFields: [
        { key: 'electedBodyStatus', label: 'Elected Body Status', formFieldType: 'select' },
        { key: 'remarks', label: 'Remarks', formFieldType: 'text' },
      ],
      canEdit: true,
    };

    await TestBed.configureTestingModule({
      imports: [EulbRowsDialogComponent],
      providers: [
        { provide: EulbStatusService, useValue: service },
        { provide: UtilityService, useValue: utilityService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: DynamicFormService, useValue: dynamicFormSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EulbRowsDialogComponent);
    component = fixture.componentInstance;
  });

  const testRow: EulbRow = {
    _id: 'db-1',
    rowNumber: 1,
    censusCode: '123',
    ulbName: 'DB ULB',
    electedBodyStatus: 'Constituted',
    dateOfConstitution: '',
    dateOfExpiry: '',
    remarks: '',
    validationStatus: 'VALID',
    errors: [],
  };

  it('never creates censusCode or ulbName form controls — identity fields are not portal-editable', () => {
    component.startEdit(testRow);

    expect(component.getEditFormControl('censusCode')).toBeNull();
    expect(component.getEditFormControl('ulbName')).toBeNull();
  });
});

describe('EulbRowsDialogComponent edit-form subscription teardown', () => {
  const stateId = 'state-1';
  const yearId = 'year-1';

  const testRow: EulbRow = {
    _id: 'row-1',
    rowNumber: 1,
    censusCode: '123',
    ulbName: 'Test ULB',
    electedBodyStatus: 'Not Constituted',
    dateOfConstitution: '',
    dateOfExpiry: '',
    remarks: '',
    validationStatus: 'INVALID',
    errors: [],
  };

  let fixture: ComponentFixture<EulbRowsDialogComponent>;
  let component: EulbRowsDialogComponent;

  beforeEach(async () => {
    const service = jasmine.createSpyObj<EulbStatusService>('EulbStatusService', ['getRows', 'updateRow']);
    service.getRows.and.returnValue(of({ data: { rows: [], total: 0, page: 1, limit: 20 } }));

    const utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    const dialogRef = jasmine.createSpyObj<MatDialogRef<EulbRowsDialogComponent>>('MatDialogRef', ['close']);

    const dynamicFormSpy = jasmine.createSpyObj<DynamicFormService>('DynamicFormService', [
      'createContorl',
      'bindValidations',
    ]);
    dynamicFormSpy.createContorl.and.callFake(() => new FormControl(''));
    dynamicFormSpy.bindValidations.and.returnValue(Validators.nullValidator);

    const remarksField: ConditionalFieldConfig = { key: 'remarks', label: 'Remarks', formFieldType: 'text' };
    const dateOfExpiryField: ConditionalFieldConfig = {
      key: 'dateOfExpiry',
      label: 'Date of Expiry',
      formFieldType: 'date',
    };
    const dialogData: EulbRowsDialogData = {
      stateId,
      yearId,
      rowEditFields: [remarksField, dateOfExpiryField],
      canEdit: true,
    };

    await TestBed.configureTestingModule({
      imports: [EulbRowsDialogComponent],
      providers: [
        { provide: EulbStatusService, useValue: service },
        { provide: UtilityService, useValue: utilityService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: DynamicFormService, useValue: dynamicFormSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EulbRowsDialogComponent);
    component = fixture.componentInstance;
  });

  it('does not carry over valueChanges subscriptions from a cancelled edit session into the next', () => {
    // First edit session: build form, stamp an API error
    component.startEdit(testRow);
    const oldRemarksCtrl = component.editForm.get('remarks')!;
    oldRemarksCtrl.setErrors({ apiErrors: ['Stale error'] });

    // Cancel — old subscriptions should be torn down here
    component.cancelEdit();

    // Second edit session: build a fresh form, stamp a new API error
    component.startEdit(testRow);
    component.editForm.get('remarks')!.setErrors({ apiErrors: ['Current error'] });

    // Emitting from the old orphaned control would call clearApiError('remarks') on the
    // current editForm if the old subscription were still alive, clearing the new error.
    oldRemarksCtrl.setValue('anything');

    expect(component.editForm.get('remarks')?.hasError('apiErrors')).toBeTrue();
  });

  it('clears dateOfExpiry API error when the user edits the field after a row update failure', () => {
    component.startEdit(testRow);
    const dateOfExpiryCtrl = component.editForm.get('dateOfExpiry')!;

    dateOfExpiryCtrl.setErrors({ apiErrors: ['Date of expiry cannot be in the past.'] });
    dateOfExpiryCtrl.markAsTouched();

    expect(dateOfExpiryCtrl.hasError('apiErrors')).toBeTrue();

    dateOfExpiryCtrl.setValue('2030-01-01');

    expect(dateOfExpiryCtrl.hasError('apiErrors')).toBeFalse();
  });
});
