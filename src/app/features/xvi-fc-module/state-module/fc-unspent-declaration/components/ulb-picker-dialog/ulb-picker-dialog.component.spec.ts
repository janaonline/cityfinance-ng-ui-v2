import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';
import { FcUnspentUlbOption, FcUnspentUlbOptionsResult } from '../../fc-unspent-declaration.models';
import { FcUnspentDeclarationService } from '../../fc-unspent-declaration.service';
import { FcUnspentUlbOptionsCacheService } from '../../fc-unspent-ulb-options-cache.service';
import { UlbPickerDialogComponent, UlbPickerDialogData } from './ulb-picker-dialog.component';

/** Every subsequent `it` shares the outer `beforeEach`'s already-populated page-1/no-search cache
 *  entry — tests that want to simulate a genuinely new network round-trip for that same query must
 *  clear it first, exactly as a real cache invalidation (e.g. `reloadForm()`) would. */
function clearCache(): void {
  TestBed.inject(FcUnspentUlbOptionsCacheService).clear();
}

function makeOption(id: string, name: string): FcUnspentUlbOption {
  return { ulbId: id, censusCode: `800${id}`, sbCode: null, ulbName: name, allocationAmount: 10 };
}

function makeResult(options: FcUnspentUlbOption[], page = 1, total = options.length): FcUnspentUlbOptionsResult {
  return { options, page, limit: 20, total };
}

describe('UlbPickerDialogComponent', () => {
  let fixture: ComponentFixture<UlbPickerDialogComponent>;
  let component: UlbPickerDialogComponent;
  let service: FcUnspentDeclarationService;
  let dialogRef: jasmine.SpyObj<MatDialogRef<UlbPickerDialogComponent, FcUnspentUlbOption[]>>;
  let getUlbOptionsSpy: jasmine.Spy;

  const data: UlbPickerDialogData = {
    stateId: 'state-1',
    yearId: 'year-1',
    excludeUlbIds: ['ulb-2'],
    blockingMessage: null,
  };
  const options = [makeOption('ulb-1', 'Alpha ULB'), makeOption('ulb-2', 'Beta ULB'), makeOption('ulb-3', 'Gamma ULB')];

  async function setup(): Promise<void> {
    dialogRef = jasmine.createSpyObj<MatDialogRef<UlbPickerDialogComponent, FcUnspentUlbOption[]>>('MatDialogRef', [
      'close',
    ]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UlbPickerDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        FcUnspentUlbOptionsCacheService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UlbPickerDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FcUnspentDeclarationService);
    getUlbOptionsSpy = spyOn(service, 'getUlbOptions').and.returnValue(of(makeResult(options)));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await setup();
  });

  function checkboxFor(ulbId: string): HTMLInputElement {
    const rows = fixture.debugElement.queryAll(By.css('[data-cy="ulb-picker-row"]'));
    const index = options.findIndex((o) => o.ulbId === ulbId);
    return rows[index].query(By.css('[data-cy="ulb-picker-checkbox"]')).nativeElement as HTMLInputElement;
  }

  // ─── Loading / pagination / debounce (existing behavior, preserved) ────────

  it('requests page 1 with no search as soon as it opens', () => {
    expect(getUlbOptionsSpy).toHaveBeenCalledWith('state-1', 'year-1', { search: undefined, page: 1, limit: 20 });
    expect(component.options()).toEqual(options);
  });

  it('debounces search input before requesting, using a trimmed+lowercased term', fakeAsync(() => {
    getUlbOptionsSpy.calls.reset();
    component.search.setValue('Al');
    tick(100);
    component.search.setValue('  ALPHA  ');
    tick(399);
    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
    tick(1);
    expect(getUlbOptionsSpy).toHaveBeenCalledWith('state-1', 'year-1', { search: 'alpha', page: 1, limit: 20 });
  }));

  it('shows a loading state while the request is in flight', () => {
    clearCache(); // otherwise this exact query would be a synchronous cache hit, never "in flight"
    const pending$ = new Subject<FcUnspentUlbOptionsResult>();
    getUlbOptionsSpy.and.returnValue(pending$);
    component.loadOptions();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(fixture.debugElement.query(By.css('.spinner-border'))).toBeTruthy();
  });

  it('shows an empty state when no options are returned', () => {
    clearCache(); // otherwise the already-cached (non-empty) page-1 result would be reused
    getUlbOptionsSpy.and.returnValue(of(makeResult([])));
    component.loadOptions();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No ULBs found');
  });

  it('shows the blocking message instead of the generic empty-state text when one is provided', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UlbPickerDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...data, blockingMessage: 'Devolution Formula must be submitted first.' },
        },
        FcUnspentUlbOptionsCacheService,
      ],
    }).compileComponents();

    const blockedFixture = TestBed.createComponent(UlbPickerDialogComponent);
    const blockedService = TestBed.inject(FcUnspentDeclarationService);
    spyOn(blockedService, 'getUlbOptions').and.returnValue(of(makeResult([])));
    blockedFixture.detectChanges();

    expect(blockedFixture.nativeElement.textContent).toContain('Devolution Formula must be submitted first.');
    expect(blockedFixture.nativeElement.textContent).not.toContain('No ULBs found');
  });

  it('shows a retryable failure state on error, and retry re-requests', () => {
    clearCache(); // otherwise the already-cached success result would be reused instead of erroring
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

  // ─── Multi-selection ────────────────────────────────────────────────────────

  it('selecting one ULB does not close the dialog', () => {
    component.toggle(options[0]);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('selects multiple ULBs in one session', () => {
    component.toggle(options[0]);
    component.toggle(options[2]);

    expect(component.selectedCount()).toBe(2);
    expect(component.isSelected('ulb-1')).toBe(true);
    expect(component.isSelected('ulb-3')).toBe(true);
  });

  it('tracks selection by canonical ulbId, and a ULB appears at most once', () => {
    component.toggle(options[0]);
    component.toggle({ ...options[0] }); // a structurally-different object, same ulbId — toggles off
    expect(component.isSelected('ulb-1')).toBe(false);
    expect(component.selectedCount()).toBe(0);
  });

  it('deselecting removes the ULB from the count and result', () => {
    component.toggle(options[0]);
    component.toggle(options[0]);
    expect(component.selectedCount()).toBe(0);
  });

  it('preserves selection order, appending a re-selected ULB at the end', () => {
    component.toggle(options[0]); // select ulb-1
    component.toggle(options[2]); // select ulb-3
    component.toggle(options[0]); // deselect ulb-1
    component.toggle(options[0]); // re-select ulb-1 — now last

    component.confirm();

    expect(dialogRef.close).toHaveBeenCalledWith([options[2], options[0]]);
  });

  it('preserves selection across a search change', fakeAsync(() => {
    component.toggle(options[0]);
    getUlbOptionsSpy.and.returnValue(of(makeResult([options[1]])));
    component.search.setValue('beta');
    tick(400);

    expect(component.isSelected('ulb-1')).toBe(true);
    expect(component.selectedCount()).toBe(1);
  }));

  it('preserves selection across a page change and shows correct checked state on return', () => {
    component.toggle(options[0]);

    getUlbOptionsSpy.and.returnValue(of(makeResult([options[1]], 2, 25)));
    component.goToPage(2);
    expect(component.isSelected('ulb-1')).toBe(true);

    // Page 1 is already cached from the initial load, so returning to it is a cache hit — the
    // selection must still be reflected in the (cached) page's checked state.
    component.goToPage(1);
    fixture.detectChanges();

    expect(component.isSelected('ulb-1')).toBe(true);
    const checkbox = checkboxFor('ulb-1');
    expect(checkbox.checked).toBe(true);
  });

  it('preserves selection across a failed request and its retry', () => {
    component.toggle(options[0]);

    clearCache(); // force a genuine network round-trip so the error mock is actually exercised
    getUlbOptionsSpy.and.returnValue(throwError(() => new Error('network error')));
    component.loadOptions();
    expect(component.loadError()).toBe(true);
    expect(component.isSelected('ulb-1')).toBe(true);

    getUlbOptionsSpy.and.returnValue(of(makeResult(options)));
    component.loadOptions();
    expect(component.isSelected('ulb-1')).toBe(true);
  });

  it('does not clear a selection just because the current search result omits it', fakeAsync(() => {
    component.toggle(options[0]);
    getUlbOptionsSpy.and.returnValue(of(makeResult([options[2]])));
    component.search.setValue('gamma');
    tick(400);

    expect(component.options()).toEqual([options[2]]);
    expect(component.isSelected('ulb-1')).toBe(true);
  }));

  it('never issues an API call merely from toggling a checkbox', () => {
    getUlbOptionsSpy.calls.reset();
    component.toggle(options[0]);
    component.toggle(options[2]);
    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
  });

  it('keeps an already-added ULB non-selectable', () => {
    expect(component.isExcluded('ulb-2')).toBe(true);
    component.toggle(options[1]);
    expect(component.isSelected('ulb-2')).toBe(false);

    fixture.detectChanges();
    const checkbox = checkboxFor('ulb-2');
    expect(checkbox.disabled).toBe(true);
  });

  it('toggling a row via a click (not directly on the checkbox) also toggles selection', () => {
    const rows = fixture.debugElement.queryAll(By.css('[data-cy="ulb-picker-row"]'));
    rows[0].nativeElement.click();
    expect(component.isSelected('ulb-1')).toBe(true);
  });

  it('a single checkbox click does not double-toggle via the bubbled row click handler', () => {
    // A real click on a checkbox fires both a native 'click' (which bubbles to the row's own click
    // handler) and a native 'change' event. If the row handler didn't recognise the click originated
    // on the checkbox, this single click would toggle twice and cancel itself out.
    const checkbox = checkboxFor('ulb-1');
    checkbox.click();
    expect(component.isSelected('ulb-1')).toBe(true);
  });

  // ─── Footer ──────────────────────────────────────────────────────────────────

  it('shows singular and plural selected counts correctly', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-cy="ulb-picker-selected-count"]')).nativeElement.textContent).toContain(
      '0 ULBs selected',
    );

    component.toggle(options[0]);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-cy="ulb-picker-selected-count"]')).nativeElement.textContent).toContain(
      '1 ULB selected',
    );

    component.toggle(options[2]);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-cy="ulb-picker-selected-count"]')).nativeElement.textContent).toContain(
      '2 ULBs selected',
    );
  });

  it('has no redundant secondary Close/Cancel button in the footer', () => {
    const actions = fixture.debugElement.query(By.css('mat-dialog-actions'));
    const closeLikeButtons = actions.queryAll(By.css('button')).filter((btn) =>
      /close|cancel/i.test(btn.nativeElement.textContent ?? ''),
    );
    expect(closeLikeButtons.length).toBe(0);
  });

  it('the top-right close icon returns no result (cancel)', () => {
    fixture.debugElement.query(By.css('button[aria-label="Close dialog"]')).nativeElement.click();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('Add selected ULBs is disabled at zero selections', () => {
    fixture.detectChanges();
    const confirmButton = fixture.debugElement.query(By.css('[data-cy="ulb-picker-confirm"]'))
      .nativeElement as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
  });

  it('Add selected ULBs becomes enabled once at least one ULB is selected', () => {
    component.toggle(options[0]);
    fixture.detectChanges();
    const confirmButton = fixture.debugElement.query(By.css('[data-cy="ulb-picker-confirm"]'))
      .nativeElement as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(false);
  });

  it('confirm returns one typed array in deterministic selection order', () => {
    component.toggle(options[2]);
    component.toggle(options[0]);
    component.confirm();

    expect(dialogRef.close).toHaveBeenCalledWith([options[2], options[0]]);
  });

  it('confirm cannot execute twice (guards double-submit)', () => {
    component.toggle(options[0]);
    component.confirm();
    component.confirm();

    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('confirm is a no-op at zero selections even if called directly', () => {
    component.confirm();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancel closes with undefined, leaving the selection irrelevant', () => {
    component.toggle(options[0]);
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  // ─── Cache integration ──────────────────────────────────────────────────────

  it('reuses the injected cache: repeating the same query does not re-request', () => {
    getUlbOptionsSpy.calls.reset();
    component.loadOptions(); // same stateId/yearId/search/page/limit as the initial ngOnInit load
    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
    expect(component.options()).toEqual(options);
  });

  it('degrades to an always-network call when no cache is provided', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UlbPickerDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    const noCacheFixture = TestBed.createComponent(UlbPickerDialogComponent);
    const noCacheService = TestBed.inject(FcUnspentDeclarationService);
    const spy = spyOn(noCacheService, 'getUlbOptions').and.returnValue(of(makeResult(options)));
    noCacheFixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(noCacheFixture.componentInstance.options()).toEqual(options);
  });
});
