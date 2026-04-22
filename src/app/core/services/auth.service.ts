import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, Subject, catchError, filter, finalize, map, of, shareReplay, take, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IUserLoggedInDetails } from '../models/login/userLoggedInDetails';

export interface AuthSessionState {
  isAuthenticated: boolean;
  isRefreshing: boolean;
  isRestoringSession: boolean;
  hasAccessToken: boolean;
  isReady: boolean;
  user: IUserLoggedInDetails | null;
}

@Injectable()
export class AuthService {
  private readonly accessTokenStorageKey = 'id_token';
  private readonly sessionHintStorageKey = 'auth_session_hint';
  private readonly loginUrl = `${environment.api.url2}auth/login`;
  private readonly logoutUrl = `${environment.api.url2}auth/logout`;
  private readonly refreshTokenUrl = `${environment.api.url2}auth/refresh`;
  private readonly jwtHelper = new JwtHelperService();

  private accessToken: string | null = this.readStoredAccessToken();
  private refreshRequest$: Observable<any> | null = null;
  private restoreRequest$: Observable<boolean> | null = null;
  private isRefreshing = false;
  private isRestoringSession = this.shouldRestoreSessionOnBootstrap();

  public badCredentials: Subject<boolean> = new Subject<boolean>();
  public helper = this.jwtHelper;
  public loginLogoutCheck = new Subject<any>();

  private readonly currentUserSubject =
    new BehaviorSubject<IUserLoggedInDetails | null>(this.readStoredUser());
  private readonly sessionStateSubject = new BehaviorSubject<AuthSessionState>(
    this.buildSessionState(),
  );

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly sessionState$ = this.sessionStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.removeLegacyRefreshTokenStorage();
    this.publishSessionState();
  }

  authenticateUser(user: any) {
    return this.login(user);
  }

  getLastUpdated(params?: any) {
    return this.http.get(
      environment.api.url +
      `ledger/lastUpdated?ulb=${params?.ulb ?? ''}&state=${params?.state ?? ''}`,
    );
  }

  getCityData(ulbId: any) {
    return this.http.get(
      environment.api.url + `all-dashboard/people-information?type=ulb&ulb=${ulbId}`,
    );
  }

  login(user: any) {
    return this.http
      .post(this.loginUrl, user, {
        withCredentials: true,
      })
      .pipe(
        map((response: any) => {
          this.applyAuthResponse(response);
          return response;
        }),
      );
  }

  signin(user: any) {
    return this.login(user);
  }

  refreshToken() {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.isRefreshing = true;
    this.publishSessionState();

    this.refreshRequest$ = this.http
      .post(this.refreshTokenUrl, {}, { withCredentials: true })
      .pipe(
        map((response: any) => {
          this.applyAuthResponse(response);
          return response;
        }),
        catchError((error) => {
          this.handleRefreshFailure(error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
          this.isRefreshing = false;
          this.publishSessionState();
        }),
        shareReplay(1),
      );

    return this.refreshRequest$;
  }

  refreshAccessToken() {
    return this.refreshToken();
  }

  restoreSession(): Observable<boolean> {
    if (this.loggedIn()) {
      this.isRestoringSession = false;
      this.publishSessionState();
      return of(true);
    }

    if (this.restoreRequest$) {
      return this.restoreRequest$;
    }

    if (!this.canAttemptSilentRefresh()) {
      this.isRestoringSession = false;
      this.publishSessionState();
      return of(false);
    }

    this.isRestoringSession = true;
    this.publishSessionState();

    this.restoreRequest$ = this.refreshToken().pipe(
      map(() => this.loggedIn()),
      catchError(() => of(false)),
      finalize(() => {
        this.restoreRequest$ = null;
        this.isRestoringSession = false;
        this.publishSessionState();
      }),
      shareReplay(1),
    );

    return this.restoreRequest$;
  }

  initializeSession() {
    return this.restoreSession();
  }

  ensureAuthenticated() {
    if (this.loggedIn()) {
      return of(true);
    }

    if (this.isRestoringSession) {
      return this.waitForAuthReady().pipe(map((state) => state.isAuthenticated));
    }

    if (!this.canAttemptSilentRefresh()) {
      return of(false);
    }

    return this.refreshToken().pipe(
      map(() => this.loggedIn()),
      catchError(() => of(false)),
    );
  }

  waitForAuthReady() {
    return this.sessionState$.pipe(
      filter((state) => state.isReady),
      take(1),
    );
  }

  waitForSessionRestore() {
    if (!this.isRestoringSession) {
      return of(this.buildSessionState());
    }

    return this.sessionState$.pipe(
      filter((state) => state.isReady),
      take(1),
    );
  }

  signup(newUser: any) {
    return this.http.post(environment.api.url + 'register', newUser, {
      withCredentials: true,
    });
  }

  decodeToken() {
    const token = this.getToken();
    return token ? this.helper.decodeToken(token) : null;
  }

  getToken() {
    return this.getAccessToken();
  }

  getAccessToken() {
    return this.accessToken;
  }

  hasAccessToken() {
    return !!this.accessToken;
  }

  loggedIn() {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    return !this.jwtHelper.isTokenExpired(token);
  }

  canAttemptSilentRefresh() {
    return this.hasSessionHint() || !!this.getCurrentUserSnapshot() || this.hasAccessToken();
  }

  storeTokens(authResponse: any) {
    this.applyAuthResponse(authResponse);
  }

  extractAccessToken(authResponse: any) {
    return (
      authResponse?.token ??
      authResponse?.accessToken ??
      authResponse?.access_token ??
      authResponse?.data?.token ??
      authResponse?.data?.accessToken ??
      authResponse?.data?.access_token ??
      null
    );
  }

  extractRefreshToken(authResponse: any) {
    return (
      authResponse?.refreshToken ??
      authResponse?.refresh_token ??
      authResponse?.data?.refreshToken ??
      authResponse?.data?.refresh_token
    );
  }

  extractUser(authResponse: any): IUserLoggedInDetails | null {
    return authResponse?.user ?? authResponse?.data?.user ?? null;
  }

  isRefreshRequest(url: string) {
    return this.isUrlMatch(url, this.refreshTokenUrl);
  }

  isLoginRequest(url: string) {
    return this.isUrlMatch(url, this.loginUrl);
  }

  isLogoutRequest(url: string) {
    return this.isUrlMatch(url, this.logoutUrl);
  }

  isAuthRequest(url: string) {
    return (
      this.isLoginRequest(url) ||
      this.isRefreshRequest(url) ||
      this.isLogoutRequest(url)
    );
  }

  isApiRequest(url: string) {
    return [environment.api.url, environment.api.url2, environment.api.url3].some(
      (baseUrl) => !!baseUrl && url.startsWith(baseUrl),
    );
  }

  shouldAttachAccessToken(url: string) {
    return this.isApiRequest(url) && !this.isAuthRequest(url);
  }

  shouldSendCredentials(url: string) {
    return this.isApiRequest(url);
  }

  verifyCaptcha(recaptcha: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.api.url}captcha_validate`,
      {
        recaptcha,
      },
    );
  }

  logout() {
    const request$ = this.http
      .post(this.logoutUrl, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.clearLocalStorage()),
        shareReplay(1),
      );

    request$.subscribe({
      next: () => { },
      error: () => { },
    });

    return request$;
  }

  otpSignIn(body: any) {
    return this.http.post(`${environment.api.url2}auth/sendOtp`, body, {
      withCredentials: true,
    });
  }

  otpVerify(body: any) {
    return this.http.post(`${environment.api.url2}auth/verifyOtp`, body, {
      withCredentials: true,
    });
  }

  clearLocalStorage(excludeKeys = ['userInfo']) {
    this.clearAccessToken();

    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      const shouldExclude = excludeKeys.some((exclude) => key === exclude);
      if (!shouldExclude) {
        localStorage.removeItem(key);
      }
    });

    localStorage.removeItem(this.accessTokenStorageKey);
    localStorage.removeItem(this.sessionHintStorageKey);
    sessionStorage.removeItem('sessionID');
    this.loginLogoutCheck.next(false);
    this.currentUserSubject.next(null);
    this.isRefreshing = false;
    this.isRestoringSession = false;
    this.publishSessionState();
  }

  clearLocalStorageKey(key: string) {
    localStorage.removeItem(key);
    if (key === 'userData') {
      this.currentUserSubject.next(null);
      this.publishSessionState();
    }
  }

  setCurrentUser(user: IUserLoggedInDetails | null) {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem(this.sessionHintStorageKey, 'true');
    } else {
      localStorage.removeItem('userData');
    }

    this.currentUserSubject.next(user);
    this.publishSessionState();
  }

  getCurrentUserSnapshot() {
    return this.currentUserSubject.getValue();
  }

  public sendOtp(email: string) {
    if (!email) throw new Error('Email is mandatory!');

    return this.http.post(`${environment.api.url2}email/sendOtp`, { email });
  }

  public verifyOtp(email: string, otp: string) {
    if (!email || !otp) throw new Error('Email or OTP is missing!');

    return this.http.post(`${environment.api.url2}email/verifyOtp`, {
      email,
      otp,
    });
  }

  private applyAuthResponse(authResponse: any) {
    const accessToken = this.extractAccessToken(authResponse);
    const currentUser = this.extractUser(authResponse) ?? this.getCurrentUserSnapshot();

    this.accessToken = accessToken || null;

    if (this.accessToken) {
      localStorage.setItem(this.accessTokenStorageKey, this.accessToken);
      localStorage.setItem(this.sessionHintStorageKey, 'true');
    } else {
      localStorage.removeItem(this.accessTokenStorageKey);
    }

    if (currentUser) {
      localStorage.setItem('userData', JSON.stringify(currentUser));
    }

    this.currentUserSubject.next(currentUser);
    this.removeLegacyRefreshTokenStorage();
    this.publishSessionState();
  }

  private handleRefreshFailure(error: any) {
    if ([401, 403, 440, 441].includes(error?.status)) {
      this.clearLocalStorage();
      return;
    }

    this.clearAccessToken();
  }

  private readStoredUser(): IUserLoggedInDetails | null {
    try {
      const user = localStorage.getItem('userData');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  private buildSessionState(): AuthSessionState {
    return {
      isAuthenticated: this.loggedIn(),
      isRefreshing: this.isRefreshing,
      isRestoringSession: this.isRestoringSession,
      hasAccessToken: this.hasAccessToken(),
      isReady: !this.isRestoringSession,
      user: this.getCurrentUserSnapshot(),
    };
  }

  private publishSessionState() {
    this.sessionStateSubject.next(this.buildSessionState());
  }

  private clearAccessToken() {
    this.accessToken = null;
    localStorage.removeItem(this.accessTokenStorageKey);
    localStorage.removeItem(this.sessionHintStorageKey);
    sessionStorage.removeItem(this.accessTokenStorageKey);
    this.removeLegacyRefreshTokenStorage();
    this.publishSessionState();
  }

  private readStoredAccessToken() {
    return localStorage.getItem(this.accessTokenStorageKey) || sessionStorage.getItem(this.accessTokenStorageKey);
  }

  private hasSessionHint() {
    return localStorage.getItem(this.sessionHintStorageKey) === 'true';
  }

  private shouldRestoreSessionOnBootstrap() {
    return !this.loggedIn() && (this.hasSessionHint() || !!this.readStoredUser() || !!this.readStoredAccessToken());
  }

  private removeLegacyRefreshTokenStorage() {
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('refresh_token');
  }

  private isUrlMatch(url: string, targetUrl: string) {
    return url === targetUrl || url.endsWith(targetUrl.replace(environment.api.url, ''));
  }
}
