import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { UtilityService } from '../../../../core/services/utility.service';
import { UnspentUlbTableComponent } from './components/unspent-ulb-table/unspent-ulb-table.component';
import { FcUnspentDeclarationComponent } from './fc-unspent-declaration.component';
import { FC_UNSPENT_DECLARATION_MOCK_RESPONSE } from './fc-unspent-declaration.mock';

/** `form` is built dynamically (`fb.group({})`), so `.get()` isn't statically typed — narrow it here for tests. */
function isFcUnspentControl(component: FcUnspentDeclarationComponent): FormControl<string | null> {
  return component.form.get('isFcUnspent') as unknown as FormControl<string | null>;
}

describe('FcUnspentDeclarationComponent', () => {
  let component: FcUnspentDeclarationComponent;
  let fixture: ComponentFixture<FcUnspentDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, FcUnspentDeclarationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FcUnspentDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hydrates page state from the mock response', () => {
    const { data } = FC_UNSPENT_DECLARATION_MOCK_RESPONSE;
    expect(component.stateName()).toBe(data.stateName);
    expect(component.applicableFcLabel()).toBe('14th');
    expect(component.currentFormStatus()).toBe(data.currentFormStatus);
    expect(component.canEdit()).toBe(data.permissions.canEdit);
    expect(component.canFinalSubmit()).toBe(data.permissions.canFinalSubmit);
  });

  it('creates FormArray rows from the mock response via createContorl-backed controls', () => {
    expect(component.unspentUlbData.length).toBe(2);

    const [row0, row1] = component.unspentUlbData.controls;
    expect(row0.controls.ulbId).toBeInstanceOf(FormControl);
    expect(row0.controls.unspentAmount).toBeInstanceOf(FormControl);
    expect(row0.controls.ulbId.value).toBe('66a000000000000000000001');
    expect(row0.controls.unspentAmount.value).toBe(1.5);
    expect(row1.controls.ulbId.value).toBe('66a000000000000000000002');
    expect(row1.controls.unspentAmount.value).toBe(1.2);
  });

  it('shows the table when isFcUnspent is yes (mock default)', () => {
    expect(isFcUnspentControl(component).value).toBe('yes');
    expect(component.isYesBranch()).toBe(true);

    const table = fixture.debugElement.query(By.directive(UnspentUlbTableComponent));
    expect(table).toBeTruthy();
  });

  it('hides the table when isFcUnspent is switched to no', () => {
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();

    expect(component.isYesBranch()).toBe(false);
    const table = fixture.debugElement.query(By.directive(UnspentUlbTableComponent));
    expect(table).toBeFalsy();
    // Rows are preserved even though the table isn't rendered.
    expect(component.unspentUlbData.length).toBe(2);
  });

  it('restores the existing rows when switched back to yes', () => {
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();
    isFcUnspentControl(component).setValue('yes');
    fixture.detectChanges();

    expect(component.isYesBranch()).toBe(true);
    expect(component.unspentUlbData.length).toBe(2);
    expect(component.unspentUlbData.controls[0].controls.ulbId.value).toBe('66a000000000000000000001');
    const table = fixture.debugElement.query(By.directive(UnspentUlbTableComponent));
    expect(table).toBeTruthy();
  });

  it('adds a blank row when switching to yes with an empty array', () => {
    component.unspentUlbData.removeAt(1);
    component.unspentUlbData.removeAt(0);
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();

    expect(component.unspentUlbData.length).toBe(0);

    isFcUnspentControl(component).setValue('yes');
    fixture.detectChanges();

    expect(component.unspentUlbData.length).toBe(1);
    expect(component.unspentUlbData.controls[0].controls.ulbId.value).toBeNull();
    expect(component.unspentUlbData.controls[0].controls.unspentAmount.value).toBeNull();
  });

  it('fails final-submit validation when the Yes branch has zero rows', () => {
    const utilityService = TestBed.inject(UtilityService);
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    component.unspentUlbData.removeAt(1);
    component.unspentUlbData.removeAt(0);

    component.onSubmit('finalSubmit');

    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
  });

  it('fails final-submit validation for an invalid row', () => {
    const utilityService = TestBed.inject(UtilityService);
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    component.unspentUlbData.controls[0].controls.unspentAmount.setValue(0);

    component.onSubmit('finalSubmit');

    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    expect(component.unspentUlbData.controls[0].controls.unspentAmount.touched).toBe(true);
  });

  it('leaves the No-branch file field visibility behavior intact', () => {
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();
    expect(component.fields().find((f) => f.key === 'fcDeclaration')?.hidden).toBe(false);

    isFcUnspentControl(component).setValue('yes');
    fixture.detectChanges();
    expect(component.fields().find((f) => f.key === 'fcDeclaration')?.hidden).toBe(true);
  });

  it('leaves the checkboxConfirmation visibility behavior intact', () => {
    expect(component.fields().find((f) => f.key === 'checkboxConfirmation')?.hidden).toBe(false);

    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();
    expect(component.fields().find((f) => f.key === 'checkboxConfirmation')?.hidden).toBe(true);
  });
});
