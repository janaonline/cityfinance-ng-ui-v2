import { DestroyRef, Injectable, WritableSignal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Observable, takeUntil } from 'rxjs';
import { DynamicFormService } from '../../shared/dynamic-form/dynamic-form.service';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';

export type VisibleWhenMode = 'all' | 'any';

export type VisibilityCondition =
  | { key: string; operator: 'equals'; value: unknown }
  | { key: string; operator: 'notEquals'; value: unknown }
  | { key: string; operator: 'in'; value: unknown[] }
  | { key: string; operator: 'notIn'; value: unknown[] }
  | { key: string; operator: 'yearGreaterThan'; value: number }
  /** Unary — tests whether the looked-up field currently holds a value; no `value` needed. */
  | { key: string; operator: 'isNotEmpty' }
  | { key: string; operator: 'isEmpty' };

export interface VisibleWhen {
  mode: VisibleWhenMode;
  conditions: VisibilityCondition[];
}

export type ConditionalFieldConfig = FieldConfig & {
  hidden?: boolean;
  /** Controls whether the field is rendered or hidden. */
  visibleWhen?: VisibleWhen;
  /** Controls whether the rendered field is enabled or disabled. Does not affect visibility. */
  enabledWhen?: VisibleWhen;
  /** Controls whether configured validations are applied. */
  validateWhen?: VisibleWhen;
  /** When `true`, clears the control value when `enabledWhen` evaluates to false. */
  clearValueWhenDisabled?: boolean;
  /** Tooltip hint shown on the control wrapper when it is disabled due to `enabledWhen`. */
  disabledReason?: string;
};

export type DependencyIndex<T extends ConditionalFieldConfig = ConditionalFieldConfig> = Map<string, T[]>;

@Injectable({ providedIn: 'root' })
export class DynamicFormVisibilityService {
  private readonly dynamicFormService = inject(DynamicFormService);

  /**
   * Create a map of controller field keys to the list of fields that depend on them for visibility
   * @param fields - Array of conditional field configurations
   * @returns A map where key is the controller field key and value is an array of dependent fields
   */
  createDependencyIndex<T extends ConditionalFieldConfig>(fields: T[]): DependencyIndex<T> {
    const dependencyIndex: DependencyIndex<T> = new Map();

    for (const field of fields) {
      const conditions = field.visibleWhen?.conditions;
      if (!conditions?.length) continue;

      for (const condition of conditions) {
        const dependents = dependencyIndex.get(condition.key) ?? [];

        // Avoid duplicate entries for the same controller key
        if (!dependents.some((dependent) => dependent.key === field.key)) {
          dependents.push(field);
        }

        dependencyIndex.set(condition.key, dependents);
      }
    }

    return dependencyIndex;
  }

  /**
   * Creates subscriptions for controller fields to listen for value changes
   * and update visibility of dependent fields.
   *
   * @param options Configuration options
   * @param options.form FormGroup containing all form controls
   * @param options.fieldsSignal WritableSignal holding field configurations (formJson)
   * @param options.dependencyIndex Map of controller field keys to dependent fields
   * @param options.destroyRef Angular DestroyRef for cleanup on component destroy
   * @param options.preserveHiddenValue Whether to preserve values of hidden fields
   */
  bindVisibility<T extends ConditionalFieldConfig>(options: {
    form: FormGroup;
    fieldsSignal: WritableSignal<T[]>;
    dependencyIndex: DependencyIndex<T>;
    destroyRef: DestroyRef;
    preserveHiddenValue?: boolean;
    /** When provided, subscriptions are also torn down when this notifier emits (e.g. on form reload). */
    formTeardown$?: Observable<void>;
  }): void {
    const { form, fieldsSignal, dependencyIndex, destroyRef, preserveHiddenValue = true, formTeardown$ } = options;

    // Subscribe only to controller fields - all the fields that have other fields depending on them for visibility
    for (const controllerKey of dependencyIndex.keys()) {
      const control = form.get(controllerKey);
      if (!control) continue;

      let valueChanges$ = control.valueChanges.pipe(takeUntilDestroyed(destroyRef));
      if (formTeardown$) {
        valueChanges$ = valueChanges$.pipe(takeUntil(formTeardown$));
      }
      valueChanges$.subscribe(() => {
        this.applyVisibilityForController({
          controllerKey,
          form,
          fieldsSignal,
          dependencyIndex,
          preserveHiddenValue,
        });
      });
    }

    // Apply initial visibility after controls exist
    for (const controllerKey of dependencyIndex.keys()) {
      this.applyVisibilityForController({
        controllerKey,
        form,
        fieldsSignal,
        dependencyIndex,
        preserveHiddenValue,
      });
    }
  }

  /**
   * Returns an array of fields that are currently visible based on the 'hidden' property
   * and the `render` flag.
   * @param fields - Array of conditional field configurations
   * @returns filtered array containing only the fields that are not hidden and renderable
   */
  getVisibleFields<T extends ConditionalFieldConfig>(fields: T[]): T[] {
    return fields.filter((field) => !field.hidden && field.render !== false);
  }

  /**
   * Use this instead of getRawValue() when you want hidden disabled fields to stay remembered in the form but not be submitted.
   *
   * @param form - FormGroup containing all form controls
   * @param fields - Array of conditional field configurations (formJson) to determine which fields are hidden
   * @returns
   */
  getVisiblePayload<T extends ConditionalFieldConfig>(form: FormGroup, fields: T[]): Record<string, unknown> {
    const payload: Record<string, unknown> = Object.create(null);
    const controls = form.controls as Record<string, { value: unknown }>;

    for (const field of fields) {
      const key = field.key;

      if (field.hidden || field.includeInPayload === false || typeof key !== 'string' || key.length === 0) {
        continue;
      }

      // const control = form.get(key); // If key is nested.
      const control = controls[key];
      if (!control) {
        continue;
      }

      payload[key] = this.dynamicFormService.serializeFieldValue(field, control.value);
    }

    return payload;
  }

  /**
   * - For a given controller field, evaluate visibility of its dependent fields based on current form values and show/hide
   * them accordingly
   * - if preserveHiddenValue is false, hidden field values will be reset i.e, visible again = empty fields.
   * - if preserveHiddenValue is true, hidden field values will be preserved i.e, visible again = previous values.
   *
   * @param options - Configuration options
   * @param options.controllerKey - The key of the controller field whose dependents need visibility evaluation
   * @param options.form - The FormGroup containing all form controls
   * @param options.fieldsSignal - WritableSignal holding the array of field configurations (formJson)
   * @param options.dependencyIndex - Map of controller field keys to their dependent fields (created by createDependencyIndex())
   * @param options.preserveHiddenValue - Whether to preserve values of hidden fields when they are hidden
   * @param options.forceHide - When true, hide all dependents regardless of condition evaluation (used for cascade)
   * @returns void: updates form control states and triggers signal refresh for templates/computed state to reflect visibility changes
   */
  private applyVisibilityForController<T extends ConditionalFieldConfig>(options: {
    controllerKey: string;
    form: FormGroup;
    fieldsSignal: WritableSignal<T[]>;
    dependencyIndex: DependencyIndex<T>;
    preserveHiddenValue: boolean;
    forceHide?: boolean;
  }): void {
    const { controllerKey, form, fieldsSignal, dependencyIndex, preserveHiddenValue, forceHide = false } = options;
    const dependents = dependencyIndex.get(controllerKey);
    if (!dependents?.length) return;

    // Build a visibility map keyed by field.key so the signal update below can
    // look fields up by key rather than mutating the stored reference directly.
    // Direct mutation broke after applyApiErrors() replaced field objects in the
    // signal via spread, making the dependencyIndex references stale.
    const visibilityMap = new Map<string, boolean>();

    for (const field of dependents) {
      if (!field.key) continue;
      const shouldShow = forceHide ? false : this.evaluateFieldVisibility(field, form);
      visibilityMap.set(field.key, shouldShow);

      const control = form.get(field.key);
      if (!control) continue;

      if (shouldShow) {
        control.enable({ emitEvent: false });
      } else {
        if (!preserveHiddenValue) {
          control.reset(null, { emitEvent: false });
        }
        control.disable({ emitEvent: false });
        // Clear errors so hidden fields don't block submission and don't display
        // stale API or client-side error messages when they become hidden.
        control.setErrors(null);
        control.markAsUntouched();
        control.markAsPristine();
      }

      control.updateValueAndValidity({ emitEvent: false });
    }

    // Update the hidden flag on the CURRENT signal objects (by key) rather than
    // the stale dependencyIndex references. Return the same reference when nothing
    // changes to avoid unnecessary object churn.
    fieldsSignal.update((fields) =>
      fields.map((field) => {
        if (!field.key) return field;
        const shouldShow = visibilityMap.get(field.key);
        if (shouldShow === undefined) return field; // not a dependent of this controller
        const newHidden = !shouldShow;
        if (field.hidden === newHidden) return field;
        return { ...field, hidden: newHidden };
      }),
    );

    // Cascade: when a dependent field is hidden and is itself a controller, force-hide
    // all of its own dependents. This covers multi-level chains such as:
    //   isActiveSfc → sfcReportStatus → sfcReport / atrReport
    for (const [key, shouldShow] of visibilityMap) {
      if (!shouldShow && dependencyIndex.has(key)) {
        this.applyVisibilityForController({
          controllerKey: key,
          form,
          fieldsSignal,
          dependencyIndex,
          preserveHiddenValue,
          forceHide: true,
        });
      }
    }
  }

  /**
   * Evaluates a `VisibleWhen` condition group against an arbitrary value-lookup function.
   * Returns `true` when `conditionGroup` is `undefined` or has no conditions.
   * @param conditionGroup - The condition group to evaluate, or `undefined`.
   * @param valueLookup - Callback returning the current value for a given field key.
   */
  evaluateConditions(conditionGroup: VisibleWhen | undefined, valueLookup: (key: string) => unknown): boolean {
    if (!conditionGroup?.conditions?.length) return true;
    const results = conditionGroup.conditions.map((c) => this.evaluateSingleCondition(c, valueLookup));
    return conditionGroup.mode === 'all' ? results.every(Boolean) : results.some(Boolean);
  }

  /**
   * Evaluates field visibility based on its `visibleWhen` conditions and current form values.
   * @param field - The field whose visibility needs to be evaluated.
   * @param form - The FormGroup containing all form controls.
   */
  private evaluateFieldVisibility<T extends ConditionalFieldConfig>(field: T, form: FormGroup): boolean {
    return this.evaluateConditions(field.visibleWhen, (key) => form.get(key)?.value);
  }

  /**
   * Evaluates a single `VisibilityCondition` using a value-lookup callback.
   * @param condition - The individual condition to test.
   * @param valueLookup - Callback returning the current value for a given field key.
   */
  private evaluateSingleCondition(condition: VisibilityCondition, valueLookup: (key: string) => unknown): boolean {
    const rawValue = valueLookup(condition.key);

    switch (condition.operator) {
      case 'equals':
        return rawValue === condition.value;

      case 'notEquals':
        return rawValue !== condition.value;

      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(rawValue);

      case 'notIn':
        return Array.isArray(condition.value) && !condition.value.includes(rawValue);

      case 'yearGreaterThan': {
        const year = this.extractYear(rawValue);
        return year !== null && year > condition.value;
      }

      case 'isNotEmpty':
        return this.isValuePresent(rawValue);

      case 'isEmpty':
        return !this.isValuePresent(rawValue);

      default:
        return false;
    }
  }

  /**
   * Extracts the year from a date string in format DD-MM-YYYY
   * @param value - The date string to extract the year from
   * @returns The extracted year or null if invalid
   */
  private extractYear(value: unknown): number | null {
    if (typeof value !== 'string') return null;

    // Expected format: DD-MM-YYYY
    const parts = value.split('-');
    if (parts.length !== 3) return null;

    const year = Number(parts[2]);
    return Number.isFinite(year) ? year : null;
  }

  /**
   * Unary presence check backing the isNotEmpty/isEmpty operators. Duck-types file-shaped objects
   * (`{fileUrl/path, fileName/originalName, ...}`) the same way the backend's
   * `DynamicFormValidationService.validateFileField` does, so "has a file actually been uploaded"
   * reads correctly rather than treating a file control's default empty shape as present. Mirror
   * any change here in the backend's `dynamic-form-validation.service.ts#isValuePresent`.
   */
  private isValuePresent(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (['fileUrl', 'path', 'fileName', 'originalName'].some((k) => k in obj)) {
        return Boolean(obj['fileUrl'] ?? obj['path']) || Boolean(obj['fileName'] ?? obj['originalName']);
      }
      return Object.keys(obj).length > 0;
    }
    return true; // numbers/booleans (incl. 0/false) are explicit present values
  }
}
