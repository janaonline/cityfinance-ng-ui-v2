import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { environment } from '../../../../environments/environment';
import { IUserLoggedInDetails } from '../../../core/models/login/userLoggedInDetails';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserUtility } from '../../../core/util/user/user';
import { AccessChecker } from '../../../core/util/access/accessChecker';
import { MODULES_NAME } from '../../../core/util/access/modules';
import { ACTIONS } from '../../../core/util/access/actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MenuComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  loggedInUserDetails: any;
  loggedInUserType: any;
  btnName = "Login for 15th FC Grants";
  isLoggedIn = false;
  user!: IUserLoggedInDetails | null;

  sticky: boolean = false;
  size: any;

  textSize = ["sm", "rg", "lg"];
  currentTextSize: any;
  canViewUserList = false;
  canViewULBSingUpListing = false;
  constructor(public _router: Router, private authService: AuthService,
  ) {
    this.initializeAccessChecking();
    this._router.events.subscribe((event: any) => {

      this.isLoggedIn = this.authService.loggedIn();
      this.user = this.isLoggedIn ? this.user : null;

      this.initializeAccessChecking();

      if (this.isLoggedIn) {
        UserUtility.getUserLoggedInData().subscribe((value: any) => {
          this.user = value;
        });
      }
      if (this.isLoggedIn) {
        this.btnName = "Logout";
      } else {
        this.btnName = "Login for 15th FC Grants";
      }
    });

    // if (this.isLoggedIn) {
    //   UserUtility.getUserLoggedInData().subscribe((value) => {
    //     this.user = value;
    //   });
    // }


  }
  private accessChecker = new AccessChecker();
  isProd: boolean = false;
  ngOnInit(): void {
    this.isProd = environment?.isProduction;
    // this.authService.loginLogoutCheck.subscribe((res) => {
    //   console.log("loginLogoutCheck", res);
    //   if (res) {
    //     this.btnName = "Logout";
    //   }
    //   if (!res) {
    //     this.btnName = "Login for 15th FC Grants";
    //   }
    // });

    let getTextSize = JSON.parse(localStorage.getItem("myLSkey") || '{}');
    if (getTextSize) this.setFontSize(getTextSize.currentTextSize);
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


  setFontSize(size: string) {
    console.log('setFontSize', size)
    // this.size= size;
    let elem = document.documentElement;

    this.textSize.forEach((item) => elem.classList.remove(item));
    elem.classList.add(size);
    this.currentTextSize = size;
    localStorage.setItem(
      "myLSkey",
      JSON.stringify({
        currentTextSize: size,
      })
    );
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
  removeSessionItem() {
    let postLoginNavigation = sessionStorage.getItem("postLoginNavigation"),
      sessionID = sessionStorage.getItem("sessionID");
    sessionStorage.clear();
    sessionStorage.setItem("sessionID", sessionID || '');
    if (postLoginNavigation)
      sessionStorage.setItem("postLoginNavigation", postLoginNavigation);
  }
  scroll() {
    window.scrollTo({
      top: 1000,

      behavior: "smooth",
    });
  }
  // routerLink="/fc-home-page";
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