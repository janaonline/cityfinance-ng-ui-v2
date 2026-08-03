/** Minimal shape shared by every xvi-fc feature's field-error/row-error types. */
export interface XviFcLookupError {
  message: string;
  code?: string;
}

/**
 * Returns the message of the first entry in `errors[fieldKey]` whose `code` matches, or null
 * when absent. Used to pull one curated, form-level message (e.g. `newUlbsAdded`) out of a
 * field-keyed API error map for display outside the normal field-error UI (e.g. a snackbar).
 */
export function getXviFcFieldErrorMessage(
  errors: Record<string, XviFcLookupError[]> | undefined,
  fieldKey: string,
  code: string,
): string | null {
  const fieldErrors = errors?.[fieldKey] ?? [];
  return fieldErrors.find((error) => error.code === code)?.message ?? null;
}

/**
 * Returns the message of the first entry in a flat row-error array whose `code` matches, or null
 * when absent. Used to pull one specific message (e.g. `duplicate`) out of a row-level error list
 * for display outside the normal row-error UI (e.g. a snackbar).
 */
export function getXviFcRowErrorMessage(rowErrors: XviFcLookupError[] | undefined, code: string): string | null {
  return rowErrors?.find((error) => error.code === code)?.message ?? null;
}
