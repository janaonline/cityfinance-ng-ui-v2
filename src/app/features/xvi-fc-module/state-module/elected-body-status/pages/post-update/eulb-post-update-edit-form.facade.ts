import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../../dynamic-form-visibility.service';
import {
  EulbBodyStatus,
  EulbEditableFieldKey,
  EulbPostSubmissionUpdateRow,
  EulbPostSubmissionUpdateValidateRowPayload,
} from '../../eulb-status.models';
import {
  getEulbEditDateMax,
  getEulbEditDateMin,
  isEulbBodyStatus,
  isEulbEditableFieldKey,
} from '../../shared/eulb-row-edit.utils';

/** Typed reactive form for a single row edit in the post-submission update flow. */
export type EulbPostUpdateEditForm = FormGroup<{
  electedBodyStatus: FormControl<EulbBodyStatus | ''>;
  dateOfConstitution: FormControl<string>;
  dateOfExpiry: FormControl<string>;
  remarks: FormControl<string>;
}>;

/** Constructor dependencies for {@link EulbPostUpdateEditFormFacade}. */
export interface EulbPostUpdateEditFormFacadeOptions {
  readonly dynamicService: Pick<DynamicFormService, 'bindValidations'>;
  readonly visibilityService: Pick<DynamicFormVisibilityService, 'evaluateConditions'>;
  readonly markForCheck?: () => void;
}

/** Options supplied to {@link EulbPostUpdateEditFormFacade.startEdit} to open a row edit session. */
export interface EulbPostUpdateStartEditOptions {
  readonly payload: EulbPostSubmissionUpdateValidateRowPayload;
  readonly fields: readonly ConditionalFieldConfig[];
  readonly canEdit: boolean;
  readonly onChange: () => void;
}

const EMPTY_EDIT_PAYLOAD: EulbPostSubmissionUpdateValidateRowPayload = {
  rowId: '',
  electedBodyStatus: 'Constituted',
  dateOfConstitution: null,
  dateOfExpiry: null,
  remarks: '',
};

/** Manages form creation, enabled-when conditional bindings, and payload serialisation for a single EULB post-update row edit session. */
export class EulbPostUpdateEditFormFacade {
  private readonly dynamicService: Pick<DynamicFormService, 'bindValidations'>;
  private readonly visibilityService: Pick<DynamicFormVisibilityService, 'evaluateConditions'>;
  private readonly markForCheck: () => void;
  private subscriptions = new Subscription();
  private fields: ConditionalFieldConfig[] = [];

  form: EulbPostUpdateEditForm = createEulbPostUpdateEditForm(EMPTY_EDIT_PAYLOAD);

  constructor(options: EulbPostUpdateEditFormFacadeOptions) {
    this.dynamicService = options.dynamicService;
    this.visibilityService = options.visibilityService;
    this.markForCheck = options.markForCheck ?? (() => undefined);
  }

  setFields(fields: readonly ConditionalFieldConfig[]): void {
    this.fields = this.resolveFields(fields);
  }

  /** Filters to editable fields only and strips the 6th Schedule option from electedBodyStatus. */
  resolveFields(fields: readonly ConditionalFieldConfig[]): ConditionalFieldConfig[] {
    return filterPostUpdateRowEditFields(fields);
  }

  getFields(): readonly ConditionalFieldConfig[] {
    return this.fields;
  }

  getEditableFieldKeys(fields: readonly ConditionalFieldConfig[] = this.fields): ReadonlySet<EulbEditableFieldKey> {
    return new Set(fields.map((field) => field.key).filter(isEulbEditableFieldKey));
  }

  isFieldEditable(field: EulbEditableFieldKey, fields: readonly ConditionalFieldConfig[] = this.fields): boolean {
    return this.getEditableFieldKeys(fields).has(field);
  }

  /** Tears down any previous session, builds a new form from payload, wires subscriptions, and returns the form. */
  startEdit(options: EulbPostUpdateStartEditOptions): EulbPostUpdateEditForm {
    this.resetBindings();
    this.setFields(options.fields);
    this.form = createEulbPostUpdateEditForm(options.payload);
    this.bindFieldErrorCleanup();
    this.subscriptions.add(this.form.valueChanges.subscribe(() => options.onChange()));
    this.bindEnabledWhen(options.canEdit);
    return this.form;
  }

  resetEditState(): void {
    this.resetBindings();
  }

  /** Merges current form values with the loaded row — the row provides rowId and the fallback electedBodyStatus if the form value is empty. */
  readPayload(loadedRow: EulbPostSubmissionUpdateRow): EulbPostSubmissionUpdateValidateRowPayload {
    const raw = this.form.getRawValue();
    const status = isEulbBodyStatus(raw.electedBodyStatus) ? raw.electedBodyStatus : loadedRow.electedBodyStatus;

    return {
      rowId: loadedRow._id,
      electedBodyStatus: status,
      dateOfConstitution: toDatePayloadValue(raw.dateOfConstitution),
      dateOfExpiry: toDatePayloadValue(raw.dateOfExpiry),
      remarks: raw.remarks,
    };
  }

  getEditDateMin(fieldKey: string): string | null {
    return getEulbEditDateMin(this.getFieldConfig(fieldKey), (key) => this.form.get(key)?.value);
  }

  getEditDateMax(fieldKey: string): string | null {
    return getEulbEditDateMax(this.getFieldConfig(fieldKey), (key) => this.form.get(key)?.value);
  }

  isFieldEnabled(fieldKey: string): boolean {
    return !this.form.get(fieldKey)?.disabled;
  }

  getFieldDisabledReason(fieldKey: string): string {
    return this.getFieldConfig(fieldKey)?.disabledReason ?? '';
  }

  private getFieldConfig(fieldKey: string): ConditionalFieldConfig | undefined {
    return this.fields.find((field) => field.key === fieldKey);
  }

  private bindFieldErrorCleanup(): void {
    for (const control of Object.values(this.form.controls)) {
      this.subscriptions.add(
        control.valueChanges.subscribe(() => {
          clearStaleApiErrors(control.errors, (errors) => control.setErrors(errors));
        }),
      );
    }
  }

  private bindEnabledWhen(canEdit: boolean): void {
    const deps = createEnabledWhenDependencyMap(this.fields);
    if (!deps.size) return;

    this.applyEnabledWhen(deps, canEdit);

    for (const controllerKey of deps.keys()) {
      const control = this.form.get(controllerKey);
      if (!control) continue;

      this.subscriptions.add(
        control.valueChanges.subscribe(() => {
          this.applyEnabledWhen(deps, canEdit);
        }),
      );
    }
  }

  private applyEnabledWhen(deps: Map<string, ConditionalFieldConfig[]>, canEdit: boolean): void {
    const allDependents = [...new Set([...deps.values()].flat())];

    for (const field of allDependents) {
      if (!field.key) continue;

      const control = this.form.get(field.key);
      if (!control) continue;

      const shouldEnable = this.visibilityService.evaluateConditions(
        field.enabledWhen,
        (key) => this.form.get(key)?.value,
      );

      if (shouldEnable) {
        if (canEdit) {
          control.enable({ emitEvent: false });
        }
        const validators = this.dynamicService.bindValidations(field.validations, field, (key) =>
          this.form.get(key)?.value,
        );
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

    this.markForCheck();
  }

  private resetBindings(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }
}

/** Creates a pre-populated form from the row payload; maps 6th Schedule → empty string since 6th Schedule is not an editable choice. */
export function createEulbPostUpdateEditForm(
  payload: EulbPostSubmissionUpdateValidateRowPayload,
): EulbPostUpdateEditForm {
  const editableStatus = payload.electedBodyStatus === '6th Schedule' ? '' : payload.electedBodyStatus;

  return new FormGroup({
    electedBodyStatus: new FormControl<EulbBodyStatus | ''>(editableStatus, { nonNullable: true }),
    dateOfConstitution: new FormControl(payload.dateOfConstitution ?? '', { nonNullable: true }),
    dateOfExpiry: new FormControl(payload.dateOfExpiry ?? '', { nonNullable: true }),
    remarks: new FormControl(payload.remarks, { nonNullable: true }),
  });
}

/** Matches the leading 'FIELD:<key>' segment of a minDate/maxDate relative expression (ignoring
 *  any '+-N[DMY]' offset suffix) — used only to discover cross-field date-bound dependencies. */
const FIELD_RELATIVE_KEY_PATTERN = /^FIELD:([A-Za-z0-9_]+)/;

function extractFieldRelativeKey(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return FIELD_RELATIVE_KEY_PATTERN.exec(value.trim())?.[1] ?? null;
}

/** Sibling field keys a field's minDate/maxDate (top-level or in `validations[]`) references via
 *  a `FIELD:<key>` token — e.g. dateOfExpiry's maxDate referencing dateOfConstitution. */
function collectDateBoundControllerKeys(field: ConditionalFieldConfig): string[] {
  const keys = new Set<string>();
  const consider = (value: unknown) => {
    const key = extractFieldRelativeKey(value);
    if (key) keys.add(key);
  };

  consider(field.minDate);
  consider(field.maxDate);
  for (const validation of field.validations ?? []) {
    if (validation.name === 'minDate' || validation.name === 'maxDate') {
      consider(validation.validator);
    }
  }

  return [...keys];
}

/**
 * Maps a "controller" field key to the fields that depend on it — either because their
 * `enabledWhen` references it, or because their minDate/maxDate is a `FIELD:<key>` expression
 * bound to it (e.g. dateOfExpiry's maxDate = dateOfConstitution + 5 years). Both kinds of
 * dependents are re-applied identically by `applyEnabledWhen` whenever the controller's
 * `valueChanges` fires.
 */
function createEnabledWhenDependencyMap(
  fields: readonly ConditionalFieldConfig[],
): Map<string, ConditionalFieldConfig[]> {
  const deps = new Map<string, ConditionalFieldConfig[]>();

  const addDependent = (controllerKey: string, field: ConditionalFieldConfig) => {
    const dependents = deps.get(controllerKey) ?? [];
    if (!dependents.some((dependent) => dependent.key === field.key)) {
      dependents.push(field);
    }
    deps.set(controllerKey, dependents);
  };

  for (const field of fields) {
    if (!field.key) continue;

    for (const condition of field.enabledWhen?.conditions ?? []) {
      addDependent(condition.key, field);
    }
    for (const controllerKey of collectDateBoundControllerKeys(field)) {
      addDependent(controllerKey, field);
    }
  }

  return deps;
}

function clearStaleApiErrors(
  errors: ValidationErrors | null,
  setErrors: (errors: ValidationErrors | null) => void,
): void {
  if (!errors?.['apiErrors']) return;

  const remainingErrors: ValidationErrors = {};
  for (const [key, value] of Object.entries(errors)) {
    if (key !== 'apiErrors') {
      remainingErrors[key] = value;
    }
  }

  setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
}

function toDatePayloadValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function shouldFilterExemptOption(option: unknown): boolean {
  if (option === '6th Schedule') return true;
  if (!isOptionRecord(option)) return false;

  const possibleValues = [option['id'], option['value'], option['label'], option['name']];
  return possibleValues.some((value) => value === '6th Schedule');
}

function filterExemptOptions(options: readonly unknown[] | undefined): unknown[] | undefined {
  if (!options) return undefined;
  return options.filter((option) => !shouldFilterExemptOption(option));
}

function filterPostUpdateRowEditFields(fields: readonly ConditionalFieldConfig[]): ConditionalFieldConfig[] {
  return fields
    .filter((field) => isEulbEditableFieldKey(field.key))
    .map((field) =>
      field.key === 'electedBodyStatus' ? { ...field, options: filterExemptOptions(field.options) } : { ...field },
    );
}

function isOptionRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
