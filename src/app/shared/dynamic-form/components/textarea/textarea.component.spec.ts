import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FieldConfig, Validator } from '../../field.interface';
import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
    return {
      key: 'description',
      label: 'Description',
      readonly: false,
      validations: [],
      ...overrides,
    } as FieldConfig;
  }

  function createGroup(initialValue = ''): FormGroup {
    return new FormGroup({ description: new FormControl(initialValue) });
  }

  it('should create', () => {
    component.field = createField();
    component.group = createGroup();

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should use the input filed label in the DOM', () => {
    component.field = createField({ label: 'Comments' });
    component.group = createGroup();

    fixture.detectChanges();
    const labelElement: HTMLElement = fixture.nativeElement.querySelector(
      '[data-testid="field-label"]',
    );

    expect(labelElement).toBeTruthy();
    expect(labelElement.textContent?.trim()).toBe('Comments');
  });

  it('should render the initial form control value in textarea', () => {
    component.field = createField();
    component.group = createGroup('Initial text');

    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector(
      '[data-testid="field-textarea"]',
    );

    expect(textarea).toBeTruthy();
    expect(textarea.value).toBe('Initial text');
  });

  it('should update the FormControl value when the user types into the textarea', () => {
    component.field = createField();
    component.group = createGroup();
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector(
      '[data-testid="field-textarea"]',
    );

    textarea.value = 'New user text';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.group.get('description')?.value).toBe('New user text');
  });

  it('should set the textarea to readonly when field.readonly is true', () => {
    component.field = createField({ readonly: true });
    component.group = createGroup('Locked value');

    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector(
      '[data-testid="field-textarea"]',
    );

    expect(component.readonly()).toBeTrue();
    expect(textarea.readOnly).toBeTrue();
  });

  it('should keep the textarea editable when field.readonly is false', () => {
    component.field = createField({ readonly: false });
    component.group = createGroup('Editable value');

    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector(
      '[data-testid="field-textarea"]',
    );

    expect(component.readonly()).toBeFalse();
    expect(textarea.readOnly).toBeFalse();
  });

  it('should return true from hasError() when the control has that validation error', () => {
    component.field = createField();
    component.group = new FormGroup({
      description: new FormControl('', Validators.required),
    });
    fixture.detectChanges();

    const result = component.hasError('description', 'required');

    expect(result).toBeTrue();
  });

  it('should return false from hasError() when the control does not have that validation error', () => {
    component.field = createField();
    component.group = new FormGroup({
      description: new FormControl('Valid text', Validators.required),
    });
    fixture.detectChanges();

    const result = component.hasError('description', 'required');

    expect(result).toBeFalse();
  });

  it('should render a validation error message when the control has an error', () => {
    component.field = createField({
      validations: [
        {
          name: 'required',
          message: 'Description is required',
        } as Validator,
      ],
    });
    component.group = new FormGroup({
      description: new FormControl('', Validators.required),
    });
    const control = component.group.get('description') as FormControl;
    control.markAsTouched();
    control.updateValueAndValidity();

    fixture.detectChanges();
    const errorElement: HTMLTextAreaElement = fixture.nativeElement.querySelector(
      '[data-testid="field-error"]',
    );

    expect(component.hasError('description', 'required')).toBeTrue();
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent?.trim()).toBe('Description is required');
  });

  it('should handle an empty validations array without rendering any errors', () => {
    component.field = createField({ validations: [] });
    component.group = createGroup('');

    fixture.detectChanges();
    const errorElements = fixture.nativeElement.querySelectorAll('[data-testid="field-error"]');

    expect(component.validations()).toEqual([]);
    expect(errorElements.length).toBe(0);
  });

  it('should bind to a different control key when field.key changes', () => {
    component.field = createField({
      key: 'notes',
      label: 'Notes',
    });
    component.group = new FormGroup({
      notes: new FormControl('Note value'),
    });

    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector(
      '[data-testid="field-textarea"]',
    );

    expect(textarea.value).toBe('Note value');
    expect(component.group.get('notes')?.value).toBe('Note value');
  });
});
