import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { NoteDialogComponent, NoteDialogData } from './note-dialog.component';

/**
 * Opens a generic note-input dialog and returns the trimmed note, or `undefined`
 * if the user cancelled/dismissed (or confirmed with a blank note when not required).
 */
@Injectable({ providedIn: 'root' })
export class NoteDialogService {
  private readonly dialog = inject(MatDialog);

  prompt(data?: NoteDialogData, config?: MatDialogConfig): Observable<string | undefined> {
    return this.dialog
      .open<NoteDialogComponent, NoteDialogData, string | undefined>(NoteDialogComponent, {
        width: '480px',
        ...config,
        data: data ?? {},
      })
      .afterClosed();
  }
}
