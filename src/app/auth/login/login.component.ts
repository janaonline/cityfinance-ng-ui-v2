import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { Subscription, timer } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { RecaptchaService } from '../../core/services/recaptcha.service';
import { AuthService } from '../../core/services/auth.service';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';
import { XvifcModuleService } from '../../features/xvi-fc-module/xvi-fc-module.service';
import { environment } from '../../../environments/environment';

type LoginRole = 'ULB' | 'STATE' | 'MOHUA' | 'DOE';
type RoleIcon = 'ulb' | 'state' | 'mohua' | 'doe';
type LoginControlName = 'role' | 'identifier' | 'password' | 'otp';

interface StatItem {
  label: string;
  value: string;
}

interface RoleOption {
  id: LoginRole;
  label: string;
  icon: RoleIcon;
  disabled?: boolean;
  badge?: string;
}

const LOGIN_TYPES = ['16thFC', '15thFC', 'XVIFC', 'ranking', 'state-dashboard'] as const;

// 2. Derive the type from the array
export type LoginType = (typeof LOGIN_TYPES)[number];
// type LoginType = '16thFC' | '15thFC' | 'XVIFC' | 'ranking' | 'state-dashboard';
type LoginFormModel = {
  role: FormControl<LoginRole | ''>;
  identifier: FormControl<string>;
  password: FormControl<string>;
  otp: FormControl<string>;
};

const OTP_LENGTH = 4;
const OTP_VALIDATORS = [
  Validators.required,
  Validators.minLength(OTP_LENGTH),
  Validators.maxLength(OTP_LENGTH),
  Validators.pattern(new RegExp(`^\\d{${OTP_LENGTH}}$`)),
];

function emailOrCensusCode(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) return null;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const censusRe = /^\d+$/;
  return emailRe.test(value) || censusRe.test(value) ? null : { invalidIdentifier: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private _router: Router,
  ) { }
  private readonly xvifcService = inject(XvifcModuleService);
  private readonly authService = inject(AuthService);
  private readonly recaptchaService = inject(RecaptchaService);

  typeKey = signal<LoginType | null>('15thFC');
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isOtpLogin = signal(false);
  protected readonly supportEmail = '16fcgrant@cityfinance.in';
  protected readonly brandName = 'CITY FINANCE';
  protected readonly otpLength = OTP_LENGTH;

  protected isSubmitted = false;
  protected isPasswordVisible = false;
  protected otpCreds: any = {};

  protected readonly otpCountdown = signal(0);
  protected readonly otpCountdownActive = signal(false);
  private countdownSub: Subscription | null = null;

  protected readonly stats: readonly StatItem[] = [
    { label: 'Eligible Urban Local Bodies', value: '4,485' },
    { label: 'Special Grant Categories', value: '2' },
    { label: 'Total Grants Allocated', value: '₹1,29,987 Cr' },
    { label: 'Year 1 Disbursement', value: '₹37,272 Cr' },
  ];

  protected readonly roleOptions: readonly RoleOption[] = [
    { id: 'ULB', label: 'ULB', icon: 'ulb' },
    { id: 'STATE', label: 'State DMA', icon: 'state' },
    { id: 'MOHUA', label: 'MoHUA', icon: 'mohua' },
    { id: 'DOE', label: 'DoE', icon: 'doe', disabled: true, badge: 'SOON' },
  ];

  protected readonly loginForm = new FormGroup<LoginFormModel>({
    role: new FormControl<LoginRole | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    identifier: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, emailOrCensusCode],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    otp: new FormControl('', { nonNullable: true }),
  });

  routePages: { type: string; label: string; link?: string; route?: string; roles: USER_TYPE[] }[] = [{
    type: '15thFC',
    label: '15th FC',
    link: '/fc-home-page',
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
  }, {
    type: '16thFC',
    label: '16th FC',
    route: '/xvifc/year',
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
  },
  {
    type: 'XVIFC',
    label: 'XVI FC',
    route: '/xvifc-form',
    roles: [USER_TYPE.ULB]
  },
  {
    type: 'XVIFC',
    label: 'XVI FC',
    route: '/admin/xvi-fc-review',
    roles: [USER_TYPE.XVIFC_STATE, USER_TYPE.XVIFC]
  },
  {
    type: 'ranking',
    label: 'Ranking',
    link: '/ranking',
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
  },
  {
    type: 'state-dashboard',
    label: 'State Dashboard',
    link: '/state-dashboard',
    roles: [USER_TYPE.STATE, USER_TYPE.ADMIN]
  }
  ];

  documents = [
    {
      title: 'ULB Nodal Officers Manual for Claiming XV FC ULB Grants for 2021-22',
      file: './assets/files/ULB Nodal Officers Manual for Claiming XV FC ULB Grants Oct 2021.pdf',
    },
    {
      title: 'State Nodal Officers Manual for Claiming XV FC ULB Grants for 2021-22',
      file: './assets/files/State Nodal Officers Manual for Claiming XV FC ULB Grants Oct 2021.pdf',
    },
    {
      title: 'XV-FC VOL I Main Report 2021-26',
      file: './assets/files/XVFC VOL I Main Report 2021-26.pdf',
    },
    {
      title: 'XV-FC VOL II Annexes',
      file: './assets/files/XV-FC -VOL II Annexes.pdf',
    },
    {
      title: 'MoHUA Marking Scheme',
      file: './assets/files/XV FC Marking Scheme Guidelines.pdf',
    },
    {
      title: 'XV-FC Operational Guidelines 2021-26',
      file: './assets/files/FC-XV recommended Urban Local Body Final Operational Guidelines for 2021-26.pdf',
    },
  ];

  protected get roleControl(): FormControl<LoginRole | ''> {
    return this.loginForm.controls.role;
  }

  protected get otpControl(): FormControl<string> {
    return this.loginForm.controls.otp;
  }

  ngOnInit(): void {
    this.setLoginType();
    this.xvifcService.clearResolvedContext();
    this.enablePasswordMode();
    this.recaptchaService.loadScript();
  }

  setLoginType(): void {
    this.route.queryParams.subscribe(({ type }) => {
      if (LOGIN_TYPES.includes(type)) {
        this.typeKey.set(type);
      }
    });
    this.route.paramMap.subscribe(params => {
      const type = params.get('type') as LoginType;
      if (LOGIN_TYPES.includes(type)) {
        this.typeKey.set(type);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  protected trackByRole(_: number, role: RoleOption): string {
    return role.id;
  }

  protected trackByStat(_: number, stat: StatItem): string {
    return stat.label;
  }

  protected selectRole(role: RoleOption): void {
    if (role.disabled) return;
    this.roleControl.setValue(role.id);
    this.roleControl.markAsTouched();
    this.roleControl.markAsDirty();
  }

  protected isRoleSelected(roleId: LoginRole): boolean {
    return this.roleControl.value === roleId;
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  protected hasControlError(controlName: LoginControlName, errorKey?: string): boolean {
    const control = this.loginForm.controls[controlName];
    if (!(control.touched || this.isSubmitted)) return false;
    return errorKey ? control.hasError(errorKey) : control.invalid;
  }

  onForgotPassword(): void {
    this._router.navigate(['/auth/forgot-password'], {
      queryParams: { type: this.typeKey() },
    });
  }

  onSignup(): void {
    this._router.navigate(['/auth/signup'], {
      queryParams: { type: this.typeKey(), role: 'ULB' },
    });
  }

  protected openReferenceDocuments(): void {
    console.log('Reference documents clicked');
  }

  protected openGuidelines(): void {
    console.log('Guidelines clicked');
  }

  // --- Password login ---

  protected onSubmit(): void {
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { identifier, password } = this.loginForm.getRawValue();

    this.recaptchaService
      .execute('login')
      .pipe(
        switchMap((recaptchaToken) =>
          this.authService.login({
            identifier: identifier.trim(),
            password,
            type: this.typeKey() ?? '15thFC',
            recaptchaToken,
          }),
        ),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (response: any) => {
          const currentUser =
            this.authService.extractUser(response) || this.authService.getCurrentUserSnapshot();
          void this.navigateAfterLogin(currentUser);
        },
        error: (error: any) => {
          this.errorMessage.set(error?.error?.message || 'Invalid credentials. Please try again.');
        },
      });
  }

  // --- OTP login ---

  protected startOtpFlow(): void {
    const identifier = this.loginForm.controls.identifier.value.trim();

    if (!identifier) {
      this.loginForm.controls.identifier.markAsTouched();
      this.errorMessage.set('Please enter your Email or Census Code first.');
      return;
    }

    if (this.otpCountdownActive()) return;

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.authService
      .otpSignIn({ identifier })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res: any) => {
          this.otpCreds = res;
          this.enableOtpMode();
          this.isOtpLogin.set(true);
          this.startCountdown();
        },
        error: (error: any) => {
          this.errorMessage.set(error?.error?.message || 'Failed to send OTP. Please try again.');
        },
      });
  }

  protected submitOtp(): void {
    if (this.otpControl.invalid) {
      this.otpControl.markAsTouched();
      return;
    }

    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload = { identifier: this.loginForm.controls.identifier.value.trim(), otp: this.otpControl.value };

    this.authService
      .otpVerify(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response: any) => {
          const currentUser =
            this.authService.extractUser(response) || this.authService.getCurrentUserSnapshot();
          void this.navigateAfterLogin(currentUser);
        },
        error: (error: any) => {
          this.errorMessage.set(error?.error?.message || 'Invalid OTP. Please try again.');
        },
      });
  }

  protected switchToPassword(): void {
    this.isOtpLogin.set(false);
    this.clearCountdown();
    this.enablePasswordMode();
    this.errorMessage.set('');
  }

  // --- Helpers ---

  private enablePasswordMode(): void {
    this.loginForm.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.loginForm.controls.otp.clearValidators();
    this.loginForm.controls.otp.setValue('', { emitEvent: false });
    this.loginForm.controls.password.updateValueAndValidity();
    this.loginForm.controls.otp.updateValueAndValidity();
  }

  private enableOtpMode(): void {
    this.loginForm.controls.password.clearValidators();
    this.loginForm.controls.otp.setValidators(OTP_VALIDATORS);
    this.loginForm.controls.password.updateValueAndValidity();
    this.loginForm.controls.otp.updateValueAndValidity();
  }

  private startCountdown(): void {
    this.clearCountdown();
    this.otpCountdown.set(60);
    this.otpCountdownActive.set(true);
    this.countdownSub = timer(1000, 1000).subscribe(() => {
      const next = this.otpCountdown() - 1;
      this.otpCountdown.set(next);
      if (next <= 0) this.clearCountdown();
    });
  }

  private clearCountdown(): void {
    this.countdownSub?.unsubscribe();
    this.countdownSub = null;
    this.otpCountdownActive.set(false);
    this.otpCountdown.set(0);
  }

  private async navigateAfterLogin(currentUser: IUserLoggedInDetails | null): Promise<void> {
    const postLoginNavigation =
      sessionStorage.getItem('postLoginNavigationV2') ?? sessionStorage.getItem('postLoginNavigation');
    if (postLoginNavigation) {
      sessionStorage.removeItem('postLoginNavigationV2');
      sessionStorage.removeItem('postLoginNavigation');
      await this._router.navigateByUrl(postLoginNavigation);
      return;
    }
    for (const route of this.routePages) {
      // console.log('Checking route', route, this.typeKey(), currentUser?.role);
      if (route.type === this.typeKey() && route.roles.includes(currentUser?.role as USER_TYPE)) {
        if (route.link) {
          // console.log('Navigating to link', route.link);
          window.location.href = environment.ui.urlV1 + route.link;
          // window.location.href = 'http://localhost:4200' + route.link;
        } else if (route.route) {
          await this._router.navigate([route.route]);
        }
        return;
      }
    }
    if (this.typeKey() === 'XVIFC') {
      if (currentUser?.role === USER_TYPE.ULB) {
        this._router.navigate(['/xvifc/year']);
        return;
      }

      if (
        [USER_TYPE.XVIFC, USER_TYPE.XVIFC_STATE, USER_TYPE.STATE, USER_TYPE.MoHUA].includes(
          currentUser?.role as USER_TYPE,
        )
      ) {
        await this._router.navigate(['/admin']);
        return;
      }

      await this._router.navigate(['/xvifc/year']);
    }
  }
  // routeToProperLocation(user: IUserLoggedInDetails) {
  //   if (this.loginType === 'XVIFC') {
  //     if ([USER_TYPE.XVIFC_STATE, USER_TYPE.XVIFC].includes(user.role)) {
  //       window.location.href = window.location.origin + '/fc/admin/xvi-fc-review';
  //       // window.location.href = 'http://localhost:4300/admin/xvi-fc-review';
  //     } else if (user.role === USER_TYPE.ULB) {
  //       window.location.href = window.location.origin + '/fc/xvifc-form';
  //       // window.location.href = 'http://localhost:4300/xvifc-form';
  //     }
  //   } else if (this.loginType === 'state-dashboard') {
  //     this.router.navigate(['/state-dashboard']);
  //   } else {
  //     const rawPostLoginRoute =
  //       sessionStorage.getItem("postLoginNavigation") || "home";
  //     const formattedUrl = this.formatURL(rawPostLoginRoute);

  //     if (typeof formattedUrl === "string") {
  //       this.router.navigate([formattedUrl]);
  //     } else {
  //       this.router.navigate([formattedUrl.url], {
  //         queryParams: { ...formattedUrl.queryParams },
  //       });
  //     }
  //   }
  // }

}
