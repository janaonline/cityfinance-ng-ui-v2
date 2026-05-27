import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
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
import { OtpAuthService } from '../../core/auth/auth.service';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';
import { XvifcModuleService } from '../../features/xvi-fc-module/xvi-fc-module.service';
import { environment } from '../../../environments/environment';
import { IRoutePages, ROUTE_PAGES } from '../../core/constants/login-menu.constant';

type LoginRole = 'ULB' | 'STATE' | 'MOHUA' | 'DOE' | 'PARTNER';
type RoleIcon = 'ulb' | 'state' | 'mohua' | 'doe' | 'institutional';
type LoginControlName = 'role' | 'identifier' | 'password' | 'otp' | 'newPassword' | 'confirmPassword';
type Fc16Step = 'identifier' | 'password' | 'otp-send' | 'otp-verify' | 'set-password';

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

export const LOGIN_TYPES = ['16thFC', '15thFC', 'XVIFC', 'ranking', 'state-dashboard'] as const;

export type LoginType = (typeof LOGIN_TYPES)[number];

type LoginFormModel = {
  role: FormControl<LoginRole | ''>;
  identifier: FormControl<string>;
  password: FormControl<string>;
  otp: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
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

function mobileOrCensusCode(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) return null;
  if (/^[6-9]\d{9}$/.test(value)) return null;
  if (/^\d{2,}$/.test(value)) return null;
  return { invalidInput: true };
}

function mobileEmailOrCensusCode(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) return null;
  if (/^[6-9]\d{9}$/.test(value)) return null;
  if (/^\d{2,}$/.test(value)) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return { invalidInput: true };
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
  private readonly otpAuthService = inject(OtpAuthService);
  private readonly recaptchaService = inject(RecaptchaService);

  typeKey = signal<LoginType | null>('15thFC');
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isOtpLogin = signal(false);
  protected readonly supportEmail = computed(() =>
    this.typeKey() === '15thFC' ? '15fcgrant@cityfinance.in' : '16fcgrant@cityfinance.in',
  );
  protected readonly brandName = 'CITY FINANCE';
  protected readonly otpLength = OTP_LENGTH;

  protected isSubmitted = false;
  protected isPasswordVisible = false;
  protected otpCreds: any = {};

  protected readonly otpCountdown = signal(0);
  protected readonly otpCountdownActive = signal(false);
  private countdownSub: Subscription | null = null;

  // 16th FC flow signals
  protected readonly identifierType16 = signal<'mobile' | 'censusCode' | 'email' | null>(null);
  protected readonly isIdentifierValid16 = signal(false);
  protected readonly isLeftPanelAnimating = signal(false);

  // 16th FC multi-step state machine
  protected readonly fc16Step = signal<Fc16Step>('identifier');
  protected readonly fc16CheckingUser = signal(false);
  protected readonly fc16OtpSending = signal(false);
  protected readonly fc16OtpVerifying = signal(false);
  protected readonly fc16PasswordSetting = signal(false);
  protected readonly fc16MaskedContact = signal('');
  protected readonly fc16PasswordError = signal('');
  protected readonly fc16OtpCountdown = signal(0);
  protected readonly fc16OtpCountdownActive = signal(false);
  protected isNewPasswordVisible = false;
  protected isConfirmPasswordVisible = false;
  private fc16CountdownSub: Subscription | null = null;
  private fc16VerifiedOtp = '';

  protected readonly stats: readonly StatItem[] = [
    { label: 'Eligible Urban Local Bodies', value: '4,485' },
    { label: 'Special Grant Categories', value: '2' },
    { label: 'Total Grants Allocated', value: '₹1,29,987 Cr' },
    { label: 'Year 1 Disbursement', value: '₹37,272 Cr' },
  ];

  protected readonly roleOptions = computed<readonly RoleOption[]>(() => {
    const is15thFC = this.typeKey() === '15thFC';
    const options: RoleOption[] = [
      { id: 'ULB', label: 'ULB', icon: 'ulb' },
      { id: 'STATE', label: 'State DMA', icon: 'state' },
      { id: 'MOHUA', label: 'MoHUA', icon: 'mohua' },
    ];

    if (is15thFC) {
      options.push({ id: 'PARTNER', label: 'Institutional', icon: 'institutional' });
    }

    options.push(
      is15thFC
        ? { id: 'DOE', label: 'DoE', icon: 'doe' }
        : { id: 'DOE', label: 'DoE', icon: 'doe', disabled: true, badge: 'SOON' },
    );

    return options;
  });

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
    newPassword: new FormControl('', { nonNullable: true }),
    confirmPassword: new FormControl('', { nonNullable: true }),
  });

  routePages: IRoutePages[] = ROUTE_PAGES;

  documents = [
    {
      title: 'ULB Nodal Officers Manual for Claiming XV FC ULB Grants for 2021-22',
      file: 'assets/files/ULB Nodal Officers Manual for Claiming XV FC ULB Grants Oct 2021.pdf',
    },
    {
      title: 'State Nodal Officers Manual for Claiming XV FC ULB Grants for 2021-22',
      file: 'assets/files/State Nodal Officers Manual for Claiming XV FC ULB Grants Oct 2021.pdf',
    },
    {
      title: 'XV-FC VOL I Main Report 2021-26',
      file: 'assets/files/XVFC VOL I Main Report 2021-26.pdf',
    },
    {
      title: 'XV-FC VOL II Annexes',
      file: 'assets/files/XV-FC -VOL II Annexes.pdf',
    },
    {
      title: 'MoHUA Marking Scheme',
      file: 'assets/files/XV FC Marking Scheme Guidelines.pdf',
    },
    {
      title: 'XV-FC Operational Guidelines 2021-26',
      file: 'assets/files/FC-XV recommended Urban Local Body Final Operational Guidelines for 2021-26.pdf',
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
        this.updateValidatorsForType(type);
      }
    });
    this.route.paramMap.subscribe(params => {
      const type = params.get('type') as LoginType;
      if (LOGIN_TYPES.includes(type)) {
        if (type === '15thFC' || type === 'ranking' || type === 'state-dashboard') {
          sessionStorage.removeItem('postLoginNavigationV2');
        } else if (type === '16thFC' || type === 'XVIFC') {
          sessionStorage.removeItem('postLoginNavigation');
        }
        this.typeKey.set(type);
        this.updateValidatorsForType(type);
      }
    });
  }

  ngOnDestroy(): void {
    this.clearCountdown();
    this.clearFc16Countdown();
  }

  private updateValidatorsForType(type: LoginType): void {
    if (this.shouldHideRoleSelection(type)) {
      this.loginForm.controls.role.clearValidators();
    } else {
      this.loginForm.controls.role.setValidators([Validators.required]);
    }
    this.loginForm.controls.role.updateValueAndValidity();

    if (type === '16thFC') {
      this.loginForm.controls.identifier.setValidators([Validators.required, mobileEmailOrCensusCode]);
      this.identifierType16.set(null);
      this.isIdentifierValid16.set(false);
      this.fc16Step.set('identifier');
      this.errorMessage.set('');
    } else {
      this.loginForm.controls.identifier.setValidators([Validators.required, emailOrCensusCode]);
    }
    this.loginForm.controls.identifier.updateValueAndValidity();
  }

  private shouldHideRoleSelection(type: LoginType | null): boolean {
    return type === 'XVIFC' || type === 'state-dashboard';
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

  // ─── 16th FC identifier hint ─────────────────────────────────────────────────

  private detectIdentifierType(value: string): 'mobile' | 'censusCode' | 'email' | null {
    if (!value) return null;
    if (/^[6-9]\d{9}$/.test(value)) return 'mobile';
    if (/^\d{2,}$/.test(value)) return 'censusCode';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
    return null;
  }

  protected onIdentifierInput16thFC(): void {
    const value = this.loginForm.controls.identifier.value.trim();
    const type = this.detectIdentifierType(value);
    this.identifierType16.set(type);
    this.isIdentifierValid16.set(type !== null);
  }

  // ─── Password login ───────────────────────────────────────────────────────────

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
            type: this.typeKey(),
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

  // ─── OTP login ────────────────────────────────────────────────────────────────

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

    const payload = {
      identifier: this.loginForm.controls.identifier.value.trim(),
      otp: this.otpControl.value,
    };

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

  // ─── 16th FC multi-step flow ──────────────────────────────────────────────────

  protected onCheckIdentifier16(): void {
    this.isSubmitted = true;
    const identCtrl = this.loginForm.controls.identifier;
    const roleCtrl = this.roleControl;
    identCtrl.markAsTouched();
    roleCtrl.markAsTouched();
    if (identCtrl.invalid || roleCtrl.invalid) return;

    this.fc16CheckingUser.set(true);
    this.errorMessage.set('');

    const identifier = identCtrl.value.trim();

    this.authService
      .checkUser(identifier, roleCtrl.value as string)
      .pipe(finalize(() => this.fc16CheckingUser.set(false)))
      .subscribe({
        next: (res) => {
          const verified = !!res.isXVIFCProfileVerified;
          const approved = res.status?.toUpperCase() === 'APPROVED';
          const loginFlow = res.loginFlow?.toUpperCase();

          // Email users always go directly to password — no OTP
          if (this.identifierType16() === 'email') {
            this.fc16MaskedContact.set(res.maskedContact ?? '');
            this.enablePasswordMode();
            this.fc16Step.set('password');
            return;
          }

          // Backend signals PASSWORD flow, or user is approved + verified
          if (loginFlow === 'PASSWORD' || (verified && approved)) {
            this.fc16MaskedContact.set(res.maskedContact ?? '');
            this.enablePasswordMode();
            this.fc16Step.set('password');
            return;
          }

          this.fc16MaskedContact.set(res.maskedContact ?? identifier);
          this.fc16Step.set('otp-send');
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message ?? 'User not found. Please check your details.',
          );
        },
      });
  }

  protected onSendOtp16(): void {
    if (this.fc16OtpSending() || this.fc16OtpCountdownActive()) return;
    this.fc16OtpSending.set(true);
    this.errorMessage.set('');

    const identifier = this.loginForm.controls.identifier.value.trim();

    this.otpAuthService
      .sendOtp(identifier, 'login')
      .pipe(finalize(() => this.fc16OtpSending.set(false)))
      .subscribe({
        next: (res) => {
          // Update masked contact with the actual masked mobile returned by the API
          if (res.mobile) this.fc16MaskedContact.set(res.mobile);
          this.loginForm.controls.otp.setValue('');
          this.fc16VerifiedOtp = '';
          this.fc16Step.set('otp-verify');
          this.startFc16Countdown();
        },
        error: (err) => {
          this.errorMessage.set(
            (err as { error?: { message?: string } })?.error?.message ??
              'Failed to send OTP. Please try again.',
          );
        },
      });
  }

  protected resendOtp16(): void {
    if (this.fc16OtpSending() || this.fc16OtpCountdownActive()) return;
    this.fc16OtpSending.set(true);
    this.errorMessage.set('');

    const identifier = this.loginForm.controls.identifier.value.trim();

    this.otpAuthService
      .sendOtp(identifier, 'login')
      .pipe(finalize(() => this.fc16OtpSending.set(false)))
      .subscribe({
        next: (res) => {
          if (res.mobile) this.fc16MaskedContact.set(res.mobile);
          this.startFc16Countdown();
        },
        error: (err) => {
          this.errorMessage.set(
            (err as { error?: { message?: string } })?.error?.message ??
              'Failed to resend OTP. Please try again.',
          );
        },
      });
  }

  protected onVerifyOtp16(): void {
    const otpCtrl = this.loginForm.controls.otp;
    otpCtrl.markAsTouched();
    const otpValue = otpCtrl.value.trim();
    if (!otpValue || otpValue.length < OTP_LENGTH) return;
    if (this.fc16OtpVerifying()) return;

    this.fc16OtpVerifying.set(true);
    this.errorMessage.set('');

    const identifier = this.loginForm.controls.identifier.value.trim();

    this.otpAuthService
      .verifyOtp(identifier, otpValue)
      .pipe(finalize(() => this.fc16OtpVerifying.set(false)))
      .subscribe({
        next: () => {
          this.fc16VerifiedOtp = otpValue;
          localStorage.setItem('isXVIFCProfileVerified', 'true');
          this.clearFc16Countdown();
          this.loginForm.controls.newPassword.setValue('');
          this.loginForm.controls.confirmPassword.setValue('');
          this.fc16PasswordError.set('');
          this.fc16Step.set('set-password');
        },
        error: (err) => {
          this.errorMessage.set(
            (err as { error?: { message?: string } })?.error?.message ??
              'Invalid OTP. Please try again.',
          );
        },
      });
  }

  protected onSetPassword16(): void {
    const newPwd = this.loginForm.controls.newPassword.value;
    const confirmPwd = this.loginForm.controls.confirmPassword.value;

    if (!newPwd || newPwd.length < 6) {
      this.fc16PasswordError.set('Password must be at least 6 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      this.fc16PasswordError.set('Passwords do not match.');
      return;
    }

    this.fc16PasswordSetting.set(true);
    this.fc16PasswordError.set('');
    this.errorMessage.set('');

    const identifier = this.loginForm.controls.identifier.value.trim();

    this.authService
      .setPassword(identifier, newPwd, confirmPwd)
      .pipe(finalize(() => this.fc16PasswordSetting.set(false)))
      .subscribe({
        next: () => {
          const currentUser = this.authService.getCurrentUserSnapshot();
          void this.navigateAfterLogin(currentUser);
        },
        error: (err) => {
          this.errorMessage.set(
            (err as { error?: { message?: string } })?.error?.message ??
              'Failed to set password. Please try again.',
          );
        },
      });
  }

  protected onBackToIdentifier16(): void {
    this.fc16Step.set('identifier');
    this.errorMessage.set('');
    this.isSubmitted = false;
    this.loginForm.controls.otp.setValue('');
    this.loginForm.controls.newPassword.setValue('');
    this.loginForm.controls.confirmPassword.setValue('');
    this.fc16PasswordError.set('');
    this.fc16VerifiedOtp = '';
    this.clearFc16Countdown();
  }

  protected onBackToOtpSend16(): void {
    this.fc16Step.set('otp-send');
    this.errorMessage.set('');
    this.loginForm.controls.otp.setValue('');
    this.clearFc16Countdown();
  }

  protected toggleNewPasswordVisibility(): void {
    this.isNewPasswordVisible = !this.isNewPasswordVisible;
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  private startFc16Countdown(): void {
    this.clearFc16Countdown();
    this.fc16OtpCountdown.set(60);
    this.fc16OtpCountdownActive.set(true);
    this.fc16CountdownSub = timer(1000, 1000).subscribe(() => {
      const next = this.fc16OtpCountdown() - 1;
      this.fc16OtpCountdown.set(next);
      if (next <= 0) this.clearFc16Countdown();
    });
  }

  private clearFc16Countdown(): void {
    this.fc16CountdownSub?.unsubscribe();
    this.fc16CountdownSub = null;
    this.fc16OtpCountdownActive.set(false);
    this.fc16OtpCountdown.set(0);
  }

  private async navigateAfterLogin(currentUser: IUserLoggedInDetails | null): Promise<void> {
    if (this.typeKey() === '16thFC') {
      sessionStorage.removeItem('postLoginNavigationV2');
      sessionStorage.removeItem('postLoginNavigation');
      await this._router.navigate(['/xvifc/year'], { replaceUrl: true });
      return;
    }

    const postLoginNavigation =
      sessionStorage.getItem('postLoginNavigationV2') ?? sessionStorage.getItem('postLoginNavigation');
    if (postLoginNavigation) {
      sessionStorage.removeItem('postLoginNavigationV2');
      sessionStorage.removeItem('postLoginNavigation');
      await this._router.navigateByUrl(postLoginNavigation, { replaceUrl: true });
      return;
    }
    for (const route of this.routePages) {
      if (route.type === this.typeKey() && (route.roles?.includes(currentUser?.role as USER_TYPE) || !route.roles)) {
        if (route.link) {
          window.location.href = environment.ui.urlV1 + route.link;
        } else if (route.route) {
          await this._router.navigate([route.route], { replaceUrl: true });
        }
        return;
      }
    }
  }
}
