import { Injectable, computed, signal } from '@angular/core';
import { InrFormat, InrFormatPipe } from '../pipes/inr-format.pipe';
import { TowordPipe } from '../pipes/toword.pipe';

const VALID_FORMATS: readonly InrFormat[] = ['auto', 'cr', 'lakh', 'k', 'inr', 'raw'];

/** Short unit label for each format, for headers that need to show what unit is actually
 *  displaying (e.g. "Allocation (in {label})") rather than a hardcoded, possibly-stale string. */
const UNIT_SUFFIXES: Record<InrFormat, string> = {
  auto: '',
  cr: 'Cr.',
  lakh: 'Lakh',
  k: 'K',
  inr: '₹',
  raw: '',
};

/** localStorage key the current global override is persisted under, restored on next visit. */
export const AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY = 'cf.amountDisplayOverride';

/**
 * How whole-Rupee amounts are displayed app-wide. Each call site supplies its own `pageDefault` —
 * row/per-ULB tables default to `'inr'`, state-wide aggregates default to `'auto'` (see call sites) —
 * `override` is the one piece of shared state: `null` means "no override, use each page's own
 * default"; any concrete `InrFormat` means a user has asked (via one of `AmountDisplayToggleComponent`'s
 * unit pills) to see everything in that unit, which wins over every page's own default. Getting back
 * to `null` is the toggle's separate reset icon (`setOverride(null)`) — not one of the unit pills.
 */
@Injectable({ providedIn: 'root' })
export class AmountDisplayModeService {
  private readonly pipe = new InrFormatPipe();
  private readonly toWordsPipe = new TowordPipe();

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

  /** Short label (e.g. "Cr.", "₹") for whatever format is actually resolved for `pageDefault` right
   *  now — for a header that shows the unit alongside a column of `format()`-ed values, so the
   *  label stays correct as the override changes instead of a hardcoded, possibly-stale string. */
  unitSuffix(pageDefault: InrFormat, opts?: { ignoreOverride?: boolean }): string {
    const resolved = opts?.ignoreOverride ? pageDefault : this.override() ?? pageDefault;
    return UNIT_SUFFIXES[resolved];
  }

  /** Spells out a whole-Rupee amount in words (Indian numbering system, via the installed
   *  `to-words` package) — `''` for null/undefined/zero, so callers can fall back cleanly. Always
   *  the raw exact value — never scaled/abbreviated, regardless of page default or override. */
  formatInWords(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return this.toWordsPipe.transform(value);
  }

  /** Tooltip text for the info icon next to an editable whole-Rupee input — just the currently-
   *  typed value spelled out in words (`''` before anything's been entered), so the user can
   *  double-check the number without doing the digit-grouping math themselves. */
  wholeNumberInfoText(value: number | null | undefined): string {
    return this.formatInWords(value);
  }

  private readStoredOverride(): InrFormat | null {
    const stored = localStorage.getItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY);
    return VALID_FORMATS.includes(stored as InrFormat) ? (stored as InrFormat) : null;
  }
}
