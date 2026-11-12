/**
 * Pulls the backend's own error message out of a failed HttpClient request, e.g.
 * `{ success: false, statusCode: 400, message: "A signed declaration must be uploaded
 * before submitting", ... }`. `message` can also arrive as a string array (some
 * validation-pipe errors send one string per failed field) — those are joined into one
 * line. Falls back to the given default when the response body doesn't have a usable
 * `message` (network failure, non-JSON body, etc.), so callers never show a blank toast.
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
  const body = (error as { error?: unknown } | null | undefined)?.error;
  if (!body || typeof body !== 'object') return fallback;

  const message = (body as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message) && message.length) {
    const joined = message.filter((m) => typeof m === 'string').join(' ');
    if (joined) return joined;
  }
  return fallback;
}
