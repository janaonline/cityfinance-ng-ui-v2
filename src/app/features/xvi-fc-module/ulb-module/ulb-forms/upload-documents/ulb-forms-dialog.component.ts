import { Component, inject, signal } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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

export interface UlbFormsDialogDeclaration {
  /** Bolded lead-in, e.g. "Self-declaration by the Executive Officer / Municipal Commissioner of the ULB." */
  heading: string;
  body: string;
}

export interface UlbFormsDialogData {
  title: string;
  /** Optional leading icon */
  icon?: { name: string; color: string };
  description: string;
  /** When present, all 'flat' buttons stay disabled until this checkbox is ticked */
  declaration?: UlbFormsDialogDeclaration;
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
  imports: [NgClass, NgStyle, MatDialogModule, MatButtonModule, MatCheckboxModule, MatIconModule],
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

      <!-- Optional self-declaration checkbox -->
      @if (data.declaration; as declaration) {
        <div class="ulb-dialog__declaration">
          <mat-checkbox [checked]="declared()" (change)="declared.set($event.checked)">
            <strong>{{ declaration.heading }}</strong> {{ declaration.body }}
          </mat-checkbox>
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
              [disabled]="!!data.declaration && !declared()"
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

    /* ── Declaration ──────────────────────────────────── */
    .ulb-dialog__declaration {
      padding: 12px;
      margin: 0 0 16px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      font-size: 0.76rem;
      line-height: 1.5;
      color: #374151;

      ::ng-deep .mdc-form-field { align-items: flex-start; }
      ::ng-deep .mdc-checkbox { margin-top: -10px; }
    }

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

  readonly declared = signal(false);

  close(result: string): void {
    this.dialogRef.close(result);
  }
}
