import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';
import { FcUnspentUlbOption, FcUnspentUlbOptionsResult } from '../../fc-unspent-declaration.models';
import { FcUnspentDeclarationService } from '../../fc-unspent-declaration.service';
import { UlbPickerDialogComponent, UlbPickerDialogData } from './ulb-picker-dialog.component';

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
  let dialogRef: jasmine.SpyObj<MatDialogRef<UlbPickerDialogComponent, FcUnspentUlbOption | undefined>>;
  let getUlbOptionsSpy: jasmine.Spy;

  const data: UlbPickerDialogData = { stateId: 'state-1', yearId: 'year-1', excludeUlbIds: ['ulb-2'] };
  const options = [makeOption('ulb-1', 'Alpha ULB'), makeOption('ulb-2', 'Beta ULB'), makeOption('ulb-3', 'Gamma ULB')];

  async function setup(): Promise<void> {
    dialogRef = jasmine.createSpyObj<MatDialogRef<UlbPickerDialogComponent, FcUnspentUlbOption | undefined>>(
      'MatDialogRef',
      ['close'],
    );

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UlbPickerDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
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

  it('requests page 1 with no search as soon as it opens', () => {
    expect(getUlbOptionsSpy).toHaveBeenCalledWith('state-1', 'year-1', { search: undefined, page: 1, limit: 20 });
    expect(component.options()).toEqual(options);
  });

  it('debounces search input before requesting', fakeAsync(() => {
    getUlbOptionsSpy.calls.reset();
    component.search.setValue('Al');
    tick(100);
    component.search.setValue('Alpha');
    tick(399);
    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
    tick(1);
    expect(getUlbOptionsSpy).toHaveBeenCalledWith('state-1', 'year-1', { search: 'Alpha', page: 1, limit: 20 });
  }));

  it('resets to page 1 when a new search is entered', fakeAsync(() => {
    // Establish a total large enough that page 2 is reachable, then confirm we're actually there.
    getUlbOptionsSpy.and.returnValue(of(makeResult(options, 1, 45)));
    component.loadOptions();
    component.goToPage(2);
    expect(component.page()).toBe(2);

    getUlbOptionsSpy.and.returnValue(of(makeResult(options, 1, 3)));
    component.search.setValue('Alpha');
    tick(400);

    expect(component.page()).toBe(1);
  }));

  it('sends page/limit on pagination and exposes pagination metadata', () => {
    // Establish a total large enough (45 at limit 20 = 3 pages) that page 2 is a valid target.
    getUlbOptionsSpy.and.returnValue(of(makeResult(options, 1, 45)));
    component.loadOptions();
    expect(component.totalPages()).toBe(3);

    getUlbOptionsSpy.and.returnValue(of(makeResult([options[0]], 2, 45)));
    component.goToPage(2);

    expect(getUlbOptionsSpy).toHaveBeenCalledWith('state-1', 'year-1', { search: undefined, page: 2, limit: 20 });
    expect(component.total()).toBe(45);
    expect(component.totalPages()).toBe(3);
  });

  it('does not navigate outside the valid page range', () => {
    getUlbOptionsSpy.calls.reset();
    component.goToPage(0);
    component.goToPage(999);
    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
  });

  it('ignores a stale response that resolves after a newer request was already sent', () => {
    const first$ = new Subject<FcUnspentUlbOptionsResult>();
    const second$ = new Subject<FcUnspentUlbOptionsResult>();
    getUlbOptionsSpy.and.returnValues(first$, second$);

    component.loadOptions(); // subscribes to first$
    component.loadOptions(); // a newer request — subscribes to second$

    second$.next(makeResult([options[2]], 1, 1));
    second$.complete();
    first$.next(makeResult([options[0]], 1, 5));
    first$.complete();

    // The stale first$ response must not overwrite the newer second$ result.
    expect(component.options()).toEqual([options[2]]);
  });

  it('shows a loading state while the request is in flight', () => {
    const pending$ = new Subject<FcUnspentUlbOptionsResult>();
    getUlbOptionsSpy.and.returnValue(pending$);
    component.loadOptions();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(fixture.debugElement.query(By.css('.spinner-border'))).toBeTruthy();
  });

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

  it('disables an already-selected (excluded) ULB row and does not close on click', () => {
    fixture.detectChanges();
    expect(component.isExcluded('ulb-2')).toBe(true);

    const rows = fixture.debugElement.queryAll(By.css('[data-cy="ulb-picker-row"]'));
    const excludedButton = rows[1].query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(excludedButton.disabled).toBe(true);

    component.select(options[1]);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes with the selected option on select', () => {
    component.select(options[0]);
    expect(dialogRef.close).toHaveBeenCalledWith(options[0]);
  });

  it('closes with undefined on cancel, never mutating anything', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
