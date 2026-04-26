import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { OtpAuthService } from './auth.service';

export const otpAuthGuard: CanActivateFn = (_route, state) => {
  const authService = inject(OtpAuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) return true;

  if (state.url && !state.url.includes('login')) {
    sessionStorage.setItem('postLoginNavigation', state.url);
  }

  return router.createUrlTree(['/login'], {
    queryParams: { message: 'Please sign in to continue.' },
  });
};
