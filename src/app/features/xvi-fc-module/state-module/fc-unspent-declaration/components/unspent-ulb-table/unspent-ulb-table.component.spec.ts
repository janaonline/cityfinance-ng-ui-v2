import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { FcUnspentUlbData, FcUnspentUlbOption } from '../../fc-unspent-declaration.models';
import { UlbPickerDialogComponent } from '../ulb-picker-dialog/ulb-picker-dialog.component';
import {
  createFcUnspentUlbRowGroup,
  FcUnspentUlbRowGroup,
  UnspentUlbTableComponent,
} from './unspent-ulb-table.component';

const ULB_OPTIONS: FcUnspentUlbOption[] = [
  {
    ulbId: '66a000000000000000000001',
    censusCode: '800123',
    sbCode: null,
    ulbName: 'Sample Municipal Corporation',
    allocationAmount: 20,
  },
  {
    ulbId: '66a000000000000000000002',
    censusCode: null,
    sbCode: 'SB-0142',
    ulbName: 'Sample Municipal Council',
    allocationAmount: 8,
  },
  {
    ulbId: '66a000000000000000000003',
    censusCode: '800456',
    sbCode: null,
    ulbName: 'Sample Nagar Panchayat',
    allocationAmount: 12.5,
  },
];

/** Backend-supplied saved-row snapshot for the first two ULB options — mirrors what a real
 *  preview response's `unspentUlbData` carries. */
const SAVED_ROWS: FcUnspentUlbData[] = [
  {
    slNo: 1,
    ulbId: ULB_OPTIONS[0].ulbId,
    censusCode: ULB_OPTIONS[0].censusCode,
    sbCode: ULB_OPTIONS[0].sbCode,
    ulbName: ULB_OPTIONS[0].ulbName,
    allocationAmount: ULB_OPTIONS[0].allocationAmount,
    unspentAmount: 1.5,
    allocationPerc: 7.5,
    eligibility: true,
  },
  {
    slNo: 2,
    ulbId: ULB_OPTIONS[1].ulbId,
    censusCode: ULB_OPTIONS[1].censusCode,
    sbCode: ULB_OPTIONS[1].sbCode,
    ulbName: ULB_OPTIONS[1].ulbName,
    allocationAmount: ULB_OPTIONS[1].allocationAmount,
    unspentAmount: 1.2,
    allocationPerc: 15,
    eligibility: false,
  },
];

interface SetupOptions {
  canEdit?: boolean;
  savedRows?: readonly FcUnspentUlbData[];
  threshold?: number;
}

describe('UnspentUlbTableComponent', () => {
  let component: UnspentUlbTableComponent;
  let fixture: ComponentFixture<UnspentUlbTableComponent>;
  let dynamicService: DynamicFormService;
  let dialog: jasmine.SpyObj<MatDialog>;
  let rows: FormArray<FcUnspentUlbRowGroup>;

  function dialogRefReturning(
    option: FcUnspentUlbOption | undefined,
  ): jasmine.SpyObj<MatDialogRef<UlbPickerDialogComponent, FcUnspentUlbOption | undefined>> {
    const ref = jasmine.createSpyObj<MatDialogRef<UlbPickerDialogComponent, FcUnspentUlbOption | undefined>>(
      'MatDialogRef',
      ['afterClosed'],
    );
    ref.afterClosed.and.returnValue(of(option));
    return ref;
  }

  function setupWithRows(rowGroups: FcUnspentUlbRowGroup[], options: SetupOptions = {}): void {
    rows = new FormArray<FcUnspentUlbRowGroup>(rowGroups);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('savedRows', options.savedRows ?? []);
    fixture.componentRef.setInput('canEdit', options.canEdit ?? true);
    fixture.componentRef.setInput('applicableFcLabel', '14th');
    fixture.componentRef.setInput('threshold', options.threshold ?? 10);
    fixture.componentRef.setInput('stateId', 'state-1');
    fixture.componentRef.setInput('yearId', 'year-1');
    fixture.detectChanges();
  }

  beforeEach(async () => {
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [UnspentUlbTableComponent],
      providers: [{ provide: MatDialog, useValue: dialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(UnspentUlbTableComponent);
    component = fixture.componentInstance;
    dynamicService = TestBed.inject(DynamicFormService);
  });

  it('should create', () => {
    setupWithRows([createFcUnspentUlbRowGroup(dynamicService, true)]);
    expect(component).toBeTruthy();
  });

  it('renders hydrated rows', () => {
    setupWithRows([
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 }),
      createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1.2 }),
    ]);

    const rowEls = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rowEls.length).toBe(2);
  });

  it('shows an empty-state row when there are no rows', () => {
    setupWithRows([]);
    expect(fixture.nativeElement.textContent).toContain('No ULBs added yet.');
  });

  // ─── Snapshot-first display (no picker request required to view a saved row) ───

  it('renders name/codes/allocation from the saved-row snapshot with no picker interaction at all', () => {
    setupWithRows(
      [
        createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 }),
        createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1.2 }),
      ],
      { savedRows: SAVED_ROWS },
    );

    expect(dialog.open).not.toHaveBeenCalled();

    const rowEls = fixture.debugElement.queryAll(By.css('tbody tr'));
    const firstCells = rowEls[0].queryAll(By.css('td'));
    expect(firstCells[1].nativeElement.textContent).toContain(ULB_OPTIONS[0].ulbName);
    expect(firstCells[2].nativeElement.textContent).toContain('800123');
    expect(firstCells[3].nativeElement.textContent).toContain('20');

    const secondCells = rowEls[1].queryAll(By.css('td'));
    expect(secondCells[2].nativeElement.textContent).toContain('SB-0142');
    expect(secondCells[3].nativeElement.textContent).toContain('8');
  });

  it('displays Census Code when present', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 })],
      {
        savedRows: SAVED_ROWS,
      },
    );
    const codeCell = fixture.debugElement.queryAll(By.css('tbody tr td'))[2];
    expect(codeCell.nativeElement.textContent).toContain('800123');
  });

  it('displays SB Code as fallback when Census Code is absent', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1 })],
      {
        savedRows: SAVED_ROWS,
      },
    );
    const codeCell = fixture.debugElement.queryAll(By.css('tbody tr td'))[2];
    expect(codeCell.nativeElement.textContent).toContain('SB-0142');
  });

  // ─── Add ULB via the picker ─────────────────────────────────────────────────

  it('opens the picker with no exclusions when adding the first row, and creates a row from the selection', () => {
    setupWithRows([]);
    dialog.open.and.returnValue(dialogRefReturning(ULB_OPTIONS[0]));

    const addButton = fixture.debugElement.query(By.css('button[aria-label="Add ULB"]'));
    addButton.nativeElement.click();

    expect(dialog.open).toHaveBeenCalledTimes(1);
    const [, config] = dialog.open.calls.mostRecent().args as [
      unknown,
      { data: { stateId: string; yearId: string; excludeUlbIds: string[] } },
    ];
    expect(config.data).toEqual({ stateId: 'state-1', yearId: 'year-1', excludeUlbIds: [] });

    expect(rows.length).toBe(1);
    expect(rows.at(0).controls.ulbId.value).toBe(ULB_OPTIONS[0].ulbId);
    expect(rows.at(0).controls.unspentAmount.value).toBeNull();
  });

  it('does not add a row when the picker is cancelled', () => {
    setupWithRows([]);
    dialog.open.and.returnValue(dialogRefReturning(undefined));

    fixture.debugElement.query(By.css('button[aria-label="Add ULB"]')).nativeElement.click();

    expect(rows.length).toBe(0);
  });

  it('excludes ULBs already present in other rows when adding a new one', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 })],
      {
        savedRows: SAVED_ROWS,
      },
    );
    dialog.open.and.returnValue(dialogRefReturning(ULB_OPTIONS[1]));

    fixture.debugElement.query(By.css('button[aria-label="Add ULB"]')).nativeElement.click();

    const [, config] = dialog.open.calls.mostRecent().args as [unknown, { data: { excludeUlbIds: string[] } }];
    expect(config.data.excludeUlbIds).toEqual([ULB_OPTIONS[0].ulbId]);
  });

  it('does not open the picker for Add ULB when canEdit is false', () => {
    setupWithRows([], { canEdit: false });

    fixture.debugElement.query(By.css('button[aria-label="Add ULB"]')).nativeElement.click();

    expect(dialog.open).not.toHaveBeenCalled();
  });

  // ─── Change ULB on an existing row via the picker ───────────────────────────

  it('shows a "Select ULB" button for a blank row and a name + "Change" button once selected', () => {
    setupWithRows([createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: null, unspentAmount: null })]);
    expect(fixture.debugElement.query(By.css('button[aria-label="Select ULB"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('button[aria-label="Change selected ULB"]'))).toBeFalsy();

    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 })],
      {
        savedRows: SAVED_ROWS,
      },
    );
    expect(fixture.debugElement.query(By.css('button[aria-label="Change selected ULB"]'))).toBeTruthy();
  });

  it('replaces the row ulbId with the picker selection and excludes every other row', () => {
    setupWithRows(
      [
        createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 }),
        createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1.2 }),
      ],
      { savedRows: SAVED_ROWS },
    );
    dialog.open.and.returnValue(dialogRefReturning(ULB_OPTIONS[2]));

    component.openPickerForRow(0);

    const [, config] = dialog.open.calls.mostRecent().args as [unknown, { data: { excludeUlbIds: string[] } }];
    // Excludes the *other* row's ulbId, but not row 0's own current selection.
    expect(config.data.excludeUlbIds).toEqual([ULB_OPTIONS[1].ulbId]);

    expect(rows.at(0).controls.ulbId.value).toBe(ULB_OPTIONS[2].ulbId);
    expect(rows.at(0).controls.ulbId.touched).toBe(true);
  });

  it('renders name/allocation from the freshly picked option for a row with no saved snapshot', () => {
    setupWithRows([createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: null, unspentAmount: null })]);
    dialog.open.and.returnValue(dialogRefReturning(ULB_OPTIONS[2]));

    component.openPickerForRow(0);
    fixture.detectChanges();

    const cells = fixture.debugElement.queryAll(By.css('tbody tr td'));
    expect(cells[1].nativeElement.textContent).toContain(ULB_OPTIONS[2].ulbName);
    expect(cells[2].nativeElement.textContent).toContain('800456');
    expect(cells[3].nativeElement.textContent).toContain('12.5');
  });

  it('never applies a picker selection that would duplicate a ulbId already present in another row', () => {
    setupWithRows(
      [
        createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 }),
        createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: null, unspentAmount: null }),
      ],
      { savedRows: SAVED_ROWS },
    );
    // Simulate a race: the picker (opened for row 1) somehow resolves with row 0's own ulbId.
    dialog.open.and.returnValue(dialogRefReturning(ULB_OPTIONS[0]));

    component.openPickerForRow(1);

    expect(rows.at(1).controls.ulbId.value).toBeNull();
  });

  it('does not open the picker for an existing row when canEdit is false', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 })],
      {
        canEdit: false,
        savedRows: SAVED_ROWS,
      },
    );

    component.openPickerForRow(0);

    expect(dialog.open).not.toHaveBeenCalled();
  });

  // ─── Remove ──────────────────────────────────────────────────────────────────

  it('removes the requested row', () => {
    setupWithRows(
      [
        createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 }),
        createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1 }),
      ],
      { savedRows: SAVED_ROWS },
    );

    component.removeRow(0);
    fixture.detectChanges();

    expect(rows.length).toBe(1);
    expect(rows.at(0).controls.ulbId.value).toBe(ULB_OPTIONS[1].ulbId);
  });

  // ─── Eligibility preview (threshold-driven) ────────────────────────────────

  it('calculates and displays an eligible percentage against the given threshold', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 })],
      { savedRows: SAVED_ROWS },
    );

    expect(component.rowViewModels()[0].allocationPerc).toBeCloseTo(7.5, 5);
    expect(component.rowViewModels()[0].eligible).toBe(true);

    const badge = fixture.debugElement.query(By.css('tbody tr .badge'));
    expect(badge.nativeElement.classList).toContain('text-bg-success');
  });

  it('calculates and displays an ineligible percentage against the given threshold', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1.2 })],
      { savedRows: SAVED_ROWS },
    );

    expect(component.rowViewModels()[0].allocationPerc).toBeCloseTo(15, 5);
    expect(component.rowViewModels()[0].eligible).toBe(false);

    const badge = fixture.debugElement.query(By.css('tbody tr .badge'));
    expect(badge.nativeElement.classList).toContain('text-bg-danger');
  });

  it('uses the injected threshold input instead of a hardcoded value', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[1].ulbId, unspentAmount: 1.2 })],
      { savedRows: SAVED_ROWS, threshold: 20 },
    );

    // Same 15% row that's "Not Eligible" at the default threshold (10) is "Eligible" at 20.
    expect(component.rowViewModels()[0].allocationPerc).toBeCloseTo(15, 5);
    expect(component.rowViewModels()[0].eligible).toBe(true);

    const badge = fixture.debugElement.query(By.css('tbody tr .badge'));
    expect(badge.nativeElement.classList).toContain('text-bg-success');
  });

  it('shows — when allocation or entered amount is unavailable', () => {
    setupWithRows([createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: null, unspentAmount: null })]);

    expect(component.rowViewModels()[0].allocationPerc).toBeNull();
    expect(component.rowViewModels()[0].eligible).toBeNull();

    const cells = fixture.debugElement.queryAll(By.css('tbody tr td'));
    expect(cells[5].nativeElement.textContent).toContain('—');
    expect(cells[6].nativeElement.textContent).toContain('—');
  });

  // ─── Server-injected row apiErrors ─────────────────────────────────────────

  it('renders apiErrors set on a row control', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 })],
      { savedRows: SAVED_ROWS },
    );

    rows.at(0).controls.unspentAmount.setErrors({ apiErrors: ['Unspent amount must be greater than zero.'] });
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('[data-cy="fc-unspent-row-unspentamount-api-error"]'));
    expect(errorEl.nativeElement.textContent).toContain('Unspent amount must be greater than zero.');
  });

  it('clears a row control apiErrors as soon as its value changes', () => {
    const group = createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1.5 });
    group.controls.unspentAmount.setErrors({ apiErrors: ['Must be greater than zero.'] });

    group.controls.unspentAmount.setValue(5);

    expect(group.controls.unspentAmount.errors?.['apiErrors']).toBeUndefined();
  });

  it('disables add/remove/select actions when canEdit is false', () => {
    setupWithRows(
      [createFcUnspentUlbRowGroup(dynamicService, true, { ulbId: ULB_OPTIONS[0].ulbId, unspentAmount: 1 })],
      { canEdit: false, savedRows: SAVED_ROWS },
    );

    const addButton = fixture.debugElement.query(By.css('button[aria-label="Add ULB"]'));
    const removeButton = fixture.debugElement.query(By.css('button.unspent-row-btn[aria-label="Remove row"]'));
    const changeButton = fixture.debugElement.query(By.css('button[aria-label="Change selected ULB"]'));

    expect(addButton.nativeElement.disabled).toBe(true);
    expect(removeButton.nativeElement.disabled).toBe(true);
    expect(changeButton.nativeElement.disabled).toBe(true);
  });
});
