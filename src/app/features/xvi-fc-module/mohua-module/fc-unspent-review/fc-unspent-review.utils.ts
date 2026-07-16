import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse, ApiFieldError, RowStatusType, ROW_STATUS } from './fc-unspent-review.models';

/** Normalizes either an Angular `HttpErrorResponse.error` body or a thrown `success:false` response
 *  object (the shape `FcUnspentMohuaReviewService` throws on `success:false`) into one type. */
export function extractApiErrorResponse(err: unknown): ApiErrorResponse | null {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as unknown;
    return body && typeof body === 'object' ? (body as ApiErrorResponse) : null;
  }
  if (err && typeof err === 'object' && 'success' in err) {
    return err as ApiErrorResponse;
  }
  return null;
}

/** Flattens every error object across all keys of an `ApiErrorMap`, regardless of whether the map
 *  key itself is dotted/indexed — routing is always done via each error's own `field`, not the key. */
export function collectAllErrors(response: ApiErrorResponse | null): ApiFieldError[] {
  if (!response?.errors) return [];
  return Object.values(response.errors).flat();
}

/** Matches a `rows.<index>.<subField>` error `field` value (e.g. `rows.0.rejectionRemark`). */
export function matchIndexedRowsField(field: string | undefined, subField: string): number | null {
  if (!field) return null;
  const match = new RegExp(`^rows\\.(\\d+)\\.${subField}$`).exec(field);
  return match ? Number(match[1]) : null;
}

export const ROW_STATUS_LABEL: Record<RowStatusType, string> = {
  [ROW_STATUS.ACTIVE]: 'Active',
  [ROW_STATUS.NEEDS_UPDATE]: 'Needs Update',
  [ROW_STATUS.UPDATE_PENDING]: 'Pending Review',
  [ROW_STATUS.REJECTED]: 'Rejected',
};

export const ROW_STATUS_BADGE_CLASS: Record<RowStatusType, string> = {
  [ROW_STATUS.ACTIVE]: 'text-bg-success',
  [ROW_STATUS.NEEDS_UPDATE]: 'text-bg-warning',
  [ROW_STATUS.UPDATE_PENDING]: 'text-bg-secondary',
  [ROW_STATUS.REJECTED]: 'text-bg-danger',
};
