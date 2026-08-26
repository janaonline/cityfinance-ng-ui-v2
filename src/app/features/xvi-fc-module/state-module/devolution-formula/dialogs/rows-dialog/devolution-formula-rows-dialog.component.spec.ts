import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityService } from '../../../../../../core/services/utility.service';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import { DevolutionFormulaService } from '../../devolution-formula.service';
import {
  DevolutionRow,
  DevolutionRowsDialogData,
  DevolutionRowsResponseData,
  DevolutionValidationSummary,
  UpdateDevolutionRowPayload,
  XviFcApiResponse,
} from '../../devolution-formula.models';
import { DevolutionFormulaRowsDialogComponent } from './devolution-formula-rows-dialog.component';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockValidationSummary: DevolutionValidationSummary = {
  validationStatus: 'VALID',
  excelRowCount: 5,
  validRowCount: 4,
  errorRowCount: 1,
  missingUlbCount: 0,
  totalMoHUAAllocation: 50000000,
  totalAllocatedSum: 50000000,
  allUlbsCovered: true,
  allocationBalanced: true,
  activeDatasetVersion: 1,
};

const updatedValidationSummary: DevolutionValidationSummary = {
  ...mockValidationSummary,
  validRowCount: 5,
  errorRowCount: 0,
};

function makeRow(overrides: Partial<DevolutionRow> = {}): DevolutionRow {
  return {
    _id: 'row-1',
    rowNumber: 1,
    ulbId: 'ulb-1',
    censusCode: 'C001',
    ulbName: 'Test ULB',
    totalGrantAllocation: 10000000,
    installment1Amount: 5000000,
    installment2Amount: 5000000,
    devolutionFormula: 'Population × 0.5',
    validationStatus: 'VALID',
    errors: [],
    datasetVersion: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeRowsResponse(rows: DevolutionRow[], total = rows.length): XviFcApiResponse<DevolutionRowsResponseData> {
  return {
    success: true,
    data: {
      rows,
      total,
      page: 1,
      limit: 20,
      totalPages: Math.max(1, Math.ceil(total / 20)),
      validationSummary: mockValidationSummary,
    },
    timestamp: '',
  };
}

function makeUpdateRowResponse(
  updatedRow: DevolutionRow,
  summary = updatedValidationSummary,
): XviFcApiResponse<{ row: DevolutionRow; validationSummary: DevolutionValidationSummary }> {
  return {
    success: true,
    data: { row: updatedRow, validationSummary: summary },
    timestamp: '',
  };
}

const mockRowEditFields: ConditionalFieldConfig[] = [
  {
    key: 'totalGrantAllocation',
    formFieldType: 'number',
    label: 'Total Grant Allocation',
    validations: [
      { name: 'required', validator: null, message: 'Total Grant Allocation is required.' },
      { name: 'min', validator: 0, message: 'Total Grant Allocation cannot be negative.' },
    ],
  },
  {
    key: 'installment1Amount',
    formFieldType: 'number',
    label: 'Installment 1 Amount',
    validations: [
      { name: 'required', validator: null, message: 'Installment 1 Amount is required.' },
      { name: 'min', validator: 0, message: 'Installment 1 Amount cannot be negative.' },
    ],
  },
  {
    key: 'installment2Amount',
    formFieldType: 'number',
    label: 'Installment 2 Amount',
    validations: [
      { name: 'required', validator: null, message: 'Installment 2 Amount is required.' },
      { name: 'min', validator: 0, message: 'Installment 2 Amount cannot be negative.' },
    ],
  },
  {
    key: 'devolutionFormula',
    formFieldType: 'text',
    label: 'Allocation Formula',
    validations: [
      { name: 'required', validator: null, message: 'Allocation Formula is required.' },
      { name: 'maxLength', validator: 250, message: 'Allocation Formula cannot exceed 250 characters.' },
    ],
  },
];

const dialogData: DevolutionRowsDialogData = {
  stateId: 'state-1',
  yearId: 'year-1',
  installment: 1,
  canEdit: true,
  rowEditFields: mockRowEditFields,
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('DevolutionFormulaRowsDialogComponent', () => {
  let component: DevolutionFormulaRowsDialogComponent;
  let fixture: ComponentFixture<DevolutionFormulaRowsDialogComponent>;
  let dfService: jasmine.SpyObj<DevolutionFormulaService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DevolutionFormulaRowsDialogComponent>>;

  beforeEach(async () => {
    dfService = jasmine.createSpyObj<DevolutionFormulaService>('DevolutionFormulaService', ['getRows', 'updateRow']);
    dfService.getRows.and.returnValue(new Subject<XviFcApiResponse<DevolutionRowsResponseData>>().asObservable());
    dfService.updateRow.and.returnValue(
      new Subject<
        XviFcApiResponse<{ row: DevolutionRow; validationSummary: DevolutionValidationSummary }>
      >().asObservable(),
    );

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);

    dialogRef = jasmine.createSpyObj<MatDialogRef<DevolutionFormulaRowsDialogComponent>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: DevolutionFormulaService, useValue: dfService },
        { provide: UtilityService, useValue: utilityService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
      imports: [HttpClientTestingModule, NoopAnimationsModule, DevolutionFormulaRowsDialogComponent],
    }).compileComponents();
  });

  function createComponent(rows: DevolutionRow[] = [], total = rows.length): void {
    const response$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
    dfService.getRows.and.returnValue(response$.asObservable());

    fixture = TestBed.createComponent(DevolutionFormulaRowsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    response$.next(makeRowsResponse(rows, total));
    response$.complete();
    fixture.detectChanges();
  }

  // ─── init ──────────────────────────────────────────────────────────────────

  describe('init', () => {
    it('calls getRows on init with page 1 and default limit', () => {
      createComponent();
      expect(dfService.getRows).toHaveBeenCalledWith(
        'state-1',
        'year-1',
        1,
        jasmine.objectContaining({ page: 1, limit: 20 }),
      );
    });

    it('sets rows signal from API response', () => {
      const row = makeRow();
      createComponent([row]);
      expect(component.rows()).toEqual([row]);
    });

    it('sets total signal from API response', () => {
      createComponent([makeRow()], 42);
      expect(component.total()).toBe(42);
    });

    it('clears isLoading after successful response', () => {
      createComponent([makeRow()]);
      expect(component.isLoading()).toBeFalse();
    });

    it('shows snackbar and clears isLoading on error', () => {
      const error$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      dfService.getRows.and.returnValue(
        new (class {
          pipe = () => this;
          subscribe(opts: { error: () => void }) {
            opts.error();
            return { unsubscribe: () => {} };
          }
        })() as unknown as ReturnType<typeof dfService.getRows>,
      );

      fixture = TestBed.createComponent(DevolutionFormulaRowsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      void error$;
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Failed to load uploaded rows.', 'snackbar-danger');
      expect(component.isLoading()).toBeFalse();
    });
  });

  // ─── initialValidationStatusFilter ─────────────────────────────────────────

  describe('initialValidationStatusFilter', () => {
    it('pre-sets the validationStatus filter and includes it on the first getRows call', () => {
      TestBed.overrideProvider(MAT_DIALOG_DATA, {
        useValue: { ...dialogData, initialValidationStatusFilter: 'INVALID' },
      });

      createComponent();

      expect(component.filterForm.get('validationStatus')!.value).toBe('INVALID');
      expect(dfService.getRows).toHaveBeenCalledWith(
        'state-1',
        'year-1',
        1,
        jasmine.objectContaining({ validationStatus: 'INVALID' }),
      );
    });

    it('defaults to the "All" filter when no initialValidationStatusFilter is provided', () => {
      createComponent();

      expect(component.filterForm.get('validationStatus')!.value).toBe('');
      expect(dfService.getRows).toHaveBeenCalledWith(
        'state-1',
        'year-1',
        1,
        jasmine.objectContaining({ validationStatus: undefined }),
      );
    });
  });

  // ─── query parameters ──────────────────────────────────────────────────────

  describe('query parameters', () => {
    it('sends search term when filter has a search value', fakeAsync(() => {
      createComponent();
      dfService.getRows.calls.reset();
      const response$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      dfService.getRows.and.returnValue(response$.asObservable());

      component.filterForm.get('search')!.setValue('Test');
      tick(400);
      fixture.detectChanges();

      expect(dfService.getRows).toHaveBeenCalledWith(
        'state-1',
        'year-1',
        1,
        jasmine.objectContaining({ search: 'Test' }),
      );
    }));

    it('omits search when filter is empty string', fakeAsync(() => {
      createComponent();
      dfService.getRows.calls.reset();
      const response$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      dfService.getRows.and.returnValue(response$.asObservable());

      component.filterForm.get('search')!.setValue('');
      tick(400);
      fixture.detectChanges();

      const call = dfService.getRows.calls.mostRecent();
      expect(call.args[3]).toEqual(jasmine.objectContaining({ search: undefined }));
    }));

    it('sends validationStatus when VALID is selected', fakeAsync(() => {
      createComponent();
      dfService.getRows.calls.reset();
      const response$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      dfService.getRows.and.returnValue(response$.asObservable());

      component.filterForm.get('validationStatus')!.setValue('VALID');
      tick(0);
      fixture.detectChanges();

      expect(dfService.getRows).toHaveBeenCalledWith(
        'state-1',
        'year-1',
        1,
        jasmine.objectContaining({ validationStatus: 'VALID' }),
      );
    }));

    it('omits validationStatus when filter is empty string', fakeAsync(() => {
      createComponent();
      dfService.getRows.calls.reset();
      const response$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      dfService.getRows.and.returnValue(response$.asObservable());

      component.filterForm.get('validationStatus')!.setValue('');
      tick(0);
      fixture.detectChanges();

      const call = dfService.getRows.calls.mostRecent();
      expect(call.args[3]).toEqual(jasmine.objectContaining({ validationStatus: undefined }));
    }));
  });

  // ─── search debounce ───────────────────────────────────────────────────────

  describe('search debounce', () => {
    it('does not reload before 400 ms when search changes', fakeAsync(() => {
      createComponent();
      dfService.getRows.calls.reset();
      component.filterForm.get('search')!.setValue('partial');
      tick(200);
      expect(dfService.getRows).not.toHaveBeenCalled();
    }));

    it('reloads after 400 ms and resets page to 1', fakeAsync(() => {
      createComponent([makeRow(), makeRow({ _id: 'row-2', rowNumber: 2 })], 40);
      component.page.set(2);

      dfService.getRows.calls.reset();
      const response$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      dfService.getRows.and.returnValue(response$.asObservable());

      component.filterForm.get('search')!.setValue('ULB');
      tick(400);
      fixture.detectChanges();

      expect(component.page()).toBe(1);
      expect(dfService.getRows).toHaveBeenCalledWith(
        'state-1',
        'year-1',
        1,
        jasmine.objectContaining({ page: 1, search: 'ULB' }),
      );
    }));

    it('suppresses duplicate consecutive values (distinctUntilChanged)', fakeAsync(() => {
      createComponent();
      dfService.getRows.calls.reset();
      const response$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      dfService.getRows.and.returnValue(response$.asObservable());

      component.filterForm.get('search')!.setValue('same');
      tick(400);
      dfService.getRows.calls.reset();

      component.filterForm.get('search')!.setValue('same');
      tick(400);
      expect(dfService.getRows).not.toHaveBeenCalled();
    }));
  });

  // ─── validationStatus filter ───────────────────────────────────────────────

  describe('validationStatus filter', () => {
    it('reloads immediately (no debounce) when validationStatus changes', fakeAsync(() => {
      createComponent();
      dfService.getRows.calls.reset();
      const response$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      dfService.getRows.and.returnValue(response$.asObservable());

      component.filterForm.get('validationStatus')!.setValue('INVALID');
      tick(0);

      expect(dfService.getRows).toHaveBeenCalledOnceWith(
        'state-1',
        'year-1',
        1,
        jasmine.objectContaining({ validationStatus: 'INVALID' }),
      );
    }));

    it('resets page to 1 when validationStatus changes', fakeAsync(() => {
      createComponent([makeRow()], 40);
      component.page.set(2);

      dfService.getRows.calls.reset();
      dfService.getRows.and.returnValue(new Subject<XviFcApiResponse<DevolutionRowsResponseData>>().asObservable());

      component.filterForm.get('validationStatus')!.setValue('VALID');
      tick(0);

      expect(component.page()).toBe(1);
    }));
  });

  // ─── request race protection ───────────────────────────────────────────────

  describe('request race protection', () => {
    it('ignores a stale response that arrives after a newer request', fakeAsync(() => {
      const firstResponse$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();
      const secondResponse$ = new Subject<XviFcApiResponse<DevolutionRowsResponseData>>();

      dfService.getRows.and.returnValues(firstResponse$.asObservable(), secondResponse$.asObservable());

      fixture = TestBed.createComponent(DevolutionFormulaRowsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // Trigger a second load before first completes
      component.loadRows();
      fixture.detectChanges();

      // Stale first response arrives
      firstResponse$.next(makeRowsResponse([makeRow({ _id: 'stale', ulbName: 'Stale ULB' })]));
      firstResponse$.complete();
      fixture.detectChanges();

      // Rows should not be updated from stale response
      expect(component.rows().find((r) => r.ulbName === 'Stale ULB')).toBeUndefined();

      // Fresh second response arrives
      secondResponse$.next(makeRowsResponse([makeRow({ _id: 'fresh', ulbName: 'Fresh ULB' })]));
      secondResponse$.complete();
      fixture.detectChanges();

      expect(component.rows()[0].ulbName).toBe('Fresh ULB');
    }));
  });

  // ─── pagination ────────────────────────────────────────────────────────────

  describe('pagination', () => {
    it('computes totalPages correctly', () => {
      createComponent([], 45);
      expect(component.totalPages()).toBe(3);
    });

    it('hasPrev is false on page 1', () => {
      createComponent();
      expect(component.hasPrev()).toBeFalse();
    });

    it('hasNext is true when more pages exist', () => {
      createComponent([], 25);
      expect(component.hasNext()).toBeTrue();
    });

    it('goToPage reloads rows at the target page', () => {
      createComponent([], 25);
      dfService.getRows.calls.reset();
      dfService.getRows.and.returnValue(new Subject<XviFcApiResponse<DevolutionRowsResponseData>>().asObservable());

      component.goToPage(2);
      expect(component.page()).toBe(2);
      expect(dfService.getRows).toHaveBeenCalledWith('state-1', 'year-1', 1, jasmine.objectContaining({ page: 2 }));
    });

    it('goToPage is a no-op when page is out of range', () => {
      createComponent();
      dfService.getRows.calls.reset();
      component.goToPage(0);
      component.goToPage(99);
      expect(dfService.getRows).not.toHaveBeenCalled();
    });
  });

  // ─── DOM rendering ─────────────────────────────────────────────────────────

  describe('DOM rendering', () => {
    it('shows loading spinner while isLoading is true', () => {
      // Set up a subject that never emits so isLoading stays true
      dfService.getRows.and.returnValue(new Subject<XviFcApiResponse<DevolutionRowsResponseData>>().asObservable());
      fixture = TestBed.createComponent(DevolutionFormulaRowsDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const loading = fixture.debugElement.query(By.css('[data-cy="df-rows-loading"]'));
      expect(loading).toBeTruthy();
    });

    it('shows empty state when rows is empty', () => {
      createComponent([]);
      const empty = fixture.debugElement.query(By.css('[data-cy="df-rows-empty"]'));
      expect(empty).toBeTruthy();
      expect(empty.nativeElement.textContent).toContain('No rows found');
    });

    it('shows table when rows are present', () => {
      createComponent([makeRow()]);
      const table = fixture.debugElement.query(By.css('[data-cy="df-rows-table"]'));
      expect(table).toBeTruthy();
    });

    it('renders one tr per row in tbody', () => {
      createComponent([makeRow(), makeRow({ _id: 'row-2', rowNumber: 2, ulbName: 'ULB 2' })]);
      const rows = fixture.debugElement.queryAll(By.css('[data-cy="df-rows-row"]'));
      expect(rows.length).toBe(2);
    });

    it('renders censusCode in the row', () => {
      createComponent([makeRow({ censusCode: 'C999' })]);
      const body = fixture.debugElement.query(By.css('[data-cy="df-rows-body"]'));
      expect(body.nativeElement.textContent).toContain('C999');
    });

    it('renders ulbName in the row', () => {
      createComponent([makeRow({ ulbName: 'My Test ULB' })]);
      const body = fixture.debugElement.query(By.css('[data-cy="df-rows-body"]'));
      expect(body.nativeElement.textContent).toContain('My Test ULB');
    });

    it('renders devolutionFormula in the row', () => {
      createComponent([makeRow({ devolutionFormula: 'Pop × 0.75' })]);
      const body = fixture.debugElement.query(By.css('[data-cy="df-rows-body"]'));
      expect(body.nativeElement.textContent).toContain('Pop × 0.75');
    });

    it('shows pagination info when total > 0', () => {
      createComponent([makeRow()], 5);
      const info = fixture.debugElement.query(By.css('[data-cy="df-rows-info"]'));
      expect(info).toBeTruthy();
      expect(info.nativeElement.textContent).toContain('5');
    });

    it('hides pagination when total is 0', () => {
      createComponent([]);
      const pagination = fixture.debugElement.query(By.css('[data-cy="df-rows-pagination"]'));
      expect(pagination).toBeNull();
    });
  });

  // ─── validation badge ──────────────────────────────────────────────────────

  describe('validation badge', () => {
    it('renders a VALID badge for a valid row', () => {
      createComponent([makeRow({ validationStatus: 'VALID' })]);
      const badge = fixture.debugElement.query(By.css('[data-cy="df-row-validation-badge"]'));
      expect(badge).toBeTruthy();
      expect(badge.nativeElement.textContent.trim()).toBe('Valid');
    });

    it('renders an INVALID badge for an invalid row', () => {
      createComponent([makeRow({ validationStatus: 'INVALID' })]);
      const badge = fixture.debugElement.query(By.css('[data-cy="df-row-validation-badge"]'));
      expect(badge.nativeElement.textContent.trim()).toBe('Invalid');
      expect(badge.nativeElement.classList).toContain('text-bg-danger');
    });

    it('renders a success badge for a valid row', () => {
      createComponent([makeRow({ validationStatus: 'VALID' })]);
      const badge = fixture.debugElement.query(By.css('[data-cy="df-row-validation-badge"]'));
      expect(badge.nativeElement.classList).toContain('text-bg-success');
    });
  });

  // ─── error cell indicator ──────────────────────────────────────────────────

  describe('error cell indicator', () => {
    it('shows error icon in censusCode cell when row has a censusCode error', () => {
      const row = makeRow({
        validationStatus: 'INVALID',
        errors: [{ field: 'censusCode', code: 'INVALID_CODE', message: 'Invalid census code' }],
      });
      createComponent([row]);
      const icons = fixture.debugElement.queryAll(By.css('.df-error-icon'));
      expect(icons.length).toBeGreaterThan(0);
    });

    it('applies df-cell-invalid class to cell with error', () => {
      const row = makeRow({
        validationStatus: 'INVALID',
        errors: [{ field: 'totalGrantAllocation', code: 'NEG', message: 'Must be positive' }],
      });
      createComponent([row]);
      const invalidCells = fixture.debugElement.queryAll(By.css('.df-cell-invalid'));
      expect(invalidCells.length).toBeGreaterThan(0);
    });

    it('does not show error icon when row has no errors', () => {
      createComponent([makeRow({ validationStatus: 'VALID', errors: [] })]);
      const icons = fixture.debugElement.queryAll(By.css('.df-error-icon'));
      expect(icons.length).toBe(0);
    });

    it('applies df-cell-invalid and a tooltip to the ulbName cell when identityModified is reported', () => {
      const row = makeRow({
        validationStatus: 'INVALID',
        errors: [{ field: 'ulbName', code: 'identityModified', message: 'ULB name has changed since last upload.' }],
      });
      createComponent([row]);

      const ulbNameCell = fixture.debugElement.queryAll(By.css('td.fw-medium'))[0];
      expect(ulbNameCell.classes['df-cell-invalid']).toBeTrue();

      const tooltip = ulbNameCell.injector.get(MatTooltip);
      expect(tooltip.disabled).toBeFalse();
      expect(tooltip.message).toBe('ULB name has changed since last upload.');
    });
  });

  // ─── startEditAtField — click-to-edit ─────────────────────────────────────

  describe('startEditAtField — click-to-edit', () => {
    it('clicking an editable invalid cell enters edit mode', fakeAsync(() => {
      const row = makeRow({
        validationStatus: 'INVALID',
        errors: [{ field: 'totalGrantAllocation', code: 'INVALID', message: 'Bad value' }],
      });
      createComponent([row]);
      fixture.detectChanges();

      // column order: #(0), census(1), ulb(2), installment1(3), installment2(4), totalGrantAllocation(5)
      const tds = fixture.nativeElement.querySelectorAll('[data-cy="df-rows-row"] td');
      (tds[5] as HTMLElement).click();
      tick(50);
      fixture.detectChanges();

      expect(component.editingRowId()).toBe('row-1');
    }));

    it('error icon in a row cell uses bi-exclamation-triangle-fill', () => {
      const row = makeRow({
        validationStatus: 'INVALID',
        errors: [{ field: 'totalGrantAllocation', code: 'INVALID', message: 'Bad value' }],
      });
      createComponent([row]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.df-error-icon');
      expect(icon.classList).toContain('bi-exclamation-triangle-fill');
      expect(icon.classList).not.toContain('bi-exclamation-circle-fill');
    });

    it('applies cursor-pointer to an editable invalid cell when canEdit is true', () => {
      const row = makeRow({
        validationStatus: 'INVALID',
        errors: [{ field: 'totalGrantAllocation', code: 'INVALID', message: 'Bad value' }],
      });
      createComponent([row]);
      fixture.detectChanges();

      // column order: #(0), census(1), ulb(2), installment1(3), installment2(4), totalGrantAllocation(5)
      const tds = fixture.nativeElement.querySelectorAll('[data-cy="df-rows-row"] td');
      expect((tds[5] as HTMLElement).classList).toContain('cursor-pointer');
    });

    it('clicking a non-editable cell (censusCode) does not enter edit mode', fakeAsync(() => {
      const row = makeRow({
        validationStatus: 'INVALID',
        errors: [{ field: 'censusCode', code: 'INVALID', message: 'Bad census' }],
      });
      createComponent([row]);
      fixture.detectChanges();

      const tds = fixture.nativeElement.querySelectorAll('[data-cy="df-rows-row"] td');
      (tds[1] as HTMLElement).click(); // censusCode column
      tick(50);
      fixture.detectChanges();

      expect(component.editingRowId()).toBeNull();
    }));

    it('clicking an editable invalid cell when already editing another row does not change editingRowId', fakeAsync(() => {
      const row1 = makeRow({ _id: 'row-1' });
      const row2 = makeRow({
        _id: 'row-2',
        rowNumber: 2,
        validationStatus: 'INVALID',
        errors: [{ field: 'totalGrantAllocation', code: 'INVALID', message: 'Bad value' }],
      });
      createComponent([row1, row2]);
      component.startEdit(row1);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('[data-cy="df-rows-row"]');
      const row2Tds = rows[1].querySelectorAll('td');
      (row2Tds[3] as HTMLElement).click();
      tick(50);
      fixture.detectChanges();

      expect(component.editingRowId()).toBe('row-1');
    }));
  });

  // ─── edit button visibility ────────────────────────────────────────────────

  describe('edit button visibility', () => {
    it('shows Edit button for each row when canEdit is true', () => {
      createComponent([makeRow()]);
      const editButtons = fixture.debugElement.queryAll(By.css('[data-cy="df-edit-row"]'));
      expect(editButtons.length).toBe(1);
    });

    it('shows no Edit button when canEdit is false', () => {
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { ...dialogData, canEdit: false } });
      createComponent([makeRow()]);
      const editButtons = fixture.debugElement.queryAll(By.css('[data-cy="df-edit-row"]'));
      expect(editButtons.length).toBe(0);
    });

    it('disables Edit buttons for other rows while one row is being edited', () => {
      createComponent([makeRow({ _id: 'row-1', rowNumber: 1 }), makeRow({ _id: 'row-2', rowNumber: 2 })]);
      component.startEdit(component.rows()[0]);
      fixture.detectChanges();

      // row-2 is in read mode; its edit button should be disabled
      const editBtn = fixture.debugElement
        .queryAll(By.css('[data-cy="df-edit-row"]'))
        .find((el) => !el.nativeElement.disabled);
      expect(editBtn).toBeUndefined();
    });
  });

  // ─── edit mode — form creation ─────────────────────────────────────────────

  describe('edit mode — form creation', () => {
    it('startEdit sets editingRowId to the row id', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      expect(component.editingRowId()).toBe('row-1');
    });

    it('clicking edit creates controls for exactly the four editable fields', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      const keys = Object.keys(component.editForm.controls).sort();
      expect(keys).toEqual(['devolutionFormula', 'installment1Amount', 'installment2Amount', 'totalGrantAllocation']);
    });

    it('censusCode is not a form control when editing', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      expect(component.editForm.get('censusCode')).toBeNull();
    });

    it('ulbName is not a form control when editing', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      expect(component.editForm.get('ulbName')).toBeNull();
    });

    it('pre-fills editable controls with the row current values', () => {
      const row = makeRow({ totalGrantAllocation: 9999, devolutionFormula: 'X * 2' });
      createComponent([row]);
      component.startEdit(row);
      expect(component.editForm.get('totalGrantAllocation')?.value).toBe(9999);
      expect(component.editForm.get('devolutionFormula')?.value).toBe('X * 2');
    });

    it('shows edit-mode inputs after startEdit', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      fixture.detectChanges();

      const inputs = fixture.debugElement.queryAll(By.css('[data-df-edit-field]'));
      expect(inputs.length).toBe(4);
    });

    it('startEdit is a no-op when canEdit is false', () => {
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { ...dialogData, canEdit: false } });
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      expect(component.editingRowId()).toBeNull();
    });
  });

  // ─── rowEditFields — dynamic validation ────────────────────────────────────

  describe('rowEditFields — dynamic validation', () => {
    it('builds edit form controls from backend rowEditFields', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      expect(component.editForm.contains('totalGrantAllocation')).toBeTrue();
      expect(component.editForm.contains('installment1Amount')).toBeTrue();
      expect(component.editForm.contains('installment2Amount')).toBeTrue();
      expect(component.editForm.contains('devolutionFormula')).toBeTrue();
    });

    it('uses backend required validator on devolutionFormula', () => {
      const row = makeRow({ devolutionFormula: '' });
      createComponent([row]);
      component.startEdit(row);
      const ctrl = component.getEditFormControl('devolutionFormula');
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('uses backend min validator on amount field', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      const ctrl = component.getEditFormControl('totalGrantAllocation');
      ctrl?.setValue(-1);
      expect(ctrl?.hasError('min')).toBeTrue();
    });

    it('uses backend maxLength validator on devolutionFormula (normalized to maxlength)', () => {
      const longFormula = 'x'.repeat(251);
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      const ctrl = component.getEditFormControl('devolutionFormula');
      ctrl?.setValue(longFormula);
      expect(ctrl?.hasError('maxlength')).toBeTrue();
    });

    it('getEditFieldErrors returns backend message for required error', () => {
      const row = makeRow({ devolutionFormula: '' });
      createComponent([row]);
      component.startEdit(row);
      const ctrl = component.getEditFormControl('devolutionFormula');
      ctrl?.markAsTouched();
      const errors = component.getEditFieldErrors('devolutionFormula');
      expect(errors).toContain('Allocation Formula is required.');
    });

    it('getEditFieldErrors returns backend message for maxLength (case-insensitive name match)', () => {
      const longFormula = 'x'.repeat(251);
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      const ctrl = component.getEditFormControl('devolutionFormula');
      ctrl?.setValue(longFormula);
      ctrl?.markAsTouched();
      const errors = component.getEditFieldErrors('devolutionFormula');
      expect(errors).toContain('Allocation Formula cannot exceed 250 characters.');
    });

    it('blocks save when dynamic form has a required error', () => {
      const row = makeRow({ devolutionFormula: '' });
      createComponent([row]);
      component.startEdit(row);
      component.saveRow(row._id);
      expect(dfService.updateRow).not.toHaveBeenCalled();
    });

    it('preserves PATCH payload keys and values when the dynamic form is valid', () => {
      const row = makeRow({
        totalGrantAllocation: 1000,
        installment1Amount: 400,
        installment2Amount: 600,
        devolutionFormula: 'Formula A',
      });
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(of(makeUpdateRowResponse(row)));

      component.saveRow(row._id);

      expect(dfService.updateRow).toHaveBeenCalledWith(
        'state-1',
        'year-1',
        1,
        row._id,
        jasmine.objectContaining({
          totalGrantAllocation: 1000,
          installment1Amount: 400,
          installment2Amount: 600,
          devolutionFormula: 'Formula A',
        }),
      );
    });
  });

  // ─── cancel edit ───────────────────────────────────────────────────────────

  describe('cancelEdit()', () => {
    it('clears editingRowId', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      component.cancelEdit();
      expect(component.editingRowId()).toBeNull();
    });

    it('resets editForm to empty group', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      component.cancelEdit();
      expect(Object.keys(component.editForm.controls).length).toBe(0);
    });

    it('does not call updateRow', () => {
      createComponent([makeRow()]);
      component.startEdit(component.rows()[0]);
      component.cancelEdit();
      expect(dfService.updateRow).not.toHaveBeenCalled();
    });
  });

  // ─── save row — success ────────────────────────────────────────────────────

  describe('saveRow() — success', () => {
    it('calls service.updateRow with stateId, yearId, installment, and rowId', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(of(makeUpdateRowResponse(row)));

      component.saveRow('row-1');

      expect(dfService.updateRow).toHaveBeenCalledWith(
        'state-1',
        'year-1',
        1,
        'row-1',
        jasmine.any(Object) as UpdateDevolutionRowPayload,
      );
    });

    it('payload contains only the four editable fields', () => {
      const row = makeRow({ totalGrantAllocation: 8000, devolutionFormula: 'Pop * 2' });
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(of(makeUpdateRowResponse(row)));

      component.saveRow('row-1');

      const payload = dfService.updateRow.calls.mostRecent().args[4] as UpdateDevolutionRowPayload;
      expect(Object.keys(payload).sort()).toEqual([
        'devolutionFormula',
        'installment1Amount',
        'installment2Amount',
        'totalGrantAllocation',
      ]);
      expect(payload.totalGrantAllocation).toBe(8000);
      expect(payload.devolutionFormula).toBe('Pop * 2');
    });

    it('replaces the saved row in the rows signal', () => {
      const row = makeRow();
      const updatedRow = makeRow({ devolutionFormula: 'Updated Formula' });
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(of(makeUpdateRowResponse(updatedRow)));

      component.saveRow('row-1');

      expect(component.rows()[0].devolutionFormula).toBe('Updated Formula');
    });

    it('updates latestSummary signal from the response', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(of(makeUpdateRowResponse(row, updatedValidationSummary)));

      component.saveRow('row-1');

      expect(component.latestSummary()).toEqual(updatedValidationSummary);
    });

    it('clears editingRowId after successful save', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(of(makeUpdateRowResponse(row)));

      component.saveRow('row-1');

      expect(component.editingRowId()).toBeNull();
    });

    it('shows success snackbar after save', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(of(makeUpdateRowResponse(row)));

      component.saveRow('row-1');

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Row updated successfully.');
    });
  });

  // ─── save row — invalid form blocks API ────────────────────────────────────

  describe('saveRow() — invalid form', () => {
    it('does not call updateRow when a number field is below minimum', () => {
      const row = makeRow({ totalGrantAllocation: 5000 });
      createComponent([row]);
      component.startEdit(row);

      // Set a negative value to trigger Validators.min(0)
      component.editForm.get('totalGrantAllocation')!.setValue(-1);

      component.saveRow('row-1');
      expect(dfService.updateRow).not.toHaveBeenCalled();
    });

    it('marks all controls as touched when form is invalid', () => {
      const row = makeRow({ totalGrantAllocation: 5000 });
      createComponent([row]);
      component.startEdit(row);
      component.editForm.get('totalGrantAllocation')!.setValue(-1);

      component.saveRow('row-1');

      expect(component.editForm.get('totalGrantAllocation')?.touched).toBeTrue();
    });
  });

  // ─── save row — API error ──────────────────────────────────────────────────

  describe('saveRow() — API error', () => {
    it('applies field-keyed API errors to matching controls', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(
        throwError(() => ({
          error: {
            errors: {
              totalGrantAllocation: [{ message: 'Amount exceeds MoHUA limit.', code: 'EXCEEDS_LIMIT' }],
            },
          },
        })),
      );

      component.saveRow('row-1');

      const ctrl = component.editForm.get('totalGrantAllocation');
      expect(ctrl?.errors?.['apiErrors']).toContain('Amount exceeds MoHUA limit.');
      expect(ctrl?.touched).toBeTrue();
    });

    it('shows danger snackbar with validation error message', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(
        throwError(() => ({
          error: {
            errors: {
              devolutionFormula: [{ message: 'Invalid formula.', code: 'INVALID_FORMULA' }],
            },
          },
        })),
      );

      component.saveRow('row-1');

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'Row has validation errors. Please correct them.',
        'snackbar-danger',
      );
    });

    it('clears API errors from a control when its value changes', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(
        throwError(() => ({
          error: {
            errors: { totalGrantAllocation: [{ message: 'Too high.', code: 'TOO_HIGH' }] },
          },
        })),
      );

      component.saveRow('row-1');
      expect(component.editForm.get('totalGrantAllocation')?.errors?.['apiErrors']).toBeTruthy();

      // Changing the value should clear the apiErrors
      component.editForm.get('totalGrantAllocation')!.setValue(1000);
      expect(component.editForm.get('totalGrantAllocation')?.errors?.['apiErrors']).toBeFalsy();
    });

    it('shows generic snackbar when API returns no field errors', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(throwError(() => ({ status: 500 })));

      component.saveRow('row-1');

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'Failed to update row. Please try again.',
        'snackbar-danger',
      );
    });
  });

  // ─── close() — updatedSummary signal ──────────────────────────────────────

  describe('close()', () => {
    it('closes the dialog with an empty result when no rows were saved', () => {
      createComponent();
      component.close();
      expect(dialogRef.close).toHaveBeenCalledOnceWith({});
    });

    it('closes the dialog with updatedSummary when rows were saved', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(of(makeUpdateRowResponse(row, updatedValidationSummary)));
      component.saveRow('row-1');

      component.close();

      expect(dialogRef.close).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ updatedSummary: updatedValidationSummary }),
      );
    });
  });

  // ─── Phase 8: unmatched field errors and stale error clearing ─────────────

  describe('Phase 8 — unmatched field errors and stale error clearing', () => {
    it('censusCode API error (no form control) does not crash and surfaces snackbar', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(
        throwError(() => ({
          error: {
            errors: {
              censusCode: [
                { field: 'censusCode', message: 'Census code not found in dataset.', code: 'CENSUS_NOT_FOUND' },
              ],
            },
          },
        })),
      );

      expect(() => component.saveRow('row-1')).not.toThrow();

      // Field has no editForm control — message surfaced via snackbar instead
      expect(component.editForm.get('censusCode')).toBeNull();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'Census code not found in dataset.',
        'snackbar-danger',
      );
    });

    it('unknown field API error (no form control) does not crash and surfaces snackbar', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(
        throwError(() => ({
          error: {
            errors: {
              unknownField: [{ field: 'unknownField', message: 'Unknown field error.', code: 'UNKNOWN' }],
            },
          },
        })),
      );

      expect(() => component.saveRow('row-1')).not.toThrow();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Unknown field error.', 'snackbar-danger');
    });

    it('cancelEdit clears stale API errors from the previous edit session', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(
        throwError(() => ({
          error: {
            errors: {
              totalGrantAllocation: [{ message: 'Too high.', code: 'TOO_HIGH' }],
            },
          },
        })),
      );
      component.saveRow('row-1');
      expect(component.editForm.get('totalGrantAllocation')?.errors?.['apiErrors']).toBeTruthy();

      component.cancelEdit();

      // After cancel, editForm is reset — no controls to have stale errors
      expect(Object.keys(component.editForm.controls).length).toBe(0);
    });

    it('startEdit on a different row clears stale API errors from the previous row', () => {
      const row1 = makeRow({ _id: 'row-1', rowNumber: 1 });
      const row2 = makeRow({ _id: 'row-2', rowNumber: 2, totalGrantAllocation: 20000000 });
      createComponent([row1, row2]);

      // Edit row1 and get an API error
      component.startEdit(row1);
      dfService.updateRow.and.returnValue(
        throwError(() => ({
          error: {
            errors: {
              totalGrantAllocation: [{ message: 'Amount too high.', code: 'TOO_HIGH' }],
            },
          },
        })),
      );
      component.saveRow('row-1');
      expect(component.editForm.get('totalGrantAllocation')?.hasError('apiErrors')).toBeTrue();

      // Switch to editing row2 — stale errors from row1 should not appear
      component.startEdit(row2);

      const ctrl = component.editForm.get('totalGrantAllocation');
      expect(ctrl?.hasError('apiErrors')).toBeFalse();
      // Value should be from row2, not row1
      expect(ctrl?.value).toBe(20000000);
    });

    it('mixed error response: known field gets error on control, unknown field surfaces snackbar', () => {
      const row = makeRow();
      createComponent([row]);
      component.startEdit(row);
      dfService.updateRow.and.returnValue(
        throwError(() => ({
          error: {
            errors: {
              totalGrantAllocation: [{ message: 'Value exceeds limit.', code: 'EXCEEDS_LIMIT' }],
              censusCode: [{ field: 'censusCode', message: 'Code not in active dataset.', code: 'NOT_IN_DATASET' }],
            },
          },
        })),
      );

      component.saveRow('row-1');

      // Known control gets error stamped
      expect(component.editForm.get('totalGrantAllocation')?.errors?.['apiErrors']).toContain('Value exceeds limit.');
      // Unknown field is surfaced as a snackbar
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Code not in active dataset.', 'snackbar-danger');
    });
  });
});
