import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { resolveDateConstraint } from '../../../../../shared/dynamic-form/date-constraint-resolver';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../dynamic-form-visibility.service';
import { EulbStatusService } from '../eulb-status.service';
import {
  EulbBodyStatus,
  EulbRow,
  EulbRowError,
  EulbRowsDialogData,
  EulbRowsDialogResult,
  EulbRowsQuery,
  EulbRowType,
  EulbRowValidationStatus,
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

const EDITABLE_FIELDS = ['electedBodyStatus', 'dateOfConstitution', 'dateOfExpiry', 'remarks'] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];

const VALIDATION_STATUS_OPTIONS: ReadonlyArray<{ readonly value: EulbRowValidationStatus; readonly label: string }> = [
  { value: 'VALID', label: 'Valid' },
  { value: 'INVALID', label: 'Invalid' },
];

const ROW_TYPE_OPTIONS: ReadonlyArray<{ readonly value: EulbRowType; readonly label: string }> = [
  { value: 'DB_ULB', label: 'DB ULB' },
  { value: 'EXTRA_ULB', label: 'Extra ULB' },
];

const ERROR_FIELD_OPTIONS: ReadonlyArray<{ readonly value: EditableField; readonly label: string }> = [
  { value: 'electedBodyStatus', label: 'Elected Body Status' },
  { value: 'dateOfConstitution', label: 'Date of Constitution' },
  { value: 'dateOfExpiry', label: 'Date of Expiry' },
  { value: 'remarks', label: 'Remarks' },
];

@Component({
  selector: 'app-eulb-rows-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatTooltipModule, DatePipe],
  templateUrl: './eulb-rows-dialog.component.html',
  styleUrl: './eulb-rows-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EulbRowsDialogComponent implements OnInit {
  private readonly service = inject(EulbStatusService);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<EulbRowsDialogComponent>);
  private readonly data = inject<EulbRowsDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly stateId = this.data.stateId;
  readonly yearId = this.data.yearId;
  readonly rowEditFields = signal<ConditionalFieldConfig[]>(this.data.rowEditFields ?? []);
  readonly canEditRows = !!this.data.canEdit;

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
  readonly validationStatusOptions = VALIDATION_STATUS_OPTIONS;
  readonly rowTypeOptions = ROW_TYPE_OPTIONS;
  readonly errorFieldOptions = ERROR_FIELD_OPTIONS;

  private hasSavedRowChanges = false;

  filterForm = this.fb.group({
    search: [''],
    validationStatus: [''],
    rowType: [''],
    errorField: [''],
  });

  editForm: FormGroup = this.fb.group({});

  /** Initialises the dialog: loads the first page and wires up filter subscriptions. */
  ngOnInit(): void {
    this.loadRows();
    this.setupFilterSubscription();
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
   * Puts the given row into edit mode and builds the edit form from `rowEditFields`.
   * @param row - The row to edit.
   */
  startEdit(row: EulbRow): void {
    if (!this.canEditRows) return;
    this.editingRowId.set(row._id);
    this.buildEditForm(row);
  }

  /** Exits edit mode without saving, clears all API field errors, and resets the edit form. */
  cancelEdit(): void {
    this.clearAllEditApiErrors();
    this.editingRowId.set(null);
    this.editForm = this.fb.group({});
  }

  /**
   * Sends a PATCH request to persist the current edit-form values for the given row.
   * On success, replaces the updated row in the local list and exits edit mode.
   * On failure, surfaces field-level API errors inline or shows a generic snackbar.
   * Empty strings are sent intentionally for `remarks` to allow clearing the field; blank date
   * inputs are omitted so the API does not receive an invalid date string.
   * @param rowId - The unique identifier of the row being saved.
   */
  saveRow(rowId: string): void {
    if (!this.canEditRows) return;
    this.editForm.markAllAsTouched();
    this.editForm.updateValueAndValidity();
    if (this.editForm.invalid) return;

    this.isUpdatingRowId.set(rowId);

    const raw = this.editForm.getRawValue() as {
      electedBodyStatus?: EulbBodyStatus | '';
      dateOfConstitution?: string;
      dateOfExpiry?: string;
      remarks?: string;
    };
    const payload: EulbUpdateRowPayload = {};
    if (raw.electedBodyStatus) payload.electedBodyStatus = raw.electedBodyStatus;
    payload.dateOfConstitution = raw.dateOfConstitution || undefined;
    payload.dateOfExpiry = raw.dateOfExpiry || undefined;
    payload.remarks = raw.remarks;

    this.service
      .updateRow(this.stateId, this.yearId, rowId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isUpdatingRowId.set(null);
          this.clearAllEditApiErrors();
          this.editingRowId.set(null);
          this.editForm = this.fb.group({});

          this.rows.update((rows) => rows.map((r) => (r._id === rowId ? res.data.row : r)));
          if (res.data.validationSummary) {
            this.latestSummary.set(res.data.validationSummary);
          }
          this.hasSavedRowChanges = true;

          this.utilityService.triggerSnackbar('Row updated successfully.');
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
   * Closes the dialog and passes the latest validation summary back to the opener
   * only when at least one row was successfully saved during this session.
   */
  close(): void {
    const result: EulbRowsDialogResult = {};
    if (this.hasSavedRowChanges) {
      const summary = this.latestSummary();
      if (summary) result.updatedSummary = summary;
    }
    this.dialogRef.close(result);
  }

  /**
   * Returns `true` when the given edit-form field has API errors and has been touched.
   * @param field - The editable field name.
   */
  hasEditFieldError(field: string): boolean {
    const control = this.editForm.get(field);
    return !!control?.invalid && !!(control.touched || control.dirty);
  }

  /**
   * Returns validation error messages for the given edit-form field.
   * API errors are listed first; client-side validator messages follow.
   * Messages are looked up from the matching `rowEditFields` validation config,
   * with safe generic fallbacks when no message is configured.
   * @param field - The editable field name.
   */
  getEditFieldErrors(field: string): string[] {
    const control = this.editForm.get(field);
    if (!control?.errors) return [];

    const errors = control.errors;
    const messages: string[] = [];
    const seen = new Set<string>();

    const addMessage = (msg: string): void => {
      if (msg && !seen.has(msg)) {
        seen.add(msg);
        messages.push(msg);
      }
    };

    if (Array.isArray(errors['apiErrors'])) {
      for (const msg of errors['apiErrors'] as string[]) {
        addMessage(msg);
      }
    }

    const fallbacks: Record<string, string> = {
      required: 'This field is required.',
      minDate: 'Date is before the allowed minimum.',
      maxDate: 'Date is after the allowed maximum.',
      minlength: 'Value is too short.',
      maxlength: 'Value is too long.',
      pattern: 'Invalid format.',
      min: 'Value is below the minimum.',
      max: 'Value exceeds the maximum.',
    };

    for (const key of Object.keys(errors)) {
      if (key === 'apiErrors') continue;
      addMessage(this.getValidationMessage(field, key) || fallbacks[key] || 'Invalid value.');
    }

    return messages;
  }

  /**
   * Returns all validation messages for the given edit-form field joined by newlines,
   * suitable for use as a `matTooltip` value. Returns an empty string when there are no errors.
   * @param field - The editable field name.
   */
  getEditFieldErrorText(field: string): string {
    return this.getEditFieldErrors(field).join('\n');
  }

  /**
   * Returns the `yyyy-MM-dd` minimum date string for the given date field,
   * derived from the API-provided `rowEditFields` config. Returns `null` if
   * no minimum constraint is defined.
   * @param fieldKey - The field key (e.g. `'dateOfConstitution'`).
   */
  getEditDateMin(fieldKey: string): string | null {
    const field = this.getRowEditFieldConfig(fieldKey);
    if (!field) return null;
    if (field.minDate != null) return this.toHtmlDate(field.minDate);
    const val = field.validations?.find((v) => v.name === 'minDate')?.validator;
    return val != null ? this.toHtmlDate(val) : null;
  }

  /**
   * Returns the `yyyy-MM-dd` maximum date string for the given date field,
   * derived from the API-provided `rowEditFields` config. Returns `null` if
   * no maximum constraint is defined.
   * @param fieldKey - The field key (e.g. `'dateOfExpiry'`).
   */
  getEditDateMax(fieldKey: string): string | null {
    const field = this.getRowEditFieldConfig(fieldKey);
    if (!field) return null;
    if (field.maxDate != null) return this.toHtmlDate(field.maxDate);
    const val = field.validations?.find((v) => v.name === 'maxDate')?.validator;
    return val != null ? this.toHtmlDate(val) : null;
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
    if (!this.canEditRows) return;
    if (!this.hasCellError(row, field) || this.editingRowId() !== null) return;
    this.startEdit(row);
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-eulb-edit-field="${field}"]`);
      el?.focus();
    }, 50);
  }

  /**
   * Returns the CSS badge class (`text-bg-success` or `text-bg-danger`) for a row validation status.
   * @param status - The row's `validationStatus` value.
   */
  getValidationStatusBadgeClass(status: EulbRowValidationStatus): string {
    return status === 'VALID' ? 'text-bg-success' : 'text-bg-danger';
  }

  /**
   * Returns the human-readable label (`'Valid'` or `'Invalid'`) for a row validation status.
   * @param status - The row's `validationStatus` value.
   */
  getValidationStatusLabel(status: EulbRowValidationStatus): string {
    return status === 'VALID' ? 'Valid' : 'Invalid';
  }

  /**
   * Returns the short display label (`'DB'` or `'Extra'`) for a row type.
   * @param rowType - The row's `rowType` value.
   */
  getRowTypeLabel(rowType: EulbRowType): string {
    return rowType === 'DB_ULB' ? 'DB' : 'Extra';
  }

  /**
   * Builds the edit form dynamically from `rowEditFields`, setting initial values from the row.
   * Subscribes to each control's `valueChanges` to auto-clear stale API errors on input.
   * @param row - The row whose current values pre-fill the form controls.
   */
  private buildEditForm(row: EulbRow): void {
    this.editForm = this.fb.group({});

    for (const field of this.rowEditFields()) {
      const key = field.key;
      if (!key || !field.formFieldType) continue;

      const rawValue = (row as unknown as Record<string, unknown>)[key];
      const value = field.formFieldType === 'date' ? (this.toHtmlDate(rawValue) ?? '') : (rawValue ?? '');

      const fieldForControl: ConditionalFieldConfig = {
        ...field,
        value,
        readonly: false,
      };

      const control = this.dynamicService.createContorl(fieldForControl, false, false);
      this.editForm.addControl(key, control);
      control.updateValueAndValidity({ emitEvent: false });

      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.clearApiError(key);
      });
    }

    this.bindEnabledWhenToEditForm(this.editForm);
  }

  /** Returns `true` when the edit-form control for `field` is currently enabled. */
  isEditFieldEnabled(field: string): boolean {
    return !this.editForm.get(field)?.disabled;
  }

  /** Returns the `disabledReason` string from the field config, or empty string if none. */
  getEditFieldDisabledReason(field: string): string {
    return this.getRowEditFieldConfig(field)?.disabledReason ?? '';
  }

  /**
   * Builds a dependency map of controller keys → dependent fields via `enabledWhen`,
   * applies the initial enabled/disabled state, then subscribes to controller changes
   * to reapply state reactively.
   */
  private bindEnabledWhenToEditForm(form: FormGroup): void {
    const deps = new Map<string, ConditionalFieldConfig[]>();
    for (const field of this.rowEditFields()) {
      if (!field.enabledWhen?.conditions?.length || !field.key) continue;
      for (const condition of field.enabledWhen.conditions) {
        const list = deps.get(condition.key) ?? [];
        if (!list.some((f) => f.key === field.key)) list.push(field);
        deps.set(condition.key, list);
      }
    }
    if (!deps.size) return;

    this.applyEnabledWhen(form, deps);

    for (const controllerKey of deps.keys()) {
      const ctrl = form.get(controllerKey);
      if (!ctrl) continue;
      ctrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.applyEnabledWhen(form, deps);
      });
    }
  }

  /**
   * Evaluates `enabledWhen` for every dependent field and enables or disables its control.
   * When disabling: clears value (if `clearValueWhenDisabled`), removes validators, clears errors.
   * When enabling: restores validators from field config.
   * Marks the view for check so `OnPush` CD picks up the new disabled state.
   */
  private applyEnabledWhen(form: FormGroup, deps: Map<string, ConditionalFieldConfig[]>): void {
    const allDependents = [...new Set([...deps.values()].flat())];

    for (const field of allDependents) {
      if (!field.key) continue;
      const control = form.get(field.key);
      if (!control) continue;

      const shouldEnable = this.visibilityService.evaluateConditions(field.enabledWhen, (key) => form.get(key)?.value);

      if (shouldEnable) {
        if (this.canEditRows) {
          control.enable({ emitEvent: false });
        }
        const validators = this.dynamicService.bindValidations(field.validations, field);
        control.setValidators(validators);
        control.updateValueAndValidity({ emitEvent: false });
      } else {
        if (field.clearValueWhenDisabled) {
          control.setValue('', { emitEvent: false });
        }
        control.clearValidators();
        control.setErrors(null);
        control.markAsUntouched();
        control.markAsPristine();
        control.disable({ emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
      }
    }

    this.cdr.markForCheck();
  }

  /**
   * Removes the `apiErrors` key from a single edit-form control's error map.
   * Leaves all other errors untouched.
   * @param field - The editable field name.
   */
  private clearApiError(field: string): void {
    const control = this.editForm.get(field);
    if (!control?.errors?.['apiErrors']) return;
    const remainingErrors = { ...control.errors };
    delete remainingErrors['apiErrors'];
    control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
  }

  /** Clears API errors from all current edit-form controls. Called on cancel and on successful save. */
  private clearAllEditApiErrors(): void {
    for (const key of Object.keys(this.editForm.controls)) {
      this.clearApiError(key);
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

  /**
   * Returns the configured validation message for a specific validator on a field,
   * or `null` when no message is defined in `rowEditFields`.
   */
  private getValidationMessage(fieldKey: string, validationName: string): string | null {
    const cfg = this.getRowEditFieldConfig(fieldKey)?.validations?.find((v) => v.name === validationName);
    return cfg?.message ?? null;
  }

  /**
   * Returns the `rowEditFields` config entry for the given key, or `undefined` if absent.
   * @param fieldKey - The field key to look up.
   */
  private getRowEditFieldConfig(fieldKey: string): ConditionalFieldConfig | undefined {
    return this.rowEditFields().find((f) => f.key === fieldKey);
  }

  /**
   * Converts any date-like value to a `yyyy-MM-dd` string suitable for `<input type="date">`.
   * Handles `Date` objects, ISO strings, `YYYY-MM-DD` strings, and relative expressions like `TODAY`.
   * Returns `null` for null/undefined/empty/unparseable inputs without throwing.
   * @param value - Raw date value from row data or field config.
   */
  private toHtmlDate(value: unknown): string | null {
    if (value === null || value === undefined || value === '') return null;
    try {
      const resolved = resolveDateConstraint(value);
      if (!resolved || isNaN(resolved.getTime())) return null;
      const y = resolved.getFullYear();
      const m = String(resolved.getMonth() + 1).padStart(2, '0');
      const d = String(resolved.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch {
      return null;
    }
  }
}
