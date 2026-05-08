import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService as LegacyAuthService } from '../services/auth.service';
import { OtpAuthService } from './auth.service';
import { AuthUser } from './otp.models';

const API = environment.api.url2;

const mockUser: AuthUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  mobile: '9999999999',
  role: 'ULB',
  username: 'testuser',
  sbCode: null,
  censusCode: '123456',
  designation: 'Officer',
  organization: 'City Corp',
  state: 'KA',
  ulb: 'BMP',
  createdBy: null,
  departmentName: 'Finance',
  departmentContactNumber: '080-12345678',
  departmentEmail: 'dept@city.gov',
  address: '123 Main St',
  commissionerName: 'John Doe',
  commissionerEmail: 'john@city.gov',
  commissionerConatactNumber: '9876543210',
  accountantName: 'Jane Doe',
  accountantEmail: 'jane@city.gov',
  accountantConatactNumber: '9876543211',
  status: 'APPROVED',
  rejectReason: '',
  isActive: true,
  isEmailVerified: true,
  isDeleted: false,
  isRegistered: true,
  isVerified2223: false,
  isNodalOfficer: false,
  lastLoginAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockVerifyResponse = { token: 'jwt-token', user: mockUser };

describe('OtpAuthService', () => {
  let service: OtpAuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let legacySpy: jasmine.SpyObj<LegacyAuthService>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    legacySpy = jasmine.createSpyObj('LegacyAuthService', ['storeTokens', 'clearLocalStorage']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} },
        OtpAuthService,
      { provide: Router, useValue: routerSpy },
      { provide: LegacyAuthService, useValue: legacySpy },
      ],
    });

    service = TestBed.inject(OtpAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should not be logged in when localStorage has no token', () => {
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.getToken()).toBeNull();
      expect(service.user()).toBeNull();
    });

    it('should be logged in when a token already exists in localStorage', () => {
      localStorage.setItem('cf_access_token', 'pre-existing-token');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, RouterTestingModule], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} },
          OtpAuthService,
        { provide: Router, useValue: routerSpy },
        { provide: LegacyAuthService, useValue: legacySpy },
        ],
      });
      const svc = TestBed.inject(OtpAuthService);
      expect(svc.isLoggedIn()).toBeTrue();
      expect(svc.getToken()).toBe('pre-existing-token');
    });
  });

  describe('sendOtp', () => {
    it('should POST to auth/sendOtp with identifier and purpose', () => {
      service.sendOtp('test@example.com', 'login').subscribe();

      const req = httpMock.expectOne(`${API}auth/sendOtp`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ identifier: 'test@example.com', purpose: 'login' });
      expect(req.request.withCredentials).toBeTrue();
      req.flush({ success: true, message: 'OTP sent' });
    });

    it('should default purpose to "login" when not specified', () => {
      service.sendOtp('user123').subscribe();

      const req = httpMock.expectOne(`${API}auth/sendOtp`);
      expect(req.request.body.purpose).toBe('login');
      req.flush({ success: true, message: 'OTP sent' });
    });

    it('should accept "forgot-password" as purpose', () => {
      service.sendOtp('user@example.com', 'forgot-password').subscribe();

      const req = httpMock.expectOne(`${API}auth/sendOtp`);
      expect(req.request.body.purpose).toBe('forgot-password');
      req.flush({ success: true, message: 'OTP sent' });
    });
  });

  describe('verifyOtp', () => {
    it('should POST to auth/verifyOtp with identifier and otp only when no requestId', () => {
      service.verifyOtp('user@example.com', '123456').subscribe();

      const req = httpMock.expectOne(`${API}auth/verifyOtp`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ identifier: 'user@example.com', otp: '123456' });
      req.flush(mockVerifyResponse);
    });

    it('should include requestId in body when provided', () => {
      service.verifyOtp('user@example.com', '123456', 'req-id-123').subscribe();

      const req = httpMock.expectOne(`${API}auth/verifyOtp`);
      expect(req.request.body).toEqual({
        identifier: 'user@example.com',
        otp: '123456',
        requestId: 'req-id-123',
      });
      req.flush(mockVerifyResponse);
    });

    it('should store token in localStorage on success', () => {
      service.verifyOtp('user@example.com', '123456').subscribe();

      httpMock.expectOne(`${API}auth/verifyOtp`).flush(mockVerifyResponse);

      expect(localStorage.getItem('cf_access_token')).toBe('jwt-token');
    });

    it('should update isLoggedIn and getToken on success', () => {
      service.verifyOtp('user@example.com', '123456').subscribe();

      httpMock.expectOne(`${API}auth/verifyOtp`).flush(mockVerifyResponse);

      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getToken()).toBe('jwt-token');
    });

    it('should expose the authenticated user via user signal', () => {
      service.verifyOtp('user@example.com', '123456').subscribe();

      httpMock.expectOne(`${API}auth/verifyOtp`).flush(mockVerifyResponse);

      expect(service.user()).toEqual(mockUser);
    });

    it('should call legacyAuth.storeTokens with the response', () => {
      service.verifyOtp('user@example.com', '123456').subscribe();

      httpMock.expectOne(`${API}auth/verifyOtp`).flush(mockVerifyResponse);

      expect(legacySpy.storeTokens).toHaveBeenCalledWith(mockVerifyResponse);
    });
  });

  describe('logout', () => {
    it('should POST to auth/logout', () => {
      service.logout().subscribe();

      const req = httpMock.expectOne(`${API}auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('should send Authorization header when a token is present', fakeAsync(() => {
      service.verifyOtp('user@example.com', '123456').subscribe();
      httpMock.expectOne(`${API}auth/verifyOtp`).flush(mockVerifyResponse);

      service.logout().subscribe();
      const req = httpMock.expectOne(`${API}auth/logout`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
      req.flush(null);
      tick();
    }));

    it('should remove token from localStorage after logout', () => {
      localStorage.setItem('cf_access_token', 'some-token');

      service.logout().subscribe();
      httpMock.expectOne(`${API}auth/logout`).flush(null);

      expect(localStorage.getItem('cf_access_token')).toBeNull();
    });

    it('should reset isLoggedIn to false and getToken to null', fakeAsync(() => {
      service.verifyOtp('user@example.com', '123456').subscribe();
      httpMock.expectOne(`${API}auth/verifyOtp`).flush(mockVerifyResponse);

      service.logout().subscribe();
      httpMock.expectOne(`${API}auth/logout`).flush(null);
      tick();

      expect(service.isLoggedIn()).toBeFalse();
      expect(service.getToken()).toBeNull();
    }));

    it('should navigate to /login after logout', fakeAsync(() => {
      service.logout().subscribe();
      httpMock.expectOne(`${API}auth/logout`).flush(null);
      tick();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    }));

    it('should call legacyAuth.clearLocalStorage', fakeAsync(() => {
      service.logout().subscribe();
      httpMock.expectOne(`${API}auth/logout`).flush(null);
      tick();

      expect(legacySpy.clearLocalStorage).toHaveBeenCalled();
    }));

    it('should still clear state and navigate even when the server returns an error', fakeAsync(() => {
      service.logout().subscribe();
      httpMock.expectOne(`${API}auth/logout`).error(new ErrorEvent('Network error'));
      tick();

      expect(localStorage.getItem('cf_access_token')).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    }));
  });

  describe('resetPassword', () => {
    it('should POST to auth/forgot-password/reset with the full payload', () => {
      const payload = {
        identifier: 'user@example.com',
        otp: '1234',
        newPassword: 'newPass1',
        confirmPassword: 'newPass1',
      };

      service.resetPassword(payload).subscribe();

      const req = httpMock.expectOne(`${API}auth/forgot-password/reset`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      expect(req.request.withCredentials).toBeTrue();
      req.flush({ success: true, message: 'Password reset successfully' });
    });
  });
});
