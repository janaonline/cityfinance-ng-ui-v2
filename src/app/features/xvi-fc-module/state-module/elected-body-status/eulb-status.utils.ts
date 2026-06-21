import {
  ApiErrorMap,
  ApiErrorResponse,
  EulbFileValue,
  EulbFinalSubmitPayloadData,
  EulbFormPayloadData,
  EulbRowEditFormValue,
  EulbRowUpdateApiError,
  EulbUpdateRowPayload,
} from './eulb-status.models';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getRecordValue(source: unknown, key: string): unknown {
  return isRecord(source) ? source[key] : undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isValidEulbFileValue(value: unknown): value is EulbFileValue {
  return isRecord(value) && isNonEmptyString(value['fileName']) && isNonEmptyString(value['fileUrl']);
}

export function hasEulbFileValue(value: unknown): boolean {
  return isRecord(value) && (isNonEmptyString(value['fileName']) || isNonEmptyString(value['fileUrl']));
}

function normalizeUlbCount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

export function buildEulbFormPayloadData(visiblePayload: Record<string, unknown>): EulbFormPayloadData {
  const ulbCount = visiblePayload['ulbCount'];
  const electedBodyExcelFile = visiblePayload['electedBodyExcelFile'];
  const checkboxConfirmation = visiblePayload['checkboxConfirmation'];

  return {
    ulbCount: normalizeUlbCount(ulbCount),
    electedBodyExcelFile: isValidEulbFileValue(electedBodyExcelFile) ? electedBodyExcelFile : undefined,
    checkboxConfirmation: typeof checkboxConfirmation === 'boolean' ? checkboxConfirmation : undefined,
  };
}

export function buildEulbFinalSubmitPayloadData(
  visiblePayload: Record<string, unknown>,
): EulbFinalSubmitPayloadData | null {
  const ulbCount = normalizeUlbCount(visiblePayload['ulbCount']);
  const electedBodyExcelFile = visiblePayload['electedBodyExcelFile'];
  const checkboxConfirmation = visiblePayload['checkboxConfirmation'];

  if (
    ulbCount === undefined ||
    !isValidEulbFileValue(electedBodyExcelFile) ||
    typeof checkboxConfirmation !== 'boolean'
  ) {
    return null;
  }

  return {
    ulbCount,
    electedBodyExcelFile,
    checkboxConfirmation,
  };
}

function isRowUpdateApiError(value: unknown): value is EulbRowUpdateApiError {
  return isRecord(value) && typeof value['field'] === 'string' && typeof value['message'] === 'string';
}

function toRowUpdateApiErrors(value: unknown): EulbRowUpdateApiError[] {
  return Array.isArray(value) ? value.filter(isRowUpdateApiError) : [];
}

export function buildEulbRowUpdatePayload(raw: EulbRowEditFormValue): EulbUpdateRowPayload {
  const payload: EulbUpdateRowPayload = {
    dateOfConstitution: raw.dateOfConstitution || undefined,
    dateOfExpiry: raw.dateOfExpiry || undefined,
    remarks: raw.remarks,
  };

  if (raw.electedBodyStatus) {
    payload.electedBodyStatus = raw.electedBodyStatus;
  }

  return payload;
}

export function parseEulbRowUpdateErrors(error: unknown): EulbRowUpdateApiError[] {
  if (!isRecord(error)) return [];

  const httpErrorBody = error['error'];
  const fromHttpBody = isRecord(httpErrorBody) ? httpErrorBody['errors'] : undefined;
  const httpBodyErrors = toRowUpdateApiErrors(fromHttpBody);
  if (httpBodyErrors.length) return httpBodyErrors;

  const plainErrors = toRowUpdateApiErrors(error['errors']);
  if (plainErrors.length) return plainErrors;

  return [];
}

function isApiErrorMap(value: unknown): value is ApiErrorMap {
  if (!isRecord(value)) return false;
  return Object.values(value).every(
    (fieldErrors) =>
      Array.isArray(fieldErrors) &&
      fieldErrors.every((error: unknown) => isRecord(error) && typeof error['message'] === 'string'),
  );
}

export function extractApiErrorResponse(err: unknown): ApiErrorResponse | null {
  if (!isRecord(err)) return null;

  const httpErrorBody = err['error'];
  if (isRecord(httpErrorBody) && typeof httpErrorBody['message'] === 'string') {
    return {
      statusCode: typeof httpErrorBody['statusCode'] === 'number' ? httpErrorBody['statusCode'] : undefined,
      message: httpErrorBody['message'],
      errors: isApiErrorMap(httpErrorBody['errors']) ? httpErrorBody['errors'] : undefined,
    };
  }

  if (err['success'] === false && typeof err['message'] === 'string') {
    return {
      message: err['message'],
      errors: isApiErrorMap(err['errors']) ? err['errors'] : undefined,
    };
  }

  return null;
}

export function hasPersistedValidationData(err: unknown): boolean {
  if (!isRecord(err)) return false;
  const body = err['error'];
  if (!isRecord(body)) return false;
  const data = body['data'];
  if (!isRecord(data)) return false;
  const summary = data['validationSummary'];
  if (!isRecord(summary)) return false;
  return Number(summary['excelRowCount'] ?? 0) > 0;
}

export function getHttpStatus(err: unknown): number | undefined {
  return isRecord(err) && typeof err['status'] === 'number' ? err['status'] : undefined;
}
