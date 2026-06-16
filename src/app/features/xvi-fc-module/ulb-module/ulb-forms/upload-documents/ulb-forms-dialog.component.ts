import { Component, inject } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

// ── Data shape ────────────────────────────────────────────────────────────────

export interface UlbFormsDialogButton {
  label: string;
  result: string;
  variant: 'flat' | 'stroked' | 'text';
  /** Background hex for flat buttons, e.g. '#e53935'. Defaults to app primary. */
  bgColor?: string;
  /** Text color for flat buttons. Defaults to '#fff'. */
  textColor?: string;
}

export interface UlbFormsDialogTableRow {
  title: string;
  fileName: string | null;
  version: string | null;
  uploaderLabel: string;
  byTeammate: boolean;
}

export interface UlbFormsDialogData {
  title: string;
  /** Optional leading icon */
  icon?: { name: string; color: string };
  description: string;
  /** Present only for the review-before-submit dialog */
  table?: UlbFormsDialogTableRow[];
  buttons: UlbFormsDialogButton[];
  /** 'row-end' = right-aligned row (default) | 'column' = full-width stacked */
  buttonLayout?: 'row-end' | 'column';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Pass as panelClass to every dialog.open() using this component. */
export const ULB_FORMS_DIALOG_PANEL_CLASS = 'ulb-forms-dialog-panel';

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-ulb-forms-dialog',
  standalone: true,
  imports: [NgClass, NgStyle, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="ulb-dialog">

      <!-- Header -->
      <div class="ulb-dialog__header">
        @if (data.icon) {
          <mat-icon [style.color]="data.icon.color" class="ulb-dialog__icon">
            {{ data.icon.name }}
          </mat-icon>
        }
        <h2 class="ulb-dialog__title">{{ data.title }}</h2>
      </div>

      <!-- Description -->
      <p class="ulb-dialog__desc">{{ data.description }}</p>

      <!-- Optional review table -->
      @if (data.table) {
        <div class="ulb-dialog__table-wrap">
          <table class="ulb-dialog__table">
            <thead>
              <tr>
                <th>DOCUMENT</th>
                <th>FILE</th>
                <th class="col-ver">VER.</th>
                <th class="col-by">UPLOADED BY</th>
              </tr>
            </thead>
            <tbody>
              @for (row of data.table; track row.title) {
                <tr [ngClass]="{ 'row--teammate': row.byTeammate }">
                  <td class="cell-doc">{{ row.title }}</td>
                  <td class="cell-file">{{ row.fileName ?? '—' }}</td>
                  <td class="cell-ver">{{ row.version ?? '—' }}</td>
                  <td class="cell-by">{{ row.uploaderLabel }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Buttons -->
      <div
        class="ulb-dialog__actions"
        [ngClass]="data.buttonLayout === 'column' ? 'ulb-dialog__actions--col' : 'ulb-dialog__actions--row'"
      >
        @for (btn of data.buttons; track btn.result) {
          @if (btn.variant === 'flat') {
            <button
              mat-flat-button
              type="button"
              [ngStyle]="{ background: btn.bgColor ?? '#1e3a8a', color: btn.textColor ?? '#fff' }"
              (click)="close(btn.result)"
            >{{ btn.label }}</button>
          } @else if (btn.variant === 'stroked') {
            <button mat-stroked-button type="button" (click)="close(btn.result)">{{ btn.label }}</button>
          } @else {
            <button mat-button type="button" (click)="close(btn.result)">{{ btn.label }}</button>
          }
        }
      </div>

    </div>
  `,
  styles: [`
    .ulb-dialog {
      padding: clamp(16px, 4vw, 24px);
      box-sizing: border-box;
      width: 100%;
    }

    .ulb-dialog__header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .ulb-dialog__icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      flex-shrink: 0;
    }

    .ulb-dialog__title {
      font-size: clamp(0.9rem, 2.5vw, 1rem);
      font-weight: 700;
      color: #111827;
      margin: 0;
      line-height: 1.3;
    }

    .ulb-dialog__desc {
      font-size: clamp(0.72rem, 1.8vw, 0.78rem);
      color: #4b5563;
      line-height: 1.6;
      margin: 0 0 20px;
    }

    /* ── Table ────────────────────────────────────────── */
    .ulb-dialog__table-wrap {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow-x: auto;   /* horizontal scroll on small screens */
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 20px;
    }

    .ulb-dialog__table {
      width: 100%;
      min-width: 420px;   /* prevent table from collapsing below readable width */
      border-collapse: collapse;
      font-size: 0.78rem;

      thead tr {
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
      }

      th {
        padding: 8px 12px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: #6b7280;
        text-align: left;
        white-space: nowrap;
      }

      tbody tr {
        border-bottom: 1px solid #f3f4f6;
        background: #fff;

        &:last-child { border-bottom: none; }

        &.row--teammate {
          background: #fffbeb;
          border-left: 3px solid #f59e0b;
          td:first-child { padding-left: 9px; }
        }
      }

      td {
        padding: 9px 12px;
        vertical-align: top;
        color: #111827;
      }
    }

    .col-ver, .cell-ver { width: 52px; }
    .col-by,  .cell-by  { width: 110px; white-space: nowrap; }
    .cell-doc  { font-weight: 600; line-height: 1.4; }
    .cell-file { color: #374151; word-break: break-all; }
    .cell-ver  { color: #6b7280; }
    .cell-by   { color: #374151; font-weight: 500; }

    /* ── Buttons ──────────────────────────────────────── */
    .ulb-dialog__actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      &--row { justify-content: flex-end; }
      &--col { flex-direction: column; }

      button { font-size: clamp(0.75rem, 2vw, 0.82rem); }
    }

    /* On very small screens, row buttons stack too */
    @media (max-width: 400px) {
      .ulb-dialog__actions--row {
        flex-direction: column-reverse;
        align-items: stretch;

        button { width: 100%; }
      }
    }
  `],
})
export class UlbFormsDialogComponent {
  readonly data = inject<UlbFormsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UlbFormsDialogComponent, string>);

  close(result: string): void {
    this.dialogRef.close(result);
  }
}
