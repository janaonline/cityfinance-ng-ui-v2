import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { AbstractControl } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { of, Subject, throwError } from 'rxjs';
import { UtilityService } from '../../../../../../core/services/utility.service';
import { FileService } from '../../../../../../shared/dynamic-form/components/file/file.service';
import { XvifcModuleService } from '../../../../xvi-fc-module.service';
import {
  EulbPostSubmissionUpdateDocument,
  EulbPostSubmissionUpdateMetadata,
  EulbPostSubmissionUpdateRow,
  EulbPostSubmissionUpdateRowsData,
  EulbPostSubmissionUpdateSubmitResponse,
  EulbPostSubmissionUpdateValidateResponse,
  EulbStatusSummary,
} from '../../eulb-status.models';
import { EulbStatusService } from '../../eulb-status.service';
import { EulbPostUpdateComponent } from './eulb-post-update.component';

describe('EulbPostUpdateComponent', () => {
  const stateId = 'state-1';
  const yearId = 'year-2024';

  let fixture: ComponentFixture<EulbPostUpdateComponent>;
  let component: EulbPostUpdateComponent;
  let service: jasmine.SpyObj<EulbStatusService>;
  let fileService: jasmine.SpyObj<FileService>;
  let moduleService: jasmine.SpyObj<XvifcModuleService>;
  let utilityService: jasmine.SpyObj<UtilityService>;

  function createMetadata(overrides: Partial<EulbPostSubmissionUpdateMetadata> = {}): EulbPostSubmissionUpdateMetadata {
    return {
      stateId: 'state-1',
      questions: [
        {
          key: 'proofOfElection',
          label: 'Proof of Election',
          formFieldType: 'file',
          allowedFileTypes: ['pdf'],
          maxFileSize: 20,
          folderPath: 'state/year-2024/elected-body/post-update',
          // Intentional pre-canonical shape: exercises the hydration normalizer (empty → null control).
          value: { fileName: '', fileUrl: '', fileSize: null, mimeType: '' },
          validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
        },
      ],
      formStatus: 5,
      canUpdate: true,
      permissions: { canView: true, canSubmitUpdate: true },
      summary: { eligibleRowCount: 10 },
      rowEditFields: [
        {
          key: 'electedBodyStatus',
          label: 'Elected Body Status',
          formFieldType: 'select',
          options: ['Constituted', 'Not Constituted', 'Exempt'],
        },
        { key: 'dateOfConstitution', label: 'Date of Constitution', formFieldType: 'date' },
        { key: 'dateOfExpiry', label: 'Date of Expiry', formFieldType: 'date' },
        { key: 'remarks', label: 'Remarks', formFieldType: 'text' },
      ],
      ...overrides,
    };
  }

  function createRow(overrides: Partial<EulbPostSubmissionUpdateRow> = {}): EulbPostSubmissionUpdateRow {
    return {
      _id: 'row-1',
      rowNumber: 1,
      censusCode: '100001',
      ulbName: 'Test ULB',
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2020-01-01',
      dateOfExpiry: '2030-01-01',
      remarks: null,
      rowType: 'DB_ULB',
      validationStatus: 'VALID',
      errors: [],
      ...overrides,
    };
  }

  function createRowsData(overrides: Partial<EulbPostSubmissionUpdateRowsData> = {}): EulbPostSubmissionUpdateRowsData {
    return {
      rows: [createRow()],
      total: 1,
      page: 1,
      limit: 20,
      eligibleRule: { allowedFormStatuses: [4, 5], today: '2026-06-21' },
      ...overrides,
    };
  }

  function createStatusSummary(overrides: Partial<EulbStatusSummary> = {}): EulbStatusSummary {
    return {
      totalUlbCount: 10,
      constitutedCount: 7,
      notConstitutedCount: 2,
      exemptCount: 1,
      ...overrides,
    };
  }

  function createValidateResponse(
    overrides: Partial<EulbPostSubmissionUpdateValidateResponse> = {},
  ): EulbPostSubmissionUpdateValidateResponse {
    return {
      success: true,
      message: 'All rows are valid.',
      data: {
        validationStatus: 'VALID',
        rows: [
          {
            rowId: 'row-1',
            rowNumber: 1,
            censusCode: '100001',
            ulbName: 'Test ULB',
            electedBodyStatus: 'Constituted',
            dateOfConstitution: '2020-01-01',
            dateOfExpiry: '2030-01-01',
            remarks: 'Updated',
            validationStatus: 'VALID',
            errors: [],
          },
        ],
        errorRowCount: 0,
        validRowCount: 1,
        totalRowCount: 1,
      },
      timestamp: '2026-06-22T00:00:00.000Z',
      ...overrides,
    };
  }

  function createDocument(overrides: Partial<EulbPostSubmissionUpdateDocument> = {}): EulbPostSubmissionUpdateDocument {
    return {
      originalName: 'combined.pdf',
      path: 'state/eulb-post-submission-update/combined.pdf',
      mimeType: 'application/pdf',
      sizeKb: 1,
      pageCount: 2,
      ...overrides,
    };
  }

  function createSubmitResponse(
    overrides: Partial<EulbPostSubmissionUpdateSubmitResponse> = {},
  ): EulbPostSubmissionUpdateSubmitResponse {
    return {
      success: true,
      message: 'Elected Urban Local Bodies update submitted successfully.',
      data: {
        batchId: 'batch-1',
        updatedRowCount: 1,
        document: createDocument(),
        validationSummary: {
          dbUlbCount: 1,
          maxAllowedExcelRows: 2,
          excelRowCount: 1,
          matchedDbUlbCount: 1,
          missingDbUlbCount: 0,
          extraExcelRowCount: 0,
          errorRowCount: 0,
          validationStatus: 'VALID',
          activeDatasetVersion: 1,
        },
      },
      timestamp: '2026-06-22T00:00:00.000Z',
      ...overrides,
    };
  }

  function makeChangedRow(): void {
    component.startEdit(component.rows()[0]);
    component.editForm.controls.remarks.setValue('Updated for submit');
  }

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: stateId }));

    service = jasmine.createSpyObj<EulbStatusService>('EulbStatusService', [
      'getPostSubmissionUpdateMetadata',
      'getPostSubmissionUpdateRows',
      'validatePostSubmissionUpdateRows',
      'submitPostSubmissionUpdate',
    ]);
    service.getPostSubmissionUpdateMetadata.and.returnValue(of(createMetadata()));
    service.getPostSubmissionUpdateRows.and.returnValue(of(createRowsData()));
    service.validatePostSubmissionUpdateRows.and.returnValue(of(createValidateResponse()));
    service.submitPostSubmissionUpdate.and.returnValue(of(createSubmitResponse()));

    fileService = jasmine.createSpyObj<FileService>('FileService', ['getSignedUrls', 'newUploadFileToS3']);

    moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue(yearId);

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', [
      'triggerSnackbar',
      'getNonEmptyString',
      'formatBytes',
    ]);
    utilityService.getNonEmptyString.and.callFake((value: unknown) => {
      if (typeof value !== 'string') {
        return null;
      }

      const trimmedValue = value.trim();
      return trimmedValue.length > 0 ? trimmedValue : null;
    });
    utilityService.formatBytes.and.callFake((bytes: number) => `${bytes} Bytes`);

    await TestBed.configureTestingModule({
      imports: [EulbPostUpdateComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: EulbStatusService, useValue: service },
        { provide: FileService, useValue: fileService },
        { provide: XvifcModuleService, useValue: moduleService },
        { provide: UtilityService, useValue: utilityService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EulbPostUpdateComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  it('calls metadata endpoint on init and loads rows when canUpdate and canView are true', () => {
    fixture.detectChanges();

    expect(service.getPostSubmissionUpdateMetadata).toHaveBeenCalledOnceWith(stateId, yearId);
    expect(component.canView()).toBeTrue();
    expect(service.getPostSubmissionUpdateRows).toHaveBeenCalledOnceWith(
      stateId,
      yearId,
      jasmine.objectContaining({ page: 1, limit: 20 }),
    );
    expect(component.isLoadingMeta()).toBeFalse();
    expect(component.isLoadingRows()).toBeFalse();
  });

  it('shows not-available state and does not call rows endpoint when canUpdate is false', () => {
    service.getPostSubmissionUpdateMetadata.and.returnValue(
      of(
        createMetadata({
          canUpdate: false,
          permissions: { canView: false, canSubmitUpdate: false },
        }),
      ),
    );
    fixture.detectChanges();

    expect(component.canView()).toBeFalse();
    expect(service.getPostSubmissionUpdateRows).not.toHaveBeenCalled();
    // rows() is [] when canUpdate=false, so rowViewModels().length=0 and the
    // @else branch (which contains .alert-secondary) is never entered; the DOM
    // shows the "No ULBs" branch instead.
    expect(component.rows()).toEqual([]);
  });

  it('renders loaded rows and eligible row count after a successful rows load', () => {
    service.getPostSubmissionUpdateMetadata.and.returnValue(of(createMetadata({ summary: { eligibleRowCount: 5 } })));
    service.getPostSubmissionUpdateRows.and.returnValue(
      of(createRowsData({ rows: [createRow(), createRow()], total: 2 })),
    );
    fixture.detectChanges();

    expect(component.rows().length).toBe(2);
    expect(component.total()).toBe(2);
    expect(component.eligibleRowCount()).toBe(5);
    fixture.detectChanges();

    const count = fixture.debugElement.query(By.css('[data-testid="eligible-row-count"]'));
    const pageText = fixture.debugElement.nativeElement.textContent;
    expect(count.nativeElement.textContent.trim()).toBe('5');
    expect(pageText).toContain('Test ULB');
  });

  it('reloads rows with the search term after the debounce period elapses', fakeAsync(() => {
    fixture.detectChanges();
    service.getPostSubmissionUpdateRows.calls.reset();

    component.filterForm.controls.search.setValue('Bhopal');
    tick(399);
    expect(service.getPostSubmissionUpdateRows).not.toHaveBeenCalled();

    tick(1);
    expect(service.getPostSubmissionUpdateRows).toHaveBeenCalledWith(
      stateId,
      yearId,
      jasmine.objectContaining({ search: 'Bhopal', page: 1 }),
    );
  }));

  it('navigates to a specific page and reloads rows with the new page number', () => {
    service.getPostSubmissionUpdateRows.and.returnValue(of(createRowsData({ total: 50 })));
    fixture.detectChanges();
    service.getPostSubmissionUpdateRows.calls.reset();

    component.goToPage(2);

    expect(component.page()).toBe(2);
    expect(service.getPostSubmissionUpdateRows).toHaveBeenCalledWith(
      stateId,
      yearId,
      jasmine.objectContaining({ page: 2, limit: 20 }),
    );
  });

  it('shows a danger snackbar and clears loading state when the rows endpoint fails', () => {
    service.getPostSubmissionUpdateRows.and.returnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Failed to load eligible rows.', 'snackbar-danger');
    expect(component.rowsErrorMessage()).toBe('Failed to load eligible rows.');
    expect(component.isLoadingRows()).toBeFalse();
  });

  it('builds row view models with cell error info for rows that have backend validation errors', () => {
    const errorRow = createRow({
      errors: [{ field: 'dateOfExpiry', code: 'minDate', message: 'Date of expiry cannot be in the past.' }],
      validationStatus: 'INVALID',
    });
    service.getPostSubmissionUpdateRows.and.returnValue(of(createRowsData({ rows: [errorRow] })));
    fixture.detectChanges();

    const vm = component.rowViewModels()[0];
    expect(vm.cellHasError['dateOfExpiry']).toBeTrue();
    expect(vm.cellErrorText['dateOfExpiry']).toBe('Date of expiry cannot be in the past.');
    expect(vm.cellHasError['electedBodyStatus']).toBeUndefined();
  });

  it('does not include Exempt as a selectable elected body status filter option on this page', () => {
    fixture.detectChanges();

    const optionValues: readonly string[] = component.electedBodyStatusOptions.map((o) => o.value);
    expect(optionValues).not.toContain('Exempt');
  });

  it('starts editing a row and renders editable controls', () => {
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    fixture.detectChanges();

    expect(component.editingRowId()).toBe('row-1');
    expect(fixture.debugElement.query(By.css('select[aria-label="Elected Body Status"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('input[aria-label="Date of Constitution"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('input[aria-label="Remarks"]'))).not.toBeNull();
  });

  it('keeps editable field cells as native td elements without wrapper components', () => {
    fixture.detectChanges();

    const fieldCells = fixture.debugElement.queryAll(By.css('tbody tr td[app-eulb-editable-field-cell]'));

    expect(fieldCells).toHaveSize(4);
    expect(fixture.debugElement.query(By.css('app-eulb-editable-field-cell'))).toBeNull();
  });

  it('renders one tooltip source for an invalid electedBodyStatus post-update cell', () => {
    service.getPostSubmissionUpdateRows.and.returnValue(
      of(
        createRowsData({
          rows: [
            createRow({
              errors: [
                {
                  field: 'electedBodyStatus',
                  code: 'required',
                  message: 'Elected Body Status is required.',
                },
              ],
              validationStatus: 'INVALID',
            }),
          ],
        }),
      ),
    );
    fixture.detectChanges();

    const cell = fixture.debugElement.query(By.css('td[app-eulb-editable-field-cell][field="electedBodyStatus"]'));
    const tooltips = getTooltipSources(cell);

    expect(tooltips).toHaveSize(1);
    expect(tooltips[0].message).toBe('Elected Body Status is required.');
    expect(tooltips[0].disabled).toBeFalse();
    expect(cell.classes['eulb-cell-invalid']).toBeTrue();
    expect(cell.query(By.css('button[aria-label="Elected body status has a validation error"]'))).not.toBeNull();
  });

  it('renders one tooltip source for an invalid date post-update cell', () => {
    service.getPostSubmissionUpdateRows.and.returnValue(
      of(
        createRowsData({
          rows: [
            createRow({
              errors: [
                {
                  field: 'dateOfExpiry',
                  code: 'minDate',
                  message: 'Date of expiry cannot be in the past.',
                },
              ],
              validationStatus: 'INVALID',
            }),
          ],
        }),
      ),
    );
    fixture.detectChanges();

    const cell = fixture.debugElement.query(By.css('td[app-eulb-editable-field-cell][field="dateOfExpiry"]'));
    const tooltips = getTooltipSources(cell);

    expect(tooltips).toHaveSize(1);
    expect(tooltips[0].message).toBe('Date of expiry cannot be in the past.');
    expect(tooltips[0].disabled).toBeFalse();
    expect(cell.classes['eulb-cell-invalid']).toBeTrue();
    expect(cell.query(By.css('button[aria-label="Date of expiry has a validation error"]'))).not.toBeNull();
  });

  it('clicking an errored post-update cell enters edit mode and preserves the focus selector', fakeAsync(() => {
    service.getPostSubmissionUpdateRows.and.returnValue(
      of(
        createRowsData({
          rows: [
            createRow({
              errors: [{ field: 'dateOfExpiry', code: 'minDate', message: 'Date of expiry cannot be in the past.' }],
              validationStatus: 'INVALID',
            }),
          ],
        }),
      ),
    );
    fixture.detectChanges();

    const dateOfExpiryCell = fixture.debugElement.query(
      By.css('td[app-eulb-editable-field-cell][field="dateOfExpiry"]'),
    );
    dateOfExpiryCell.nativeElement.click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const dateOfExpiryInput = fixture.debugElement.query(By.css('[data-eulb-post-edit-field="dateOfExpiry"]'));
    expect(component.editingRowId()).toBe('row-1');
    expect(dateOfExpiryInput).not.toBeNull();
    expect(dateOfExpiryInput.nativeElement.getAttribute('data-eulb-post-edit-field')).toBe('dateOfExpiry');
  }));

  it('does not expose Exempt in the edit status dropdown', () => {
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    fixture.detectChanges();

    const options = fixture.debugElement
      .queryAll(By.css('select[aria-label="Elected Body Status"] option'))
      .map((option) => option.nativeElement.textContent.trim());
    expect(options).not.toContain('Exempt');
  });

  it('marks a row as modified when an editable value changes', () => {
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    component.editForm.controls.remarks.setValue('Updated locally');
    fixture.detectChanges();

    expect(component.changedRowCount()).toBe(1);
    expect(component.isRowModified('row-1')).toBeTrue();
    expect(fixture.debugElement.nativeElement.textContent).toContain('Modified');
  });

  it('resets a changed row back to the loaded backend value', () => {
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    component.editForm.controls.remarks.setValue('Updated locally');
    component.resetRow('row-1');

    expect(component.changedRowCount()).toBe(0);
    expect(component.editingRowId()).toBeNull();
    expect(component.rows()[0].remarks).toBeNull();
  });

  it('does not call validate API when there are no changed rows', () => {
    fixture.detectChanges();

    component.validateChanges();

    expect(service.validatePostSubmissionUpdateRows).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('No changed rows to validate.', 'snackbar-warn');
  });

  it('validates only changed rows', () => {
    service.getPostSubmissionUpdateRows.and.returnValue(
      of(
        createRowsData({
          rows: [
            createRow({ _id: 'row-1', rowNumber: 1, ulbName: 'Changed ULB' }),
            createRow({ _id: 'row-2', rowNumber: 2, censusCode: '100002', ulbName: 'Unchanged ULB' }),
          ],
          total: 2,
        }),
      ),
    );
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    component.editForm.controls.remarks.setValue('Changed only this row');
    component.validateChanges();

    expect(service.validatePostSubmissionUpdateRows).toHaveBeenCalledWith(
      stateId,
      yearId,
      jasmine.objectContaining({
        rows: [
          jasmine.objectContaining({
            rowId: 'row-1',
            remarks: 'Changed only this row',
          }),
        ],
      }),
    );
  });

  it('keeps modified rows and clears changed-row errors when validation succeeds', () => {
    service.getPostSubmissionUpdateRows.and.returnValue(
      of(
        createRowsData({
          rows: [
            createRow({
              errors: [{ field: 'remarks', code: 'invalid', message: 'Old remarks error.' }],
              validationStatus: 'INVALID',
            }),
          ],
        }),
      ),
    );
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    component.editForm.controls.remarks.setValue('Updated');
    component.validateChanges();

    const vm = component.rowViewModels()[0];
    expect(component.changedRowCount()).toBe(1);
    expect(vm.row.validationStatus).toBe('VALID');
    expect(vm.cellHasError['remarks']).toBeUndefined();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('All rows are valid.', 'snackbar-success');
  });

  it('applies returned validation errors to the matching changed row and cell', () => {
    service.validatePostSubmissionUpdateRows.and.returnValue(
      of(
        createValidateResponse({
          message: 'Validation complete. 1 of 1 row(s) have errors.',
          data: {
            validationStatus: 'INVALID',
            rows: [
              {
                rowId: 'row-1',
                rowNumber: 1,
                censusCode: '100001',
                ulbName: 'Test ULB',
                electedBodyStatus: 'Constituted',
                dateOfConstitution: null,
                dateOfExpiry: '2030-01-01',
                remarks: 'Updated',
                validationStatus: 'INVALID',
                errors: [
                  {
                    field: 'dateOfConstitution',
                    code: 'required',
                    message: 'Date of constitution is required.',
                  },
                ],
              },
            ],
            errorRowCount: 1,
            validRowCount: 0,
            totalRowCount: 1,
          },
        }),
      ),
    );
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    component.editForm.controls.dateOfConstitution.setValue('');
    component.validateChanges();

    const vm = component.rowViewModels()[0];
    expect(vm.row.validationStatus).toBe('INVALID');
    expect(vm.cellHasError['dateOfConstitution']).toBeTrue();
    expect(vm.cellErrorText['dateOfConstitution']).toBe('Date of constitution is required.');
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Validation complete. 1 of 1 row(s) have errors.',
      'snackbar-danger',
    );
  });

  it('keeps returned validation errors available for tooltip bindings in edit mode', () => {
    service.validatePostSubmissionUpdateRows.and.returnValue(
      of(
        createValidateResponse({
          data: {
            validationStatus: 'INVALID',
            rows: [
              {
                rowId: 'row-1',
                rowNumber: 1,
                censusCode: '100001',
                ulbName: 'Test ULB',
                electedBodyStatus: 'Constituted',
                dateOfConstitution: '2020-01-01',
                dateOfExpiry: '2030-01-01',
                remarks: 'Updated',
                validationStatus: 'INVALID',
                errors: [{ field: 'remarks', code: 'invalid', message: 'Remarks are too long.' }],
              },
            ],
            errorRowCount: 1,
            validRowCount: 0,
            totalRowCount: 1,
          },
        }),
      ),
    );
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    component.editForm.controls.remarks.setValue('Updated');
    component.validateChanges();
    fixture.detectChanges();

    const remarksInput = fixture.debugElement.query(By.css('input[aria-label="Remarks"]'));
    expect(remarksInput.classes['is-invalid']).toBeTrue();
    expect(component.rowViewModels()[0].cellErrorText['remarks']).toBe('Remarks are too long.');
  });

  it('shows existing snackbar behavior when validate has a structural API error', () => {
    service.validatePostSubmissionUpdateRows.and.returnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    component.editForm.controls.remarks.setValue('Updated');
    component.validateChanges();

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Failed to validate changed rows.', 'snackbar-danger');
    expect(component.changedRowCount()).toBe(1);
  });

  it('ignores stale validate responses when a newer validation completes first', () => {
    const firstValidate$ = new Subject<EulbPostSubmissionUpdateValidateResponse>();
    const secondValidate$ = new Subject<EulbPostSubmissionUpdateValidateResponse>();
    service.validatePostSubmissionUpdateRows.and.returnValues(firstValidate$, secondValidate$);
    fixture.detectChanges();

    component.startEdit(component.rows()[0]);
    component.editForm.controls.remarks.setValue('First change');
    component.validateChanges();
    component.editForm.controls.remarks.setValue('Second change');
    component.validateChanges();

    secondValidate$.next(createValidateResponse());
    secondValidate$.complete();
    firstValidate$.next(
      createValidateResponse({
        data: {
          validationStatus: 'INVALID',
          rows: [
            {
              rowId: 'row-1',
              rowNumber: 1,
              censusCode: '100001',
              ulbName: 'Test ULB',
              electedBodyStatus: 'Constituted',
              dateOfConstitution: '2020-01-01',
              dateOfExpiry: '2030-01-01',
              remarks: 'First change',
              validationStatus: 'INVALID',
              errors: [{ field: 'remarks', code: 'stale', message: 'Stale error.' }],
            },
          ],
          errorRowCount: 1,
          validRowCount: 0,
          totalRowCount: 1,
        },
      }),
    );
    firstValidate$.complete();

    expect(component.rowViewModels()[0].row.validationStatus).toBe('VALID');
    expect(component.rowViewModels()[0].cellHasError['remarks']).toBeUndefined();
  });

  it('sets updateDocument when proofOfElectionForm receives a valid file value', () => {
    fixture.detectChanges();

    // FormGroup<{}> infers AbstractControl<never> for dynamic keys; widen to unknown to call setValue.
    (component.proofOfElectionForm.get('proofOfElection') as AbstractControl<unknown>).setValue({
      originalName: 'combined.pdf',
      path: 'state/eulb/combined.pdf',
      mimeType: 'application/pdf',
      sizeKb: 1,
      pageCount: 2,
    });

    expect(component.updateDocument()).toEqual(
      jasmine.objectContaining({ originalName: 'combined.pdf', path: 'state/eulb/combined.pdf' }),
    );
  });

  it('clears updateDocument when proofOfElectionForm control value has no file name or path', () => {
    fixture.detectChanges();
    component.updateDocument.set(createDocument());

    (component.proofOfElectionForm.get('proofOfElection') as AbstractControl<unknown>).setValue({
      originalName: '',
      path: '',
      mimeType: '',
      sizeKb: 0,
      pageCount: null,
    });

    expect(component.updateDocument()).toBeNull();
  });

  it('clears updateDocument when proofOfElectionForm control is set to null', () => {
    fixture.detectChanges();
    component.updateDocument.set(createDocument());

    (component.proofOfElectionForm.get('proofOfElection') as AbstractControl<unknown>).setValue(null);

    expect(component.updateDocument()).toBeNull();
  });

  it('does not allow submit when submit permission is false', () => {
    fixture.detectChanges();
    makeChangedRow();
    component.updateDocument.set(createDocument());
    component.validateChanges();

    component.metadata.set(
      createMetadata({
        permissions: { canView: true, canSubmitUpdate: false },
      }),
    );

    expect(component.canSubmitUpdate()).toBeFalse();
  });

  it('does not call submit API when submit permission is false even if submit is called directly', () => {
    fixture.detectChanges();
    makeChangedRow();
    component.updateDocument.set(createDocument());
    component.validateChanges();
    component.metadata.set(
      createMetadata({
        permissions: { canView: true, canSubmitUpdate: false },
      }),
    );
    service.submitPostSubmissionUpdate.calls.reset();

    component.submitUpdate();

    expect(service.submitPostSubmissionUpdate).not.toHaveBeenCalled();
  });

  it('returns early when submit is already in progress', () => {
    fixture.detectChanges();
    component.isSubmitting.set(true);

    component.submitUpdate();

    expect(service.submitPostSubmissionUpdate).not.toHaveBeenCalled();
  });

  it('blocks submit when there are no changed rows', () => {
    fixture.detectChanges();
    component.updateDocument.set(createDocument());

    component.submitUpdate();

    expect(service.submitPostSubmissionUpdate).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('No changed rows to submit.', 'snackbar-warn');
  });

  it('blocks submit when no PDF is uploaded', () => {
    fixture.detectChanges();
    makeChangedRow();
    component.validateChanges();

    component.submitUpdate();

    expect(service.submitPostSubmissionUpdate).not.toHaveBeenCalled();
    expect(component.documentErrorMessage()).toBe('Please upload the combined PDF before submitting.');
  });

  it('blocks submit when changed rows have not been validated', () => {
    fixture.detectChanges();
    makeChangedRow();
    component.updateDocument.set(createDocument());

    component.submitUpdate();

    expect(service.submitPostSubmissionUpdate).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Please validate changes before submitting.',
      'snackbar-warn',
    );
  });

  it('marks validation as stale after a new edit following successful validation', () => {
    fixture.detectChanges();
    makeChangedRow();
    component.validateChanges();

    component.editForm.controls.remarks.setValue('Changed after validation');

    expect(component.validationState()).toBe('STALE');
  });

  it('submits changed rows and document metadata as one JSON payload', () => {
    fixture.detectChanges();
    makeChangedRow();
    component.updateDocument.set(createDocument());
    component.validateChanges();

    component.submitUpdate();

    expect(service.submitPostSubmissionUpdate).toHaveBeenCalledWith(stateId, yearId, {
      rows: [
        jasmine.objectContaining({
          rowId: 'row-1',
          remarks: 'Updated for submit',
        }),
      ],
      document: createDocument(),
    });
  });

  it('clears local submit state and reloads data on submit success', () => {
    fixture.detectChanges();
    makeChangedRow();
    component.updateDocument.set(createDocument());
    component.validateChanges();
    service.getPostSubmissionUpdateMetadata.calls.reset();
    service.getPostSubmissionUpdateRows.calls.reset();

    component.submitUpdate();

    expect(component.changedRowCount()).toBe(0);
    expect(component.updateDocument()).toBeNull();
    expect(component.validationState()).toBe('NOT_VALIDATED');
    expect(service.getPostSubmissionUpdateMetadata).toHaveBeenCalledOnceWith(stateId, yearId);
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Elected Urban Local Bodies update submitted successfully.',
      'snackbar-success',
    );
  });

  it('keeps changed rows and document when submit returns a structural document error', () => {
    service.submitPostSubmissionUpdate.and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Validation failed.',
        errors: {
          document: [{ code: 'invalidType', message: 'Only PDF files are accepted.' }],
        },
      })),
    );
    fixture.detectChanges();
    makeChangedRow();
    component.updateDocument.set(createDocument());
    component.validateChanges();

    component.submitUpdate();

    expect(component.changedRowCount()).toBe(1);
    expect(component.updateDocument()).toEqual(createDocument());
    expect(component.documentErrorMessage()).toBe('Only PDF files are accepted.');
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Validation failed.', 'snackbar-danger');
  });

  it('applies submit row business errors to matching row tooltip state', () => {
    service.submitPostSubmissionUpdate.and.returnValue(
      throwError(() => ({
        success: false,
        message: 'Validation failed.',
        data: {
          rowErrors: [
            {
              rowId: 'row-1',
              rowNumber: 1,
              censusCode: '100001',
              ulbName: 'Test ULB',
              errors: [
                {
                  field: 'dateOfConstitution',
                  code: 'required',
                  message: 'Date of Constitution is required for Constituted status.',
                },
              ],
            },
          ],
        },
      })),
    );
    fixture.detectChanges();
    makeChangedRow();
    component.updateDocument.set(createDocument());
    component.validateChanges();

    component.submitUpdate();

    const vm = component.rowViewModels()[0];
    expect(vm.row.validationStatus).toBe('INVALID');
    expect(vm.cellHasError['dateOfConstitution']).toBeTrue();
    expect(vm.cellErrorText['dateOfConstitution']).toBe('Date of Constitution is required for Constituted status.');
    expect(component.changedRowCount()).toBe(1);
    expect(component.updateDocument()).toEqual(createDocument());
  });

  it('does not start a second submit while the first submit is in progress', () => {
    const firstSubmit$ = new Subject<EulbPostSubmissionUpdateSubmitResponse>();
    service.submitPostSubmissionUpdate.and.returnValue(firstSubmit$);
    fixture.detectChanges();
    makeChangedRow();
    component.updateDocument.set(createDocument());
    component.validateChanges();

    component.submitUpdate();
    component.submitUpdate();

    expect(service.submitPostSubmissionUpdate).toHaveBeenCalledTimes(1);

    firstSubmit$.next(createSubmitResponse());
    firstSubmit$.complete();

    expect(component.changedRowCount()).toBe(0);
    expect(component.updateDocument()).toBeNull();
    expect(component.documentErrorMessage()).toBeNull();
  });

  it('reloads rows immediately when the elected body status filter changes', () => {
    fixture.detectChanges();
    service.getPostSubmissionUpdateRows.calls.reset();

    component.filterForm.controls.electedBodyStatus.setValue('Constituted');

    expect(service.getPostSubmissionUpdateRows).toHaveBeenCalledWith(
      stateId,
      yearId,
      jasmine.objectContaining({ electedBodyStatus: 'Constituted', page: 1 }),
    );
  });

  it('shows a danger snackbar when the metadata endpoint fails', () => {
    service.getPostSubmissionUpdateMetadata.and.returnValue(throwError(() => new Error('Server error')));
    fixture.detectChanges();

    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Failed to load post-submission update data.',
      'snackbar-danger',
    );
    expect(component.metadataErrorMessage()).toBe('Failed to load post-submission update data.');
    expect(component.isLoadingMeta()).toBeFalse();
    expect(service.getPostSubmissionUpdateRows).not.toHaveBeenCalled();
  });

  describe('statusSummary', () => {
    it('stores statusSummary from rows API response in the signal', () => {
      const summary = createStatusSummary({ constitutedCount: 7, totalUlbCount: 10 });
      service.getPostSubmissionUpdateRows.and.returnValue(of(createRowsData({ statusSummary: summary })));
      fixture.detectChanges();

      expect(component.statusSummary()).toEqual(summary);
    });

    it('sets statusSummary to null when rows API response omits statusSummary', () => {
      service.getPostSubmissionUpdateRows.and.returnValue(of(createRowsData()));
      fixture.detectChanges();

      expect(component.statusSummary()).toBeNull();
    });

    it('hides summary section when statusSummary is null', () => {
      service.getPostSubmissionUpdateRows.and.returnValue(of(createRowsData()));
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="status-summary-section"]'))).toBeNull();
    });

    it('renders summary section when statusSummary is present', () => {
      service.getPostSubmissionUpdateRows.and.returnValue(of(createRowsData({ statusSummary: createStatusSummary() })));
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="status-summary-section"]'))).not.toBeNull();
    });

    it('renders summary message with constitutedCount and totalUlbCount', () => {
      service.getPostSubmissionUpdateRows.and.returnValue(
        of(createRowsData({ statusSummary: createStatusSummary({ constitutedCount: 7, totalUlbCount: 10 }) })),
      );
      fixture.detectChanges();

      const msg = fixture.debugElement.query(By.css('[data-testid="status-summary-message"]'));
      expect(msg).not.toBeNull();
      expect(msg.nativeElement.textContent).toContain('7');
      expect(msg.nativeElement.textContent).toContain('10');
    });

    it('renders three summary cards via the computed array', () => {
      service.getPostSubmissionUpdateRows.and.returnValue(of(createRowsData({ statusSummary: createStatusSummary() })));
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('[data-testid="status-summary-card"]'));
      expect(cards).toHaveSize(3);
    });

    it('constituted card shows count and border-success class', () => {
      service.getPostSubmissionUpdateRows.and.returnValue(
        of(createRowsData({ statusSummary: createStatusSummary({ constitutedCount: 7 }) })),
      );
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('[data-testid="status-summary-card"]'));
      const constitutedCard = cards[0];
      expect(constitutedCard.nativeElement.classList).toContain('border-success');
      expect(constitutedCard.nativeElement.textContent).toContain('7');
    });

    it('not-constituted card shows count and border-danger class', () => {
      service.getPostSubmissionUpdateRows.and.returnValue(
        of(createRowsData({ statusSummary: createStatusSummary({ notConstitutedCount: 2 }) })),
      );
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('[data-testid="status-summary-card"]'));
      const notConstitutedCard = cards[1];
      expect(notConstitutedCard.nativeElement.classList).toContain('border-danger');
      expect(notConstitutedCard.nativeElement.textContent).toContain('2');
    });

    it('exempt card shows count and border-secondary class', () => {
      service.getPostSubmissionUpdateRows.and.returnValue(
        of(createRowsData({ statusSummary: createStatusSummary({ exemptCount: 1 }) })),
      );
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('[data-testid="status-summary-card"]'));
      const exemptCard = cards[2];
      expect(exemptCard.nativeElement.classList).toContain('border-secondary');
      expect(exemptCard.nativeElement.textContent).toContain('1');
    });
  });

  it('ignores stale rows responses when a newer request completes first', () => {
    const firstRows$ = new Subject<EulbPostSubmissionUpdateRowsData>();
    const secondRows$ = new Subject<EulbPostSubmissionUpdateRowsData>();

    service.getPostSubmissionUpdateRows.and.returnValues(firstRows$, secondRows$);
    fixture.detectChanges();

    component.filterForm.controls.electedBodyStatus.setValue('Constituted');

    secondRows$.next(createRowsData({ rows: [createRow({ _id: 'row-2', ulbName: 'Newer ULB' })], total: 21 }));
    secondRows$.complete();
    firstRows$.next(createRowsData({ rows: [createRow({ _id: 'row-1', ulbName: 'Stale ULB' })], total: 1 }));
    firstRows$.complete();

    expect(component.rows()[0].ulbName).toBe('Newer ULB');
    expect(component.total()).toBe(21);
    expect(component.isLoadingRows()).toBeFalse();
  });

  function getTooltipSources(cell: DebugElement): MatTooltip[] {
    const sources = new Set<MatTooltip>([cell.injector.get(MatTooltip)]);
    for (const tooltipElement of cell.queryAll(By.directive(MatTooltip))) {
      sources.add(tooltipElement.injector.get(MatTooltip));
    }
    return [...sources];
  }
});
