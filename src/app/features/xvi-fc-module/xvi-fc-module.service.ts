import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SideBarModel } from '../../shared/components/side-menu/interface';
import { Login_Logout } from '../../core/util/logout.util';
import { SIDE_MENU_ITEMS } from './temp';
import { ROLES, Roles, XVIFC_LANDING_ROUTE, XvifcYearId, YEAR_IDS } from './xvi-fc-side-menu.config';

interface XvifcRouteContext {
  role: Roles;
  yearId: XvifcYearId;
}

const EMPTY_SIDE_MENU_MODEL: SideBarModel = {
  topModel: [],
  bottomModel: [],
};

@Injectable({
  providedIn: 'root',
})
export class XvifcModuleService {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly resolvedContext = signal<XvifcRouteContext | null>(null);

  readonly availableYearIds: readonly XvifcYearId[] = YEAR_IDS;
  readonly role = computed<Roles | null>(() => this.resolvedContext()?.role ?? null);
  readonly yearId = computed<XvifcYearId | null>(() => this.resolvedContext()?.yearId ?? null);
  /**
   * Derives the sidebar model from the latest valid route context.
   * Falls back to an empty model so the shell does not require null guards
   * while context is unresolved or after teardown.
   */
  readonly sideMenuModel = computed<SideBarModel>(() => {
    const context = this.resolvedContext();
    return context ? this.buildSideMenuItems(context) : EMPTY_SIDE_MENU_MODEL;
  });

  /**
   * Extracts the effective role/year from the provided route snapshot tree.
   *
   * Side effects:
   * - updates signal state when the snapshot is valid
   * - clears session state and redirects to landing when the snapshot is invalid
   */
  syncContextFromRoute(snapshot: ActivatedRouteSnapshot): void {
    const context = this.resolveContext(snapshot);

    if (!context) {
      this.handleInvalidState();
      return;
    }

    this.resolvedContext.set(context);
  }

  /** Clears any previously resolved context. */
  clearResolvedContext(): void {
    this.resolvedContext.set(null);
  }

  /**
   * Resolves the route context required to render a XVI-FC workspace.
   * Both role and year are mandatory for any in-feature route.
   */
  private resolveContext(snapshot: ActivatedRouteSnapshot): XvifcRouteContext | null {
    const role = this.resolveRole(snapshot);
    const yearId = this.resolveYearId(snapshot);

    if (!role || !yearId) {
      return null;
    }

    return { role, yearId };
  }

  /**
   * Walks the nested route tree and returns the deepest declared role.
   * Child routes are allowed to override parent data, so the last valid
   * role encountered wins.
   */
  private resolveRole(snapshot: ActivatedRouteSnapshot): Roles | null {
    let current: ActivatedRouteSnapshot | null = snapshot;
    let resolvedRole: Roles | null = null;

    while (current) {
      const routeRole = current.data['role'];

      if (routeRole !== undefined) {
        if (!this.isRole(routeRole)) {
          return null;
        }

        // Prefer the most specific child route definition when multiple levels declare a role.
        resolvedRole = routeRole;
      }

      current = current.firstChild ?? null;
    }

    return resolvedRole;
  }

  /**
   * Walks the nested route tree and returns the deepest `yearId` route param.
   * This lets child routes inherit the shell path structure while still
   * validating the final year against the supported set.
   */
  private resolveYearId(snapshot: ActivatedRouteSnapshot): XvifcYearId | null {
    let current: ActivatedRouteSnapshot | null = snapshot;
    let resolvedYearId: XvifcYearId | null = null;

    while (current) {
      const routeYearId = current.paramMap.get('yearId');

      if (routeYearId !== null) {
        if (!this.isYearId(routeYearId)) {
          return null;
        }

        // Later matches are more specific because they come from deeper child routes.
        resolvedYearId = routeYearId;
      }

      current = current.firstChild ?? null;
    }

    return resolvedYearId;
  }

  /**
   * Maps resolved role/year context to the side-menu factory registered for that role.
   * Throws early when route configuration and menu configuration drift apart.
   */
  private buildSideMenuItems(context: XvifcRouteContext): SideBarModel {
    const menuFactory = SIDE_MENU_ITEMS[context.role];

    if (!menuFactory) {
      throw new Error(`No side menu configured for role: ${context.role}`);
    }

    return menuFactory(context.yearId);
  }

  /** Treats unsupported route state as a broken or expired session. */
  private handleInvalidState(): void {
    this.clearResolvedContext();
    this.clearAuthDetailsAndRedirectToLandingPage();
  }

  /**
   * Executes the module's logout contract and then forces navigation back to
   * the XVI-FC landing page.
   */
  private clearAuthDetailsAndRedirectToLandingPage(): void {
    this.authService.loginLogoutCheck.next(false);
    this.authService.logout();
    sessionStorage.clear();
    Login_Logout.logout();
    void this.router.navigate([...XVIFC_LANDING_ROUTE], { replaceUrl: true });
  }

  /** Type guard for role values read from static route data. */
  private isRole(value: unknown): value is Roles {
    return ROLES.includes(value as Roles);
  }

  /** Type guard for year values read from route parameters. */
  private isYearId(value: string | null): value is XvifcYearId {
    return value !== null && YEAR_IDS.includes(value as XvifcYearId);
  }
}
