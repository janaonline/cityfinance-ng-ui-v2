/** The API's response envelope. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

function isEnvelope<T>(response: ApiEnvelope<T> | T): response is ApiEnvelope<T> {
  return typeof response === 'object' && response !== null && 'success' in response;
}

/**
 * Unwraps `{ success, data }` (a raw payload, as the dev server may return, passes straight through).
 * An unsuccessful or empty envelope is thrown as-is, so callers can read its message.
 */
export function unwrapResponse<T>(response: ApiEnvelope<T> | T): T {
  if (!isEnvelope(response)) return response;
  if (!response.success || response.data === undefined || response.data === null) throw response;
  return response.data;
}

/** Like `unwrapResponse`, for endpoints where "no record" is a valid answer: null instead of throwing. */
export function unwrapNullableResponse<T>(response: ApiEnvelope<T> | T | null): T | null {
  if (response === null) return null;
  if (!isEnvelope(response)) return response;
  if (!response.success) throw response;
  return response.data ?? null;
}
