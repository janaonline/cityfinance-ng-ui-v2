import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, throwError } from 'rxjs';
import { AdcService, IAdcMember, IAdcRow, IPage } from '../../../../shared/adc/adc.service';
import { ChangeAdminDialogComponent } from './change-admin-dialog.component';

const adcWithAdmin: IAdcRow = {
  _id: 'a1',
  name: 'Bodoland',
  state: { _id: 's1', name: 'Assam' },
  ulbCount: 0,
  memberCount: 3,
  admin: { _id: 'u1', name: 'A. Das', email: 'a@x.gov.in', isXVIFCProfileVerified: true },
};

const member = (id: string, name: string, subRole: IAdcMember['subRole'] = 'EDITOR'): IAdcMember => ({
  _id: id,
  name,
  designation: '',
  email: `${id}@x.gov.in`,
  mobile: '',
  subRole,
  isXVIFCProfileVerified: true,
  lastActive: null,
});

/** The server already leaves out the Admin and unverified members (status ACTIVE, excludeAdmin). */
const promotable = [member('u2', 'R. Basumatary'), member('u4', 'P. Brahma', 'VIEWER')];
const pageOf = (data: IAdcMember[]): IPage<IAdcMember> => ({ data, total: data.length, page: 1, limit: 20, totalPages: 1 });

describe('ChangeAdminDialogComponent', () => {
  let component: ChangeAdminDialogComponent;
  let adcService: jasmine.SpyObj<AdcService>;
  let dialogRef: { close: jasmine.Spy };
  let element: HTMLElement;

  function setup(adc: IAdcRow, members$: Observable<IPage<IAdcMember>> = of(pageOf(promotable))): void {
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

  it('asks the server for verified non-admin members only, and starts in promote mode', () => {
    setup(adcWithAdmin);
    expect(adcService.members).toHaveBeenCalledWith('a1', {
      page: 1,
      limit: 20,
      status: 'ACTIVE',
      excludeAdmin: true,
      search: undefined,
    });
    expect(component.results().map((m) => m._id)).toEqual(['u2', 'u4']);
    expect(component.mode()).toBe('promote');
    expect(element.textContent).toContain('Current Admin');
    expect(element.textContent).toContain('The current Admin will become a Reviewer.');
  });

  it('searches the server as the user types (debounced), and typing clears an earlier pick', fakeAsync(() => {
    setup(adcWithAdmin);
    component.selected.set(promotable[0]);
    adcService.members.calls.reset();
    adcService.members.and.returnValue(of(pageOf([promotable[1]])));

    component.memberSearch.setValue(' brah ');
    expect(component.selected()).toBeNull();
    tick(399);
    expect(adcService.members).not.toHaveBeenCalled();
    tick(1);

    expect(adcService.members).toHaveBeenCalledOnceWith('a1', jasmine.objectContaining({ search: 'brah' }));
    expect(component.results().map((m) => m._id)).toEqual(['u4']);
  }));

  it('shows a no-results line when nobody matches', fakeAsync(() => {
    setup(adcWithAdmin);
    adcService.members.and.returnValue(of(pageOf([])));
    component.memberSearch.setValue('zzz');
    tick(400);
    expect(component.results()).toEqual([]);
    expect(component.searching()).toBeFalse();
  }));

  it('promotes the picked member', () => {
    setup(adcWithAdmin);
    component.submit();
    expect(component.formError()).toBe('Search for and select the member to make Admin.');
    expect(adcService.setAdmin).not.toHaveBeenCalled();

    component.memberSearch.setValue(promotable[0]);
    component.onMemberSelected({ option: { value: promotable[0] } } as never);
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
    setup({ ...adcWithAdmin, admin: null, memberCount: 0 }, of(pageOf([])));
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
    component.selected.set(promotable[0]);
    adcService.setAdmin.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'This ADC is not active' } })),
    );
    component.submit();
    expect(component.formError()).toBe('This ADC is not active');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
