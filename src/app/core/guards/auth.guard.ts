import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Creates a CanActivateFn that allows authenticated users through and redirects
 * unauthenticated users to the given login path. Saves the current URL to
 * sessionStorage so the login page can redirect back after successful sign-in.
 */
export function createAuthGuard(loginPath: string[]): CanActivateFn {
  return (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.loggedIn()) {
      return true;
    }

    return authService.waitForAuthReady().pipe(
      switchMap((sessionState) => {
        if (sessionState.isAuthenticated) {
          return of(true);
        }

        return authService.ensureAuthenticated().pipe(
          map((isAuthenticated) =>
            isAuthenticated ? true : buildLoginRedirect(router, state.url, loginPath),
          ),
        );
      }),
      catchError(() => of(buildLoginRedirect(router, state.url, loginPath))),
    );
  };
}

function buildLoginRedirect(router: Router, returnUrl: string, loginPath: string[]): UrlTree {
  if (returnUrl && !returnUrl.includes('login')) {
    sessionStorage.setItem('postLoginNavigationV2', returnUrl);
  }
  
  return router.createUrlTree(loginPath, {
    queryParams: { message: 'Please sign in to continue.' },
  });
}


/** Default auth guard — redirects unauthenticated users to /login. */
export const authGuard: CanActivateFn = createAuthGuard(['/login']);

/** XVI-FC auth guard — redirects unauthenticated users to XVI-FC login. */
export const xvifcAuthGuard: CanActivateFn = createAuthGuard(['/auth', 'login', '16thFC']);