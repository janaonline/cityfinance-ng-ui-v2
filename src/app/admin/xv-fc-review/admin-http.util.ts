/**
 * Flattens a query-DTO-shaped object into the string-keyed map HttpClient's `params` option
 * expects, dropping undefined/null/empty-string fields so optional filters aren't sent as
 * literal "undefined" — shared by every admin service in this feature (list/analytics/export
 * queries all follow the same optional-filter-object shape).
 */
export function toHttpParams<T extends object>(query: T): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') params[key] = String(value);
  }
  return params;
}

/** Unwraps the `{ success, data, timestamp }` envelope `ResponseTransformInterceptor` wraps every response in. */
export function unwrapAdminResponse<T>(response: unknown): T {
  const r = response as Record<string, unknown>;
  return (r && typeof r === 'object' && 'data' in r ? r['data'] : r) as T;
}
