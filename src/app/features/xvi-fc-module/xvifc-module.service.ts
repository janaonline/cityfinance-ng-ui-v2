import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SideBarModel } from '../../shared/components/side-menu/interface';
import { SIDE_MENU_ITEMS } from './temp';
import { ROLES, Roles, XVIFC_DEFAULT_ROLE, XVIFC_DEFAULT_YEAR_ID } from './xvifc-side-menu.config';

@Injectable({
  providedIn: 'root',
})
export class XvifcModuleService {
  // Returns sidebar menu data for a given role and yearId.
  getSideMenuItems(
    role: Roles = XVIFC_DEFAULT_ROLE,
    yearId: string = XVIFC_DEFAULT_YEAR_ID,
  ): SideBarModel {
    // TODO: Replace with API call once available.
    // The API should ideally accept role and yearId as parameters and return the appropriate menu structure.
    if (!SIDE_MENU_ITEMS[role]) {
      throw new Error(`No side menu configured for role: ${role}`);
    }
    const menuItems = SIDE_MENU_ITEMS[role](yearId);
    return menuItems;
  }

  // Reads the active Angular route tree and extracts the current role and yearId.
  resolveRoleAndYearFromRoute(snapshot: ActivatedRouteSnapshot): { role: Roles; yearId: string } {
    let role: Roles = XVIFC_DEFAULT_ROLE;
    let yearId = XVIFC_DEFAULT_YEAR_ID;
    let current: ActivatedRouteSnapshot | null = snapshot;
    let foundRole = false;
    let foundYearId = false;

    while (current) {
      // The role is expected to be defined in the route's data property
      // while yearId is expected as a route parameter.
      const routeRole = current.data['role'];
      if (this.isRole(routeRole)) {
        role = routeRole;
        foundRole = true;
      }

      const routeYearId = current.paramMap.get('yearId');
      if (routeYearId) {
        yearId = routeYearId;
        foundYearId = true;
      }
      current = current.firstChild ?? null;
    }

    if (!foundRole) {
      console.warn('Route role not found. Falling back to default role.');
    }

    if (!foundYearId) {
      console.warn('Route yearId not found. Falling back to default yearId.');
    }

    return { role, yearId };
  }

  // Type guard: which safely checks whether a runtime value is one of the allowed roles.
  private isRole(value: unknown): value is Roles {
    return ROLES.includes(value as Roles);
  }
}
