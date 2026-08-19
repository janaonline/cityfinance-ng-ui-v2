import { getXviFcFieldErrorMessage, getXviFcRowErrorMessage, parseFieldPrefixedMessages } from './xvi-fc-error-lookup.utils';

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

describe('parseFieldPrefixedMessages', () => {
  it('claims a bare "$property $message" entry against a flat DTO body', () => {
    const { claimed, unclaimed } = parseFieldPrefixedMessages(
      ['installment2Amount must be an integer number'],
      ['totalGrantAllocation', 'installment1Amount', 'installment2Amount'],
    );
    expect(claimed).toEqual([
      { field: 'installment2Amount', rowIndex: null, message: 'installment2Amount must be an integer number' },
    ]);
    expect(unclaimed).toEqual([]);
  });

  it('claims a "<arrayProperty>.<index>.<field> $message" entry against a nested-array DTO', () => {
    const { claimed, unclaimed } = parseFieldPrefixedMessages(
      ['unspentUlbData.2.unspentAmount must be an integer number'],
      ['ulbId', 'unspentAmount'],
      'unspentUlbData',
    );
    expect(claimed).toEqual([
      { field: 'unspentAmount', rowIndex: 2, message: 'unspentUlbData.2.unspentAmount must be an integer number' },
    ]);
    expect(unclaimed).toEqual([]);
  });

  it('leaves a message unclaimed when its leading token is not a known field', () => {
    const { claimed, unclaimed } = parseFieldPrefixedMessages(['expectedRevision must be an integer number'], [
      'ulbId',
      'claimedAmount',
    ]);
    expect(claimed).toEqual([]);
    expect(unclaimed).toEqual(['expectedRevision must be an integer number']);
  });

  it('leaves a message unclaimed when it does not match the given arrayProperty prefix at all', () => {
    const { claimed, unclaimed } = parseFieldPrefixedMessages(
      ['someOtherArray.0.claimedAmount must be an integer number'],
      ['ulbId', 'claimedAmount'],
      'ulbSelections',
    );
    expect(claimed).toEqual([]);
    expect(unclaimed).toEqual(['someOtherArray.0.claimedAmount must be an integer number']);
  });

  it('handles a mix of claimed and unclaimed messages', () => {
    const { claimed, unclaimed } = parseFieldPrefixedMessages(
      ['ulbSelections.0.claimedAmount must be an integer number', 'expectedRevision must be an integer number'],
      ['ulbId', 'claimedAmount'],
      'ulbSelections',
    );
    expect(claimed).toEqual([
      { field: 'claimedAmount', rowIndex: 0, message: 'ulbSelections.0.claimedAmount must be an integer number' },
    ]);
    expect(unclaimed).toEqual(['expectedRevision must be an integer number']);
  });
});
