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
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { SlbComponent } from './slb.component';
import { SlbService } from './slb.service';
import { SlbFormData } from './slb.models';
import { FormProgressComponent } from '../../../shared/form-progress/form-progress.component';
import { XvifcModuleService } from '../../../xvi-fc-module.service';

@Component({ selector: 'app-dynamic-form', standalone: true, template: '' })
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
  @Input() mode: unknown;
}

@Component({ selector: 'app-pre-loader', standalone: true, template: '' })
class MockPreLoaderComponent {}

@Component({ selector: 'app-form-progress', standalone: true, template: '' })
class MockFormProgressComponent {
  @Input() formType: unknown;
  @Input() formStatus: unknown;
  @Input() actors: unknown;
}

function createSlbFormResponse(overrides: Partial<SlbFormData> = {}): SlbFormData {
  return {
    _id: 'slb-form-test',
    formName: 'SLB',
    formId: 32,
    ulbId: 'ulb-test-id',
    yearId: 'year-test-id',
    ulbName: 'Test ULB',
    currentFormStatus: 1,
    currentFormStatusLabel: 'Not Started',
    permissions: { canView: true, canEdit: true, canFinalSubmit: false },
    actors: [],
    meta: { version: 1 },
    questions: [
      {
        key: 'ind1_actual',
        label: 'Per capita supply of water — Actual',
        formFieldType: 'number',
        value: null,
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
      },
      {
        key: 'checkboxConfirmation',
        label: 'Confirmation',
        formFieldType: 'checkbox',
        value: false,
        validations: [{ name: 'requiredTrue', validator: true, message: 'Confirmation is required.' }],
      },
    ] as ConditionalFieldConfig[],
    ...overrides,
  };
}

describe('SlbComponent', () => {
  let fixture: ComponentFixture<SlbComponent>;
  let component: SlbComponent;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let moduleService: jasmine.SpyObj<XvifcModuleService>;
  let getSlbFormSpy: jasmine.Spy;
  let saveSlbDraftSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-test-id' }));

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(true));
    moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, SlbComponent],
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
      .overrideComponent(SlbComponent, {
        remove: { imports: [HttpClientTestingModule, RouterTestingModule, DynamicFormComponent, FormProgressComponent] },
        add: { imports: [HttpClientTestingModule, RouterTestingModule, MockDynamicFormComponent, MockPreLoaderComponent, MockFormProgressComponent] },
      })
      .compileComponents();

    getSlbFormSpy = spyOn(TestBed.inject(SlbService), 'getSlbForm').and.returnValue(of(createSlbFormResponse()));
    saveSlbDraftSpy = spyOn(TestBed.inject(SlbService), 'saveSlbDraft').and.returnValue(of({}));
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(SlbComponent);
    component = fixture.componentInstance;
  }

  function getControl(key: string): AbstractControl<unknown, unknown> | null {
    return component.form.get(key);
  }

  it('creates the component and loads the SLB form', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick(1);

    expect(component).toBeTruthy();
    expect(getSlbFormSpy).toHaveBeenCalledWith('ulb-test-id', 'year-test-id');
    expect(component.ulbName()).toBe('Test ULB');
    expect(getControl('ind1_actual')).toBeTruthy();
    expect(getControl('checkboxConfirmation')).toBeTruthy();
  }));

  it('disables the form when the form is not editable', fakeAsync(() => {
    getSlbFormSpy.and.returnValue(
      of(createSlbFormResponse({ permissions: { canView: true, canEdit: false, canFinalSubmit: false } })),
    );

    createComponent();
    fixture.detectChanges();
    tick(1);

    expect(component.canEdit()).toBeFalse();
    expect(component.form.disabled).toBeTrue();
  }));

  it('shows a snackbar and stops loading when the initial fetch fails', fakeAsync(() => {
    getSlbFormSpy.and.returnValue(throwError(() => new Error('network error')));

    createComponent();
    fixture.detectChanges();
    tick(1);

    expect(component.isLoading()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Unable to load SLB form. Please try again.',
      'snackbar-danger',
    );
  }));

  it('saves a draft and reloads the form on success', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick(1);

    getControl('ind1_actual')?.setValue(150);
    getControl('checkboxConfirmation')?.setValue(true);
    component.onSubmit('saveAsDraft');
    tick(1);

    expect(confirmDialogService.confirm).toHaveBeenCalled();
    expect(saveSlbDraftSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ ulbId: 'ulb-test-id', yearId: 'year-test-id' }),
    );
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Draft saved successfully.');
  }));
});
