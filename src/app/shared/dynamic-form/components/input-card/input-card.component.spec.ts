import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputCardComponent } from './input-card.component';
import { FieldConfig } from '../../field.interface';

describe('InputCardComponent', () => {
  let fixture: ComponentFixture<InputCardComponent>;
  let component: InputCardComponent;

  function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
    return {
      key: 'testField',
      label: 'Test Label',
      formFieldType: 'input-card',
      validations: [],
      ...overrides,
    } as FieldConfig;
  }

  function makeGroup(key = 'testField', value = '', validators?: Parameters<typeof Validators.required>[0][]): FormGroup {
    return new FormBuilder().group({
      [key]: [value, ...(validators ? [validators] : [])],
    });
  }

  function setup(field: FieldConfig, group: FormGroup): void {
    fixture = TestBed.createComponent(InputCardComponent);
    component = fixture.componentInstance;
    component.field = field;
    component.group = group;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCardComponent, ReactiveFormsModule],
    }).compileComponents();
  });

  // ── Title resolution ─────────────────────────────────────────────────────────

  it('renders inputCardConfig.title when provided', () => {
    setup(createField({ inputCardConfig: { title: 'Card Title' } }), makeGroup());
    const el = fixture.nativeElement.querySelector('[data-testid="card-title"]') as HTMLElement;
    expect(el?.textContent?.trim()).toBe('Card Title');
  });

  it('falls back to field.label when inputCardConfig.title is absent', () => {
    setup(createField({ label: 'My Label' }), makeGroup());
    const el = fixture.nativeElement.querySelector('[data-testid="card-title"]') as HTMLElement;
    expect(el?.textContent?.trim()).toBe('My Label');
  });

  it('suppresses the title when hideLabel is true and no inputCardConfig.title', () => {
    setup(createField({ hideLabel: true }), makeGroup());
    expect(fixture.nativeElement.querySelector('[data-testid="card-title"]')).toBeNull();
  });

  it('still renders inputCardConfig.title even when hideLabel is true', () => {
    setup(createField({ hideLabel: true, inputCardConfig: { title: 'Explicit Title' } }), makeGroup());
    const el = fixture.nativeElement.querySelector('[data-testid="card-title"]') as HTMLElement;
    expect(el?.textContent?.trim()).toBe('Explicit Title');
  });

  // ── Description ───────────────────────────────────────────────────────────────

  it('renders description when provided', () => {
    setup(createField({ inputCardConfig: { description: 'Helpful hint' } }), makeGroup());
    const el = fixture.nativeElement.querySelector('[data-testid="card-description"]') as HTMLElement;
    expect(el?.textContent?.trim()).toContain('Helpful hint');
  });

  it('does not render description when absent', () => {
    setup(createField(), makeGroup());
    expect(fixture.nativeElement.querySelector('[data-testid="card-description"]')).toBeNull();
  });

  // ── Prefix / suffix ───────────────────────────────────────────────────────────

  it('renders prefix text', () => {
    setup(createField({ inputCardConfig: { prefixText: '₹' } }), makeGroup());
    const el = fixture.nativeElement.querySelector('[data-testid="input-prefix"]') as HTMLElement;
    expect(el?.textContent?.trim()).toBe('₹');
  });

  it('renders suffix text', () => {
    setup(createField({ inputCardConfig: { suffixText: 'Cr' } }), makeGroup());
    const el = fixture.nativeElement.querySelector('[data-testid="input-suffix"]') as HTMLElement;
    expect(el?.textContent?.trim()).toBe('Cr');
  });

  it('does not render prefix when absent', () => {
    setup(createField(), makeGroup());
    expect(fixture.nativeElement.querySelector('[data-testid="input-prefix"]')).toBeNull();
  });

  it('does not render suffix when absent', () => {
    setup(createField(), makeGroup());
    expect(fixture.nativeElement.querySelector('[data-testid="input-suffix"]')).toBeNull();
  });

  // ── Form control binding ──────────────────────────────────────────────────────

  it('renders an input element with the correct id and placeholder', () => {
    setup(createField({ key: 'myKey', placeholder: 'Enter here' }), new FormBuilder().group({ myKey: [''] }));
    const input = fixture.nativeElement.querySelector('input[data-testid="card-input"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.id).toBe('myKey');
    expect(input.placeholder).toBe('Enter here');
  });

  it('reflects the FormGroup control value in the input', () => {
    const group = makeGroup('testField', 'initial value');
    setup(createField(), group);
    const input = fixture.nativeElement.querySelector('[data-testid="card-input"]') as HTMLInputElement;
    expect(input.value).toBe('initial value');
  });

  it('updating the input updates the FormGroup control', () => {
    const group = makeGroup();
    setup(createField(), group);
    const input = fixture.nativeElement.querySelector('[data-testid="card-input"]') as HTMLInputElement;
    input.value = 'typed value';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(group.get('testField')?.value).toBe('typed value');
  });

  it('setting the FormGroup control value updates the input', () => {
    const group = makeGroup();
    setup(createField(), group);
    group.get('testField')?.setValue('set externally');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('[data-testid="card-input"]') as HTMLInputElement;
    expect(input.value).toBe('set externally');
  });

  // ── Validation ────────────────────────────────────────────────────────────────

  it('does not show an error when the control is pristine and untouched', () => {
    const group = new FormBuilder().group({ testField: ['', Validators.required] });
    setup(createField({ validations: [{ name: 'required', validator: null, message: 'Required.' }] }), group);
    expect(fixture.nativeElement.querySelector('[data-testid="card-error"]')).toBeNull();
    expect(component.showError).toBeFalse();
  });

  it('shows the required error when control is invalid and touched', () => {
    const group = new FormBuilder().group({ testField: ['', Validators.required] });
    setup(createField({ validations: [{ name: 'required', validator: null, message: 'Base value is required.' }] }), group);
    group.get('testField')?.markAsTouched();
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('[data-testid="card-error"]') as HTMLElement;
    expect(error?.textContent?.trim()).toBe('Base value is required.');
  });

  it('clears the error once the control becomes valid', () => {
    const group = new FormBuilder().group({ testField: ['', Validators.required] });
    setup(createField({ validations: [{ name: 'required', validator: null, message: 'Required.' }] }), group);
    group.get('testField')?.markAsTouched();
    fixture.detectChanges();
    group.get('testField')?.setValue('a value');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="card-error"]')).toBeNull();
  });

  it('applies is-invalid to the input when showError is true', () => {
    const group = new FormBuilder().group({ testField: ['', Validators.required] });
    setup(createField({ validations: [{ name: 'required', validator: null, message: 'Required.' }] }), group);
    group.get('testField')?.markAsTouched();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('[data-testid="card-input"]') as HTMLInputElement;
    expect(input.classList).toContain('is-invalid');
  });

  // ── Bootstrap structure / layout containment ─────────────────────────────────

  it('wraps the input in a Bootstrap input-group', () => {
    setup(createField(), makeGroup());
    expect(fixture.nativeElement.querySelector('.input-group')).toBeTruthy();
  });

  it('input has form-control class', () => {
    setup(createField(), makeGroup());
    const input = fixture.nativeElement.querySelector('[data-testid="card-input"]') as HTMLInputElement;
    expect(input.classList).toContain('form-control');
  });

  it('prefix uses input-group-text class', () => {
    setup(createField({ inputCardConfig: { prefixText: '₹' } }), makeGroup());
    const prefix = fixture.nativeElement.querySelector('[data-testid="input-prefix"]') as HTMLElement;
    expect(prefix.classList).toContain('input-group-text');
  });

  it('suffix uses input-group-text class', () => {
    setup(createField({ inputCardConfig: { suffixText: 'Cr' } }), makeGroup());
    const suffix = fixture.nativeElement.querySelector('[data-testid="input-suffix"]') as HTMLElement;
    expect(suffix.classList).toContain('input-group-text');
  });

  it('card has w-100 for full-width constrained layout', () => {
    setup(createField(), makeGroup());
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    expect(card.classList).toContain('w-100');
  });

  // ── data-cy selectors ─────────────────────────────────────────────────────────

  it('input has data-cy set to field.key + -test', () => {
    setup(createField({ key: 'grantAmount' }), new FormBuilder().group({ grantAmount: [''] }));
    const input = fixture.nativeElement.querySelector('[data-cy="grantAmount-test"]') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    expect(input?.tagName.toLowerCase()).toBe('input');
  });

  it('does not set data-cy when field.key is empty string', () => {
    const field = createField({ key: '' });
    setup(field, new FormBuilder().group({}));
    expect(fixture.nativeElement.querySelector('[data-cy]')).toBeNull();
  });
});
