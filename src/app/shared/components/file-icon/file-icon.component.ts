import { Component, computed, input } from '@angular/core';

// Single source of truth for file extensions that have dedicated icons.
const SUPPORTED_FILE_EXTENSIONS = ['pdf', 'xlsx', 'xls', 'doc', 'docx', 'txt'] as const;
export type SupportedFileExtension = (typeof SUPPORTED_FILE_EXTENSIONS)[number];
type ResolvedFileExtension = SupportedFileExtension | 'unknown';
type FileIconConfig = Readonly<{ iconClass: string; label: string }>;

// Maps each resolved file type to the Bootstrap icon class and accessible label used in the template.
const FILE_ICON_MAP: Readonly<Record<ResolvedFileExtension, FileIconConfig>> = {
  pdf: {
    iconClass: 'bi bi-file-earmark-pdf-fill fs-4 me-1 text-danger',
    label: 'PDF file',
  },
  xlsx: {
    iconClass: 'bi bi-file-earmark-spreadsheet-fill fs-4 me-1 text-success',
    label: 'Spreadsheet file',
  },
  xls: {
    iconClass: 'bi bi-file-earmark-spreadsheet-fill fs-4 me-1 text-success',
    label: 'Spreadsheet file',
  },
  doc: {
    iconClass: 'bi bi-file-earmark-text-fill fs-4 me-1 text-primary',
    label: 'Word document',
  },
  docx: {
    iconClass: 'bi bi-file-earmark-text-fill fs-4 me-1 text-primary',
    label: 'Word document',
  },
  txt: {
    iconClass: 'bi bi-filetype-txt fs-4 me-1 text-secondary',
    label: 'Text file',
  },
  unknown: {
    iconClass: 'bi bi-file-earmark-fill fs-4 me-1 text-muted',
    label: 'Unknown file',
  },
};

@Component({
  selector: 'app-file-icon',
  imports: [],
  templateUrl: './file-icon.component.html',
  styleUrl: './file-icon.component.scss',
})
export class FileIconComponent {
  // File name used to derive the extension when an explicit extension is not provided.
  readonly fileName = input<string | null | undefined>(undefined);

  // Explicit extension input that takes precedence over the derived file name extension.
  readonly extension = input<string | null | undefined>(undefined);

  // Resolve the final file type once and reuse it for icon and label bindings.
  readonly resolvedExtension = computed<ResolvedFileExtension>(() => {
    // Prefer a valid explicit extension before attempting to parse the file name.
    const normalizedExtension = this.normalizeExtension(this.extension());

    if (normalizedExtension) {
      return normalizedExtension;
    }

    return this.extractExtensionFromFileName(this.fileName()) ?? 'unknown';
  });

  // Expose the mapped icon metadata directly for template binding.
  readonly iconClass = computed(() => FILE_ICON_MAP[this.resolvedExtension()].iconClass);
  readonly iconLabel = computed(() => FILE_ICON_MAP[this.resolvedExtension()].label);

  /**
   * Normalize an extension input and keep only supported values.
   *
   * Normalization steps:
   * - Trims surrounding whitespace
   * - Removes a leading dot (e.g., ".PDF" → "PDF")
   * - Converts to lowercase (e.g., "PDF" → "pdf")
   *
   * @param extension - The raw extension value (with or without leading dot).
   * @returns The normalized extension as`SupportedFileExtension`, if valid;
   * otherwise `null` if the input is empty, invalid, or unsupported.
   */
  private normalizeExtension(extension: string | null | undefined): SupportedFileExtension | null {
    const normalizedValue = extension?.trim().replace(/^\./, '').toLowerCase() ?? '';
    return this.isSupportedFileExtension(normalizedValue) ? normalizedValue : null;
  }

  /**
   * Extracts the last file extension from a file name or path, returning it only if it is a supported extension.
   *
   * @param fileName - The file name or path to extract the extension from.
   * @returns The normalized supported file extension, or `null`
   */
  private extractExtensionFromFileName(
    fileName: string | null | undefined,
  ): SupportedFileExtension | null {
    const normalizedFileName = fileName?.trim();
    if (!normalizedFileName) {
      return null;
    }

    // Ignore directory/query fragments and inspect only the actual file segment. ("file.pdf?version=2#section")
    const baseFileName = normalizedFileName.split(/[\\/]/).pop()?.split(/[?#]/)[0] ?? '';
    const lastDotIndex = baseFileName.lastIndexOf('.');

    if (lastDotIndex < 0 || lastDotIndex === baseFileName.length - 1) {
      return null;
    }

    return this.normalizeExtension(baseFileName.slice(lastDotIndex + 1));
  }

  /**
   * Checks whether a given string is a supported file extension.
   *
   * @param value - The file extension string to validate.
   * @returns
   * - `true` if the value is included in SUPPORTED_FILE_EXTENSIONS, otherwise `false`.
   * - When `true`, `value` is treated as `SupportedFileExtension`.
   */
  private isSupportedFileExtension(value: string): value is SupportedFileExtension {
    return (SUPPORTED_FILE_EXTENSIONS as readonly string[]).includes(value);
  }
}
