import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ClaimLetterUlbOption, ClaimLetterUlbRow } from '../../claim-letter.models';
import { ConfirmDialogService } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.service';
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
    claimedInBatch: null,
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
    claimedInBatch: null,
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
  /** Defaults to on, so the claim-amount tests run on the editable mode; off has its own describe. */
  claimAmountEditable?: boolean;
  varianceLowerPercent?: number;
  varianceUpperPercent?: number;
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
    fixture.componentRef.setInput('claimAmountEditable', options.claimAmountEditable ?? true);
    fixture.componentRef.setInput('varianceLowerPercent', options.varianceLowerPercent ?? 90);
    fixture.componentRef.setInput('varianceUpperPercent', options.varianceUpperPercent ?? 110);
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

  it('badges a row whose exemption request is under MoHUA review or was rejected', () => {
    setupWithRows(
      [createClaimUlbRowGroup(true, { ulbId: SAVED_ROWS[0].ulbId, claimedAmount: SAVED_ROWS[0].claimAmount })],
      {
        savedRows: [
          {
            ...SAVED_ROWS[0],
            eligible: false,
            exemptionNotes: [
              { label: 'Audited Accounts', status: 'UNDER_REVIEW' },
              { label: 'Provisional Accounts', status: 'REJECTED' },
            ],
          },
        ],
      },
    );

    const badges = fixture.debugElement.queryAll(By.css('[data-cy="claim-ulb-table-exemption-badge"]'));
    expect(badges.map((badge) => (badge.nativeElement as HTMLElement).textContent?.trim())).toEqual([
      'Exemption under review',
      'Exemption rejected by MoHUA',
    ]);
    expect((badges[0].nativeElement as HTMLElement).classList).toContain('text-bg-info');
    expect((badges[1].nativeElement as HTMLElement).classList).toContain('text-bg-danger');
    // Focusable, so keyboard users can open the tooltip naming the forms.
    expect(badges.map((badge) => (badge.nativeElement as HTMLElement).getAttribute('tabindex'))).toEqual(['0', '0']);
  });

  it('shows a re-picked ULB with the picker data, not the older saved row', () => {
    setupWithRows(
      [createClaimUlbRowGroup(true, { ulbId: SAVED_ROWS[0].ulbId, claimedAmount: SAVED_ROWS[0].claimAmount })],
      {
        savedRows: [
          {
            ...SAVED_ROWS[0],
            eligible: false,
            exemptionNotes: [{ label: 'Audited Accounts', status: 'REJECTED' }],
          },
        ],
      },
    );
    dialog.open.and.returnValue(
      dialogRefReturning([
        { ...ULB_OPTIONS[0], exemptionNotes: [{ label: 'Audited Accounts', status: 'UNDER_REVIEW' }] },
      ]),
    );

    component.removeRow(0);
    component.addRow();
    fixture.detectChanges();

    expect(component.rowViewModels()[0].eligible).toBe(true);
    expect(component.rowViewModels()[0].exemptionBadges.map((badge) => badge.status)).toEqual(['UNDER_REVIEW']);
    expect(component.invalidRowIdentifiers()).toEqual([]);
  });

  it('drops the picked data when savedRows changes, so the reloaded saved row shows', () => {
    setupWithRows([]);
    dialog.open.and.returnValue(
      dialogRefReturning([
        { ...ULB_OPTIONS[0], exemptionNotes: [{ label: 'Audited Accounts', status: 'UNDER_REVIEW' }] },
      ]),
    );
    component.addRow();

    fixture.componentRef.setInput('savedRows', [{ ...SAVED_ROWS[0], exemptionNotes: [] }]);
    fixture.detectChanges();

    expect(component.pickedUlbByUlbId().size).toBe(0);
    expect(component.rowViewModels()[0].exemptionBadges).toEqual([]);
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

  it('marks the claim amount control invalid for a non-integer value (no decimals allowed)', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 100 })]);
    const claimedAmount = rows.at(0).controls.claimedAmount;

    claimedAmount.setValue(100.5);
    expect(claimedAmount.hasError('decimal')).toBeTrue();

    claimedAmount.setValue(100);
    expect(claimedAmount.hasError('decimal')).toBeFalse();
  });

  it('clears a server-set apiErrors entry as soon as the claim amount control is edited', () => {
    setupWithRows([createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 100 })]);
    const claimedAmount = rows.at(0).controls.claimedAmount;

    claimedAmount.setErrors({ apiErrors: ['claimedAmount must be an integer number'] });
    expect(claimedAmount.hasError('apiErrors')).toBeTrue();

    claimedAmount.setValue(101);
    expect(claimedAmount.hasError('apiErrors')).toBeFalse();
  });

  // ─── Totals ────────────────────────────────────────────────────────────────────

  it('shows a refused claim amount from the page, only while it is still the amount that was sent', () => {
    const group = createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 });
    setupWithRows([group], { savedRows: SAVED_ROWS });
    fixture.componentRef.setInput(
      'rejectedRows',
      new Map([[ULB_OPTIONS[0].ulbId, { claimedAmount: { message: 'Not allowed.', sentAmount: 20 } }]]),
    );
    fixture.detectChanges();

    const errorIcon = () => fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-amount-error-icon"]'));
    expect(errorIcon()).not.toBeNull();
    expect(
      component.amountErrorText(group.controls.claimedAmount, component.rejectedRows().get(ULB_OPTIONS[0].ulbId)),
    ).toBe('Not allowed.');

    group.controls.claimedAmount.setValue(21);
    fixture.detectChanges();
    expect(errorIcon()).toBeNull();
  });

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

  // ─── Claim-amount switch off (claim = allocation) ──────────────────────────────

  describe('with the claim-amount switch off', () => {
    function headerTexts(): string[] {
      return fixture.debugElement
        .queryAll(By.css('thead th'))
        .map((th) => (th.nativeElement as HTMLElement).textContent?.trim() ?? '');
    }

    beforeEach(() => {
      setupWithRows(
        [
          createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 21 }),
          createClaimUlbRowGroup(true, { ulbId: ULB_OPTIONS[1].ulbId, claimedAmount: 9 }),
        ],
        {
          claimAmountEditable: false,
          savedRows: SAVED_ROWS.concat({ ...SAVED_ROWS[0], ulbId: ULB_OPTIONS[1].ulbId, allocationAmount: 8 }),
        },
      );
    });

    it('shows only the allocation: no claim input and no difference column', () => {
      expect(headerTexts().length).toBe(5);
      expect(headerTexts().some((text) => text.startsWith('Claim Amount'))).toBeFalse();
      expect(headerTexts()).not.toContain('Difference (%)');
      expect(fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-claim-amount"]'))).toBeNull();
    });

    it('totals the claim as the allocation, whatever the hidden controls hold', () => {
      expect(component.totalAllocation()).toBe(28);
      expect(component.totalClaim()).toBe(28);
    });

    it('never flags a row for the band or shows a difference', () => {
      expect(component.invalidRowIdentifiers()).toEqual([]);
      expect(component.rowViewModels().every((row) => row.liveWithinVariance === null)).toBeTrue();
      expect(component.rowViewModels().every((row) => row.savedDifferencePercentage === null)).toBeTrue();
    });

    it('spans the empty state over the five remaining columns', () => {
      setupWithRows([], { claimAmountEditable: false });
      const empty = fixture.debugElement.query(By.css('[data-cy="claim-ulb-table-empty"]'))
        .nativeElement as HTMLTableCellElement;
      expect(empty.getAttribute('colspan')).toBe('5');
    });
  });

  // ─── Large batches (select all can add hundreds of ULBs) ───────────────────────

  describe('with hundreds of rows', () => {
    /** "ULB 000".. in name order; ids are 24-hex like real ones. */
    function pickedOption(i: number, overrides: Partial<ClaimLetterUlbOption> = {}): ClaimLetterUlbOption {
      return {
        ...ULB_OPTIONS[0],
        ulbId: `66b${String(i).padStart(21, '0')}`,
        ulbName: `ULB ${String(i).padStart(3, '0')}`,
        censusCode: `9${String(i).padStart(5, '0')}`,
        ...overrides,
      };
    }

    /** Picked Z-A, so the table's A-Z display order differs from the FormArray order. */
    function addPicked(count: number): ClaimLetterUlbOption[] {
      const picked = Array.from({ length: count }, (_, i) => pickedOption(count - 1 - i));
      dialog.open.and.returnValue(dialogRefReturning(picked));
      component.addRow();
      fixture.detectChanges();
      return picked;
    }

    const domRows = () => fixture.debugElement.queryAll(By.css('[data-cy="claim-ulb-table-row"]'));
    const byCy = (cy: string) =>
      (fixture.nativeElement as HTMLElement).querySelector(`[data-cy="${cy}"]`) as HTMLElement | null;
    const rowText = (i: number) => (domRows()[i].nativeElement as HTMLElement).textContent ?? '';

    beforeEach(() => setupWithRows([], { claimAmountEditable: false }));

    it('adds a whole pick with a single valueChanges emission', () => {
      const emissions: unknown[] = [];
      rows.valueChanges.subscribe((value) => emissions.push(value));

      addPicked(800);

      expect(rows.length).toBe(800);
      expect(emissions.length).toBe(1);
      expect(component.totalAllocation()).toBe(800 * 20);
    });

    it('shows 50 rows a page, A-Z by name and numbered by position, while the FormArray keeps the picked order', () => {
      const picked = addPicked(60);

      expect(domRows().length).toBe(50);
      expect(rowText(0)).toContain('ULB 000');
      expect(byCy('claim-ulb-table-range')?.textContent?.trim()).toBe('Showing 1-50 of 60');
      expect(rows.at(0).controls.ulbId.value).toBe(picked[0].ulbId); // ULB 059, picked first

      byCy('claim-ulb-table-next')!.click();
      fixture.detectChanges();

      expect(domRows().length).toBe(10);
      expect(rowText(0)).toContain('ULB 050');
      expect(rowText(0)).toContain('51');
      expect(byCy('claim-ulb-table-range')?.textContent?.trim()).toBe('Showing 51-60 of 60');
    });

    it('searches by name or code from page 1, and says when nothing matches', () => {
      addPicked(60);
      component.goToTablePage(2);

      const search = byCy('claim-ulb-table-search') as HTMLInputElement;
      search.value = '900055';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.currentTablePage()).toBe(1);
      expect(domRows().length).toBe(1);
      expect(rowText(0)).toContain('ULB 055');

      search.value = 'nowhere';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(domRows().length).toBe(0);
      expect(byCy('claim-ulb-table-no-match')?.textContent?.trim()).toBe('No ULBs match your search.');
    });

    it('removes the ULB clicked on page 2, and steps back a page once the last page empties', () => {
      addPicked(51);
      component.goToTablePage(2);
      fixture.detectChanges();
      expect(rowText(0)).toContain('ULB 050');

      domRows()[0].query(By.css('button[aria-label="Remove row"]')).nativeElement.click();
      fixture.detectChanges();

      expect(rows.length).toBe(50);
      expect(rows.controls.some((row) => row.controls.ulbId.value === pickedOption(50).ulbId)).toBeFalse();
      expect(component.currentTablePage()).toBe(1);
      expect(domRows().length).toBe(50);
    });

    it('says the footer total covers every row while only a page is shown', () => {
      addPicked(60);
      const footer = (fixture.nativeElement as HTMLElement).querySelector('tfoot')?.textContent ?? '';
      expect(footer).toContain('Total (all 60 ULBs)');
    });

    it('Remove all confirms, then empties the table; cancelling keeps every row', () => {
      addPicked(3);
      const confirm = spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(false));

      byCy('claim-ulb-table-remove-all')!.click();
      expect(confirm.calls.mostRecent().args[0]).toEqual(
        jasmine.objectContaining({ title: 'Remove all ULBs?', confirmText: 'Remove all' }),
      );
      expect(rows.length).toBe(3);

      confirm.and.returnValue(of(true));
      byCy('claim-ulb-table-remove-all')!.click();
      fixture.detectChanges();
      expect(rows.length).toBe(0);
      expect(byCy('claim-ulb-table-empty')).not.toBeNull();
    });

    it('hides Remove all when the table cannot be edited', () => {
      setupWithRows([createClaimUlbRowGroup(false, { ulbId: ULB_OPTIONS[0].ulbId, claimedAmount: 20 })], {
        canEdit: false,
      });
      expect(byCy('claim-ulb-table-remove-all')).toBeNull();
    });

    it('lists the rows known to be ineligible, for the page to offer removing them', () => {
      dialog.open.and.returnValue(dialogRefReturning([pickedOption(1), pickedOption(2, { eligible: false })]));
      component.addRow();
      expect(component.ineligibleUlbIds()).toEqual([pickedOption(2).ulbId]);
    });

    it('marks a row whose ULB the server refused, and keeps the mark across pages', () => {
      const picked = addPicked(60);
      fixture.componentRef.setInput(
        'rejectedRows',
        new Map([[picked[0].ulbId, { ulbId: 'Already in Claim Batch #2.' }]]),
      );
      fixture.detectChanges();

      const badges = () => fixture.debugElement.queryAll(By.css('[data-cy="claim-ulb-table-ulb-error"]'));
      expect(badges().length).toBe(0); // ULB 059 sorts onto page 2

      component.goToTablePage(2);
      fixture.detectChanges();
      component.goToTablePage(1);
      fixture.detectChanges();
      component.goToTablePage(2);
      fixture.detectChanges();

      expect(badges().length).toBe(1);
      expect((badges()[0].nativeElement as HTMLElement).textContent?.trim()).toBe('Not accepted');
    });

    it('adds, removes and clears nothing while a save is in flight', () => {
      addPicked(3);
      fixture.componentRef.setInput('locked', true);
      fixture.detectChanges();
      const confirm = spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));

      component.addRow();
      component.removeRow(0);
      component.removeAll();

      expect(dialog.open).toHaveBeenCalledTimes(1); // addPicked's own pick
      expect(confirm).not.toHaveBeenCalled();
      expect(rows.length).toBe(3);
      expect(byCy('claim-ulb-table-add')?.hasAttribute('disabled')).toBeTrue();
      expect(byCy('claim-ulb-table-remove-all')?.hasAttribute('disabled')).toBeTrue();
    });

    it('tells the page which ULBs the user removed', () => {
      const picked = addPicked(3);
      const removed: string[][] = [];
      component.ulbsRemoved.subscribe((ulbIds) => removed.push(ulbIds));
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));

      component.removeRow(0);
      component.removeAll();

      expect(removed).toEqual([[picked[0].ulbId], [picked[1].ulbId, picked[2].ulbId]]);
    });

    it('does not re-sort the rows when only a claim amount changes', () => {
      addPicked(3);
      const order = component.displayIndexes();

      rows.at(0).controls.claimedAmount.setValue(5);

      expect(component.displayIndexes()).toBe(order);
    });

    it('tells the picker when this is the final batch', () => {
      fixture.componentRef.setInput('isFinalBatch', true);
      dialog.open.and.returnValue(dialogRefReturning(undefined));
      component.addRow();
      expect(dialog.open).toHaveBeenCalledWith(
        ClaimLetterUlbPickerDialogComponent,
        jasmine.objectContaining({ data: jasmine.objectContaining({ isFinalBatch: true }) }),
      );
    });
  });
});
