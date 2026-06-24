import { ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Observable, takeUntil } from 'rxjs';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { resolveDateConstraint } from '../../../../../shared/dynamic-form/date-constraint-resolver';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../dynamic-form-visibility.service';
import {
  EULB_EDITABLE_FIELDS,
  EulbBodyStatus,
  EulbEditableFieldKey,
  EulbRowValidationStatus,
} from '../eulb-status.models';

export interface EulbRowCellError {
  readonly field?: string;
  readonly message: string;
}

export interface EulbRowCellErrorViewModel {
  readonly cellHasError: Partial<Record<string, boolean>>;
  readonly cellErrorText: Partial<Record<string, string>>;
}

export interface EulbRowViewModel<TRow> extends EulbRowCellErrorViewModel {
  readonly row: TRow;
}

export interface EulbModifiedRowViewModel<TRow> extends EulbRowViewModel<TRow> {
  readonly isModified: boolean;
}

export const EULB_ROW_VALIDATION_STATUS_OPTIONS: ReadonlyArray<{
  readonly value: EulbRowValidationStatus;
  readonly label: string;
}> = [
  { value: 'VALID', label: 'Valid' },
  { value: 'INVALID', label: 'Invalid' },
];

export function isEulbBodyStatus(value: unknown): value is EulbBodyStatus {
  return value === 'Constituted' || value === 'Not Constituted' || value === 'Exempt';
}

export function isEulbRowValidationStatus(value: unknown): value is EulbRowValidationStatus {
  return value === 'VALID' || value === 'INVALID';
}

export function isEulbEditableFieldKey(value: unknown): value is EulbEditableFieldKey {
  return (
    value === EULB_EDITABLE_FIELDS[0] ||
    value === EULB_EDITABLE_FIELDS[1] ||
    value === EULB_EDITABLE_FIELDS[2] ||
    value === EULB_EDITABLE_FIELDS[3]
  );
}

export function getEulbValidationStatusLabel(status: EulbRowValidationStatus): string {
  return status === 'VALID' ? 'Valid' : 'Invalid';
}

export function toEulbHtmlDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;

  try {
    const resolved = resolveDateConstraint(value);
    if (!resolved || isNaN(resolved.getTime())) return null;

    const year = resolved.getFullYear();
    const month = String(resolved.getMonth() + 1).padStart(2, '0');
    const day = String(resolved.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

export function getEulbEditDateMin(field: ConditionalFieldConfig | undefined): string | null {
  if (!field) return null;
  if (field.minDate != null) return toEulbHtmlDate(field.minDate);

  const value = field.validations?.find((validation) => validation.name === 'minDate')?.validator;
  return value != null ? toEulbHtmlDate(value) : null;
}

export function getEulbEditDateMax(field: ConditionalFieldConfig | undefined): string | null {
  if (!field) return null;
  if (field.maxDate != null) return toEulbHtmlDate(field.maxDate);

  const value = field.validations?.find((validation) => validation.name === 'maxDate')?.validator;
  return value != null ? toEulbHtmlDate(value) : null;
}

export function buildEulbRowCellErrorViewModel(
  errors: readonly EulbRowCellError[] | null | undefined,
): EulbRowCellErrorViewModel {
  const cellHasError: Record<string, boolean> = {};
  const cellErrorText: Record<string, string> = {};

  for (const error of errors ?? []) {
    if (!error.field) continue;
    cellHasError[error.field] = true;
    cellErrorText[error.field] = cellErrorText[error.field]
      ? `${cellErrorText[error.field]}\n${error.message}`
      : error.message;
  }

  return { cellHasError, cellErrorText };
}

export function buildEulbRowViewModel<TRow extends { readonly errors?: readonly EulbRowCellError[] }>(
  row: TRow,
): EulbRowViewModel<TRow> {
  return { row, ...buildEulbRowCellErrorViewModel(row.errors) };
}

export function buildEulbModifiedRowViewModel<
  TRow extends { readonly _id: string; readonly errors?: readonly EulbRowCellError[] },
>(row: TRow, changedRows: ReadonlyMap<string, unknown>): EulbModifiedRowViewModel<TRow> {
  return { ...buildEulbRowViewModel(row), isModified: changedRows.has(row._id) };
}

export function bindEulbEnabledWhenToEditForm(options: {
  readonly form: FormGroup;
  readonly fields: readonly ConditionalFieldConfig[];
  readonly canEdit: boolean;
  readonly dynamicService: DynamicFormService;
  readonly visibilityService: DynamicFormVisibilityService;
  readonly editFormTeardown$: Observable<void>;
  readonly destroyRef: DestroyRef;
  readonly cdr: ChangeDetectorRef;
}): void {
  const deps = createEnabledWhenDependencyMap(options.fields);
  if (!deps.size) return;

  applyEulbEnabledWhen(options, deps);

  for (const controllerKey of deps.keys()) {
    const control = options.form.get(controllerKey);
    if (!control) continue;

    control.valueChanges
      .pipe(takeUntil(options.editFormTeardown$), takeUntilDestroyed(options.destroyRef))
      .subscribe(() => {
        applyEulbEnabledWhen(options, deps);
      });
  }
}

function createEnabledWhenDependencyMap(
  fields: readonly ConditionalFieldConfig[],
): Map<string, ConditionalFieldConfig[]> {
  const deps = new Map<string, ConditionalFieldConfig[]>();

  for (const field of fields) {
    if (!field.enabledWhen?.conditions?.length || !field.key) continue;

    for (const condition of field.enabledWhen.conditions) {
      const dependents = deps.get(condition.key) ?? [];
      if (!dependents.some((dependent) => dependent.key === field.key)) {
        dependents.push(field);
      }
      deps.set(condition.key, dependents);
    }
  }

  return deps;
}

function applyEulbEnabledWhen(
  options: {
    readonly form: FormGroup;
    readonly canEdit: boolean;
    readonly dynamicService: DynamicFormService;
    readonly visibilityService: DynamicFormVisibilityService;
    readonly cdr: ChangeDetectorRef;
  },
  deps: Map<string, ConditionalFieldConfig[]>,
): void {
  const allDependents = [...new Set([...deps.values()].flat())];

  for (const field of allDependents) {
    if (!field.key) continue;

    const control = options.form.get(field.key);
    if (!control) continue;

    const shouldEnable = options.visibilityService.evaluateConditions(
      field.enabledWhen,
      (key) => options.form.get(key)?.value,
    );

    if (shouldEnable) {
      if (options.canEdit) {
        control.enable({ emitEvent: false });
      }
      const validators = options.dynamicService.bindValidations(field.validations, field);
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

  options.cdr.markForCheck();
}
