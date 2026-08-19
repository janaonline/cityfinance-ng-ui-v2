import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';
import { UtilityService } from '../../../../../../core/services/utility.service';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import { DevolutionValidationBadgeComponent } from '../../components/validation-badge/devolution-validation-badge.component';
import {
  DevolutionRow,
  DevolutionRowsDialogData,
  DevolutionRowsDialogResult,
  DevolutionRowsQuery,
  DevolutionValidationSummary,
  DfRowUpdateApiError,
} from '../../devolution-formula.models';
import { DevolutionFormulaService } from '../../devolution-formula.service';
import {
  buildDfRowUpdatePayload,
  buildDfRowViewModel,
  DfRowViewModel,
  isDfRowValidationStatus,
  parseDfRowUpdateErrors,
} from '../../devolution-formula.utils';

const DF_ROW_VALIDATION_STATUS_OPTIONS = [
  { value: 'VALID' as const, label: 'Valid' },
  { value: 'INVALID' as const, label: 'Invalid' },
] as const;

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

@Component({
  selector: 'app-devolution-formula-rows-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    DevolutionValidationBadgeComponent,
  ],
  templateUrl: './devolution-formula-rows-dialog.component.html',
  styleUrl: './devolution-formula-rows-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevolutionFormulaRowsDialogComponent implements OnInit {
  private readonly service = inject(DevolutionFormulaService);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  private readonly dialogRef = inject(MatDialogRef<DevolutionFormulaRowsDialogComponent>);
  private readonly data = inject<DevolutionRowsDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly amountDisplay = inject(AmountDisplayModeService);

  readonly stateId = this.data.stateId;
  readonly yearId = this.data.yearId;
  readonly installment = this.data.installment;
  readonly canEdit = this.data.canEdit;
  readonly rowEditFields = signal<ConditionalFieldConfig[]>(this.data.rowEditFields ?? []);
  private currentEditFields: ConditionalFieldConfig[] = [];

  readonly rows = signal<DevolutionRow[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 20;
  readonly isLoading = signal(false);
  readonly editingRowId = signal<string | null>(null);
  readonly isUpdatingRowId = signal<string | null>(null);
  readonly latestSummary = signal<DevolutionValidationSummary | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  readonly startIndex = computed(() => (this.page() - 1) * this.limit + 1);
  readonly endIndex = computed(() => Math.min(this.page() * this.limit, this.total()));
  readonly rowViewModels = computed<DfRowViewModel<DevolutionRow>[]>(() => this.rows().map(buildDfRowViewModel));

  readonly validationStatusOptions = DF_ROW_VALIDATION_STATUS_OPTIONS;

  protected readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');

  private loadRequestId = 0;
  private hasSavedRowChanges = false;
  private readonly editFormTeardown$ = new Subject<void>();

  filterForm = this.fb.group({
    search: [''],
    validationStatus: [''],
  });

  editForm: FormGroup = this.fb.group({});

  ngOnInit(): void {
    if (this.data.initialValidationStatusFilter) {
      this.filterForm.controls.validationStatus.setValue(this.data.initialValidationStatusFilter, {
        emitEvent: false,
      });
    }
    this.loadRows();
    this.setupFilterSubscription();
  }

  loadRows(): void {
    const requestId = ++this.loadRequestId;
    this.isLoading.set(true);

    const { search, validationStatus } = this.filterForm.getRawValue();
    const query: DevolutionRowsQuery = {
      page: this.page(),
      limit: this.limit,
      search: search || undefined,
      validationStatus: isDfRowValidationStatus(validationStatus) ? validationStatus : undefined,
    };

    this.service
      .getRows(this.stateId, this.yearId, this.installment, query)
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

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadRows();
  }

  startEdit(row: DevolutionRow): void {
    if (!this.canEdit) return;
    // Clear any stale API errors from a previous edit session before rebuilding the form.
    this.clearAllEditApiErrors();
    this.editingRowId.set(row._id);
    this.buildEditForm(row);
  }

  startEditAtField(row: DevolutionRow, field: string): void {
    if (!this.canEdit || this.editingRowId() !== null || !this.hasCellError(row, field)) return;
    this.startEdit(row);
    setTimeout(() => {
      const el = this.elementRef.nativeElement.querySelector(`[data-df-edit-field="${field}"]`);
      if (el instanceof HTMLElement) el.focus();
    }, 50);
  }

  cancelEdit(): void {
    this.resetEditFormSubscriptions();
    this.clearAllEditApiErrors();
    this.editingRowId.set(null);
    this.editForm = this.fb.group({});
  }

  saveRow(rowId: string): void {
    if (!this.canEdit) return;
    this.editForm.markAllAsTouched();
    this.editForm.updateValueAndValidity();
    if (this.editForm.invalid) return;

    this.isUpdatingRowId.set(rowId);

    const raw = this.editForm.getRawValue() as {
      totalGrantAllocation: number | null;
      installment1Amount: number | null;
      installment2Amount: number | null;
      devolutionFormula: string | null;
    };

    const payload = buildDfRowUpdatePayload(
      raw.totalGrantAllocation,
      raw.installment1Amount,
      raw.installment2Amount,
      raw.devolutionFormula,
    );

    this.service
      .updateRow(this.stateId, this.yearId, this.installment, rowId, payload)
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
          const apiErrors = parseDfRowUpdateErrors(err);

          if (apiErrors.length > 0) {
            this.applyRowUpdateErrors(apiErrors);
            this.utilityService.triggerSnackbar('Row has validation errors. Please correct them.', 'snackbar-danger');
          } else {
            this.utilityService.triggerSnackbar('Failed to update row. Please try again.', 'snackbar-danger');
          }
        },
      });
  }

  close(): void {
    const result: DevolutionRowsDialogResult = {};
    if (this.hasSavedRowChanges) {
      const summary = this.latestSummary();
      if (summary) result.updatedSummary = summary;
    }
    this.dialogRef.close(result);
  }

  hasEditFieldError(field: string): boolean {
    const control = this.editForm.get(field);
    return !!control?.invalid && !!(control.touched || control.dirty);
  }

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
      min: 'Value is below the minimum allowed.',
      max: 'Value exceeds the maximum allowed.',
      minlength: 'Value is too short.',
      maxlength: 'Value is too long.',
      pattern: 'Invalid format.',
    };

    for (const key of Object.keys(errors)) {
      if (key === 'apiErrors') continue;
      addMessage(this.getValidationMessage(field, key) || fallbacks[key] || 'Invalid value.');
    }

    return messages;
  }

  // Case-insensitive fallback handles Angular normalizing maxLength → maxlength.
  private getValidationMessage(fieldKey: string, validationName: string): string | null {
    const validations = this.getRowEditFieldConfig(fieldKey)?.validations;
    if (!validations) return null;
    const cfg =
      validations.find((v) => v.name === validationName) ??
      validations.find((v) => v.name.toLowerCase() === validationName.toLowerCase());
    return cfg?.message ?? null;
  }

  private getRowEditFieldConfig(fieldKey: string): ConditionalFieldConfig | undefined {
    return this.currentEditFields.find((f) => f.key === fieldKey);
  }

  getEditFieldErrorText(field: string): string {
    return this.getEditFieldErrors(field).join('\n');
  }

  getEditFormControl(key: string): FormControl | null {
    const ctrl = this.editForm.get(key);
    return ctrl instanceof FormControl ? ctrl : null;
  }

  private buildEditForm(row: DevolutionRow): void {
    this.resetEditFormSubscriptions();
    this.editForm = this.fb.group({});
    this.currentEditFields = this.rowEditFields();

    const EDITABLE_KEYS = new Set([
      'totalGrantAllocation',
      'installment1Amount',
      'installment2Amount',
      'devolutionFormula',
    ]);

    for (const field of this.currentEditFields) {
      const key = field.key;
      if (!key || !field.formFieldType || !EDITABLE_KEYS.has(key)) continue;

      const rawValue = (row as unknown as Record<string, unknown>)[key];
      // Normalize maxLength/minLength → maxlength/minlength so DynamicFormService.bindValidations recognizes them.
      const validations = field.validations?.map((v) =>
        v.name === 'maxLength' || v.name === 'minLength' ? { ...v, name: v.name.toLowerCase() } : v,
      );
      const fieldForControl: ConditionalFieldConfig = {
        ...field,
        validations,
        value: rawValue ?? null,
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
  }

  /** Empty-state copy that reflects the currently active filters, instead of one generic string. */
  emptyStateMessage(): string {
    const { search, validationStatus } = this.filterForm.getRawValue();
    if (validationStatus === 'INVALID') return 'No rows with validation errors found.';
    if (validationStatus === 'VALID') return 'No valid rows found for the current filters.';
    if (search) return 'No rows match your search.';
    return 'No rows found for the current filters.';
  }

  private hasCellError(row: DevolutionRow, field: string): boolean {
    return buildDfRowViewModel(row).cellHasError[field] ?? false;
  }

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

  private clearAllEditApiErrors(): void {
    for (const key of Object.keys(this.editForm.controls)) {
      this.clearApiError(key);
    }
  }

  private applyRowUpdateErrors(errors: DfRowUpdateApiError[]): void {
    const grouped = errors.reduce<Record<string, string[]>>((acc, err) => {
      if (!err.field) return acc;
      acc[err.field] = [...(acc[err.field] ?? []), err.message];
      return acc;
    }, {});

    const unmatchedMessages: string[] = [];

    for (const [field, messages] of Object.entries(grouped)) {
      const control = this.editForm.get(field);
      if (!control) {
        // Field has no editable control (e.g. censusCode, unknownUlb).
        // Collect the messages so they can be surfaced to the user.
        unmatchedMessages.push(...messages);
        continue;
      }
      control.setErrors({ ...(control.errors ?? {}), apiErrors: messages });
      control.markAsTouched();
    }

    if (unmatchedMessages.length > 0) {
      this.utilityService.triggerSnackbar(unmatchedMessages[0], 'snackbar-danger');
    }
  }

  private setupFilterSubscription(): void {
    const { search, validationStatus } = this.filterForm.controls;
    merge(search.valueChanges.pipe(debounceTime(400), distinctUntilChanged()), validationStatus.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.loadRows();
      });
  }
}
