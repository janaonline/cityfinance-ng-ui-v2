import { DestroyRef, inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import {
  LEAVE_PAGE_CONFIRM_DIALOG_DEFAULTS,
  themedDialogConfig,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Implemented by routed page components that hold form state a user could lose by navigating
 * away. `hasUnsavedChanges()` should be cheap and synchronous — it is read both by
 * {@link unsavedChangesGuard} on every in-app navigation attempt and by the `beforeunload`
 * listener registered through {@link warnBeforeUnloadWhenDirty}.
 */
export interface CanComponentDeactivate {
  hasUnsavedChanges(): boolean;
}

/**
 * Generic `CanDeactivate` guard: blocks in-app navigation (sidebar clicks, browser back/forward,
 * programmatic `router.navigate`) away from a page reporting unsaved changes until the user
 * confirms via the shared confirm dialog. Pages with no unsaved changes — including read-only
 * pages, since a disabled/unedited form is never dirty — navigate away immediately.
 *
 * Wire into a route as `canDeactivate: [unsavedChangesGuard]`.
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component,
): boolean | Observable<boolean> => {
  if (!component.hasUnsavedChanges()) return true;

  const confirmDialogService = inject(ConfirmDialogService);

  return confirmDialogService.confirm(LEAVE_PAGE_CONFIRM_DIALOG_DEFAULTS, themedDialogConfig());
};

/**
 * Warns on browser refresh/tab-close while `hasUnsavedChanges()` is true. Router guards never run
 * for a full page reload or tab close, so this covers that gap with the native
 * `beforeunload` prompt (browsers ignore any custom message and show their own fixed text).
 *
 * Call once from a component constructor — it requires an active injection context — for every
 * component wired to {@link unsavedChangesGuard}, passing the same predicate.
 */
export function warnBeforeUnloadWhenDirty(hasUnsavedChanges: () => boolean): void {
  const handler = (event: BeforeUnloadEvent): void => {
    if (hasUnsavedChanges()) {
      event.preventDefault();
    }
  };

  window.addEventListener('beforeunload', handler);
  inject(DestroyRef).onDestroy(() => window.removeEventListener('beforeunload', handler));
}
