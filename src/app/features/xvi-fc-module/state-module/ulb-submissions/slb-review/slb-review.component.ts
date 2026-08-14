import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import type { SlbFormData } from '../../../ulb-module/ulb-forms/slb/slb.models';
import type { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';

interface SlbIndicatorRow {
  readonly key: string;
  readonly position: number | null;
  readonly label: string;
  readonly actual: unknown;
  readonly target: unknown;
  readonly unit: string;
}

interface SlbSectorGroup {
  readonly sector: string;
  readonly rows: readonly SlbIndicatorRow[];
}

interface SlbSupportingDocument {
  readonly name: string;
  readonly url: string | null;
}

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
  imports: [MatButtonModule],
  templateUrl: './slb-review.component.html',
  styleUrl: './slb-review.component.scss',
})
export class SlbReviewComponent {
  readonly data = input<SlbFormData | null>(null);

  readonly yearLabel = computed(() => this.data()?.designYear ?? '');
  readonly priorYearLabel = computed(() => {
    const year = this.data()?.designYear;
    return year ? derivePriorFyLabel(year) : '';
  });

  /** The 28 `actualTarget` indicator fields, bucketed by `meta.sector` — order falls out of the
   *  source question array's own order (Water Supply -> Sewerage & Waste Water -> Solid Waste
   *  Management -> Storm Water Drainage), not a hardcoded list. */
  readonly sectorGroups = computed<SlbSectorGroup[]>(() => {
    const questions = this.data()?.questions ?? [];
    const sectorOrder: string[] = [];
    const bySector = new Map<string, SlbIndicatorRow[]>();

    for (const field of questions) {
      if (field.formFieldType !== 'actualTarget') continue;

      const sector = String((field.meta?.['sector'] as string | undefined) ?? 'Other');
      if (!bySector.has(sector)) {
        bySector.set(sector, []);
        sectorOrder.push(sector);
      }

      const value = (field.value ?? {}) as { actual?: unknown; target?: unknown };
      bySector.get(sector)!.push({
        key: field.key,
        position: field.position ?? null,
        label: field.label,
        actual: value.actual,
        target: value.target,
        unit: field.inputCardConfig?.suffixText ?? String((field.meta?.['unit'] as string | undefined) ?? ''),
      });
    }

    return sectorOrder.map((sector) => ({ sector, rows: bySector.get(sector)! }));
  });

  readonly declarantName = computed(() => this.findFieldValue('declarantName') as string | null);
  readonly declarantDesignation = computed(() => this.findFieldValue('declarantDesignation') as string | null);

  readonly supportingDocument = computed<SlbSupportingDocument | null>(() => {
    const raw = this.findFieldValue('supportingDocumentFile') as
      | { fileUrl?: string; fileName?: string; originalName?: string; path?: string }
      | null;
    if (!raw) return null;
    return {
      name: raw.fileName ?? raw.originalName ?? 'Supporting document',
      url: raw.fileUrl ?? raw.path ?? null,
    };
  });

  openSupportingDocument(): void {
    const url = this.supportingDocument()?.url;
    if (url) window.open(url, '_blank', 'noopener');
  }

  private findFieldValue(key: string): unknown {
    const questions = this.data()?.questions ?? [];
    return (questions.find((q: ConditionalFieldConfig) => q.key === key)?.value as unknown) ?? null;
  }
}
