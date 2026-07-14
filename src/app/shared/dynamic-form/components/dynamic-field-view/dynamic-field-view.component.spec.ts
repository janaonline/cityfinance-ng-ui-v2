import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SignedUrlDirective } from '../../../../core/directives/storage-url.directive';
import { FieldConfig } from '../../field.interface';
import { DynamicFieldViewComponent } from './dynamic-field-view.component';

describe('DynamicFieldViewComponent', () => {
  let fixture: ComponentFixture<DynamicFieldViewComponent>;
  let component: DynamicFieldViewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFieldViewComponent, NoopAnimationsModule, HttpClientTestingModule],
    }).compileComponents();
  });

  function setupFileField(value: unknown): void {
    fixture = TestBed.createComponent(DynamicFieldViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', {
      key: 'attachment',
      label: 'Attachment',
      formFieldType: 'file',
    } as FieldConfig);
    fixture.componentRef.setInput('group', new FormGroup({ attachment: new FormControl(value) }));
    fixture.detectChanges();
  }

  it('renders a canonical file value with name, formatted size, and view link', () => {
    setupFileField({
      originalName: 'report.pdf',
      path: '/objects/report.pdf',
      mimeType: 'application/pdf',
      sizeKb: 128,
      pageCount: 4,
    });

    expect(component.fileView).toEqual({
      name: 'report.pdf',
      sizeLabel: '128 KB',
      viewUrl: '/objects/report.pdf',
    });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('report.pdf');
    // Raw storage path: the view link resolves through the signed-url directive (no direct href).
    const link = fixture.debugElement.query(By.directive(SignedUrlDirective));
    expect(link).toBeTruthy();
    expect(link.injector.get(SignedUrlDirective).appSignedUrl()).toBe('/objects/report.pdf');
    expect((link.nativeElement as HTMLAnchorElement).getAttribute('href')).toBeNull();
  });

  it('links an absolute https view URL directly without signing', () => {
    setupFileField({
      originalName: 'report.pdf',
      path: 'https://signed.example.com/report.pdf',
      mimeType: 'application/pdf',
      sizeKb: 128,
      pageCount: 4,
    });

    const link = (fixture.nativeElement as HTMLElement).querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://signed.example.com/report.pdf');
  });

  it('renders a legacy-hydrated value with a null page count and no timestamp', () => {
    setupFileField({
      originalName: 'scan.pdf',
      path: '/objects/scan.pdf',
      mimeType: '',
      sizeKb: 2,
      pageCount: null,
    });

    expect(component.fileView).toEqual({
      name: 'scan.pdf',
      sizeLabel: '2 KB',
      viewUrl: '/objects/scan.pdf',
    });
  });

  it('normalizes a pre-canonical persisted value (fileName/fileUrl/fileSize in bytes)', () => {
    setupFileField({ fileName: 'old.pdf', fileUrl: '/objects/old.pdf', fileSize: 2048 });

    expect(component.fileView).toEqual({
      name: 'old.pdf',
      sizeLabel: '2 KB',
      viewUrl: '/objects/old.pdf',
    });
  });

  it('normalizes a legacy name/url/size value', () => {
    setupFileField({ name: 'minutes.pdf', url: '/objects/minutes.pdf', size: 1024 });

    expect(component.fileView).toEqual({
      name: 'minutes.pdf',
      sizeLabel: '1 KB',
      viewUrl: '/objects/minutes.pdf',
    });
  });

  it('omits the size label when the size is unknown', () => {
    setupFileField({
      originalName: 'nosize.pdf',
      path: '/objects/nosize.pdf',
      mimeType: '',
      sizeKb: 0,
      pageCount: null,
    });

    expect(component.fileView?.sizeLabel).toBeNull();
  });

  it('renders the empty placeholder for null and invalid file values', () => {
    setupFileField(null);
    expect(component.fileView).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('—');

    setupFileField({ fileName: '', fileUrl: '' });
    expect(component.fileView).toBeNull();

    setupFileField('not-a-file');
    expect(component.fileView).toBeNull();
  });
});
