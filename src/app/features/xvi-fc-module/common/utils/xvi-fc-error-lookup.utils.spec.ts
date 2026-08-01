import { getXviFcFieldErrorMessage, getXviFcRowErrorMessage } from './xvi-fc-error-lookup.utils';

describe('getXviFcFieldErrorMessage', () => {
  it('returns the message of the matching-code entry for the given field key', () => {
    const errors = {
      excelFile: [{ field: 'excelFile', code: 'newUlbsAdded', message: 'You have added 3 ULB(s).' }],
    };
    expect(getXviFcFieldErrorMessage(errors, 'excelFile', 'newUlbsAdded')).toBe('You have added 3 ULB(s).');
  });

  it('returns null when the field key entries do not include the requested code', () => {
    const errors = { excelFile: [{ field: 'excelFile', code: 'allocationMismatch', message: 'Sums do not match.' }] };
    expect(getXviFcFieldErrorMessage(errors, 'excelFile', 'newUlbsAdded')).toBeNull();
  });

  it('returns null when the field key is absent from the map', () => {
    expect(getXviFcFieldErrorMessage({ checkboxConfirmation: [{ message: 'Required.' }] }, 'excelFile', 'newUlbsAdded')).toBeNull();
  });

  it('returns null when errors is undefined', () => {
    expect(getXviFcFieldErrorMessage(undefined, 'excelFile', 'newUlbsAdded')).toBeNull();
  });
});

describe('getXviFcRowErrorMessage', () => {
  it('returns the message of the first row error whose code matches', () => {
    const rowErrors = [
      { field: 'censusCode', code: 'duplicate', message: 'A ULB with this census code already exists.' },
    ];
    expect(getXviFcRowErrorMessage(rowErrors, 'duplicate')).toBe('A ULB with this census code already exists.');
  });

  it('returns null when no row error has the requested code', () => {
    const rowErrors = [{ field: 'censusCode', code: 'unknownUlb', message: 'Unknown ULB.' }];
    expect(getXviFcRowErrorMessage(rowErrors, 'duplicate')).toBeNull();
  });

  it('returns null when rowErrors is undefined', () => {
    expect(getXviFcRowErrorMessage(undefined, 'duplicate')).toBeNull();
  });
});
