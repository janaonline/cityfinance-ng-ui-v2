import { EulbFileValue } from './eulb-status.models';
import {
  buildEulbFinalSubmitPayloadData,
  buildEulbFormPayloadData,
  buildEulbRowUpdatePayload,
  parseEulbRowUpdateErrors,
} from './eulb-status.utils';

describe('EULB status payload builders', () => {
  const fileValue: EulbFileValue = {
    originalName: 'eulb.xlsx',
    path: 'https://example.test/eulb.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeKb: 2,
    pageCount: null,
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

  it('builds final-submit payload data when file and confirmation are present (ulbCount is backend-computed and excluded)', () => {
    // ulbCount is excluded by includeInPayload:false — builder must succeed without it
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toEqual({
      electedBodyExcelFile: fileValue,
      checkboxConfirmation: true,
    });

    // missing file → null
    expect(
      buildEulbFinalSubmitPayloadData({
        checkboxConfirmation: true,
      }),
    ).toBeNull();

    // missing confirmation → null
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
      }),
    ).toBeNull();
  });

  it('buildEulbFinalSubmitPayloadData succeeds without ulbCount in the visible payload', () => {
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toEqual({
      electedBodyExcelFile: fileValue,
      checkboxConfirmation: true,
    });
  });

  it('converts numeric string ulbCount values to numbers in draft payloads', () => {
    expect(
      buildEulbFormPayloadData({
        ulbCount: '42',
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      }).ulbCount,
    ).toBe(42);

    // ulbCount is not part of the final-submit result (excluded by includeInPayload:false)
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toEqual({
      electedBodyExcelFile: fileValue,
      checkboxConfirmation: true,
    });
  });

  it('final-submit returns null when file or confirmation is missing', () => {
    const payloadWithFile = {
      ulbCount: 12,
      checkboxConfirmation: true,
    };

    // Draft builder still accepts ulbCount from arbitrary payload objects
    expect(buildEulbFormPayloadData(payloadWithFile)).toEqual({
      ulbCount: 12,
      electedBodyExcelFile: undefined,
      checkboxConfirmation: true,
    });
    // Final-submit builder returns null when file is missing
    expect(buildEulbFinalSubmitPayloadData(payloadWithFile)).toBeNull();
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

  it('includes censusCode and ulbName in the payload when present in the form value', () => {
    const payload = buildEulbRowUpdatePayload({
      electedBodyStatus: undefined,
      dateOfConstitution: '',
      dateOfExpiry: '',
      remarks: '',
      censusCode: 'NEW001',
      ulbName: 'New ULB Name',
    });

    expect(payload.censusCode).toBe('NEW001');
    expect(payload.ulbName).toBe('New ULB Name');
  });

  it('omits censusCode and ulbName from the payload when absent from the form value', () => {
    const payload = buildEulbRowUpdatePayload({
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '',
      dateOfExpiry: '',
      remarks: '',
    });

    expect(Object.prototype.hasOwnProperty.call(payload, 'censusCode')).toBeFalse();
    expect(Object.prototype.hasOwnProperty.call(payload, 'ulbName')).toBeFalse();
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
