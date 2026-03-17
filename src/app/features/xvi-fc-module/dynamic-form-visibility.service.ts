import { DestroyRef, Injectable, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';

export type VisibilityCondition =
  | { key: string; operator: 'equals'; value: unknown }
  | { key: string; operator: 'yearGreaterThan'; value: number };

export type ConditionalFieldConfig = FieldConfig & {
  hidden?: boolean;
  visibleWhen?: {
    mode: 'all' | 'any';
    conditions: VisibilityCondition[];
  };
};

export type DependencyIndex<T extends ConditionalFieldConfig = ConditionalFieldConfig> = Map<
  string,
  T[]
>;

@Injectable({ providedIn: 'root' })
export class DynamicFormVisibilityService {
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
  }): void {
    const { form, fieldsSignal, dependencyIndex, destroyRef, preserveHiddenValue = true } = options;

    // Subscribe only to controller fields - all the fields that have other fields depending on them for visibility
    for (const controllerKey of dependencyIndex.keys()) {
      const control = form.get(controllerKey);
      if (!control) continue;

      control.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
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
   * @param fields - Array of conditional field configurations
   * @returns filtered array containing only the fields that are not hidden
   */
  getVisibleFields<T extends ConditionalFieldConfig>(fields: T[]): T[] {
    return fields.filter((field) => !field.hidden);
  }

  /**
   * Use this instead of getRawValue() when you want hidden disabled fields to stay remembered in the form but not be submitted.
   *
   * @param form - FormGroup containing all form controls
   * @param fields - Array of conditional field configurations (formJson) to determine which fields are hidden
   * @returns
   */
  getVisiblePayload<T extends ConditionalFieldConfig>(
    form: FormGroup,
    fields: T[],
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = Object.create(null);
    const controls = form.controls as Record<string, { value: unknown }>;

    for (const field of fields) {
      const key = field.key;

      if (field.hidden || typeof key !== 'string' || key.length === 0) {
        continue;
      }

      // const control = form.get(key); // If key is nested.
      const control = controls[key];
      if (!control) {
        continue;
      }

      payload[key] = control.value;
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
   * @returns void: updates form control states and triggers signal refresh for templates/computed state to reflect visibility changes
   */
  private applyVisibilityForController<T extends ConditionalFieldConfig>(options: {
    controllerKey: string;
    form: FormGroup;
    fieldsSignal: WritableSignal<T[]>;
    dependencyIndex: DependencyIndex<T>;
    preserveHiddenValue: boolean;
  }): void {
    const { controllerKey, form, fieldsSignal, dependencyIndex, preserveHiddenValue } = options;
    const dependents = dependencyIndex.get(controllerKey);
    if (!dependents?.length) return;

    for (const field of dependents) {
      const shouldShow = this.evaluateFieldVisibility(field, form);
      field.hidden = !shouldShow;

      const control = form.get(field.key!);
      if (!control) continue;

      if (shouldShow) {
        control.enable({ emitEvent: false });
      } else {
        if (!preserveHiddenValue) {
          control.reset(null, { emitEvent: false });
        }
        control.disable({ emitEvent: false });
      }

      // updateValueAndValidity will trigger re-evaluation of visibility for fields
      control.updateValueAndValidity({ emitEvent: false });
    }

    // trigger signal refresh for templates/computed state
    fieldsSignal.update((fields) => [...fields]);
  }

  /**
   * - Evaluate field visibility based on its 'visibleWhen' conditions and current form values
   * - If visibility.mode is 'all', all conditions must be true for the field to be visible.
   * - If visibility.mode is 'any', at least one condition must be true.
   *
   * @param field - The field whose visibility needs to be evaluated
   * @param form - The FormGroup containing all form controls
   * @returns boolean indicating whether the field should be visible or not
   */
  private evaluateFieldVisibility<T extends ConditionalFieldConfig>(
    field: T,
    form: FormGroup,
  ): boolean {
    const visibility = field.visibleWhen;
    if (!visibility?.conditions?.length) return true;

    const results = visibility.conditions.map((condition) =>
      this.evaluateCondition(condition, form),
    );

    return visibility.mode === 'all' ? results.every(Boolean) : results.some(Boolean);
  }

  /**
   * Evaluate a single visibility condition based on the current form values
   * @param condition - The visibility condition to evaluate
   * @param form - The FormGroup containing all form controls
   * @returns boolean indicating whether the condition is met
   */
  private evaluateCondition(condition: VisibilityCondition, form: FormGroup): boolean {
    const rawValue = form.get(condition.key)?.value;

    switch (condition.operator) {
      case 'equals':
        return rawValue === condition.value;

      case 'yearGreaterThan': {
        const year = this.extractYear(rawValue);
        return year !== null && year > condition.value;
      }

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
}
