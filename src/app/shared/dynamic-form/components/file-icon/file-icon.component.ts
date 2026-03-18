import { Component, computed, input } from '@angular/core';

const SUPPORTED_FILE_EXTENSIONS = ['pdf', 'xlsx', 'xls', 'doc', 'docx', 'txt'] as const;

export type SupportedFileExtension = (typeof SUPPORTED_FILE_EXTENSIONS)[number];
type ResolvedFileExtension = SupportedFileExtension | 'unknown';
type FileIconConfig = Readonly<{
  iconClass: string;
  label: string;
}>;

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
  readonly fileName = input<string | null | undefined>(undefined);
  readonly extension = input<string | null | undefined>(undefined);

  readonly resolvedExtension = computed<ResolvedFileExtension>(() => {
    const normalizedExtension = this.normalizeExtension(this.extension());

    if (normalizedExtension) {
      return normalizedExtension;
    }

    return this.extractExtensionFromFileName(this.fileName()) ?? 'unknown';
  });

  readonly iconClass = computed(() => FILE_ICON_MAP[this.resolvedExtension()].iconClass);
  readonly iconLabel = computed(() => FILE_ICON_MAP[this.resolvedExtension()].label);

  private normalizeExtension(extension: string | null | undefined): SupportedFileExtension | null {
    const normalizedValue = extension?.trim().replace(/^\./, '').toLowerCase() ?? '';
    return this.isSupportedFileExtension(normalizedValue) ? normalizedValue : null;
  }

  private extractExtensionFromFileName(
    fileName: string | null | undefined,
  ): SupportedFileExtension | null {
    const normalizedFileName = fileName?.trim();
    if (!normalizedFileName) {
      return null;
    }

    const baseFileName = normalizedFileName.split(/[\\/]/).pop()?.split(/[?#]/)[0] ?? '';
    const lastDotIndex = baseFileName.lastIndexOf('.');

    if (lastDotIndex < 0 || lastDotIndex === baseFileName.length - 1) {
      return null;
    }

    return this.normalizeExtension(baseFileName.slice(lastDotIndex + 1));
  }

  private isSupportedFileExtension(value: string): value is SupportedFileExtension {
    return (SUPPORTED_FILE_EXTENSIONS as readonly string[]).includes(value);
  }
}
