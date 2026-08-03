import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, merge, Subject, takeUntil } from 'rxjs';
import { UtilityService } from '../../../../../../core/services/utility.service';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../../dynamic-form-visibility.service';
import { EulbStatusService } from '../../eulb-status.service';
import {
  EulbBodyStatus,
  EulbEditableFieldKey,
  EulbRow,
  EulbRowEditFormValue,
  EulbRowError,
  EulbRowUpdateApiError,
  EulbRowsDialogData,
  EulbRowsDialogResult,
  EulbRowsQuery,
  EulbValidationSummary,
} from '../../eulb-status.models';
import { buildEulbRowUpdatePayload, getRecordValue, isRecord, parseEulbRowUpdateErrors } from '../../eulb-status.utils';
import {
  bindEulbEnabledWhenToEditForm,
  buildEulbRowViewModel,
  EULB_ROW_VALIDATION_STATUS_OPTIONS,
  getEulbEditDateMax,
  getEulbEditDateMin,
  isEulbBodyStatus,
  isEulbRowValidationStatus,
  toEulbHtmlDate,
} from '../../shared/eulb-row-edit.utils';
import { EulbEditableFieldCellComponent } from '../../components/editable-field-cell/eulb-editable-field-cell.component';
import { EulbValidationBadgeComponent } from '../../components/validation-badge/eulb-validation-badge.component';

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

type EulbRowStringEditField = 'dateOfConstitution' | 'dateOfExpiry' | 'remarks';

const ERROR_FIELD_OPTIONS: ReadonlyArray<{ readonly value: EulbEditableFieldKey; readonly label: string }> = [
  { value: 'electedBodyStatus', label: 'Elected Body Status' },
  { value: 'dateOfConstitution', label: 'Date of Constitution' },
  { value: 'dateOfExpiry', label: 'Date of Expiry' },
  { value: 'remarks', label: 'Remarks' },
];

@Component({
  selector: 'app-eulb-rows-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    EulbEditableFieldCellComponent,
    EulbValidationBadgeComponent,
  ],
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);

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
  readonly rowViewModels = computed(() => this.rows().map(buildEulbRowViewModel));

  readonly electedBodyStatusOptions: EulbBodyStatus[] = ['Constituted', 'Not Constituted', 'Exempt'];
  readonly validationStatusOptions = EULB_ROW_VALIDATION_STATUS_OPTIONS;
  readonly errorFieldOptions = ERROR_FIELD_OPTIONS;

  private hasSavedRowChanges = false;
  private loadRequestId = 0;
  private currentEditFields: ConditionalFieldConfig[] = [];
  private readonly editFormTeardown$ = new Subject<void>();

  filterForm = this.fb.group({
    search: [''],
    validationStatus: [''],
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
    const requestId = ++this.loadRequestId;
    this.isLoading.set(true);

    const { search, validationStatus, errorField } = this.filterForm.getRawValue();
    const query: EulbRowsQuery = {
      page: this.page(),
      limit: this.limit,
      search: search || undefined,
      validationStatus: isEulbRowValidationStatus(validationStatus) ? validationStatus : undefined,
      errorField: errorField || undefined,
    };

    this.service
      .getRows(this.stateId, this.yearId, query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (requestId !== this.loadRequestId) return;
          this.rows.set(res.data.rows);
          this.total.set(res.data.total);
          this.isLoading.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) return;
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

  /** Returns the edit-field config list — the same for every row, since every row is
   *  registry-backed (censusCode/ulbName are never portal-editable). */
  getEditableFieldsForRow(): ConditionalFieldConfig[] {
    return this.rowEditFields();
  }

  /**
   * Puts the given row into edit mode and builds the edit form from the row-specific field list.
   * @param row - The row to edit.
   */
  startEdit(row: EulbRow): void {
    if (!this.canEditRows) return;
    this.editingRowId.set(row._id);
    this.buildEditForm(row);
  }

  /** Exits edit mode without saving, clears all API field errors, and resets the edit form. */
  cancelEdit(): void {
    this.resetEditFormSubscriptions();
    this.clearAllEditApiErrors();
    this.editingRowId.set(null);
    this.editForm = this.fb.group({});
  }

  private getRowEditFormValue(): EulbRowEditFormValue {
    const electedBodyStatusValue = this.editForm.get('electedBodyStatus')?.value;
    const electedBodyStatus =
      electedBodyStatusValue === '' || isEulbBodyStatus(electedBodyStatusValue) ? electedBodyStatusValue : undefined;

    return {
      electedBodyStatus,
      dateOfConstitution: this.getRowStringEditControlValue('dateOfConstitution'),
      dateOfExpiry: this.getRowStringEditControlValue('dateOfExpiry'),
      remarks: this.getRowStringEditControlValue('remarks'),
    };
  }

  private getRowStringEditControlValue(field: EulbRowStringEditField): string | undefined {
    const value = this.editForm.get(field)?.value;
    return typeof value === 'string' ? value : undefined;
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

    const payload = buildEulbRowUpdatePayload(this.getRowEditFormValue());

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
          const apiErrors = parseEulbRowUpdateErrors(err);

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

    for (const msg of toStringArray(errors['apiErrors'])) {
      addMessage(msg);
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
    return getEulbEditDateMin(this.getRowEditFieldConfig(fieldKey));
  }

  /**
   * Returns the `yyyy-MM-dd` maximum date string for the given date field,
   * derived from the API-provided `rowEditFields` config. Returns `null` if
   * no maximum constraint is defined.
   * @param fieldKey - The field key (e.g. `'dateOfExpiry'`).
   */
  getEditDateMax(fieldKey: string): string | null {
    return getEulbEditDateMax(this.getRowEditFieldConfig(fieldKey));
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
      const el = this.elementRef.nativeElement.querySelector(`[data-eulb-edit-field="${field}"]`);
      if (el instanceof HTMLElement) el.focus();
    }, 50);
  }

  /**
   * Builds the edit form dynamically from the row-specific field list, setting initial values from the row.
   * Subscribes to each control's `valueChanges` to auto-clear stale API errors on input.
   * @param row - The row whose current values pre-fill the form controls.
   */
  private buildEditForm(row: EulbRow): void {
    this.resetEditFormSubscriptions();
    this.editForm = this.fb.group({});
    this.currentEditFields = this.getEditableFieldsForRow();

    for (const field of this.currentEditFields) {
      const key = field.key;
      if (!key || !field.formFieldType) continue;

      const rawValue = this.getEditableRowValue(row, key);
      const value = field.formFieldType === 'date' ? (toEulbHtmlDate(rawValue) ?? '') : (rawValue ?? '');

      const fieldForControl: ConditionalFieldConfig = {
        ...field,
        value,
        readonly: false,
      };

      const control = this.dynamicService.createContorl(fieldForControl, false, false);
      this.editForm.addControl(key, control);
      control.updateValueAndValidity({ emitEvent: false });

      control.valueChanges
        .pipe(takeUntil(this.editFormTeardown$), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.clearApiError(key);
        });
    }

    this.bindEnabledWhenToEditForm(this.editForm);
  }

  private getEditableRowValue(row: EulbRow, fieldKey: string): unknown {
    return getRecordValue(row, fieldKey);
  }

  /** Returns the typed `FormControl` for the given edit-form field, or `null` when absent. */
  getEditFormControl(key: string): FormControl<string | null> | null {
    const ctrl = this.editForm.get(key);
    return ctrl instanceof FormControl ? (ctrl as FormControl<string | null>) : null;
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
    bindEulbEnabledWhenToEditForm({
      form,
      fields: this.currentEditFields,
      canEdit: this.canEditRows,
      dynamicService: this.dynamicService,
      visibilityService: this.visibilityService,
      editFormTeardown$: this.editFormTeardown$,
      destroyRef: this.destroyRef,
      cdr: this.cdr,
    });
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

  private resetEditFormSubscriptions(): void {
    this.editFormTeardown$.next();
  }

  /** Clears API errors from all current edit-form controls. Called on cancel and on successful save. */
  private clearAllEditApiErrors(): void {
    for (const key of Object.keys(this.editForm.controls)) {
      this.clearApiError(key);
    }
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
    const { search, validationStatus, errorField } = this.filterForm.controls;

    merge(
      search.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      validationStatus.valueChanges,
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
    if (!isRecord(err)) return null;
    const body = err['error'];
    if (!isRecord(body)) return null;
    const message = body['message'];
    return typeof message === 'string' ? message : null;
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
    return this.currentEditFields.find((f) => f.key === fieldKey);
  }
}
