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

  it('parses row update API errors from HTTP and plain backend bodies', () => {
    const httpError = {
      error: {
        errors: [{ field: 'remarks', message: 'Remarks are required.', code: 'required' }],
      },
    };
    const plainError = {
      success: false,
      errors: [{ field: 'dateOfExpiry', message: 'Expiry date is invalid.', code: 'invalidDate' }],
    };

    expect(parseEulbRowUpdateErrors(httpError)).toEqual([
      { field: 'remarks', message: 'Remarks are required.', code: 'required' },
    ]);
    expect(parseEulbRowUpdateErrors(plainError)).toEqual([
      { field: 'dateOfExpiry', message: 'Expiry date is invalid.', code: 'invalidDate' },
    ]);
  });
});
