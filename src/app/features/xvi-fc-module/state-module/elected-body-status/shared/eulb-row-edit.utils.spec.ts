import { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import {
  buildEulbModifiedRowViewModel,
  buildEulbRowCellErrorViewModel,
  buildEulbRowViewModel,
  getEulbEditDateMax,
  getEulbEditDateMin,
  getEulbValidationStatusLabel,
  isEulbBodyStatus,
  isEulbEditableFieldKey,
  isEulbRowValidationStatus,
  toEulbHtmlDate,
} from './eulb-row-edit.utils';

describe('EULB row edit helpers', () => {
  it('narrows known elected body status values', () => {
    expect(isEulbBodyStatus('Constituted')).toBeTrue();
    expect(isEulbBodyStatus('Not Constituted')).toBeTrue();
    expect(isEulbBodyStatus('6th Schedule')).toBeTrue();
    expect(isEulbBodyStatus('Pending')).toBeFalse();
    expect(isEulbBodyStatus(null)).toBeFalse();
  });

  it('narrows row validation statuses', () => {
    expect(isEulbRowValidationStatus('VALID')).toBeTrue();
    expect(isEulbRowValidationStatus('INVALID')).toBeTrue();
    expect(isEulbRowValidationStatus('NOT_VALIDATED')).toBeFalse();
  });

  it('narrows editable field keys', () => {
    expect(isEulbEditableFieldKey('electedBodyStatus')).toBeTrue();
    expect(isEulbEditableFieldKey('dateOfConstitution')).toBeTrue();
    expect(isEulbEditableFieldKey('dateOfExpiry')).toBeTrue();
    expect(isEulbEditableFieldKey('remarks')).toBeTrue();
    expect(isEulbEditableFieldKey('ulbName')).toBeFalse();
  });

  it('maps validation status to a human-readable label', () => {
    expect(getEulbValidationStatusLabel('VALID')).toBe('Valid');
    expect(getEulbValidationStatusLabel('INVALID')).toBe('Invalid');
  });

  it('converts date-like values to HTML date strings', () => {
    expect(toEulbHtmlDate('2026-01-05')).toBe('2026-01-05');
    expect(toEulbHtmlDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toEulbHtmlDate('')).toBeNull();
    expect(toEulbHtmlDate('not-a-date')).toBeNull();
  });

  it('resolves edit date constraints from direct field config before validation config', () => {
    const field: ConditionalFieldConfig = {
      key: 'dateOfConstitution',
      label: 'Date on which the elected body is in place',
      formFieldType: 'date',
      minDate: '2026-01-05',
      maxDate: '2026-12-31',
      validations: [
        { name: 'minDate', validator: '2025-01-01', message: 'Too early' },
        { name: 'maxDate', validator: '2027-12-31', message: 'Too late' },
      ],
    };

    expect(getEulbEditDateMin(field)).toBe('2026-01-05');
    expect(getEulbEditDateMax(field)).toBe('2026-12-31');
  });

  it('resolves edit date constraints from validation config when direct config is absent', () => {
    const field: ConditionalFieldConfig = {
      key: 'dateOfExpiry',
      label: 'Date of Expiry',
      formFieldType: 'date',
      validations: [
        { name: 'minDate', validator: '2026-01-05', message: 'Too early' },
        { name: 'maxDate', validator: '2026-12-31', message: 'Too late' },
      ],
    };

    expect(getEulbEditDateMin(field)).toBe('2026-01-05');
    expect(getEulbEditDateMax(field)).toBe('2026-12-31');
    expect(getEulbEditDateMin(undefined)).toBeNull();
    expect(getEulbEditDateMax(undefined)).toBeNull();
  });

  it('builds cell error view models with joined tooltip text', () => {
    const vm = buildEulbRowCellErrorViewModel([
      { field: 'remarks', message: 'Remarks are required.' },
      { field: 'remarks', message: 'Remarks are too long.' },
      { message: 'Row-level message without a field.' },
    ]);

    expect(vm.cellHasError['remarks']).toBeTrue();
    expect(vm.cellErrorText['remarks']).toBe('Remarks are required.\nRemarks are too long.');
    expect(vm.cellHasError['electedBodyStatus']).toBeUndefined();
  });

  it('preserves row identity and marks modified rows', () => {
    const row = {
      _id: 'row-1',
      errors: [{ field: 'dateOfExpiry', message: 'Invalid expiry.' }],
    };

    expect(buildEulbRowViewModel(row).row).toBe(row);

    const changedRows = new Map<string, unknown>([['row-1', { changed: true }]]);
    const vm = buildEulbModifiedRowViewModel(row, changedRows);

    expect(vm.row).toBe(row);
    expect(vm.isModified).toBeTrue();
    expect(vm.cellHasError['dateOfExpiry']).toBeTrue();
    expect(vm.cellErrorText['dateOfExpiry']).toBe('Invalid expiry.');
  });
});
