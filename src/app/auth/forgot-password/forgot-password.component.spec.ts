import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { OtpAuthService } from '../../core/auth/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

const mockSendOtpResponse = {
  success: true as const,
  message: 'OTP sent',
  mobile: '****1234',
  email: 'u***@example.com',
};

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authSpy: jasmine.SpyObj<OtpAuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('OtpAuthService', ['sendOtp', 'resetPassword']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ForgotPasswordComponent], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} },
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
    it('should start on the identify step', () => {
      expect(component.currentStep()).toBe('identify');
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
        imports: [HttpClientTestingModule, RouterTestingModule, ForgotPasswordComponent], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} },
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
        imports: [HttpClientTestingModule, RouterTestingModule, ForgotPasswordComponent], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} },
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
        imports: [HttpClientTestingModule, RouterTestingModule, ForgotPasswordComponent], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} },
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
      expect(authSpy.sendOtp).not.toHaveBeenCalled();
    });

    it('should mark form as touched and abort when ULB code is empty', () => {
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: '' });
      component.onContinue();
      expect(authSpy.sendOtp).not.toHaveBeenCalled();
      expect(component.identifyForm.touched).toBeTrue();
    });

    it('should mark form as touched and abort when STATE email is empty', () => {
      component.onRoleChange('STATE');
      component.identifyForm.patchValue({ email: '' });
      component.onContinue();
      expect(authSpy.sendOtp).not.toHaveBeenCalled();
      expect(component.identifyForm.touched).toBeTrue();
    });

    it('should call sendOtp with census code for ULB role', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'ABC123' });

      component.onContinue();
      tick();

      expect(authSpy.sendOtp).toHaveBeenCalledWith('ABC123', 'forgot-password');
    }));

    it('should call sendOtp with email for STATE role', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.onRoleChange('STATE');
      component.identifyForm.patchValue({ email: 'state@example.com' });

      component.onContinue();
      tick();

      expect(authSpy.sendOtp).toHaveBeenCalledWith('state@example.com', 'forgot-password');
    }));

    it('should advance to reset step on success', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'ABC123' });

      component.onContinue();
      tick();

      expect(component.currentStep()).toBe('reset');
      expect(component.otpSent()).toBeTrue();
    }));

    it('should populate identifiedUser with masked contact info on success', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'ABC123' });

      component.onContinue();
      tick();

      const user = component.identifiedUser();
      expect(user?.role).toBe('ULB');
      expect(user?.maskedMobile).toBe('****1234');
      expect(user?.maskedEmail).toBe('u***@example.com');
      expect(user?.code).toBe('ABC123');
    }));

    it('should not set code on identifiedUser for non-ULB roles', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.onRoleChange('STATE');
      component.identifyForm.patchValue({ email: 'state@example.com' });

      component.onContinue();
      tick();

      expect(component.identifiedUser()?.code).toBeUndefined();
    }));

    it('should set identifyError and stay on identify step on failure', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(throwError(() => ({ error: { message: 'User not found' } })));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'INVALID' });

      component.onContinue();
      tick();

      expect(component.identifyError()).toBe('User not found');
      expect(component.currentStep()).toBe('identify');
    }));

    it('should set a generic error when server response has no message', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(throwError(() => ({})));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'INVALID' });

      component.onContinue();
      tick();

      expect(component.identifyError()).toBe('Something went wrong. Please try again.');
    }));

    it('should reset isSubmitting to false after success', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'ABC123' });

      component.onContinue();
      tick();

      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should reset isSubmitting to false after error', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(throwError(() => ({})));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'BAD' });

      component.onContinue();
      tick();

      expect(component.isSubmitting()).toBeFalse();
    }));
  });

  describe('onResetPassword', () => {
    beforeEach(fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'ABC123' });
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
      component.resetForm.patchValue({ otp: '1234', newPassword: 'pass123', confirmPassword: 'pass123' });
      component.isSubmitting.set(true);
      component.onResetPassword();
      expect(authSpy.resetPassword).not.toHaveBeenCalled();
    });

    it('should call resetPassword with the correct payload', fakeAsync(() => {
      authSpy.resetPassword.and.returnValue(of({ success: true as const, message: 'Reset OK' }));
      component.resetForm.patchValue({ otp: '1234', newPassword: 'pass123', confirmPassword: 'pass123' });

      component.onResetPassword();
      tick();

      expect(authSpy.resetPassword).toHaveBeenCalledWith({
        identifier: 'ABC123',
        otp: '1234',
        newPassword: 'pass123',
        confirmPassword: 'pass123',
      });
    }));

    it('should advance to success step on success', fakeAsync(() => {
      authSpy.resetPassword.and.returnValue(of({ success: true as const, message: 'Reset OK' }));
      component.resetForm.patchValue({ otp: '1234', newPassword: 'pass123', confirmPassword: 'pass123' });

      component.onResetPassword();
      tick();

      expect(component.currentStep()).toBe('success');
    }));

    it('should set resetError and stay on reset step on failure', fakeAsync(() => {
      authSpy.resetPassword.and.returnValue(throwError(() => ({ error: { message: 'Invalid OTP' } })));
      component.resetForm.patchValue({ otp: '9999', newPassword: 'pass123', confirmPassword: 'pass123' });

      component.onResetPassword();
      tick();

      expect(component.resetError()).toBe('Invalid OTP');
      expect(component.currentStep()).toBe('reset');
    }));

    it('should reset isSubmitting after success', fakeAsync(() => {
      authSpy.resetPassword.and.returnValue(of({ success: true as const, message: 'OK' }));
      component.resetForm.patchValue({ otp: '1234', newPassword: 'pass123', confirmPassword: 'pass123' });

      component.onResetPassword();
      tick();

      expect(component.isSubmitting()).toBeFalse();
    }));
  });

  describe('onResendOtp', () => {
    beforeEach(fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.selectedRole.set('ULB');
      component.identifyForm.patchValue({ code: 'ABC123' });
      component.onContinue();
      tick();
      authSpy.sendOtp.calls.reset();
    }));

    it('should not resend while countdown is active', () => {
      component.resendSeconds.set(15);
      component.onResendOtp();
      expect(authSpy.sendOtp).not.toHaveBeenCalled();
    });

    it('should not resend while already submitting', () => {
      component.resendSeconds.set(0);
      component.isSubmitting.set(true);
      component.onResendOtp();
      expect(authSpy.sendOtp).not.toHaveBeenCalled();
    });

    it('should call sendOtp when countdown is 0', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.resendSeconds.set(0);

      component.onResendOtp();
      tick();

      expect(authSpy.sendOtp).toHaveBeenCalledWith('ABC123', 'forgot-password');
    }));

    it('should mark otpSent true and restart timer on success', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of(mockSendOtpResponse));
      component.resendSeconds.set(0);
      component.otpSent.set(false);

      component.onResendOtp();
      tick();

      expect(component.otpSent()).toBeTrue();
      expect(component.resendSeconds()).toBeGreaterThan(0);
    }));

    it('should update maskedMobile on resend success', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(of({ ...mockSendOtpResponse, mobile: '****5678' }));
      component.resendSeconds.set(0);

      component.onResendOtp();
      tick();

      expect(component.identifiedUser()?.maskedMobile).toBe('****5678');
    }));

    it('should set resetError on resend failure', fakeAsync(() => {
      authSpy.sendOtp.and.returnValue(throwError(() => ({ error: { message: 'Rate limited' } })));
      component.resendSeconds.set(0);

      component.onResendOtp();
      tick();

      expect(component.resetError()).toBe('Rate limited');
    }));
  });

  describe('onBackToIdentify', () => {
    it('should go back to identify step', () => {
      component.currentStep.set('reset');
      component.onBackToIdentify();
      expect(component.currentStep()).toBe('identify');
    });

    it('should reset the resetForm fields', () => {
      component.resetForm.patchValue({ otp: '1234', newPassword: 'abc', confirmPassword: 'abc' });
      component.onBackToIdentify();
      expect(component.resetForm.controls.otp.value).toBe('');
    });

    it('should clear otpSent and resetError signals', () => {
      component.otpSent.set(true);
      component.resetError.set('some error');
      component.onBackToIdentify();
      expect(component.otpSent()).toBeFalse();
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
      component.resetForm.patchValue({ otp: '1234', newPassword: 'myPass', confirmPassword: 'other' });
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
