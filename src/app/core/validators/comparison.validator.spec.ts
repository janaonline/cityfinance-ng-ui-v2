import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { compareArrFieldsValidator, compareFieldsValidator } from './comparison.validator';

describe('comparison validators', () => {
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
