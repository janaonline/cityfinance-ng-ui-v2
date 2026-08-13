import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { LEAVE_PAGE_CONFIRM_DIALOG_DEFAULTS } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MATERIAL_THEME_CLASS } from '../theming/material-theme.providers';
import { CanComponentDeactivate, unsavedChangesGuard, warnBeforeUnloadWhenDirty } from './unsaved-changes.guard';

function buildComponent(hasUnsavedChanges: boolean): CanComponentDeactivate {
  return { hasUnsavedChanges: () => hasUnsavedChanges };
}

describe('unsavedChangesGuard', () => {
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;

  function setup(themeClass: string | null = null): void {
    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(true));

    TestBed.configureTestingModule({
      providers: [
        { provide: ConfirmDialogService, useValue: confirmDialogService },
        { provide: MATERIAL_THEME_CLASS, useValue: themeClass },
      ],
    });
  }

  function runGuard(component: CanComponentDeactivate): unknown {
    const routeSnapshot = {} as ActivatedRouteSnapshot;
    const stateSnapshot = {} as RouterStateSnapshot;

    return TestBed.runInInjectionContext(() =>
      // The route/state snapshot arguments are unused by this guard.
      unsavedChangesGuard(component, routeSnapshot, stateSnapshot, stateSnapshot),
    );
  }

  it('allows navigation immediately without opening a dialog when there are no unsaved changes', () => {
    setup();

    const result = runGuard(buildComponent(false));

    expect(result).toBe(true);
    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
  });

  it('opens the leave-page confirm dialog when there are unsaved changes', () => {
    setup();

    runGuard(buildComponent(true));

    expect(confirmDialogService.confirm).toHaveBeenCalledOnceWith(LEAVE_PAGE_CONFIRM_DIALOG_DEFAULTS, undefined);
  });

  it('forwards the scoped Material theme class as the dialog panelClass when one is provided', () => {
    setup('xvifc-theme');

    runGuard(buildComponent(true));

    expect(confirmDialogService.confirm).toHaveBeenCalledOnceWith(LEAVE_PAGE_CONFIRM_DIALOG_DEFAULTS, {
      panelClass: 'xvifc-theme',
    });
  });

  it('resolves to the dialog result — true lets navigation proceed', (done) => {
    setup();
    confirmDialogService.confirm.and.returnValue(of(true));

    const result = runGuard(buildComponent(true));

    (result as ReturnType<typeof of>).subscribe((value: unknown) => {
      expect(value).toBe(true);
      done();
    });
  });

  it('resolves to the dialog result — false blocks navigation', (done) => {
    setup();
    confirmDialogService.confirm.and.returnValue(of(false));

    const result = runGuard(buildComponent(true));

    (result as ReturnType<typeof of>).subscribe((value: unknown) => {
      expect(value).toBe(false);
      done();
    });
  });
});

describe('warnBeforeUnloadWhenDirty', () => {
  let addSpy: jasmine.Spy;
  let removeSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    addSpy = spyOn(window, 'addEventListener').and.callThrough();
    removeSpy = spyOn(window, 'removeEventListener').and.callThrough();
  });

  function buildEvent(): BeforeUnloadEvent {
    return { preventDefault: jasmine.createSpy('preventDefault') } as unknown as BeforeUnloadEvent;
  }

  it('registers a beforeunload listener', () => {
    TestBed.runInInjectionContext(() => warnBeforeUnloadWhenDirty(() => false));

    expect(addSpy).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));
  });

  it('calls preventDefault when there are unsaved changes at unload time', () => {
    TestBed.runInInjectionContext(() => warnBeforeUnloadWhenDirty(() => true));
    const handler = addSpy.calls.mostRecent().args[1] as (event: BeforeUnloadEvent) => void;
    const event = buildEvent();

    handler(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('does not call preventDefault when there are no unsaved changes', () => {
    TestBed.runInInjectionContext(() => warnBeforeUnloadWhenDirty(() => false));
    const handler = addSpy.calls.mostRecent().args[1] as (event: BeforeUnloadEvent) => void;
    const event = buildEvent();

    handler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('removes the listener when the injection context is destroyed', () => {
    TestBed.runInInjectionContext(() => warnBeforeUnloadWhenDirty(() => true));
    const handler = addSpy.calls.mostRecent().args[1];

    TestBed.resetTestingModule();

    expect(removeSpy).toHaveBeenCalledWith('beforeunload', handler);
  });
});
