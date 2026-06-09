import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RadiobuttonComponent } from './radiobutton.component';
import { FieldConfig } from '../../field.interface';

const BASIC_FIELD: FieldConfig = {
  formFieldType: 'radio',
  label: 'Test radio',
  key: 'choice',
  options: [
    { label: 'Option A', id: 'a' },
    { label: 'Option B', id: 'b' },
  ],
  validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
};

function setup(field: FieldConfig, initialValue: unknown = null): {
  fixture: ComponentFixture<RadiobuttonComponent>;
  component: RadiobuttonComponent;
} {
  const fb = new FormBuilder();
  const group = fb.group({
    [field.key]: [initialValue, Validators.required],
  });

  TestBed.configureTestingModule({
    imports: [RadiobuttonComponent, ReactiveFormsModule, NoopAnimationsModule],
  }).compileComponents();

  const fixture = TestBed.createComponent(RadiobuttonComponent);
  fixture.componentInstance.field = field;
  fixture.componentInstance.group = group;
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('RadiobuttonComponent', () => {
  describe('error display', () => {
    it('does not show required error on initial page load', () => {
      const { fixture } = setup(BASIC_FIELD);
      const error = fixture.nativeElement.querySelector('mat-error');
      expect(error).toBeNull();
    });

    it('shows required error after control is touched', () => {
      const { fixture, component } = setup(BASIC_FIELD);

      const control = component.group.get('choice')!;
      control.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('mat-error');
      expect(error).toBeTruthy();
      expect(error.textContent.trim()).toBe('This field is required.');
    });

    it('shows required error after control is dirtied', () => {
      const { fixture, component } = setup(BASIC_FIELD);

      const control = component.group.get('choice')!;
      control.markAsDirty();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('mat-error');
      expect(error).toBeTruthy();
    });

    it('shows required error after form.markAllAsTouched()', () => {
      const { fixture, component } = setup(BASIC_FIELD);

      component.group.markAllAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('mat-error');
      expect(error).toBeTruthy();
      expect(error.textContent.trim()).toBe('This field is required.');
    });

    it('does not show error when control is valid', () => {
      const { fixture, component } = setup(BASIC_FIELD);

      const control = component.group.get('choice')!;
      control.setValue('a');
      control.markAsTouched();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('mat-error');
      expect(error).toBeNull();
    });

    it('does not show error for a disabled control', () => {
      const { fixture, component } = setup(BASIC_FIELD);

      const control = component.group.get('choice')!;
      control.disable();
      control.markAsTouched();
      fixture.detectChanges();

      // Disabled control — hasError returns false
      expect(component.hasError('choice', 'required')).toBeFalse();
      const error = fixture.nativeElement.querySelector('mat-error');
      expect(error).toBeNull();
    });
  });

  describe('hasError()', () => {
    it('returns false when control is untouched even if invalid', () => {
      const { component } = setup(BASIC_FIELD);
      expect(component.hasError('choice', 'required')).toBeFalse();
    });

    it('returns true when control is invalid and touched', () => {
      const { component } = setup(BASIC_FIELD);
      component.group.get('choice')!.markAsTouched();
      expect(component.hasError('choice', 'required')).toBeTrue();
    });

    it('returns true when control is invalid and dirty', () => {
      const { component } = setup(BASIC_FIELD);
      component.group.get('choice')!.markAsDirty();
      expect(component.hasError('choice', 'required')).toBeTrue();
    });

    it('returns false when control has a value (no error)', () => {
      const { component } = setup(BASIC_FIELD, 'a');
      component.group.get('choice')!.markAsTouched();
      expect(component.hasError('choice', 'required')).toBeFalse();
    });
  });

  describe('radio layout', () => {
    it('applies radio-group--horizontal class by default (no radioLayout)', () => {
      const { fixture } = setup(BASIC_FIELD);
      const group = fixture.debugElement.query(By.css('mat-radio-group'));
      expect(group.nativeElement.classList).toContain('radio-group--horizontal');
      expect(group.nativeElement.classList).not.toContain('radio-group--vertical');
    });

    it('applies radio-group--vertical class when radioLayout is vertical', () => {
      const verticalField: FieldConfig = { ...BASIC_FIELD, radioLayout: 'vertical' };
      const { fixture } = setup(verticalField);
      const group = fixture.debugElement.query(By.css('mat-radio-group'));
      expect(group.nativeElement.classList).toContain('radio-group--vertical');
      expect(group.nativeElement.classList).not.toContain('radio-group--horizontal');
    });

    it('applies radio-group--horizontal class when radioLayout is horizontal', () => {
      const horizontalField: FieldConfig = { ...BASIC_FIELD, radioLayout: 'horizontal' };
      const { fixture } = setup(horizontalField);
      const group = fixture.debugElement.query(By.css('mat-radio-group'));
      expect(group.nativeElement.classList).toContain('radio-group--horizontal');
    });
  });

  describe('value selection', () => {
    it('renders the correct number of radio buttons', () => {
      const { fixture } = setup(BASIC_FIELD);
      const buttons = fixture.debugElement.queryAll(By.css('mat-radio-button'));
      expect(buttons.length).toBe(2);
    });

    it('updates the form control value when a radio option is selected', () => {
      const { component } = setup(BASIC_FIELD);
      component.group.get('choice')!.setValue('b');
      expect(component.group.get('choice')!.value).toBe('b');
    });

    it('applies data-cy attributes to group and individual buttons', () => {
      const { fixture } = setup(BASIC_FIELD);
      const group = fixture.debugElement.query(By.css('[data-cy="choice-test"]'));
      const btnA = fixture.debugElement.query(By.css('[data-cy="choice-a-test"]'));
      const btnB = fixture.debugElement.query(By.css('[data-cy="choice-b-test"]'));
      expect(group).toBeTruthy();
      expect(btnA).toBeTruthy();
      expect(btnB).toBeTruthy();
    });
  });
});
