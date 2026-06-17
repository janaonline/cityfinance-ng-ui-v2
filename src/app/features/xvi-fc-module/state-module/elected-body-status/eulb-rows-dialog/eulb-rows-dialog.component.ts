import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { EulbStatusService } from '../eulb-status.service';
import {
  EulbBodyStatus,
  EulbRow,
  EulbRowsDialogData,
  EulbRowsDialogResult,
  EulbRowsQuery,
  EulbUpdateRowPayload,
  EulbValidationSummary,
} from '../eulb-status.models';

@Component({
  selector: 'app-eulb-rows-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './eulb-rows-dialog.component.html',
  styleUrl: './eulb-rows-dialog.component.scss',
})
export class EulbRowsDialogComponent implements OnInit {
  private readonly service = inject(EulbStatusService);
  private readonly utilityService = inject(UtilityService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<EulbRowsDialogComponent>);
  private readonly data = inject<EulbRowsDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly stateId = this.data.stateId;
  readonly yearId = this.data.yearId;

  readonly rows = signal<EulbRow[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 20;
  readonly isLoading = signal(false);
  readonly editingRowId = signal<string | null>(null);
  readonly isUpdatingRowId = signal<string | null>(null);
  readonly latestSummary = signal<EulbValidationSummary | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  readonly startIndex = computed(() => (this.page() - 1) * this.limit + 1);
  readonly endIndex = computed(() => Math.min(this.page() * this.limit, this.total()));

  readonly electedBodyStatusOptions: EulbBodyStatus[] = ['Constituted', 'Not Constituted', 'Exempt'];

  filterForm = this.fb.group({
    search: [''],
    validationStatus: [''],
    rowType: [''],
  });

  editForm = this.fb.group({
    electedBodyStatus: ['' as EulbBodyStatus | ''],
    dateOfConstitution: [''],
    dateOfExpiry: [''],
    remarks: [''],
  });

  ngOnInit(): void {
    this.loadRows();
    this.setupFilterSubscription();
  }

  loadRows(): void {
    this.isLoading.set(true);

    const { search, validationStatus, rowType } = this.filterForm.getRawValue();
    const query: EulbRowsQuery = {
      page: this.page(),
      limit: this.limit,
      search: search || undefined,
      validationStatus: (validationStatus as EulbRowsQuery['validationStatus']) || undefined,
      rowType: (rowType as EulbRowsQuery['rowType']) || undefined,
    };

    this.service
      .getRows(this.stateId, this.yearId, query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data.rows);
          this.total.set(res.data.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.utilityService.triggerSnackbar('Failed to load uploaded rows.', 'snackbar-danger');
          this.isLoading.set(false);
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadRows();
  }

  startEdit(row: EulbRow): void {
    this.editingRowId.set(row._id);
    this.editForm.setValue({
      electedBodyStatus: row.electedBodyStatus ?? '',
      dateOfConstitution: row.dateOfConstitution ?? '',
      dateOfExpiry: row.dateOfExpiry ?? '',
      remarks: row.remarks ?? '',
    });
  }

  cancelEdit(): void {
    this.editingRowId.set(null);
    this.editForm.reset();
  }

  saveRow(rowId: string): void {
    this.isUpdatingRowId.set(rowId);

    const raw = this.editForm.getRawValue();
    const payload: EulbUpdateRowPayload = {};

    if (raw.electedBodyStatus) payload.electedBodyStatus = raw.electedBodyStatus as EulbBodyStatus;
    if (raw.dateOfConstitution) payload.dateOfConstitution = raw.dateOfConstitution;
    if (raw.dateOfExpiry) payload.dateOfExpiry = raw.dateOfExpiry;
    if (raw.remarks !== null) payload.remarks = raw.remarks ?? '';

    this.service
      .updateRow(this.stateId, this.yearId, rowId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isUpdatingRowId.set(null);
          this.editingRowId.set(null);
          this.editForm.reset();

          if (res.data.validationSummary) {
            this.latestSummary.set(res.data.validationSummary);
          }

          this.utilityService.triggerSnackbar('Row updated successfully.');
          this.loadRows();
        },
        error: (err: unknown) => {
          this.isUpdatingRowId.set(null);
          const message = this.extractErrorMessage(err) ?? 'Failed to update row. Please try again.';
          this.utilityService.triggerSnackbar(message, 'snackbar-danger');
        },
      });
  }

  close(): void {
    const result: EulbRowsDialogResult = {};
    const summary = this.latestSummary();
    if (summary) result.updatedSummary = summary;
    this.dialogRef.close(result);
  }

  private setupFilterSubscription(): void {
    const { search, validationStatus, rowType } = this.filterForm.controls;

    merge(
      search.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      validationStatus.valueChanges,
      rowType.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.loadRows();
      });
  }

  private extractErrorMessage(err: unknown): string | null {
    if (typeof err !== 'object' || err === null) return null;
    const httpError = err as { error?: { message?: unknown } };
    const msg = httpError.error?.message;
    return typeof msg === 'string' ? msg : null;
  }
}
