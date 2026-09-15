/** Page margin, matching the "25px" requirement — converted from CSS px to mm (96 CSS px/inch). */
const PDF_MARGIN_PX = 25;
const MM_PER_PX = 25.4 / 96;
const PDF_MARGIN_MM = PDF_MARGIN_PX * MM_PER_PX;

interface CertificationBadge {
  isChecked: boolean;
  label: string;
  /** CSS px, relative to the captured root element. */
  iconRect: { top: number; left: number; width: number; height: number };
  /** CSS px, relative to the captured root element — null if no `.fw-medium` sibling was found. */
  textRect: { top: number; left: number; width: number; height: number } | null;
  fontSizePx: number;
  textColor: [number, number, number];
}

/**
 * Finds each certification badge (the "Certified"/"Not certified" icon + label produced by
 * `dynamic-field-view.component.ts`'s `isCertificationField` branch) under `root`, records its
 * live position/state, then hides the icon and its label (`visibility: hidden`, which preserves
 * layout/spacing) so html2canvas never has to paint them.
 *
 * html2canvas cannot be trusted to rasterize this element: extensive live-browser diagnostics
 * against a real production build showed the icon's `<mat-icon>` had 100% correct computed styles,
 * and — after switching to injecting a real `<img>` element — a *fully decoded* image
 * (`complete: true`, non-zero `naturalWidth`/`naturalHeight`) at a correct, non-zero position, yet
 * the exported PDF still rendered a blank box in that exact spot. Since the live DOM state is
 * verifiably correct and html2canvas still fails to paint it, the fix is to stop asking
 * html2canvas to render this element at all — its content is instead drawn directly onto the PDF
 * with jsPDF's own vector/text APIs after the raster capture (see `drawCertificationBadges`).
 */
function prepareCertificationBadgesForNativeDraw(root: HTMLElement): CertificationBadge[] {
  const rootRect = root.getBoundingClientRect();
  const toRelativeRect = (rect: DOMRect) => ({
    top: rect.top - rootRect.top,
    left: rect.left - rootRect.left,
    width: rect.width,
    height: rect.height,
  });

  const badges: CertificationBadge[] = [];

  root.querySelectorAll('mat-icon').forEach((icon) => {
    const el = icon as HTMLElement;
    const isChecked = el.classList.contains('text-success');
    const isCertificationIcon = isChecked || el.classList.contains('text-secondary');

    if (!isCertificationIcon) {
      // Any other icon this capture doesn't have a native-draw replacement for (e.g. the "View
      // Document" link's icon) — hide it cleanly rather than risk the same blank-box failure.
      el.style.setProperty('display', 'none', 'important');
      return;
    }

    const textEl = el.parentElement?.querySelector('.fw-medium') as HTMLElement | null;
    const textStyle = textEl ? getComputedStyle(textEl) : null;
    const colorMatch = textStyle?.color.match(/(\d+(?:\.\d+)?)/g);

    badges.push({
      isChecked,
      label: textEl?.textContent?.trim() ?? (isChecked ? 'Certified' : 'Not certified'),
      iconRect: toRelativeRect(el.getBoundingClientRect()),
      textRect: textEl ? toRelativeRect(textEl.getBoundingClientRect()) : null,
      fontSizePx: textStyle ? parseFloat(textStyle.fontSize) || 14 : 14,
      textColor:
        colorMatch && colorMatch.length >= 3
          ? [Number(colorMatch[0]), Number(colorMatch[1]), Number(colorMatch[2])]
          : [33, 37, 41],
    });

    el.style.setProperty('visibility', 'hidden', 'important');
    textEl?.style.setProperty('visibility', 'hidden', 'important');
  });

  return badges;
}

/**
 * Draws each recorded badge directly onto the PDF (a filled circle — with a simple checkmark
 * stroke when checked — plus the label text), mapping its live CSS-px position into the correct
 * page and mm-coordinates using the same width-based scale factor the page images were placed
 * with, so it lines up with the surrounding rasterized content.
 */
function drawCertificationBadges(
  pdf: import('jspdf').jsPDF,
  badges: CertificationBadge[],
  rootWidthCssPx: number,
  contentWidthMm: number,
  sliceHeightCssPx: number,
  pageCount: number,
): void {
  const mmPerCssPx = contentWidthMm / rootWidthCssPx;

  for (const badge of badges) {
    const pageIndex = Math.min(pageCount - 1, Math.max(0, Math.floor(badge.iconRect.top / sliceHeightCssPx)));
    const pageTopCssPx = pageIndex * sliceHeightCssPx;

    pdf.setPage(pageIndex + 1);

    const iconX = PDF_MARGIN_MM + badge.iconRect.left * mmPerCssPx;
    const iconY = PDF_MARGIN_MM + (badge.iconRect.top - pageTopCssPx) * mmPerCssPx;
    const radius = (badge.iconRect.width / 2) * mmPerCssPx;
    const cx = iconX + radius;
    const cy = iconY + radius;

    if (badge.isChecked) {
      pdf.setFillColor(25, 135, 84);
      pdf.circle(cx, cy, radius, 'F');
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(Math.max(0.3, radius * 0.18));
      pdf.line(cx - radius * 0.45, cy, cx - radius * 0.1, cy + radius * 0.35);
      pdf.line(cx - radius * 0.1, cy + radius * 0.35, cx + radius * 0.5, cy - radius * 0.35);
    } else {
      pdf.setDrawColor(108, 117, 125);
      pdf.setLineWidth(Math.max(0.2, radius * 0.12));
      pdf.circle(cx, cy, radius * 0.85, 'S');
    }

    if (badge.textRect) {
      const textX = PDF_MARGIN_MM + badge.textRect.left * mmPerCssPx;
      const textCenterY = PDF_MARGIN_MM + (badge.textRect.top - pageTopCssPx + badge.textRect.height / 2) * mmPerCssPx;
      const fontSizePt = badge.fontSizePx * mmPerCssPx * (72 / 25.4);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(fontSizePt);
      pdf.setTextColor(...badge.textColor);
      pdf.text(badge.label, textX, textCenterY, { baseline: 'middle' });
    }
  }
}

/**
 * html2canvas has long-standing incomplete support for the flexbox `gap` property (children can
 * render with zero effective spacing, sometimes invisibly). This only ever touches html2canvas's
 * own disposable clone of the DOM — never the live page — so it's a capture-time compatibility
 * patch, not a redesign of the shared SLB/dynamic-form markup.
 */
function normalizeForCapture(clonedDoc: Document): void {
  clonedDoc.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const style = clonedDoc.defaultView?.getComputedStyle(el);
    if (!style || (style.display !== 'flex' && style.display !== 'inline-flex')) return;

    const rowGap = parseFloat(style.rowGap || '0') || 0;
    const columnGap = parseFloat(style.columnGap || '0') || 0;
    if (!rowGap && !columnGap) return;

    el.style.gap = '0px';
    const isRow = style.flexDirection === 'row' || style.flexDirection === 'row-reverse';
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child, index) => {
      if (index === children.length - 1) return;
      if (isRow) {
        child.style.marginRight = `${columnGap || rowGap}px`;
      } else {
        child.style.marginBottom = `${rowGap || columnGap}px`;
      }
    });
  });
}

/**
 * Rasterizes `element` (via html2canvas) and paginates it into a portrait A4 PDF (via jsPDF).
 * Each page gets a real `PDF_MARGIN_MM` margin on all four sides, so the captured content is
 * cropped into per-page slices up front (via a scratch canvas) rather than drawing one huge image
 * shifted by a negative offset — that trick can only clip at the page edge, not at an inset margin
 * line. Page breaks are a fixed slice height, not row-aware, so a table row can occasionally split
 * across a page boundary.
 *
 * Certification badges (the "Certified"/"Not certified" icon + label) are excluded from the raster
 * capture and drawn natively afterward — see `prepareCertificationBadgesForNativeDraw`.
 */
export async function exportElementToPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

  await document.fonts?.ready?.catch(() => undefined);

  const rootWidthCssPx = element.offsetWidth;
  const badges = prepareCertificationBadgesForNativeDraw(element);

  const canvas = await html2canvas(element, { useCORS: true, scale: 2, onclone: normalizeForCapture });

  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const contentWidthMm = pageWidth - PDF_MARGIN_MM * 2;
  const contentHeightMm = pageHeight - PDF_MARGIN_MM * 2;

  // Canvas pixels per content-width mm — used to convert the per-page content height back into a
  // canvas-pixel slice height so every page holds exactly one page's worth of content.
  const pxPerMm = canvas.width / contentWidthMm;
  const sliceHeightPx = Math.max(1, Math.floor(contentHeightMm * pxPerMm));
  const scaleX = canvas.width / rootWidthCssPx;
  const sliceHeightCssPx = sliceHeightPx / scaleX;

  let renderedPx = 0;
  let isFirstPage = true;
  let pageCount = 0;

  while (renderedPx < canvas.height) {
    const sliceHeightPxClamped = Math.min(sliceHeightPx, canvas.height - renderedPx);

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeightPxClamped;
    const ctx = pageCanvas.getContext('2d');
    if (!ctx) break;
    ctx.drawImage(
      canvas,
      0,
      renderedPx,
      canvas.width,
      sliceHeightPxClamped,
      0,
      0,
      canvas.width,
      sliceHeightPxClamped,
    );

    if (!isFirstPage) pdf.addPage();
    const sliceHeightMm = sliceHeightPxClamped / pxPerMm;
    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', PDF_MARGIN_MM, PDF_MARGIN_MM, contentWidthMm, sliceHeightMm);

    renderedPx += sliceHeightPxClamped;
    isFirstPage = false;
    pageCount += 1;
  }

  if (badges.length && pageCount > 0) {
    drawCertificationBadges(pdf, badges, rootWidthCssPx, contentWidthMm, sliceHeightCssPx, pageCount);
  }

  pdf.save(filename);
}
