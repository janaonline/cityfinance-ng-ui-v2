import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  compareArrFieldsValidator,
  compareFieldsValidator,
  digitsOnlyValidator,
  matchesFieldValidator,
} from './comparison.validator';

describe('comparison validators', () => {
  describe('matchesFieldValidator', () => {
    function buildFlatGroup(fieldValue: string, targetValue: string) {
      return new FormGroup({
        confirmAccountNumber: new FormControl(fieldValue),
        accountNumber: new FormControl(targetValue),
      });
    }

    it('sets matchesField error on the declaring field when values differ', () => {
      const group = buildFlatGroup('123', '456');

      matchesFieldValidator('confirmAccountNumber', 'accountNumber')(group);

      expect(group.controls['confirmAccountNumber'].errors).toEqual({ matchesField: true });
    });

    it('clears the error once values match', () => {
      const group = buildFlatGroup('123', '456');
      group.controls['confirmAccountNumber'].setErrors({ matchesField: true });
      group.controls['confirmAccountNumber'].setValue('456');

      matchesFieldValidator('confirmAccountNumber', 'accountNumber')(group);

      expect(group.controls['confirmAccountNumber'].errors).toBeNull();
    });

    it('does not touch the target field itself', () => {
      const group = buildFlatGroup('123', '456');

      matchesFieldValidator('confirmAccountNumber', 'accountNumber')(group);

      expect(group.controls['accountNumber'].errors).toBeNull();
    });

    it('returns null when either configured field is missing', () => {
      const group = new FormGroup({});

      expect(matchesFieldValidator('confirmAccountNumber', 'accountNumber')(group)).toBeNull();
    });

    it('resolves dotted keys as literal flat control names, not nested paths', () => {
      // toFormGroup() builds flat controls keyed by the literal string 'bankDetails.name' —
      // AbstractControl.get() would misinterpret the dot as a nested path and find nothing.
      const group = new FormGroup({
        'confirm.value': new FormControl('123'),
        'target.value': new FormControl('456'),
      });

      matchesFieldValidator('confirm.value', 'target.value')(group);

      expect(group.controls['confirm.value'].errors).toEqual({ matchesField: true });
    });
  });

  describe('digitsOnlyValidator', () => {
    it('returns null for an empty value', () => {
      expect(digitsOnlyValidator()(new FormControl(''))).toBeNull();
    });

    it('flags spaces', () => {
      expect(digitsOnlyValidator()(new FormControl('123 456'))).toEqual({ hasSpaces: true });
    });

    it('flags alphabets', () => {
      expect(digitsOnlyValidator()(new FormControl('123abc'))).toEqual({ hasAlphabets: true });
    });

    it('flags special characters', () => {
      expect(digitsOnlyValidator()(new FormControl('123-456'))).toEqual({ hasSpecialChars: true });
    });

    it('flags too-short values against minLength', () => {
      expect(digitsOnlyValidator(9, 18)(new FormControl('12345'))).toEqual({ tooShort: true });
    });

    it('flags too-long values against maxLength', () => {
      expect(digitsOnlyValidator(9, 18)(new FormControl('1234567890123456789'))).toEqual({ tooLong: true });
    });

    it('returns null for a valid digit string within bounds', () => {
      expect(digitsOnlyValidator(9, 18)(new FormControl('123456789'))).toBeNull();
    });
  });

  describe('compareFieldsValidator', () => {
    function buildGroup(firstValue: number, secondValue: number) {
      return new FormGroup({
        first: new FormGroup({ value: new FormControl(firstValue) }),
        second: new FormGroup({ value: new FormControl(secondValue) }),
      });
    }

    it('sets greaterThanEqualTo error when the first value is lower than the matching value', () => {
      const group = buildGroup(2024, 2026);

      compareFieldsValidator('first', 'second', 'greaterThanEqualTo')(group);

      expect(group.get('first')?.get('value')?.errors).toEqual({ greaterThanEqualTo: true });
    });

    it('sets lessThan error when the first value is greater than the matching value', () => {
      const group = buildGroup(2026, 2024);

      compareFieldsValidator('first', 'second', 'lessThan')(group);

      expect(group.get('first')?.get('value')?.errors).toEqual({ lessThan: true });
    });

    it('clears comparison errors when values satisfy the rule', () => {
      const group = buildGroup(2024, 2026);
      const control = group.get('first')?.get('value');
      control?.setErrors({ lessThan: true });

      compareFieldsValidator('first', 'second', 'lessThan')(group);

      expect(control?.errors).toBeNull();
    });

    it('does not overwrite unrelated errors on the control', () => {
      const group = buildGroup(2024, 2026);
      const control = group.get('first')?.get('value');
      control?.setErrors({ required: true });

      compareFieldsValidator('first', 'second', 'lessThan')(group);

      expect(control?.errors).toEqual({ required: true });
    });

    it('returns null when either configured field is missing', () => {
      const group = new FormGroup({});

      expect(compareFieldsValidator('first', 'second', 'lessThan')(group)).toBeNull();
    });
  });

  describe('compareArrFieldsValidator', () => {
    function buildArray(firstValue: string, secondValue: string) {
      return new FormArray([
        new FormGroup({ first: new FormControl(firstValue) }),
        new FormGroup({ second: new FormControl(secondValue) }),
      ]);
    }

    it('sets greaterThanEqualTo error on array controls when first value is lower', () => {
      const formArray = buildArray('10', '20');

      compareArrFieldsValidator('first', 'second', 'greaterThanEqualTo')(formArray);

      expect((formArray.at(0) as FormGroup).get('first')?.errors).toEqual({
        greaterThanEqualTo: true,
      });
    });

    it('sets lessThan error on array controls when first value is greater', () => {
      const formArray = buildArray('20', '10');

      compareArrFieldsValidator('first', 'second', 'lessThan')(formArray);

      expect((formArray.at(0) as FormGroup).get('first')?.errors).toEqual({ lessThan: true });
    });

    it('clears array comparison errors when values satisfy the rule', () => {
      const formArray = buildArray('10', '20');
      const control = (formArray.at(0) as FormGroup).get('first');
      control?.setErrors({ lessThan: true });

      compareArrFieldsValidator('first', 'second', 'lessThan')(formArray);

      expect(control?.errors).toBeNull();
    });

    it('returns null when configured array controls cannot be found', () => {
      const formArray = new FormArray([new FormGroup({ other: new FormControl('10') })]);

      expect(compareArrFieldsValidator('first', 'second', 'lessThan')(formArray)).toBeNull();
    });
  });
});
