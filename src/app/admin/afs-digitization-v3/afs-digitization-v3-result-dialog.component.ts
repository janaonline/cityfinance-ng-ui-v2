import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { EnqueueSummary } from './afs-digitization-v3.service';

export interface DigitizationV3ResultDialogData {
  summary?: EnqueueSummary;
  /** Set when the request failed; shown instead of the summary */
  error?: string;
}

/** Outcome of "Digitize Selected" / "Digitize All Filtered". Stays open until the user closes it. */
@Component({
  standalone: true,
  selector: 'app-afs-digitization-v3-result-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    @if (data.error) {
      <h2 mat-dialog-title>Could not start digitization</h2>
      <mat-dialog-content>
        <div class="alert alert-danger mb-0">{{ data.error }}</div>
      </mat-dialog-content>
    } @else {
      @let s = data.summary!;
      <h2 mat-dialog-title>Digitization started</h2>
      <mat-dialog-content>
        @if (s.batchId) {
          <p class="mb-3">
            Batch ID: <span class="font-monospace fw-semibold">{{ s.batchId }}</span>
          </p>
        }
        <dl class="result-grid">
          <dt>Matched</dt>
          <dd>{{ s.matched }}</dd>
          <dt>Queued</dt>
          <dd class="text-success fw-semibold">{{ s.queued }}</dd>
          <dt>Skipped, no PDF</dt>
          <dd>{{ s.skippedNoPdf }}</dd>
          @if (s.skippedDuplicate) {
            <dt>Skipped, duplicate</dt>
            <dd>{{ s.skippedDuplicate }}</dd>
          }
          <dt>Skipped, already queued</dt>
          <dd>{{ s.skippedAlreadyQueued }}</dd>
          <dt>Skipped, already digitized</dt>
          <dd>{{ s.skippedAlreadyDigitized }}</dd>
          @if (s.failedToQueue) {
            <dt class="text-danger">Could not be queued</dt>
            <dd class="text-danger fw-semibold">{{ s.failedToQueue }}</dd>
          }
        </dl>
      </mat-dialog-content>
    }
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" type="button" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: `
    .result-grid {
      display: grid;
      grid-template-columns: 14rem 1fr;
      gap: 0.4rem 1rem;
      margin: 0;
    }
    dt {
      font-weight: 600;
    }
    dd {
      margin: 0;
    }
  `,
})
export class AfsDigitizationV3ResultDialogComponent {
  readonly data = inject<DigitizationV3ResultDialogData>(MAT_DIALOG_DATA);
}
