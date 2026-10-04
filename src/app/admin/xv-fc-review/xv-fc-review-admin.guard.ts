import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserUtility } from '../../core/util/user/user';
import { USER_TYPE } from '../../core/models/user/userType';

/**
 * Restricts /admin/xv-fc-review to ADMIN/AFS_ADMIN — matches the backend's own
 * `@Roles([Role.ADMIN])` guard on every `/admin/xv-fc-review/*` endpoint. The parent `/admin`
 * route already requires authentication (see app.routes.ts's `authGuard`); this only adds the
 * role check on top, redirecting a signed-in-but-wrong-role user to the existing /error page
 * instead of letting them land on a page that's just going to 403 on every API call.
 */
export const xvFcReviewAdminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = new UserUtility().getUserType();

  if (role === USER_TYPE.ADMIN || role === USER_TYPE.AFS_ADMIN) {
    return true;
  }

  return router.createUrlTree(['/error']);
};
