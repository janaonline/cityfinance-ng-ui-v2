import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { UploadDocumentsComponent } from './upload-documents.component';
import {
  UlbFormsDialogComponent,
  ULB_FORMS_DIALOG_PANEL_CLASS,
  type UlbFormsDialogData,
} from './ulb-forms-dialog.component';

export const uploadDocumentsDeactivateGuard: CanDeactivateFn<UploadDocumentsComponent> = async (component) => {
  if (!component.hasUnsavedUploads()) return true;

  const dialog = inject(MatDialog);

  const data: UlbFormsDialogData = {
    title: 'Verification in progress',
    icon: { name: 'hourglass_top', color: '#d97706' },
    description:
      'Some of your documents are still being verified. Your files are already saved — verification will continue in the background. You can check the status when you return.',
    buttonLayout: 'column',
    buttons: [
      { label: 'Stay and wait', result: 'stay', variant: 'flat' },
      { label: 'Leave anyway', result: 'leave', variant: 'stroked' },
    ],
  };

  const result = await firstValueFrom(
    dialog
      .open<
        UlbFormsDialogComponent,
        UlbFormsDialogData,
        string
      >(UlbFormsDialogComponent, { data, disableClose: true, width: '460px', maxWidth: '95vw', maxHeight: '90vh', panelClass: ULB_FORMS_DIALOG_PANEL_CLASS })
      .afterClosed(),
  );

  return result === 'leave';
};
