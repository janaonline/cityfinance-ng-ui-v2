import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import Swal from 'sweetalert2';

import { AuthService } from '../services/auth.service';
import { Login_Logout } from '../util/logout.util';

const retryHeader = 'x-auth-retry';

export const customHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const preparedRequest = prepareRequest(req, authService);

  return next(preparedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (shouldAttemptRefresh(error, preparedRequest, authService)) {
        return authService.refreshAccessToken().pipe(
          switchMap(() =>
            next(
              markRetriedRequest(
                prepareRequest(preparedRequest, authService),
              ),
            ),
          ),
          catchError((refreshError) =>
            handleError(refreshError, authService, router, snackBar, {
              logoutOnUnauthorized: true,
            }),
          ),
        );
      }

      return handleError(error, authService, router, snackBar, {
        logoutOnUnauthorized:
          authService.isAuthRequest(preparedRequest.url) &&
          !authService.isLoginRequest(preparedRequest.url),
      });
    }),
  );
};

function prepareRequest(
  req: HttpRequest<unknown>,
  authService: AuthService,
) {
  if ((req.body instanceof File || req.body instanceof FormData) && req.method === 'PUT') {
    return req;
  }

  let headers = req.headers;
  const sessionID = sessionStorage.getItem('sessionID');

  if (!headers.has('Accept')) {
    headers = headers.set('Accept', 'application/json');
  }
  if (!(req.body instanceof FormData) && !(req.body instanceof File) && !headers.has('Content-Type') && hasJsonBody(req)) {
    headers = headers.set('Content-Type', 'application/json');
  }
  if (sessionID) {
    headers = headers.set('sessionId', sessionID);
  }

  const accessToken = authService.getAccessToken();
  if (accessToken && authService.shouldAttachAccessToken(req.url)) {
    headers = headers.set('x-access-token', accessToken);
    headers = headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return req.clone({
    headers,
    withCredentials: authService.shouldSendCredentials(req.url) || req.withCredentials,
  });
}

function hasJsonBody(req: HttpRequest<unknown>) {
  return req.body !== null && req.body !== undefined && !(req.body instanceof Blob);
}

function shouldAttemptRefresh(
  error: HttpErrorResponse,
  req: HttpRequest<unknown>,
  authService: AuthService,
) {
  return (
    error.status === 401 &&
    !req.headers.has(retryHeader) &&
    authService.shouldAttachAccessToken(req.url) &&
    !authService.isAuthRequest(req.url) &&
    authService.canAttemptSilentRefresh()
  );
}

function markRetriedRequest(req: HttpRequest<unknown>) {
  return req.clone({
    headers: req.headers.set(retryHeader, 'true'),
  });
}

function handleError(
  error: HttpErrorResponse,
  authService: AuthService,
  router: Router,
  snackBar: MatSnackBar,
  options: { logoutOnUnauthorized: boolean },
) {
  switch (error.status) {
    case 401:
      if (options.logoutOnUnauthorized) {
        logoutRedirection(authService, router);
      }
      break;
    case 403:
      void Swal.fire('Error', error.error?.message ?? 'Something went wrong', 'error');
      logoutRedirection(authService, router);
      break;
    case 503:
      clearLocalStorage(authService);
      void router.navigate(['maintenance']);
      break;
    case 440: {
      clearLocalStorage(authService);
      const url = !['/', ''].includes(router.url)
        ? router.url
        : location.pathname + location.search + location.hash;
      if (!url.includes('login')) {
        sessionStorage.setItem('postLoginNavigationV2', url);
      }
      void router.navigate(['login'], {
        queryParams: { message: 'Session expired. Kindly login again.' },
      });
      break;
    }
    case 441:
      clearLocalStorage(authService);
      void router.navigate(['login'], {
        queryParams: {
          message: 'Password expired. Kindly reset your password.',
        },
      });
      break;
    case 0:
      return throwError(() => ({
        error: { message: 'Failed to connect with Server' },
      }));
  }

  if (shouldShowError(error, options)) {
    showError(snackBar, error.error?.message);
  }

  return throwError(() => error);
}

function shouldShowError(
  error: HttpErrorResponse,
  options: { logoutOnUnauthorized: boolean },
) {
  return error.status !== 401 || !options.logoutOnUnauthorized;
}

function showError(snackBar: MatSnackBar, message?: string) {
  snackBar.open(message || 'Something went wrong', '', {
    duration: 10000,
    panelClass: ['snack-error'],
    horizontalPosition: 'right',
    verticalPosition: 'top',
  });
}

function logoutRedirection(authService: AuthService, router: Router) {
  const url = !['/', ''].includes(router.url)
    ? router.url
    : location.pathname + location.search + location.hash;

  if (!url.includes('login')) {
    sessionStorage.setItem('postLoginNavigationV2', url);
  }

  clearLocalStorage(authService);

  const loginType = localStorage.getItem('loginType');
  void router.navigate(['auth/login', loginType], {
    // queryParams: { message: 'Your session expired. Please sign in again.' },
  });
}

function clearLocalStorage(authService: AuthService) {
  authService.clearLocalStorage();
  Login_Logout.logout();
}
