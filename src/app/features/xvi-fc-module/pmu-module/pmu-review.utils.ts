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
