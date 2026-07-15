import { UploadedFileMetadata, isUploadedFileMetadata, normalizeUploadedFileMetadata } from './file-metadata.types';

describe('file-metadata.types', () => {
  const canonicalValue: UploadedFileMetadata = {
    originalName: 'report.pdf',
    path: 'xvi-fc/state/example/report.pdf',
    mimeType: 'application/pdf',
    sizeKb: 128,
    pageCount: 4,
  };

  describe('isUploadedFileMetadata', () => {
    it('accepts a canonical uploaded file value', () => {
      expect(isUploadedFileMetadata(canonicalValue)).toBeTrue();
    });

    it('accepts an empty mimeType and a null pageCount (legacy-hydrated value)', () => {
      expect(isUploadedFileMetadata({ ...canonicalValue, mimeType: '', pageCount: null })).toBeTrue();
    });

    it('rejects non-objects and missing name/path', () => {
      expect(isUploadedFileMetadata(null)).toBeFalse();
      expect(isUploadedFileMetadata('report.pdf')).toBeFalse();
      expect(isUploadedFileMetadata({ ...canonicalValue, originalName: '' })).toBeFalse();
      expect(isUploadedFileMetadata({ ...canonicalValue, path: '' })).toBeFalse();
    });

    it('rejects the pre-canonical fileName/fileUrl shape', () => {
      expect(isUploadedFileMetadata({ fileName: 'old.pdf', fileUrl: '/objects/old.pdf', fileSize: 1024 })).toBeFalse();
    });

    it('rejects NaN, infinite, and negative sizeKb values', () => {
      expect(isUploadedFileMetadata({ ...canonicalValue, sizeKb: Number.NaN })).toBeFalse();
      expect(isUploadedFileMetadata({ ...canonicalValue, sizeKb: Number.POSITIVE_INFINITY })).toBeFalse();
      expect(isUploadedFileMetadata({ ...canonicalValue, sizeKb: -1 })).toBeFalse();
    });

    it('rejects a missing or non-numeric pageCount', () => {
      const withoutPageCount: Record<string, unknown> = { ...canonicalValue };
      delete withoutPageCount['pageCount'];
      expect(isUploadedFileMetadata(withoutPageCount)).toBeFalse();
      expect(isUploadedFileMetadata({ ...canonicalValue, pageCount: 'four' })).toBeFalse();
    });
  });

  describe('normalizeUploadedFileMetadata', () => {
    it('returns null for non-objects and effectively empty values', () => {
      expect(normalizeUploadedFileMetadata(null)).toBeNull();
      expect(normalizeUploadedFileMetadata(undefined)).toBeNull();
      expect(normalizeUploadedFileMetadata('report.pdf')).toBeNull();
      expect(normalizeUploadedFileMetadata({ fileName: '', fileUrl: '', fileSize: null })).toBeNull();
    });

    it('passes a canonical value through with only the five canonical keys', () => {
      expect(normalizeUploadedFileMetadata({ ...canonicalValue, extension: 'pdf', s3Key: 'abc' })).toEqual(
        canonicalValue,
      );
    });

    it('strips backend-owned timestamps so the frontend never echoes them back', () => {
      expect(
        normalizeUploadedFileMetadata({
          ...canonicalValue,
          updatedAt: '2026-07-11T14:04:21.430Z',
          uploadedAt: '2026-07-11T14:04:21.430Z',
        }),
      ).toEqual(canonicalValue);
    });

    it('treats the sizeKb key as KB and the fileSize/size keys as bytes', () => {
      expect(normalizeUploadedFileMetadata(canonicalValue)?.sizeKb).toBe(128);
      expect(normalizeUploadedFileMetadata({ fileName: 'old.pdf', fileUrl: '/old.pdf', fileSize: 2048 })?.sizeKb).toBe(
        2,
      );
      expect(normalizeUploadedFileMetadata({ name: 'old.pdf', url: '/old.pdf', size: '1024' })?.sizeKb).toBe(1);
    });

    it('normalizes an unparseable formatted size label to 0', () => {
      expect(
        normalizeUploadedFileMetadata({ fileName: 'old.pdf', fileUrl: '/old.pdf', fileSize: '23 KB' })?.sizeKb,
      ).toBe(0);
    });

    it('converts the pre-canonical shape into the canonical one', () => {
      expect(
        normalizeUploadedFileMetadata({
          fileName: 'old.pdf',
          fileUrl: '/objects/old.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          noOfPage: 3,
        }),
      ).toEqual({
        originalName: 'old.pdf',
        path: '/objects/old.pdf',
        mimeType: 'application/pdf',
        sizeKb: 1,
        pageCount: 3,
      });
    });

    it('derives the file name from the path when the name is missing', () => {
      const normalized = normalizeUploadedFileMetadata({ fileUrl: '/docs/derived.pdf?download=true' });
      expect(normalized?.originalName).toBe('derived.pdf');
      expect(normalized?.path).toBe('/docs/derived.pdf?download=true');
    });

    it('prefers canonical keys over pre-canonical aliases', () => {
      const normalized = normalizeUploadedFileMetadata({
        originalName: 'new.pdf',
        fileName: 'old.pdf',
        path: '/new.pdf',
        fileUrl: '/old.pdf',
        sizeKb: 5,
        fileSize: 999999,
        pageCount: 2,
        noOfPage: 9,
      });

      expect(normalized).toEqual({
        originalName: 'new.pdf',
        path: '/new.pdf',
        mimeType: '',
        sizeKb: 5,
        pageCount: 2,
      });
    });
  });
});
