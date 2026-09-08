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
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, finalize, timer } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { OtpAuthService } from '../../core/auth/auth.service';
import { LOGIN_TYPES, LoginType } from '../login/login.component';
import {
  IDENTIFIER_SECURITY_VALIDATORS,
  PASSWORD_SECURITY_VALIDATORS,
  noNumericCode,
  passwordComplexity,
} from '../validators/auth-security.validators';

type ForgotRole = 'ULB' | 'STATE' | 'MOHUA';
type StepType = 'REQUEST_OTP' | 'RESET_PASSWORD' | 'SUCCESS';

const RESEND_SECONDS = 60;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
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
  readonly currentStep = signal<StepType>('REQUEST_OTP');
  readonly slideDirection = signal<'forward' | 'back' | 'none'>('none');
  readonly selectedRole = signal<ForgotRole>('ULB');
  readonly isSubmitting = signal(false);
  /** Masked identifier computed on the frontend — never derived from backend response. */
  readonly maskedIdentifier = signal('');
  /** True only after a Resend OTP call succeeds — drives the generic resend confirmation. */
  readonly otpResent = signal(false);
  readonly resendSeconds = signal(0);
  readonly requestError = signal('');
  readonly resetError = signal('');
  /** True while the currently-displayed error is a 429 rate-limit — styles the banner as a warning instead of danger. */
  readonly errorIsRateLimited = signal(false);
  /** Live countdown (seconds) until the rate-limit that produced the current error clears. */
  readonly errorRetrySeconds = signal(0);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly redirectSeconds = signal(0);

  private countdownSub: Subscription | null = null;
  private errorRetrySub: Subscription | null = null;

  readonly identifyForm = this.fb.nonNullable.group({
    role: ['ULB' as ForgotRole, Validators.required],
    // U4+U6: pattern enforces digits-only (rejects spaces, letters, @); minLength catches short codes
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^\d+$/), ...IDENTIFIER_SECURITY_VALIDATORS]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254), noNumericCode, ...IDENTIFIER_SECURITY_VALIDATORS]],
  });

  readonly resetForm = this.fb.nonNullable.group(
    {
      // FP1: pattern enforces digits-only; length validators enforce exactly 4 digits
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^\d+$/)]],
      newPassword: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(128), passwordComplexity, ...PASSWORD_SECURITY_VALIDATORS],
      ],
      confirmPassword: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(128), passwordComplexity, ...PASSWORD_SECURITY_VALIDATORS],
      ],
    },
    { validators: [this.passwordMatchValidator()] },
  );

  /** Formats errorRetrySeconds as "Ns" up to a minute, "Mm" / "Mm Ss" beyond it. */
  readonly errorRetryDisplay = computed(() => {
    const total = this.errorRetrySeconds();
    if (total <= 60) return `${total}s`;
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  });

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
        if (LOGIN_TYPES.includes(type)) this.typeKey.set(type as LoginType);
      });

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const type = params.get('type') as LoginType;
        if (LOGIN_TYPES.includes(type)) this.typeKey.set(type);
      });
  }

  onRoleChange(role: ForgotRole): void {
    this.selectedRole.set(role);
    this.identifyForm.patchValue({ role, code: '', email: '' });
    this.identifyForm.markAsPristine();
    this.identifyForm.markAsUntouched();
    this.requestError.set('');  // B2: clear stale error from previous role attempt
  }

  onBackToLogin(): void {
    this.clearCountdown();
    const type = this.typeKey();
    void this.router.navigate(type ? ['/auth/login', type] : ['/auth/login']);
  }

  onContinue(): void {
    if (this.isSubmitting()) return;

    const role = this.selectedRole();
    if (role === 'ULB') {
      this.identifyForm.controls.email.clearValidators();
      this.identifyForm.controls.email.setValue('');
      this.identifyForm.controls.code.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(/^\d+$/),
        ...IDENTIFIER_SECURITY_VALIDATORS,
      ]);
    } else {
      this.identifyForm.controls.code.clearValidators();
      this.identifyForm.controls.code.setValue('');
      this.identifyForm.controls.email.setValidators([
        Validators.required,
        Validators.email,
        Validators.maxLength(254),
        noNumericCode,
        ...IDENTIFIER_SECURITY_VALIDATORS,
      ]);
    }
    this.identifyForm.controls.code.updateValueAndValidity();
    this.identifyForm.controls.email.updateValueAndValidity();

    if (this.identifyForm.invalid) {
      this.identifyForm.markAllAsTouched();
      return;
    }

    this.requestError.set('');
    this.clearErrorRetryCountdown();
    this.isSubmitting.set(true);

    const identifier = this.getIdentifier();

    this.authService
      .sendForgotPasswordOtp(identifier)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          // ULB identifies by code → OTP sent to mobile; STATE/MoHUA by email → OTP sent to email.
          // Fall back to frontend masking for fake accounts where the backend returns no contact.
          const isUlb = this.selectedRole() === 'ULB';
          const maskedContact = isUlb
            ? (res.maskedMobile ?? this.maskIdentifier(identifier))
            : (res.maskedEmail ?? this.maskIdentifier(identifier));
          this.maskedIdentifier.set(maskedContact);
          this.slideDirection.set('forward');
          this.currentStep.set('RESET_PASSWORD');
          this.startResendTimer();
        },
        error: (err: HttpErrorResponse) => {
          this.requestError.set(this.mapSendOtpError(err));
          this.applyRetryAfterState(err);
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
    this.clearErrorRetryCountdown();
    this.otpResent.set(false);  // B3: dismiss resend banner before new attempt
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
          this.slideDirection.set('forward');
          this.currentStep.set('SUCCESS');
          // FP12: auto-redirect after 5 seconds
          let count = 5;
          this.redirectSeconds.set(count);
          this.countdownSub = timer(1000, 1000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              count--;
              this.redirectSeconds.set(count);
              if (count <= 0) {
                this.clearCountdown();
                this.onBackToLogin();
              }
            });
        },
        error: (err: HttpErrorResponse) => {
          this.resetError.set(this.mapResetPasswordError(err));
          this.applyRetryAfterState(err);
        },
      });
  }

  onResendOtp(): void {
    if (this.resendSeconds() > 0 || this.isSubmitting()) return;

    this.otpResent.set(false);
    this.resetError.set('');
    this.clearErrorRetryCountdown();
    this.isSubmitting.set(true);

    const identifier = this.getIdentifier();

    this.authService
      .sendForgotPasswordOtp(identifier)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          // Same generic message — no UI difference between real and fake accounts
          this.otpResent.set(true);
          this.startResendTimer();
        },
        error: (err: HttpErrorResponse) => {
          this.resetError.set(this.mapSendOtpError(err));
          this.applyRetryAfterState(err);
        },
      });
  }

  /** Strips non-digits and caps at 4 chars as the user types/pastes — validators alone don't stop typing. */
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 4);
    if (digitsOnly !== input.value) {
      this.resetForm.controls.otp.setValue(digitsOnly);
    }
  }

  onBackToIdentify(): void {
    this.clearCountdown();
    this.slideDirection.set('back');
    this.currentStep.set('REQUEST_OTP');
    this.resetForm.reset();
    this.otpResent.set(false);
    this.resetError.set('');
    this.showNewPassword.set(false);   // U2: don't carry password visibility into next attempt
    this.showConfirmPassword.set(false);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  private getIdentifier(): string {
    return this.selectedRole() === 'ULB'
      ? this.identifyForm.controls.code.value.trim()
      : this.identifyForm.controls.email.value.trim();
  }

  /**
   * Produces a masked version of the identifier entirely on the frontend.
   * Email: first 2 chars of local part shown, rest as *.
   * Numeric code: first 2 digits shown, rest as *.
   */
  private maskIdentifier(identifier: string): string {
    if (identifier.includes('@')) {
      const atIdx = identifier.indexOf('@');
      const local = identifier.slice(0, atIdx);
      const domain = identifier.slice(atIdx);
      const visible = Math.min(2, local.length);
      return local.slice(0, visible) + '*'.repeat(Math.max(local.length - visible, 4)) + domain;
    }
    const visible = Math.min(2, identifier.length);
    return identifier.slice(0, visible) + '*'.repeat(Math.max(identifier.length - visible, 4));
  }

  private startResendTimer(): void {
    this.clearCountdown();
    this.countdownSub = timer(0, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))  // B1: prevent signal writes after destroy
      .subscribe((tick) => {
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

  /**
   * Maps HTTP errors for the send-OTP step. Never reveals whether the account exists — safe here
   * because the 429 throttle (cooldown/lock/resend-ceiling) is keyed on identifier/IP, not on
   * whether the account is real, so its message is the same either way.
   */
  private mapSendOtpError(err: HttpErrorResponse): string {
    if (err.status === 429) return err.error?.message || 'Too many OTP requests. Please try again later.';
    return 'Unable to send OTP right now. Please try again.';
  }

  /**
   * Maps HTTP errors for the reset-password step.
   * Fake-account failures are intentionally indistinguishable from invalid/expired OTP.
   * 429s are safe to show verbatim — same reasoning as mapSendOtpError above.
   */
  private mapResetPasswordError(err: HttpErrorResponse): string {
    if (err.status === 429) return err.error?.message || 'Too many attempts. Please try again later.';
    return 'Invalid or expired OTP.';
  }

  /**
   * Reads the backend's exact rate-limit countdown (`data.retryAfterSeconds`, seconds until the
   * cooldown/lock clears) off a 429 response and starts a live countdown from it — lets the error
   * banner show precisely when the next attempt will stop being rejected, instead of a vague
   * "try again later".
   */
  private applyRetryAfterState(err: HttpErrorResponse): void {
    const seconds = this.extractRetryAfterSeconds(err);
    this.clearErrorRetryCountdown();

    if (seconds === null) {
      this.errorIsRateLimited.set(false);
      this.errorRetrySeconds.set(0);
      return;
    }

    this.errorIsRateLimited.set(true);
    this.errorRetrySeconds.set(seconds);
    this.errorRetrySub = timer(1000, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const remaining = this.errorRetrySeconds() - 1;
        this.errorRetrySeconds.set(Math.max(remaining, 0));
        if (remaining <= 0) {
          this.clearErrorRetryCountdown();
          this.errorIsRateLimited.set(false);
          // Whichever step's banner was showing this rate-limit message — the other is already empty.
          this.requestError.set('');
          this.resetError.set('');
        }
      });
  }

  private extractRetryAfterSeconds(err: HttpErrorResponse): number | null {
    if (err.status !== 429) return null;
    const raw = (err.error as { data?: { retryAfterSeconds?: unknown } } | null)?.data?.retryAfterSeconds;
    return typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? Math.round(raw) : null;
  }

  private clearErrorRetryCountdown(): void {
    this.errorRetrySub?.unsubscribe();
    this.errorRetrySub = null;
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
