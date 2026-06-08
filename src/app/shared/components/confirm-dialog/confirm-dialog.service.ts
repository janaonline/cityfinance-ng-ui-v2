import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

/**
 * Opens a generic confirmation dialog and returns whether the user confirmed.
 *
 * Pass an optional `MatDialogConfig` as the second argument to apply per-call
 * overrides such as `panelClass` — useful when the caller lives inside a
 * feature-scoped theme (e.g. `{ panelClass: 'xvifc-theme' }`) so the CDK
 * overlay inherits the correct Material token set.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * @param data Optional dialog content overrides (title, message, buttons, etc.).
   * @param config Optional `MatDialogConfig` merged into the dialog configuration.
   *   Use `config.panelClass` to propagate a feature theme class to the CDK overlay,
   *   e.g. `{ panelClass: 'xvifc-theme' }` when calling from a themed module.
   *   Explicit `data` always takes precedence over `config.data`.
   */
  confirm(data?: ConfirmDialogData, config?: MatDialogConfig): Observable<boolean> {
    return this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        width: '400px',
        ...config,
        data: data ?? {},
      })
      .afterClosed()
      .pipe(map((result) => result === true));
  }
}
