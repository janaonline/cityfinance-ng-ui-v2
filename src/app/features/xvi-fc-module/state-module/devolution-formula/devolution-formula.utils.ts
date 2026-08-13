import { isUploadedFileMetadata } from '../../../../shared/dynamic-form/components/file/file-metadata.types';
import { getXviFcFieldErrorMessage, getXviFcRowErrorMessage } from '../../common/utils/xvi-fc-error-lookup.utils';
import {
  ApiErrorMap,
  ApiErrorResponse,
  DevolutionFileRef,
  DevolutionFileValue,
  DevolutionValidationSummary,
  DfRowUpdateApiError,
  DfRowValidationError,
  DfRowValidationStatus,
  DfValidationStatus,
  UpdateDevolutionRowPayload,
} from './devolution-formula.models';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isValidDevolutionFileRef(value: unknown): value is DevolutionFileRef {
  return isUploadedFileMetadata(value);
}

export function hasDevolutionFileRef(value: unknown): boolean {
  return isRecord(value) && (isNonEmptyString(value['originalName']) || isNonEmptyString(value['path']));
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

  // Angular HttpErrorResponse — parsed body lives in err.error
  const httpErrorBody = err['error'];
  if (isRecord(httpErrorBody) && typeof httpErrorBody['message'] === 'string') {
    return {
      statusCode: typeof httpErrorBody['statusCode'] === 'number' ? httpErrorBody['statusCode'] : undefined,
      message: httpErrorBody['message'],
      errors: isApiErrorMap(httpErrorBody['errors']) ? httpErrorBody['errors'] : undefined,
      data: httpErrorBody['data'],
    };
  }

  // Service-thrown object (2xx with success:false)
  if (err['success'] === false && typeof err['message'] === 'string') {
    return {
      message: err['message'],
      errors: isApiErrorMap(err['errors']) ? err['errors'] : undefined,
      data: err['data'],
    };
  }

  return null;
}

function isDevolutionValidationSummary(value: unknown): value is DevolutionValidationSummary {
  if (!isRecord(value)) return false;
  return (
    typeof value['validationStatus'] === 'string' &&
    typeof value['excelRowCount'] === 'number' &&
    typeof value['validRowCount'] === 'number' &&
    typeof value['errorRowCount'] === 'number' &&
    typeof value['missingUlbCount'] === 'number' &&
    typeof value['totalMoHUAAllocation'] === 'number' &&
    typeof value['totalAllocatedSum'] === 'number' &&
    typeof value['allUlbsCovered'] === 'boolean' &&
    typeof value['allocationBalanced'] === 'boolean' &&
    typeof value['activeDatasetVersion'] === 'number'
  );
}

/**
 * Safely extracts a typed DevolutionValidationSummary from the nested
 * `err.error.data.validationSummary` path, as returned by the validate-excel
 * allocation-mismatch 400 error. Returns null when the shape doesn't match.
 */
export function extractValidationSummaryFromError(err: unknown): DevolutionValidationSummary | null {
  if (!isRecord(err)) return null;
  const body = err['error'];
  if (!isRecord(body)) return null;
  const data = body['data'];
  if (!isRecord(data)) return null;
  const summary = data['validationSummary'];
  return isDevolutionValidationSummary(summary) ? summary : null;
}

function isDfRowValidationErrorArray(value: unknown): value is DfRowValidationError[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item['rowNumber'] === 'number' &&
        typeof item['field'] === 'string' &&
        typeof item['code'] === 'string' &&
        typeof item['message'] === 'string',
    )
  );
}

/**
 * Safely extracts the typed per-row `rowErrors` array from the nested
 * `err.error.data.rowErrors` path, as returned by a validate-excel/revalidate-excel 400 error
 * (e.g. the new/unregistered-ULB or allocation-mismatch case, which can carry row errors
 * alongside the file-level error). Returns null when the shape doesn't match.
 */
export function extractRowErrorsFromError(err: unknown): DfRowValidationError[] | null {
  if (!isRecord(err)) return null;
  const body = err['error'];
  if (!isRecord(body)) return null;
  const data = body['data'];
  if (!isRecord(data)) return null;
  const rowErrors = data['rowErrors'];
  return isDfRowValidationErrorArray(rowErrors) ? rowErrors : null;
}

/** Returns true when a validate-excel HTTP error also carries previously saved row data. */
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

export function buildDevolutionDraftPayloadData(visiblePayload: Record<string, unknown>): {
  excelFile?: DevolutionFileRef;
  checkboxConfirmation?: boolean;
} {
  const excelFile = visiblePayload['excelFile'];
  const checkboxConfirmation = visiblePayload['checkboxConfirmation'];
  return {
    excelFile: isValidDevolutionFileRef(excelFile) ? excelFile : undefined,
    checkboxConfirmation: typeof checkboxConfirmation === 'boolean' ? checkboxConfirmation : undefined,
  };
}

export function buildDevolutionFinalSubmitPayloadData(
  visiblePayload: Record<string, unknown>,
): { excelFile: DevolutionFileRef; checkboxConfirmation: boolean } | null {
  const excelFile = visiblePayload['excelFile'];
  const checkboxConfirmation = visiblePayload['checkboxConfirmation'];
  if (!isValidDevolutionFileRef(excelFile) || typeof checkboxConfirmation !== 'boolean') {
    return null;
  }
  return { excelFile, checkboxConfirmation };
}

/** Returns the backend message for a `newUlbsAdded` error on `excelFile`, or null when absent. */
export function getRegisterUlbErrorMessage(errors: ApiErrorMap | undefined): string | null {
  return getXviFcFieldErrorMessage(errors, 'excelFile', 'newUlbsAdded');
}

/** Returns the message of the first row-level `duplicate` ULB error, or null when absent. */
export function getDuplicateUlbMessage(rowErrors: DfRowValidationError[] | undefined): string | null {
  return getXviFcRowErrorMessage(rowErrors, 'duplicate');
}

export function getDfValidationStatusLabel(status: DfValidationStatus): string {
  switch (status) {
    case 'VALID':
      return 'Valid';
    case 'INVALID':
      return 'Invalid';
    default:
      return 'Not Validated';
  }
}

/**
 * Formats a rupee amount for display. Auto-scales to Cr / Lakh for large values
 * (mirrors InrFormatPipe 'auto' mode without requiring a non-standalone pipe import).
 */
export function formatRupees(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  if (isNaN(n)) return '—';
  const absN = Math.abs(n);
  if (absN >= 1e7) {
    return `₹ ${(n / 1e7).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
  } else if (absN >= 1e5) {
    return `₹ ${(n / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakh`;
  }
  return `₹ ${n.toLocaleString('en-IN')}`;
}

export function isDfRowValidationStatus(value: unknown): value is DfRowValidationStatus {
  return value === 'VALID' || value === 'INVALID';
}

// ─── Row view model (used by the rows dialog for per-cell error display) ──────

export interface DfRowViewModel<TRow> {
  readonly row: TRow;
  readonly cellHasError: Partial<Record<string, boolean>>;
  readonly cellErrorText: Partial<Record<string, string>>;
}

export function buildDfRowViewModel<
  TRow extends { readonly errors?: ReadonlyArray<{ readonly field?: string; readonly message: string }> },
>(row: TRow): DfRowViewModel<TRow> {
  const cellHasError: Record<string, boolean> = {};
  const cellErrorText: Record<string, string> = {};
  for (const error of row.errors ?? []) {
    if (!error.field) continue;
    cellHasError[error.field] = true;
    cellErrorText[error.field] = cellErrorText[error.field]
      ? `${cellErrorText[error.field]}\n${error.message}`
      : error.message;
  }
  return { row, cellHasError, cellErrorText };
}

// ─── Row edit helpers (Phase 7) ───────────────────────────────────────────────

function dfErrorsMapToRowErrors(errorsMap: unknown): DfRowUpdateApiError[] {
  if (!isRecord(errorsMap)) return [];
  const result: DfRowUpdateApiError[] = [];
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

export function parseDfRowUpdateErrors(error: unknown): DfRowUpdateApiError[] {
  if (!isRecord(error)) return [];
  const httpErrorBody = error['error'];
  if (isRecord(httpErrorBody)) {
    const parsed = dfErrorsMapToRowErrors(httpErrorBody['errors']);
    if (parsed.length) return parsed;
  }
  return dfErrorsMapToRowErrors(error['errors']);
}

export function buildDfRowUpdatePayload(
  totalGrantAllocation: number | null,
  installment1Amount: number | null,
  installment2Amount: number | null,
  devolutionFormula: string | null,
): UpdateDevolutionRowPayload {
  const payload: UpdateDevolutionRowPayload = {};
  if (typeof totalGrantAllocation === 'number' && Number.isFinite(totalGrantAllocation)) {
    payload.totalGrantAllocation = totalGrantAllocation;
  }
  if (typeof installment1Amount === 'number' && Number.isFinite(installment1Amount)) {
    payload.installment1Amount = installment1Amount;
  }
  if (typeof installment2Amount === 'number' && Number.isFinite(installment2Amount)) {
    payload.installment2Amount = installment2Amount;
  }
  if (devolutionFormula !== null) {
    payload.devolutionFormula = devolutionFormula;
  }
  return payload;
}

// Kept for type-narrowing use in Phase 3 payload builders.
export { isValidDevolutionFileRef as isValidDfFileValue };
export type { DevolutionFileValue };
