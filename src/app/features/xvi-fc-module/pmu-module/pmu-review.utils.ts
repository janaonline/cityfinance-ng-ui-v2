import { HttpErrorResponse } from '@angular/common/http';
import { PmuApiErrorResponse } from './pmu-review.models';

/** Normalizes either an Angular `HttpErrorResponse.error` body or a thrown `success:false` response
 *  object (the shape the PMU services throw on `success:false`) into one type — mirrors
 *  mohua-module/fc-unspent-review's own `extractApiErrorResponse`. */
export function extractApiErrorResponse(err: unknown): PmuApiErrorResponse | null {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as unknown;
    return body && typeof body === 'object' ? (body as PmuApiErrorResponse) : null;
  }
  if (err && typeof err === 'object' && 'success' in err) {
    return err as PmuApiErrorResponse;
  }
  return null;
}

/** Reads the `_form`-keyed (non-field) validation errors off an API error response — see the
 *  backend's `xvi-fc-api-response.ts` doc comment: "Use `_form` for non-field errors." Before this
 *  fix, callers read only the response's top-level `message`, so a validation error keyed under
 *  `_form` was silently replaced by a generic fallback; this checks `_form` first, then falls back
 *  to `message`, then to `fallback`, when there's no `_form` entry (e.g. an unrelated 500, or a
 *  validation error keyed by an actual field instead). Mirrors mohua-module/fc-unspent-review's own
 *  `applyFormLevelError`, extracted here so every PMU action (row-level and form-level, both detail
 *  components) shares one implementation instead of each duplicating the same extraction logic. */
export function extractFormLevelErrorMessage(err: unknown, fallback: string): string {
  const response = extractApiErrorResponse(err);
  const formErrors = response?.errors?.['_form'];
  return formErrors?.length ? formErrors.map((e) => e.message).join(' ') : (response?.message ?? fallback);
}
