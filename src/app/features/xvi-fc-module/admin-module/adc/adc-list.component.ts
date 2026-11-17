import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { IState } from '../../../../core/models/state/state';
import { StateService } from '../../../../core/services/state/state.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import {
  resolveThemeClass,
  themedDialogConfig,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { AdcService, IAdcRow } from '../../shared/adc/adc.service';
import { AdcFormDialogComponent, AdcFormDialogData } from './dialogs/adc-form-dialog/adc-form-dialog.component';
import {
  ChangeAdminDialogComponent,
  ChangeAdminDialogData,
} from './dialogs/change-admin-dialog/change-admin-dialog.component';

/** The API caps a page at 20 rows, so the paginator never offers more. */
const ROWS_PAGE_SIZE = 20;

/** Portal Admin's ADC page: list, add, rename, set/change the ADC Admin, delete. */
@Component({
  selector: 'app-adc-list',
  imports: [ReactiveFormsModule, MaterialModule, MatTableModule, PreLoaderComponent],
  templateUrl: './adc-list.component.html',
  styleUrl: './adc-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdcListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adcService = inject(AdcService);
  private readonly stateService = inject(StateService);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);
  // Resolved here, in the injection context, so every dialog opens with the XVI-FC theme.
  private readonly themeClass = resolveThemeClass();
  private readonly confirmConfig = themedDialogConfig();

  readonly displayedColumns = ['name', 'state', 'ulbCount', 'memberCount', 'admin', 'actions'];

  readonly rows = signal<IAdcRow[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(ROWS_PAGE_SIZE);
  readonly pageSizeOptions = [10, ROWS_PAGE_SIZE];
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly states = signal<IState[]>([]);
  readonly deletingId = signal<string | null>(null);

  readonly filterForm = this.fb.nonNullable.group({ stateId: [''], search: [''] });

  ngOnInit(): void {
    this.loadRows();
    this.stateService
      .getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (response) => this.states.set(response?.data ?? []), error: () => this.states.set([]) });

    this.filterForm.controls.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
    this.filterForm.controls.stateId.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  loadRows(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    const { stateId, search } = this.filterForm.getRawValue();

    this.adcService
      .manage({ page: this.page(), limit: this.pageSize(), stateId: stateId || undefined, search: search.trim() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          // The last row of the last page was deleted: step back a page.
          if (result.data.length === 0 && this.page() > 1) {
            this.page.update((p) => p - 1);
            this.loadRows();
            return;
          }
          this.rows.set(result.data);
          this.total.set(result.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Unable to load ADCs. Please try again.');
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadRows();
  }

  /** Members other than the Admin, or any ULB, keep an ADC from being deleted. */
  canDelete(row: IAdcRow): boolean {
    return row.ulbCount === 0 && row.memberCount <= (row.admin ? 1 : 0);
  }

  deleteTooltip(row: IAdcRow): string {
    if (this.canDelete(row)) return 'Delete this ADC';
    const otherMembers = row.memberCount - (row.admin ? 1 : 0);
    const blockers = [
      row.ulbCount > 0 ? `${row.ulbCount} ULB${row.ulbCount === 1 ? '' : 's'}` : null,
      otherMembers > 0 ? `${otherMembers} other member${otherMembers === 1 ? '' : 's'}` : null,
    ].filter(Boolean);
    return `Move or remove its ${blockers.join(' and ')} first.`;
  }

  openAdd(): void {
    this.openFormDialog({ mode: 'create' }, 'ADC added. The Admin has been sent an invitation.');
  }

  openEdit(row: IAdcRow): void {
    this.openFormDialog({ mode: 'edit', adc: row }, 'ADC renamed.');
  }

  openChangeAdmin(row: IAdcRow): void {
    this.dialog
      .open<ChangeAdminDialogComponent, ChangeAdminDialogData, boolean>(ChangeAdminDialogComponent, {
        data: { adc: row },
        width: '600px',
        maxWidth: '95vw',
        disableClose: true,
        panelClass: this.themeClass ?? undefined,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved) => {
        if (!saved) return;
        this.utilityService.triggerSnackbar(`ADC Admin updated for ${row.name}.`, 'snackbar-success');
        this.loadRows();
      });
  }

  confirmDelete(row: IAdcRow): void {
    if (!this.canDelete(row) || this.deletingId()) return;
    const adminLine = row.admin ? ` Its Admin, ${row.admin.name} (${row.admin.email}), will lose access.` : '';

    this.confirmDialog
      .confirm(
        {
          title: 'Delete ADC',
          message: `Delete ${row.name} (${row.state.name})?${adminLine} This cannot be undone.`,
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
          this.deletingId.set(row._id);
          return this.adcService.remove(row._id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.deletingId.set(null);
          this.utilityService.triggerSnackbar(`${row.name} deleted.`, 'snackbar-success');
          this.loadRows();
        },
        error: (err: HttpErrorResponse) => {
          this.deletingId.set(null);
          const message = (err.error as { message?: unknown } | null)?.message;
          this.utilityService.triggerSnackbar(
            typeof message === 'string' && message ? message : 'Unable to delete this ADC. Please try again.',
            'snackbar-danger',
          );
        },
      });
  }

  private applyFilters(): void {
    this.page.set(1);
    this.loadRows();
  }

  private openFormDialog(data: AdcFormDialogData, successMessage: string): void {
    this.dialog
      .open<AdcFormDialogComponent, AdcFormDialogData, boolean>(AdcFormDialogComponent, {
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
        this.loadRows();
      });
  }
}
