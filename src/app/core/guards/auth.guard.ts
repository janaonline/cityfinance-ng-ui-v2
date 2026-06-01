import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
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
          isAuthenticated ? true : createLoginRedirect(router, state.url),
        ),
      );
    }),
    catchError(() => of(createLoginRedirect(router, state.url))),
  );
};

function createLoginRedirect(router: Router, returnUrl: string): UrlTree {
  if (returnUrl && !returnUrl.includes('login')) {
    sessionStorage.setItem('postLoginNavigationV2', returnUrl);
  }

  return router.createUrlTree(['/login'], {
    queryParams: { message: 'Please sign in to continue.' },
  });
}
