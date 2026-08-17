import { isUploadedFileMetadata } from '../../../../shared/dynamic-form/components/file/file-metadata.types';
import { getXviFcFieldErrorMessage, getXviFcRowErrorMessage } from '../../common/utils/xvi-fc-error-lookup.utils';
import {
  ApiErrorMap,
  ApiErrorResponse,
  EulbFileValue,
  EulbFinalSubmitPayloadData,
  EulbFormPayloadData,
  EulbRowEditFormValue,
  EulbRowError,
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
  return isUploadedFileMetadata(value);
}

export function hasEulbFileValue(value: unknown): boolean {
  return isRecord(value) && (isNonEmptyString(value['originalName']) || isNonEmptyString(value['path']));
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
  const signedElectedbodyFile = visiblePayload['signedElectedbodyFile'];
  const checkboxConfirmation = visiblePayload['checkboxConfirmation'];

  return {
    ulbCount: normalizeUlbCount(ulbCount),
    electedBodyExcelFile: isValidEulbFileValue(electedBodyExcelFile) ? electedBodyExcelFile : undefined,
    signedElectedbodyFile: isValidEulbFileValue(signedElectedbodyFile) ? signedElectedbodyFile : undefined,
    checkboxConfirmation: typeof checkboxConfirmation === 'boolean' ? checkboxConfirmation : undefined,
  };
}

export function buildEulbFinalSubmitPayloadData(
  visiblePayload: Record<string, unknown>,
): EulbFinalSubmitPayloadData | null {
  const electedBodyExcelFile = visiblePayload['electedBodyExcelFile'];
  const signedElectedbodyFile = visiblePayload['signedElectedbodyFile'];
  const checkboxConfirmation = visiblePayload['checkboxConfirmation'];

  if (
    !isValidEulbFileValue(electedBodyExcelFile) ||
    !isValidEulbFileValue(signedElectedbodyFile) ||
    typeof checkboxConfirmation !== 'boolean'
  ) {
    return null;
  }

  return { electedBodyExcelFile, signedElectedbodyFile, checkboxConfirmation };
}

function errorsMapToRowErrors(errorsMap: unknown): EulbRowUpdateApiError[] {
  if (!isRecord(errorsMap)) return [];
  const result: EulbRowUpdateApiError[] = [];
  for (const [field, fieldErrors] of Object.entries(errorsMap)) {
    if (!Array.isArray(fieldErrors)) continue;
    for (const err of fieldErrors) {
      if (isRecord(err) && typeof err['message'] === 'string') {
        result.push({
          field,
          message: err['message'],
          code: typeof err['code'] === 'string' ? err['code'] : undefined,
        });
      }
    }
  }
  return result;
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
  if (isRecord(httpErrorBody)) {
    const parsed = errorsMapToRowErrors(httpErrorBody['errors']);
    if (parsed.length) return parsed;
  }

  return errorsMapToRowErrors(error['errors']);
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

/**
 * Parses the error body of a `responseType: 'blob'` HTTP request into an `ApiErrorResponse`.
 * Angular's `HttpClient` does not JSON-parse error bodies for blob requests — `err.error` arrives
 * as a raw `Blob`, not a parsed object, so `extractApiErrorResponse` can't read it directly (it
 * expects `err.error` to already be a record). Falls back to `extractApiErrorResponse(err)` when
 * `err.error` isn't a `Blob` (e.g. a network-level error), and resolves to `null` on any
 * read/parse failure.
 */
export async function parseBlobErrorResponse(err: unknown): Promise<ApiErrorResponse | null> {
  const errorBody = isRecord(err) ? err['error'] : undefined;
  if (!(errorBody instanceof Blob)) {
    return extractApiErrorResponse(err);
  }

  try {
    const text = await errorBody.text();
    const parsed: unknown = JSON.parse(text);
    return extractApiErrorResponse({ error: parsed });
  } catch {
    return null;
  }
}

/** Returns the backend message for a `newUlbsAdded` error on `electedBodyExcelFile`, or null when absent. */
export function getRegisterUlbErrorMessage(errors: ApiErrorMap | undefined): string | null {
  return getXviFcFieldErrorMessage(errors, 'electedBodyExcelFile', 'newUlbsAdded');
}

/** Returns the message of the first row-level `duplicate` census-code error, or null when absent. */
export function getDuplicateCensusCodeMessage(errors: EulbRowError[] | undefined): string | null {
  return getXviFcRowErrorMessage(errors, 'duplicate');
}
