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
import { NAV_MENU_ITEMS, NavMenuItem, matchesAnyRoutePrefix, resolveMenus } from './nav-menu.config';

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

  /** Rebuilds `menus` from the shared NAV_MENU_ITEMS config — see ./CLAUDE.md, "Resolution pipeline". */
  private refreshMenus(): void {
    const resolved = resolveMenus(
      NAV_MENU_ITEMS,
      (item) => this.isMenuItemVisible(item),
      (item) => this.isActiveGroupChild(item),
    );
    this.menus = resolved.map((item) => this.resolveLinks(item));
  }

  /** True when `item` is this app's own route and the current URL is on/under it — see ./CLAUDE.md, "Active-route highlighting". */
  private isActiveGroupChild(item: NavMenuItem): boolean {
    if (item.hostApp !== 'v2') return false;
    const prefix = item.activePathPrefix ?? item.path;
    if (!prefix) return false;
    return matchesAnyRoutePrefix(this._router.url, [prefix]);
  }

  private isMenuItemVisible(item: NavMenuItem): boolean {
    if (!item.apps.includes('v2')) return false;

    const v = item.visibility;
    if (!v) return true;

    if (v.showOnMobileOnly) return false; // no mobile-only slot in V2 today
    if (v.ocrRouteOnly && !this.isOcrRoute()) return false;
    if (v.isHiddenInProd && this.isProd) return false;
    if (v.requiresAuth && !this.isLoggedIn) return false;
    if (v.loggedOutOnly && this.isLoggedIn) return false;
    if (v.roles && !this.inRole(v.roles)) return false;
    if (v.excludeRoles && this.inRole(v.excludeRoles)) return false;
    // Route-based gating — see ./CLAUDE.md, "How the three role/route dimensions actually combine".
    if (v.showOnlyOnRoutePrefixes && !matchesAnyRoutePrefix(this._router.url, v.showOnlyOnRoutePrefixes)) {
      return false;
    }
    if (v.hideOnRoutePrefixes && matchesAnyRoutePrefix(this._router.url, v.hideOnRoutePrefixes)) {
      return false;
    }
    if (
      v.hideWhenRoleOnRoute &&
      this.inRole(v.hideWhenRoleOnRoute.roles) &&
      matchesAnyRoutePrefix(this._router.url, v.hideWhenRoleOnRoute.routePrefixes)
    ) {
      return false;
    }
    // moduleAccess has no V2 equivalent — no 'v2' item sets it today.
    if (v.readonlyGated && !this.isReadonlyUser()) return false;

    return true;
  }

  private readonly readonlyEmails = ['doe@cityfinance.in', 'cca-mohua@gov.in', 'cag@cityfinance.in'];

  private isReadonlyUser(): boolean {
    return !this.readonlyEmails.includes(this.user?.email ?? '');
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
        // SSR occupies the site root — a relative path resolves via the shared-domain reverse proxy.
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
