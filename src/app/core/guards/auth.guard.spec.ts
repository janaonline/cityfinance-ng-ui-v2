import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuthService, AuthSessionState } from '../services/auth.service';
import { authGuard, createAuthGuard } from './auth.guard';

const READY_UNAUTHENTICATED: AuthSessionState = {
  isAuthenticated: false,
  isRefreshing: false,
  isRestoringSession: false,
  hasAccessToken: false,
  isReady: true,
  user: null,
};

const READY_AUTHENTICATED: AuthSessionState = {
  ...READY_UNAUTHENTICATED,
  isAuthenticated: true,
};

function buildState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

function runGuard(guard: CanActivateFn, url = '/xvifc/year'): unknown {
  return TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, buildState(url)));
}

describe('authGuard / createAuthGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'loggedIn',
      'waitForAuthReady',
      'ensureAuthenticated',
    ]);
    authService.loggedIn.and.returnValue(false);
    authService.waitForAuthReady.and.returnValue(of(READY_UNAUTHENTICATED));
    authService.ensureAuthenticated.and.returnValue(of(false));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }],
    });

    router = TestBed.inject(Router);
  });

  describe('authGuard (default — redirects to /login)', () => {
    it('returns true immediately when already logged in', () => {
      authService.loggedIn.and.returnValue(true);
      expect(runGuard(authGuard)).toBe(true);
    });

    it('returns true after session restore confirms authentication', (done) => {
      authService.waitForAuthReady.and.returnValue(of(READY_AUTHENTICATED));

      const result = runGuard(authGuard);
      (result as ReturnType<typeof of>).subscribe((value: unknown) => {
        expect(value).toBe(true);
        done();
      });
    });

    it('redirects to /login when unauthenticated', (done) => {
      const result = runGuard(authGuard, '/xvifc/year');
      (result as ReturnType<typeof of>).subscribe((value: unknown) => {
        const tree = value as UrlTree;
        expect(tree.toString()).toContain('/login');
        done();
      });
    });

    it('saves return URL to sessionStorage before redirecting', (done) => {
      spyOn(sessionStorage, 'setItem');
      const result = runGuard(authGuard, '/some/protected/page');
      (result as ReturnType<typeof of>).subscribe(() => {
        expect(sessionStorage.setItem).toHaveBeenCalledWith(
          'postLoginNavigationV2',
          '/some/protected/page',
        );
        done();
      });
    });

    it('does not save return URL when it already contains "login"', (done) => {
      spyOn(sessionStorage, 'setItem');
      const result = runGuard(authGuard, '/auth/login/16thFC');
      (result as ReturnType<typeof of>).subscribe(() => {
        expect(sessionStorage.setItem).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('createAuthGuard — XVI-FC variant (redirects to /auth/login/16thFC)', () => {
    const xvifcGuard = createAuthGuard(['/auth', 'login', '16thFC']);

    it('returns true immediately when already logged in', () => {
      authService.loggedIn.and.returnValue(true);
      expect(runGuard(xvifcGuard)).toBe(true);
    });

    it('redirects to /auth/login/16thFC when unauthenticated', (done) => {
      const result = runGuard(xvifcGuard, '/xvifc/year');
      (result as ReturnType<typeof of>).subscribe((value: unknown) => {
        const tree = value as UrlTree;
        expect(router.serializeUrl(tree)).toContain('/auth/login/16thFC');
        done();
      });
    });

    it('does not redirect to /login (only to /auth/login/16thFC)', (done) => {
      const result = runGuard(xvifcGuard, '/xvifc/year');
      (result as ReturnType<typeof of>).subscribe((value: unknown) => {
        const serialized = router.serializeUrl(value as UrlTree);
        expect(serialized).not.toMatch(/^\/login/);
        done();
      });
    });

    it('returns true when session restore confirms authentication', (done) => {
      authService.waitForAuthReady.and.returnValue(of(READY_AUTHENTICATED));

      const result = runGuard(xvifcGuard, '/xvifc/year');
      (result as ReturnType<typeof of>).subscribe((value: unknown) => {
        expect(value).toBe(true);
        done();
      });
    });

    it('redirects on error during auth check', (done) => {
      authService.waitForAuthReady.and.throwError('network error');

      const result = runGuard(xvifcGuard, '/xvifc/year');
      (result as ReturnType<typeof of>).subscribe((value: unknown) => {
        expect(value instanceof UrlTree).toBe(true);
        done();
      });
    });
  });
});
