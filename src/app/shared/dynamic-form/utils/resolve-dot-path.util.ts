/** Resolves a dot-path (e.g. 'bankDetails.name', 'data.data') off a plain object; `undefined` if
 *  any segment is missing. Shared by any dynamic-form field that reads a nested value out of an
 *  API response body — `InputComponent`'s `lookup.populates` and `AutocompleteComponent`'s
 *  `remoteSearch.resultsPath`/`valueKey`/`labelKey`. */
export function resolveDotPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
}
