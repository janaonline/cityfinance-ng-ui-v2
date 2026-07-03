import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';
import { IUserLoggedInDetails } from '../../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../../core/models/user/userType';
import { AuthService, AuthSessionState } from '../../../core/services/auth.service';
import { AccessChecker } from '../../../core/util/access/accessChecker';
import { ACTIONS } from '../../../core/util/access/actions';
import { MODULES_NAME } from '../../../core/util/access/modules';
import { ROUTE_PAGES } from '../../../core/constants/login-menu.constant';

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

  readonly ocrMenu = {
    name: 'OCR',
    href: '',
    child: [
      { name: 'Jobs List', link: '/ocr/list' },
      { name: 'Upload', link: '/ocr/upload' },
      { name: 'Job Details', link: '/ocr/details' },
      { name: 'Validation', link: '/ocr/validation' },
      { name: 'Validation List', link: '/ocr/validation-list' },
      { name: 'Eval Benchmarks', link: '/ocr/eval-benchmarks' },
    ],
  };

  readonly defaultMenus: any[] = [
    {
      name: 'Dashboard',
      href: '',
      child: [
        { name: 'National Performance', href: '/dashboard/national/61e150439ed0e8575c881028' },
        { name: 'Own Revenue Performance', href: '/own-revenue-dashboard' },
        { name: 'Service Level Benchmarks Performance', href: '/dashboard/slb' },
        { name: 'Municipal Bonds', href: '/municipal-bonds' },
        { name: 'Municipal Budgets', href: '/municipal-budgets' },
      ],
    },
    { name: 'Resources', href: '/resources-dashboard/data-sets/income_statement' },
    this.ocrMenu,
  ];

  isProd = false;
  canViewUserList = false;
  canViewULBSingUpListing = false;
  isLoggedIn = false;
  isAuthResolved = false;
  user: IUserLoggedInDetails | null = null;
  btnName = 'Login for 15th FC Grants';
  isCollapsed = true;
  prefixUrl = environment.ui.urlV2;
  menus: any[] = [...this.defaultMenus];
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

  private applySessionState(sessionState: AuthSessionState, user: IUserLoggedInDetails | null) {
    this.isAuthResolved = sessionState.isReady;
    this.isLoggedIn = sessionState.isAuthenticated;
    this.user = sessionState.isAuthenticated ? user : null;
    this.btnName = sessionState.isAuthenticated ? 'Logout' : 'Login for 15th FC Grants';

    this.initializeAccessChecking();
    this.setLoggedInUserMenu();
  }

  private setLoggedInUserMenu() {
    if (!this.user || !this.isLoggedIn) {
      this.menus = [...this.defaultMenus];
      return;
    }

    // const role = this.user.role;
    this.menus = [
      this.ocrMenu,
      // ...(role === USER_TYPE.ULB ? [{ name: 'XVI FC Data Collection', link: '/xvifc-form' }] : []),
      // ...(role === USER_TYPE.ULB
      //   ? [
      //     {
      //       name: 'User Manual',
      //       href: './assets/USER-MANUAL-XVI-FC-Data-Collection.pdf',
      //       target: '_blank',
      //     },
      //   ]
      //   : []),
      ...(this.inRole([USER_TYPE.XVIFC, USER_TYPE.XVIFC_STATE])
        ? [{ name: 'Review XVI FC', link: '/admin/xvi-fc-review' }]
        : []),
    ];
  }

  private inRole(roles: string[]) {
    const role = this.user ? this.user.role : '';
    return roles.includes(role);
  }
}
