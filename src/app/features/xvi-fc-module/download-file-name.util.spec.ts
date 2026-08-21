import { parseContentDispositionFileName } from './download-file-name.util';

describe('parseContentDispositionFileName', () => {
  it('returns null for a null header (e.g. Content-Disposition not exposed cross-origin)', () => {
    expect(parseContentDispositionFileName(null)).toBeNull();
  });

  it('parses a plain quoted filename="..." header and returns it as-is', () => {
    const parsed = parseContentDispositionFileName(
      'attachment; filename="CF_Chhattisgarh_ulb-wise-allocation-formula-template_2024-25.xlsx"',
    );

    expect(parsed).toBe('CF_Chhattisgarh_ulb-wise-allocation-formula-template_2024-25.xlsx');
  });

  it('parses an RFC 5987 filename*=UTF-8\'\'... header and decodes it', () => {
    const parsed = parseContentDispositionFileName(
      "attachment; filename*=UTF-8''CF_Uttar%20Pradesh_fc-unspent-declaration_2024-25.docx",
    );

    expect(parsed).toBe('CF_Uttar Pradesh_fc-unspent-declaration_2024-25.docx');
  });

  it('returns null for a header with no filename directive', () => {
    expect(parseContentDispositionFileName('attachment')).toBeNull();
  });
});
