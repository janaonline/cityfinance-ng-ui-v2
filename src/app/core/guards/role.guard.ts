import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserUtility } from '../util/user/user';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = inject(UserUtility);

  const userRole = user.getUserType();

  if (route.data['allowedRoles'] && route.data['allowedRoles'].includes(userRole)) {
    return true;
  } else {
    if (['staging', 'prod'].includes(environment.environment)) {
      // redirect to old site
      window.location.href = '/';
    } else {
      router.navigate(['/login']);
    }
    return false;
  }
};
