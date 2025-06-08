import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { environment } from '../../../../environments/environment';
import { IUserLoggedInDetails } from '../../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../../core/models/user/userType';
import { AuthService } from '../../../core/services/auth.service';
import { AccessChecker } from '../../../core/util/access/accessChecker';
import { ACTIONS } from '../../../core/util/access/actions';
import { MODULES_NAME } from '../../../core/util/access/modules';
import { UserUtility } from '../../../core/util/user/user';
import { UserInfoDialogComponent } from '../user-info-dialog/user-info-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BsDropdownModule, CollapseModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, AfterViewInit {
  public readonly loginTypes = [
    { key: '15thFC', type: 'XV FC Grant' },
    { key: 'XVIFC', type: 'XVI FC Data Collection' },
    { key: 'ranking', type: 'Rankings 2022' },
  ];
  readonly readonlyEmails = ['doe@cityfinance.in', 'cca-mohua@gov.in'];
  public isNavbarOpen: boolean = false;

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  homeHeaderService: any;
  utilityService: any;
  globalLoaderService: any;
  dialog: any;
  isReadonlyUser(): boolean {
    if (this.user?.email) return !this.readonlyEmails.includes(this.user?.email);
    return false;
  }

  public showRequestDemoPopup(): void {
    // Frontend config flags for handling the module.
    const moduleInfo = {
      saveToLocalStorage: false,
      endPoint: 'request-demo/getDemoForm',
    };
    const downloadInfo = { module: 'requestDemo' }; // Info about the file download for backend payload.
    const dialogRef = this.dialog.open(UserInfoDialogComponent, {
      data: { downloadInfo, moduleInfo },
    });

    dialogRef.afterClosed().subscribe((data: unknown) => {
      if (data) {
        this.globalLoaderService.showLoader();
        this.homeHeaderService.submitDemoData(data).subscribe({
          next: () => {
            this.utilityService.swalPopup('Sucess!', "We'll get back to you shortly!", 'success');
            this.globalLoaderService.stopLoader();
          },
          error: (error: any) => {
            this.globalLoaderService.stopLoader();
            console.error('Error in updating request demo data: ', error);
            this.utilityService.swalPopup('Failed to submit data!', error?.error?.message, 'error');
          },
        });
      }
    });
  }

  private accessChecker = new AccessChecker();
  isProd: boolean = false;
  canViewUserList: boolean = false;
  canViewULBSingUpListing: boolean = false;
  isLoggedIn: boolean = false;
  user!: IUserLoggedInDetails | null;
  loggedInUserDetails: any;
  loggedInUserType: any;
  btnName = 'Login for 15th FC Grants';
  sticky: boolean = false;
  isCollapsed = true;
  prefixUrl = environment.prefixUrl;

  menus: any = [
    {
      key: 'cfr_logo',
      name: 'City Finance Rankings',
      imgUrl: '../../../../assets/images/city-finance-ranking.png',
      class: '',
      href: `${this.prefixUrl}/rankings/home`,
    },
    {
      key: 'dashboards',
      name: 'Dashboard',
      id: 'dashboardDropdown',
      href: '',
      child: [
        { name: 'National Performance', href: '/dashboard/national/61e150439ed0e8575c881028' },
        { name: 'Own Revenue Performance', href: '/own-revenue-dashboard' },
        { name: 'Service Level Benchmarks Performance', href: '/dashboard/slb' },
        { name: 'Municipal Bonds', href: '/municipal-bonds' },
        { name: 'Municipal Budgets', href: '/municipal-budgets' },
      ],
    },
    {
      key: 'resources_section',
      name: 'Resources',
      href: '/resources-dashboard/data-sets/income_statement',
    },
    {
      key: 'logins',
      name: `15th FC Grants`,
      id: 'loginDropdown',
      href: '/fc-home-page',
      child: [
        { href: '#', name: "Rankings'22 Form" },
        { href: '/cfr/review-rankings-ulbform', name: "Rankings'22 Dashboard" },
        { href: '#', name: 'XVIFC Data Collection' },
        { href: '/admin/xvi-fc-review', name: `Review XVI FC` },
      ],
    },
    // {
    //   name: 'User Manual',
    //   href: './assets/USER-MANUAL-XVI-FC-Data-Collection.pdf',
    //   target: '_blank',
    // },
    {
      key: 'users_section',
      name: 'Users',
      href: '/user/list/ULB',
    },
  ];

  constructor(
    public _router: Router,
    private authService: AuthService,
  ) {
    this.initializeAccessChecking();
    // this._router.events.subscribe((event: any) => {

    // });
  }

  checkUserLoggedIn() {
    this.isLoggedIn = this.authService.loggedIn();
    this.user = this.isLoggedIn ? this.user : null;
    this.isLoggedIn = false;

    this.initializeAccessChecking();

    if (this.isLoggedIn) {
      UserUtility.getUserLoggedInData().subscribe((value: any) => {
        this.user = value;
        // this.setLoggedInUserMenu();
      });
      this.btnName = 'Logout';
    } else {
      this.btnName = 'Login for 15th FC Grants';
    }
  }
  setLoggedInUserMenu() {
    if (!this.user) {
      return;
    }
    const role = this.user?.role;
    this.menus = [
      ...this.menus,
      this.notInRole([USER_TYPE.PMU, USER_TYPE.XVIFC_STATE]) && {
        name: '15<sup>th</sup> FC Grants',
        href: '/fc-home-page',
      },
      role === USER_TYPE.ULB && { name: `XVI FC Data Collection`, link: '/xvifc-form' },
      role === USER_TYPE.ULB && {
        name: `User Manual`,
        href: './assets/USER-MANUAL-XVI-FC-Data-Collection.pdf',
        target: '_blank',
      },
      this.inRole([USER_TYPE.XVIFC, USER_TYPE.XVIFC_STATE]) && {
        name: `Review XVI FC`,
        link: '/admin/xvi-fc-review',
      },
      this.notInRole([USER_TYPE.ULB, USER_TYPE.XVIFC_STATE]) && {
        name: `Rankings'22 Dashboard`,
        href: '/cfr/review-rankings-ulbform',
      },
      this.notInRole([USER_TYPE.PMU, USER_TYPE.XVIFC_STATE]) && {
        name: 'Users',
        href: '/user/list/ULB',
      },
    ];
  }

  notInRole(roles: string[]) {
    const role = this.user ? this.user.role : '';
    return !roles.includes(role);
  }
  inRole(roles: string[]) {
    const role = this.user ? this.user.role : '';
    return roles.includes(role);
  }

  ngOnInit(): void {
    this.isProd = environment?.isProduction;
    this.checkUserLoggedIn();
    this.setLoggedInUserMenu();
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
    const postLoginNavigation = sessionStorage.getItem('postLoginNavigation'),
      sessionID = sessionStorage.getItem('sessionID');
    sessionStorage.clear();
    sessionStorage.setItem('sessionID', sessionID || '');
    if (postLoginNavigation) sessionStorage.setItem('postLoginNavigation', postLoginNavigation);
  }
  // @HostListener('window:scroll', ['$event'])
  // handleScroll() {
  //   const windowScroll = window.pageYOffset;
  //   if (windowScroll >= 50) {
  //     this.sticky = true;
  //   } else {
  //     this.sticky = false;
  //   }
  // }
  // scroll() {
  //   window.scrollTo({
  //     top: 1000,

  //     behavior: 'smooth',
  //   });
  // }

  loginLogout(type: string) {
    localStorage.setItem('loginType', type);
    if (type == '15thFC') {
      // this._router.navigateByUrl("/fc_grant");
      window.location.href = '/fc_grant';
    } else if (type == 'XVIFC') {
      // this._router.navigateByUrl("/login/xvi-fc");
      window.location.href = '/login/xvi-fc';
    } else if (type == 'ranking') {
      // this._router.navigateByUrl("/rankings/login");
      window.location.href = '/rankings/login';
    } else if (type == 'logout') {
      this.authService.loginLogoutCheck.next(false);
      // this.newCommonService.setFormStatus2223.next(false);
      localStorage.clear();
      this.removeSessionItem();
      this.isLoggedIn = false;
      // this._router.navigateByUrl("rankings/home");
      window.location.href = '/';
    }
  }

  loginLogout_bkp(type: string) {
    // if (type == '15th_Fc') {
    //   this._router.navigateByUrl("/fc_grant");
    // } else if (type == 'ranking') {
    //   this._router.navigateByUrl("/cfr/login");
    // } else if (type == 'logout') {
    this.authService.loginLogoutCheck.next(false);
    // this.newCommonService.setFormStatus2223.next(false);
    localStorage.clear();
    this.removeSessionItem();
    this.isLoggedIn = false;
    // this._router.navigateByUrl("rankings/home");
    window.location.href = '/';
    // } else {

    // }
    // if (this.btnName == "Login for 15th FC Grants") {
    //   this._router.navigateByUrl("/fc_grant");
    // }
    // if (this.btnName == "Logout") {
    //   this.btnName = "Login for 15th FC Grants";
    //   this.authService.loginLogoutCheck.next(false);
    //   // this.newCommonService.setFormStatus2223.next(false);
    //   localStorage.clear();
    //   this.removeSessionItem();
    //   this._router.navigateByUrl("/home");
    // }
  }

  get isSmallDesktop(): boolean {
    const width = window.innerWidth;
    return width >= 990 && width <= 1200;
  }

  isSticky = false;
  private elementPosition = 0;
  private ticking = false;

  @ViewChild('stickyMenu') menuElement?: ElementRef;

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.menuElement) {
        this.elementPosition = this.menuElement.nativeElement.offsetTop;
      }
    });
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

  private updateStickyState(): void {
    if (!this.menuElement) return;
    this.isSticky = window.scrollY >= this.elementPosition;
  }
}
