import { Injectable, computed, signal } from '@angular/core';
import { InrFormat, InrFormatPipe } from '../pipes/inr-format.pipe';

const VALID_FORMATS: readonly InrFormat[] = ['auto', 'cr', 'lakh', 'k', 'inr', 'raw'];

/** localStorage key the current global override is persisted under, restored on next visit. */
export const AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY = 'cf.amountDisplayOverride';

/**
 * How whole-Rupee amounts are displayed app-wide. Each call site supplies its own `pageDefault` —
 * row/per-ULB tables default to `'inr'`, state-wide aggregates default to `'auto'` (see call sites) —
 * `override` is the one piece of shared state: `null` means "no override, use each page's own
 * default"; any concrete `InrFormat` means a user has asked (via `AmountDisplayToggleComponent`) to
 * see everything in that unit, which wins over every page's own default.
 */
@Injectable({ providedIn: 'root' })
export class AmountDisplayModeService {
  private readonly pipe = new InrFormatPipe();

  readonly override = signal<InrFormat | null>(this.readStoredOverride());
  /** Read-only convenience for UI that wants to reflect the current override without formatting anything. */
  readonly hasOverride = computed(() => this.override() !== null);

  setOverride(format: InrFormat | null): void {
    this.override.set(format);
    if (format === null) {
      localStorage.removeItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY);
    } else {
      localStorage.setItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY, format);
    }
  }

  /**
   * Formats a whole-Rupee amount. `pageDefault` is what this call site shows when no override is
   * active — deliberately required, not defaulted, so every call site makes a conscious choice
   * rather than silently inheriting some global default. Pass `ignoreOverride: true` for a display
   * that must stay exact regardless of the user's global setting (e.g. a generated document that
   * has to match its own PDF byte-for-byte).
   */
  format(value: number | null | undefined, pageDefault: InrFormat, opts?: { ignoreOverride?: boolean }): string {
    const resolved = opts?.ignoreOverride ? pageDefault : this.override() ?? pageDefault;
    return this.pipe.transform(value, resolved, { max: 2 });
  }

  /** Always the full grouped Rupee figure, regardless of page default or override — for hover/title
   *  text where the visible figure may be Cr/Lakh/K-scaled. */
  formatExact(value: number | null | undefined): string {
    return this.pipe.transform(value, 'inr', { max: 2 });
  }

  private readStoredOverride(): InrFormat | null {
    const stored = localStorage.getItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY);
    return VALID_FORMATS.includes(stored as InrFormat) ? (stored as InrFormat) : null;
  }
}
