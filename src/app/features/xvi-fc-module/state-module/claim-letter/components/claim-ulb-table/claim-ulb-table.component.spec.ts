import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ClaimLetterUlbOption, ClaimLetterUlbRow } from '../../claim-letter.models';
import { ClaimLetterUlbPickerDialogComponent } from '../ulb-picker-dialog/claim-letter-ulb-picker-dialog.component';
import { ClaimUlbRowGroup, ClaimUlbTableComponent, createClaimUlbRowGroup } from './claim-ulb-table.component';

const ULB_OPTIONS: ClaimLetterUlbOption[] = [
  {
    ulbId: '66a000000000000000000001',
    ulbName: 'Sample Municipal Corporation',
    censusCode: '800123',
    sbCode: null,
    allocationAmount: 20,
    eligible: true,
    ineligibleReasonCode: null,
    ineligibleReasonDetail: null,
  },
  {
    ulbId: '66a000000000000000000002',
    ulbName: 'Sample Municipal Council',
    censusCode: null,
    sbCode: 'SB-0142',
    allocationAmount: 8,
    eligible: true,
    ineligibleReasonCode: null,
    ineligibleReasonDetail: null,
  },
];

const SAVED_ROWS: ClaimLetterUlbRow[] = [
  {
    ulbId: ULB_OPTIONS[0].ulbId,
    ulbName: ULB_OPTIONS[0].ulbName,
    censusCode: ULB_OPTIONS[0].censusCode,
    sbCode: ULB_OPTIONS[0].sbCode,
    allocationAmount: 20,
    claimAmount: 21,
    differencePercentage: 5,
    eligible: true,
  },
];

interface SetupOptions {
  canEdit?: boolean;
  savedRows?: readonly ClaimLetterUlbRow[];
  claimLetterId?: string;
}

describe('ClaimUlbTableComponent', () => {
  let component: ClaimUlbTableComponent;
  let fixture: ComponentFixture<ClaimUlbTableComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let rows: FormArray<ClaimUlbRowGroup>;

  function dialogRefReturning(
    options: ClaimLetterUlbOption[] | undefined,
  ): jasmine.SpyObj<MatDialogRef<ClaimLetterUlbPickerDialogComponent, ClaimLetterUlbOption[]>> {
    const ref = jasmine.createSpyObj<MatDialogRef<ClaimLetterUlbPickerDialogComponent, ClaimLetterUlbOption[]>>(
      'MatDialogRef',
      ['afterClosed'],
    );
    ref.afterClosed.and.returnValue(of(options));
    return ref;
  }

  function setupWithRows(rowGroups: ClaimUlbRowGroup[], options: SetupOptions = {}): void {
    rows = new FormArray<ClaimUlbRowGroup>(rowGroups);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('savedRows', options.savedRows ?? []);
    fixture.componentRef.setInput('canEdit', options.canEdit ?? true);
    fixture.componentRef.setInput('stateId', 'state-1');
    fixture.componentRef.setInput('yearId', 'year-1');
    fixture.componentRef.setInput('claimLetterId', options.claimLetterId);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [ClaimUlbTableComponent],
      providers: [{ provide: MatDialog, useValue: dialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimUlbTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setupWithRows([]);
    expect(component).toBeTruthy();
  });

  it('shows an empty state with zero rows', () => {
    setupWithRows([]);
    expect(fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-empty"]'))).toBeTruthy();
  });

  it('hydrates a saved row from savedRows, not the picker', () => {
    setupWithRows(
      [createClaimUlbRowGroup(true, { ulbId: SAVED_ROWS[0].ulbId, claimedAmount: SAVED_ROWS[0].claimAmount })],
      { savedRows: SAVED_ROWS },
    );

    expect(dialog.open).not.toHaveBeenCalled();
    expect(component.rowViewModels()[0].ulbName).toBe('Sample Municipal Corporation');
    expect(component.rowViewModels()[0].allocationAmount).toBe(20);
    expect(component.rowViewModels()[0].eligible).toBe(true);
    expect(component.rowViewModels()[0].savedDifferencePercentage).toBe(5);
  });

  it('falls back to sbCode when censusCode is null, for a saved row', () => {
    const rowWithSbCodeOnly: ClaimLetterUlbRow = {
      ulbId: ULB_OPTIONS[1].ulbId,
      ulbName: ULB_OPTIONS[1].ulbName,
      censusCode: null,
      sbCode: 'SB-0142',
      allocationAmount: 8,
      claimAmount: 8,
      differencePercentage: 0,
      eligible: true,
    };
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[1].ulbId, claimedAmount: 8 })], {
      savedRows: [rowWithSbCodeOnly],
    });

    expect(component.rowViewModels()[0].censusCode).toBeNull();
    expect(component.rowViewModels()[0].sbCode).toBe('SB-0142');

    const cell = fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-row"] td:nth-child(3)'));
    expect(cell.nativeElement.textContent.trim()).toBe('SB-0142');
  });

  it('falls back to sbCode when censusCode is null, for a freshly-picked row', () => {
    setupWithRows([]);
    dialog.open.and.returnValue(dialogRefReturning([ULB_OPTIONS[1]])); // censusCode null, sbCode 'SB-0142'

    component.addRow();
    fixture.detectChanges();

    expect(component.rowViewModels()[0].censusCode).toBeNull();
    expect(component.rowViewModels()[0].sbCode).toBe('SB-0142');
  });

  it('shows an em dash when both censusCode and sbCode are null', () => {
    const rowWithNeither: ClaimLetterUlbRow = {
      ulbId: ULB_OPTIONS[0].ulbId,
      ulbName: ULB_OPTIONS[0].ulbName,
      censusCode: null,
      sbCode: null,
      allocationAmount: 20,
      claimAmount: 20,
      differencePercentage: 0,
      eligible: true,
    };
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 })], {
      savedRows: [rowWithNeither],
    });

    const cell = fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-row"] td:nth-child(3)'));
    expect(cell.nativeElement.textContent.trim()).toBe('—');
  });

  // ─── Add / remove via picker ─────────────────────────────────────────────────

  it('addRow opens the picker excluding current row ulbIds', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 })]);
    dialog.open.and.returnValue(dialogRefReturning(undefined));

    component.addRow();

    expect(dialog.open).toHaveBeenCalledWith(
      ClaimLetterUlbPickerDialogComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          stateId: 'state-1',
          yearId: 'year-1',
          installment: 1,
          excludeUlbIds: [ULB_OPTIONS[0].ulbId],
          claimLetterId: undefined,
        }),
      }),
    );
  });

  it('addRow forwards claimLetterId in edit mode', () => {
    setupWithRows([], { claimLetterId: 'claim-1' });
    dialog.open.and.returnValue(dialogRefReturning(undefined));

    component.addRow();

    expect(dialog.open).toHaveBeenCalledWith(
      ClaimLetterUlbPickerDialogComponent,
      jasmine.objectContaining({ data: jasmine.objectContaining({ claimLetterId: 'claim-1' }) }),
    );
  });

  it('addRow pushes one row per selected option, seeding claimedAmount to the allocation', () => {
    setupWithRows([]);
    dialog.open.and.returnValue(dialogRefReturning([ULB_OPTIONS[0], ULB_OPTIONS[1]]));

    component.addRow();

    expect(rows.length).toBe(2);
    expect(rows.at(0).controls.ulbId.value).toBe(ULB_OPTIONS[0].ulbId);
    expect(rows.at(0).controls.claimedAmount.value).toBe(20);
    expect(rows.at(1).controls.ulbId.value).toBe(ULB_OPTIONS[1].ulbId);
  });

  it('addRow is a no-op when canEdit is false', () => {
    setupWithRows([], { canEdit: false });
    component.addRow();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('never applies a duplicate ulbId already present in the table', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 })]);
    dialog.open.and.returnValue(dialogRefReturning([ULB_OPTIONS[0], ULB_OPTIONS[1]]));

    component.addRow();

    expect(rows.length).toBe(2); // only ULB_OPTIONS[1] was actually new
    expect(rows.at(1).controls.ulbId.value).toBe(ULB_OPTIONS[1].ulbId);
  });

  it('removeRow removes the row at the given index', () => {
    setupWithRows([
      createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 }),
      createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[1].ulbId, claimedAmount: 8 }),
    ]);

    component.removeRow(0);

    expect(rows.length).toBe(1);
    expect(rows.at(0).controls.ulbId.value).toBe(ULB_OPTIONS[1].ulbId);
  });

  // ─── Live ±10% variance preview ──────────────────────────────────────────────
  // The live preview needs a known allocationAmount, which the table only ever knows from a saved
  // row's snapshot or a picker selection — never invented client-side — so these seed `savedRows`.

  const ALLOCATION_ROW: ClaimLetterUlbRow = {
    ulbId: ULB_OPTIONS[0].ulbId,
    ulbName: ULB_OPTIONS[0].ulbName,
    censusCode: ULB_OPTIONS[0].censusCode,
    sbCode: ULB_OPTIONS[0].sbCode,
    allocationAmount: 20,
    claimAmount: 20,
    differencePercentage: 0,
    eligible: true,
  };

  it('reports within-variance for a claim inside ±10% of allocation', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 21 })], {
      savedRows: [ALLOCATION_ROW],
    }); // 20 * 1.05
    expect(component.rowViewModels()[0].liveWithinVariance).toBe(true);
  });

  it('reports outside-variance for a claim beyond +10% of allocation', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 23 })], {
      savedRows: [ALLOCATION_ROW],
    }); // 20 * 1.15
    expect(component.rowViewModels()[0].liveWithinVariance).toBe(false);
  });

  it('recomputes the live preview as the claim amount is edited', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 })], {
      savedRows: [ALLOCATION_ROW],
    });
    expect(component.rowViewModels()[0].liveWithinVariance).toBe(true);

    rows.at(0).controls.claimedAmount.setValue(100);
    fixture.detectChanges();

    expect(component.rowViewModels()[0].liveWithinVariance).toBe(false);
  });

  it('shows the variance warning icon only when out of range and untouched-required errors are absent', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 100 })], {
      savedRows: [ALLOCATION_ROW],
    });
    expect(fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-variance-warning-icon"]'))).toBeTruthy();
  });

  it('is null (no badge) when allocation is unknown', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: 'unknown-ulb', claimedAmount: 10 })]);
    expect(component.rowViewModels()[0].liveWithinVariance).toBeNull();
  });

  // ─── invalidRowIdentifiers (known-invalid rows, for pre-submit gating) ───────

  it('is empty when every row is within variance and eligible', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 21 })], {
      savedRows: [ALLOCATION_ROW],
    });
    expect(component.invalidRowIdentifiers()).toEqual([]);
  });

  it('is empty for an incomplete row (no claim amount yet), not a false positive', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: null })], {
      savedRows: [ALLOCATION_ROW],
    });
    expect(component.invalidRowIdentifiers()).toEqual([]);
  });

  it('includes the censusCode of a row outside the ±10% band', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 23 })], {
      savedRows: [ALLOCATION_ROW],
    }); // 20 * 1.15, ALLOCATION_ROW.censusCode is '800123'
    expect(component.invalidRowIdentifiers()).toEqual(['800123']);
  });

  it('includes the censusCode of an ineligible row even when its claim amount is within variance', () => {
    const ineligibleRow: ClaimLetterUlbRow = { ...ALLOCATION_ROW, eligible: false };
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 })], {
      savedRows: [ineligibleRow],
    });
    expect(component.invalidRowIdentifiers()).toEqual(['800123']);
  });

  it('falls back to sbCode when censusCode is unavailable on an invalid row', () => {
    const sbCodeOnlyInvalid: ClaimLetterUlbRow = {
      ...ALLOCATION_ROW,
      ulbId: ULB_OPTIONS[1].ulbId,
      censusCode: null,
      sbCode: 'SB-0142',
    };
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[1].ulbId, claimedAmount: 23 })], {
      savedRows: [sbCodeOnlyInvalid],
    });
    expect(component.invalidRowIdentifiers()).toEqual(['SB-0142']);
  });

  it('falls back to ulbName when neither censusCode nor sbCode is available on an invalid row', () => {
    const neitherCodeInvalid: ClaimLetterUlbRow = {
      ...ALLOCATION_ROW,
      ulbId: ULB_OPTIONS[1].ulbId,
      ulbName: ULB_OPTIONS[1].ulbName,
      censusCode: null,
      sbCode: null,
    };
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[1].ulbId, claimedAmount: 23 })], {
      savedRows: [neitherCodeInvalid],
    });
    expect(component.invalidRowIdentifiers()).toEqual(['Sample Municipal Council']);
  });

  // ─── Validation error icon ────────────────────────────────────────────────────

  it('shows a required error icon once the claim amount control is touched and empty', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: null })]);
    rows.at(0).controls.claimedAmount.markAsTouched();
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-amount-error-icon"]'));
    expect(icon).toBeTruthy();
  });

  it('shows no error icon while the control is untouched', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: null })]);
    expect(fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-amount-error-icon"]'))).toBeFalsy();
  });

  // ─── Totals ────────────────────────────────────────────────────────────────────

  it('computes running totals from the live FormArray', () => {
    setupWithRows(
      [
        createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 21 }),
        createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[1].ulbId, claimedAmount: 8 }),
      ],
      { savedRows: SAVED_ROWS.concat({ ...SAVED_ROWS[0], ulbId: ULB_OPTIONS[1].ulbId, allocationAmount: 8 }) },
    );

    expect(component.totalAllocation()).toBe(28);
    expect(component.totalClaim()).toBe(29);
  });

  // ─── Read-only mode ────────────────────────────────────────────────────────────

  it('disables Add/Remove buttons and row controls when canEdit is false', () => {
    setupWithRows([createClaimUlbRowGroup(false, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 })], {
      canEdit: false,
    });

    const addButton = fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-add"]'))
      .nativeElement as HTMLButtonElement;
    expect(addButton.disabled).toBe(true);
    expect(rows.at(0).controls.claimedAmount.disabled).toBe(true);
  });
});
