import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OtpAuthService } from '../../core/auth/auth.service';
import { RecaptchaService } from '../../core/services/recaptcha.service';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';
import { ROUTE_PAGES } from '../../core/constants/login-menu.constant';
import { environment } from '../../../environments/environment';

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

  // ─── Auth API ─────────────────────────────────────────────────────────────────

  signInWithPassword(identifier: string, password: string, type: string | null): Observable<unknown> {
    return this.recaptcha.execute('login').pipe(
      switchMap((recaptchaToken) => this.auth.login({ identifier, password, type, recaptchaToken })),
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

  setPassword(identifier: string, newPassword: string, confirmPassword: string): Observable<unknown> {
    return this.auth.setPassword(identifier, newPassword, confirmPassword) as Observable<unknown>;
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

  async navigateAfterLogin(currentUser: IUserLoggedInDetails | null, type: string | null): Promise<void> {
    if (type === '16thFC') {
      sessionStorage.removeItem('postLoginNavigationV2');
      sessionStorage.removeItem('postLoginNavigation');
      await this.router.navigate(['/xvifc/year'], { replaceUrl: true });
      return;
    }

    const saved =
      sessionStorage.getItem('postLoginNavigationV2') ?? sessionStorage.getItem('postLoginNavigation');
    if (saved) {
      sessionStorage.removeItem('postLoginNavigationV2');
      sessionStorage.removeItem('postLoginNavigation');
      await this.router.navigateByUrl(saved, { replaceUrl: true });
      return;
    }

    for (const route of ROUTE_PAGES) {
      if (
        route.type === type &&
        (!route.roles || route.roles.includes(currentUser?.role as USER_TYPE))
      ) {
        if (route.link) {
          window.location.href = environment.ui.urlV1 + route.link;
        } else if (route.route) {
          await this.router.navigate([route.route], { replaceUrl: true });
        }
        return;
      }
    }
  }
}
