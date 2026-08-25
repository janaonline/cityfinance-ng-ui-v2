import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormMode } from '../../../../shared/dynamic-form/field.interface';
import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

export interface SlbIndicatorGroup {
  section: string;
  fields: ConditionalFieldConfig[];
}

/**
 * The backend's SLB field config carries its sector-grouping key as `meta.section` (confirmed
 * against a live API response) — not part of the shared `FieldConfig` interface, hence this
 * narrow, locally-scoped type instead of widening that shared interface.
 */
type FieldWithMeta = ConditionalFieldConfig & { meta?: Record<string, unknown> };

/**
 * Shared, presentational SLB "form body": the indicator table (grouped by sector) plus the
 * Self-Declaration section. Used by both ULB's editable form and STATE's read-only review so
 * they render the exact same table/layout — `mode` only toggles editable inputs vs read-only
 * text in the indicator table; the Self-Declaration section always goes through
 * `<app-dynamic-form [mode]>`, which already has its own proven edit/view rendering.
 *
 * `form` is always a bound FormGroup in both modes (STATE builds a disabled one via
 * `DynamicFormService.createContorl`) — `DynamicFieldViewComponent` requires a FormGroup to read
 * from, so there's no value in a separate form-less code path.
 *
 * The template owns its own `[formGroup]="form()"` binding — `formGroupName`/`formControlName`
 * resolve their `ControlContainer` via `@Host()`, which does not cross into a child component's
 * template, so callers must NOT also put `[formGroup]` on an ancestor element around this
 * component (that leaves the indicator table with no container to find at all).
 */
@Component({
  selector: 'app-slb-form-body',
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './slb-form-body.component.html',
  styleUrl: './slb-form-body.component.scss',
})
export class SlbFormBodyComponent {
  readonly form = input.required<FormGroup>();
  readonly fields = input.required<ConditionalFieldConfig[]>();
  readonly mode = input.required<DynamicFormMode>();
  /** Prior-FY label heading the Actual Indicator column (e.g. "2025-26"). */
  readonly actualYearLabel = input<string | null>(null);
  /** Design-FY label heading the Target Indicator column (e.g. "2026-27"). */
  readonly targetYearLabel = input<string | null>(null);

  readonly indicatorFields = computed(() => this.fields().filter((f) => f.formFieldType === 'actualTarget'));
  readonly groupedIndicatorFields = computed<SlbIndicatorGroup[]>(() => {
    const groups: SlbIndicatorGroup[] = [];
    const bySection = new Map<string, SlbIndicatorGroup>();

    for (const field of this.indicatorFields()) {
      const section = ((field as FieldWithMeta).meta?.['section'] as string | undefined) ?? '';
      let group = bySection.get(section);
      if (!group) {
        group = { section, fields: [] };
        bySection.set(section, group);
        groups.push(group);
      }
      group.fields.push(field);
    }

    return groups;
  });

  readonly declarationFields = computed(() => this.fields().filter((f) => f.formFieldType !== 'actualTarget'));
  readonly declarationTextFields = computed(() => this.declarationFields().filter((f) => f.formFieldType === 'text'));
  readonly declarationOtherFields = computed(() =>
    this.declarationFields().filter((f) => f.formFieldType !== 'text'),
  );

  /** Checks a named validation error on an indicator's `actual`/`target` sub-control, only after it's been touched. */
  hasIndicatorError(key: string, sub: 'actual' | 'target', name: string): boolean {
    const control = this.form().get(`${key}.${sub}`);
    return !!control?.hasError(name) && (control.touched || control.dirty);
  }

  indicatorValue(key: string, sub: 'actual' | 'target'): unknown {
    return this.form().get(`${key}.${sub}`)?.value;
  }
}
