import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedIn()) {
    return true;
  }

  return authService.ensureAuthenticated().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      } else {
        return false;
      }

      // return router.createUrlTree(['/login'], {
      //   queryParams: { message: 'Session Expired. Kindly login again.' },
      // });
    }),
    catchError(() =>
      of(
        router.createUrlTree(['/login'], {
          queryParams: { message: 'Session Expired. Kindly login again.' },
        }),
      ),
    ),
  );
};
