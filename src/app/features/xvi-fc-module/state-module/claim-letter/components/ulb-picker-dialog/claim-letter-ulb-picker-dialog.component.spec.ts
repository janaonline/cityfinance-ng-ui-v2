import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { ClaimLetterUlbOption, ClaimLetterUlbOptionsResult } from '../../claim-letter.models';
import { ClaimLetterService } from '../../claim-letter.service';
import {
  ClaimLetterUlbPickerDialogComponent,
  ClaimLetterUlbPickerDialogData,
} from './claim-letter-ulb-picker-dialog.component';

function makeOption(id: string, name: string, overrides: Partial<ClaimLetterUlbOption> = {}): ClaimLetterUlbOption {
  return {
    ulbId: id,
    ulbName: name,
    censusCode: `800${id}`,
    sbCode: null,
    allocationAmount: 10,
    eligible: true,
    ineligibleReasonCode: null,
    ineligibleReasonDetail: null,
    claimedInBatch: null,
    ...overrides,
  };
}

function makeResult(options: ClaimLetterUlbOption[], total = options.length): ClaimLetterUlbOptionsResult {
  return { options, page: 1, limit: 1000, total };
}

/** `n` eligible ULBs named "ULB 00".."ULB nn", A-Z like the backend sends them. */
function manyOptions(n: number, prefix = 'm'): ClaimLetterUlbOption[] {
  return Array.from({ length: n }, (_, i) => makeOption(`${prefix}-${i}`, `ULB ${String(i).padStart(2, '0')}`));
}

const baseData: ClaimLetterUlbPickerDialogData = {
  stateId: 'state-1',
  yearId: 'year-1',
  installment: 1,
  excludeUlbIds: ['ulb-2'],
  claimLetterId: 'claim-1',
};

describe('ClaimLetterUlbPickerDialogComponent', () => {
  let fixture: ComponentFixture<ClaimLetterUlbPickerDialogComponent>;
  let component: ClaimLetterUlbPickerDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ClaimLetterUlbPickerDialogComponent, ClaimLetterUlbOption[]>>;
  let getUlbOptionsSpy: jasmine.Spy;

  const options = [
    makeOption('ulb-1', 'Alpha ULB'),
    makeOption('ulb-2', 'Beta ULB'),
    makeOption('ulb-3', 'Gamma ULB', { eligible: false, ineligibleReasonCode: 'FORM_STATUS_3_NOT_ACCEPTED' }),
  ];

  async function setup(
    loaded: ClaimLetterUlbOption[] = options,
    data: ClaimLetterUlbPickerDialogData = baseData,
    total = loaded.length,
  ): Promise<void> {
    TestBed.resetTestingModule();
    dialogRef = jasmine.createSpyObj<MatDialogRef<ClaimLetterUlbPickerDialogComponent, ClaimLetterUlbOption[]>>(
      'MatDialogRef',
      ['close'],
    );

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ClaimLetterUlbPickerDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimLetterUlbPickerDialogComponent);
    component = fixture.componentInstance;
    const service = TestBed.inject(ClaimLetterService);
    getUlbOptionsSpy = spyOn(service, 'getUlbOptions').and.returnValue(of(makeResult(loaded, total)));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await setup();
  });

  function rows() {
    return fixture.debugElement.queryAll(By.css('[data-cy="claim-letter-ulb-picker-row"]'));
  }

  function rowFor(ulbId: string) {
    const index = component.pageRows().findIndex((o) => o.ulbId === ulbId);
    return rows()[index];
  }

  function checkboxFor(ulbId: string): HTMLInputElement {
    return rowFor(ulbId).query(By.css('[data-cy="claim-letter-ulb-picker-checkbox"]'))
      .nativeElement as HTMLInputElement;
  }

  function byCy(cy: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[data-cy="${cy}"]`);
  }

  function clickWithShift(target: HTMLElement): void {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();
  }

  // ─── Loading ─────────────────────────────────────────────────────────────────

  it('loads every ULB in one request, with the claimLetterId passthrough', () => {
    expect(getUlbOptionsSpy).toHaveBeenCalledOnceWith('state-1', 'year-1', 1, {
      claimLetterId: 'claim-1',
      page: 1,
      limit: 1000,
    });
    expect(component.allOptions()).toEqual(options);
  });

  it('omits claimLetterId when opened in create mode', async () => {
    await setup(options, { ...baseData, claimLetterId: undefined });
    expect(getUlbOptionsSpy).toHaveBeenCalledWith(
      'state-1',
      'year-1',
      1,
      jasmine.objectContaining({ claimLetterId: undefined }),
    );
  });

  it('notes when the State has more ULBs than one load returns', async () => {
    await setup(options, baseData, 1200);
    expect(byCy('claim-letter-ulb-picker-truncated-note')?.textContent?.trim()).toBe(
      'Showing the first 3 of 1200 ULBs.',
    );
  });

  it('shows a retryable failure state on error, and retry loads again', () => {
    getUlbOptionsSpy.and.returnValue(throwError(() => new Error('network error')));
    component.loadOptions();
    fixture.detectChanges();

    expect(component.loadError()).toBe(true);
    const retryButton = fixture.debugElement.query(By.css('button[aria-label="Retry loading ULBs"]'));

    getUlbOptionsSpy.and.returnValue(of(makeResult(options)));
    retryButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.loadError()).toBe(false);
    expect(component.allOptions()).toEqual(options);
  });

  // ─── Local search, filter and paging ──────────────────────────────────────────

  it('searches locally after a short debounce, on a trimmed term, without another request', fakeAsync(() => {
    component.search.setValue('  alp  ');
    tick(149);
    expect(component.filtered().length).toBe(3);
    tick(1);
    fixture.detectChanges();

    expect(component.filtered().map((o) => o.ulbId)).toEqual(['ulb-1']);
    expect(getUlbOptionsSpy).toHaveBeenCalledTimes(1);
  }));

  it('searches the Census Code and SB Code too', fakeAsync(() => {
    component.search.setValue('800ulb-3');
    tick(150);
    expect(component.filtered().map((o) => o.ulbId)).toEqual(['ulb-3']);
  }));

  it('filters locally with the backend rules', () => {
    const inBatch = makeOption('ulb-4', 'Delta ULB', {
      eligible: false,
      ineligibleReasonCode: 'ALREADY_LOCKED_IN_ANOTHER_CLAIM',
      claimedInBatch: { batchNumber: 1 },
    });
    component.allOptions.set([...options, inBatch]);

    component.setEligibilityFilter('ELIGIBLE');
    expect(component.filtered().map((o) => o.ulbId)).toEqual(['ulb-1', 'ulb-2']);
    component.setEligibilityFilter('INELIGIBLE');
    expect(component.filtered().map((o) => o.ulbId)).toEqual(['ulb-3']);
    component.setEligibilityFilter('IN_OTHER_BATCH');
    expect(component.filtered().map((o) => o.ulbId)).toEqual(['ulb-4']);
    expect(getUlbOptionsSpy).toHaveBeenCalledTimes(1);
  });

  it('clicking the In other batches toggle filters to ULBs in another batch', () => {
    const group = fixture.debugElement.query(By.css('[data-cy="claim-letter-ulb-picker-eligibility-filter"]'));
    const toggleButtons = group.queryAll(By.css('button'));
    expect((toggleButtons[3].nativeElement as HTMLElement).textContent?.trim()).toBe('In other batches');
    toggleButtons[3].nativeElement.click();
    fixture.detectChanges();

    expect(component.eligibilityFilter()).toBe('IN_OTHER_BATCH');
    expect(byCy('claim-letter-ulb-picker-empty')?.textContent?.trim()).toBe('No ULBs are in another batch.');
  });

  it('words the empty state for a search', fakeAsync(() => {
    component.search.setValue('zzz');
    tick(150);
    fixture.detectChanges();
    expect(byCy('claim-letter-ulb-picker-empty')?.textContent?.trim()).toBe('No ULBs found for the current search.');
  }));

  it('pages 20 at a time, and goes back to page 1 when the filter changes', async () => {
    await setup(manyOptions(45));
    expect(component.totalPages()).toBe(3);
    expect(rows().length).toBe(20);

    component.goToPage(3);
    fixture.detectChanges();
    expect(rows().length).toBe(5);

    component.goToPage(0);
    component.goToPage(4);
    expect(component.page()).toBe(3);

    component.setEligibilityFilter('ELIGIBLE');
    expect(component.page()).toBe(1);
  });

  // ─── Disabled rows ────────────────────────────────────────────────────────────

  it('disables an already-added ULB and an ineligible one, and leaves an eligible one selectable', () => {
    expect(checkboxFor('ulb-2').disabled).toBe(true);
    expect(checkboxFor('ulb-3').disabled).toBe(true);
    expect(checkboxFor('ulb-1').disabled).toBe(false);

    component.toggle(options[2]);
    expect(component.isSelected('ulb-3')).toBe(false);
  });

  // ─── Selecting rows ───────────────────────────────────────────────────────────

  it('confirms the selected ULBs in selection order', () => {
    component.toggle(options[0]);
    component.confirm();
    expect(dialogRef.close).toHaveBeenCalledWith([options[0]]);
  });

  it('a row click toggles, and a checkbox click does not double-toggle through the row', () => {
    rowFor('ulb-1').nativeElement.click();
    expect(component.isSelected('ulb-1')).toBe(true);
    checkboxFor('ulb-1').click();
    expect(component.isSelected('ulb-1')).toBe(false);
  });

  it('shift-click ticks every selectable row between the last toggled row and this one', async () => {
    const list = manyOptions(6);
    list[2] = makeOption('m-2', 'ULB 02', { eligible: false, ineligibleReasonCode: 'X' });
    await setup(list, { ...baseData, excludeUlbIds: ['m-3'] });

    checkboxFor('m-1').click();
    fixture.detectChanges();
    clickWithShift(checkboxFor('m-5'));

    // m-2 is ineligible and m-3 already added, so both are skipped.
    expect([...component.selectedUlbs().keys()].sort()).toEqual(['m-1', 'm-4', 'm-5']);

    // Shift-click on a ticked row unticks the range back to the new anchor.
    clickWithShift(rowFor('m-4').nativeElement as HTMLElement);
    expect([...component.selectedUlbs().keys()].sort()).toEqual(['m-1']);
  });

  it('never reaches rows on another page: a new page drops the shift-click anchor', async () => {
    await setup(manyOptions(45));

    checkboxFor('m-1').click();
    fixture.detectChanges();
    component.goToPage(2);
    fixture.detectChanges();
    clickWithShift(checkboxFor('m-25'));

    // Only the clicked row: the anchor stayed on page 1.
    expect([...component.selectedUlbs().keys()].sort()).toEqual(['m-1', 'm-25']);
  });

  it('a filter change drops the shift-click anchor too', async () => {
    await setup(manyOptions(6));

    checkboxFor('m-1').click();
    fixture.detectChanges();
    component.setEligibilityFilter('ELIGIBLE');
    fixture.detectChanges();
    clickWithShift(checkboxFor('m-4'));

    expect([...component.selectedUlbs().keys()].sort()).toEqual(['m-1', 'm-4']);
  });

  it('stops a shift-click from selecting the text between rows, but leaves plain text selection alone', () => {
    const row = rowFor('ulb-1').nativeElement as HTMLElement;
    const shiftDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, shiftKey: true });
    const plainDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    row.dispatchEvent(shiftDown);
    row.dispatchEvent(plainDown);

    expect(shiftDown.defaultPrevented).toBe(true);
    expect(plainDown.defaultPrevented).toBe(false);
  });

  // ─── Header checkbox and the select-all bar ───────────────────────────────────

  function headerCheckbox(): HTMLInputElement {
    return byCy('claim-letter-ulb-picker-select-page') as HTMLInputElement;
  }

  it('the header checkbox ticks and unticks the selectable rows on this page, and shows a partial state', () => {
    component.toggle(options[0]);
    fixture.detectChanges();
    // Only Alpha is selectable here, so ticking it fills the page.
    expect(headerCheckbox().checked).toBe(true);

    headerCheckbox().click();
    fixture.detectChanges();
    expect(component.selectedCount()).toBe(0);
    expect(headerCheckbox().checked).toBe(false);
  });

  it('shows the header checkbox as partly checked when only some page rows are ticked', async () => {
    await setup(manyOptions(5));
    component.toggle(component.allOptions()[0]);
    fixture.detectChanges();
    expect(headerCheckbox().indeterminate).toBe(true);
    expect(headerCheckbox().checked).toBe(false);
  });

  it('disables the header checkbox when the page has nothing selectable', () => {
    component.setEligibilityFilter('INELIGIBLE');
    fixture.detectChanges();
    expect(headerCheckbox().disabled).toBe(true);
  });

  it('after the page is ticked, offers every eligible ULB across pages, with an exact count', async () => {
    const list = [
      ...manyOptions(45),
      makeOption('x-ineligible', 'ZZ Ineligible', { eligible: false, ineligibleReasonCode: 'X' }),
    ];
    await setup(list, { ...baseData, excludeUlbIds: ['m-44'] });

    headerCheckbox().click();
    fixture.detectChanges();
    expect(component.selectedCount()).toBe(20);
    expect(byCy('claim-letter-ulb-picker-select-all-bar')?.textContent).toContain(
      'All 20 eligible ULBs on this page are selected.',
    );

    const selectAll = byCy('claim-letter-ulb-picker-select-all') as HTMLButtonElement;
    expect(selectAll.textContent?.trim()).toBe('Select all 44 eligible ULBs');
    selectAll.click();
    fixture.detectChanges();

    expect(component.selectedCount()).toBe(44);
    expect(component.isSelected('m-44')).toBe(false); // already added
    expect(component.isSelected('x-ineligible')).toBe(false);
    expect(byCy('claim-letter-ulb-picker-select-all-bar')?.textContent).toContain('All 44 eligible ULBs are selected.');

    const clear = byCy('claim-letter-ulb-picker-clear-selection') as HTMLButtonElement;
    expect(clear.textContent?.trim()).toBe('Clear these 44');
    clear.click();
    fixture.detectChanges();
    expect(component.selectedCount()).toBe(0);
  });

  it('"Clear these N" clears only the matching set; "Clear all" clears the rest', fakeAsync(() => {
    const north = manyOptions(25, 'n').map((o) => ({ ...o, ulbName: `North ${o.ulbName}` }));
    const south = manyOptions(5, 's').map((o) => ({ ...o, ulbName: `South ${o.ulbName}` }));
    component.allOptions.set([...north, ...south]);
    component.toggle(south[0]);

    component.search.setValue('north');
    tick(150);
    fixture.detectChanges();
    headerCheckbox().click();
    fixture.detectChanges();
    (byCy('claim-letter-ulb-picker-select-all') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.selectedCount()).toBe(26);

    const clear = byCy('claim-letter-ulb-picker-clear-selection') as HTMLButtonElement;
    expect(clear.textContent?.trim()).toBe('Clear these 25');
    clear.click();
    fixture.detectChanges();
    expect([...component.selectedUlbs().keys()]).toEqual(['s-0']);

    (byCy('claim-letter-ulb-picker-clear-all') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.selectedCount()).toBe(0);
    expect(byCy('claim-letter-ulb-picker-clear-all')).toBeNull();
  }));

  it('select all follows the current search, and keeps earlier picks', fakeAsync(() => {
    const north = manyOptions(25, 'n').map((o) => ({ ...o, ulbName: `North ${o.ulbName}` }));
    const south = manyOptions(5, 's').map((o) => ({ ...o, ulbName: `South ${o.ulbName}` }));
    component.allOptions.set([...north, ...south]);
    component.toggle(south[0]);

    component.search.setValue('north');
    tick(150);
    fixture.detectChanges();
    headerCheckbox().click();
    fixture.detectChanges();

    const selectAll = byCy('claim-letter-ulb-picker-select-all') as HTMLButtonElement;
    expect(selectAll.textContent?.trim()).toBe('Select all 25 eligible ULBs matching "north"');
    selectAll.click();

    expect(component.selectedCount()).toBe(26);
    expect(component.isSelected('s-0')).toBe(true);
  }));

  it('shows no bar when every selectable row fits on this page', () => {
    component.toggle(options[0]);
    fixture.detectChanges();
    expect(component.selectAllBar()).toBeNull();
    expect(byCy('claim-letter-ulb-picker-select-all')).toBeNull();
  });

  // ─── Footer ───────────────────────────────────────────────────────────────────

  it('shows the count, the total allocation and how many rely on an exemption under review', async () => {
    await setup([
      makeOption('a', 'A', { allocationAmount: 1_00_00_000 }),
      makeOption('b', 'B', {
        allocationAmount: 50_00_000,
        exemptionNotes: [{ label: 'SLB', status: 'UNDER_REVIEW' }],
      }),
    ]);
    const countText = () => byCy('claim-letter-ulb-picker-selected-count')?.textContent ?? '';
    expect(countText()).toContain('0 ULBs selected');
    expect(byCy('claim-letter-ulb-picker-selected-total')).toBeNull();

    component.selectAllInView();
    fixture.detectChanges();

    expect(countText()).toContain('2 ULBs selected');
    expect(component.selectedTotalAmount()).toBe(1_50_00_000);
    expect(byCy('claim-letter-ulb-picker-selected-total')).not.toBeNull();
    expect(byCy('claim-letter-ulb-picker-under-review-count')?.textContent?.trim()).toBe(
      '· 1 relies on an exemption under review',
    );
  });

  it('Add selected ULBs is disabled at zero selections, and confirm runs once', () => {
    const confirmButton = () => byCy('claim-letter-ulb-picker-confirm') as HTMLButtonElement;
    expect(confirmButton().disabled).toBe(true);

    component.toggle(options[0]);
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(false);

    component.confirm();
    component.confirm();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('cancel and the close icon return no result', () => {
    component.toggle(options[0]);
    fixture.debugElement.query(By.css('button[aria-label="Close dialog"]')).nativeElement.click();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  // ─── Final batch note ─────────────────────────────────────────────────────────

  it('on the final batch, notes the eligible ULBs not yet added and the ineligible ones in no batch', async () => {
    const inBatch = makeOption('ulb-4', 'Delta ULB', { eligible: false, claimedInBatch: { batchNumber: 1 } });
    await setup([...options, inBatch], { ...baseData, isFinalBatch: true });

    expect(byCy('claim-letter-ulb-picker-final-batch-note')?.textContent?.trim()).toBe(
      'This is the final batch. It can be submitted only when every ULB is in a batch: ' +
        '1 eligible ULB is not yet added, and 1 ineligible ULB is in no batch.',
    );
  });

  it('counts a ULB ticked here as added in the final batch note', async () => {
    await setup(options, { ...baseData, isFinalBatch: true });

    component.toggle(options[0]);
    fixture.detectChanges();

    expect(byCy('claim-letter-ulb-picker-final-batch-note')?.textContent?.trim()).toBe(
      'This is the final batch. It can be submitted only when every ULB is in a batch: 1 ineligible ULB is in no batch.',
    );
  });

  it('shows no final batch note on other batches, or when nothing is left out', async () => {
    expect(byCy('claim-letter-ulb-picker-final-batch-note')).toBeNull();

    await setup([options[1]], { ...baseData, isFinalBatch: true });
    expect(byCy('claim-letter-ulb-picker-final-batch-note')).toBeNull();
  });

  // ─── Badges and tooltips ──────────────────────────────────────────────────────

  function tooltipMessageFor(ulbId: string): string {
    return rowFor(ulbId).query(By.directive(MatTooltip)).injector.get(MatTooltip).message;
  }

  it('shows the failing form(s) when the backend supplies ineligibleReasonDetail, else the humanized code', async () => {
    expect(tooltipMessageFor('ulb-3')).toBe('Form Status 3 Not Accepted');

    await setup([
      makeOption('ulb-3', 'Gamma ULB', {
        eligible: false,
        ineligibleReasonCode: 'ULB_LEVEL_ELIGIBILITY_CRITERIA_NOT_MET',
        ineligibleReasonDetail: 'SLB eligibility criteria not met',
      }),
    ]);
    expect(tooltipMessageFor('ulb-3')).toBe('SLB eligibility criteria not met');
  });

  const claimedOption = (claimedInBatch: ClaimLetterUlbOption['claimedInBatch']) =>
    makeOption('ulb-9', 'Bicholim Municipality', {
      eligible: false,
      ineligibleReasonCode: 'ALREADY_LOCKED_IN_ANOTHER_CLAIM',
      claimedInBatch,
    });

  it('shows "In Batch #N" for a ULB in another batch, unselectable and named in its checkbox label', async () => {
    await setup([claimedOption({ batchNumber: 2 })]);
    const row = rowFor('ulb-9');

    const badge = row.query(By.css('[data-cy="claim-letter-ulb-picker-claimed-badge"]'));
    expect((badge.nativeElement as HTMLElement).textContent?.trim()).toBe('In Batch #2');
    expect(badge.injector.get(MatTooltip).message).toBe('Already in Claim Batch #2');
    expect((row.nativeElement as HTMLElement).textContent).not.toContain('Ineligible');
    expect(checkboxFor('ulb-9').disabled).toBeTrue();
    expect(checkboxFor('ulb-9').getAttribute('aria-label')).toBe('Bicholim Municipality is already in Batch #2');
  });

  it('says "In another batch" when the batch number is unknown', async () => {
    await setup([claimedOption({ batchNumber: null })]);
    const badge = rowFor('ulb-9').query(By.css('[data-cy="claim-letter-ulb-picker-claimed-badge"]'));
    expect((badge.nativeElement as HTMLElement).textContent?.trim()).toBe('In another batch');
    expect(badge.injector.get(MatTooltip).message).toBe('Already in another claim batch');
  });

  it('keeps the "Ineligible" badge and label for a ULB that is not in another batch', () => {
    expect(rowFor('ulb-3').query(By.css('[data-cy="claim-letter-ulb-picker-claimed-badge"]'))).toBeNull();
    expect((rowFor('ulb-3').nativeElement as HTMLElement).textContent).toContain('Ineligible');
    expect(checkboxFor('ulb-3').getAttribute('aria-label')).toBe('Gamma ULB cannot be selected');
  });

  it('shows both tips on one line above the table, with its info icon, and none below it', () => {
    const tips = byCy('claim-letter-ulb-picker-tips');
    expect(tips?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Tips: hover a status pill for details \u00b7 Shift+click to select a range',
    );
    expect(tips?.querySelector('i.bi-info-circle')).not.toBeNull();
    expect(byCy('claim-letter-ulb-picker-select-all-bar')?.contains(tips)).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Tip: hold Shift');
  });

  it('gives the tips line over to the select-all offer once the page is ticked', async () => {
    await setup(manyOptions(45));

    (byCy('claim-letter-ulb-picker-select-page') as HTMLInputElement).click();
    fixture.detectChanges();

    expect(byCy('claim-letter-ulb-picker-tips')).toBeNull();
    expect(byCy('claim-letter-ulb-picker-select-all')).not.toBeNull();
  });

  it('centres the Eligibility header and its badges', () => {
    const header = fixture.debugElement
      .queryAll(By.css('th'))
      .find((th) => (th.nativeElement as HTMLElement).textContent?.trim() === 'Eligibility');
    expect((header?.nativeElement as HTMLElement).classList).toContain('text-center');
    const badgeCell = (rowFor('ulb-1').nativeElement as HTMLElement).querySelector('.badge')?.closest('td');
    expect(badgeCell?.classList).toContain('text-center');
  });
});
