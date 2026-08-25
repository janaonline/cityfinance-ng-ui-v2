import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { combineLatest, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';
import { IUserLoggedInDetails } from '../../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../../core/models/user/userType';
import { AuthService, AuthSessionState } from '../../../core/services/auth.service';
import { AccessChecker } from '../../../core/util/access/accessChecker';
import { ACTIONS } from '../../../core/util/access/actions';
import { MODULES_NAME } from '../../../core/util/access/modules';
import { ROUTE_PAGES } from '../../../core/constants/login-menu.constant';
import { XVIFC_LS_KEYS } from '../../../features/xvi-fc-module/shared/years-selection/years-selection.component';
import { UlbNotificationService } from '../../../features/xvi-fc-module/ulb-module/ulb-notification.service';
import { NAV_MENU_ITEMS, NavMenuItem, resolveMenus } from './nav-menu.config';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, MatButtonModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: true,
})
export class NavbarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly accessChecker = new AccessChecker();
  readonly ulbNotifications = inject(UlbNotificationService);

  isProd = false;
  canViewUserList = false;
  canViewULBSingUpListing = false;
  isLoggedIn = false;
  isAuthResolved = false;
  user: IUserLoggedInDetails | null = null;
  btnName = 'Login for 15th FC Grants';
  isCollapsed = true;
  prefixUrl = environment.ui.urlV2;
  menus: NavMenuItem[] = [];
  showMobileNav = false;

  routePages = ROUTE_PAGES.filter((page) => page.isMenu);

  constructor(
    public _router: Router,
    private authService: AuthService,
  ) {
    this.initializeAccessChecking();
  }

  ngOnInit(): void {
    this.isProd = environment?.isProduction;
    this.bindAuthState();
    this.bindRouteChanges();
    this.refreshMenus();
  }

  initializeAccessChecking() {
    this.canViewUserList = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.USERLIST,
      action: ACTIONS.VIEW,
    });
    this.canViewULBSingUpListing = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.ULB_SIGNUP_REQUEST,
      action: ACTIONS.VIEW,
    });
  }

  removeSessionItem() {
    const postLoginNavigation = sessionStorage.getItem('postLoginNavigationV2');
    const sessionID = sessionStorage.getItem('sessionID');

    sessionStorage.clear();

    if (sessionID) {
      sessionStorage.setItem('sessionID', sessionID);
    }
    if (postLoginNavigation) {
      sessionStorage.setItem('postLoginNavigationV2', postLoginNavigation);
    }
  }

  loginLogout(type: string) {
    if (type !== 'logout') {
      localStorage.setItem('loginType', type);
    }

    // if (type === '15thFC') {
    //   this._router.navigate(['/auth/login'], {
    //     queryParams: { type },
    //   });
    //   // window.location.href = '/fc_grant';
    //   // return;
    // }
    // if (type == 'xvifc') {
    //   this._router.navigate(['/login'], {
    //     queryParams: { type },
    //   });
    //   // this._router.navigateByUrl("/login/xvi-fc");
    //   // window.location.href = '/login';
    // }
    // if (type === 'XVIFC') {
    //   window.location.href = '/login/16thFC';
    //   return;
    // }

    if (type === 'logout') {
      const loginType = localStorage.getItem('loginType') ?? '16thFC';
      this.authService.logout().subscribe({
        next: () => {
          this.removeSessionItem();
          this.isLoggedIn = false;
          this._router.navigate(['/auth/login', loginType]);
        },
      });
      // } else if (type === 'ranking') {
      //   window.location.href = '/rankings/login';
      //   return;
    } else {
      this._router.navigate(['/auth/login', type]);
      // this._router.navigate(['/auth/login', { type }], {
      //   queryParams: { type },
      // });
    }
  }

  private bindAuthState() {
    combineLatest([this.authService.sessionState$, this.authService.currentUser$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([sessionState, user]) => {
        this.applySessionState(sessionState, user);
      });
  }

  private bindRouteChanges() {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.refreshMenus());
  }

  private isOcrRoute(): boolean {
    return this._router.url.startsWith('/ocr');
  }

  private applySessionState(sessionState: AuthSessionState, user: IUserLoggedInDetails | null) {
    this.isAuthResolved = sessionState.isReady;
    this.isLoggedIn = sessionState.isAuthenticated;
    this.user = sessionState.isAuthenticated ? user : null;
    this.btnName = sessionState.isAuthenticated ? 'Logout' : 'Login for 15th FC Grants';

    this.initializeAccessChecking();
    this.refreshMenus();

    if (this.showNotificationBell && this.user?.ulb) {
      void this.ulbNotifications.ensureLoadedForUlb(String(this.user.ulb));
    }
  }

  /** Bell + badge are ULB-only for now — no notification source exists yet for other roles. */
  get showNotificationBell(): boolean {
    return this.isLoggedIn && this.inRole([USER_TYPE.ULB]);
  }

  navigateToNotification(route: string): void {
    const yearId = localStorage.getItem(XVIFC_LS_KEYS.selectedYearId);
    if (!yearId) return;
    this._router.navigate(['/xvifc', yearId, route]);
  }

  /**
   * Rebuilds `menus` from the shared NAV_MENU_ITEMS config. Replaces the old
   * setLoggedInUserMenu(), which rebuilt the logged-in branch from scratch
   * instead of extending the base set — that's what silently dropped
   * Dashboard/Resources for every logged-in user. This version always starts
   * from the full filtered tree, so nothing gets lost based on auth state.
   */
  private refreshMenus(): void {
    const resolved = resolveMenus(NAV_MENU_ITEMS, (item) => this.isMenuItemVisible(item));
    this.menus = resolved.map((item) => this.resolveLinks(item));
  }

  private isMenuItemVisible(item: NavMenuItem): boolean {
    if (!item.apps.includes('v2')) return false;

    const v = item.visibility;
    if (!v) return true;

    if (v.showOnMobileOnly) return false; // no mobile-only slot in V2 today
    if (v.ocrRouteOnly && !this.isOcrRoute()) return false;
    if (v.nonProdOnly && this.isProd) return false;
    if (v.requiresAuth && !this.isLoggedIn) return false;
    if (v.loggedOutOnly && this.isLoggedIn) return false;
    if (v.roles && !this.inRole(v.roles)) return false;
    if (v.excludeRoles && this.inRole(v.excludeRoles)) return false;
    // readonlyGated / moduleAccess: V2 has neither isReadonlyUser() nor a
    // "Users" item wired up today (deferred per the nav-unification plan) —
    // no item that includes 'v2' in `apps` currently sets these, so there's
    // nothing to evaluate yet. Add handling here if that changes.

    return true;
  }

  /** Turns hostApp/path into a concrete routerLink or href for THIS app (V2). */
  private resolveLinks(item: NavMenuItem): NavMenuItem {
    const resolved: NavMenuItem = { ...item };

    if (item.children?.length) {
      resolved.children = item.children.map((child) => this.resolveLinks(child));
    }

    switch (item.hostApp) {
      case 'v2':
        resolved.resolvedLink = item.path;
        break;
      case 'ui':
        resolved.resolvedHref = item.path
          ? environment.ui.urlV1.replace(/\/$/, '') + item.path
          : undefined;
        break;
      case 'ssr':
        // SSR occupies the site root, so a plain relative path resolves
        // there via the shared-domain reverse proxy (same limitation as
        // today's code when running each app's own local dev server).
        resolved.resolvedHref = item.path;
        break;
      case 'external':
        resolved.resolvedHref = item.id === 'blog' ? environment.blogUrl : item.absoluteHref;
        break;
      default:
        break;
    }

    return resolved;
  }

  private inRole(roles: string[]) {
    const role = this.user ? this.user.role : '';
    return roles.includes(role);
  }
}
