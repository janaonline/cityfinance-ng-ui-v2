import { ComponentType } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { filter, switchMap } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import {
  resolveThemeClass,
  themedDialogConfig,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { AdcService, IAdcRow } from '../../../shared/adc/adc.service';
import { adcDeleteBlockedReason } from '../dialogs/adc-dialog.utils';
import { AdcFormDialogComponent, AdcFormDialogData } from '../dialogs/adc-form-dialog/adc-form-dialog.component';
import {
  ChangeAdminDialogComponent,
  ChangeAdminDialogData,
} from '../dialogs/change-admin-dialog/change-admin-dialog.component';

let nextMenuId = 0;

/** The ADC's overflow menu (Rename, Change Admin, Delete), shared by the list rows and the detail header. */
@Component({
  selector: 'app-adc-actions-menu',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './adc-actions-menu.component.html',
  styleUrl: './adc-actions-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdcActionsMenuComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly adcService = inject(AdcService);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);
  // Resolved in the injection context so every dialog opens with the XVI-FC theme.
  private readonly themeClass = resolveThemeClass();
  private readonly confirmConfig = themedDialogConfig();

  readonly adc = input.required<IAdcRow>();
  /** "icon" for a table row (the kebab), "button" for the detail header ("Actions"). */
  readonly variant = input<'icon' | 'button'>('icon');
  /** After a rename or an Admin change. */
  readonly changed = output<void>();
  readonly deleted = output<void>();

  readonly isDeleting = signal(false);
  readonly reasonId = `adc-delete-reason-${nextMenuId++}`;
  readonly deleteBlockedReason = computed(() => adcDeleteBlockedReason(this.adc()));

  rename(): void {
    this.openDialog<AdcFormDialogComponent, AdcFormDialogData>(
      AdcFormDialogComponent,
      { mode: 'edit', adc: this.adc() },
      'ADC renamed.',
    );
  }

  changeAdmin(): void {
    this.openDialog<ChangeAdminDialogComponent, ChangeAdminDialogData>(
      ChangeAdminDialogComponent,
      { adc: this.adc() },
      `ADC Admin updated for ${this.adc().name}.`,
    );
  }

  confirmDelete(): void {
    const adc = this.adc();
    if (this.deleteBlockedReason() || this.isDeleting()) return;
    const adminLine = adc.admin ? ` Its Admin, ${adc.admin.name} (${adc.admin.email}), will lose access.` : '';

    this.confirmDialog
      .confirm(
        {
          title: 'Delete ADC',
          message: `Delete ${adc.name} (${adc.state.name})?${adminLine} This cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          confirmButtonColor: 'warn',
          icon: 'bi-trash',
        },
        this.confirmConfig,
      )
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.isDeleting.set(true);
          return this.adcService.remove(adc._id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.utilityService.triggerSnackbar(`${adc.name} deleted.`, 'snackbar-success');
          this.deleted.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.isDeleting.set(false);
          const message = (err.error as { message?: unknown } | null)?.message;
          this.utilityService.triggerSnackbar(
            typeof message === 'string' && message ? message : 'Unable to delete this ADC. Please try again.',
            'snackbar-danger',
          );
        },
      });
  }

  private openDialog<C, D>(component: ComponentType<C>, data: D, successMessage: string): void {
    this.dialog
      .open<C, D, boolean>(component, {
        data,
        width: '600px',
        maxWidth: '95vw',
        disableClose: true,
        panelClass: this.themeClass ?? undefined,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved) => {
        if (!saved) return;
        this.utilityService.triggerSnackbar(successMessage, 'snackbar-success');
        this.changed.emit();
      });
  }
}
