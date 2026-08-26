import { Component, computed, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { DynamicFormVisibilityService } from '../../../dynamic-form-visibility.service';
import { SlbFormBodyComponent } from '../../../shared/slb-form-body/slb-form-body.component';
import type { SlbFormData } from '../../../ulb-module/ulb-forms/slb/slb.models';

/** `'2026-27' -> '2025-26'` — the design year's own preceding FY, used for the "Actual" column
 *  header. Not derivable from anything the ULB's own edit form already computes (that form labels
 *  both Actual/Target columns with the same design year). */
function derivePriorFyLabel(designYear: string): string {
  const [start, end] = designYear.split('-').map(Number);
  if (!start || !end) return designYear;
  return `${start - 1}-${String(end - 1).padStart(2, '0')}`;
}

@Component({
  selector: 'app-slb-review',
  standalone: true,
  imports: [SlbFormBodyComponent],
  templateUrl: './slb-review.component.html',
  styleUrl: './slb-review.component.scss',
})
export class SlbReviewComponent {
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);

  readonly data = input<SlbFormData | null>(null);

  readonly yearLabel = computed(() => this.data()?.designYear ?? '');
  readonly priorYearLabel = computed(() => {
    const year = this.data()?.designYear;
    return year ? derivePriorFyLabel(year) : '';
  });

  /** Fields the ULB actually saw at submission time (backend's own `hidden`/`render` flags),
   *  passed to the shared read-only form body alongside a disabled FormGroup built the same way
   *  ULB's edit form builds its controls — no visibility subscriptions needed since nothing
   *  changes on an already-submitted form. */
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.data()?.questions ?? []));

  readonly form = computed<FormGroup>(() => {
    const form = new FormGroup({});
    for (const field of this.visibleFields()) {
      if (!field.key || !field.formFieldType) continue;
      form.addControl(field.key, this.dynamicService.createContorl(field, false, true));
    }
    return form;
  });
}
