import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FORM_STATUS } from '../common/constants/form-status.constants';
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

/** 80 chars separates short (56) from long (91) messages, based on the PMU mutation
 * error audit. Longer messages automatically qualify without maintenance. */
export const LONG_SNACKBAR_MESSAGE_THRESHOLD = 80;

export function isLongSnackbarMessage(message: string): boolean {
  return message.length > LONG_SNACKBAR_MESSAGE_THRESHOLD;
}

export interface PmuUndoConfirmInput {
  formLabel: string;
  stateName: string;
  /** The status being undone: 5 (approved onward to MoHUA) or 14 (returned). */
  status: number;
  /** Elected Body / FC Unspent: the undo also reopens every ULB row. */
  hasRows: boolean;
}

/** Confirmation copy for "Undo" — always states the concrete outcome, per the project's dialog rule. */
export function buildPmuUndoConfirm(input: PmuUndoConfirmInput): ConfirmDialogData {
  const returned = input.status === FORM_STATUS.RETURNED_BY_PMU;
  const effect = returned ? 'your return remark is cleared' : 'your approval is withdrawn';
  const rows = input.hasRows
    ? ' Every ULB row goes back to pending too, so all of them need to be reviewed again.'
    : '';

  return {
    title: returned ? 'Undo your return?' : 'Undo your approval?',
    message: `${input.formLabel} for ${input.stateName} goes back to Under Review by PMU and ${effect}.${rows} You can then approve or return it again.`,
    confirmText: 'Yes, undo',
    cancelText: 'No, keep it',
    confirmButtonColor: 'warn',
    icon: 'bi-arrow-counterclockwise',
  };
}
