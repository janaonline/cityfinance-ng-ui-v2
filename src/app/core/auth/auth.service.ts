import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, finalize, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService as LegacyAuthService } from '../services/auth.service';
import {
  AuthUser,
  SendOtpResponse,
  VerifyOtpResponse,
} from './otp.models';

const TOKEN_KEY = 'cf_access_token';

@Injectable({ providedIn: 'root' })
export class OtpAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly legacyAuth = inject(LegacyAuthService);

  private readonly accessToken = signal<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );
  private readonly currentUser = signal<AuthUser | null>(null);

  readonly isLoggedIn = computed(() => !!this.accessToken());
  readonly user = this.currentUser.asReadonly();

  sendOtp(identifier: string): Observable<SendOtpResponse> {
    return this.http.post<SendOtpResponse>(
      `${environment.api.url2}auth/sendOtp`,
      { identifier, purpose: 'login' },
      { withCredentials: true },
    );
  }

  verifyOtp(
    identifier: string,
    otp: string,
    requestId?: string,
  ): Observable<VerifyOtpResponse> {
    const body = requestId
      ? { identifier, otp, requestId }
      : { identifier, otp };

    return this.http
      .post<VerifyOtpResponse>(
        `${environment.api.url2}auth/verifyOtp`,
        body,
        { withCredentials: true },
      )
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          this.accessToken.set(res.token);
          this.currentUser.set(res.user);
          // Bridge into legacy auth service so the existing interceptor
          // and session-restore flow both recognise the token.
          this.legacyAuth.storeTokens(res);
        }),
      );
  }

  logout(): Observable<void> {
    const token = this.accessToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http
      .post<void>(`${environment.api.url2}auth/logout`, {}, {
        withCredentials: true,
        headers,
      })
      .pipe(
        // Always clear state whether the server responds or not
        catchError(() => EMPTY),
        finalize(() => {
          localStorage.removeItem(TOKEN_KEY);
          this.accessToken.set(null);
          this.currentUser.set(null);
          this.legacyAuth.clearLocalStorage();
          void this.router.navigate(['/login']);
        }),
      );
  }

  getToken(): string | null {
    return this.accessToken();
  }
}
