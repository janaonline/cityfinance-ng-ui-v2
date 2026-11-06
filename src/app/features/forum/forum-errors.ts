import { HttpErrorResponse } from '@angular/common/http';
import { ForumFormError } from './forum.models';

const FIELD_PATTERNS: { field: string; pattern: RegExp }[] = [
  { field: 'title', pattern: /^title\b/i },
  { field: 'body', pattern: /^(body|reply)\b/i },
  { field: 'categorySlug', pattern: /^(category|choose a valid category)/i },
  { field: 'parentId', pattern: /^choose a valid comment/i },
  { field: 'name', pattern: /^name\b/i },
  { field: 'slug', pattern: /^slug\b/i },
  { field: 'description', pattern: /^description\b/i },
];

function toMessages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((m): m is string => typeof m === 'string');
  return typeof raw === 'string' ? [raw] : [];
}

/**
 * Converts a Nest error response (`{ message: string | string[] }`) into a form error. Validation
 * errors arrive as message arrays; those matching a known field are attached to it, the rest are
 * joined into the general message.
 */
export function toFormError(err: unknown, fallback = 'Something went wrong.'): ForumFormError {
  if (!(err instanceof HttpErrorResponse)) return { message: fallback, fields: {} };
  if (err.status === 0) {
    return { message: 'Could not reach the server. Please try again.', fields: {} };
  }
  const body = err.error as { message?: unknown } | string | null;
  const messages = toMessages(typeof body === 'string' ? body : body?.message);
  if (messages.length === 0) return { message: fallback, fields: {} };

  const fields: Record<string, string> = {};
  const general: string[] = [];
  for (const message of messages) {
    const match = FIELD_PATTERNS.find((f) => f.pattern.test(message));
    if (match && !fields[match.field]) fields[match.field] = message;
    else general.push(message);
  }
  const hasFields = Object.keys(fields).length > 0;
  const message = general.join(' ') || (hasFields ? 'Please fix the errors below.' : fallback);
  return { message, fields };
}
