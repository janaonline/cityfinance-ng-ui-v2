import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { USER_TYPE } from '../../core/models/user/userType';
import { AuthService } from '../../core/services/auth.service';
import { RecaptchaService } from '../../core/services/recaptcha.service';
import { XvifcModuleService } from '../../features/xvi-fc-module/xvi-fc-module.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let recaptchaSpy: jasmine.SpyObj<RecaptchaService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let xvifcSpy: jasmine.SpyObj<XvifcModuleService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'extractUser',
      'getCurrentUserSnapshot',
      'login',
      'otpSignIn',
      'otpVerify',
    ]);
    recaptchaSpy = jasmine.createSpyObj<RecaptchaService>('RecaptchaService', [
      'execute',
      'loadScript',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    xvifcSpy = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', [
      'clearResolvedContext',
    ]);

    routerSpy.navigate.and.resolveTo(true);
    routerSpy.navigateByUrl.and.resolveTo(true);
    authSpy.getCurrentUserSnapshot.and.returnValue(null);
    recaptchaSpy.execute.and.returnValue(of(''));

    await TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule, LoginComponent], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }, 
        provideNoopAnimations(),
        { provide: AuthService, useValue: authSpy },
        { provide: RecaptchaService, useValue: recaptchaSpy },
        { provide: Router, useValue: routerSpy },
        { provide: XvifcModuleService, useValue: xvifcSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({ type: '16thFC' }), paramMap: of({ get: (_: string) => null }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.removeItem('postLoginNavigationV2');
  });

  it('should create and initialize the 16th FC login context', () => {
    expect(component).toBeTruthy();
    expect(component['typeKey']()).toBe('16thFC');
    expect(xvifcSpy.clearResolvedContext).toHaveBeenCalledTimes(1);
  });

  it('should keep the default login type for unsupported query params', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule, LoginComponent], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }, 
        provideNoopAnimations(),
        { provide: AuthService, useValue: authSpy },
        { provide: RecaptchaService, useValue: recaptchaSpy },
        { provide: Router, useValue: routerSpy },
        { provide: XvifcModuleService, useValue: xvifcSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({ type: 'unsupported' }), paramMap: of({ get: (_: string) => null }) } },
      ],
    }).compileComponents();

    const localFixture = TestBed.createComponent(LoginComponent);
    localFixture.detectChanges();

    expect(localFixture.componentInstance['typeKey']()).toBe('15thFC');
  });

  it('should select enabled roles and ignore disabled roles', () => {
    const [ulbRole] = component['roleOptions']();
    const doeRole = component['roleOptions']().find((role) => role.id === 'DOE')!;

    component['selectRole'](ulbRole);
    expect(component['loginForm'].controls.role.value).toBe('ULB');
    expect(component['isRoleSelected']('ULB')).toBeTrue();

    component['selectRole'](doeRole);
    expect(component['loginForm'].controls.role.value).toBe('ULB');
  });

  it('should toggle password visibility', () => {
    expect(component['isPasswordVisible']).toBeFalse();
    component['togglePasswordVisibility']();
    expect(component['isPasswordVisible']).toBeTrue();
  });

  it('should show validation errors only after controls are touched or submitted', () => {
    expect(component['hasControlError']('identifier', 'required')).toBeFalse();

    component['loginForm'].controls.identifier.markAsTouched();

    expect(component['hasControlError']('identifier', 'required')).toBeTrue();
  });

  it('should not submit password login when the form is invalid', () => {
    component['onSubmit']();

    expect(authSpy.login).not.toHaveBeenCalled();
    expect(component['loginForm'].touched).toBeTrue();
  });

  it('should submit password login with trimmed identifier and current login type', fakeAsync(() => {
    authSpy.login.and.returnValue(of({ user: { role: USER_TYPE.ULB } }));
    authSpy.extractUser.and.returnValue({ role: USER_TYPE.ULB } as any);
    component['loginForm'].setValue({
      role: 'ULB',
      identifier: '  ulb@example.com  ',
      password: 'secret1',
      otp: '',
    });

    component['onSubmit']();
    tick();

    expect(authSpy.login).toHaveBeenCalledWith({
      identifier: 'ulb@example.com',
      password: 'secret1',
      type: '16thFC',
      recaptchaToken: '',
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/xvifc/year'], { replaceUrl: true });
  }));

  it('should navigate XVI FC reviewers to the admin review area after password login', fakeAsync(() => {
    component['typeKey'].set('XVIFC');
    authSpy.login.and.returnValue(of({ user: { role: USER_TYPE.XVIFC } }));
    authSpy.extractUser.and.returnValue({ role: USER_TYPE.XVIFC } as any);
    component['loginForm'].setValue({
      role: 'MOHUA',
      identifier: 'mohua@example.com',
      password: 'secret1',
      otp: '',
    });

    component['onSubmit']();
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/xvi-fc-review'], { replaceUrl: true });
  }));

  it('should honor stored post-login navigation before role-based redirects', fakeAsync(() => {
    component['typeKey'].set('XVIFC');
    sessionStorage.setItem('postLoginNavigationV2', '/saved/path');
    authSpy.login.and.returnValue(of({ user: { role: USER_TYPE.ULB } }));
    authSpy.extractUser.and.returnValue({ role: USER_TYPE.ULB } as any);
    component['loginForm'].setValue({
      role: 'ULB',
      identifier: '123456',
      password: 'secret1',
      otp: '',
    });

    component['onSubmit']();
    tick();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/saved/path', { replaceUrl: true });
    expect(sessionStorage.getItem('postLoginNavigationV2')).toBeNull();
  }));

  it('should show an API error when password login fails', fakeAsync(() => {
    authSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Bad credentials' } })));
    component['loginForm'].setValue({
      role: 'ULB',
      identifier: '123456',
      password: 'secret1',
      otp: '',
    });

    component['onSubmit']();
    tick();

    expect(component['errorMessage']()).toBe('Bad credentials');
    expect(component['isSubmitting']()).toBeFalse();
  }));

  it('should navigate to forgot password and signup with the current type', () => {
    component.onForgotPassword();
    component.onSignup();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/forgot-password'], {
      queryParams: { type: '16thFC' },
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/signup'], {
      queryParams: { type: '16thFC', role: 'ULB' },
    });
  });

  it('should require an identifier before starting OTP login', () => {
    component['startOtpFlow']();

    expect(authSpy.otpSignIn).not.toHaveBeenCalled();
    expect(component['errorMessage']()).toBe('Please enter your Email or Census Code first.');
  });

  it('should start OTP mode and countdown after OTP is sent', fakeAsync(() => {
    authSpy.otpSignIn.and.returnValue(of({ mobile: '****1234', email: 'u***@example.com' }));
    component['loginForm'].controls.identifier.setValue('  123456  ');

    component['startOtpFlow']();
    tick();

    expect(authSpy.otpSignIn).toHaveBeenCalledWith({ identifier: '123456' });
    expect(component['isOtpLogin']()).toBeTrue();
    expect(component['otpCountdownActive']()).toBeTrue();
    expect(component['loginForm'].controls.password.hasValidator).toBeDefined();
    expect(component['loginForm'].controls.otp.hasError('required')).toBeTrue();

    discardPeriodicTasks();
  }));

  it('should submit OTP and navigate after verification', fakeAsync(() => {
    authSpy.otpVerify.and.returnValue(of({ user: { role: USER_TYPE.STATE } }));
    authSpy.extractUser.and.returnValue({ role: USER_TYPE.STATE } as any);
    component['loginForm'].controls.identifier.setValue('state@example.com');
    component['loginForm'].controls.otp.setValidators([
      (control) => (control.value === '1234' ? null : { invalid: true }),
    ]);
    component['loginForm'].controls.otp.setValue('1234');

    component['submitOtp']();
    tick();

    expect(authSpy.otpVerify).toHaveBeenCalledWith({
      identifier: 'state@example.com',
      otp: '1234',
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/xvifc/year'], { replaceUrl: true });
  }));

  it('should switch back from OTP login to password login', fakeAsync(() => {
    authSpy.otpSignIn.and.returnValue(of({ mobile: '****1234', email: 'u***@example.com' }));
    component['loginForm'].controls.identifier.setValue('123456');
    component['startOtpFlow']();
    tick();

    component['switchToPassword']();

    expect(component['isOtpLogin']()).toBeFalse();
    expect(component['otpCountdownActive']()).toBeFalse();
    expect(component['loginForm'].controls.otp.value).toBe('');

    discardPeriodicTasks();
  }));
});
