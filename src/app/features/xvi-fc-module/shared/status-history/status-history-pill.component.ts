import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { resolveThemeClass } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatusHistoryDialogComponent, StatusHistoryDialogData } from './status-history-dialog.component';
import { StatusHistoryLoader } from './status-history.models';

/**
 * Status pill that opens the status-history dialog on click. Role-neutral: the caller supplies the pill
 * text/classes, a heading and a `loader` — nothing here knows about PMU/MoHUA. Nothing is fetched until
 * the dialog opens.
 */
@Component({
  selector: 'app-status-history-pill',
  standalone: true,
  imports: [MatTooltipModule],
  template: `
    <button
      type="button"
      class="status-pill-btn"
      aria-haspopup="dialog"
      matTooltip="View status history"
      [attr.aria-label]="'Current status ' + label() + '. View status history'"
      (click)="open()"
    >
      <span [class]="'badge rounded-pill ' + badgeClass()">
        {{ label() }}
        <i class="bi bi-clock-history ms-1" aria-hidden="true"></i>
      </span>
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .status-pill-btn {
      border: 0;
      padding: 0;
      background: none;
      cursor: pointer;
      border-radius: 999px;

      &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      &:hover .badge {
        filter: brightness(0.96);
      }
    }
  `,
})
export class StatusHistoryPillComponent {
  private readonly dialog = inject(MatDialog);
  /** Must be resolved in this field-initializer injection context — see `resolveThemeClass`'s own doc. */
  private readonly themeClass = resolveThemeClass();

  /** Pill text — the current status label. */
  readonly label = input.required<string>();
  /** Classes for the pill itself (e.g. the worklist's `bg-warning-subtle text-warning-emphasis`). */
  readonly badgeClass = input('');
  /** Dialog header line, e.g. "Gujarat · GTC · Installment 1". */
  readonly heading = input('');
  readonly loader = input.required<StatusHistoryLoader>();

  open(): void {
    this.dialog.open<StatusHistoryDialogComponent, StatusHistoryDialogData>(StatusHistoryDialogComponent, {
      data: { heading: this.heading(), loader: this.loader() },
      width: '520px',
      maxWidth: '94vw',
      autoFocus: 'dialog',
      panelClass: this.themeClass ? [this.themeClass] : [],
    });
  }
}
