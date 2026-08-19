import { FormControl } from '@angular/forms';
import { decimalPlacesValidator } from './decimal-places.validator';

describe('decimalPlacesValidator', () => {
  describe('maxPlaces = 0 (whole numbers only)', () => {
    const validator = decimalPlacesValidator(0);

    it('passes a whole number', () => {
      expect(validator(new FormControl(100))).toBeNull();
      expect(validator(new FormControl(0))).toBeNull();
      expect(validator(new FormControl(-5))).toBeNull();
    });

    it('fails a value with any decimal places', () => {
      expect(validator(new FormControl(100.5))).toEqual({ decimal: true });
      expect(validator(new FormControl('12930000.01'))).toEqual({ decimal: true });
    });

    it('is null for an empty control', () => {
      expect(validator(new FormControl(null))).toBeNull();
      expect(validator(new FormControl(undefined))).toBeNull();
      expect(validator(new FormControl(''))).toBeNull();
    });
  });

  describe('maxPlaces > 0', () => {
    const validator = decimalPlacesValidator(2);

    it('passes a value within the allowed decimal places', () => {
      expect(validator(new FormControl(100.5))).toBeNull();
      expect(validator(new FormControl(100.55))).toBeNull();
      expect(validator(new FormControl(100))).toBeNull();
    });

    it('fails a value with more decimal places than allowed', () => {
      expect(validator(new FormControl(100.555))).toEqual({ decimal: true });
    });
  });
});
