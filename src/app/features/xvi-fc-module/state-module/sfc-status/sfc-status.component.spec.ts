import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import {
  ConditionalFieldConfig,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import { SfcStatusComponent } from './sfc-status.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  template: '',
})
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
}

@Component({
  selector: 'app-pre-loader',
  standalone: true,
  template: '',
})
class MockPreLoaderComponent {}

describe('SfcStatusComponent', () => {
  let fixture: ComponentFixture<SfcStatusComponent>;
  let component: SfcStatusComponent;
  let utilityService: jasmine.SpyObj<UtilityService>;

  beforeEach(async () => {
    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);

    await TestBed.configureTestingModule({
      imports: [SfcStatusComponent],
      providers: [
        DynamicFormService,
        DynamicFormVisibilityService,
        { provide: UtilityService, useValue: utilityService },
      ],
    })
      .overrideComponent(SfcStatusComponent, {
        remove: {
          imports: [DynamicFormComponent, PreLoaderComponent],
        },
        add: {
          imports: [MockDynamicFormComponent, MockPreLoaderComponent],
        },
      })
      .compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(SfcStatusComponent);
    component = fixture.componentInstance;
  }

  function completeInitialLoad(): void {
    fixture.detectChanges();
    tick(1);
    fixture.detectChanges();
  }

  function getControl(controlName: string): AbstractControl<unknown, unknown> | null {
    return component.form.get(controlName);
  }

  it('creates the component and initializes the dynamic form questions', fakeAsync(() => {
    createComponent();

    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isLoading()).toBeTrue();

    tick(1);
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(component.fields().length).toBe(7);
    expect(component.visibleFields().map((field) => field.key)).toEqual([
      'stateName',
      'actionTakenReport',
      'sfcActive',
      'sfcTerm',
      'sfcReportStatus',
      'applicableSfcGrantCalculation',
      'applicableSfcReportSubmissionDate',
    ]);
    expect(Object.keys(component.form.controls)).toEqual([
      'stateName',
      'actionTakenReport',
      'sfcActive',
      'sfcTerm',
      'sfcReportStatus',
      'applicableSfcGrantCalculation',
      'applicableSfcReportSubmissionDate',
    ]);
    expect(fixture.nativeElement.querySelectorAll('app-dynamic-form').length).toBe(7);
  }));

  it('hides dependent fields when the controller changes and preserves their values', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const sfcTermControl = getControl('sfcTerm');
    const reportStatusControl = getControl('sfcReportStatus');

    sfcTermControl?.setValue('Sixth SFC');
    reportStatusControl?.setValue('Submitted');
    getControl('sfcActive')?.setValue('no');
    fixture.detectChanges();

    expect(component.visibleFields().map((field) => field.key)).not.toContain('sfcTerm');
    expect(component.visibleFields().map((field) => field.key)).not.toContain('sfcReportStatus');
    expect(sfcTermControl?.disabled).toBeTrue();
    expect(reportStatusControl?.disabled).toBeTrue();
    expect(sfcTermControl?.value).toBe('Sixth SFC');
    expect(reportStatusControl?.value).toBe('Submitted');
  }));

  it('shows validation feedback instead of submitting an invalid form', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    component.onSubmit();

    expect(getControl('actionTakenReport')?.touched).toBeTrue();
    expect(getControl('sfcTerm')?.touched).toBeTrue();
    expect(getControl('sfcTerm')?.invalid).toBeTrue();
    expect(getControl('applicableSfcGrantCalculation')?.touched).toBeTrue();
    expect(getControl('applicableSfcGrantCalculation')?.invalid).toBeTrue();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Please correct the errors in the form before submitting.',
      'snackbar-danger',
    );
  }));

  it('submits only the currently visible payload when the form is valid', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const logSpy = spyOn(console, 'log');

    getControl('actionTakenReport')?.setValue({
      fileName: 'action-taken-report.pdf',
      fileUrl: '/objects/action-taken-report.pdf',
      fileSize: 2048,
      mimeType: 'application/pdf',
    });
    getControl('sfcTerm')?.setValue('Sixth SFC');
    getControl('sfcReportStatus')?.setValue('Submitted');
    getControl('sfcActive')?.setValue('no');
    getControl('applicableSfcGrantCalculation')?.setValue(new Date(2026, 5, 15));
    getControl('applicableSfcReportSubmissionDate')?.setValue('19-01-2024');
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();

    component.onSubmit();

    const payload = logSpy.calls.mostRecent().args[1] as Record<string, unknown>;

    expect(payload['stateName']).toBe('Andhra Pradesh');
    expect(payload['actionTakenReport']).toEqual({
      fileName: 'action-taken-report.pdf',
      fileUrl: '/objects/action-taken-report.pdf',
      fileSize: 2048,
      mimeType: 'application/pdf',
    });
    expect(payload['sfcActive']).toBe('no');
    expect(payload['applicableSfcGrantCalculation']).toBe('2026-06-15T00:00:00.000Z');
    expect(payload['applicableSfcReportSubmissionDate']).toBe('19-01-2024');
    expect(payload['sfcTerm']).toBeUndefined();
    expect(payload['sfcReportStatus']).toBeUndefined();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith('Form submitted successfully!');
  }));

  it('applies the configured min and max date validation to applicableSfcGrantCalculation', fakeAsync(() => {
    createComponent();
    completeInitialLoad();

    const control = getControl('applicableSfcGrantCalculation');

    control?.setValue(new Date(2026, 0, 31));
    control?.updateValueAndValidity();
    expect(control?.hasError('minDate')).toBeTrue();

    control?.setValue(new Date(2027, 0, 1));
    control?.updateValueAndValidity();
    expect(control?.hasError('maxDate')).toBeTrue();

    control?.setValue(new Date(2026, 5, 15));
    control?.updateValueAndValidity();
    expect(control?.hasError('minDate')).toBeFalse();
    expect(control?.hasError('maxDate')).toBeFalse();
  }));

  it('keeps readonly date controls enabled so their values stay visible in form state', () => {
    createComponent();

    component.fields.set([
      {
        formFieldType: 'date',
        label: 'Readonly date',
        key: 'readonlyDate',
        readonly: true,
        minDate: '2026-02-01',
        maxDate: '2026-12-31',
      } as ConditionalFieldConfig,
    ]);

    component.createFormControls();

    const control = component.form.get('readonlyDate');

    expect(component.fields()[0].readonly).toBeTrue();
    expect(control).toBeTruthy();
    expect(control?.disabled).toBeFalse();
  });

  it('stops control creation and reports invalid field configuration', () => {
    createComponent();

    component.fields.set([
      {
        formFieldType: 'text',
        label: 'Broken field',
      } as ConditionalFieldConfig,
    ]);

    component.createFormControls();

    expect(Object.keys(component.form.controls)).toEqual([]);
    expect(component.isLoading()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledOnceWith(
      'Invalid field configuration.',
      'snackbar-danger',
    );
  });
});
