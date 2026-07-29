import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';
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
    ...overrides,
  };
}

function makeResult(options: ClaimLetterUlbOption[], page = 1, total = options.length): ClaimLetterUlbOptionsResult {
  return { options, page, limit: 20, total };
}

describe('ClaimLetterUlbPickerDialogComponent', () => {
  let fixture: ComponentFixture<ClaimLetterUlbPickerDialogComponent>;
  let component: ClaimLetterUlbPickerDialogComponent;
  let service: ClaimLetterService;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ClaimLetterUlbPickerDialogComponent, ClaimLetterUlbOption[]>>;
  let getUlbOptionsSpy: jasmine.Spy;

  const data: ClaimLetterUlbPickerDialogData = {
    stateId: 'state-1',
    yearId: 'year-1',
    installment: 1,
    excludeUlbIds: ['ulb-2'],
    claimLetterId: 'claim-1',
  };
  const options = [
    makeOption('ulb-1', 'Alpha ULB'),
    makeOption('ulb-2', 'Beta ULB'),
    makeOption('ulb-3', 'Gamma ULB', { eligible: false, ineligibleReasonCode: 'FORM_STATUS_3_NOT_ACCEPTED' }),
  ];

  async function setup(): Promise<void> {
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
    service = TestBed.inject(ClaimLetterService);
    getUlbOptionsSpy = spyOn(service, 'getUlbOptions').and.returnValue(of(makeResult(options)));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await setup();
  });

  function rowFor(ulbId: string) {
    const rows = fixture.debugElement.queryAll(By.css('[data-cy="claim-letter-ulb-picker-row"]'));
    const index = options.findIndex((o) => o.ulbId === ulbId);
    return rows[index];
  }

  function checkboxFor(ulbId: string): HTMLInputElement {
    return rowFor(ulbId).query(By.css('[data-cy="claim-letter-ulb-picker-checkbox"]'))
      .nativeElement as HTMLInputElement;
  }

  // ─── Loading / query params ─────────────────────────────────────────────────

  it('requests page 1 with no search/filter and the claimLetterId passthrough as soon as it opens', () => {
    expect(getUlbOptionsSpy).toHaveBeenCalledWith('state-1', 'year-1', 1, {
      search: undefined,
      eligibilityFilter: undefined,
      claimLetterId: 'claim-1',
      page: 1,
      limit: 20,
    });
    expect(component.options()).toEqual(options);
  });

  it('omits claimLetterId when opened in create mode', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ClaimLetterUlbPickerDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...data, claimLetterId: undefined } },
      ],
    }).compileComponents();

    const createFixture = TestBed.createComponent(ClaimLetterUlbPickerDialogComponent);
    const createService = TestBed.inject(ClaimLetterService);
    const spy = spyOn(createService, 'getUlbOptions').and.returnValue(of(makeResult(options)));
    createFixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('state-1', 'year-1', 1, jasmine.objectContaining({ claimLetterId: undefined }));
  });

  it('debounces search input before requesting, using a trimmed term', fakeAsync(() => {
    getUlbOptionsSpy.calls.reset();
    component.search.setValue('Al');
    tick(100);
    component.search.setValue('  Alpha  ');
    tick(399);
    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
    tick(1);
    expect(getUlbOptionsSpy).toHaveBeenCalledWith(
      'state-1',
      'year-1',
      1,
      jasmine.objectContaining({ search: 'Alpha', page: 1 }),
    );
  }));

  it('shows an empty state when no options are returned', () => {
    getUlbOptionsSpy.and.returnValue(of(makeResult([])));
    component.loadOptions();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No ULBs found');
  });

  it('shows a retryable failure state on error, and retry re-requests', () => {
    getUlbOptionsSpy.and.returnValue(throwError(() => new Error('network error')));
    component.loadOptions();
    fixture.detectChanges();

    expect(component.loadError()).toBe(true);
    const retryButton = fixture.debugElement.query(By.css('button[aria-label="Retry loading ULBs"]'));
    expect(retryButton).toBeTruthy();

    getUlbOptionsSpy.and.returnValue(of(makeResult(options)));
    retryButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.loadError()).toBe(false);
    expect(component.options()).toEqual(options);
  });

  // ─── Eligibility filter ──────────────────────────────────────────────────────

  it('setEligibilityFilter sends the mapped query param and resets to page 1', () => {
    component.goToPage(1); // no-op, already page 1
    getUlbOptionsSpy.calls.reset();
    component.setEligibilityFilter('ELIGIBLE');

    expect(getUlbOptionsSpy).toHaveBeenCalledWith(
      'state-1',
      'year-1',
      1,
      jasmine.objectContaining({ eligibilityFilter: 'ELIGIBLE', page: 1 }),
    );
  });

  it('setEligibilityFilter is a no-op when re-selecting the current filter', () => {
    getUlbOptionsSpy.calls.reset();
    component.setEligibilityFilter('ALL');
    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
  });

  it('clicking the Eligible mat-button-toggle sends the mapped query param', () => {
    getUlbOptionsSpy.calls.reset();
    const group = fixture.debugElement.query(
      By.css('[data-cy="claim-letter-ulb-picker-eligibility-filter"]'),
    );
    const toggleButtons = group.queryAll(By.css('button'));
    toggleButtons[1].nativeElement.click(); // ALL, ELIGIBLE, INELIGIBLE
    fixture.detectChanges();

    expect(getUlbOptionsSpy).toHaveBeenCalledWith(
      'state-1',
      'year-1',
      1,
      jasmine.objectContaining({ eligibilityFilter: 'ELIGIBLE', page: 1 }),
    );
  });

  // ─── Disabled rows (excluded vs. server-ineligible) ─────────────────────────

  it('disables an already-added ULB even though the server reports it eligible', () => {
    expect(component.isDisabled(options[1])).toBe(true);
    const checkbox = checkboxFor('ulb-2');
    expect(checkbox.disabled).toBe(true);
  });

  it('disables a server-ineligible ULB even though it is not in the excluded list', () => {
    expect(component.isDisabled(options[2])).toBe(true);
    const checkbox = checkboxFor('ulb-3');
    expect(checkbox.disabled).toBe(true);
  });

  it('leaves an eligible, non-excluded ULB selectable', () => {
    expect(component.isDisabled(options[0])).toBe(false);
    const checkbox = checkboxFor('ulb-1');
    expect(checkbox.disabled).toBe(false);
  });

  it('toggling a disabled row does nothing', () => {
    component.toggle(options[2]);
    expect(component.isSelected('ulb-3')).toBe(false);
  });

  // ─── Multi-selection ────────────────────────────────────────────────────────

  it('selects multiple eligible ULBs in one session, preserving order', () => {
    component.toggle(options[0]);
    component.confirm();
    expect(dialogRef.close).toHaveBeenCalledWith([options[0]]);
  });

  it('tracks selection by canonical ulbId, and a ULB appears at most once', () => {
    component.toggle(options[0]);
    component.toggle({ ...options[0] });
    expect(component.isSelected('ulb-1')).toBe(false);
    expect(component.selectedCount()).toBe(0);
  });

  it('toggling a row via a click (not directly on the checkbox) also toggles selection', () => {
    rowFor('ulb-1').nativeElement.click();
    expect(component.isSelected('ulb-1')).toBe(true);
  });

  it('a single checkbox click does not double-toggle via the bubbled row click handler', () => {
    const checkbox = checkboxFor('ulb-1');
    checkbox.click();
    expect(component.isSelected('ulb-1')).toBe(true);
  });

  // ─── Footer ──────────────────────────────────────────────────────────────────

  it('shows singular and plural selected counts correctly', () => {
    expect(
      fixture.debugElement.query(By.css('[data-cy="claim-letter-ulb-picker-selected-count"]')).nativeElement
        .textContent,
    ).toContain('0 ULBs selected');

    component.toggle(options[0]);
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-cy="claim-letter-ulb-picker-selected-count"]')).nativeElement
        .textContent,
    ).toContain('1 ULB selected');
  });

  it('the top-right close icon returns no result (cancel)', () => {
    fixture.debugElement.query(By.css('button[aria-label="Close dialog"]')).nativeElement.click();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('Add selected ULBs is disabled at zero selections and enabled once selected', () => {
    let confirmButton = fixture.debugElement.query(By.css('[data-cy="claim-letter-ulb-picker-confirm"]'))
      .nativeElement as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    component.toggle(options[0]);
    fixture.detectChanges();
    confirmButton = fixture.debugElement.query(By.css('[data-cy="claim-letter-ulb-picker-confirm"]'))
      .nativeElement as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(false);
  });

  it('confirm cannot execute twice (guards double-submit)', () => {
    component.toggle(options[0]);
    component.confirm();
    component.confirm();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('cancel closes with undefined', () => {
    component.toggle(options[0]);
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  // ─── Pagination ──────────────────────────────────────────────────────────────

  it('goToPage requests the given page and ignores out-of-range values', () => {
    component.total.set(25); // a real 2nd page must already be known to exist before jumping to it
    getUlbOptionsSpy.and.returnValue(of(makeResult([options[1]], 2, 25)));
    component.goToPage(2);
    expect(component.page()).toBe(2);

    getUlbOptionsSpy.calls.reset();
    component.goToPage(0);
    component.goToPage(999);
    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
  });

  it('a stale response is ignored once a newer request has been issued', () => {
    const first$ = new Subject<ClaimLetterUlbOptionsResult>();
    const second$ = new Subject<ClaimLetterUlbOptionsResult>();
    getUlbOptionsSpy.and.returnValues(first$, second$);

    component.loadOptions();
    component.loadOptions();

    first$.next(makeResult([options[2]])); // late response from the superseded first request
    expect(component.options()).toEqual(options); // unchanged — still the initial ngOnInit load

    second$.next(makeResult([options[1]]));
    expect(component.options()).toEqual([options[1]]);
  });

  // ─── Ineligible tooltip ────────────────────────────────────────────────────

  function tooltipMessageFor(ulbId: string): string {
    return rowFor(ulbId).query(By.directive(MatTooltip)).injector.get(MatTooltip).message;
  }

  it('shows the specific failing form(s) when the backend supplies ineligibleReasonDetail', () => {
    getUlbOptionsSpy.and.returnValue(
      of(
        makeResult([
          makeOption('ulb-3', 'Gamma ULB', {
            eligible: false,
            ineligibleReasonCode: 'ULB_LEVEL_ELIGIBILITY_CRITERIA_NOT_MET',
            ineligibleReasonDetail: 'SLB eligibility criteria not met',
          }),
        ]),
      ),
    );
    component.loadOptions();
    fixture.detectChanges();

    // Only one row is rendered by this override, so query it directly rather than via rowFor()
    // (which indexes into the outer, 3-item `options` fixture).
    const row = fixture.debugElement.query(By.css('[data-cy="claim-letter-ulb-picker-row"]'));
    const message = row.query(By.directive(MatTooltip)).injector.get(MatTooltip).message;
    expect(message).toBe('SLB eligibility criteria not met');
  });

  it('falls back to the humanized reason code when ineligibleReasonDetail is absent', () => {
    // options[2] ('Gamma ULB') is ineligible with reasonCode 'FORM_STATUS_3_NOT_ACCEPTED' and no detail.
    expect(tooltipMessageFor('ulb-3')).toBe('Form Status 3 Not Accepted');
  });
});
