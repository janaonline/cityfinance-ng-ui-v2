import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, finalize, timer } from 'rxjs';

import { OtpAuthService } from '../../../core/auth/auth.service';
import {
  AuthUser,
  OtpErrorMessage,
  SendOtpResponse,
} from '../../../core/auth/otp.models';
import { USER_TYPE } from '../../../core/models/user/userType';

type Step = 'identifier' | 'otp';

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 30;

const ERROR_MAP: Record<string, string> = {
  [OtpErrorMessage.PLEASE_WAIT]: 'Please wait before resending.',
  [OtpErrorMessage.MAX_RESEND]: "You've reached the resend limit. Try again later.",
  [OtpErrorMessage.LOCKED]: 'Account temporarily locked. Please try again in 15 minutes.',
  [OtpErrorMessage.TOO_MANY_VERIFY]: 'Too many wrong attempts. Request a new OTP.',
  [OtpErrorMessage.INVALID_OTP]: 'Incorrect OTP. Please try again.',
};

@Component({
  selector: 'app-otp-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './otp-login.component.html',
  styleUrl: './otp-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpLoginComponent implements OnInit {
  @ViewChildren('otpInput') otpInputRefs!: QueryList<ElementRef<HTMLInputElement>>;

  private readonly authService = inject(OtpAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly OTP_LENGTH = OTP_LENGTH;

  protected readonly step = signal<Step>('identifier');
  protected readonly isLoading = signal(false);
  protected readonly identifierError = signal('');
  protected readonly otpError = signal('');
  protected readonly fieldErrors = signal<Record<string, string[]>>({});
  protected readonly countdown = signal(0);
  protected readonly sendOtpData = signal<SendOtpResponse | null>(null);
  protected readonly otpValues = signal<string[]>(Array(OTP_LENGTH).fill(''));

  private countdownSub: Subscription | null = null;

  protected readonly identifierForm = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(1)]],
  });

  protected readonly maskedContact = computed(() => {
    const data = this.sendOtpData();
    if (!data) return '';
    const parts: string[] = [];
    if (data.mobile) parts.push(data.mobile);
    if (data.email) parts.push(data.email);
    return parts.join(' and ');
  });

  protected readonly isCountdownActive = computed(() => this.countdown() > 0);

  protected readonly isOtpComplete = computed(
    () => this.otpValues().every((v) => v !== '') && this.otpValues().join('').length === OTP_LENGTH,
  );

  ngOnInit(): void {}

  // ─── Step 1: Identifier ────────────────────────────────────────────────────

  protected onSendOtp(): void {
    const ctrl = this.identifierForm.controls.identifier;
    if (ctrl.invalid) {
      ctrl.markAsTouched();
      return;
    }
    if (this.isLoading()) return;

    this.identifierError.set('');
    this.fieldErrors.set({});
    this.isLoading.set(true);

    const identifier = ctrl.value!.trim();

    this.authService
      .sendOtp(identifier)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.sendOtpData.set(res);
          this.step.set('otp');
          this.startCountdown();
        },
        error: (err) => {
          this.identifierError.set(this.mapError(err));
          const errs = err?.error?.errors as Record<string, string[]> | undefined;
          if (errs) this.fieldErrors.set(errs);
        },
      });
  }

  // ─── Step 2: OTP ───────────────────────────────────────────────────────────

  protected onVerifyOtp(): void {
    const otp = this.otpValues().join('');
    if (otp.length !== OTP_LENGTH || this.isLoading()) return;

    this.otpError.set('');
    this.isLoading.set(true);

    const identifier = this.identifierForm.controls.identifier.value!.trim();
    const requestId = this.sendOtpData()?.requestId;

    this.authService
      .verifyOtp(identifier, otp, requestId)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.clearCountdown();
          void this.navigateAfterLogin(res.user);
        },
        error: (err) => {
          this.otpError.set(this.mapError(err));
          this.clearOtpBoxes();
          this.focusBox(0);
        },
      });
  }

  protected onResendOtp(): void {
    if (this.isCountdownActive() || this.isLoading()) return;

    this.otpError.set('');
    this.isLoading.set(true);

    const identifier = this.identifierForm.controls.identifier.value!.trim();

    this.authService
      .sendOtp(identifier)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.sendOtpData.set(res);
          this.clearOtpBoxes();
          this.startCountdown();
        },
        error: (err) => {
          const msg = err?.error?.message as string | undefined;
          // 429 PLEASE_WAIT — do not restart timer, just surface message
          if (msg === OtpErrorMessage.PLEASE_WAIT) {
            this.otpError.set(ERROR_MAP[msg]);
          } else {
            this.otpError.set(this.mapError(err));
          }
        },
      });
  }

  protected onChangeIdentifier(): void {
    this.clearCountdown();
    this.step.set('identifier');
    this.otpError.set('');
    this.clearOtpBoxes();
    this.sendOtpData.set(null);
  }

  // ─── OTP box event handlers ─────────────────────────────────────────────

  protected onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);

    input.value = digit; // keep DOM in sync before signal update

    const vals = [...this.otpValues()];
    vals[index] = digit;
    this.otpValues.set(vals);

    if (digit && index < OTP_LENGTH - 1) {
      this.focusBox(index + 1);
    }
  }

  protected onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpValues()[index] && index > 0) {
      this.focusBox(index - 1);
    }
  }

  protected onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');

    const vals = Array(OTP_LENGTH).fill('');
    digits.forEach((d, i) => (vals[i] = d));
    this.otpValues.set(vals);

    const refs = this.otpInputRefs.toArray();
    refs.forEach((ref, i) => (ref.nativeElement.value = vals[i]));

    // Focus the first unfilled box, or the last if all filled
    const nextEmpty = digits.length < OTP_LENGTH ? digits.length : OTP_LENGTH - 1;
    this.focusBox(nextEmpty);
  }

  protected hasFieldError(field: string): boolean {
    return (this.fieldErrors()[field]?.length ?? 0) > 0;
  }

  protected getFieldError(field: string): string {
    return this.fieldErrors()[field]?.[0] ?? '';
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private startCountdown(): void {
    this.clearCountdown();
    this.countdownSub = timer(0, 1000).subscribe((tick) => {
      const remaining = COUNTDOWN_SECONDS - tick;
      if (remaining <= 0) {
        this.countdown.set(0);
        this.clearCountdown();
      } else {
        this.countdown.set(remaining);
      }
    });
  }

  private clearCountdown(): void {
    this.countdownSub?.unsubscribe();
    this.countdownSub = null;
    this.countdown.set(0);
  }

  private clearOtpBoxes(): void {
    this.otpValues.set(Array(OTP_LENGTH).fill(''));
    this.otpInputRefs?.forEach((ref) => (ref.nativeElement.value = ''));
  }

  private focusBox(index: number): void {
    this.otpInputRefs?.toArray()[index]?.nativeElement.focus();
  }

  private mapError(err: any): string {
    const msg: string = err?.error?.message ?? '';
    if (msg && msg in ERROR_MAP) return ERROR_MAP[msg];
    if (err?.error?.errors) return '';
    return 'Something went wrong. Please try again.';
  }

  private async navigateAfterLogin(user: AuthUser): Promise<void> {
    const postLogin =
      sessionStorage.getItem('postLoginNavigationV2') ?? sessionStorage.getItem('postLoginNavigation');
    if (postLogin) {
      sessionStorage.removeItem('postLoginNavigationV2');
      sessionStorage.removeItem('postLoginNavigation');
      await this.router.navigateByUrl(postLogin);
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      await this.router.navigateByUrl(returnUrl);
      return;
    }

    if (user.role === USER_TYPE.ULB) {
      await this.router.navigate(['/xvifc/year']);
      return;
    }

    if (
      ([USER_TYPE.XVIFC, USER_TYPE.XVIFC_STATE, USER_TYPE.STATE, USER_TYPE.MoHUA] as string[]).includes(user.role)
    ) {
      await this.router.navigate(['/admin']);
      return;
    }

    await this.router.navigate(['/xvifc/year']);
  }
}
