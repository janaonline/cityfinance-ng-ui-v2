import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FieldConfig } from '../../field.interface';
import { InputComponent } from './input.component';

describe('InputComponent data-cy selectors', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
    return {
      key: 'testInput',
      label: 'Test Input',
      formFieldType: 'text',
      validations: [],
      ...overrides,
    } as FieldConfig;
  }

  function createGroup(key = 'testInput', value = ''): FormGroup {
    return new FormGroup({ [key]: new FormControl(value) });
  }

  function setup(field: FieldConfig, group: FormGroup): void {
    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    component.field = field;
    component.group = group;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();
  });

  it('renders data-cy on a text input', () => {
    setup(createField({ key: 'myField', formFieldType: 'text' }), createGroup('myField'));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="myField-test"]');
    expect(input).toBeTruthy();
    expect(input.tagName.toLowerCase()).toBe('input');
  });

  it('renders data-cy on a number input', () => {
    setup(createField({ key: 'myNumber', formFieldType: 'number' }), createGroup('myNumber'));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="myNumber-test"]');
    expect(input).toBeTruthy();
  });

  it('renders data-cy on an amount input', () => {
    setup(createField({ key: 'grantAmount', formFieldType: 'amount' }), createGroup('grantAmount'));
    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="grantAmount-test"]');
    expect(input).toBeTruthy();
  });

  it('does not set data-cy when field.key is empty string', () => {
    const field = createField({ formFieldType: 'text' });
    (field as any).key = '';
    setup(field, new FormGroup({}));
    const el = fixture.nativeElement.querySelector('[data-cy]');
    expect(el).toBeNull();
  });
});
