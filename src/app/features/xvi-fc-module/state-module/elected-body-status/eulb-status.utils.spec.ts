import { EulbFileValue } from './eulb-status.models';
import {
  buildEulbFinalSubmitPayloadData,
  buildEulbFormPayloadData,
  buildEulbRowUpdatePayload,
  getDuplicateCensusCodeMessage,
  getRegisterUlbErrorMessage,
  parseBlobErrorResponse,
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
      signedElectedbodyFile: undefined,
      checkboxConfirmation: undefined,
    });
  });

  it('builds final-submit payload data when both files and confirmation are present (ulbCount is backend-computed and excluded)', () => {
    // ulbCount is excluded by includeInPayload:false — builder must succeed without it
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
        signedElectedbodyFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toEqual({
      electedBodyExcelFile: fileValue,
      signedElectedbodyFile: fileValue,
      checkboxConfirmation: true,
    });

    // missing electedBodyExcelFile → null
    expect(
      buildEulbFinalSubmitPayloadData({
        signedElectedbodyFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toBeNull();

    // missing signedElectedbodyFile → null
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toBeNull();

    // missing confirmation → null
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
        signedElectedbodyFile: fileValue,
      }),
    ).toBeNull();
  });

  it('buildEulbFinalSubmitPayloadData succeeds without ulbCount in the visible payload', () => {
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
        signedElectedbodyFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toEqual({
      electedBodyExcelFile: fileValue,
      signedElectedbodyFile: fileValue,
      checkboxConfirmation: true,
    });
  });

  it('converts numeric string ulbCount values to numbers in draft payloads', () => {
    expect(
      buildEulbFormPayloadData({
        ulbCount: '42',
        electedBodyExcelFile: fileValue,
        signedElectedbodyFile: fileValue,
        checkboxConfirmation: true,
      }).ulbCount,
    ).toBe(42);

    // ulbCount is not part of the final-submit result (excluded by includeInPayload:false)
    expect(
      buildEulbFinalSubmitPayloadData({
        electedBodyExcelFile: fileValue,
        signedElectedbodyFile: fileValue,
        checkboxConfirmation: true,
      }),
    ).toEqual({
      electedBodyExcelFile: fileValue,
      signedElectedbodyFile: fileValue,
      checkboxConfirmation: true,
    });
  });

  it('final-submit returns null when a file or confirmation is missing', () => {
    const payloadWithFile = {
      ulbCount: 12,
      checkboxConfirmation: true,
    };

    // Draft builder still accepts ulbCount from arbitrary payload objects
    expect(buildEulbFormPayloadData(payloadWithFile)).toEqual({
      ulbCount: 12,
      electedBodyExcelFile: undefined,
      signedElectedbodyFile: undefined,
      checkboxConfirmation: true,
    });
    // Final-submit builder returns null when both files are missing
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

  it('never includes censusCode or ulbName in the payload — identity fields are not portal-editable', () => {
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

// ─── getRegisterUlbErrorMessage ───────────────────────────────────────────────

describe('getRegisterUlbErrorMessage', () => {
  it('returns the backend message when electedBodyExcelFile has a newUlbsAdded error', () => {
    const errors = {
      electedBodyExcelFile: [
        {
          field: 'electedBodyExcelFile',
          code: 'newUlbsAdded',
          message: 'You have added 1 ULB(s) not registered in City Finance. Please register before proceeding.',
        },
      ],
    };
    expect(getRegisterUlbErrorMessage(errors)).toBe(
      'You have added 1 ULB(s) not registered in City Finance. Please register before proceeding.',
    );
  });

  it('returns null when electedBodyExcelFile errors do not include newUlbsAdded', () => {
    const errors = {
      electedBodyExcelFile: [{ field: 'electedBodyExcelFile', code: 'conflict', message: 'Please refresh.' }],
    };
    expect(getRegisterUlbErrorMessage(errors)).toBeNull();
  });

  it('returns null when electedBodyExcelFile key is absent', () => {
    expect(getRegisterUlbErrorMessage({ ulbCount: [{ message: 'Required.' }] })).toBeNull();
  });

  it('returns null when errors is undefined', () => {
    expect(getRegisterUlbErrorMessage(undefined)).toBeNull();
  });
});

// ─── getDuplicateCensusCodeMessage ─────────────────────────────────────────────

describe('getDuplicateCensusCodeMessage', () => {
  it('returns the message of the first duplicate row error', () => {
    const errors = [
      {
        field: 'censusCode',
        code: 'duplicate',
        message: 'A ULB with this census code already exists for the selected design year.',
      },
    ];
    expect(getDuplicateCensusCodeMessage(errors)).toBe(
      'A ULB with this census code already exists for the selected design year.',
    );
  });

  it('returns null when no row error has code duplicate', () => {
    const errors = [{ field: 'censusCode', code: 'unknownUlb', message: 'Unknown ULB.' }];
    expect(getDuplicateCensusCodeMessage(errors)).toBeNull();
  });

  it('returns null when errors is undefined', () => {
    expect(getDuplicateCensusCodeMessage(undefined)).toBeNull();
  });
});

// ─── parseBlobErrorResponse ─────────────────────────────────────────────────

describe('parseBlobErrorResponse', () => {
  it('parses a Blob-typed error body (as returned for responseType: "blob" requests) into an ApiErrorResponse', async () => {
    const body = {
      message: 'Validation failed.',
      statusCode: 400,
      errors: {
        signedElectedbodyFile: [
          { field: 'signedElectedbodyFile', code: 'noRows', message: 'No elected-body rows found.' },
        ],
      },
    };
    const err = { error: new Blob([JSON.stringify(body)], { type: 'application/json' }) };

    const response = await parseBlobErrorResponse(err);

    expect(response?.message).toBe('Validation failed.');
    expect(response?.errors?.['signedElectedbodyFile']).toEqual([
      { field: 'signedElectedbodyFile', code: 'noRows', message: 'No elected-body rows found.' },
    ]);
  });

  it('falls back to extractApiErrorResponse when err.error is not a Blob', async () => {
    const err = { error: { message: 'Network-level failure.' } };
    const response = await parseBlobErrorResponse(err);
    expect(response?.message).toBe('Network-level failure.');
  });

  it('resolves to null when the blob body is not valid JSON', async () => {
    const err = { error: new Blob(['not json'], { type: 'application/json' }) };
    const response = await parseBlobErrorResponse(err);
    expect(response).toBeNull();
  });
});
