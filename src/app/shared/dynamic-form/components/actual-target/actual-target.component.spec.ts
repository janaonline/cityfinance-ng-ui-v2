import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FieldConfig } from '../../field.interface';
import { ActualTargetComponent } from './actual-target.component';

describe('ActualTargetComponent', () => {
  let component: ActualTargetComponent;
  let fixture: ComponentFixture<ActualTargetComponent>;

  function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
    return {
      key: 'ind1',
      label: 'Per capita supply of water',
      formFieldType: 'actualTarget',
      required: true,
      validations: [
        { name: 'required', validator: null, message: 'Both actual and target are required.' },
        { name: 'min', validator: 0, message: 'Value cannot be negative.' },
        { name: 'max', validator: 1000, message: 'Value cannot exceed 1000.' },
      ],
      inputCardConfig: { suffixText: 'lpcd' },
      ...overrides,
    } as FieldConfig;
  }

  function createGroup(key = 'ind1', actual: number | null = null, target: number | null = null): FormGroup {
    return new FormGroup({
      [key]: new FormGroup({
        actual: new FormControl(actual, [Validators.min(0), Validators.max(1000), Validators.required]),
        target: new FormControl(target, [Validators.min(0), Validators.max(1000), Validators.required]),
      }),
    });
  }

  function setup(field: FieldConfig, group: FormGroup): void {
    fixture = TestBed.createComponent(ActualTargetComponent);
    component = fixture.componentInstance;
    component.field = field;
    component.group = group;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualTargetComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();
  });

  it('renders both an Actual and a Target number input bound to the nested sub-group', () => {
    setup(createField(), createGroup('ind1', 10, 20));

    const actualInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="ind1_actual-test"]');
    const targetInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="ind1_target-test"]');

    expect(actualInput).toBeTruthy();
    expect(targetInput).toBeTruthy();
    expect(actualInput.value).toBe('10');
    expect(targetInput.value).toBe('20');
  });

  it('renders the unit suffix next to both inputs', () => {
    setup(createField(), createGroup());

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('lpcd');
  });

  it('updates the actual sub-control independently of target', () => {
    setup(createField(), createGroup());

    const actualInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="ind1_actual-test"]');
    actualInput.value = '150';
    actualInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.pairGroup.get('actual')?.value).toBe(150);
    expect(component.pairGroup.get('target')?.value).toBeNull();
  });

  it('shows the required error message once the actual control is touched and empty', () => {
    setup(createField(), createGroup());

    const control = component.pairGroup.get('actual');
    control?.markAsTouched();
    control?.updateValueAndValidity();
    fixture.detectChanges();

    expect(component.hasError('actual', 'required')).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Both actual and target are required.');
  });

  it('shows the max error message when the target value exceeds the configured max', () => {
    setup(createField(), createGroup('ind1', 10, 5000));

    const control = component.pairGroup.get('target');
    control?.markAsTouched();
    control?.updateValueAndValidity();
    fixture.detectChanges();

    expect(component.hasError('target', 'max')).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Value cannot exceed 1000.');
  });
});
