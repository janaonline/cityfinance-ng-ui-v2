import { AppliedFilter } from './dalgo.config';

/** Escapes a string as a Rison string literal (`'` -> `!'`, `!` -> `!!`). */
export function toRisonString(value: string): string {
  return `'${value.replace(/!/g, '!!').replace(/'/g, "!'")}'`;
}

/**
 * Builds Superset's `native_filters` URL param (Rison). Must stay a single-line string.
 * Shape matches the one used by the existing cityfinance Dalgo embeds, with values escaped.
 */
export function buildNativeFilters(filters: AppliedFilter[]): string {
  if (!filters.length) return '';
  const body = filters
    .map(({ id, column, value }) => {
      const v = toRisonString(value);
      return `${id}:(__cache:(label:${v},validateStatus:!f,value:!(${v})),extraFormData:(filters:!((col:${column},op:IN,val:!(${v})))),filterState:(label:${v},validateStatus:!f,value:!(${v})),id:${id},ownState:())`;
    })
    .join(',');
  return `(${body})`;
}
