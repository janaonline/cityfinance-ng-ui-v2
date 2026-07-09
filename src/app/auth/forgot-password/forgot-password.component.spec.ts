import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { OtpAuthService } from '../../core/auth/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

const MOCK_PASSWORD = 'Test@1234';
const MOCK_PASSWORD_ALT = 'Other@1234';

const mockSendOtpResponse = {
  maskedMobile: '****1234',
  maskedEmail: 'u***@example.com',
};

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authSpy: jasmine.SpyObj<OtpAuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('OtpAuthService', ['sendForgotPasswordOtp', 'resetPassword']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ForgotPasswordComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: OtpAuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start on the REQUEST_OTP step', () => {
      expect(component.currentStep()).toBe('REQUEST_OTP');
    });

    it('should default to ULB role', () => {
      expect(component.selectedRole()).toBe('ULB');
    });

    it('should not be submitting', () => {
      expect(component.isSubmitting()).toBeFalse();
    });

    it('should have null typeKey when no query param', () => {
      expect(component.typeKey()).toBeNull();
    });
  });

  describe('identifyTitle computed', () => {
    it('should return ULB title for ULB role', () => {
      component.selectedRole.set('ULB');
      expect(component.identifyTitle()).toBe('Verify your ULB account');
    });

    it('should return STATE title for STATE role', () => {
      component.selectedRole.set('STATE');
      expect(component.identifyTitle()).toBe('Verify your State account');
    });

    it('should return MoHUA title for MOHUA role', () => {
      component.selectedRole.set('MOHUA');
      expect(component.identifyTitle()).toBe('Verify your MoHUA account');
    });
  });

  describe('ngOnInit – query params', () => {
    it('should set typeKey to "16thFC" when type=16thFC', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, RouterTestingModule, ForgotPasswordComponent],
        providers: [
          { provide: MatDialogRef, useValue: { close: () => undefined } },
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: OtpAuthService, useValue: authSpy },
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: { queryParams: of({ type: '16thFC' }) } },
        ],
      }).compileComponents();
      const fix = TestBed.createComponent(ForgotPasswordComponent);
      fix.detectChanges();
      expect(fix.componentInstance.typeKey()).toBe('16thFC');
    });

    it('should set typeKey to "15thFC" when type=15thFC', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, RouterTestingModule, ForgotPasswordComponent],
        providers: [
          { provide: MatDialogRef, useValue: { close: () => undefined } },
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: OtpAuthService, useValue: authSpy },
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: { queryParams: of({ type: '15thFC' }) } },
        ],
      }).compileComponents();
      const fix = TestBed.createComponent(ForgotPasswordComponent);
      fix.detectChanges();
      expect(fix.componentInstance.typeKey()).toBe('15thFC');
    });

    it('should set typeKey to null for unknown type values', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, RouterTestingModule, ForgotPasswordComponent],
        providers: [
          { provide: MatDialogRef, useValue: { close: () => undefined } },
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: OtpAuthService, useValue: authSpy },
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: { queryParams: of({ type: 'unknown' }) } },
        ],
      }).compileComponents();
      const fix = TestBed.createComponent(ForgotPasswordComponent);
      fix.detectChanges();
      expect(fix.componentInstance.typeKey()).toBeNull();
    });
  });

  describe('onRoleChange', () => {
    it('should update selectedRole signal', () => {
      component.onRoleChange('STATE');
      expect(component.selectedRole()).toBe('STATE');
    });

    it('should reset code and email fields', () => {
      component.identifyForm.patchValue({ code: 'ABC123', email: 'test@test.com' });
      component.onRoleChange('STATE');
      expect(component.identifyForm.controls.code.value).toBe('');
      expect(component.identifyForm.controls.email.value).toBe('');
    });

    it('should mark form as pristine and untouched', () => {
      component.identifyForm.markAsDirty();
      component.identifyForm.markAsTouched();
      component.onRoleChange('ULB');
      expect(component.identifyForm.pristine).toBeTrue();
      expect(component.identifyForm.untouched).toBeTrue();
    });
  });

  describe('onBackToLogin', () => {
    it('should navigate to /auth/login with empty queryParams when no typeKey', () => {
      component.typeKey.set(null);
      component.onBackToLogin();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: {} });
    });

    it('should navigate to /auth/login with type queryParam when typeKey is set', () => {
      component.typeKey.set('16thFC');
      component.onBackToLogin();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { type: '16thFC' } });
    });
  });

  describe('onContinue', () => {
    it('should not submit when already submitting', () => {
      component.isSubmitting.set(true);
      component.onContinue();
      expect(authSpy.sendForgotPasswordOtp).not.toHaveBeenCalled();
    });

    it('should mark form as touched and abort when ULB code is empty', () => {
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '' });
      component.onContinue();
      expect(authSpy.sendForgotPasswordOtp).not.toHaveBeenCalled();
      expect(component.identifyForm.touched).toBeTrue();
    });

    it('should mark form as touched and abort when STATE email is empty', () => {
      component.onRoleChange('STATE');
      component.identifyForm.patchValue({ email: '' });
      component.onContinue();
      expect(authSpy.sendForgotPasswordOtp).not.toHaveBeenCalled();
      expect(component.identifyForm.touched).toBeTrue();
    });

    it('should call sendForgotPasswordOtp with census code for ULB role', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });

      component.onContinue();
      tick();

      expect(authSpy.sendForgotPasswordOtp).toHaveBeenCalledWith('123456');
    }));

    it('should call sendForgotPasswordOtp with email for STATE role', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.onRoleChange('STATE');
      component.identifyForm.patchValue({ email: 'state@example.com' });

      component.onContinue();
      tick();

      expect(authSpy.sendForgotPasswordOtp).toHaveBeenCalledWith('state@example.com');
    }));

    it('should advance to RESET_PASSWORD step on success', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });

      component.onContinue();
      tick();

      expect(component.currentStep()).toBe('RESET_PASSWORD');
    }));

    it('should set maskedIdentifier from response on success for ULB', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });

      component.onContinue();
      tick();

      expect(component.selectedRole()).toBe('ULB');
      expect(component.maskedIdentifier()).toBe('****1234');
    }));

    it('should set maskedIdentifier from response on success for STATE', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.onRoleChange('STATE');
      component.identifyForm.patchValue({ email: 'state@example.com' });

      component.onContinue();
      tick();

      expect(component.maskedIdentifier()).toBe('u***@example.com');
    }));

    it('should set requestError and stay on REQUEST_OTP step on failure', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(throwError(() => ({ error: { message: 'User not found' } })));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });

      component.onContinue();
      tick();

      expect(component.requestError()).toBe('Unable to send OTP right now. Please try again.');
      expect(component.currentStep()).toBe('REQUEST_OTP');
    }));

    it('should set a generic error when server response has no message', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(throwError(() => ({})));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });

      component.onContinue();
      tick();

      expect(component.requestError()).toBe('Unable to send OTP right now. Please try again.');
    }));

    it('should reset isSubmitting to false after success', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });

      component.onContinue();
      tick();

      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should reset isSubmitting to false after error', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(throwError(() => ({})));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });

      component.onContinue();
      tick();

      expect(component.isSubmitting()).toBeFalse();
    }));
  });

  describe('onResetPassword', () => {
    beforeEach(fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });
      component.onContinue();
      tick();
    }));

    it('should mark resetForm as touched and abort when form is invalid', () => {
      component.resetForm.patchValue({ otp: '', newPassword: '', confirmPassword: '' });
      component.onResetPassword();
      expect(authSpy.resetPassword).not.toHaveBeenCalled();
      expect(component.resetForm.touched).toBeTrue();
    });

    it('should not submit when already submitting', () => {
      component.resetForm.patchValue({ otp: '1234', newPassword: MOCK_PASSWORD, confirmPassword: MOCK_PASSWORD });
      component.isSubmitting.set(true);
      component.onResetPassword();
      expect(authSpy.resetPassword).not.toHaveBeenCalled();
    });

    it('should call resetPassword with the correct payload', fakeAsync(() => {
      authSpy.resetPassword.and.returnValue(of({ success: true as const, message: 'Reset OK' }));
      component.resetForm.patchValue({ otp: '1234', newPassword: MOCK_PASSWORD, confirmPassword: MOCK_PASSWORD });

      component.onResetPassword();
      tick();

      expect(authSpy.resetPassword).toHaveBeenCalledWith({
        identifier: '123456',
        otp: '1234',
        newPassword: MOCK_PASSWORD,
        confirmPassword: MOCK_PASSWORD,
      });
    }));

    it('should advance to SUCCESS step on success', fakeAsync(() => {
      authSpy.resetPassword.and.returnValue(of({ success: true as const, message: 'Reset OK' }));
      component.resetForm.patchValue({ otp: '1234', newPassword: MOCK_PASSWORD, confirmPassword: MOCK_PASSWORD });

      component.onResetPassword();
      tick();

      expect(component.currentStep()).toBe('SUCCESS');
    }));

    it('should set resetError and stay on RESET_PASSWORD step on failure', fakeAsync(() => {
      authSpy.resetPassword.and.returnValue(throwError(() => ({ error: { message: 'Invalid OTP' } })));
      component.resetForm.patchValue({ otp: '9999', newPassword: MOCK_PASSWORD, confirmPassword: MOCK_PASSWORD });

      component.onResetPassword();
      tick();

      expect(component.resetError()).toBe('Invalid or expired OTP.');
      expect(component.currentStep()).toBe('RESET_PASSWORD');
    }));

    it('should reset isSubmitting after success', fakeAsync(() => {
      authSpy.resetPassword.and.returnValue(of({ success: true as const, message: 'OK' }));
      component.resetForm.patchValue({ otp: '1234', newPassword: MOCK_PASSWORD, confirmPassword: MOCK_PASSWORD });

      component.onResetPassword();
      tick();

      expect(component.isSubmitting()).toBeFalse();
    }));
  });

  describe('onResendOtp', () => {
    beforeEach(fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '123456' });
      component.onContinue();
      tick();
      authSpy.sendForgotPasswordOtp.calls.reset();
    }));

    it('should not resend while countdown is active', () => {
      component.resendSeconds.set(15);
      component.onResendOtp();
      expect(authSpy.sendForgotPasswordOtp).not.toHaveBeenCalled();
    });

    it('should not resend while already submitting', () => {
      component.resendSeconds.set(0);
      component.isSubmitting.set(true);
      component.onResendOtp();
      expect(authSpy.sendForgotPasswordOtp).not.toHaveBeenCalled();
    });

    it('should call sendForgotPasswordOtp when countdown is 0', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.resendSeconds.set(0);

      component.onResendOtp();
      tick();

      expect(authSpy.sendForgotPasswordOtp).toHaveBeenCalledWith('123456');
    }));

    it('should mark otpResent true and restart timer on success', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(of(mockSendOtpResponse));
      component.resendSeconds.set(0);
      component.otpResent.set(false);

      component.onResendOtp();
      tick();

      expect(component.otpResent()).toBeTrue();
      expect(component.resendSeconds()).toBeGreaterThan(0);
    }));

    it('should set resetError on resend failure', fakeAsync(() => {
      authSpy.sendForgotPasswordOtp.and.returnValue(throwError(() => ({ error: { message: 'Rate limited' } })));
      component.resendSeconds.set(0);

      component.onResendOtp();
      tick();

      expect(component.resetError()).toBe('Unable to send OTP right now. Please try again.');
    }));
  });

  describe('onBackToIdentify', () => {
    it('should go back to REQUEST_OTP step', () => {
      component.currentStep.set('RESET_PASSWORD');
      component.onBackToIdentify();
      expect(component.currentStep()).toBe('REQUEST_OTP');
    });

    it('should reset the resetForm fields', () => {
      component.resetForm.patchValue({ otp: '1234', newPassword: 'abc', confirmPassword: 'abc' });
      component.onBackToIdentify();
      expect(component.resetForm.controls.otp.value).toBe('');
    });

    it('should clear otpResent and resetError signals', () => {
      component.otpResent.set(true);
      component.resetError.set('some error');
      component.onBackToIdentify();
      expect(component.otpResent()).toBeFalse();
      expect(component.resetError()).toBe('');
    });
  });

  describe('toggleNewPassword / toggleConfirmPassword', () => {
    it('should toggle showNewPassword', () => {
      expect(component.showNewPassword()).toBeFalse();
      component.toggleNewPassword();
      expect(component.showNewPassword()).toBeTrue();
      component.toggleNewPassword();
      expect(component.showNewPassword()).toBeFalse();
    });

    it('should toggle showConfirmPassword', () => {
      expect(component.showConfirmPassword()).toBeFalse();
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword()).toBeTrue();
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword()).toBeFalse();
    });
  });

  describe('password match validator', () => {
    it('should have no form-level error when passwords match', () => {
      component.resetForm.patchValue({ otp: '1234', newPassword: 'myPass', confirmPassword: 'myPass' });
      expect(component.resetForm.hasError('passwordMismatch')).toBeFalse();
    });

    it('should have passwordMismatch error when passwords differ', () => {
      component.resetForm.patchValue({ otp: '1234', newPassword: 'myPass', confirmPassword: MOCK_PASSWORD_ALT });
      expect(component.resetForm.hasError('passwordMismatch')).toBeTrue();
    });

    it('should not emit passwordMismatch when confirmPassword is empty', () => {
      component.resetForm.patchValue({ newPassword: 'myPass', confirmPassword: '' });
      expect(component.resetForm.hasError('passwordMismatch')).toBeFalse();
    });

    it('should not emit passwordMismatch when newPassword is empty', () => {
      component.resetForm.patchValue({ newPassword: '', confirmPassword: 'myPass' });
      expect(component.resetForm.hasError('passwordMismatch')).toBeFalse();
    });
  });
});
