import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { DATE_INPUT_DISPLAY_FORMAT } from '../../../../../../shared/dynamic-form/components/date/utc-iso-date-adapter';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import { ClaimLetterLetterDateAdapter } from './claim-letter-letter-date-adapter';
import { ClaimLetterLetterFieldComponent } from './claim-letter-letter-field.component';

const TEXT: ConditionalFieldConfig = {
  key: 'letterNo',
  formFieldType: 'text',
  label: 'Letter number',
  placeholder: 'Letter No.',
  hintText: 'As on your file.',
  validations: [{ name: 'maxlength', validator: 5, message: 'At most 5 characters.' }],
};

describe('ClaimLetterLetterFieldComponent', () => {
  let fixture: ComponentFixture<ClaimLetterLetterFieldComponent>;

  function render(field: ConditionalFieldConfig, control: FormControl): HTMLElement {
    fixture = TestBed.createComponent(ClaimLetterLetterFieldComponent);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ClaimLetterLetterFieldComponent, NoopAnimationsModule] });
  });

  it('draws a text box with the formjson placeholder and label, and commits on blur', () => {
    const el = render(TEXT, new FormControl(''));
    const committed: string[] = [];
    fixture.componentInstance.committed.subscribe((key) => committed.push(key));

    const input = el.querySelector<HTMLInputElement>('input#cl-field-letterNo')!;
    expect(el.querySelector('.cl-sizer-ghost')?.textContent?.trim()).toBe('Letter No.');
    expect(input.getAttribute('aria-label')).toBe('Letter number');
    expect(input.getAttribute('maxlength')).toBe('5');
    expect(el.querySelector('.cl-box')!.classList).not.toContain('cl-box-filled');
    expect(fixture.componentInstance.tooltip()).toBe('Letter number - As on your file.');
    expect(el.querySelector('.cl-required')).toBeNull();

    input.dispatchEvent(new Event('blur'));
    expect(committed).toEqual(['letterNo']);
  });

  it('marks a filled box and hides its placeholder', () => {
    const control = new FormControl('');
    const el = render(TEXT, control);

    control.setValue('UD/7');
    fixture.detectChanges();

    expect(el.querySelector('.cl-box')!.classList).toContain('cl-box-filled');
    expect(el.querySelector('.cl-sizer-ghost')).toBeNull();
    expect(el.querySelector('.cl-sizer')?.textContent?.trim()).toBe('UD/7');
  });

  it('shows the formjson message for a failing rule once touched, and a server message as sent', () => {
    const control = new FormControl('toolong', Validators.maxLength(5));
    const el = render(TEXT, control);
    expect(el.querySelector('.cl-field-error')).toBeNull();

    control.markAsTouched();
    fixture.detectChanges();
    expect(el.querySelector('.cl-field-error')?.textContent).toBe('At most 5 characters.');

    control.setErrors({ server: 'Enter text.' });
    fixture.detectChanges();
    expect(el.querySelector('.cl-field-error')?.textContent).toBe('Enter text.');
    expect(el.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('.cl-box')!.classList).toContain('cl-box-invalid');
  });

  it('draws a Yes/No select for a radio field, marks it required and commits on change', () => {
    const field: ConditionalFieldConfig = {
      key: 'gtcTransferredInTime',
      formFieldType: 'radio',
      label: 'Transferred in time?',
      placeholder: 'Yes / No',
      required: true,
      options: [
        { label: 'Yes', id: 'yes' },
        { label: 'No', id: 'no' },
      ],
      validations: [],
    };
    const control = new FormControl('');
    const el = render(field, control);
    const committed: string[] = [];
    fixture.componentInstance.committed.subscribe((key) => committed.push(key));

    const select = el.querySelector<HTMLSelectElement>('select')!;
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual(['Yes / No', 'Yes', 'No']);
    expect(el.querySelector('.cl-sizer-ghost .cl-required')?.textContent).toBe('*');

    select.value = 'no';
    select.dispatchEvent(new Event('change'));
    expect(control.value).toBe('no');
    expect(committed).toEqual(['gtcTransferredInTime']);
  });

  it('draws a growing text area for a textarea field', () => {
    const el = render({ ...TEXT, key: 'departmentAddress', formFieldType: 'textarea' }, new FormControl('Block 4'));

    const textarea = el.querySelector<HTMLTextAreaElement>('textarea#cl-field-departmentAddress')!;
    expect(textarea.value).toBe('Block 4');
    expect(el.querySelector('.cl-field-wide')).not.toBeNull();
  });

  it('shows a saved date the way the letter prints it', () => {
    const field: ConditionalFieldConfig = {
      key: 'sfcAtrDate',
      formFieldType: 'date',
      label: 'ATR date',
      placeholder: 'DD Mon YYYY',
      validations: [{ name: 'maxDate', validator: 'TODAY', message: 'Not in the future.' }],
    };
    const el = render(field, new FormControl('2026-09-18T00:00:00.000Z'));

    expect(el.querySelector<HTMLInputElement>('input#cl-field-sfcAtrDate')?.value).toBe('18 Sep 2026');
    expect(fixture.componentInstance.maxDate()).not.toBeNull();
    // Sized for "18 Sep 2026", not the stored ISO string.
    expect(el.querySelector('.cl-sizer')?.textContent?.trim()).toBe('00 Mmm 0000');
    expect(el.querySelector('.cl-box .cl-date-button')).not.toBeNull();
  });
});

describe('ClaimLetterLetterDateAdapter', () => {
  it('shows "18 Sep 2026", reads typed text either way and rejects impossible dates', () => {
    const adapter = TestBed.runInInjectionContext(() => new ClaimLetterLetterDateAdapter());

    expect(adapter.format(new Date(2026, 8, 18), DATE_INPUT_DISPLAY_FORMAT)).toBe('18 Sep 2026');
    expect(adapter.parse('18 Sep 2026', DATE_INPUT_DISPLAY_FORMAT)).toEqual(new Date(2026, 8, 18));
    expect(adapter.parse('5/11/2026', DATE_INPUT_DISPLAY_FORMAT)).toEqual(new Date(2026, 10, 5));
    expect(adapter.isValid(adapter.parse('31/02/2026', DATE_INPUT_DISPLAY_FORMAT)!)).toBeFalse();
  });
});
