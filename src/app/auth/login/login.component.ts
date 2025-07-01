import { Component } from '@angular/core';
import { UserTypeComponent } from './user-type/user-type.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MaterialModule } from '../../material.module';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';
import { ActivatedRoute, Router } from '@angular/router';
import { UserUtility } from '../../core/util/user/user';

@Component({
    selector: 'app-login',
    imports: [MaterialModule, UserTypeComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    loginForm: FormGroup;
    loginDetails = [
        {
            role: "ULB",
            loginName: "Census Code/ULB Code",
            loginPlaceHolder: "Census Code/ULB Code",
            loginValidation: "censusValidation",
        },
        {
            role: "USER",
            loginName: "Email",
            loginPlaceHolder: "Email",
            loginValidation: "emailValidation",
        },
        {
            role: "ALL",
            loginName: "Census Code/ULB Code/Email",
            loginPlaceHolder: "Census Code/ULB Code/Email",
            loginValidation: "censuscodeOremailValidation",
        },
    ];
    loginType: string = '15thFC'; // Default login type

    constructor(private fb: FormBuilder, private authService: AuthService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        this.loginForm = this.fb.group({
            email: ['dsdfgdfg@gfhdf.trhhry', [Validators.required, Validators.email]],
            password: ['dfsdfdfsfs', Validators.required],
            type: ['15thFC'],
        });
    }

    onLogin() {
        if (this.loginForm.valid) {
            this.authService.signin(this.loginForm.value).subscribe({
                next: (res) => {
                    console.log('Login Success:', res);
                    // Store token and redirect
                },
                error: (err) => {
                    console.error('Login Failed:', err);
                }
            });
        }
    }

    // private onSuccessfullLogin(res: any) {
    //     const gData = {
    //         user_role: res?.user?.role,
    //         user_id: res?.user?._id,
    //         ...res?.user
    //     };
    //     // this.gaService.set(gData);
    //     // this.gaService.gtag('event', 'login', gData);
    //     this.authService.loginLogoutCheck.next(true);
    //     if (res && res["token"]) {
    //         localStorage.setItem("id_token", JSON.stringify(res["token"]));
    //         localStorage.setItem("Years", JSON.stringify(res["allYears"]));

    //         // if (res["user"]?.role == "STATE") {
    //         //     this.getStateSideBar(res["user"]);
    //         // } else {
    //         //     this.getSideBar(res["user"]);
    //         // }
    //         // if (res["user"]?.role == "MoHUA" || res["user"]?.role == "ADMIN") {
    //         //     this.getMohuaSideBar(res["user"]);
    //         // }
    //         const userUtil = new UserUtility();
    //         userUtil.updateUserDataInRealTime(res["user"]);

    //         this.routeToProperLocation(res["user"]);
    //     } else {
    //         localStorage.removeItem("id_token");
    //     }
    // }

    /**
     * @description Route to appropiate location post login.
     * NOTE: This method must be called only post login.
     */
    routeToProperLocation(user: IUserLoggedInDetails) {
        if (this.loginType === 'XVIFC') {
            if ([USER_TYPE.XVIFC_STATE, USER_TYPE.XVIFC].includes(user.role)) {
                window.location.href = window.location.origin + '/fc/admin/xvi-fc-review';
                // window.location.href = 'http://localhost:4300/admin/xvi-fc-review';
            } else if (user.role === USER_TYPE.ULB) {
                window.location.href = window.location.origin + '/fc/xvifc-form';
                // window.location.href = 'http://localhost:4300/xvifc-form';
            }
        } else {
            const rawPostLoginRoute =
                sessionStorage.getItem("postLoginNavigation") || "home";
            const formattedUrl = this.formatURL(rawPostLoginRoute);

            if (typeof formattedUrl === "string") {
                this.router.navigate([formattedUrl]);
            } else {
                this.router.navigate([formattedUrl.url], {
                    queryParams: { ...formattedUrl.queryParams },
                });
            }
        }
    }
    /**
  * @description Format string url into proper url that can be used with `Router`.
  *
  * @example
  *
  * 1. url = '/some/details'; return '/some/details'
  * 2. url = '/some/details?param=1'
  *          return {url: '/some/details', queryParams: {param: 1}}
  */
    private formatURL(url: string) {
        if (!url.includes(`?`)) return url;
        const [ulrPart, queryParamsInString] = url.split("?");
        const queryParams: any = {};
        queryParamsInString
            .split("&")
            .map(
                (keyValue) =>
                    (queryParams[keyValue.split("=")[0]] = keyValue.split("=")[1])
            );
        return {
            url: ulrPart,
            queryParams,
        };
    }
}
