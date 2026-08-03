import type { Content } from 'pdfmake/interfaces';
import { buildClaimLetterPdfDocDefinition } from './claim-letter-pdf.builder';
import { ClaimLetterDocumentData } from './claim-letter.models';

const sampleData: ClaimLetterDocumentData = {
  refNo: 'CL/AP/2026-27/1-1',
  letterDate: '2026-06-30T00:00:00.000Z',
  stateName: 'Andhra Pradesh',
  departmentName: 'Directorate of Municipal Administration',
  designYearLabel: '2026-27',
  installment: 1,
  batchNumber: 1,
  priorFcCycleLabel: '14th FC',
  subjectLine: 'Claim Letter subject line',
  introParagraph: 'Intro paragraph text.',
  closingParagraph: 'Closing paragraph text.',
  signatoryName: 'Vikram Rao',
  signatoryDesignation: 'Finance Analyst',
  coveringLetterRows: [
    { slNo: 1, ulbId: 'ulb-1', ulbName: 'Adanki (TP)', claimAmount: 1.6 },
    { slNo: 2, ulbId: 'ulb-2', ulbName: 'Chimakurthy (TP)', claimAmount: 1.4 },
  ],
  totalClaimAmount: 3,
  annexure1Rows: [
    { slNo: 1, ulbId: 'ulb-1', ulbName: 'Adanki (TP)', priorFcUnspentAmount: 0.08, claimedAmount: 1.6, eligible: true },
    { slNo: 2, ulbId: 'ulb-2', ulbName: 'Chimakurthy (TP)', priorFcUnspentAmount: 0.21, claimedAmount: 1.4, eligible: false },
  ],
  // 5 columns, not the old fixed 4 — proves the table/legend genuinely scale with whatever criteria
  // are enabled, rather than assuming a hardcoded count.
  annexure2Columns: [
    { type: 'UPLOAD_CONFIG_AUDITED', label: 'Audited Financial Statement', shortLabel: 'AFS' },
    { type: 'UPLOAD_CONFIG_PROVISIONAL', label: 'Provisional Financial Statement', shortLabel: 'PFS' },
    { type: 'FC_UNSPENT_STATE', label: 'FC Unspent Balance Disclosure', shortLabel: 'FC Disclosure' },
    { type: 'ELECTED_BODY', label: 'Confirmation of constituted elected body', shortLabel: 'Elected Bodies' },
    { type: 'SLB', label: 'Service Level Benchmarks', shortLabel: 'SLB' },
  ],
  annexure2Rows: [
    {
      slNo: 1,
      ulbId: 'ulb-1',
      ulbName: 'Adanki (TP)',
      criteria: [
        { type: 'UPLOAD_CONFIG_AUDITED', met: true },
        { type: 'UPLOAD_CONFIG_PROVISIONAL', met: true },
        { type: 'FC_UNSPENT_STATE', met: true },
        { type: 'ELECTED_BODY', met: true },
        { type: 'SLB', met: true },
      ],
    },
    {
      slNo: 2,
      ulbId: 'ulb-2',
      ulbName: 'Chimakurthy (TP)',
      criteria: [
        { type: 'UPLOAD_CONFIG_AUDITED', met: false },
        { type: 'UPLOAD_CONFIG_PROVISIONAL', met: true },
        { type: 'FC_UNSPENT_STATE', met: true },
        { type: 'ELECTED_BODY', met: true },
        { type: 'SLB', met: false },
      ],
    },
  ],
};

function findTables(content: Content[]): { table: { body: unknown[][] } }[] {
  return content
    .filter((item) => typeof item === 'object' && item !== null && 'table' in item)
    .map((item) => item as unknown as { table: { body: unknown[][] } });
}

describe('buildClaimLetterPdfDocDefinition', () => {
  it('produces exactly two page breaks, separating three sections', () => {
    const docDefinition = buildClaimLetterPdfDocDefinition(sampleData);
    const content = docDefinition.content as Content[];

    const pageBreaks = content.filter(
      (item) => typeof item === 'object' && item !== null && 'pageBreak' in item && item.pageBreak === 'before',
    );
    expect(pageBreaks.length).toBe(2);
  });

  it('builds the covering letter table with one row per ULB plus a header and total row', () => {
    const docDefinition = buildClaimLetterPdfDocDefinition(sampleData);
    const content = docDefinition.content as Content[];
    const tables = findTables(content);

    expect(tables[0].table.body.length).toBe(sampleData.coveringLetterRows.length + 2);
  });

  it('builds Annexure 1 with one row per ULB plus a header, labelled with the dynamic FC cycle', () => {
    const docDefinition = buildClaimLetterPdfDocDefinition(sampleData);
    const content = docDefinition.content as Content[];
    const tables = findTables(content);

    expect(tables[1].table.body.length).toBe(sampleData.annexure1Rows.length + 1);
    const headerRow = tables[1].table.body[0] as { text?: string }[];
    expect(headerRow[2].text).toContain('14th FC');
  });

  it('builds Annexure 2 with one row per ULB plus a header', () => {
    const docDefinition = buildClaimLetterPdfDocDefinition(sampleData);
    const content = docDefinition.content as Content[];
    const tables = findTables(content);

    expect(tables[2].table.body.length).toBe(sampleData.annexure2Rows.length + 1);
  });

  it('builds Annexure 2 with one column per entry in annexure2Columns (5 here, not a hardcoded 4), headers using shortLabel', () => {
    const docDefinition = buildClaimLetterPdfDocDefinition(sampleData);
    const content = docDefinition.content as Content[];
    const tables = findTables(content);

    const headerRow = tables[2].table.body[0] as { text?: string }[];
    // 2 fixed columns (S.No., ULB) + 5 dynamic criteria columns.
    expect(headerRow.length).toBe(2 + sampleData.annexure2Columns.length);
    expect(headerRow.slice(2).map((cell) => cell.text)).toEqual(sampleData.annexure2Columns.map((c) => c.shortLabel));

    const firstDataRow = tables[2].table.body[1] as { text?: string }[];
    expect(firstDataRow.length).toBe(2 + sampleData.annexure2Columns.length);
    // ulb-2's second row has UPLOAD_CONFIG_AUDITED/SLB unmet — spot-check the legend reflects all 5.
    const legend = content.find(
      (item): item is { text: string; style: string } =>
        typeof item === 'object' && item !== null && 'style' in item && item.style === 'footnote',
    );
    expect(legend?.text).toBe(
      'AFS = Audited Financial Statement · PFS = Provisional Financial Statement · FC Disclosure = FC Unspent Balance Disclosure · Elected Bodies = Confirmation of constituted elected body · SLB = Service Level Benchmarks',
    );
  });

  it('formats claim amounts through formatCrore (Cr.-suffixed) rather than raw numbers', () => {
    const docDefinition = buildClaimLetterPdfDocDefinition(sampleData);
    const content = docDefinition.content as Content[];
    const tables = findTables(content);

    const firstDataRow = tables[0].table.body[1] as { text?: string; alignment?: string }[];
    expect(firstDataRow[2].text).toContain('Cr.');
  });
});
