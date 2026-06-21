import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { EulbStatusService } from '../eulb-status.service';
import { EulbRow, EulbRowsApiResponse, EulbRowsDialogData, EulbUpdateRowResponse } from '../eulb-status.models';
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
          errors: [
            {
              field: 'dateOfExpiry',
              message: 'Expiry date cannot be before constitution date.',
              code: 'invalidDate',
              ulbName: row.ulbName,
            },
          ],
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

  function createUpdateResponse(updatedRow: EulbRow): EulbUpdateRowResponse {
    return {
      data: {
        row: updatedRow,
      },
    };
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
      rowType: 'DB_ULB',
      validationStatus: 'INVALID',
      errors: [],
    };
  }
});
