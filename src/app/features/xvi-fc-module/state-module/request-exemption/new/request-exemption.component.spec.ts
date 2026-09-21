import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { DynamicFormVisibilityService } from '../../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { RequestExemptionComponent } from './request-exemption.component';
import { RequestExemptionService } from '../request-exemption.service';
import { RequestExemptionData } from '../request-exemption.models';

@Component({ selector: 'app-dynamic-form', standalone: true, template: '' })
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
  @Input() mode: unknown;
}

@Component({ selector: 'app-pre-loader', standalone: true, template: '' })
class MockPreLoaderComponent {}

function createFormResponse(overrides: Partial<RequestExemptionData> = {}): RequestExemptionData {
  return {
    stateId: 'state-test-id',
    yearId: 'year-test-id',
    stateName: 'Test State',
    permissions: { canView: true, canEdit: true, canFinalSubmit: true },
    fields: [
      {
        // Renders as a debounced remote-search autocomplete (AutocompleteComponent) - see its own
        // spec for coverage of the search/select/blur behavior this drives.
        formFieldType: 'autocomplete',
        key: 'ulb',
        label: 'ULB',
        remoteSearch: { endpoint: 'master/ulb', extraParams: { isActive: true } },
        validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
      },
      {
        formFieldType: 'select',
        multiple: true,
        key: 'reasonForExemption',
        label: 'Reason for Exemption',
        options: [
          { id: '23', label: 'Election / duly constituted ULB exemption' },
          { id: '30', label: 'Audited Financial Statement' },
          { id: '31', label: 'Provisional Financial Statement' },
        ],
        validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
      },
      {
        formFieldType: 'textarea',
        key: 'supportingDetails',
        label: 'Supporting Details',
        validations: [
          { name: 'required', validator: null, message: 'This field is required.' },
          { name: 'minlength', validator: 3, message: 'Minimum 3 characters required.' },
          { name: 'maxlength', validator: 500, message: 'Maximum 500 characters allowed.' },
        ],
      },
      {
        formFieldType: 'file',
        key: 'supportingFile',
        label: 'Supporting Document',
        value: { originalName: '', path: '', mimeType: '', sizeKb: null, pageCount: null },
        validations: [],
      },
    ],
    ...overrides,
  } as RequestExemptionData;
}

describe('RequestExemptionComponent', () => {
  let fixture: ComponentFixture<RequestExemptionComponent>;
  let component: RequestExemptionComponent;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let moduleService: jasmine.SpyObj<XvifcModuleService>;
  let getFormSpy: jasmine.Spy;
  let finalSubmitSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-test-id' }));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(true));
    moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, RequestExemptionComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        DynamicFormService,
        DynamicFormVisibilityService,
        { provide: UtilityService, useValue: utilityService },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
        { provide: XvifcModuleService, useValue: moduleService },
      ],
    })
      .overrideComponent(RequestExemptionComponent, {
        remove: { imports: [HttpClientTestingModule, RouterTestingModule, DynamicFormComponent] },
        add: { imports: [HttpClientTestingModule, RouterTestingModule, MockDynamicFormComponent, MockPreLoaderComponent] },
      })
      .compileComponents();

    getFormSpy = spyOn(TestBed.inject(RequestExemptionService), 'getForm').and.returnValue(of(createFormResponse()));
    finalSubmitSpy = spyOn(TestBed.inject(RequestExemptionService), 'finalSubmit').and.returnValue(
      of({ _id: 'final-req-id', currentFormStatus: 20, currentFormStatusLabel: 'Under Review' }),
    );
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(RequestExemptionComponent);
    component = fixture.componentInstance;
  }

  function completeInitialLoad(): void {
    fixture.detectChanges();
    tick(1);
    fixture.detectChanges();
  }

  function getControl(key: string): AbstractControl<unknown, unknown> | null {
    return component.form.get(key);
  }

  it('creates the component and loads the form for the current state+year', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    expect(component).toBeTruthy();
    expect(getFormSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id');
    expect(component.stateName()).toBe('Test State');
    expect(getControl('ulb')).toBeTruthy();
    expect(getControl('reasonForExemption')).toBeTruthy();
    expect(getControl('supportingDetails')).toBeTruthy();
  }));

  it('builds a breadcrumb back to the Exemption Status list', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    expect(component.breadcrumbLinks()).toEqual([
      { label: 'Exemption Status', routerLink: ['/xvifc', 'year-test-id', 'request-exemption'] },
      { label: 'Request Exemption' },
    ]);
  }));

  it('only offers Elected Body/Audited/Provisional as reasonForExemption options - no SFC (22)', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const reasonField = component.fields().find((f) => f.key === 'reasonForExemption');
    const optionIds = (reasonField?.options as { id: string }[]).map((o) => o.id);
    expect(optionIds).toEqual(['23', '30', '31']);
  }));

  it('disables the form when the form is not editable', fakeAsync(() => {
    getFormSpy.and.returnValue(
      of(createFormResponse({ permissions: { canView: true, canEdit: false, canFinalSubmit: false } })),
    );

    createComponent();
    completeInitialLoad();

    expect(component.canEdit()).toBeFalse();
    expect(component.form.disabled).toBeTrue();
  }));

  it('blocks submit when required fields are left empty', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    component.onSubmit();
    tick(1);

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Please correct the errors in the form before submitting.',
      'snackbar-danger',
    );
  }));

  it('submits successfully and reloads a blank form so a second request can be filed', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    getControl('ulb')?.setValue('ulb-id');
    getControl('reasonForExemption')?.setValue(['23']);
    getControl('supportingDetails')?.setValue('The ULB has no elected body yet.');

    component.onSubmit();
    tick(1);

    expect(finalSubmitSpy).toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Exemption request submitted successfully.');
    // No draft/resume step, so the page reloads (re-fetches getForm) rather than leaving the
    // just-submitted values on screen - the ULB field is back to blank, ready for another request.
    expect(getFormSpy).toHaveBeenCalledTimes(2);
    expect(getControl('ulb')?.value).toBeFalsy();
  }));

  it('shows a generic snackbar but the backend\'s specific message as an alert-danger banner when submit fails', fakeAsync(() => {
    finalSubmitSpy.and.returnValue(throwError(() => ({ success: false, message: 'Something went wrong.' })));

    createComponent();
    completeInitialLoad();

    getControl('ulb')?.setValue('ulb-id');
    getControl('reasonForExemption')?.setValue(['23']);
    getControl('supportingDetails')?.setValue('The ULB has no elected body yet.');

    component.onSubmit();
    tick(1);

    expect(component.isSubmitting()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Unable to submit exemption request. Please correct the errors and try again.',
      'snackbar-danger',
    );
    expect(component.submitError()).toBe('Something went wrong.');
  }));

  it('surfaces the backend\'s own message in the banner (not Angular\'s generic HTTP failure text) for a real 4xx/409', fakeAsync(() => {
    // Shape of a real HttpErrorResponse: the backend's JSON body is under `.error`, and Angular's
    // own `.message` is just a generic "Http failure response for <url>: 409 Conflict" string that
    // must NOT be what ends up anywhere in the UI.
    finalSubmitSpy.and.returnValue(
      throwError(() => ({
        status: 409,
        message: 'Http failure response for http://localhost:3000/api/v2/xvi-fc/state/request-exemption/final-submit: 409 Conflict',
        error: { success: false, message: 'This ULB already has a request for: Election / duly constituted ULB exemption (status: Under Review by MoHUA).' },
      })),
    );

    createComponent();
    completeInitialLoad();

    getControl('ulb')?.setValue('ulb-id');
    getControl('reasonForExemption')?.setValue(['23']);
    getControl('supportingDetails')?.setValue('The ULB has no elected body yet.');

    component.onSubmit();
    tick(1);

    // Snackbar stays generic - the specific reason/status text goes to the banner instead.
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Unable to submit exemption request. Please correct the errors and try again.',
      'snackbar-danger',
    );
    expect(component.submitError()).toBe(
      'This ULB already has a request for: Election / duly constituted ULB exemption (status: Under Review by MoHUA).',
    );
  }));

  it('shows the error state message when the initial fetch fails', fakeAsync(() => {
    getFormSpy.and.returnValue(throwError(() => new Error('network error')));

    createComponent();
    completeInitialLoad();

    expect(component.isLoading()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Unable to load Request Exemption form. Please try again.',
      'snackbar-danger',
    );
  }));

  it('reloads a blank form (and clears any submit-error banner) when cancel is confirmed', fakeAsync(() => {
    finalSubmitSpy.and.returnValue(throwError(() => ({ success: false, message: 'Something went wrong.' })));

    createComponent();
    completeInitialLoad();

    getControl('ulb')?.setValue('ulb-id');
    getControl('reasonForExemption')?.setValue(['23']);
    getControl('supportingDetails')?.setValue('The ULB has no elected body yet.');
    component.onSubmit();
    tick(1);
    expect(component.submitError()).toBe('Something went wrong.');

    getControl('ulb')?.setValue('a-different-ulb-id');
    component.onCancel();
    tick(1);

    expect(confirmDialogService.confirm).toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Form submission cancelled.', 'snackbar-danger');
    // There's no draft to fall back to - cancel discards everything and starts over, same as a
    // successful submit's reload.
    expect(getFormSpy).toHaveBeenCalledTimes(2);
    expect(getControl('ulb')?.value).toBeFalsy();
    expect(component.submitError()).toBeNull();
  }));
});
