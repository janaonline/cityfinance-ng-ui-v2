import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerToggle } from '@angular/material/datepicker';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FieldConfig, Validator } from '../../field.interface';
import { DateComponent } from './date.component';

@Component({
  standalone: true,
  imports: [HttpClientTestingModule, RouterTestingModule, DateComponent],
  template: `<app-date [field]="field" [group]="group"></app-date>`,
})
class HostComponent {
  group = new FormGroup({
    startDate: new FormControl<Date | string | null>(null),
  });

  field: FieldConfig = createField();
}

function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
  return {
    key: 'startDate',
    label: 'Start date',
    validations: [],
    ...overrides,
  } as FieldConfig;
}

function createValidation(name: string, message: string, validator?: unknown): Validator {
  return { name, message, validator } as Validator;
}

function dateOnly(year: number, month: number, day: number): Date {
  const value = new Date(year, month - 1, day);
  value.setHours(0, 0, 0, 0);
  return value;
}

describe('DateComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, HostComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getComponent(): DateComponent {
    return fixture.debugElement.query(By.directive(DateComponent)).componentInstance;
  }

  function getInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }

  function getToggle(): MatDatepickerToggle<unknown> {
    return fixture.debugElement.query(By.directive(MatDatepickerToggle)).componentInstance;
  }

  function getErrorTexts(): string[] {
    return fixture.debugElement
      .queryAll(By.css('mat-error'))
      .map((node) => node.nativeElement.textContent.trim());
  }

  it('resolves minDate and maxDate from direct field config', () => {
    host.field = createField({
      minDate: '2024-03-10',
      maxDate: '2024-03-20',
    });

    fixture.detectChanges();

    const component = getComponent();

    expect(component.minDate?.getTime()).toBe(dateOnly(2024, 3, 10).getTime());
    expect(component.maxDate?.getTime()).toBe(dateOnly(2024, 3, 20).getTime());
  });

  it('falls back to validation.validator when field minDate and maxDate are not provided', () => {
    host.field = createField({
      validations: [
        createValidation('minDate', 'Custom min', '2024-03-05'),
        createValidation('maxDate', 'Custom max', '2024-03-25'),
      ],
    });

    fixture.detectChanges();

    const component = getComponent();

    expect(component.minDate?.getTime()).toBe(dateOnly(2024, 3, 5).getTime());
    expect(component.maxDate?.getTime()).toBe(dateOnly(2024, 3, 25).getTime());
  });

  it('marks the input readonly, disables the datepicker toggle, and uses fill appearance when readonly is true', () => {
    host.field = createField({ readonly: true });

    fixture.detectChanges();

    const component = getComponent();
    const input = getInput();
    const toggle = getToggle();

    expect(component.isReadonly).toBeTrue();
    expect(component.appearance).toBe('fill');
    expect(input.readOnly).toBeTrue();
    expect(toggle.disabled).toBeTrue();
  });

  it('uses outline appearance and leaves the datepicker toggle enabled when readonly is false', () => {
    host.field = createField({ readonly: false });

    fixture.detectChanges();

    const component = getComponent();
    const input = getInput();
    const toggle = getToggle();

    expect(component.isReadonly).toBeFalse();
    expect(component.appearance).toBe('outline');
    expect(input.readOnly).toBeFalse();
    expect(toggle.disabled).toBeFalse();
  });

  it('displays selected date values in DD Mon YYYY format', () => {
    host.group.get('startDate')?.setValue(dateOnly(2026, 1, 2));

    fixture.detectChanges();

    expect(getInput().value).toBe('02 Jan 2026');
  });

  it('loads ISO date-time values without shifting the displayed calendar day', () => {
    host.group.get('startDate')?.setValue('2026-01-02T00:00:00.000Z');

    fixture.detectChanges();

    expect(getInput().value).toBe('02 Jan 2026');
  });

  it('builds default parse, minDate, and maxDate messages when they are not explicitly configured', () => {
    host.field = createField({
      minDate: '2024-03-10',
      maxDate: '2024-03-20',
      validations: [],
    });

    fixture.detectChanges();

    const component = getComponent();

    expect(component.validationMessages).toEqual([
      { name: 'matDatepickerParse', message: 'Enter a valid date.' },
      { name: 'minDate', message: 'Date must be on or after 10 Mar 2024.' },
      { name: 'maxDate', message: 'Date must be on or before 20 Mar 2024.' },
    ]);
  });

  it('preserves custom validation messages and does not add duplicate defaults', () => {
    host.field = createField({
      validations: [
        createValidation('matDatepickerParse', 'Use a valid date.'),
        createValidation('minDate', 'Start date is too early.', '2024-03-10'),
        createValidation('maxDate', 'Start date is too late.', '2024-03-20'),
      ],
    });

    fixture.detectChanges();

    const component = getComponent();

    expect(component.validationMessages).toEqual([
      { name: 'matDatepickerParse', message: 'Use a valid date.' },
      { name: 'minDate', message: 'Start date is too early.' },
      { name: 'maxDate', message: 'Start date is too late.' },
    ]);

    expect(component.validationMessages.filter((x) => x.name === 'matDatepickerParse')).toHaveSize(
      1,
    );
    expect(component.validationMessages.filter((x) => x.name === 'minDate')).toHaveSize(1);
    expect(component.validationMessages.filter((x) => x.name === 'maxDate')).toHaveSize(1);
  });

  it('shows the minDate message when Angular Material raises matDatepickerMin', () => {
    host.field = createField({
      minDate: '2024-03-10',
    });

    fixture.detectChanges();

    const control = host.group.get('startDate')!;
    control.setErrors({ matDatepickerMin: true });
    control.markAsTouched();
    fixture.detectChanges();

    expect(getErrorTexts()).toEqual(['Date must be on or after 10 Mar 2024.']);
  });

  it('shows the maxDate message when the control has a custom maxDate error', () => {
    host.field = createField({
      maxDate: '2024-03-20',
    });

    fixture.detectChanges();

    const control = host.group.get('startDate')!;
    control.setErrors({ maxDate: true });
    control.markAsTouched();
    fixture.detectChanges();

    expect(getErrorTexts()).toEqual(['Date must be on or before 20 Mar 2024.']);
  });

  it('shows the default parse message when the control has a matDatepickerParse error', () => {
    host.field = createField();

    fixture.detectChanges();

    const control = host.group.get('startDate')!;
    control.setErrors({
      matDatepickerParse: { text: 'invalid' },
    });
    control.markAsTouched();
    fixture.detectChanges();

    expect(getErrorTexts()).toEqual(['Enter a valid date.']);
  });

  it('keeps Angular Material parse validation active for invalid manual input', () => {
    const input = getInput();
    const control = host.group.get('startDate')!;

    input.value = 'not-a-date';
    input.dispatchEvent(new Event('input'));
    control.markAsTouched();
    fixture.detectChanges();

    expect(control.hasError('matDatepickerParse')).toBeTrue();
    expect(getErrorTexts()).toEqual(['Enter a valid date.']);
  });

  it('shows no validation errors when the control has no matching errors', () => {
    host.field = createField({
      minDate: '2024-03-10',
      maxDate: '2024-03-20',
    });

    fixture.detectChanges();

    expect(getErrorTexts()).toEqual([]);
  });

  it('builds default messages when validations is an empty array', () => {
    host.field = createField({
      minDate: '2024-03-10',
      maxDate: '2024-03-20',
      validations: [],
    });

    fixture.detectChanges();

    const component = getComponent();

    expect(component.validationMessages).toEqual([
      { name: 'matDatepickerParse', message: 'Enter a valid date.' },
      { name: 'minDate', message: 'Date must be on or after 10 Mar 2024.' },
      { name: 'maxDate', message: 'Date must be on or before 20 Mar 2024.' },
    ]);
  });

  it('returns null from control and no active errors when the form does not contain the field key', () => {
    host.field = createField({
      key: 'missingDateControl',
      label: 'Missing date control',
    });

    fixture.detectChanges();

    const component = getComponent();

    expect(component.control).toBeNull();
    expect(component.activeErrors).toEqual([]);
  });
});
