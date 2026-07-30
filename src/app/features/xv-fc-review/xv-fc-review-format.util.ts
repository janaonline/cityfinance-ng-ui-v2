import {
  XvFcCurrencyUnit,
  XvFcLineItem,
  XvFcLineItemGroup,
  XvFcLineItemSubGroup,
} from './models/xv-fc-review.model';

/**
 * Groups the FY detail's flat line-item list by `section`, preserving first-seen order, then
 * further splits each section by `subSection` where items carry one. Items without a
 * `subSection` land in a single `null`-keyed sub-group (rendered with no sub-header).
 */
export function groupXvFcLineItems(items: XvFcLineItem[]): XvFcLineItemGroup[] {
  const order: string[] = [];
  const bySection = new Map<string, XvFcLineItem[]>();
  for (const item of items) {
    if (!bySection.has(item.section)) {
      bySection.set(item.section, []);
      order.push(item.section);
    }
    bySection.get(item.section)!.push(item);
  }
  return order.map((section) => ({
    section,
    subGroups: groupBySubSection(bySection.get(section)!),
  }));
}

function groupBySubSection(items: XvFcLineItem[]): XvFcLineItemSubGroup[] {
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
  return order.map((subSection) => ({ subSection, items: bySubSection.get(subSection)! }));
}

/**
 * `amountInLakhs` is the API's standardised base unit — the backend always stores and
 * returns amounts in ₹ Lakhs. `unit` is a purely FE-side display choice; it never changes
 * what gets submitted back (proposed/corrected values are always entered and sent in lakhs).
 */
export function formatXvFcAmount(
  amountInLakhs: number | undefined | null,
  unit: XvFcCurrencyUnit,
): string {
  if (amountInLakhs == null) return '—';
  if (unit === 'whole') {
    return (amountInLakhs * 1_00_000).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (unit === 'crores') {
    const divided = amountInLakhs / 100;
    // A small-but-nonzero lakh amount can round away to "0.00" in crores at 2-decimal
    // precision — fall back to more decimals so it doesn't silently disappear.
    if (divided !== 0 && Math.abs(divided) < 0.01) {
      return divided.toLocaleString('en-IN', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    }
    return divided.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  // lakhs — already the base unit, no conversion needed.
  return amountInLakhs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
