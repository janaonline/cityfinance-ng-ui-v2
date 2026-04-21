import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
type ForgotRole = 'ULB' | 'STATE' | 'MOHUA';
type StepType = 'identify' | 'reset';
type LoginType = 'xvifc' | '15thFC';
interface IdentifiedUser {
  role: ForgotRole;
  displayName: string;
  maskedMobile?: string;
  maskedEmail: string;
  code?: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  readonly roles: ForgotRole[] = ['ULB', 'STATE', 'MOHUA'];
  typeKey = signal<LoginType | null>(null);
  readonly currentStep = signal<StepType>('identify');
  readonly selectedRole = signal<ForgotRole>('ULB');

  readonly isSubmitting = signal(false);
  readonly otpSent = signal(false);
  readonly resendSeconds = signal(49);
  readonly identifiedUser = signal<IdentifiedUser | null>(null);

  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly identifyForm = this.fb.nonNullable.group({
    role: ['ULB' as ForgotRole, Validators.required],
    code: [''],
    email: ['', [Validators.email]],
  });

  readonly resetForm = this.fb.nonNullable.group(
    {
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.passwordMatchValidator()],
    },
  );

  readonly identifyTitle = computed(() => {
    const role = this.selectedRole();
    if (role === 'ULB') return 'Verify your ULB account';
    if (role === 'STATE') return 'Verify your State account';
    return 'Verify your MoHUA account';
  });
  ngOnInit(): void {
    this.route.queryParams.subscribe(({ type }) => {
      this.typeKey.set(type === 'xvifc' || type === '15thFC' ? type : null);
    });
  }
  onRoleChange(role: ForgotRole): void {
    this.selectedRole.set(role);
    this.identifyForm.patchValue({
      role,
      code: '',
      email: '',
    });
    this.identifyForm.markAsPristine();
    this.identifyForm.markAsUntouched();
  }
  onBackToLogin(): void {
    const type = this.typeKey();

    console.log('Back to login clicked', type);

    this.router.navigate(['/login'], {
      queryParams: type ? { type } : {},
    });
  }
  onContinue(): void {
    const role = this.selectedRole();

    if (role === 'ULB') {
      this.identifyForm.controls.email.clearValidators();
      this.identifyForm.controls.email.setValue('');
      this.identifyForm.controls.code.setValidators([Validators.required]);
    } else {
      this.identifyForm.controls.code.clearValidators();
      this.identifyForm.controls.code.setValue('');
      this.identifyForm.controls.email.setValidators([Validators.required, Validators.email]);
    }

    this.identifyForm.controls.code.updateValueAndValidity();
    this.identifyForm.controls.email.updateValueAndValidity();

    if (this.identifyForm.invalid) {
      this.identifyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // TODO: Replace with backend API
    setTimeout(() => {
      const formValue = this.identifyForm.getRawValue();

      if (role === 'ULB') {
        this.identifiedUser.set({
          role,
          displayName: 'Dear User',
          maskedMobile: '94******50',
          maskedEmail: 'wa*************@gmail.com',
          code: formValue.code,
        });
      } else {
        this.identifiedUser.set({
          role,
          displayName: 'Dear User',
          maskedEmail: role === 'STATE' ? 'st********@state.gov.in' : 'mo********@mohua.gov.in',
        });
      }

      this.currentStep.set('reset');
      this.otpSent.set(true);
      this.startResendTimer();
      this.isSubmitting.set(false);
    }, 800);
  }

  onResetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // TODO: Replace with backend API
    setTimeout(() => {
      console.log('RESET PASSWORD PAYLOAD', {
        role: this.selectedRole(),
        identifiedUser: this.identifiedUser(),
        ...this.resetForm.getRawValue(),
      });
      this.isSubmitting.set(false);
      alert('Password reset successful');
    }, 800);
  }

  onResendOtp(): void {
    if (this.resendSeconds() > 0) return;
    this.otpSent.set(true);
    this.startResendTimer();
  }

  onBackToIdentify(): void {
    this.currentStep.set('identify');
    this.resetForm.reset();
    this.otpSent.set(false);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  private startResendTimer(): void {
    this.resendSeconds.set(49);

    const interval = setInterval(() => {
      const current = this.resendSeconds();

      if (current <= 1) {
        this.resendSeconds.set(0);
        clearInterval(interval);
        return;
      }

      this.resendSeconds.set(current - 1);
    }, 1000);
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.get('newPassword')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (!newPassword || !confirmPassword) return null;
      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}
