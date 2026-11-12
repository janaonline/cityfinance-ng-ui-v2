import {
  XvFcCurrencyUnit,
  XvFcLineItem,
  XvFcLineItemGroup,
  XvFcLineItemSubGroup,
} from './models/xv-fc-review.model';

/**
 * These specific line-item codes are generic reconciling entries ("Municipal (General) Fund",
 * "Rounding off differences") that don't belong under their nominal `section` at all - they're
 * pulled out and rendered under a synthetic "OTHERS" section at the very end of the page,
 * after every real section (including "Assets").
 */
const PINNED_LAST_CODES = new Set(['31001', '31002']);
const OTHERS_SECTION_LABEL = 'OTHERS';

/**
 * Groups the FY detail's flat line-item list by `section`, preserving first-seen order, then
 * further splits each section by `subSection` where items carry one. Items without a
 * `subSection` land in a single `null`-keyed sub-group (rendered with no sub-header).
 * `PINNED_LAST_CODES` items are pulled out of their nominal section and merged into the trailing
 * "Others"-named section, regardless of what their real `section`/`subSection` says - or, if the
 * data has no real "Others" section, appended as a new synthetic one at the very end.
 */
export function groupXvFcLineItems(items: XvFcLineItem[]): XvFcLineItemGroup[] {
  const pinned = items.filter((item) => PINNED_LAST_CODES.has(item.code));
  const rest = items.filter((item) => !PINNED_LAST_CODES.has(item.code));

  const order: string[] = [];
  const bySection = new Map<string, XvFcLineItem[]>();
  for (const item of rest) {
    if (!bySection.has(item.section)) {
      bySection.set(item.section, []);
      order.push(item.section);
    }
    bySection.get(item.section)!.push(item);
  }

  // Multiple *distinct* raw section strings can each independently look like "Others" (e.g.
  // "OTHERS" vs "9. OTHERS" differ only in casing/prefix but render identically once
  // upper-cased by CSS) - merge every one of them into a single trailing group instead of
  // sorting them next to each other as separate, visually-duplicate headers.
  const normalSections = order.filter((section) => !isOthersSubSection(section));
  const othersSections = order.filter((section) => isOthersSubSection(section));

  const groups: XvFcLineItemGroup[] = normalSections.map((section) => ({
    section,
    subGroups: buildSubGroups(bySection.get(section)!),
  }));

  if (othersSections.length) {
    const combinedItems = othersSections.flatMap((section) => bySection.get(section)!);
    // The Others section is already the catch-all - it never shows a further sub-section
    // header underneath it (that would just repeat "OTHERS" a second time when an item's own
    // subSection also happens to look like "Others").
    groups.push({ section: othersSections[0], subGroups: [{ subSection: null, items: combinedItems }] });
  }

  if (pinned.length) {
    const existingOthers = groups.find((g) => isOthersSubSection(g.section));
    if (existingOthers) {
      const existingItems = existingOthers.subGroups.flatMap((sg) => sg.items);
      existingOthers.subGroups = [{ subSection: null, items: [...existingItems, ...pinned] }];
    } else {
      groups.push({ section: OTHERS_SECTION_LABEL, subGroups: [{ subSection: null, items: pinned }] });
    }
  }

  return groups;
}

/**
 * `section`/`subSection` values are backend-driven free text; treat "Others" as a catch-all
 * that always sorts last. Matches loosely (e.g. "OTHERS", "9. Others", "Others (Specify)") by
 * stripping any leading numbering/punctuation and checking what remains starts with "other" -
 * an exact-equality check missed real section labels that carry a numeric prefix.
 */
function isOthersSubSection(subSection: string | null): boolean {
  if (!subSection) return false;
  const stripped = subSection.trim().replace(/^[\d.\-)\s]+/, '');
  return stripped.toLowerCase().startsWith('other');
}

function buildSubGroups(items: XvFcLineItem[]): XvFcLineItemSubGroup[] {
  const order: (string | null)[] = [];
  const bySubSection = new Map<string | null, XvFcLineItem[]>();
  for (const item of items) {
    const key = item.subSection ?? null;
    if (!bySubSection.has(key)) {
      bySubSection.set(key, []);
      order.push(key);
    }
    bySubSection.get(key)!.push(item);
  }

  // As with sections, distinct raw subSection strings can each independently look like
  // "Others" - merge them into one trailing sub-group rather than rendering duplicate headers.
  const normalKeys = order.filter((key) => !isOthersSubSection(key));
  const othersKeys = order.filter((key) => isOthersSubSection(key));

  const subGroups: XvFcLineItemSubGroup[] = normalKeys.map((subSection) => ({
    subSection,
    items: bySubSection.get(subSection)!,
  }));

  if (othersKeys.length) {
    const combinedItems = othersKeys.flatMap((key) => bySubSection.get(key)!);
    subGroups.push({ subSection: othersKeys[0], items: combinedItems });
  }

  return subGroups;
}

const UNIT_TO_WHOLE_RUPEE_MULTIPLIER: Record<XvFcCurrencyUnit, number> = {
  whole: 1,
  lakhs: 1_00_000,
  crores: 1_00_00_000,
};

/**
 * `amount` is in `baseUnit` (the API's standardised base unit for that module — Ptax always
 * sends ₹ Lakhs; AFS sends whole ₹). `unit` is a purely FE-side display choice; it never
 * changes what gets submitted back — proposed/corrected values are always entered and sent
 * in the same unit as `baseUnit`.
 */
export function formatXvFcAmount(
  amount: number | undefined | null,
  unit: XvFcCurrencyUnit,
  baseUnit: XvFcCurrencyUnit = 'lakhs',
): string {
  if (amount == null) return '—';
  const amountInWholeRupees = amount * UNIT_TO_WHOLE_RUPEE_MULTIPLIER[baseUnit];
  if (unit === 'whole') {
    return amountInWholeRupees.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  const divided = amountInWholeRupees / UNIT_TO_WHOLE_RUPEE_MULTIPLIER[unit];
  // A small-but-nonzero amount can round away to "0.00" at 2-decimal precision once
  // converted into a larger display unit — fall back to more decimals so it doesn't
  // silently disappear.
  if (divided !== 0 && Math.abs(divided) < 0.01) {
    return divided.toLocaleString('en-IN', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  }
  return divided.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
