import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { ClaimLetterDocumentData } from './claim-letter.models';
import { formatCrore } from './claim-letter.utils';

const yesNo = (value: boolean): string => (value ? 'Yes' : 'No');

function buildCoveringLetterContent(data: ClaimLetterDocumentData): Content[] {
  const rows = data.coveringLetterRows.map((row) => [
    { text: String(row.slNo), alignment: 'center' as const },
    row.ulbName,
    { text: formatCrore(row.claimAmount), alignment: 'right' as const },
  ]);

  return [
    { text: `${data.stateName} — ${data.departmentName}`, style: 'letterhead' },
    { text: `Government of ${data.stateName}`, style: 'letterheadSubtitle' },
    {
      columns: [
        { text: `Ref No.: ${data.refNo}`, style: 'metaLine' },
        { text: `Date: ${new Date(data.letterDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, style: 'metaLine', alignment: 'right' as const },
      ],
      margin: [0, 8, 0, 8] as [number, number, number, number],
    },
    { text: `Subject: ${data.subjectLine}`, style: 'subject' },
    { text: data.introParagraph, style: 'paragraph' },
    {
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto'],
        body: [
          [
            { text: 'S.No.', style: 'tableHeader' },
            { text: 'Urban Local Body', style: 'tableHeader' },
            { text: 'Amount (₹ Cr.)', style: 'tableHeader', alignment: 'right' as const },
          ],
          ...rows,
          [
            { text: '', border: [false, true, false, false] },
            { text: 'Total', style: 'tableTotal', border: [false, true, false, false] },
            {
              text: formatCrore(data.totalClaimAmount),
              style: 'tableTotal',
              alignment: 'right' as const,
              border: [false, true, false, false],
            },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 8, 0, 8] as [number, number, number, number],
    },
    { text: data.closingParagraph, style: 'paragraph' },
    { text: data.signatoryName, style: 'signatoryName', margin: [0, 24, 0, 0] as [number, number, number, number] },
    { text: data.signatoryDesignation, style: 'signatoryDesignation' },
  ];
}

function buildAnnexure1Content(data: ClaimLetterDocumentData): Content[] {
  const rows = data.annexure1Rows.map((row) => [
    { text: String(row.slNo), alignment: 'center' as const },
    row.ulbName,
    { text: formatCrore(row.priorFcUnspentAmount), alignment: 'right' as const },
    { text: formatCrore(row.claimedAmount), alignment: 'right' as const },
    { text: yesNo(row.eligible), alignment: 'center' as const },
  ]);

  return [
    { text: 'Annexure 1 — FC Unspent Balance Disclosures', style: 'annexureTitle' },
    { text: `Ref: ${data.refNo}`, style: 'metaLine' },
    {
      text: 'The following table summarises the FC unspent balance disclosures for all recommended Urban Local Bodies.',
      style: 'paragraph',
    },
    {
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'S.No.', style: 'tableHeader' },
            { text: 'Urban Local Body', style: 'tableHeader' },
            { text: `${data.priorFcCycleLabel} Unspent (₹ Cr.)`, style: 'tableHeader', alignment: 'right' as const },
            { text: '16th FC Allocation (₹ Cr.)', style: 'tableHeader', alignment: 'right' as const },
            { text: 'Eligible (<10%)', style: 'tableHeader', alignment: 'center' as const },
          ],
          ...rows,
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 8, 0, 8] as [number, number, number, number],
    },
  ];
}

function buildAnnexure2Content(data: ClaimLetterDocumentData): Content[] {
  // Dynamic, not a fixed 6 cells — one column per currently-enabled criterion (see
  // ClaimLetterDocumentData.annexure2Columns's own docblock). Each row's `criteria` is already in
  // the same order as `annexure2Columns`, so a straight positional map is enough — no need to key
  // by `type` here.
  const rows = data.annexure2Rows.map((row) => [
    { text: String(row.slNo), alignment: 'center' as const },
    row.ulbName,
    ...row.criteria.map((result) => ({ text: yesNo(result.met), alignment: 'center' as const })),
  ]);

  return [
    { text: 'Annexure 2 — City-wise Eligibility Conditions', style: 'annexureTitle' },
    { text: `Ref: ${data.refNo}`, style: 'metaLine' },
    {
      text: 'Confirmation that each recommended Urban Local Body has met all prescribed eligibility conditions as on the date of this letter.',
      style: 'paragraph',
    },
    {
      table: {
        headerRows: 1,
        widths: ['auto', '*', ...data.annexure2Columns.map(() => 'auto' as const)],
        body: [
          [
            { text: 'S.No.', style: 'tableHeader' },
            { text: 'Urban Local Body', style: 'tableHeader' },
            ...data.annexure2Columns.map((col) => ({
              text: col.shortLabel,
              style: 'tableHeader',
              alignment: 'center' as const,
            })),
          ],
          ...rows,
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 8, 0, 8] as [number, number, number, number],
    },
    {
      text: data.annexure2Columns.map((col) => `${col.shortLabel} = ${col.label}`).join(' · '),
      style: 'footnote',
    },
  ];
}

/** Builds the same 3-section content (Covering Letter / Annexure 1 / Annexure 2) rendered by
 *  `ClaimLetterDocumentPreviewDialogComponent`, as a pdfmake document definition for the Download
 *  Template action — both consume the same fetched `ClaimLetterDocumentData` (one fetch, two
 *  renderers), never re-deriving letter content independently. */
export function buildClaimLetterPdfDocDefinition(data: ClaimLetterDocumentData): TDocumentDefinitions {
  return {
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { fontSize: 10 },
    content: [
      ...buildCoveringLetterContent(data),
      { text: '', pageBreak: 'before' },
      ...buildAnnexure1Content(data),
      { text: '', pageBreak: 'before' },
      ...buildAnnexure2Content(data),
    ],
    styles: {
      letterhead: { fontSize: 14, bold: true },
      letterheadSubtitle: { fontSize: 10, color: '#666666', margin: [0, 2, 0, 8] },
      metaLine: { fontSize: 9, color: '#444444' },
      subject: { fontSize: 10, bold: true, margin: [0, 8, 0, 8] },
      paragraph: { fontSize: 10, margin: [0, 0, 0, 8], alignment: 'justify' },
      tableHeader: { bold: true, fontSize: 9, fillColor: '#f2f2f2' },
      tableTotal: { bold: true, fontSize: 9 },
      signatoryName: { fontSize: 10, bold: true },
      signatoryDesignation: { fontSize: 9, color: '#444444' },
      annexureTitle: { fontSize: 12, bold: true, margin: [0, 0, 0, 4] },
      footnote: { fontSize: 8, color: '#666666', margin: [0, 8, 0, 0] },
    },
  };
}
