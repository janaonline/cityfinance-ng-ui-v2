import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AfsDigitizationJobLog, AfsDigitizationV3Service } from './afs-digitization-v3.service';

export interface DigitizationV3LogDialogData {
  ulbName: string;
  afsDigitizationJobId: string;
}

@Component({
  standalone: true,
  selector: 'app-afs-digitization-v3-log-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Digitization log</h2>
    <mat-dialog-content>
      <p class="text-muted mb-3">{{ data.ulbName }}</p>

      @if (log(); as l) {
        <dl class="log-grid">
          <dt>Job id</dt>
          <dd class="font-monospace">{{ l.afsDigitizationJobId }}</dd>

          <dt>Status</dt>
          <dd>
            <span class="badge" [ngClass]="'status-' + l.status">{{ l.status }}</span>
            @if (l.progressStep) {
              <span class="text-muted ms-2">{{ l.progressStep }}</span>
            }
          </dd>

          @if (l.errorMessage) {
            <dt>Error</dt>
            <dd class="text-danger">{{ l.errorMessage }}</dd>
          }

          @if (l.warnings.length) {
            <dt>Warnings</dt>
            <dd>
              <ul class="mb-0 ps-3">
                @for (w of l.warnings; track $index) {
                  <li>{{ w }}</li>
                }
              </ul>
            </dd>
          }

          @if (l.message) {
            <dt>Message</dt>
            <dd>{{ l.message }}</dd>
          }

          <dt>File</dt>
          <dd>{{ l.filename || '–' }}</dd>
          <dt>Pages</dt>
          <dd>{{ l.pageCount ?? '–' }}</dd>
          <dt>Detected type</dt>
          <dd>{{ l.detectedDocumentType || '–' }}</dd>
          <dt>OCR engine</dt>
          <dd>{{ l.ocrEngine || '–' }}{{ l.geminiModel ? ' · ' + l.geminiModel : '' }}</dd>
          @if (l.ocrCostUsd != null) {
            <dt>OCR cost</dt>
            <dd>\${{ l.ocrCostUsd }}</dd>
          }

          <dt>Created</dt>
          <dd>{{ (l.createdAt | date: 'medium') || '–' }}</dd>
          <dt>Started</dt>
          <dd>{{ (l.startedAt | date: 'medium') || '–' }}</dd>
          <dt>Completed</dt>
          <dd>{{ (l.completedAt | date: 'medium') || '–' }}</dd>
          @if (duration(l); as d) {
            <dt>Took</dt>
            <dd>{{ d }}</dd>
          }
        </dl>
      } @else if (loading()) {
        <div class="text-center p-4"><mat-spinner diameter="36" class="mx-auto"></mat-spinner></div>
      } @else if (error()) {
        <div class="alert alert-danger mb-0">{{ error() }}</div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="copyJobId()">Copy job id</button>
      <button mat-flat-button color="primary" type="button" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: `
    .log-grid {
      display: grid;
      grid-template-columns: 8.5rem 1fr;
      gap: 0.4rem 1rem;
      margin: 0;
    }
    dt {
      font-weight: 600;
    }
    dd {
      margin: 0;
      word-break: break-word;
    }
    .status-completed {
      background-color: #198754;
    }
    .status-queued,
    .status-processing {
      background-color: #b58105;
    }
    .status-failed {
      background-color: #dc3545;
    }
  `,
})
export class AfsDigitizationV3LogDialogComponent implements OnInit {
  readonly data = inject<DigitizationV3LogDialogData>(MAT_DIALOG_DATA);
  private readonly api = inject(AfsDigitizationV3Service);
  private readonly destroyRef = inject(DestroyRef);

  log = signal<AfsDigitizationJobLog | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.api
      .getJobLog(this.data.afsDigitizationJobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (log) => {
          this.log.set(log);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error?.message ?? 'Could not load the job log');
          this.loading.set(false);
        },
      });
  }

  /** Time between start and completion, when both are known. */
  duration(log: AfsDigitizationJobLog): string | null {
    if (!log.startedAt || !log.completedAt) return null;
    const seconds = Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000);
    if (!(seconds >= 0)) return null;
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  copyJobId(): void {
    navigator.clipboard?.writeText(this.data.afsDigitizationJobId).catch(() => {
      // clipboard access can be denied; the id is selectable in the dialog anyway
    });
  }
}
