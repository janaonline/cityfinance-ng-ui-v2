import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Rejects a value carrying more decimal places than `maxPlaces` allows — `maxPlaces === 0` means
 * "whole numbers only". Pairs with `FieldConfig.decimal`/a `{ name: 'decimal', validator: N }`
 * dynamic-form validations entry (see `DynamicFormService.bindValidations`'s `'decimal'` case),
 * which until now only fed the keystroke-blocking `DecimalLimitDirective` — never a real
 * `FormControl` error, so a pasted or programmatically-set non-integer value went unenforced.
 * `null` for an empty control — pair with `Validators.required` when the field is mandatory.
 */
export function decimalPlacesValidator(maxPlaces: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;

    const pattern = maxPlaces === 0 ? /^-?\d+$/ : new RegExp(`^-?\\d+(\\.\\d{1,${maxPlaces}})?$`);
    return pattern.test(String(value)) ? null : { decimal: true };
  };
}
