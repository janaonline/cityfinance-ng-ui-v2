import { EulbFileValue } from './eulb-status.models';
import {
  buildEulbFinalSubmitPayloadData,
  buildEulbFormPayloadData,
  buildEulbRowUpdatePayload,
  parseEulbRowUpdateErrors,
} from './eulb-status.utils';

describe('EULB status payload builders', () => {
  const fileValue: EulbFileValue = {
    fileName: 'eulb.xlsx',
    fileUrl: 'https://example.test/eulb.xlsx',
    fileSize: 2048,
  };

  it('allows draft payload data to remain incomplete', () => {
    const payload = buildEulbFormPayloadData({
      ulbCount: '',
      electedBodyExcelFile: null,
    });

    expect(payload).toEqual({
      ulbCount: undefined,
      electedBodyExcelFile: undefined,
      checkboxConfirmation: undefined,
    });
  });

  it('builds final-submit payload data only when all required values are valid', () => {
    expect(
      buildEulbFinalSubmitPayloadData({
        ulbCount: 100,
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toEqual({
      ulbCount: 100,
      electedBodyExcelFile: fileValue,
      checkboxConfirmation: true,
    });

    expect(
      buildEulbFinalSubmitPayloadData({
        ulbCount: 100,
        checkboxConfirmation: true,
      }),
    ).toBeNull();
  });

  it('converts numeric string ulbCount values to numbers before payload construction', () => {
    expect(
      buildEulbFormPayloadData({
        ulbCount: '42',
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      }).ulbCount,
    ).toBe(42);

    expect(
      buildEulbFinalSubmitPayloadData({
        ulbCount: '42',
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toEqual({
      ulbCount: 42,
      electedBodyExcelFile: fileValue,
      checkboxConfirmation: true,
    });
  });

  it('keeps final-submit stricter than draft payload data', () => {
    const partialPayload = {
      ulbCount: 12,
      checkboxConfirmation: true,
    };

    expect(buildEulbFormPayloadData(partialPayload)).toEqual({
      ulbCount: 12,
      electedBodyExcelFile: undefined,
      checkboxConfirmation: true,
    });
    expect(buildEulbFinalSubmitPayloadData(partialPayload)).toBeNull();
  });

  it('builds row update payloads with the existing edit-field semantics', () => {
    expect(
      buildEulbRowUpdatePayload({
        electedBodyStatus: 'Constituted',
        dateOfConstitution: '2026-01-01',
        dateOfExpiry: '',
        remarks: '',
      }),
    ).toEqual({
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2026-01-01',
      dateOfExpiry: undefined,
      remarks: '',
    });
  });

  it('returns an empty array when the error body contains no recognisable error entries', () => {
    expect(parseEulbRowUpdateErrors(null)).toEqual([]);
    expect(parseEulbRowUpdateErrors({})).toEqual([]);
    expect(parseEulbRowUpdateErrors({ error: {} })).toEqual([]);
    expect(parseEulbRowUpdateErrors({ errors: [] })).toEqual([]);
  });

  it('parses row update field errors from the new map-keyed backend format', () => {
    // HTTP 4xx body — Angular wraps it in err.error; new contract includes success:false
    const httpError = {
      error: {
        success: false,
        statusCode: 400,
        message: 'Validation failed.',
        errors: { remarks: [{ field: 'remarks', message: 'Remarks are required.', code: 'required' }] },
      },
    };
    // Directly thrown body (2xx success:false) — field comes from map key, not from error object
    const plainError = {
      success: false,
      errors: { dateOfExpiry: [{ message: 'Expiry date is invalid.', code: 'invalidDate' }] },
    };

    expect(parseEulbRowUpdateErrors(httpError)).toEqual([
      { field: 'remarks', message: 'Remarks are required.', code: 'required' },
    ]);
    expect(parseEulbRowUpdateErrors(plainError)).toEqual([
      { field: 'dateOfExpiry', message: 'Expiry date is invalid.', code: 'invalidDate' },
    ]);
  });

  it('parses dateOfExpiry minDate error from the full backend error shape including data context', () => {
    const httpError = {
      error: {
        success: false,
        statusCode: 400,
        message: 'Validation failed.',
        errors: {
          dateOfExpiry: [{ field: 'dateOfExpiry', code: 'minDate', message: 'Date of expiry cannot be in the past.' }],
        },
        data: { rowId: 'row-1', rowNumber: 1, censusCode: '123', ulbName: 'Achalpur Muncipal Council' },
      },
    };
    expect(parseEulbRowUpdateErrors(httpError)).toEqual([
      { field: 'dateOfExpiry', code: 'minDate', message: 'Date of expiry cannot be in the past.' },
    ]);
  });

  it('does not parse old array-shaped row update errors — map format is required', () => {
    // Old format: errors was a flat array; new backend always sends a field-keyed map
    expect(parseEulbRowUpdateErrors({ error: { errors: [{ field: 'remarks', message: 'Required.' }] } })).toEqual([]);
    expect(parseEulbRowUpdateErrors({ errors: [{ field: 'dateOfExpiry', message: 'Invalid.' }] })).toEqual([]);
  });
});
