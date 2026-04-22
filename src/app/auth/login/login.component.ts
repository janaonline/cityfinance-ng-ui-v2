import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';
import { XvifcModuleService } from '../../features/xvi-fc-module/xvi-fc-module.service';

type LoginRole = 'ULB' | 'STATE' | 'MOHUA' | 'DOE';
type RoleIcon = 'ulb' | 'state' | 'mohua' | 'doe';
type LoginControlName = 'role' | 'email' | 'password';

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
type LoginType = 'xvifc' | '15thFC';
type LoginFormModel = {
  role: FormControl<LoginRole | ''>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    // RouterLink,
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
export class LoginComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private _router: Router,
  ) {}
  private readonly xvifcService = inject(XvifcModuleService);
  private readonly authService = inject(AuthService);

  typeKey = signal<LoginType | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly supportEmail = '16fcgrant@cityfinance.in';
  protected readonly brandName = 'CITY FINANCE';

  protected isSubmitted = false;
  protected isPasswordVisible = false;

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
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  protected get roleControl(): FormControl<LoginRole | ''> {
    return this.loginForm.controls.role;
  }
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

  ngOnInit(): void {
    this.route.queryParams.subscribe(({ type }) => {
      this.typeKey.set(type === 'xvifc' || type === '15thFC' ? type : null);
    });
    this.xvifcService.clearResolvedContext();
  }

  protected trackByRole(_: number, role: RoleOption): string {
    return role.id;
  }

  protected trackByStat(_: number, stat: StatItem): string {
    return stat.label;
  }

  protected selectRole(role: RoleOption): void {
    if (role.disabled) {
      return;
    }

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

    if (!(control.touched || this.isSubmitted)) {
      return false;
    }

    return errorKey ? control.hasError(errorKey) : control.invalid;
  }

  onForgotPassword(): void {
    this._router.navigate(['/forgot-password'], {
      queryParams: { type: this.typeKey() },
    });
  }
  onSignup(): void {
    this._router.navigate(['/signup'], {
      queryParams: {
        type: this.typeKey(),
        role: 'ULB',
      },
    });
  }
  protected openReferenceDocuments(): void {
    console.log('Reference documents clicked');
  }

  protected openGuidelines(): void {
    console.log('Guidelines clicked');
  }

  protected onSubmit(): void {
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.getRawValue();
    const payload = {
      email,
      password,
      type: this.typeKey() ?? '15thFC',
    };

    this.authService
      .login(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response: any) => {
          const currentUser =
            this.authService.extractUser(response) || this.authService.getCurrentUserSnapshot();
          void this.navigateAfterLogin(currentUser);
        },
        error: (error: any) => {
          this.errorMessage.set(
            error?.error?.message || 'Invalid credentials. Please try again.',
          );
        },
      });
  }

  private async navigateAfterLogin(currentUser: IUserLoggedInDetails | null): Promise<void> {
    const postLoginNavigation = sessionStorage.getItem('postLoginNavigation');
    if (postLoginNavigation) {
      sessionStorage.removeItem('postLoginNavigation');
      await this._router.navigateByUrl(postLoginNavigation);
      return;
    }

    if (currentUser?.role === USER_TYPE.ULB) {
      // await this._router.navigate(['/xvifc-form']);
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
