import { FormControl, NgControl } from '@angular/forms';
import { TrimOnBlurDirective } from './trim-on-blur.directive';

describe('TrimOnBlurDirective', () => {
  function createDirective(initialValue: unknown, withControl = true) {
    const control = withControl ? new FormControl(initialValue) : null;
    const ngControl = { control } as Partial<NgControl> as NgControl;

    return {
      directive: new TrimOnBlurDirective(ngControl),
      control,
    };
  }

  it('trims leading and trailing whitespace on blur', () => {
    const { directive, control } = createDirective('  City Finance  ');
    const setValueSpy = spyOn(control!, 'setValue').and.callThrough();

    directive.onBlur();

    expect(setValueSpy).toHaveBeenCalledOnceWith('City Finance');
    expect(control?.value).toBe('City Finance');
  });

  it('converts whitespace-only strings to an empty string', () => {
    const { directive, control } = createDirective('   ');
    const setValueSpy = spyOn(control!, 'setValue').and.callThrough();

    directive.onBlur();

    expect(setValueSpy).toHaveBeenCalledOnceWith('');
    expect(control?.value).toBe('');
  });

  it('does not update the control when the value is an empty string', () => {
    const { directive, control } = createDirective('');
    const setValueSpy = spyOn(control!, 'setValue').and.callThrough();

    directive.onBlur();

    expect(setValueSpy).not.toHaveBeenCalled();
    expect(control?.value).toBe('');
  });

  it('does not update the control when the value is not a string', () => {
    const { directive, control } = createDirective(42);
    const setValueSpy = spyOn(control!, 'setValue').and.callThrough();

    directive.onBlur();

    expect(setValueSpy).not.toHaveBeenCalled();
    expect(control?.value).toBe(42);
  });

  it('safely ignores blur when no control is attached', () => {
    const { directive } = createDirective('value', false);

    expect(() => directive.onBlur()).not.toThrow();
  });
});
