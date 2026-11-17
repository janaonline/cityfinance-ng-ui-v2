import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, throwError } from 'rxjs';
import { AdcService, IAdcMember, IAdcRow } from '../../../../shared/adc/adc.service';
import { ChangeAdminDialogComponent } from './change-admin-dialog.component';

const adcWithAdmin: IAdcRow = {
  _id: 'a1',
  name: 'Bodoland',
  state: { _id: 's1', name: 'Assam' },
  ulbCount: 0,
  memberCount: 3,
  admin: { _id: 'u1', name: 'A. Das', email: 'a@x.gov.in', isXVIFCProfileVerified: true },
};

const members: IAdcMember[] = [
  { _id: 'u1', name: 'A. Das', email: 'a@x.gov.in', subRole: 'SUBMITTER', isXVIFCProfileVerified: true },
  { _id: 'u2', name: 'R. Basumatary', email: 'r@x.gov.in', subRole: 'EDITOR', isXVIFCProfileVerified: true },
  { _id: 'u3', name: 'New Viewer', email: 'n@x.gov.in', subRole: 'VIEWER', isXVIFCProfileVerified: false },
];

describe('ChangeAdminDialogComponent', () => {
  let component: ChangeAdminDialogComponent;
  let adcService: jasmine.SpyObj<AdcService>;
  let dialogRef: { close: jasmine.Spy };
  let element: HTMLElement;

  function setup(adc: IAdcRow, members$: Observable<IAdcMember[]> = of(members)): void {
    adcService = jasmine.createSpyObj<AdcService>('AdcService', ['members', 'setAdmin']);
    adcService.members.and.returnValue(members$);
    adcService.setAdmin.and.returnValue(of({}));
    dialogRef = { close: jasmine.createSpy('close') };

    TestBed.configureTestingModule({
      imports: [ChangeAdminDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: AdcService, useValue: adcService },
        { provide: MAT_DIALOG_DATA, useValue: { adc } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(ChangeAdminDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  }

  function fillInvite(): void {
    component.inviteForm.setValue({
      adminName: 'New Admin',
      email: 'new@x.gov.in',
      mobile: '9876543210',
      designation: 'Officer',
    });
  }

  it('offers only verified members who are not already the Admin for promotion', () => {
    setup(adcWithAdmin);
    expect(adcService.members).toHaveBeenCalledWith('a1');
    expect(component.promotable().map((m) => m._id)).toEqual(['u2']);
    expect(component.mode()).toBe('promote');
    expect(element.textContent).toContain('Current Admin');
    expect(element.textContent).toContain('The current Admin will become a Reviewer.');
  });

  it('promotes the chosen member', () => {
    setup(adcWithAdmin);
    component.submit();
    expect(component.formError()).toBe('Select the member to make Admin.');
    expect(adcService.setAdmin).not.toHaveBeenCalled();

    component.promoteControl.setValue('u2');
    component.submit();
    expect(adcService.setAdmin).toHaveBeenCalledWith('a1', { mode: 'promote', userId: 'u2' });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('invites a new person, after the form is valid', () => {
    setup(adcWithAdmin);
    component.onModeChange('invite');
    component.submit();
    expect(adcService.setAdmin).not.toHaveBeenCalled();

    fillInvite();
    component.submit();
    expect(adcService.setAdmin).toHaveBeenCalledWith('a1', {
      mode: 'invite',
      name: 'New Admin',
      email: 'new@x.gov.in',
      mobile: '9876543210',
      designation: 'Officer',
      action: 'invite',
    });
  });

  it('is "Set Admin" with the invite form when the ADC has no Admin and no verified member', () => {
    setup({ ...adcWithAdmin, admin: null, memberCount: 0 }, of([]));
    expect(component.actionLabel).toBe('Set Admin');
    expect(component.mode()).toBe('invite');
    expect(element.textContent).toContain('Set ADC Admin - Bodoland');
    expect(element.textContent).not.toContain('will become a Reviewer');
  });

  it('falls back to inviting when the members cannot be loaded', () => {
    setup(adcWithAdmin, throwError(() => new HttpErrorResponse({ status: 500 })));
    expect(component.mode()).toBe('invite');
    expect(component.formError()).toContain('Unable to load');
  });

  it('offers to restore a removed member, and re-sends with action restore', () => {
    setup(adcWithAdmin);
    component.onModeChange('invite');
    fillInvite();
    adcService.setAdmin.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { code: 'EMAIL_XVIFC_REMOVED', removedUser: { name: 'Old Member', designation: 'Officer' } },
          }),
      ),
    );
    component.submit();
    expect(component.removedMember()).toEqual({ name: 'Old Member', designation: 'Officer' });

    adcService.setAdmin.and.returnValue(of({}));
    component.restore();
    expect(adcService.setAdmin.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ action: 'restore' }));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('shows the server message inline when the change is refused', () => {
    setup(adcWithAdmin);
    component.promoteControl.setValue('u2');
    adcService.setAdmin.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'This ADC is not active' } })),
    );
    component.submit();
    expect(component.formError()).toBe('This ADC is not active');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
