import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FileIconComponent } from './file-icon.component';

describe('FileIconComponent', () => {
  let component: FileIconComponent;
  let fixture: ComponentFixture<FileIconComponent>;

  const getIconElement = (): HTMLElement =>
    fixture.debugElement.query(By.css('i')).nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive the icon from fileName', () => {
    fixture.componentRef.setInput('fileName', 'budget-report.XLSX');
    fixture.detectChanges();

    expect(getIconElement().className).toContain('bi-file-earmark-excel-fill');
    expect(getIconElement().getAttribute('aria-label')).toBe('Spreadsheet file');
  });

  it('should prefer extension when both inputs are provided', () => {
    fixture.componentRef.setInput('fileName', 'minutes.pdf');
    fixture.componentRef.setInput('extension', 'docx');
    fixture.detectChanges();

    expect(getIconElement().className).toContain('bi-file-earmark-word-fill');
    expect(getIconElement().getAttribute('aria-label')).toBe('Word document');
  });

  it('should render the unknown icon for unsupported files', () => {
    fixture.componentRef.setInput('fileName', 'archive.zip');
    fixture.detectChanges();

    expect(getIconElement().className).toContain('bi-file-earmark-fill');
    expect(getIconElement().getAttribute('aria-label')).toBe('Unknown file');
  });
});
