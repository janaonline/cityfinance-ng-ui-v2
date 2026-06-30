import { DevolutionValidationSummary } from './devolution-formula.models';
import {
  buildDevolutionDraftPayloadData,
  buildDevolutionFinalSubmitPayloadData,
  buildDfRowUpdatePayload,
  extractApiErrorResponse,
  extractValidationSummaryFromError,
  formatRupees,
  getDfValidationStatusLabel,
  getRegisterUlbErrorMessage,
  hasPersistedValidationData,
  isDfRowValidationStatus,
  isRecord,
  isValidDevolutionFileRef,
} from './devolution-formula.utils';

const mockFileValue = { fileName: 'test.xlsx', fileUrl: 'https://example.com/test.xlsx' };

const mockValidationSummary: DevolutionValidationSummary = {
  validationStatus: 'VALID',
  excelRowCount: 10,
  validRowCount: 8,
  errorRowCount: 2,
  missingUlbCount: 0,
  totalMoHUAAllocation: 5000000,
  totalAllocatedSum: 5000000,
  allUlbsCovered: true,
  allocationBalanced: true,
  activeDatasetVersion: 1,
};

// ─── isRecord ─────────────────────────────────────────────────────────────────

describe('isRecord', () => {
  it('returns true for a plain object', () => expect(isRecord({})).toBeTrue());
  it('returns true for an object with keys', () => expect(isRecord({ a: 1 })).toBeTrue());
  it('returns false for null', () => expect(isRecord(null)).toBeFalse());
  it('returns false for a string', () => expect(isRecord('hello')).toBeFalse());
  it('returns false for a number', () => expect(isRecord(42)).toBeFalse());
  it('returns false for undefined', () => expect(isRecord(undefined)).toBeFalse());
  it('returns true for an array (arrays are objects in JS)', () => expect(isRecord([])).toBeTrue());
});

// ─── isValidDevolutionFileRef ─────────────────────────────────────────────────

describe('isValidDevolutionFileRef', () => {
  it('returns true when fileName and fileUrl are non-empty strings', () =>
    expect(isValidDevolutionFileRef(mockFileValue)).toBeTrue());
  it('returns false when fileName is empty', () =>
    expect(isValidDevolutionFileRef({ fileName: '', fileUrl: 'u' })).toBeFalse());
  it('returns false when fileUrl is empty', () =>
    expect(isValidDevolutionFileRef({ fileName: 'f', fileUrl: '' })).toBeFalse());
  it('returns false for null', () => expect(isValidDevolutionFileRef(null)).toBeFalse());
  it('returns false for a string', () => expect(isValidDevolutionFileRef('file.xlsx')).toBeFalse());
});

// ─── extractApiErrorResponse ──────────────────────────────────────────────────

describe('extractApiErrorResponse', () => {
  it('returns null for a non-object error', () => {
    expect(extractApiErrorResponse('string error')).toBeNull();
    expect(extractApiErrorResponse(null)).toBeNull();
    expect(extractApiErrorResponse(42)).toBeNull();
  });

  it('returns null when neither err.error.message nor err.success===false is present', () => {
    expect(extractApiErrorResponse({ status: 500 })).toBeNull();
    expect(extractApiErrorResponse({ error: { statusCode: 500 } })).toBeNull();
  });

  it('extracts message from an Angular HttpErrorResponse-like object (err.error.message)', () => {
    const err = {
      status: 400,
      error: { statusCode: 400, message: 'File not allowed.', errors: {} },
    };
    const result = extractApiErrorResponse(err);
    expect(result?.message).toBe('File not allowed.');
    expect(result?.statusCode).toBe(400);
  });

  it('extracts errors map from an HttpErrorResponse-like object', () => {
    const err = {
      error: {
        message: 'Validation failed.',
        errors: {
          excelFile: [{ message: 'Invalid file.', code: 'INVALID_FILE' }],
        },
      },
    };
    const result = extractApiErrorResponse(err);
    expect(result?.errors?.['excelFile']?.[0]?.message).toBe('Invalid file.');
  });

  it('extracts data from an HttpErrorResponse-like object', () => {
    const err = {
      error: {
        message: 'Mismatch.',
        data: { validationSummary: mockValidationSummary },
      },
    };
    const result = extractApiErrorResponse(err);
    expect(result?.data).toEqual(jasmine.objectContaining({ validationSummary: mockValidationSummary }));
  });

  it('extracts from a service-thrown plain body (success:false + message)', () => {
    const err = { success: false as const, message: 'Server refused.', errors: {} };
    const result = extractApiErrorResponse(err);
    expect(result?.message).toBe('Server refused.');
  });

  it('extracts errors from a service-thrown plain body', () => {
    const err = {
      success: false as const,
      message: 'Server refused.',
      errors: {
        checkboxConfirmation: [{ message: 'Must be confirmed.', code: 'REQUIRED_TRUE' }],
      },
    };
    const result = extractApiErrorResponse(err);
    expect(result?.errors?.['checkboxConfirmation']?.[0]?.code).toBe('REQUIRED_TRUE');
  });

  it('returns errors as undefined when errors map entries are not arrays', () => {
    const err = {
      error: {
        message: 'Bad shape.',
        errors: { excelFile: 'not an array' },
      },
    };
    const result = extractApiErrorResponse(err);
    expect(result?.errors).toBeUndefined();
  });

  it('returns errors as undefined when error objects lack a message string', () => {
    const err = {
      error: {
        message: 'Bad shape.',
        errors: { excelFile: [{ code: 'NO_MSG' }] },
      },
    };
    const result = extractApiErrorResponse(err);
    expect(result?.errors).toBeUndefined();
  });
});

// ─── hasPersistedValidationData ───────────────────────────────────────────────

describe('hasPersistedValidationData', () => {
  it('returns true when err.error.data.validationSummary.excelRowCount > 0', () => {
    const err = {
      error: { data: { validationSummary: { excelRowCount: 5 } } },
    };
    expect(hasPersistedValidationData(err)).toBeTrue();
  });

  it('returns false when excelRowCount is 0', () => {
    const err = {
      error: { data: { validationSummary: { excelRowCount: 0 } } },
    };
    expect(hasPersistedValidationData(err)).toBeFalse();
  });

  it('returns false when validationSummary is missing', () => {
    expect(hasPersistedValidationData({ error: { data: {} } })).toBeFalse();
  });

  it('returns false for null', () => expect(hasPersistedValidationData(null)).toBeFalse());
  it('returns false for a non-object', () => expect(hasPersistedValidationData('err')).toBeFalse());
});

// ─── extractValidationSummaryFromError ────────────────────────────────────────

describe('extractValidationSummaryFromError', () => {
  it('returns a typed summary when all fields are present and correctly typed', () => {
    const err = { error: { data: { validationSummary: mockValidationSummary } } };
    const result = extractValidationSummaryFromError(err);
    expect(result).toEqual(mockValidationSummary);
  });

  it('returns null when validationSummary is missing', () => {
    expect(extractValidationSummaryFromError({ error: { data: {} } })).toBeNull();
  });

  it('returns null when a required numeric field is absent', () => {
    const partial = { ...mockValidationSummary };
    const withoutCount = { ...partial } as Partial<DevolutionValidationSummary>;
    delete withoutCount.excelRowCount;
    const err = { error: { data: { validationSummary: withoutCount } } };
    expect(extractValidationSummaryFromError(err)).toBeNull();
  });

  it('returns null when a required boolean field has wrong type', () => {
    const err = {
      error: {
        data: {
          validationSummary: { ...mockValidationSummary, allUlbsCovered: 'yes' },
        },
      },
    };
    expect(extractValidationSummaryFromError(err)).toBeNull();
  });

  it('returns null when err.error is absent', () => {
    expect(extractValidationSummaryFromError({ status: 400 })).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(extractValidationSummaryFromError(null)).toBeNull();
    expect(extractValidationSummaryFromError('string')).toBeNull();
  });
});

// ─── getDfValidationStatusLabel ───────────────────────────────────────────────

describe('getDfValidationStatusLabel', () => {
  it('returns "Valid" for VALID', () => expect(getDfValidationStatusLabel('VALID')).toBe('Valid'));
  it('returns "Invalid" for INVALID', () => expect(getDfValidationStatusLabel('INVALID')).toBe('Invalid'));
  it('returns "Not Validated" for NOT_VALIDATED', () =>
    expect(getDfValidationStatusLabel('NOT_VALIDATED')).toBe('Not Validated'));
});

// ─── isDfRowValidationStatus ──────────────────────────────────────────────────

describe('isDfRowValidationStatus', () => {
  it('returns true for "VALID"', () => expect(isDfRowValidationStatus('VALID')).toBeTrue());
  it('returns true for "INVALID"', () => expect(isDfRowValidationStatus('INVALID')).toBeTrue());
  it('returns false for "NOT_VALIDATED"', () => expect(isDfRowValidationStatus('NOT_VALIDATED')).toBeFalse());
  it('returns false for empty string', () => expect(isDfRowValidationStatus('')).toBeFalse());
  it('returns false for null', () => expect(isDfRowValidationStatus(null)).toBeFalse());
});

// ─── formatRupees ─────────────────────────────────────────────────────────────

describe('formatRupees', () => {
  it('returns "—" for null', () => expect(formatRupees(null)).toBe('—'));
  it('returns "—" for undefined', () => expect(formatRupees(undefined)).toBe('—'));
  it('formats crore amounts with Cr suffix', () => expect(formatRupees(50000000)).toContain('Cr'));
  it('formats lakh amounts with Lakh suffix', () => expect(formatRupees(500000)).toContain('Lakh'));
  it('formats plain amounts with ₹ prefix', () => expect(formatRupees(5000)).toContain('₹'));
});

// ─── buildDfRowUpdatePayload ──────────────────────────────────────────────────

describe('buildDfRowUpdatePayload', () => {
  it('includes all four fields when all values are finite numbers and non-null formula', () => {
    const payload = buildDfRowUpdatePayload(1000, 500, 500, 'Pop * 2');
    expect(payload.totalGrantAllocation).toBe(1000);
    expect(payload.installment1Amount).toBe(500);
    expect(payload.installment2Amount).toBe(500);
    expect(payload.devolutionFormula).toBe('Pop * 2');
  });

  it('omits a numeric field when its value is null', () => {
    const payload = buildDfRowUpdatePayload(null, 500, 500, 'Pop * 2');
    expect('totalGrantAllocation' in payload).toBeFalse();
  });

  it('omits a numeric field when its value is NaN', () => {
    const payload = buildDfRowUpdatePayload(NaN, 500, 500, 'Pop * 2');
    expect('totalGrantAllocation' in payload).toBeFalse();
  });

  it('omits devolutionFormula when value is null', () => {
    const payload = buildDfRowUpdatePayload(1000, 500, 500, null);
    expect('devolutionFormula' in payload).toBeFalse();
  });

  it('includes devolutionFormula when value is an empty string (intentional clear)', () => {
    const payload = buildDfRowUpdatePayload(1000, 500, 500, '');
    expect(payload.devolutionFormula).toBe('');
  });
});

// ─── buildDevolutionDraftPayloadData ──────────────────────────────────────────

describe('buildDevolutionDraftPayloadData', () => {
  it('includes excelFile when value is a valid file ref', () => {
    const result = buildDevolutionDraftPayloadData({ excelFile: mockFileValue, checkboxConfirmation: true });
    expect(result.excelFile).toEqual(mockFileValue);
  });

  it('omits excelFile when value is null', () => {
    const result = buildDevolutionDraftPayloadData({ excelFile: null, checkboxConfirmation: true });
    expect(result.excelFile).toBeUndefined();
  });

  it('includes checkboxConfirmation when value is a boolean', () => {
    const result = buildDevolutionDraftPayloadData({ excelFile: null, checkboxConfirmation: false });
    expect(result.checkboxConfirmation).toBeFalse();
  });

  it('omits checkboxConfirmation when value is not a boolean', () => {
    const result = buildDevolutionDraftPayloadData({ excelFile: null, checkboxConfirmation: 'yes' });
    expect(result.checkboxConfirmation).toBeUndefined();
  });

  it('includes ulbCount when value is a finite number', () => {
    const result = buildDevolutionDraftPayloadData({ ulbCount: 100, excelFile: null, checkboxConfirmation: true });
    expect(result.ulbCount).toBe(100);
  });

  it('omits ulbCount when value is null or non-numeric', () => {
    const result = buildDevolutionDraftPayloadData({ ulbCount: null, excelFile: null, checkboxConfirmation: true });
    expect(result.ulbCount).toBeUndefined();
  });
});

// ─── getRegisterUlbErrorMessage ───────────────────────────────────────────────

describe('getRegisterUlbErrorMessage', () => {
  it('returns the backend message when excelFile has a newUlbsAdded error', () => {
    const errors = {
      excelFile: [
        {
          field: 'excelFile',
          code: 'newUlbsAdded',
          message: 'You have added 3 ULB(s). Please register before proceeding.',
        },
      ],
    };
    expect(getRegisterUlbErrorMessage(errors)).toBe('You have added 3 ULB(s). Please register before proceeding.');
  });

  it('returns null when excelFile errors do not include newUlbsAdded', () => {
    const errors = {
      excelFile: [{ field: 'excelFile', code: 'allocationMismatch', message: 'Sums do not match.' }],
    };
    expect(getRegisterUlbErrorMessage(errors)).toBeNull();
  });

  it('returns null when excelFile key is absent', () => {
    expect(getRegisterUlbErrorMessage({ checkboxConfirmation: [{ message: 'Required.' }] })).toBeNull();
  });

  it('returns null when errors is undefined', () => {
    expect(getRegisterUlbErrorMessage(undefined)).toBeNull();
  });
});

// ─── buildDevolutionFinalSubmitPayloadData ────────────────────────────────────

describe('buildDevolutionFinalSubmitPayloadData', () => {
  it('returns payload when ulbCount, excelFile, and checkboxConfirmation are all valid', () => {
    const result = buildDevolutionFinalSubmitPayloadData({
      ulbCount: 100,
      excelFile: mockFileValue,
      checkboxConfirmation: true,
    });
    expect(result).toEqual({ ulbCount: 100, excelFile: mockFileValue, checkboxConfirmation: true });
  });

  it('returns null when excelFile is missing', () => {
    const result = buildDevolutionFinalSubmitPayloadData({ ulbCount: 100, checkboxConfirmation: true });
    expect(result).toBeNull();
  });

  it('returns null when checkboxConfirmation is not a boolean', () => {
    const result = buildDevolutionFinalSubmitPayloadData({
      ulbCount: 100,
      excelFile: mockFileValue,
      checkboxConfirmation: 'yes',
    });
    expect(result).toBeNull();
  });

  it('returns null when ulbCount is missing', () => {
    const result = buildDevolutionFinalSubmitPayloadData({
      excelFile: mockFileValue,
      checkboxConfirmation: true,
    });
    expect(result).toBeNull();
  });

  it('returns null when ulbCount is non-numeric', () => {
    const result = buildDevolutionFinalSubmitPayloadData({
      ulbCount: 'abc',
      excelFile: mockFileValue,
      checkboxConfirmation: true,
    });
    expect(result).toBeNull();
  });
});
