import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
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

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, MatButtonModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: true,
})
export class NavbarComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly accessChecker = new AccessChecker();

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
  ];

  isProd = false;
  canViewUserList = false;
  canViewULBSingUpListing = false;
  isLoggedIn = false;
  isAuthResolved = false;
  user: IUserLoggedInDetails | null = null;
  btnName = 'Login for 15th FC Grants';
  sticky = false;
  isCollapsed = true;
  prefixUrl = environment.ui.urlV2;
  menus: any[] = [...this.defaultMenus];
  showMobileNav = false;
  isSticky = false;

  private elementPosition = 0;
  private ticking = false;

  @ViewChild('stickyMenu') menuElement?: ElementRef;

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

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.menuElement) {
        this.elementPosition = this.menuElement.nativeElement.offsetTop;
      }
    });
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
    localStorage.setItem('loginType', type);

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
      this.authService.logout().subscribe({
        next: () => {
          this.removeSessionItem();
          this.isLoggedIn = false;
          window.location.href = 'auth/login';
        },
      });
    } else if (type === 'ranking') {
      window.location.href = '/rankings/login';
      return;
    } else {
      this._router.navigate(['/auth/login'], {
        queryParams: { type },
      });
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.updateStickyState();
        this.ticking = false;
      });
      this.ticking = true;
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

    const role = this.user.role;
    this.menus = [
      ...(role === USER_TYPE.ULB ? [{ name: 'XVI FC Data Collection', link: '/xvifc-form' }] : []),
      ...(role === USER_TYPE.ULB
        ? [
          {
            name: 'User Manual',
            href: './assets/USER-MANUAL-XVI-FC-Data-Collection.pdf',
            target: '_blank',
          },
        ]
        : []),
      ...(this.inRole([USER_TYPE.XVIFC, USER_TYPE.XVIFC_STATE])
        ? [{ name: 'Review XVI FC', link: '/admin/xvi-fc-review' }]
        : []),
    ];
  }

  private inRole(roles: string[]) {
    const role = this.user ? this.user.role : '';
    return roles.includes(role);
  }

  private updateStickyState(): void {
    if (!this.menuElement) {
      return;
    }

    this.isSticky = window.scrollY >= this.elementPosition;
  }
}
