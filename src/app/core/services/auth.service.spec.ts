import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const loginUrl = `${environment.api.url2}auth/login`;
  const logoutUrl = `${environment.api.url2}auth/logout`;
  const refreshUrl = `${environment.api.url2}auth/refresh`;
  const user = { _id: 'u1', name: 'Test User', role: 'ULB' } as any;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(service.helper, 'isTokenExpired').and.callFake(() => false as any);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('logs in with credentials, stores the access token, and publishes the user', () => {
    const states: any[] = [];
    service.sessionState$.subscribe((state) => states.push(state));

    service.login({ email: 'user@example.com', password: 'secret' }).subscribe((response) => {
      expect(response.token).toBe('token-1');
    });

    const req = httpMock.expectOne(loginUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ token: 'token-1', user });

    expect(service.getAccessToken()).toBe('token-1');
    expect(localStorage.getItem('id_token')).toBe('token-1');
    expect(localStorage.getItem('auth_session_hint')).toBe('true');
    expect(service.getCurrentUserSnapshot()).toEqual(user);
    expect(states[states.length - 1]).toEqual(
      jasmine.objectContaining({
        isAuthenticated: true,
        hasAccessToken: true,
        user,
      }),
    );
  });

  it('extracts access tokens and users from supported response shapes', () => {
    expect(service.extractAccessToken({ token: 'a' })).toBe('a');
    expect(service.extractAccessToken({ accessToken: 'b' })).toBe('b');
    expect(service.extractAccessToken({ access_token: 'c' })).toBe('c');
    expect(service.extractAccessToken({ data: { token: 'd' } })).toBe('d');
    expect(service.extractAccessToken({ data: { accessToken: 'e' } })).toBe('e');
    expect(service.extractAccessToken({ data: { access_token: 'f' } })).toBe('f');
    expect(service.extractAccessToken({})).toBeNull();
    expect(service.extractRefreshToken({ refreshToken: 'refresh' })).toBe('refresh');
    expect(service.extractRefreshToken({ data: { refresh_token: 'legacy-refresh' } })).toBe(
      'legacy-refresh',
    );
    expect(service.extractUser({ data: { user } })).toEqual(user);
  });

  it('refreshes once for concurrent subscribers and resets refreshing state when complete', () => {
    const received: any[] = [];

    service.refreshToken().subscribe((value) => received.push(value));
    service.refreshAccessToken().subscribe((value) => received.push(value));

    const req = httpMock.expectOne(refreshUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ accessToken: 'fresh-token', user });

    expect(received.length).toBe(2);
    expect(service.getToken()).toBe('fresh-token');
    expect(service.hasAccessToken()).toBeTrue();
  });

  it('clears local auth state for authorization refresh failures', () => {
    service.storeTokens({ token: 'stale-token', user });

    service.refreshToken().subscribe({
      error: (error) => expect(error.status).toBe(401),
    });

    httpMock.expectOne(refreshUrl).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(service.getAccessToken()).toBeNull();
    expect(service.getCurrentUserSnapshot()).toBeNull();
    expect(localStorage.getItem('auth_session_hint')).toBeNull();
  });

  it('keeps the user but removes the access token for non-auth refresh failures', () => {
    service.storeTokens({ token: 'stale-token', user });

    service.refreshToken().subscribe({
      error: (error) => expect(error.status).toBe(500),
    });

    httpMock.expectOne(refreshUrl).flush({}, { status: 500, statusText: 'Server error' });

    expect(service.getAccessToken()).toBeNull();
    expect(service.getCurrentUserSnapshot()).toEqual(user);
  });

  it('restores a session from a silent refresh when a session hint exists', () => {
    localStorage.setItem('auth_session_hint', 'true');

    service.restoreSession().subscribe((restored) => expect(restored).toBeTrue());

    httpMock.expectOne(refreshUrl).flush({ token: 'restored-token', user });

    expect(service.loggedIn()).toBeTrue();
  });

  it('does not attempt session restore when there is no hint, user, or token', (done) => {
    service.restoreSession().subscribe((restored) => {
      expect(restored).toBeFalse();
      done();
    });
  });

  it('ensures authentication from an existing valid token', (done) => {
    service.storeTokens({ token: 'existing-token', user });

    service.ensureAuthenticated().subscribe((isAuthenticated) => {
      expect(isAuthenticated).toBeTrue();
      done();
    });
  });

  it('returns false from ensureAuthenticated when silent refresh is unavailable', (done) => {
    service.ensureAuthenticated().subscribe((isAuthenticated) => {
      expect(isAuthenticated).toBeFalse();
      done();
    });
  });

  it('waits for session readiness while a restore is in progress', fakeAsync(() => {
    localStorage.setItem('auth_session_hint', 'true');

    let readyState: any;
    service.restoreSession().subscribe();
    service.waitForAuthReady().subscribe((state) => (readyState = state));

    httpMock.expectOne(refreshUrl).flush({ token: 'ready-token', user });
    tick();

    expect(readyState).toEqual(jasmine.objectContaining({ isReady: true, user }));
  }));

  it('classifies auth and API URLs correctly', () => {
    expect(service.isLoginRequest(loginUrl)).toBeTrue();
    expect(service.isRefreshRequest(refreshUrl)).toBeTrue();
    expect(service.isLogoutRequest(logoutUrl)).toBeTrue();
    expect(service.isAuthRequest(loginUrl)).toBeTrue();
    expect(service.isApiRequest(`${environment.api.url}state`)).toBeTrue();
    expect(service.isApiRequest('https://example.com/state')).toBeFalse();
    expect(service.shouldAttachAccessToken(`${environment.api.url}state`)).toBeTrue();
    expect(service.shouldAttachAccessToken(loginUrl)).toBeFalse();
    expect(service.shouldSendCredentials(`${environment.api.url3}digitization`)).toBeTrue();
  });

  it('clears local storage while preserving excluded keys and publishing logout state', () => {
    const loginLogoutValues: boolean[] = [];
    service.loginLogoutCheck.subscribe((value) => loginLogoutValues.push(value));
    service.storeTokens({ token: 'token-1', user });
    localStorage.setItem('userInfo', 'keep');
    localStorage.setItem('temporary', 'remove');
    sessionStorage.setItem('sessionID', 'session');

    service.clearLocalStorage();

    expect(localStorage.getItem('userInfo')).toBe('keep');
    expect(localStorage.getItem('temporary')).toBeNull();
    expect(sessionStorage.getItem('sessionID')).toBeNull();
    expect(loginLogoutValues).toEqual([false]);
    expect(service.getCurrentUserSnapshot()).toBeNull();
  });

  it('updates and clears the current user snapshot', () => {
    service.setCurrentUser(user);
    expect(JSON.parse(localStorage.getItem('userData') || '{}')).toEqual(user);
    expect(service.getCurrentUserSnapshot()).toEqual(user);

    service.clearLocalStorageKey('userData');
    expect(service.getCurrentUserSnapshot()).toBeNull();
  });

  it('validates OTP helper inputs before making API calls', () => {
    expect(() => service.sendOtp('')).toThrowError('Email is mandatory!');
    expect(() => service.verifyOtp('', '123456')).toThrowError('Email or OTP is missing!');
    expect(() => service.verifyOtp('user@example.com', '')).toThrowError('Email or OTP is missing!');
  });

  it('calls OTP, captcha, signup, and profile endpoints with the expected payloads', () => {
    service.verifyCaptcha('captcha-token').subscribe();
    httpMock.expectOne(`${environment.api.url}captcha_validate`).flush({ success: true });

    service.signup({ email: 'new@example.com' }).subscribe();
    expect(httpMock.expectOne(`${environment.api.url}register`).request.withCredentials).toBeTrue();

    service.sendOtp('user@example.com').subscribe();
    httpMock
      .expectOne(`${environment.api.url2}email/sendOtp`)
      .flush({ success: true, message: 'sent' });

    service.verifyOtp('user@example.com', '123456').subscribe();
    httpMock
      .expectOne(`${environment.api.url2}email/verifyOtp`)
      .flush({ success: true, message: 'verified' });

    service.otpSignIn({ mobile: '9999999999' }).subscribe();
    expect(httpMock.expectOne(`${environment.api.url2}auth/sendOtp`).request.withCredentials).toBeTrue();

    service.otpVerify({ mobile: '9999999999', otp: '123456' }).subscribe();
    httpMock.expectOne(`${environment.api.url2}auth/verifyOtp`).flush({ token: 'otp-token', user });
    expect(service.getAccessToken()).toBe('otp-token');
  });

  it('logs out through the server and clears state even if the server errors', fakeAsync(() => {
    service.storeTokens({ token: 'token-1', user });

    service.logout().subscribe((value) => expect(value).toBeNull());
    httpMock.expectOne(logoutUrl).flush(null);
    tick();
    expect(service.getAccessToken()).toBeNull();

    service.storeTokens({ token: 'token-2', user });
    service.logout().subscribe();
    httpMock.expectOne(logoutUrl).flush({}, { status: 500, statusText: 'Server error' });
    tick();
    expect(service.getAccessToken()).toBeNull();
  }));
});
