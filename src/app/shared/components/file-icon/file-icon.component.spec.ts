import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileIconComponent } from './file-icon.component';
interface ComponentInput {
  fileName?: string | null | undefined;
  extension?: string | null | undefined;
}

describe('FileIconComponent', () => {
  let fixture: ComponentFixture<FileIconComponent>;
  let component: FileIconComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileIconComponent);
    component = fixture.componentInstance;
  });

  function setInputs(inputs: ComponentInput): void {
    if ('fileName' in inputs) {
      fixture.componentRef.setInput('fileName', inputs.fileName);
    }

    if ('extension' in inputs) {
      fixture.componentRef.setInput('extension', inputs.extension);
    }

    fixture.detectChanges();
  }

  describe('resolved extension', () => {
    it('should use explicit extension when it is valid', () => {
      // Arrange
      setInputs({ extension: 'pdf', fileName: 'report.docx' });

      // Act
      const result = component.resolvedExtension();

      // Assert
      expect(result).toBe('pdf');
    });

    it('should normalize extension with uppercase letters', () => {
      setInputs({ extension: 'PDF' });
      expect(component.resolvedExtension()).toBe('pdf');
    });

    it('should normalize explicit extension with leading dot', () => {
      setInputs({ extension: '.docx' });
      expect(component.resolvedExtension()).toBe('docx');
    });

    it('should normalize extension with surrounding whitespaces', () => {
      setInputs({ extension: '    txt    ' });
      expect(component.resolvedExtension()).toBe('txt');
    });

    it('should ignore unsupported extension and fall back to fileName', () => {
      setInputs({ extension: '.exe', fileName: 'statement.xlsx' });
      expect(component.resolvedExtension()).toBe('xlsx');
    });

    it('should return unknown when extension is unsupported and fileName is invalid', () => {
      setInputs({ extension: '.exe', fileName: 'README' });
      expect(component.resolvedExtension()).toBe('unknown');
    });

    it('should extract extension from a simple file name', () => {
      setInputs({ fileName: 'report.pdf' });
      expect(component.resolvedExtension()).toBe('pdf');
    });

    it('should extract extension from a uppercase file name', () => {
      setInputs({ fileName: 'REPORT.PDF' });
      expect(component.resolvedExtension()).toBe('pdf');
    });

    it('should extract extension from a file path', () => {
      setInputs({ fileName: 'C:\\docs\\budget.xlsx' });
      expect(component.resolvedExtension()).toBe('xlsx');
    });

    it('should extract extension from a URL/path with query params and hash', () => {
      setInputs({ fileName: '/files/notes.docx?version=2#section' });
      expect(component.resolvedExtension()).toBe('docx');
    });

    it('should use last extension when file name has multiple dots', () => {
      setInputs({ fileName: 'annual.report.final.pdf' });
      expect(component.resolvedExtension()).toBe('pdf');
    });

    it('should return unknow when file name has no extension', () => {
      setInputs({ fileName: 'README' });
      expect(component.resolvedExtension()).toBe('unknown');
    });

    it('should return unknown when file name ends with a dot', () => {
      setInputs({ fileName: 'report.' });
      expect(component.resolvedExtension()).toBe('unknown');
    });

    it('should return unknown when file name is whitespace', () => {
      setInputs({ fileName: '       ' });
      expect(component.resolvedExtension()).toBe('unknown');
    });

    it('should return unknown when fileName is null', () => {
      setInputs({ fileName: null });

      expect(component.resolvedExtension()).toBe('unknown');
    });

    it('should return unknown for unsupported file extension', () => {
      setInputs({ fileName: 'photo.png' });

      expect(component.resolvedExtension()).toBe('unknown');
    });
  });

  describe('iconClass and iconLabel', () => {
    it('should return the correct icon class and label for pdf', () => {
      setInputs({ fileName: 'report.pdf' });

      expect(component.iconClass()).toBe('bi bi-file-earmark-pdf-fill fs-4 me-1 text-danger');
      expect(component.iconLabel()).toBe('PDF file');
    });

    it('should return the correct icon class and label for xlsx', () => {
      setInputs({ fileName: 'sheet.xlsx' });

      expect(component.iconClass()).toBe(
        'bi bi-file-earmark-spreadsheet-fill fs-4 me-1 text-success',
      );
      expect(component.iconLabel()).toBe('Spreadsheet file');
    });

    it('should return the correct icon class and label for xls', () => {
      setInputs({ fileName: 'sheet.xls' });

      expect(component.iconClass()).toBe(
        'bi bi-file-earmark-spreadsheet-fill fs-4 me-1 text-success',
      );
      expect(component.iconLabel()).toBe('Spreadsheet file');
    });

    it('should return the correct icon class and label for doc', () => {
      setInputs({ fileName: 'letter.doc' });

      expect(component.iconClass()).toBe('bi bi-file-earmark-text-fill fs-4 me-1 text-primary');
      expect(component.iconLabel()).toBe('Word document');
    });

    it('should return the correct icon class and label for docx', () => {
      setInputs({ fileName: 'letter.docx' });

      expect(component.iconClass()).toBe('bi bi-file-earmark-text-fill fs-4 me-1 text-primary');
      expect(component.iconLabel()).toBe('Word document');
    });

    it('should return the correct icon class and label for txt', () => {
      setInputs({ fileName: 'notes.txt' });

      expect(component.iconClass()).toBe('bi bi-filetype-txt fs-4 me-1 text-secondary');
      expect(component.iconLabel()).toBe('Text file');
    });

    it('should return the default icon class and label for unknown', () => {
      setInputs({ fileName: 'archive.zip' });

      expect(component.iconClass()).toBe('bi bi-file-earmark-fill fs-4 me-1 text-muted');
      expect(component.iconLabel()).toBe('Unknown file');
    });
  });

  describe('template rendering', () => {
    it('should render an icon element', () => {
      setInputs({ fileName: 'report.pdf' });
      const icon: HTMLElement | null = fixture.nativeElement.querySelector(
        '[data-testid="file-icon"]',
      );

      expect(icon).not.toBeNull();
    });

    it('should render the correct classes for a pdf file', () => {
      setInputs({ fileName: 'report.pdf' });
      const icon: HTMLElement = fixture.nativeElement.querySelector('[data-testid="file-icon"]');

      expect(icon.className).toContain('bi-file-earmark-pdf-fill');
      expect(icon.className).toContain('text-danger');
    });

    it('should render the default icon class for an unknown file', () => {
      setInputs({ fileName: 'archive.zip' });
      const icon: HTMLElement = fixture.nativeElement.querySelector('i');

      expect(icon.className).toContain('bi-file-earmark-fill');
      expect(icon.className).toContain('text-muted');
    });

    it('should render the correct aria-label', () => {
      setInputs({ fileName: 'notes.txt' });
      const icon: HTMLElement = fixture.nativeElement.querySelector('i');

      expect(icon.getAttribute('aria-label')).toBe('Text file');
    });

    it('should prefer extension input over fileName in the template', () => {
      setInputs({ extension: 'pdf', fileName: 'notes.txt' });
      const icon: HTMLElement = fixture.nativeElement.querySelector('i');

      expect(icon.className).toContain('bi-file-earmark-pdf-fill');
      expect(icon.getAttribute('aria-label')).toBe('PDF file');
    });
  });
});
