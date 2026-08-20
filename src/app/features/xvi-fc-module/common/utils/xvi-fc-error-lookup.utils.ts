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

/** One message successfully attributed to a known field by `parseFieldPrefixedMessages`. */
export interface XviFcParsedFieldMessage {
  field: string;
  /** Row position for a `@ValidateNested({ each: true })` array DTO; `null` for a flat DTO body. */
  rowIndex: number | null;
  message: string;
}

/**
 * Parses NestJS's default class-validator { message: string[] } 400 response into per-field errors.
 * Built-in messages start with the failing property path, e.g. installment2Amount must be an integer number or unspentUlbData.0.unspentAmount must be an integer number.
 * Messages whose leading token isn’t in knownFields are left unclaimed for generic handling.
 */
export function parseFieldPrefixedMessages(
  messages: readonly string[],
  knownFields: readonly string[],
  arrayProperty?: string,
): { claimed: XviFcParsedFieldMessage[]; unclaimed: string[] } {
  const claimed: XviFcParsedFieldMessage[] = [];
  const unclaimed: string[] = [];

  for (const message of messages) {
    const match =
      (arrayProperty ? matchNestedFieldPrefix(message, arrayProperty, knownFields) : null) ??
      matchBareFieldPrefix(message, knownFields);

    if (match) {
      claimed.push({ ...match, message });
    } else {
      unclaimed.push(message);
    }
  }

  return { claimed, unclaimed };
}

function matchNestedFieldPrefix(
  message: string,
  arrayProperty: string,
  knownFields: readonly string[],
): { field: string; rowIndex: number } | null {
  const prefix = `${arrayProperty}.`;
  if (!message.startsWith(prefix)) return null;

  const rest = message.slice(prefix.length); // "<index>.<field> ..."
  const dotIndex = rest.indexOf('.');
  if (dotIndex === -1) return null;

  const rowIndex = Number(rest.slice(0, dotIndex));
  if (!Number.isInteger(rowIndex)) return null;

  const field = rest.slice(dotIndex + 1).split(' ')[0];
  return knownFields.includes(field) ? { field, rowIndex } : null;
}

function matchBareFieldPrefix(
  message: string,
  knownFields: readonly string[],
): { field: string; rowIndex: null } | null {
  const field = message.split(' ')[0];
  return knownFields.includes(field) ? { field, rowIndex: null } : null;
}
