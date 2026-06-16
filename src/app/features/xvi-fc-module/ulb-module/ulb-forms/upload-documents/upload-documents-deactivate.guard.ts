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

export const uploadDocumentsDeactivateGuard: CanDeactivateFn<UploadDocumentsComponent> = async (
  component,
) => {
  if (!component.hasUnsavedUploads()) return true;

  const dialog = inject(MatDialog);

  const data: UlbFormsDialogData = {
    title: 'Unsaved uploads',
    icon: { name: 'cloud_upload', color: '#f59e0b' },
    description:
      "You have uploaded documents that haven't been saved yet. If you leave now, your progress will be lost. Would you like to save and continue later?",
    buttonLayout: 'column',
    buttons: [
      { label: 'Save and continue later', result: 'save', variant: 'flat' },
      { label: 'Leave without saving',    result: 'leave', variant: 'stroked' },
      { label: 'Cancel — stay on this page', result: 'cancel', variant: 'text' },
    ],
  };

  const result = await firstValueFrom(
    dialog
      .open<UlbFormsDialogComponent, UlbFormsDialogData, string>(
        UlbFormsDialogComponent,
        { data, disableClose: true, width: '460px', maxWidth: '95vw', maxHeight: '90vh', panelClass: ULB_FORMS_DIALOG_PANEL_CLASS },
      )
      .afterClosed(),
  );

  if (result === 'cancel' || result === undefined) return false;
  if (result === 'save') await component.saveDraft();
  return true;
};
