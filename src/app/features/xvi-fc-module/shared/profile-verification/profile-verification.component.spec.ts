import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';

import { ProfileVerificationComponent } from './profile-verification.component';

describe('ProfileVerificationComponent', () => {
  let component: ProfileVerificationComponent;
  let fixture: ComponentFixture<ProfileVerificationComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileVerificationComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends name/mobile/designation for a MoHUA user setting their first password (not just STATE)', () => {
    component.role = 'mohua';
    component.stateForm.patchValue({
      firstName: 'Jane',
      lastName: 'Doe',
      mobile: '9876543210',
      designation: 'Officer',
    });
    component.passwordForm.setValue({ newPassword: 'Passw0rd!', confirmPassword: 'Passw0rd!' });
    (component as unknown as { profileSaveToken: string }).profileSaveToken = 'token-123';

    component.onSetNewPassword();

    const req = httpMock.expectOne(`${environment.api.url2}auth/set-new-password`);
    expect(req.request.body).toEqual(
      jasmine.objectContaining({ name: 'Jane Doe', mobile: '9876543210', designation: 'Officer' }),
    );
    req.flush({});
  });

  describe('ULB Nodal Officer OTP step', () => {
    beforeEach(() => {
      component.role = 'ulb';
      (component as unknown as { userId: string }).userId = 'user-1';
      component.commissionerForm.setValue({
        commissionerName: 'Comm Name',
        commissionerEmail: 'comm@example.com',
        commissionerConatactNumber: '9876543210',
      });
      component.accountantForm.setValue({
        accountantName: 'Nodal Officer',
        accountantEmail: 'nodal@example.com',
        accountantConatactNumber: '9876543211',
      });
    });

    it('locks both contact cards (closes edit mode) once the OTP is sent', () => {
      component.editingCommissioner.set(true);
      component.editingAccountant.set(true);

      component.onSaveAndContinue();

      httpMock
        .expectOne(`${environment.api.url2}email/sendProfileOtp`)
        .flush({ success: true, data: { isOtpSent: true } });

      expect(component.editingCommissioner()).toBe(false);
      expect(component.editingAccountant()).toBe(false);
    });

    it('verifies against the email the OTP was sent to, not a value the form was edited to afterward', () => {
      component.onSaveAndContinue();
      httpMock
        .expectOne(`${environment.api.url2}email/sendProfileOtp`)
        .flush({ success: true, data: { isOtpSent: true } });

      expect(component.otpEmail()).toBe('nodal@example.com');

      // Simulate the field somehow still being editable and changed after the OTP was sent.
      component.accountantForm.patchValue({ accountantEmail: 'changed@example.com' });
      component.otpValue.set('1234');

      component.onConfirmOtp();

      const req = httpMock.expectOne(`${environment.api.url2}email/verifyProfileOtp`);
      expect(req.request.body).toEqual(jasmine.objectContaining({ email: 'nodal@example.com' }));
      req.flush({ success: true, data: { isOtpVerified: true } });

      httpMock
        .expectOne((r) => r.url.includes('/issue-profile-save-token'))
        .flush({ success: true, data: { token: 'save-token-1' } });

      const saveReq = httpMock.expectOne((r) => r.url.includes('/profile-contacts'));
      expect(saveReq.request.body).toEqual(jasmine.objectContaining({ saveToken: 'save-token-1' }));
      saveReq.flush({});
    });

    it('requires a saveToken to be issued before persisting contacts (defense-in-depth, matches STATE/MoHUA)', () => {
      component.onSaveAndContinue();
      httpMock
        .expectOne(`${environment.api.url2}email/sendProfileOtp`)
        .flush({ success: true, data: { isOtpSent: true } });

      component.otpValue.set('1234');
      component.onConfirmOtp();

      httpMock
        .expectOne(`${environment.api.url2}email/verifyProfileOtp`)
        .flush({ success: true, data: { isOtpVerified: true } });

      // Backend refuses/empties the token — must not fall through to saving contacts anyway.
      httpMock
        .expectOne((r) => r.url.includes('/issue-profile-save-token'))
        .flush({ success: true, data: { token: '' } });

      httpMock.expectNone((r) => r.url.includes('/profile-contacts'));
      expect(component.isSaving()).toBe(false);
      expect(component.errorMsg()).toContain('Could not secure save session');
    });
  });
});
