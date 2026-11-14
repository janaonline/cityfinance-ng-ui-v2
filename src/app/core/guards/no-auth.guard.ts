import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedIn()) {
    // TS-1262: an already-signed-in user hitting the login page lands on the unified home page,
    // not a hardcoded module route.
    return router.createUrlTree(['/']);
  }

  return true;
};
