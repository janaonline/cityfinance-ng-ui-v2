import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Group-level validator for an `{ actual, target }` FormGroup (see `createActualTargetGroup`
 * in dynamic-form.service.ts): sets an `actualLessThanOrEqualToTarget` error on the `target`
 * control whenever both values are present numbers and `actual > target`. Preserves any other
 * errors already set on `target` (e.g. min/max) rather than clobbering them, unlike
 * `compareFieldsValidator`.
 */
export function actualLessThanOrEqualToTargetValidator(group: AbstractControl): null {
  const actualControl = group.get('actual');
  const targetControl = group.get('target');
  if (!actualControl || !targetControl) return null;

  const actual = actualControl.value;
  const target = targetControl.value;
  const fails = typeof actual === 'number' && typeof target === 'number' && actual > target;

  const existingErrors = targetControl.errors;
  if (fails) {
    targetControl.setErrors({ ...existingErrors, actualLessThanOrEqualToTarget: true });
  } else if (existingErrors?.['actualLessThanOrEqualToTarget']) {
    const { actualLessThanOrEqualToTarget: _removed, ...rest } = existingErrors;
    targetControl.setErrors(Object.keys(rest).length ? rest : null);
  }
  return null;
}

export function compareFieldsValidator(controlName: string, matchingControlName: string, type: string) {
  return (group: AbstractControl) => {
    const control = group.get(controlName)?.get('value');

    const matchingControl = group.get(matchingControlName)?.get('value');

    if (!control || !matchingControl) {
      return null;
    }

    // return if another validator has already found an error on the matchingControl
    // if (matchingControl.errors && !matchingControl.errors['lessThan']) {
    if (control.errors && !control.errors[type]) {
      return null;
    }

    // set error on matchingControl if validation fails
    // console.log('control.value', control.value, 'matchingControl.value', matchingControl.value);

    // 2024 > 2011
    if (type === 'greaterThanEqualTo' && control.value < matchingControl.value) {
      // matchingControl.setErrors({ lessThan: true });
      control.setErrors({ [type]: true });
    } else if (type === 'lessThan' && control.value > matchingControl.value) {
      // matchingControl.setErrors({ lessThan: true });
      control.setErrors({ [type]: true });
    } else {
      control.setErrors(null);
    }
    return null;
  };
}

/**
 * Cross-field equality check for flat FormGroups (plain `FormControl`s directly under the group,
 * as built by `DynamicFormService.toFormGroup()`) — unlike `compareFieldsValidator` above, this
 * does not navigate into a `.get('value')` sub-control, since `toFormGroup()`'s controls don't
 * have one. Sets/clears a `matchesField` error on `fieldKey`'s own control (the field that
 * declared `matchesField`, e.g. confirm-account-number), not on `targetFieldKey`. Preserves any
 * other errors already set on `fieldKey`'s control (e.g. `required`) rather than clobbering them,
 * same as `actualLessThanOrEqualToTargetValidator` above.
 *
 * Reads controls via `.controls[key]` rather than `.get(key)` — `AbstractControl.get()` splits a
 * dotted string into a nested path (`'bankDetails.name'` -> `controls.bankDetails.controls.name`),
 * which breaks against `toFormGroup()`'s flat controls that use the literal dotted string as one key.
 */
export function matchesFieldValidator(fieldKey: string, targetFieldKey: string) {
  return (group: AbstractControl) => {
    const control = (group as FormGroup).controls?.[fieldKey];
    const targetControl = (group as FormGroup).controls?.[targetFieldKey];

    if (!control || !targetControl) {
      return null;
    }

    const existingErrors = control.errors;
    if (control.value !== targetControl.value) {
      control.setErrors({ ...existingErrors, matchesField: true });
    } else if (existingErrors?.['matchesField']) {
      const rest = { ...existingErrors };
      delete rest['matchesField'];
      control.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}

/**
 * Digit-string validator for text fields that hold numeric identifiers (account numbers, codes) —
 * not a true `number` input. Mirrors the granular error keys that
 * `xvi-fc-bank-account.component.ts`'s `accountNumberValidator()` used to produce inline, so the
 * same messages can now live in `FieldConfig.validations[]` and be picked up by the dynamic-form's
 * existing `validations().find(v => errors[v.name])` display convention.
 */
export function digitsOnlyValidator(minLength?: number, maxLength?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string) ?? '';
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (/\s/.test(value)) errors['hasSpaces'] = true;
    if (/[a-zA-Z]/.test(value)) errors['hasAlphabets'] = true;
    if (/[^a-zA-Z0-9\s]/.test(value)) errors['hasSpecialChars'] = true;
    if (/^\d+$/.test(value)) {
      if (minLength != null && value.length < minLength) errors['tooShort'] = true;
      if (maxLength != null && value.length > maxLength) errors['tooLong'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

export function compareArrFieldsValidator(controlName: string, matchingControlName: string, type: string) {
  return (group: AbstractControl) => {
    const rawValue = group.getRawValue();
    const controlIndex = rawValue.findIndex((e: any) => e[controlName]);
    const matchIndex = rawValue.findIndex((e: any) => e[matchingControlName]);

    // console.log('group', controlName, '----', (group as FormArray).controls[controlIndex]?.get(controlName))
    // console.log('group', controlName, '----', (group as FormArray).controls[controlIndex])

    // console.log('controlIndex',controlIndex,'matchIndex',matchIndex);

    // const control = group.get(controlName)?.get('value');
    // const matchingControl = group.get(matchingControlName)?.get('value');

    const control = (group as FormArray).controls[controlIndex]?.get(controlName);
    const matchingControl = (group as FormArray).controls[matchIndex]?.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    // return if another validator has already found an error on the matchingControl
    // if (matchingControl.errors && !matchingControl.errors['lessThan']) {
    if (control.errors && !control.errors[type]) {
      return null;
    }

    // set error on matchingControl if validation fails
    const controlVal = Number(control.value);
    const matchVal = Number(matchingControl.value);
    // 2024 > 2011
    if (type === 'greaterThanEqualTo' && controlVal < matchVal) {
      control.setErrors({ [type]: true });
    } else if (type === 'lessThan' && controlVal > matchVal) {
      control.setErrors({ [type]: true });
    } else {
      control.setErrors(null);
    }
    return null;
  };
}
