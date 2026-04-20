import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { Login_Logout } from '../../core/util/logout.util';
import { SideBarModel } from '../../shared/components/side-menu/interface';
import { XviFcSideMenuApiService } from './xvi-fc-side-menu.service';
import {
  ROLES,
  Roles,
  XVIFC_LANDING_ROUTE,
  XvifcYearId,
  YEAR_IDS,
} from './xvi-fc-side-menu.config';

export interface XvifcRouteContext {
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
  private readonly sideMenuApiService = inject(XviFcSideMenuApiService);

  private readonly resolvedContext = signal<XvifcRouteContext | null>(null);
  private readonly lastMenuRequestKey = signal<string | null>(null);

  readonly availableYearIds: readonly XvifcYearId[] = YEAR_IDS;

  readonly role = computed<Roles | null>(() => this.resolvedContext()?.role ?? null);
  readonly yearId = computed<XvifcYearId | null>(() => this.resolvedContext()?.yearId ?? null);

  readonly sideMenuModel = signal<SideBarModel>(EMPTY_SIDE_MENU_MODEL);
  readonly isSideMenuLoading = signal(false);

  constructor() {
    effect(() => {
      const context = this.resolvedContext();

      if (!context) {
        this.lastMenuRequestKey.set(null);
        this.sideMenuModel.set(EMPTY_SIDE_MENU_MODEL);
        this.isSideMenuLoading.set(false);
        return;
      }

      void this.loadSideMenu(context);
    });
  }

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

        resolvedYearId = routeYearId;
      }

      current = current.firstChild ?? null;
    }

    return resolvedYearId;
  }

  /**
   * Calls the side menu API and resolves one menu model.
   */
  private buildSideMenuItems(context: XvifcRouteContext): Promise<SideBarModel> {
    return firstValueFrom(this.sideMenuApiService.getSideMenu(context));
  }

  /**
   * Loads sidebar items asynchronously whenever role/year context changes.
   */
  private async loadSideMenu(context: XvifcRouteContext): Promise<void> {
    const requestKey = `${context.role}-${context.yearId}`;

    if (this.lastMenuRequestKey() === requestKey && this.sideMenuModel().topModel.length > 0) {
      return;
    }

    this.lastMenuRequestKey.set(requestKey);
    this.isSideMenuLoading.set(true);

    try {
      const menu = await this.buildSideMenuItems(context);
      this.sideMenuModel.set(menu);
    } catch (error) {
      console.error('Failed to load side menu', error);
      this.sideMenuModel.set(EMPTY_SIDE_MENU_MODEL);
    } finally {
      this.isSideMenuLoading.set(false);
    }
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
