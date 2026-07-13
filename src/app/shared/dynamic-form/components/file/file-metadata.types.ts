/**
 * Canonical persistence-ready uploaded-file value stored in standalone dynamic-form file controls.
 * The upload timestamp is deliberately absent: the backend owns it (stored as `updatedAt`
 * server-side) and the frontend neither creates nor forwards it.
 */
export interface UploadedFileMetadata {
  originalName: string;
  path: string;
  /** Browser-reported MIME type; '' when the browser reports none (e.g. `.xlsx` on some platforms). */
  mimeType: string;
  /** Numeric KB, unrounded (`file.size / 1024`); 0 when the size is unknown (legacy data). */
  sizeKb: number;
  /** Resolved at upload time for PDFs; null otherwise. */
  pageCount: number | null;
}

export function isUploadedFileMetadata(value: unknown): value is UploadedFileMetadata {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const sizeKb = candidate['sizeKb'];
  const pageCount = candidate['pageCount'];

  return (
    isNonEmptyString(candidate['originalName']) &&
    isNonEmptyString(candidate['path']) &&
    typeof candidate['mimeType'] === 'string' &&
    typeof sizeKb === 'number' &&
    Number.isFinite(sizeKb) &&
    sizeKb >= 0 &&
    ((typeof pageCount === 'number' && Number.isFinite(pageCount)) || pageCount === null)
  );
}

/**
 * Normalizes any persisted standalone file value into the canonical shape.
 *
 * Read-compatibility adapter: saved form values may still arrive in the pre-canonical shapes
 * `{ fileName, fileUrl, fileSize }` (raw control values, sizes in bytes) or the old serializer
 * output `{ originalName, path, sizeKb, extension }`. This is the single place those shapes are
 * converted; downstream standalone code reads only canonical keys. Removable once all persisted
 * data has been migrated to the canonical shape.
 *
 * Backend-owned keys such as the `updatedAt` timestamp are stripped here so the frontend never
 * echoes them back on submit.
 */
export function normalizeUploadedFileMetadata(value: unknown): UploadedFileMetadata | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const rawValue = value as Record<string, unknown>;
  const originalName =
    getNonEmptyString(rawValue['originalName']) ??
    getNonEmptyString(rawValue['fileName']) ??
    getNonEmptyString(rawValue['name']);
  const path =
    getNonEmptyString(rawValue['path']) ?? getNonEmptyString(rawValue['fileUrl']) ?? getNonEmptyString(rawValue['url']);

  if (!originalName && !path) {
    return null;
  }

  return {
    originalName: originalName ?? getFileNameFromPath(path),
    path: path ?? '',
    mimeType: getNonEmptyString(rawValue['mimeType']) ?? '',
    sizeKb: normalizeSizeKb(rawValue),
    pageCount:
      normalizeCount(rawValue['pageCount']) ??
      normalizeCount(rawValue['noOfPage']) ??
      normalizeCount(rawValue['pages']),
  };
}

/** `sizeKb` is already KB; the legacy `fileSize`/`size` keys hold bytes and need conversion. */
function normalizeSizeKb(rawValue: Record<string, unknown>): number {
  const sizeKb = normalizeNonNegativeNumber(rawValue['sizeKb']);
  if (sizeKb !== null) {
    return sizeKb;
  }

  const sizeBytes = normalizeNonNegativeNumber(rawValue['fileSize']) ?? normalizeNonNegativeNumber(rawValue['size']);
  return sizeBytes === null ? 0 : sizeBytes / 1024;
}

function normalizeNonNegativeNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const numericValue = Number(value.trim());
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
}

function normalizeCount(value: unknown): number | null {
  return normalizeNonNegativeNumber(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getNonEmptyString(value: unknown): string | null {
  return isNonEmptyString(value) ? value.trim() : null;
}

function getFileNameFromPath(path: string | null): string {
  if (!path) {
    return '';
  }

  const pathSegment = path.split(/[?#]/)[0];
  const segments = pathSegment.split('/');
  return segments[segments.length - 1] ?? '';
}
