import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { StateService } from '../../../../../../core/services/state/state.service';
import { AdcService, IAdcRow } from '../../../../shared/adc/adc.service';
import { AdcFormDialogComponent, AdcFormDialogData } from './adc-form-dialog.component';

const adc: IAdcRow = {
  _id: 'a1',
  name: 'Bodoland',
  state: { _id: 's1', name: 'Assam' },
  ulbCount: 0,
  memberCount: 1,
  admin: null,
};

const conflict = (error: Record<string, unknown>) =>
  throwError(() => new HttpErrorResponse({ status: 409, error }));

describe('AdcFormDialogComponent', () => {
  let component: AdcFormDialogComponent;
  let fixture: ComponentFixture<AdcFormDialogComponent>;
  let adcService: jasmine.SpyObj<AdcService>;
  let dialogRef: { close: jasmine.Spy };

  function setup(data: AdcFormDialogData): void {
    adcService = jasmine.createSpyObj<AdcService>('AdcService', ['create', 'rename']);
    adcService.create.and.returnValue(of({}));
    adcService.rename.and.returnValue(of({}));
    dialogRef = { close: jasmine.createSpy('close') };

    TestBed.configureTestingModule({
      imports: [AdcFormDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: AdcService, useValue: adcService },
        { provide: StateService, useValue: { getStates: () => of({ data: [{ _id: 's1', name: 'Assam' }] }) } },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    fixture = TestBed.createComponent(AdcFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillCreateForm(): void {
    component.form.setValue({
      stateId: 's1',
      name: '  Bodoland  ',
      adminName: 'A. Das',
      email: 'a@x.gov.in',
      mobile: '9876543210',
      designation: 'Principal Secretary',
    });
  }

  describe('Add ADC', () => {
    beforeEach(() => setup({ mode: 'create' }));

    it('loads the states and does not submit an incomplete form', () => {
      expect(component.states().map((s) => s.name)).toEqual(['Assam']);
      component.submit();
      expect(adcService.create).not.toHaveBeenCalled();
      expect(component.form.controls.stateId.touched).toBeTrue();
    });

    it('rejects an invalid mobile and email', () => {
      fillCreateForm();
      component.form.controls.mobile.setValue('12345');
      component.form.controls.email.setValue('not-an-email');
      component.submit();
      expect(component.form.controls.mobile.invalid).toBeTrue();
      expect(component.form.controls.email.invalid).toBeTrue();
      expect(adcService.create).not.toHaveBeenCalled();
    });

    it('creates the ADC with its Admin (name trimmed) and closes with true', () => {
      fillCreateForm();
      component.submit();
      expect(adcService.create).toHaveBeenCalledWith({
        stateId: 's1',
        name: 'Bodoland',
        admin: { name: 'A. Das', email: 'a@x.gov.in', mobile: '9876543210', designation: 'Principal Secretary' },
        action: 'invite',
      });
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('offers to restore a removed member, and re-sends with action restore', () => {
      adcService.create.and.returnValue(
        conflict({ code: 'EMAIL_XVIFC_REMOVED', removedUser: { name: 'Old Admin', designation: 'Officer' } }),
      );
      fillCreateForm();
      component.submit();

      expect(component.removedMember()).toEqual({ name: 'Old Admin', designation: 'Officer' });
      expect(dialogRef.close).not.toHaveBeenCalled();

      adcService.create.and.returnValue(of({}));
      component.restore();
      expect(adcService.create.calls.mostRecent().args[0].action).toBe('restore');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('shows a duplicate name, or an email used elsewhere, inline and stays open', () => {
      adcService.create.and.returnValue(conflict({ code: 'ADC_NAME_EXISTS', message: 'An ADC with this name exists.' }));
      fillCreateForm();
      component.submit();
      expect(component.formError()).toBe('An ADC with this name exists.');

      adcService.create.and.returnValue(
        conflict({ code: 'EMAIL_REMOVED_OTHER_TEAM', message: 'This email belongs to a member removed from another team.' }),
      );
      component.submit();
      expect(component.formError()).toBe('This email belongs to a member removed from another team.');
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Edit ADC', () => {
    beforeEach(() => setup({ mode: 'edit', adc }));

    it('edits the name only', () => {
      expect(component.form.controls.name.value).toBe('Bodoland');
      expect(component.form.controls.stateId.disabled).toBeTrue();
      expect(component.form.controls.email.disabled).toBeTrue();
    });

    it('shows the state as a disabled (greyed, not focusable) field', () => {
      fixture.detectChanges();
      const stateInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[matInput]');
      expect(stateInput?.value).toBe('Assam');
      expect(stateInput?.disabled).toBeTrue();
    });

    it('closes without a call when the name is unchanged', () => {
      component.form.controls.name.setValue(' Bodoland ');
      component.submit();
      expect(adcService.rename).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    });

    it('renames the ADC', () => {
      component.form.controls.name.setValue('Bodoland Territorial Council ');
      component.submit();
      expect(adcService.rename).toHaveBeenCalledWith('a1', 'Bodoland Territorial Council');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('refuses a blank name', () => {
      component.form.controls.name.setValue('   ');
      component.submit();
      expect(adcService.rename).not.toHaveBeenCalled();
    });
  });
});
