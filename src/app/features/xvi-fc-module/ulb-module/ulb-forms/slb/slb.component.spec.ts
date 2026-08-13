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
import { XvifcModuleService } from '../../../xvi-fc-module.service';

@Component({ selector: 'app-dynamic-form', standalone: true, template: '' })
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
  @Input() mode: unknown;
}

@Component({ selector: 'app-pre-loader', standalone: true, template: '' })
class MockPreLoaderComponent {}

function createSlbFormResponse(overrides: Partial<SlbFormData> = {}): SlbFormData {
  return {
    _id: 'slb-form-test',
    formName: 'SLB',
    formId: 32,
    ulbId: 'ulb-test-id',
    yearId: 'year-test-id',
    designYear: '2026-27',
    actualYearLabel: '2025-26',
    ulbName: 'Test ULB',
    currentFormStatus: 1,
    currentFormStatusLabel: 'Not Started',
    permissions: { canView: true, canEdit: true, canFinalSubmit: false },
    actors: [],
    meta: { version: 1 },
    questions: [
      {
        key: 'ind1',
        label: 'Per capita supply of water',
        position: 1,
        formFieldType: 'actualTarget',
        value: null,
        inputCardConfig: { suffixText: 'lpcd' },
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
        meta: { section: 'Water Supply' },
      },
      {
        key: 'ind10',
        label: 'Adequacy of waste water treatment capacity',
        position: 10,
        formFieldType: 'actualTarget',
        value: null,
        inputCardConfig: { suffixText: '%' },
        validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
        meta: { section: 'Sanitation' },
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
        remove: { imports: [HttpClientTestingModule, RouterTestingModule, DynamicFormComponent] },
        add: { imports: [HttpClientTestingModule, RouterTestingModule, MockDynamicFormComponent, MockPreLoaderComponent] },
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
    expect(getControl('ind1.actual')).toBeTruthy();
    expect(getControl('ind1.target')).toBeTruthy();
    expect(getControl('checkboxConfirmation')).toBeTruthy();
    expect(component.indicatorFields().map((f) => f.key)).toEqual(['ind1', 'ind10']);
    expect(component.declarationFields().map((f) => f.key)).toEqual(['checkboxConfirmation']);
  }));

  it('shows the current status as a plain pill, not a multi-actor review stepper', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick(1);

    const element = fixture.nativeElement as HTMLElement;
    expect(component.currentFormStatusLabel()).toBe('Not Started');
    expect(element.querySelector('.status-pill')?.textContent?.trim()).toBe('Not Started');
    expect(element.querySelector('app-form-progress')).toBeNull();
  }));

  it('groups indicator fields by meta.section, preserving section order of first appearance', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick(1);

    expect(component.groupedIndicatorFields().map((g) => g.section)).toEqual(['Water Supply', 'Sanitation']);
    expect(component.groupedIndicatorFields()[0].fields.map((f) => f.key)).toEqual(['ind1']);
    expect(component.groupedIndicatorFields()[1].fields.map((f) => f.key)).toEqual(['ind10']);
  }));

  it('renders the indicator table with actual/target inputs, unit suffix, and section header rows', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick(1);

    const allRows = (fixture.nativeElement as HTMLElement).querySelectorAll('.slb-indicator-table tbody tr');
    const sectionRows = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.slb-indicator-table tbody tr.slb-section-row',
    );
    expect(allRows.length).toBe(4);
    expect(sectionRows.length).toBe(2);
    expect(sectionRows[0].textContent).toContain('Water Supply');
    expect(sectionRows[1].textContent).toContain('Sanitation');

    const indicatorRow = Array.from(allRows).find((row) => row.textContent?.includes('Per capita supply of water'));
    expect(indicatorRow).toBeTruthy();
    expect(indicatorRow!.textContent).toContain('lpcd');
    expect(indicatorRow!.querySelector('[data-cy="ind1_actual-test"]')).toBeTruthy();
    expect(indicatorRow!.querySelector('[data-cy="ind1_target-test"]')).toBeTruthy();
  }));

  it('labels the actual column with the prior FY and the target column with the design FY', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick(1);

    const headerCells = (fixture.nativeElement as HTMLElement).querySelectorAll('.slb-indicator-table thead th');
    expect(headerCells[2].textContent).toContain('Actuals');
    expect(headerCells[2].textContent).toContain('for FY 2025-26');
    expect(headerCells[3].textContent).toContain('Targets');
    expect(headerCells[3].textContent).toContain('for FY 2026-27');
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

  it('shows the error state and stops loading when the initial fetch fails', fakeAsync(() => {
    getSlbFormSpy.and.returnValue(throwError(() => new Error('network error')));

    createComponent();
    fixture.detectChanges();
    tick(1);

    expect(component.isLoading()).toBeFalse();
    expect(component.hasLoadError()).toBeTrue();
  }));

  it('clears the error state and refetches on retry', fakeAsync(() => {
    getSlbFormSpy.and.returnValue(throwError(() => new Error('network error')));

    createComponent();
    fixture.detectChanges();
    tick(1);

    expect(component.hasLoadError()).toBeTrue();

    getSlbFormSpy.and.returnValue(of(createSlbFormResponse()));
    component.retryLoadForm();
    tick(1);

    expect(component.hasLoadError()).toBeFalse();
    expect(component.isLoading()).toBeFalse();
  }));

  it('saves a draft and reloads the form on success', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick(1);

    getControl('ind1.actual')?.setValue(150);
    getControl('ind1.target')?.setValue(180);
    getControl('checkboxConfirmation')?.setValue(true);
    component.onSubmit('saveAsDraft');
    tick(1);

    expect(confirmDialogService.confirm).toHaveBeenCalled();
    expect(saveSlbDraftSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ ulbId: 'ulb-test-id', yearId: 'year-test-id' }),
    );
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Draft saved successfully.');
  }));

  it('saves a draft even when a required indicator and the confirmation checkbox are left empty', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick(1);

    // ind1.actual/target left empty (plain `required`) and checkboxConfirmation left unchecked
    // (`requiredTrue`) — a draft is work in progress, so neither should block the save.
    component.onSubmit('saveAsDraft');
    tick(1);

    expect(confirmDialogService.confirm).toHaveBeenCalled();
    expect(saveSlbDraftSpy).toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).not.toHaveBeenCalledWith(
      'Please correct the errors in the form before saving as draft.',
      'snackbar-danger',
    );
  }));

  it('blocks final submit when a required indicator is left empty', fakeAsync(() => {
    getSlbFormSpy.and.returnValue(
      of(createSlbFormResponse({ permissions: { canView: true, canEdit: true, canFinalSubmit: true } })),
    );

    createComponent();
    fixture.detectChanges();
    tick(1);

    // ind1.actual/target left empty; checkboxConfirmation left unchecked.
    component.onSubmit('finalSubmit');
    tick(1);

    expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Please correct the errors in the form before submitting.',
      'snackbar-danger',
    );
  }));
});
