import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { retry, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OtpAuthService } from '../../core/auth/auth.service';
import { RecaptchaService } from '../../core/services/recaptcha.service';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';

export interface CheckUserResult {
  isXVIFCProfileVerified?: boolean;
  status?: string;
  maskedContact?: string;
}

export interface OtpCredentials {
  mobile?: string;
  email?: string;
}

@Injectable()
export class LoginService {
  private readonly auth = inject(AuthService);
  private readonly otpAuth = inject(OtpAuthService);
  private readonly recaptcha = inject(RecaptchaService);
  private readonly router = inject(Router);

  // ─── Recaptcha ────────────────────────────────────────────────────────────────

  loadRecaptchaScript(): void {
    this.recaptcha.loadScript();
  }

  showRecaptchaBadge(): void {
    this.recaptcha.showBadge();
  }

  hideRecaptchaBadge(): void {
    this.recaptcha.hideBadge();
  }

  /** Call after a failed login attempt (wrong credentials or a reCAPTCHA failure) so the next
   *  attempt gets a fresh Google client instead of reusing whatever state produced the failure. */
  resetRecaptcha(): void {
    this.recaptcha.reset();
  }

  /** Call when leaving the login page so a later visit (e.g. after logout) never reuses this client. */
  teardownRecaptcha(): void {
    this.recaptcha.teardown();
  }

  // ─── Auth API ─────────────────────────────────────────────────────────────────

  signInWithPassword(
    identifier: string,
    password: string,
    role: string,
    type: string | null,
  ): Observable<unknown> {
    // defer() is required here, not optional — execute('login') itself only runs once to build
    // the Observable; without defer, retry(1) would just resubscribe to that same
    // already-settled result instead of calling execute() again, so a blank/rejected token would
    // never actually get a fresh ask.
    return defer(() => this.recaptcha.execute('login')).pipe(
      // A blank token from grecaptcha.execute() is a known transient client-side quirk, not
      // something tied to a prior call — asking again almost always succeeds. Only surface an
      // error to the user if it fails twice in a row for this one submit.
      retry(1),
      // `role` lets the backend enforce "the account must hold the picked role" (TS-1262) now
      // that there's no portal choice narrowing it implicitly; `type` is still sent for the
      // backend's existing branding/analytics use, unrelated to this check.
      switchMap((recaptchaToken) => this.auth.login({ identifier, password, role, type, recaptchaToken })),
    );
  }

  requestOtp(identifier: string): Observable<OtpCredentials> {
    return this.auth.otpSignIn({ identifier }) as Observable<OtpCredentials>;
  }

  verifyOtp(identifier: string, otp: string): Observable<unknown> {
    return this.auth.otpVerify({ identifier, otp });
  }

  check16FCIdentifier(identifier: string, role: string): Observable<CheckUserResult> {
    return this.auth.checkUser(identifier, role) as Observable<CheckUserResult>;
  }

  send16FCOtp(identifier: string): Observable<{ mobile?: string }> {
    return this.otpAuth.sendOtp(identifier, 'login') as Observable<{ mobile?: string }>;
  }

  verify16FCOtp(identifier: string, otp: string): Observable<unknown> {
    return this.otpAuth.verifyOtp(identifier, otp) as Observable<unknown>;
  }

  extractUser(response: unknown): IUserLoggedInDetails | null {
    return this.auth.extractUser(response);
  }

  getCurrentUser(): IUserLoggedInDetails | null {
    return this.auth.getCurrentUserSnapshot();
  }

  // ─── Pure utility ─────────────────────────────────────────────────────────────

  detectIdentifierType(value: string): 'mobile' | 'censusCode' | 'email' | null {
    if (!value) return null;
    if (/^[6-9]\d{9}$/.test(value)) return 'mobile';
    if (/^\d{2,}$/.test(value)) return 'censusCode';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
    return null;
  }

  // ─── Post-login navigation ────────────────────────────────────────────────────

  // TS-1262: every sign-in now lands on the unified home page of module cards by default —
  // the home page itself owns "where do I go for XVI-FC / XV-FC / etc.", not login. The one
  // exception is a guard-triggered deep link (someone hit a guarded URL directly, got bounced
  // to sign-in, and should land back where they were once authenticated).
  async navigateAfterLogin(): Promise<void> {
    const saved =
      sessionStorage.getItem('postLoginNavigationV2') ?? sessionStorage.getItem('postLoginNavigation');
    sessionStorage.removeItem('postLoginNavigationV2');
    sessionStorage.removeItem('postLoginNavigation');

    if (saved) {
      await this.router.navigateByUrl(saved, { replaceUrl: true });
      return;
    }

    await this.router.navigate(['/'], { replaceUrl: true });
  }
}
