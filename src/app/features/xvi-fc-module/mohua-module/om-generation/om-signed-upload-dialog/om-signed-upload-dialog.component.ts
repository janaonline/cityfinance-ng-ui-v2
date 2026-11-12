import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FileComponent } from '../../../../../shared/dynamic-form/components/file/file.component';
import { isUploadedFileMetadata } from '../../../../../shared/dynamic-form/components/file/file-metadata.types';
import { FieldConfig } from '../../../../../shared/dynamic-form/field.interface';
import { OM_SIGNED_FILE_MAX_MB, OmHistoryRow } from '../om-generation.models';
import { OmGenerationService } from '../om-generation.service';

export interface OmSignedUploadDialogData {
  omId: string;
  refNo: string;
  ulbCount: number;
  /** Opened right after Generate: shows the success header and that the download has started. */
  justGenerated: boolean;
}

const UPLOAD_ERROR = 'Could not save the signed OM. Please try again.';

/**
 * After Generate ("OM Generated Successfully") or from the history: picks the signed OM PDF (uploaded to storage by
 * the shared file box) and saves it on the OM. Closes with the updated history row, or undefined for "later".
 */
@Component({
  selector: 'app-om-signed-upload-dialog',
  imports: [MatDialogModule, MatButtonModule, FileComponent],
  templateUrl: './om-signed-upload-dialog.component.html',
  styleUrl: './om-signed-upload-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmSignedUploadDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<OmSignedUploadDialogComponent, OmHistoryRow | undefined>>(MatDialogRef);
  private readonly service = inject(OmGenerationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = inject<OmSignedUploadDialogData>(MAT_DIALOG_DATA);

  readonly fileField: FieldConfig = {
    key: 'signedFile',
    label: 'Signed OM',
    formFieldType: 'file',
    allowedFileTypes: ['pdf'],
    maxFileSize: OM_SIGNED_FILE_MAX_MB,
    folderPath: 'mohua/om',
    hideLabel: true,
  } as FieldConfig;
  readonly form = new FormGroup({ signedFile: new FormControl<unknown>(null) });

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasFile = signal(false);

  constructor() {
    this.form.controls.signedFile.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.hasFile.set(isUploadedFileMetadata(value)));
  }

  upload(): void {
    const file = this.form.controls.signedFile.value;
    if (!isUploadedFileMetadata(file) || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.service
      .uploadSignedFile(this.data.omId, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (row) => this.dialogRef.close(row),
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          const message = err.error?.message;
          this.error.set(typeof message === 'string' ? message : UPLOAD_ERROR);
        },
      });
  }

  later(): void {
    this.dialogRef.close(undefined);
  }
}
