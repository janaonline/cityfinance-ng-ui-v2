import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthPermissionService } from './auth-permission.service';
import { Permission } from './permissions';

export const managedUsersGuard: CanActivateFn = () => {
  const permissionService = inject(AuthPermissionService);
  const router = inject(Router);

  if (permissionService.hasPermission(Permission.VIEW_MANAGED_USERS)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
