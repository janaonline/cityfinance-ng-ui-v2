import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { OtpAuthService } from '../../core/auth/auth.service';
import { RecaptchaService } from '../../core/services/recaptcha.service';
import { LoginService } from './login.service';

describe('LoginService.signInWithPassword', () => {
  let service: LoginService;
  let authSpy: jasmine.SpyObj<AuthService>;
  let recaptchaSpy: jasmine.SpyObj<RecaptchaService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    recaptchaSpy = jasmine.createSpyObj<RecaptchaService>('RecaptchaService', [
      'execute',
      'loadScript',
      'showBadge',
      'hideBadge',
      'reset',
      'teardown',
    ]);
    const otpAuthSpy = jasmine.createSpyObj<OtpAuthService>('OtpAuthService', ['sendOtp', 'verifyOtp']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        { provide: AuthService, useValue: authSpy },
        { provide: OtpAuthService, useValue: otpAuthSpy },
        { provide: RecaptchaService, useValue: recaptchaSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(LoginService);
  });

  it('logs in with the token from the first successful recaptcha attempt', (done) => {
    recaptchaSpy.execute.and.returnValue(of('token-1'));
    authSpy.login.and.returnValue(of({ success: true }));

    service.signInWithPassword('100001', 'secret', '16thFC').subscribe(() => {
      expect(recaptchaSpy.execute).toHaveBeenCalledTimes(1);
      expect(authSpy.login).toHaveBeenCalledWith({
        identifier: '100001',
        password: 'secret',
        type: '16thFC',
        recaptchaToken: 'token-1',
      });
      done();
    });
  });

  it('silently retries once when the first recaptcha attempt errors, and logs in with the second token', (done) => {
    let call = 0;
    recaptchaSpy.execute.and.callFake(() => {
      call++;
      return call === 1 ? throwError(() => new Error('blank token')) : of('token-2');
    });
    authSpy.login.and.returnValue(of({ success: true }));

    service.signInWithPassword('100001', 'secret', '16thFC').subscribe(() => {
      expect(recaptchaSpy.execute).toHaveBeenCalledTimes(2);
      expect(authSpy.login).toHaveBeenCalledTimes(1);
      expect(authSpy.login).toHaveBeenCalledWith(jasmine.objectContaining({ recaptchaToken: 'token-2' }));
      done();
    });
  });

  it('gives up and errors without ever calling login when recaptcha fails twice in a row', (done) => {
    recaptchaSpy.execute.and.returnValue(
      throwError(() => new Error('reCAPTCHA verification failed. Please try again.')),
    );
    authSpy.login.and.returnValue(of({ success: true }));

    service.signInWithPassword('100001', 'secret', '16thFC').subscribe({
      next: () => fail('expected an error, not a resolved value'),
      error: (err: Error) => {
        expect(err.message).toBe('reCAPTCHA verification failed. Please try again.');
        expect(recaptchaSpy.execute).toHaveBeenCalledTimes(2);
        expect(authSpy.login).not.toHaveBeenCalled();
        done();
      },
    });
  });
});

describe('LoginService.resetRecaptcha', () => {
  it('delegates to RecaptchaService.reset()', () => {
    const recaptchaSpy = jasmine.createSpyObj<RecaptchaService>('RecaptchaService', [
      'execute',
      'loadScript',
      'showBadge',
      'hideBadge',
      'reset',
      'teardown',
    ]);

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        { provide: AuthService, useValue: jasmine.createSpyObj<AuthService>('AuthService', ['login']) },
        {
          provide: OtpAuthService,
          useValue: jasmine.createSpyObj<OtpAuthService>('OtpAuthService', ['sendOtp', 'verifyOtp']),
        },
        { provide: RecaptchaService, useValue: recaptchaSpy },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']) },
      ],
    });

    TestBed.inject(LoginService).resetRecaptcha();

    expect(recaptchaSpy.reset).toHaveBeenCalledTimes(1);
  });
});
