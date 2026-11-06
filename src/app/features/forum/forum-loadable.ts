import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { toFormError } from './forum-errors';

export type Loadable<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string; notFound: boolean }
  | { status: 'ready'; data: T };

/** Wraps a request into loading / error / ready states for template consumption. */
export function toLoadable<T>(
  source$: Observable<T>,
  errorFallback = 'The forum could not load. Please try again.',
): Observable<Loadable<T>> {
  return source$.pipe(
    map((data): Loadable<T> => ({ status: 'ready', data })),
    catchError((err: unknown) =>
      of<Loadable<T>>({
        status: 'error',
        message: toFormError(err, errorFallback).message,
        notFound: err instanceof HttpErrorResponse && err.status === 404,
      }),
    ),
    startWith<Loadable<T>>({ status: 'loading' }),
  );
}
