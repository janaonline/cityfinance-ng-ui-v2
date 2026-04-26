import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, finalize, timer } from 'rxjs';

import { OtpAuthService } from '../../core/auth/auth.service';

type ForgotRole = 'ULB' | 'STATE' | 'MOHUA';
type StepType = 'identify' | 'reset' | 'success';
type LoginType = 'xvifc' | '15thFC';

interface IdentifiedUser {
  role: ForgotRole;
  maskedMobile?: string;
  maskedEmail?: string;
  code?: string;
}

const RESEND_SECONDS = 30;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit {
  private readonly authService = inject(OtpAuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly roles: ForgotRole[] = ['ULB', 'STATE', 'MOHUA'];
  readonly typeKey = signal<LoginType | null>(null);
  readonly currentStep = signal<StepType>('identify');
  readonly selectedRole = signal<ForgotRole>('ULB');

  readonly isSubmitting = signal(false);
  readonly otpSent = signal(false);
  readonly resendSeconds = signal(RESEND_SECONDS);
  readonly identifiedUser = signal<IdentifiedUser | null>(null);
  readonly identifyError = signal('');
  readonly resetError = signal('');

  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  private countdownSub: Subscription | null = null;

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
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ type }) => {
        this.typeKey.set(type === 'xvifc' || type === '15thFC' ? type : null);
      });
  }

  onRoleChange(role: ForgotRole): void {
    this.selectedRole.set(role);
    this.identifyForm.patchValue({ role, code: '', email: '' });
    this.identifyForm.markAsPristine();
    this.identifyForm.markAsUntouched();
  }

  onBackToLogin(): void {
    const type = this.typeKey();
    this.router.navigate(['/login'], { queryParams: type ? { type } : {} });
  }

  onContinue(): void {
    if (this.isSubmitting()) return;

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

    this.identifyError.set('');
    this.isSubmitting.set(true);

    const identifier = this.getIdentifier();

    this.authService
      .sendOtp(identifier, 'forgot-password')
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.identifiedUser.set({
            role,
            maskedMobile: res.mobile,
            maskedEmail: res.email,
            code: role === 'ULB' ? identifier : undefined,
          });
          this.currentStep.set('reset');
          this.otpSent.set(true);
          this.startResendTimer();
        },
        error: (err) => {
          this.identifyError.set(this.mapError(err));
        },
      });
  }

  onResetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    if (this.isSubmitting()) return;

    this.resetError.set('');
    this.isSubmitting.set(true);

    const identifier = this.getIdentifier();
    const { otp, newPassword, confirmPassword } = this.resetForm.getRawValue();

    this.authService
      .resetPassword({ identifier, otp, newPassword, confirmPassword })
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.clearCountdown();
          this.currentStep.set('success');
        },
        error: (err) => {
          this.resetError.set(this.mapError(err));
        },
      });
  }

  onResendOtp(): void {
    if (this.resendSeconds() > 0 || this.isSubmitting()) return;

    this.resetError.set('');
    this.otpSent.set(false);
    this.isSubmitting.set(true);

    const identifier = this.getIdentifier();

    this.authService
      .sendOtp(identifier, 'forgot-password')
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.identifiedUser.update((prev) =>
            prev ? { ...prev, maskedMobile: res.mobile, maskedEmail: res.email } : prev,
          );
          this.otpSent.set(true);
          this.startResendTimer();
        },
        error: (err) => {
          this.resetError.set(this.mapError(err));
        },
      });
  }

  onBackToIdentify(): void {
    this.clearCountdown();
    this.currentStep.set('identify');
    this.resetForm.reset();
    this.otpSent.set(false);
    this.resetError.set('');
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  private getIdentifier(): string {
    const role = this.selectedRole();
    return role === 'ULB'
      ? this.identifyForm.controls.code.value.trim()
      : this.identifyForm.controls.email.value.trim();
  }

  private startResendTimer(): void {
    this.clearCountdown();
    this.countdownSub = timer(0, 1000).subscribe((tick) => {
      const remaining = RESEND_SECONDS - tick;
      if (remaining <= 0) {
        this.resendSeconds.set(0);
        this.clearCountdown();
      } else {
        this.resendSeconds.set(remaining);
      }
    });
  }

  private clearCountdown(): void {
    this.countdownSub?.unsubscribe();
    this.countdownSub = null;
  }

  private mapError(err: unknown): string {
    const msg = (err as { error?: { message?: string } })?.error?.message;
    if (msg) return msg;
    return 'Something went wrong. Please try again.';
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
