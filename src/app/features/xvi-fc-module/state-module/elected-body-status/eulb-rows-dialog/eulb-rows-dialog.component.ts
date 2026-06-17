import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { EulbStatusService } from '../eulb-status.service';
import {
  EulbBodyStatus,
  EulbRow,
  EulbRowError,
  EulbRowsDialogData,
  EulbRowsDialogResult,
  EulbRowsQuery,
  EulbUpdateRowPayload,
  EulbValidationSummary,
} from '../eulb-status.models';

/** Shape of a single field-level error returned by the PATCH row update endpoint. */
interface EulbRowUpdateApiError {
  rowId?: string;
  rowNumber?: number;
  censusCode?: string;
  ulbName?: string;
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

/** Edit-form field keys that support inline API error display. */
const EDIT_FIELDS = ['electedBodyStatus', 'dateOfConstitution', 'dateOfExpiry', 'remarks'] as const;

@Component({
  selector: 'app-eulb-rows-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatTooltipModule, DatePipe],
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
    errorField: [''],
  });

  editForm = this.fb.group({
    electedBodyStatus: ['' as EulbBodyStatus | ''],
    dateOfConstitution: [''],
    dateOfExpiry: [''],
    remarks: [''],
  });

  /** Initialises the dialog: loads the first page and wires up filter and form-error subscriptions. */
  ngOnInit(): void {
    this.loadRows();
    this.setupFilterSubscription();
    this.setupEditFormErrorClear();
  }

  /**
   * Fetches the current page of rows from the API using active filter values.
   * Sets `isLoading` while the request is in flight and clears it on success or error.
   */
  loadRows(): void {
    this.isLoading.set(true);

    const { search, validationStatus, rowType, errorField } = this.filterForm.getRawValue();
    const query: EulbRowsQuery = {
      page: this.page(),
      limit: this.limit,
      search: search || undefined,
      validationStatus: (validationStatus as EulbRowsQuery['validationStatus']) || undefined,
      rowType: (rowType as EulbRowsQuery['rowType']) || undefined,
      errorField: errorField || undefined,
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

  /**
   * Navigates to the given page number and reloads rows.
   * No-ops if `page` is outside the valid [1, totalPages] range.
   * @param page - Target page number (1-based).
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadRows();
  }

  /**
   * Puts the given row into edit mode and pre-fills the edit form with its current values.
   * @param row - The row to edit.
   */
  startEdit(row: EulbRow): void {
    this.editingRowId.set(row._id);
    this.editForm.setValue({
      electedBodyStatus: row.electedBodyStatus ?? '',
      dateOfConstitution: row.dateOfConstitution ?? '',
      dateOfExpiry: row.dateOfExpiry ?? '',
      remarks: row.remarks ?? '',
    });
  }

  /** Exits edit mode without saving, clears all API field errors, and resets the edit form. */
  cancelEdit(): void {
    this.clearAllEditApiErrors();
    this.editingRowId.set(null);
    this.editForm.reset();
  }

  /**
   * Sends a PATCH request to persist the current edit-form values for the given row.
   * On success, exits edit mode and reloads rows. On failure, surfaces field-level API errors
   * inline or shows a generic snackbar when no structured errors are available.
   * @param rowId - The unique identifier of the row being saved.
   */
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
          this.clearAllEditApiErrors();
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
          const apiErrors = this.getRowUpdateErrors(err);

          if (apiErrors.length > 0) {
            this.applyRowUpdateErrors(apiErrors);
            const row = this.rows().find((r) => r._id === rowId);
            const ulbName = apiErrors[0].ulbName ?? row?.ulbName ?? 'This ULB';
            this.utilityService.triggerSnackbar(`${ulbName} has errors. Please validate it.`, 'snackbar-danger');
          } else {
            const message = this.extractErrorMessage(err) ?? 'Failed to update row. Please try again.';
            this.utilityService.triggerSnackbar(message, 'snackbar-danger');
          }
        },
      });
  }

  /**
   * Closes the dialog and passes the latest validation summary (if any) back to the opener,
   * allowing the parent component to update its displayed counts without a full reload.
   */
  close(): void {
    const result: EulbRowsDialogResult = {};
    const summary = this.latestSummary();
    if (summary) result.updatedSummary = summary;
    this.dialogRef.close(result);
  }

  /**
   * Returns `true` when the given edit-form field has API errors and has been touched.
   * @param field - The form control name.
   */
  hasEditFieldError(field: string): boolean {
    const control = this.editForm.get(field);
    return !!control?.hasError('apiErrors') && (control.touched || control.dirty);
  }

  /**
   * Returns the list of API error messages for the given edit-form field.
   * @param field - The form control name.
   */
  getEditFieldErrors(field: string): string[] {
    const errors = this.editForm.get(field)?.getError('apiErrors');
    return Array.isArray(errors) ? (errors as string[]) : [];
  }

  /**
   * Returns all backend validation errors for a specific field on a row.
   * @param row - The row whose `errors` array is inspected.
   * @param field - The field key to filter by (e.g. `'electedBodyStatus'`).
   * @returns Array of matching `EulbRowError` objects, or an empty array when none exist.
   */
  getCellErrors(row: EulbRow, field: string): EulbRowError[] {
    return row.errors?.filter((err) => err.field === field) ?? [];
  }

  /**
   * Returns `true` when the row has at least one backend error for the given field.
   * @param row - The row whose `errors` array is inspected.
   * @param field - The field key to check (e.g. `'dateOfConstitution'`).
   */
  hasCellError(row: EulbRow, field: string): boolean {
    return this.getCellErrors(row, field).length > 0;
  }

  /**
   * Returns a newline-joined string of error messages for the given field on a row,
   * suitable for use as a `matTooltip` or native `title` attribute.
   * @param row - The row whose errors are read.
   * @param field - The field key to look up (e.g. `'remarks'`).
   * @returns Concatenated error messages separated by `\n`, or an empty string when there are none.
   */
  getCellErrorText(row: EulbRow, field: string): string {
    return this.getCellErrors(row, field)
      .map((err) => err.message)
      .join('\n');
  }

  /**
   * Enters edit mode for the given row and focuses the matching field control after the view updates.
   * No-ops when the cell has no errors or when another row is already being edited.
   * @param row - The row to place into edit mode.
   * @param field - The field whose input should receive focus; must match a `data-eulb-edit-field` attribute value.
   */
  startEditAtField(row: EulbRow, field: string): void {
    if (!this.hasCellError(row, field) || this.editingRowId() !== null) return;
    this.startEdit(row);
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-eulb-edit-field="${field}"]`);
      el?.focus();
    }, 50);
  }

  /**
   * Subscribes once to each editable field's `valueChanges` so that typing or selecting
   * a new value automatically clears the stale API error for that field only.
   * Uses `takeUntilDestroyed` to avoid leaks.
   */
  private setupEditFormErrorClear(): void {
    for (const field of EDIT_FIELDS) {
      this.editForm
        .get(field)
        ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.clearApiError(field));
    }
  }

  /**
   * Removes the `apiErrors` key from a single edit-form control's error map.
   * Leaves all other errors untouched.
   * @param field - The form control name.
   */
  private clearApiError(field: string): void {
    const control = this.editForm.get(field);
    if (!control?.errors?.['apiErrors']) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiErrors: _, ...remainingErrors } = control.errors;
    control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
  }

  /** Clears API errors from all edit-form fields. Called on cancel and on successful save. */
  private clearAllEditApiErrors(): void {
    for (const field of EDIT_FIELDS) {
      this.clearApiError(field);
    }
  }

  /**
   * Extracts structured field-level errors from a PATCH row update HTTP failure.
   * Looks for `error.errors` (Angular `HttpErrorResponse`) then `errors` directly on the thrown value.
   * @param error - Raw thrown value from the HTTP observable.
   */
  private getRowUpdateErrors(error: unknown): EulbRowUpdateApiError[] {
    if (typeof error !== 'object' || error === null) return [];

    const httpErr = error as { error?: { errors?: unknown }; errors?: unknown };

    const fromHttpBody = httpErr.error?.errors;
    if (Array.isArray(fromHttpBody)) return fromHttpBody as EulbRowUpdateApiError[];

    const fromPlain = httpErr.errors;
    if (Array.isArray(fromPlain)) return fromPlain as EulbRowUpdateApiError[];

    return [];
  }

  /**
   * Groups API errors by field name and stamps them onto the matching edit-form controls
   * as `{ apiErrors: string[] }`. Marks each control as touched so errors render immediately.
   * @param errors - Array of field-level errors from the PATCH response.
   */
  private applyRowUpdateErrors(errors: EulbRowUpdateApiError[]): void {
    const grouped = errors.reduce<Record<string, string[]>>((acc, err) => {
      if (!err.field) return acc;
      acc[err.field] = [...(acc[err.field] ?? []), err.message];
      return acc;
    }, {});

    for (const [field, messages] of Object.entries(grouped)) {
      const control = this.editForm.get(field);
      if (!control) continue;
      control.setErrors({ ...(control.errors ?? {}), apiErrors: messages });
      control.markAsTouched();
    }
  }

  /**
   * Subscribes to filter form value changes and reloads rows on any change, resetting to page 1.
   * The `search` field is debounced by 400 ms; all other controls react immediately.
   */
  private setupFilterSubscription(): void {
    const { search, validationStatus, rowType, errorField } = this.filterForm.controls;

    merge(
      search.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      validationStatus.valueChanges,
      rowType.valueChanges,
      errorField.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.loadRows();
      });
  }

  /**
   * Extracts a human-readable message string from an unknown HTTP error value.
   * @param err - Raw thrown value from an HTTP observable.
   * @returns The `error.message` string if present and a string, otherwise `null`.
   */
  private extractErrorMessage(err: unknown): string | null {
    if (typeof err !== 'object' || err === null) return null;
    const httpError = err as { error?: { message?: unknown } };
    const msg = httpError.error?.message;
    return typeof msg === 'string' ? msg : null;
  }
}
