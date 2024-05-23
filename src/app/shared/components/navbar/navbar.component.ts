import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AccessChecker } from '../../../core/util/access/accessChecker';
import { MODULES_NAME } from '../../../core/util/access/modules';
import { ACTIONS } from '../../../core/util/access/actions';
import { AuthService } from '../../../core/services/auth.service';
import { IUserLoggedInDetails } from '../../../core/models/login/userLoggedInDetails';
import { UserUtility } from '../../../core/util/user/user';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { USER_TYPE } from '../../../core/models/user/userType';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BsDropdownModule, CollapseModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  private accessChecker = new AccessChecker();
  isProd: boolean = false;
  canViewUserList: boolean = false;
  canViewULBSingUpListing: boolean = false;
  isLoggedIn: boolean = false;
  user!: IUserLoggedInDetails | null;
  loggedInUserDetails: any;
  loggedInUserType: any;
  btnName = "Login for 15th FC Grants";
  sticky: boolean = false;
  isCollapsed = true;

  menus: any = [
    {
      name: `<img src="./assets/images/city-finance-ranking.png"/>`,
      class: 'navbar-brand cityLogo',
      link: '/rankings/home'
    },
    {
      name: 'Dashboard', link: '', child:
        [
          { name: 'National Performance', link: '/dashboard/national/61e150439ed0e8575c881028' },
          { name: 'Own Revenue Performance', link: '/own-revenue-dashboard' },
          { name: 'Service Level Benchmarks Performance', link: '/dashboard/slb' },
          { name: 'Municipal Bonds', link: '/municipal-bonds' },
          { name: 'Municipal Budgets', link: '/municipal-budgets' },
        ]
    },

    { name: 'Resources', link: '/resources-dashboard/data-sets/income_statement' },
  ];

  constructor(public _router: Router, private authService: AuthService,
  ) {
    this.initializeAccessChecking();
    // this._router.events.subscribe((event: any) => {


    // });
    this.checkUserLoggedIn();
  }

  checkUserLoggedIn() {
    this.isLoggedIn = this.authService.loggedIn();
    this.user = this.isLoggedIn ? this.user : null;

    this.initializeAccessChecking();

    if (this.isLoggedIn) {
      UserUtility.getUserLoggedInData().subscribe((value: any) => {
        this.user = value;
        this.setLoggedInUserMenu();
      });
      this.btnName = "Logout";
    } else {
      this.btnName = "Login for 15th FC Grants";
    }
  }
  setLoggedInUserMenu() {
    const role = this.user ? this.user.role : '';
    this.menus = [
      ...this.menus,
      (role === USER_TYPE.PMU && { name: 'State resources', link: '/mohua-form/state-resource-manager' }),
      (role !== USER_TYPE.PMU && { name: '15<sup>th</sup> FC Grants', link: '/fc-home-page' }),
      (role === USER_TYPE.ULB && { name: `Rankings'22 Form`, link: '/rankings/ulb-form' }),
      (role !== USER_TYPE.ULB && { name: `Rankings'22 Dashboard`, link: '/rankings/review-rankings-ulbform' }),
      (role !== USER_TYPE.PMU && { name: 'Users', link: '/user/list/ULB' }),
    ];
  }
  ngOnInit(): void {
    this.isProd = environment?.isProduction;
    // this.setLoggedInUserMenu();
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
    let postLoginNavigation = sessionStorage.getItem("postLoginNavigation"),
      sessionID = sessionStorage.getItem("sessionID");
    sessionStorage.clear();
    sessionStorage.setItem("sessionID", sessionID || '');
    if (postLoginNavigation)
      sessionStorage.setItem("postLoginNavigation", postLoginNavigation);
  }
  @HostListener("window:scroll", ["$event"])
  handleScroll() {
    const windowScroll = window.pageYOffset;
    if (windowScroll >= 50) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }
  }
  scroll() {
    window.scrollTo({
      top: 1000,

      behavior: "smooth",
    });
  }
  loginLogout(type: string) {
    if (type == '15th_Fc') {
      this._router.navigateByUrl("/fc_grant");
    } else if (type == 'ranking') {
      this._router.navigateByUrl("/rankings/login");
    } else if (type == 'logout') {
      this.authService.loginLogoutCheck.next(false);
      // this.newCommonService.setFormStatus2223.next(false);
      localStorage.clear();
      this.removeSessionItem();
      this.isLoggedIn = false;
      this._router.navigateByUrl("rankings/home");
    } else {

    }
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

  isSticky = false;
  public screenHeight: any;
  elementPosition!: number;
  @ViewChild('stickyMenu') menuElement: ElementRef | undefined;
  ngAfterViewInit() {
    this.elementPosition = this.menuElement?.nativeElement.offsetTop;
  }
  @HostListener('window:scroll', ['$event'])
  handleScrollTop() {
    if (window.scrollY >= this.elementPosition) {
      this.isSticky = true;
    } else {
      this.isSticky = false;
    }

  }
}
