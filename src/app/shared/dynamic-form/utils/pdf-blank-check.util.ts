import { environment } from '../../../../environments/environment';

export interface PdfBlankCheckResult {
  /** True once a page with real (non-blank) content is found, or the render check couldn't run
   *  at all — pdf.js failures (worker/wasm load issues, etc.) fail OPEN, not closed, so a
   *  transient decode problem in a given environment never blocks every upload. */
  hasContent: boolean;
  pageCount: number | null;
  /** Set only for the two failure modes that ARE hard rejections regardless of the fail-open policy. */
  fatalError: 'password' | 'invalid' | null;
}

// Resolved against document.baseURI (the <base href> Angular sets in index.html), not as
// root-absolute paths — this app deploys under a subpath (--base-href /fc/), so a hardcoded
// '/assets/...' 404s there (falls through to the SPA's server-side catch-all) even though it
// works locally where the base href is '/'.
// .js, not the pdf.js package's native .mjs — nginx on dev has no MIME-type mapping for .mjs
// and serves it as application/octet-stream, which browsers reject for module scripts
// regardless of content; .js is universally mapped correctly without needing server config.
const WORKER_SRC = new URL('assets/pdfjs/pdf.worker.min.js', document.baseURI).href;
const WASM_URL = new URL('assets/pdfjs/wasm/', document.baseURI).href;
const RENDER_SCALE = 0.15;
// 250 (not 240) and 0.1% (not 0.5%) so faint/faded scans and sparse marks (a signature, a
// stamp) aren't misread as blank.
const NON_WHITE_CHANNEL_THRESHOLD = 250;
const NON_WHITE_PIXEL_RATIO = 0.001;

/**
 * Render-based blank-page detection via pdf.js. Rendering at low resolution and checking pixel
 * brightness is the only reliable approach for detecting blank scanned pages (raw byte
 * heuristics cannot distinguish them). Worker + wasm codecs are checked in under
 * src/assets/pdfjs (not copied from node_modules at build time via a custom angular.json asset
 * entry — that only ran for `ng build`, leaving the files unreachable, 404ing, under `ng serve`).
 * Being plain files under src/assets, they're served identically in both dev and build modes,
 * and don't depend on unpkg's reachability or a proxy that blocks .wasm.
 */
export async function checkPdfHasContent(file: File): Promise<PdfBlankCheckResult> {
  // Master on/off switch — only declared in environment.ts, not the other env files (which
  // `fileReplacements` swaps in wholesale for dev/staging/local builds), so this reads it as
  // optional and defaults to enabled when the swapped-in file doesn't define it. Off skips the
  // render check entirely and reuses the same fail-open shape as an unexpected pdf.js failure below.
  const validationEnabled =
    (environment as Partial<{ pdfContentValidationEnabled: boolean }>).pdfContentValidationEnabled ?? true;
  if (!validationEnabled) {
    return { hasContent: true, pageCount: null, fatalError: null };
  }

  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, wasmUrl: WASM_URL }).promise;

    if (pdf.numPages === 0) {
      return { hasContent: false, pageCount: 0, fatalError: null };
    }

    // Check every page, not just page 1 — scanners often insert a blank cover/separator page,
    // which would otherwise cause a document with real content to be rejected.
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonWhite = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (
          data[i] < NON_WHITE_CHANNEL_THRESHOLD ||
          data[i + 1] < NON_WHITE_CHANNEL_THRESHOLD ||
          data[i + 2] < NON_WHITE_CHANNEL_THRESHOLD
        ) {
          nonWhite++;
        }
      }
      if (nonWhite / (canvas.width * canvas.height) >= NON_WHITE_PIXEL_RATIO) {
        return { hasContent: true, pageCount: pdf.numPages, fatalError: null };
      }
    }

    return { hasContent: false, pageCount: pdf.numPages, fatalError: null };
  } catch (err: unknown) {
    const name = (err as { name?: string })?.name;
    if (name === 'PasswordException') {
      return { hasContent: false, pageCount: null, fatalError: 'password' };
    }
    if (name === 'InvalidPDFException') {
      return { hasContent: false, pageCount: null, fatalError: 'invalid' };
    }
    // eslint-disable-next-line no-console
    console.warn('[pdf-blank-check] render check skipped:', err);
    return { hasContent: true, pageCount: null, fatalError: null };
  }
}
