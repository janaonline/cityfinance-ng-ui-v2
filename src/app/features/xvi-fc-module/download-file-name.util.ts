/**
 * Result of a download requested with `{ responseType: 'blob', observe: 'response' }` — the blob
 *  itself plus whatever filename the backend's `Content-Disposition` header supplied. The backend
 *  now sends the complete, final download filename (format `CF_{StateName}_{FormName}_{YearLabel}.
 *  {ext}`) — this app no longer reconstructs or wraps it, just saves it verbatim via
 *  `FileSaver.saveAs()`. `fileName` is `null` when the header was missing or unparseable (e.g. a
 *  proxy stripped it, or — in local dev, where the SPA and API are on different ports — the backend
 *  hasn't exposed `Content-Disposition` via CORS; see `cf-nest-api-v2/src/main.ts`'s
 *  `corsOptions.exposedHeaders`). Callers fall back to a literal in that case rather than failing
 *  the download. */
export interface XviFcDownloadedFile {
  blob: Blob;
  fileName: string | null;
}

/**
 * Extracts the raw `filename="..."` (or RFC 5987 `filename*=UTF-8''...`) value from a
 * `Content-Disposition` response header — the complete filename the backend told us to use,
 * returned as-is with no further parsing or reassembly. Returns `null` if the header is missing or
 * has no `filename` value at all.
 */
export function parseContentDispositionFileName(header: string | null): string | null {
  if (!header) return null;

  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
