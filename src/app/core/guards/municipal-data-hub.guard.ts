import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthPermissionService } from '../auth/auth-permission.service';
import { isEligibleForMunicipalDataHub } from '../../features/landing/municipal-data-hub.eligibility';

/**
 * Refuses a direct link to /municipal-data-hub for anyone not eligible (TS-1262 acceptance
 * criterion), not just hiding the card — run after `authGuard` so there's already a logged-in
 * user to check. Defense-in-depth only: the real Data Hub page's own backend must independently
 * authorize this once it exists, same as every other guard in this app.
 */
export const municipalDataHubGuard: CanActivateFn = () => {
  const permissions = inject(AuthPermissionService);
  const router = inject(Router);

  const user = permissions.user();
  if (user && isEligibleForMunicipalDataHub(permissions.role(), user)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
