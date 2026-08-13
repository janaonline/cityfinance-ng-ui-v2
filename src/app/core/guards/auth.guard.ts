import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { AuthService } from '../services/auth.service';

/** Route the eligibility guard sends an ineligible ULB session to. */
const NOT_ELIGIBLE_PATH = ['/xvifc-not-eligible'];

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

/**
 * Runs after `xvifcAuthGuard` confirms the session is authenticated. Covers the case a fresh
 * login doesn't: a ULB session that already holds a valid token (issued before this eligibility
 * rule existed, or via a flow that doesn't gate it) navigating straight into `/xvifc/**`. Fresh
 * logins are blocked earlier, at the backend (`LoginService.login()` / `OtpService.verifyOtp()`),
 * so most ineligible ULBs never get a token in the first place — this is a secondary, defense-in-
 * depth check, not the primary gate.
 *
 * Fails open on a transient `/auth/me` error (network blip, backend hiccup) rather than locking an
 * eligible ULB out of the whole module over it — the backend APIs underneath remain the
 * authoritative gate regardless of what this guard decides.
 */
export const xvifcEligibilityGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getMe().pipe(
    map(({ isEligibleForXviFc }) =>
      isEligibleForXviFc === false ? router.createUrlTree(NOT_ELIGIBLE_PATH) : true,
    ),
    catchError(() => of(true)),
  );
};