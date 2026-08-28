import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { UlbRolesTeamsOverviewComponent } from './roles-teams-overview.component';
import { ProfileVerificationService } from '../../shared/profile-verification/profile-verification.service';
import { environment } from '../../../../../environments/environment';

describe('UlbRolesTeamsOverviewComponent', () => {
  let component: UlbRolesTeamsOverviewComponent;
  let fixture: ComponentFixture<UlbRolesTeamsOverviewComponent>;
  let httpMock: HttpTestingController;
  let profileService: jasmine.SpyObj<ProfileVerificationService>;

  const baseContacts = {
    commissionerName: 'Ramesh Kumar',
    commissionerEmail: 'ramesh@ulb.gov.in',
    commissionerConatactNumber: '9123456780',
    accountantName: 'Suresh Patel',
    accountantEmail: 'suresh@ulb.gov.in',
    accountantConatactNumber: '9000001111',
  };

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ _id: 'user-1', ulbCode: 'RJ071', stateName: 'Rajasthan' }));

    profileService = jasmine.createSpyObj<ProfileVerificationService>('ProfileVerificationService', [
      'readStoredUser',
      'checkEmailDomain',
      'sendProfileOtp',
      'verifyProfileOtp',
      'issueProfileSaveToken',
    ]);
    profileService.readStoredUser.and.returnValue({ _id: 'user-1', ulbCode: 'RJ071', stateName: 'Rajasthan' });
    profileService.checkEmailDomain.and.returnValue(of({ deliverable: true }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UlbRolesTeamsOverviewComponent],
      providers: [provideNoopAnimations(), { provide: ProfileVerificationService, useValue: profileService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UlbRolesTeamsOverviewComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${environment.api.url2}users/user-1/profile-contacts`).flush({ success: true, data: baseContacts });
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('saves directly with no saveToken when the email is unchanged', () => {
    component.startEdit('commissioner');
    component.editForm.patchValue({ name: 'Ramesh K.' });

    component.saveEdit();

    const req = httpMock.expectOne(`${environment.api.url2}users/user-1/profile-contacts`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.saveToken).toBeUndefined();
    expect(req.request.body.commissionerName).toBe('Ramesh K.');
    req.flush({ success: true });

    expect(profileService.sendProfileOtp).not.toHaveBeenCalled();
  });

  it('checks the domain, then sends an OTP instead of saving when the email is changed, and does not PATCH yet', () => {
    profileService.sendProfileOtp.and.returnValue(of({ sent: true }));

    component.startEdit('commissioner');
    component.editForm.patchValue({ email: 'new-ramesh@ulb.gov.in' });

    component.saveEdit();

    expect(profileService.checkEmailDomain).toHaveBeenCalledWith('new-ramesh@ulb.gov.in');
    expect(profileService.sendProfileOtp).toHaveBeenCalledWith('new-ramesh@ulb.gov.in');
    expect(component.otpStep()).toBe(true);
    expect(component.pendingEmail()).toBe('new-ramesh@ulb.gov.in');
    httpMock.expectNone((r) => r.method === 'PATCH');
  });

  it('shows a domain error and never sends an OTP when the domain is not deliverable', () => {
    profileService.checkEmailDomain.and.returnValue(of({ deliverable: false }));

    component.startEdit('commissioner');
    component.editForm.patchValue({ email: 'new-ramesh@examplesdcds.co' });

    component.saveEdit();

    expect(profileService.checkEmailDomain).toHaveBeenCalledWith('new-ramesh@examplesdcds.co');
    expect(profileService.sendProfileOtp).not.toHaveBeenCalled();
    expect(component.otpStep()).toBe(false);
    expect(component.saveError()).toContain("doesn't appear to accept mail");
    httpMock.expectNone((r) => r.method === 'PATCH');
  });

  it('verifies the OTP, issues a save token, then PATCHes with saveToken + isXviFcEmailVerified', () => {
    profileService.sendProfileOtp.and.returnValue(of({ sent: true }));
    profileService.verifyProfileOtp.and.returnValue(of({ verified: true }));
    profileService.issueProfileSaveToken.and.returnValue(of({ token: 'good-token' }));

    component.startEdit('commissioner');
    component.editForm.patchValue({ email: 'new-ramesh@ulb.gov.in' });
    component.saveEdit();

    component.onOtpInput({ target: { value: '1234' } } as unknown as Event);
    component.onConfirmOtp();

    expect(profileService.verifyProfileOtp).toHaveBeenCalledWith('new-ramesh@ulb.gov.in', '1234');
    expect(profileService.issueProfileSaveToken).toHaveBeenCalledWith('user-1');

    const req = httpMock.expectOne(`${environment.api.url2}users/user-1/profile-contacts`);
    expect(req.request.body.saveToken).toBe('good-token');
    expect(req.request.body.isXviFcEmailVerified).toBe(true);
    expect(req.request.body.commissionerEmail).toBe('new-ramesh@ulb.gov.in');
    req.flush({ success: true });

    expect(component.otpStep()).toBe(false);
  });

  it('shows an error and does not issue a save token when the OTP is wrong', () => {
    profileService.sendProfileOtp.and.returnValue(of({ sent: true }));
    profileService.verifyProfileOtp.and.returnValue(of({ verified: false }));

    component.startEdit('commissioner');
    component.editForm.patchValue({ email: 'new-ramesh@ulb.gov.in' });
    component.saveEdit();

    component.onOtpInput({ target: { value: '0000' } } as unknown as Event);
    component.onConfirmOtp();

    expect(profileService.issueProfileSaveToken).not.toHaveBeenCalled();
    expect(component.saveError()).toContain('Invalid');
    expect(component.otpStep()).toBe(true);
    httpMock.expectNone((r) => r.method === 'PATCH');
  });
});
