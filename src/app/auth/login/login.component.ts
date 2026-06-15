import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { Subscription, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';
import { XvifcModuleService } from '../../features/xvi-fc-module/xvi-fc-module.service';
import { LoginService, OtpCredentials } from './login.service';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoginRole = 'ULB' | 'STATE' | 'MOHUA' | 'DOE' | 'PARTNER';
type RoleIcon = 'ulb' | 'state' | 'mohua' | 'doe' | 'institutional';
type LoginControlName = 'role' | 'identifier' | 'password' | 'otp' | 'newPassword' | 'confirmPassword';
type Fc16Step = 'identifier' | 'password' | 'otp-send' | 'otp-verify' | 'set-password';

export const LOGIN_TYPES = ['16thFC', '15thFC', 'XVIFC', 'ranking', 'state-dashboard'] as const;
export type LoginType = (typeof LOGIN_TYPES)[number];

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface RoleOption {
  id: LoginRole;
  label: string;
  icon: RoleIcon;
  biIcon: string;
  disabled?: boolean;
  badge?: string;
}

interface PanelDescription {
  html: SafeHtml;
  secondary?: boolean;
}

interface PanelContent {
  titleLine1: string;
  titleLine2: string;
  descriptions: PanelDescription[];
  showStats: boolean;
  showDocuments: boolean;
  showResourceActions: boolean;
}

interface LoginPanelData {
  subtitle: string;
  showRoleGrid: boolean;
}

type LoginFormModel = {
  role: FormControl<LoginRole | ''>;
  identifier: FormControl<string>;
  password: FormControl<string>;
  otp: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_LENGTH = 4;
const OTP_VALIDATORS = [
  Validators.required,
  Validators.minLength(OTP_LENGTH),
  Validators.maxLength(OTP_LENGTH),
  Validators.pattern(new RegExp(`^\\d{${OTP_LENGTH}}$`)),
];

// ─── Validators ───────────────────────────────────────────────────────────────

function emailOrCensusCode(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  if (/^\d+$/.test(value)) return null;
  return { invalidIdentifier: true };
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
    DynamicFormComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LoginService],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly loginService = inject(LoginService);
  private readonly xvifcService = inject(XvifcModuleService);

  // ─── Public signals ───────────────────────────────────────────────────────────

  readonly typeKey = signal<LoginType | null>('15thFC');

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isOtpLogin = signal(false);

  protected readonly supportEmail = computed(() =>
    this.typeKey() === '15thFC' ? '15fcgrant@cityfinance.in' : '16fcgrant@cityfinance.in',
  );

  // ─── OTP countdown (non-16thFC) ───────────────────────────────────────────────

  protected readonly otpCountdown = signal(0);
  protected readonly otpCountdownActive = signal(false);
  private countdownSub: Subscription | null = null;

  // ─── 16th FC wizard ───────────────────────────────────────────────────────────

  protected readonly fc16Step = signal<Fc16Step>('identifier');
  protected readonly fc16CheckingUser = signal(false);
  protected readonly fc16OtpSending = signal(false);
  protected readonly fc16OtpVerifying = signal(false);
  protected readonly fc16PasswordSetting = signal(false);
  protected readonly fc16MaskedContact = signal('');
  protected readonly fc16PasswordError = signal('');
  protected readonly fc16OtpCountdown = signal(0);
  protected readonly fc16OtpCountdownActive = signal(false);
  protected readonly identifierType16 = signal<'mobile' | 'censusCode' | 'email' | null>(null);
  private fc16CountdownSub: Subscription | null = null;

  // ─── Non-signal view state ────────────────────────────────────────────────────

  protected isPasswordVisible = false;
  protected isNewPasswordVisible = false;
  protected isConfirmPasswordVisible = false;
  protected isSubmitted = false;
  protected otpCreds: OtpCredentials = {};

  // ─── Static data ─────────────────────────────────────────────────────────────

  protected readonly otpLength = OTP_LENGTH;

  protected readonly stats = [
    { label: 'Eligible Urban Local Bodies', value: '4,485', icon: 'bi-buildings-fill' },
    { label: 'Special Grant Categories', value: '2', icon: 'bi-tags-fill' },
    { label: 'Total Grants Allocated', value: '₹1,29,987 Cr', icon: 'bi-cash-stack' },
    { label: 'Year 1 Disbursement', value: '₹37,272 Cr', icon: 'bi-send-fill' },
  ] as const;

  protected readonly documents = [
    {
      title: 'ULB Nodal Officers Manual for Claiming XV FC ULB Grants for 2021-22',
      file: 'assets/files/ULB Nodal Officers Manual for Claiming XV FC ULB Grants Oct 2021.pdf',
    },
    {
      title: 'State Nodal Officers Manual for Claiming XV FC ULB Grants for 2021-22',
      file: 'assets/files/State Nodal Officers Manual for Claiming XV FC ULB Grants Oct 2021.pdf',
    },
    { title: 'XV-FC VOL I Main Report 2021-26', file: 'assets/files/XVFC VOL I Main Report 2021-26.pdf' },
    { title: 'XV-FC VOL II Annexes', file: 'assets/files/XV-FC -VOL II Annexes.pdf' },
    { title: 'MoHUA Marking Scheme', file: 'assets/files/XV FC Marking Scheme Guidelines.pdf' },
    {
      title: 'XV-FC Operational Guidelines 2021-26',
      file: 'assets/files/FC-XV recommended Urban Local Body Final Operational Guidelines for 2021-26.pdf',
    },
  ] as const;

  // ─── Form ─────────────────────────────────────────────────────────────────────

  protected readonly loginForm = new FormGroup<LoginFormModel>({
    role: new FormControl<LoginRole | ''>('', { nonNullable: true, validators: [Validators.required] }),
    identifier: new FormControl('', { nonNullable: true, validators: [Validators.required, emailOrCensusCode] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    otp: new FormControl('', { nonNullable: true }),
    newPassword: new FormControl('', { nonNullable: true }),
    confirmPassword: new FormControl('', { nonNullable: true }),
  });

  // ─── Dynamic field configs (used with DynamicFormComponent) ───────────────────

  protected readonly identifierFieldConfig: FieldConfig = {
    key: 'identifier',
    label: 'Email / Census Code',
    formFieldType: 'text',
    placeholder: 'Enter your email or census code',
    validations: [
      { name: 'required', validator: Validators.required, message: 'Email or Census Code is required.' },
      {
        name: 'invalidIdentifier',
        validator: emailOrCensusCode,
        message: 'Enter a valid email address or numeric census code.',
      },
    ],
  };

  protected readonly otpFieldConfig: FieldConfig = {
    key: 'otp',
    label: 'One-Time Password',
    formFieldType: 'text',
    placeholder: `Enter ${OTP_LENGTH}-digit OTP`,
    validations: [
      { name: 'required', validator: Validators.required, message: 'OTP is required.' },
      { name: 'minlength', validator: null!, message: `OTP must be ${OTP_LENGTH} digits.` },
      { name: 'pattern', validator: null!, message: `Enter a valid ${OTP_LENGTH}-digit numeric OTP.` },
    ],
  };

  // ─── Computed signals ─────────────────────────────────────────────────────────

  protected readonly roleOptions = computed<readonly RoleOption[]>(() => {
    const type = this.typeKey();
    const is15thFC = type === '15thFC';
    const is16thFC = type === '16thFC';

    const options: RoleOption[] = [
      { id: 'ULB', label: 'ULB', icon: 'ulb', biIcon: 'bi-buildings-fill' },
      { id: 'STATE', label: 'State DMA', icon: 'state', biIcon: 'bi-bank' },
      { id: 'MOHUA', label: 'MoHUA', icon: 'mohua', biIcon: 'bi-bullseye' },
    ];

    if (is15thFC || is16thFC) {
      options.push({ id: 'PARTNER', label: 'Institutional', icon: 'institutional', biIcon: 'bi-building-check' });
    }

    options.push(
      is15thFC
        ? { id: 'DOE', label: 'DoE', icon: 'doe', biIcon: 'bi-shield-lock' }
        : { id: 'DOE', label: 'DoE', icon: 'doe', biIcon: 'bi-shield-lock', disabled: true, badge: 'SOON' },
    );

    return options;
  });

  protected readonly panelContent = computed<PanelContent>(() => {
    const trust = (html: string): SafeHtml => this.sanitizer.bypassSecurityTrustHtml(html);
    const cfLink = `<a href="http://cityfinance.in/" target="_blank" rel="noopener">cityfinance.in</a>`;

    switch (this.typeKey()) {
      case '16thFC':
        return {
          titleLine1: '16th Finance Commission',
          titleLine2: 'Grant Management System',
          descriptions: [
            {
              html: trust(
                `${cfLink} is the official grant management system for the Sixteenth Finance Commission (XVI-FC) grants to Urban Local Bodies in India. Under MoHUA oversight, the platform handles ₹3,56,357 crore in grants for fiscal years 2026–2031.`,
              ),
            },
            {
              html: trust(
                `The platform facilitates smooth communication and data exchange between ULBs, State Urban Development Departments (UDDs), and MoHUA, ensuring efficiency and transparency.`,
              ),
              secondary: true,
            },
          ],
          showStats: true,
          showDocuments: false,
          showResourceActions: true,
        };

      case 'ranking':
        return {
          titleLine1: 'City Finance',
          titleLine2: 'Rankings 2022',
          descriptions: [
            { html: trust('Rankings 2022 is now closed. New submissions are no longer accepted.') },
            {
              html: trust(
                'The City Finance Rankings evaluated all 4,500+ Urban Local Bodies on resource mobilisation, expenditure performance, and fiscal governance.',
              ),
              secondary: true,
            },
          ],
          showStats: false,
          showDocuments: false,
          showResourceActions: false,
        };

      case 'XVIFC':
        return {
          titleLine1: 'XVI-FC',
          titleLine2: 'Data Collection Portal',
          descriptions: [
            {
              html: trust(
                "This portal collected standardised financial data from Urban Local Bodies as part of the Sixteenth Finance Commission's report submission process.",
              ),
            },
            {
              html: trust(`The next phase will go live on ${cfLink} in June 2026.`),
              secondary: true,
            },
          ],
          showStats: false,
          showDocuments: false,
          showResourceActions: false,
        };

      case 'state-dashboard':
        return {
          titleLine1: 'State',
          titleLine2: 'Dashboard',
          descriptions: [
            {
              html: trust(
                'This dashboard presents revenue and expenditure data for Urban Local Bodies from FY 2019-20 to FY 2022-23.',
              ),
            },
            {
              html: trust(
                'Access is available to State Urban Development Departments and State DMA officers.',
              ),
              secondary: true,
            },
          ],
          showStats: false,
          showDocuments: false,
          showResourceActions: false,
        };

      default:
        return {
          titleLine1: '15th Finance Commission',
          titleLine2: 'Grant Management System',
          descriptions: [
            {
              html: trust(
                `Welcome to ${cfLink}, the official grant management system for XV FC grants to Urban Local Bodies in India. The platform handles ₹1,08,916 Crore for fiscal years 2021–2026.`,
              ),
            },
            {
              html: trust(
                `${cfLink} facilitates smooth communication and data exchange among ULBs, State Urban Development Departments (UDDs), and MoHUA.`,
              ),
              secondary: true,
            },
          ],
          showStats: false,
          showDocuments: true,
          showResourceActions: false,
        };
    }
  });

  protected readonly loginPanel = computed<LoginPanelData>(() => {
    const type = this.typeKey();
    if (type === '16thFC') {
      const subtitles: Record<Fc16Step, string> = {
        identifier: 'Select your role, then enter your credentials',
        password: 'Enter your password to continue',
        'otp-send': 'Verify your account to activate access',
        'otp-verify': 'Enter the OTP sent to your registered number',
        'set-password': 'Set a password to activate your account',
      };
      return { subtitle: subtitles[this.fc16Step()], showRoleGrid: true };
    }
    const hideRoles = type === 'XVIFC' || type === 'state-dashboard';
    return {
      subtitle: hideRoles ? '' : 'Select your role to continue',
      showRoleGrid: !hideRoles,
    };
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.setLoginType();
    this.xvifcService.clearResolvedContext();
    this.enablePasswordMode();
    this.loginService.loadRecaptchaScript();
  }

  ngOnDestroy(): void {
    this.clearCountdown();
    this.clearFc16Countdown();
  }

  // ─── Route type detection ─────────────────────────────────────────────────────

  setLoginType(): void {
    this.route.queryParams.subscribe(({ type }) => {
      if (LOGIN_TYPES.includes(type)) {
        this.typeKey.set(type);
        this.updateValidatorsForType(type);
      }
    });

    this.route.paramMap.subscribe((params) => {
      const type = params.get('type') as LoginType;
      if (!LOGIN_TYPES.includes(type)) return;

      if (type === '15thFC' || type === 'ranking' || type === 'state-dashboard') {
        sessionStorage.removeItem('postLoginNavigationV2');
      } else if (type === '16thFC' || type === 'XVIFC') {
        sessionStorage.removeItem('postLoginNavigation');
      }

      this.typeKey.set(type);
      this.updateValidatorsForType(type);
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  protected trackByRole(_: number, role: RoleOption): string {
    return role.id;
  }

  protected selectRole(role: RoleOption): void {
    if (role.disabled) return;
    this.loginForm.controls.role.setValue(role.id);
    this.loginForm.controls.role.markAsTouched();
    this.loginForm.controls.role.markAsDirty();
  }

  protected isRoleSelected(roleId: LoginRole): boolean {
    return this.loginForm.controls.role.value === roleId;
  }

  protected hasControlError(name: LoginControlName, errorKey?: string): boolean {
    const ctrl = this.loginForm.controls[name];
    if (!(ctrl.touched || this.isSubmitted)) return false;
    return errorKey ? ctrl.hasError(errorKey) : ctrl.invalid;
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  protected toggleNewPasswordVisibility(): void {
    this.isNewPasswordVisible = !this.isNewPasswordVisible;
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  protected onForgotPassword(): void {
    void this.router.navigate(['/auth/forgot-password'], { queryParams: { type: this.typeKey() } });
  }

  protected onSignup(): void {
    void this.router.navigate(['/auth/signup'], { queryParams: { type: this.typeKey(), role: 'ULB' } });
  }

  protected openReferenceDocuments(): void {
    window.open(
      'https://www.cityfinance.in/api/v1/resourceDashboard/download/698472008670dfe40327596d',
      '_blank',
      'noopener,noreferrer',
    );
  }

  // ─── 16thFC identifier type detection ────────────────────────────────────────

  protected onIdentifierInput16(): void {
    const value = this.loginForm.controls.identifier.value.trim();
    this.identifierType16.set(this.loginService.detectIdentifierType(value));
  }

  // ─── Password login ───────────────────────────────────────────────────────────

  protected onSubmit(): void {
    this.isSubmitted = true;
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { identifier, password } = this.loginForm.getRawValue();

    this.loginService
      .signInWithPassword(identifier.trim(), password, this.typeKey())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          const user = this.loginService.extractUser(res) ?? this.loginService.getCurrentUser();
          void this.loginService.navigateAfterLogin(user, this.typeKey());
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(err?.error?.message ?? 'Invalid credentials. Please try again.');
        },
      });
  }

  // ─── Non-16thFC OTP login ─────────────────────────────────────────────────────

  protected startOtpFlow(): void {
    const identifier = this.loginForm.controls.identifier.value.trim();
    if (!identifier) {
      this.loginForm.controls.identifier.markAsTouched();
      this.errorMessage.set('Please enter your Email or Census Code first.');
      return;
    }
    if (this.otpCountdownActive()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.loginService
      .requestOtp(identifier)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          this.otpCreds = res;
          this.enableOtpMode();
          this.isOtpLogin.set(true);
          this.startCountdown();
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(err?.error?.message ?? 'Failed to send OTP. Please try again.');
        },
      });
  }

  protected submitOtp(): void {
    if (this.loginForm.controls.otp.invalid) {
      this.loginForm.controls.otp.markAsTouched();
      return;
    }
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.loginService
      .verifyOtp(
        this.loginForm.controls.identifier.value.trim(),
        this.loginForm.controls.otp.value,
      )
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          const user = this.loginService.extractUser(res) ?? this.loginService.getCurrentUser();
          void this.loginService.navigateAfterLogin(user, this.typeKey());
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(err?.error?.message ?? 'Invalid OTP. Please try again.');
        },
      });
  }

  protected switchToPassword(): void {
    this.isOtpLogin.set(false);
    this.clearCountdown();
    this.enablePasswordMode();
    this.errorMessage.set('');
  }

  // ─── 16th FC multi-step wizard ────────────────────────────────────────────────

  protected onCheckIdentifier16(): void {
    this.isSubmitted = true;
    const identCtrl = this.loginForm.controls.identifier;
    const roleCtrl = this.loginForm.controls.role;
    identCtrl.markAsTouched();
    roleCtrl.markAsTouched();
    if (identCtrl.invalid || roleCtrl.invalid) return;

    this.fc16CheckingUser.set(true);
    this.errorMessage.set('');

    this.loginService
      .check16FCIdentifier(identCtrl.value.trim(), roleCtrl.value as string)
      .pipe(finalize(() => this.fc16CheckingUser.set(false)))
      .subscribe({
        next: (res) => {
          const identType = this.identifierType16();
          const verified = !!res.isXVIFCProfileVerified;
          const isPending = res.status?.toUpperCase() === 'PENDING';

          if (identType === 'censusCode' || identType === 'email') {
            this.fc16MaskedContact.set(res.maskedContact ?? '');
            this.enablePasswordMode();
            this.fc16Step.set('password');
            return;
          }

          if (identType === 'mobile' && isPending && !verified) {
            this.fc16MaskedContact.set(res.maskedContact ?? identCtrl.value.trim());
            this.fc16Step.set('otp-send');
            return;
          }

          this.fc16MaskedContact.set(res.maskedContact ?? '');
          this.enablePasswordMode();
          this.fc16Step.set('password');
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(err?.error?.message ?? 'User not found. Please check your details.');
        },
      });
  }

  /** Sends or resends the 16th FC SMS OTP. Pass `moveToVerify=true` for the first send. */
  protected triggerSendOtp16(moveToVerify: boolean): void {
    if (this.fc16OtpSending() || this.fc16OtpCountdownActive()) return;

    this.fc16OtpSending.set(true);
    this.errorMessage.set('');

    this.loginService
      .send16FCOtp(this.loginForm.controls.identifier.value.trim())
      .pipe(finalize(() => this.fc16OtpSending.set(false)))
      .subscribe({
        next: (res) => {
          if (res.mobile) this.fc16MaskedContact.set(res.mobile);
          if (moveToVerify) {
            this.loginForm.controls.otp.setValue('');
            this.fc16Step.set('otp-verify');
          }
          this.startFc16Countdown();
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(
            err?.error?.message ??
              (moveToVerify ? 'Failed to send OTP. Please try again.' : 'Failed to resend OTP. Please try again.'),
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

    this.loginService
      .verify16FCOtp(this.loginForm.controls.identifier.value.trim(), otpValue)
      .pipe(finalize(() => this.fc16OtpVerifying.set(false)))
      .subscribe({
        next: () => {
          localStorage.setItem('isXVIFCProfileVerified', 'true');
          this.clearFc16Countdown();
          this.loginForm.controls.newPassword.setValue('');
          this.loginForm.controls.confirmPassword.setValue('');
          this.fc16PasswordError.set('');
          this.fc16Step.set('set-password');
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(err?.error?.message ?? 'Invalid OTP. Please try again.');
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

    this.loginService
      .setPassword(this.loginForm.controls.identifier.value.trim(), newPwd, confirmPwd)
      .pipe(finalize(() => this.fc16PasswordSetting.set(false)))
      .subscribe({
        next: () => void this.loginService.navigateAfterLogin(this.loginService.getCurrentUser(), this.typeKey()),
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(err?.error?.message ?? 'Failed to set password. Please try again.');
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
    this.clearFc16Countdown();
  }

  protected onBackToOtpSend16(): void {
    this.fc16Step.set('otp-send');
    this.errorMessage.set('');
    this.loginForm.controls.otp.setValue('');
    this.clearFc16Countdown();
  }

  // ─── Private: validator switching ────────────────────────────────────────────

  private updateValidatorsForType(type: LoginType): void {
    const roleCtrl = this.loginForm.controls.role;
    const identCtrl = this.loginForm.controls.identifier;
    const hideRoles = type === 'XVIFC' || type === 'state-dashboard';

    if (hideRoles) {
      roleCtrl.clearValidators();
    } else {
      roleCtrl.setValidators([Validators.required]);
    }
    roleCtrl.updateValueAndValidity();

    if (type === '16thFC') {
      identCtrl.setValidators([Validators.required, mobileEmailOrCensusCode]);
      this.identifierType16.set(null);
      this.fc16Step.set('identifier');
      this.errorMessage.set('');
    } else {
      identCtrl.setValidators([Validators.required, emailOrCensusCode]);
    }
    identCtrl.updateValueAndValidity();
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

  // ─── Private: OTP countdown ───────────────────────────────────────────────────

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

}
