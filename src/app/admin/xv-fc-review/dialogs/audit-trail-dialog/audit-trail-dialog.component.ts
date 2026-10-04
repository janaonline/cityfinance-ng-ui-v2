import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';

export interface AuditTrailEntry {
  createdAt: string;
  performedByRole: string;
  action: string;
  previousValue: number | null;
  newValue: number | null;
  reason: string;
}

export interface AuditTrailDialogData {
  title: string;
  entries: AuditTrailEntry[];
}

const ACTION_LABELS: Record<string, string> = {
  ULB_FLAG: 'Flagged',
  ULB_SUBMIT: 'Submitted',
  ADMIN_ACCEPT: 'Accepted',
  ADMIN_REJECT: 'Rejected',
  SUBMISSION_APPROVED: 'Submission Approved',
  SUBMISSION_REJECTED: 'Submission Rejected',
  REOPENED: 'Reopened',
};

@Component({
  selector: 'app-audit-trail-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, DatePipe],
  templateUrl: './audit-trail-dialog.component.html',
})
export class AuditTrailDialogComponent {
  readonly data = inject<AuditTrailDialogData>(MAT_DIALOG_DATA);

  actionLabel(action: string): string {
    return ACTION_LABELS[action] ?? action;
  }
}
