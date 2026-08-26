import { CanActivateFn } from '@angular/router';

import { environment } from '../../../environments/environment';
import { ROUTE_PAGES } from '../constants/login-menu.constant';

/** SSR's placeholder page — the same one the login menu itself shows in place of this login type. */
const COMING_SOON_PATH = '/auth/login/16thfc';

/**
 * Blocks a login `:type` flagged `isHiddenInProd` (see login-menu.constant.ts) once
 * environment.isProduction is true, redirecting to SSR's coming-soon page instead. Applies
 * to direct URL entry and to internal redirects into this route alike (e.g. xvifcAuthGuard),
 * since it runs on the route itself rather than just hiding the menu row that links to it.
 *
 * XVIFC_PROD_CUTOVER: once isHiddenInProd is removed from ROUTE_PAGES, this guard becomes a
 * permanent no-op — delete this file and its canActivate reference in auth.routes.ts, or leave
 * it in place as a harmless dead safety net.
 */
export const loginTypeAvailabilityGuard: CanActivateFn = (route) => {
  const type = route.paramMap.get('type');
  const page = ROUTE_PAGES.find((p) => p.type === type);

  if (page?.isHiddenInProd && environment.isProduction) {
    window.location.href = COMING_SOON_PATH;
    return false;
  }

  return true;
};
