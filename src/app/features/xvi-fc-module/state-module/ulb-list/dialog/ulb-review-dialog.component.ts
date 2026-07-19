import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../material.module';
import { IUlbMaster } from '../../../../../core/models/ulb-master';
import { SignedUrlDirective } from '../../../../../core/directives/storage-url.directive';
import {
  UploadedFileMetadata,
  normalizeUploadedFileMetadata,
} from '../../../../../shared/dynamic-form/components/file/file-metadata.types';

export interface UlbReviewDialogData {
  ulb: IUlbMaster;
  /** When true, shows the ULB details with only a Close button — no Approve/Reject actions. */
  readOnly?: boolean;
}

export interface UlbReviewDialogResponse {
  decision: 'APPROVED' | 'REJECTED';
  reason?: string;
}

interface IReviewField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-ulb-review-dialog',
  imports: [MatDialogModule, MaterialModule, FormsModule, SignedUrlDirective],
  templateUrl: './ulb-review-dialog.component.html',
  styleUrl: './ulb-review-dialog.component.scss',
})
export class UlbReviewDialogComponent {
  /** true once Reject is clicked, to reveal the reason step in place of the view. */
  rejecting = false;
  reason = '';
  submitted = false;

  readonly fields: IReviewField[];

  constructor(
    private dialogRef: MatDialogRef<UlbReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UlbReviewDialogData,
  ) {
    this.fields = this.buildFields(this.data.ulb);
    this.gazetteFile = normalizeUploadedFileMetadata(this.data.ulb.gazetteNotificationFile);
  }

  /** Mirrors the Register ULB page's field set (see DEFAULT_ULB_REGISTER_SECTIONS server-side) — not the full Ulb schema. */
  private buildFields(ulb: IUlbMaster): IReviewField[] {
    return [
      { label: 'ULB Type', value: ulb.ulbTypeName || ulb.ulbType || '—' },
      { label: 'District', value: ulb.district || '—' },
      { label: 'Census Code', value: ulb.censusCode || '—' },
      { label: 'Date of Constitution', value: this.formatDate(ulb.dateOfConstitution) },
      { label: 'Gazette Notification Number', value: ulb.gazetteNotificationNumber || '—' },
    ];
  }

  private formatDate(value?: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /** Normalizes records persisted before the canonical shape (fileName/fileUrl) alongside canonical ones. */
  readonly gazetteFile: UploadedFileMetadata | null;

  /** Reason recorded the last time this ULB was rejected, if any — shown for context during re-review. */
  get previousRejectReason(): string | null {
    return this.data.ulb.approval?.rejectReason ?? null;
  }

  startReject(): void {
    this.rejecting = true;
    this.submitted = false;
  }

  cancelReject(): void {
    this.rejecting = false;
    this.reason = '';
    this.submitted = false;
  }

  approve(): void {
    this.dialogRef.close({ decision: 'APPROVED' } as UlbReviewDialogResponse);
  }

  confirmReject(): void {
    this.submitted = true;
    if (!this.reason.trim()) return;

    this.dialogRef.close({
      decision: 'REJECTED',
      reason: this.reason.trim(),
    } as UlbReviewDialogResponse);
  }
}
