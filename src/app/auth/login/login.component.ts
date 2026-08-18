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
import {
  IDENTIFIER_SECURITY_VALIDATORS,
  PASSWORD_SECURITY_VALIDATORS,
  noEmailFormat,
} from '../validators/auth-security.validators';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs/operators';
import { XvifcModuleService } from '../../features/xvi-fc-module/xvi-fc-module.service';
import { LoginService } from './login.service';
import { environment } from '../../../environments/environment';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoginRole = 'ULB' | 'STATE' | 'MOHUA' | 'DOE' | 'PARTNER';
type RoleIcon = 'ulb' | 'state' | 'mohua' | 'doe' | 'institutional';
type LoginControlName = 'role' | 'identifier' | 'password';
type LoginStep = 'role' | 'credentials';

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

// ─── Local validator ──────────────────────────────────────────────────────────

function emailOrCensusCode(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  if (/^\d+$/.test(value)) return null;
  return { invalidIdentifier: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
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

  // ─── Signals ─────────────────────────────────────────────────────────────────

  readonly typeKey = signal<LoginType | null>('15thFC');
  protected readonly step = signal<LoginStep>('role');
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly supportEmail = computed(() =>
    this.typeKey() === '15thFC' ? '15fcgrant@cityfinance.in' : '16fcgrant@cityfinance.in',
  );

  protected readonly captchaEnabled = environment.captchaEnabled;

  // ─── View state ──────────────────────────────────────────────────────────────

  protected isPasswordVisible = false;
  protected isSubmitted = false;

  // ─── Static data ─────────────────────────────────────────────────────────────

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

  protected readonly loginForm = new FormGroup({
    role: new FormControl<LoginRole | ''>('', { nonNullable: true, validators: [Validators.required] }),
    identifier: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(254),
        emailOrCensusCode,
        ...IDENTIFIER_SECURITY_VALIDATORS,
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(128),
        ...PASSWORD_SECURITY_VALIDATORS,
      ],
    }),
  });

  // ─── Computed ─────────────────────────────────────────────────────────────────

  protected readonly selectedRole = signal<RoleOption | null>(null);
  protected readonly slideDirection = signal<'forward' | 'back' | 'none'>('none');

  protected readonly isMultiStep = computed(() => {
    const type = this.typeKey();
    return type === '16thFC' || type === '15thFC';
  });

  protected readonly showRoleStep = computed(() => this.isMultiStep() && this.step() === 'role');

  protected readonly loginSubtitle = computed(() => {
    if (this.showRoleStep()) return 'Select your role to continue';
    if (this.isMultiStep()) return 'Enter your credentials';
    return '';
  });

  protected readonly identifierLabel = computed(() => {
    const role = this.selectedRole();
    if (!role) return 'Email / Census Code';
    return role.id === 'ULB' ? 'Census Code' : 'Email';
  });

  protected readonly identifierPlaceholder = computed(() => {
    const role = this.selectedRole();
    if (!role) return 'Enter your email or census code';
    return role.id === 'ULB' ? 'Enter your census code' : 'Enter your email address';
  });

  protected readonly identifierType = computed(() => {
    const role = this.selectedRole();
    if (!role || role.id === 'ULB') return 'text';
    return 'email';
  });

  protected readonly identifierInputMode = computed<string | null>(() => {
    const role = this.selectedRole();
    if (!role) return null;
    return role.id === 'ULB' ? 'numeric' : 'email';
  });

  protected readonly identifierAutocomplete = computed(() => {
    const role = this.selectedRole();
    if (!role) return 'username';
    return role.id === 'ULB' ? 'off' : 'email';
  });

  protected readonly identifierRequiredMessage = computed(() => {
    const role = this.selectedRole();
    if (!role) return 'Email or Census Code is required.';
    return role.id === 'ULB' ? 'Census Code is required.' : 'Email is required.';
  });

  protected readonly roleOptions = computed<readonly RoleOption[]>(() => {
    const type = this.typeKey();
    const is15thFC = type === '15thFC';
    const is16thFC = type === '16thFC';

    const options: RoleOption[] = [
      { id: 'ULB', label: 'ULB', icon: 'ulb', biIcon: 'bi-buildings-fill' },
      { id: 'STATE', label: 'STATE', icon: 'state', biIcon: 'bi-bank' },
      { id: 'MOHUA', label: 'MOHUA', icon: 'mohua', biIcon: 'bi-bullseye' },
    ];

    if (is15thFC || is16thFC) {
      options.push({ id: 'PARTNER', label: 'Institutional', icon: 'institutional', biIcon: 'bi-building-check' });
    }

    options.push(
      is15thFC
        ? { id: 'DOE', label: 'DOE', icon: 'doe', biIcon: 'bi-shield-lock' }
        : { id: 'DOE', label: 'DOE', icon: 'doe', biIcon: 'bi-shield-lock', disabled: true },
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
              html: trust('Access is available to State Urban Development Departments and State DMA officers.'),
              secondary: true,
            },
          ],
          showStats: false,
          showDocuments: false,
          showResourceActions: false,
        };

      default: // 15thFC
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

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.setLoginType();
    this.xvifcService.clearResolvedContext();
    this.loginService.loadRecaptchaScript();
    this.loginService.showRecaptchaBadge();
  }

  ngOnDestroy(): void {
    this.loginService.hideRecaptchaBadge();
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
    this.selectedRole.set(role);
    if (this.isMultiStep()) {
      // Clear any stale value from a previous role selection before moving forward.
      this.loginForm.controls.identifier.reset('');
      this.updateIdentifierValidatorsForRole(role.id);
      this.slideDirection.set('forward');
      this.step.set('credentials');
      this.errorMessage.set('');
    }
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

  protected onForgotPassword(): void {
    const type = this.typeKey();
    void this.router.navigate(type ? ['/auth/forgot-password', type] : ['/auth/forgot-password']);
  }

  protected onBackToRole(): void {
    this.slideDirection.set('back');
    this.step.set('role');
    this.errorMessage.set('');
    this.isSubmitted = false;
    this.isPasswordVisible = false; // U1: reset password visibility
    this.loginForm.controls.password.reset(''); // B5: clear stale password value + touched state
    this.resetIdentifierToDefault();
  }

  protected openReferenceDocuments(): void {
    window.open(
      'https://www.cityfinance.in/api/v1/resourceDashboard/download/698472008670dfe40327596d',
      '_blank',
      'noopener,noreferrer',
    );
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────

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

    this.loginService
      .signInWithPassword(identifier.trim(), password, this.typeKey())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          const user = this.loginService.extractUser(res) ?? this.loginService.getCurrentUser();
          void this.loginService.navigateAfterLogin(user, this.typeKey());
        },
        error: (err: { error?: { message?: string } }) => {
          const message = err?.error?.message;
          // Cantonment-Board ULBs get sent straight to the dedicated not-eligible page instead of an inline error.
          if (message === 'Cantonment boards are not eligible for XVIFC') {
            void this.router.navigate(['/xvifc-not-eligible']);
            return;
          }
          this.errorMessage.set(message ?? 'Invalid credentials. Please try again.');
        },
      });
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private updateValidatorsForType(type: LoginType): void {
    const isMultiStep = type === '16thFC' || type === '15thFC';
    const roleCtrl = this.loginForm.controls.role;

    if (isMultiStep) {
      roleCtrl.setValidators([Validators.required]);
      this.step.set('role');
    } else {
      roleCtrl.clearValidators();
      this.step.set('credentials');
    }
    roleCtrl.updateValueAndValidity();
    roleCtrl.reset('');
    this.resetIdentifierToDefault();
    this.selectedRole.set(null);
    this.errorMessage.set('');
  }

  private updateIdentifierValidatorsForRole(role: LoginRole): void {
    const ctrl = this.loginForm.controls.identifier;
    if (role === 'ULB') {
      ctrl.setValidators([
        Validators.required,
        Validators.minLength(6), // U6: census codes are at minimum 6 digits
        Validators.maxLength(254),
        noEmailFormat,
        ...IDENTIFIER_SECURITY_VALIDATORS,
      ]);
    } else {
      ctrl.setValidators([
        Validators.required,
        Validators.maxLength(254),
        Validators.email,
        ...IDENTIFIER_SECURITY_VALIDATORS,
      ]);
    }
    ctrl.updateValueAndValidity();
  }

  private resetIdentifierToDefault(): void {
    const ctrl = this.loginForm.controls.identifier;
    ctrl.setValidators([
      Validators.required,
      Validators.maxLength(254),
      emailOrCensusCode,
      ...IDENTIFIER_SECURITY_VALIDATORS,
    ]);
    ctrl.updateValueAndValidity();
  }
}
