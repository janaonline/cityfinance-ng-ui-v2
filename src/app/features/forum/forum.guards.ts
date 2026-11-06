import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { isForumAdmin } from './forum-permissions';

/** Allows only ADMIN users into the forum admin area; everyone else goes to /forum/unauthorized. */
export const forumAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getCurrentUserSnapshot();
  return isForumAdmin(user) ? true : router.createUrlTree(['/forum', 'unauthorized']);
};
