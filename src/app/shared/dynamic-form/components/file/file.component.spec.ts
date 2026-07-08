import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpEventType, HttpResponse, HttpUploadProgressEvent } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { FieldConfig, UploadedFileValue, Validator } from '../../field.interface';
import { FileService } from './file.service';
import { FileComponent } from './file.component';

describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;
  let fileService: jasmine.SpyObj<FileService>;
  let utilityService: jasmine.SpyObj<UtilityService>;

  const requiredValidation: Validator = {
    name: 'required',
    validator: null,
    message: 'File is required.',
  };

  beforeEach(async () => {
    fileService = jasmine.createSpyObj<FileService>('FileService', [
      'checkSpcialCharInFileName',
      'getSignedUrls',
      'newUploadFileToS3',
    ]);
    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', [
      'triggerSnackbar',
      'getNonEmptyString',
      'formatBytes',
      'getFileNameFromUrl',
    ]);
    fileService.checkSpcialCharInFileName.and.returnValue(true);
    utilityService.getNonEmptyString.and.callFake(
      (value: unknown): string | null =>
        typeof value === 'string' && value.trim().length > 0 ? value.trim() : null,
    );
    utilityService.formatBytes.and.callFake((bytes: number): string => `${bytes} Bytes`);
    utilityService.getFileNameFromUrl.and.callFake((fileUrl: string): string => {
      const pathSegment = fileUrl.split(/[?#]/)[0];
      const segments = pathSegment.split('/');
      return segments[segments.length - 1] ?? '';
    });

    await TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule, FileComponent, ReactiveFormsModule, NoopAnimationsModule], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }, 
        { provide: FileService, useValue: fileService },
        { provide: UtilityService, useValue: utilityService },
      ],
    }).compileComponents();
  });

  function createField(overrides: Partial<FieldConfig> = {}): FieldConfig {
    return {
      key: 'attachment',
      label: 'Attachment',
      formFieldType: 'file',
      readonly: false,
      validations: [],
      fileViewType: 'dropzone',
      allowedFileTypes: ['pdf'],
      ...overrides,
    } as FieldConfig;
  }

  function createGroup(
    initialValue: UploadedFileValue | Record<string, unknown> | null,
    validators: Validator['validator'][] = [],
  ): FormGroup {
    return new FormGroup({
      attachment: new FormControl(initialValue, validators),
    });
  }

  function createFileList(file: File): FileList {
    return {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
    } as unknown as FileList;
  }

  function setup(field: FieldConfig, group: FormGroup): void {
    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('group', group);
    fixture.detectChanges();
  }

  function mockSuccessfulUpload(storagePath = '/objects/minutes.pdf'): void {
    fileService.getSignedUrls.and.returnValue(
      of([
        {
          url: 'https://upload.example.com',
          fileAlias: storagePath,
          fileUrl: storagePath,
          path: storagePath,
          fileSize: null,
          pages: undefined,
        },
      ]),
    );
    fileService.newUploadFileToS3.and.returnValue(
      of(
        { type: HttpEventType.UploadProgress, loaded: 1, total: 1 } as HttpUploadProgressEvent,
        new HttpResponse<Object>({ status: 200, body: {} }),
      ),
    );
  }

  it('shows required validation for an untouched standalone file field on submit', () => {
    const field = createField({ validations: [requiredValidation] });
    const group = createGroup(null, [Validators.required]);

    setup(field, group);
    group.markAllAsTouched();
    fixture.detectChanges();

    expect(group.invalid).toBeTrue();
    expect(component.showError()).toBeTrue();
    expect(
      (fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement).textContent?.trim(),
    ).toBe('File is required.');
  });

  it('marks the standalone file control valid after a successful upload', () => {
    const field = createField({ validations: [requiredValidation] });
    const group = createGroup(null, [Validators.required]);
    const fileControl = group.get('attachment') as FormControl;
    const file = new File(['minutes'], 'minutes.pdf', { type: 'application/pdf' });

    mockSuccessfulUpload();
    setup(field, group);

    component.prepareFilesList(createFileList(file));
    fixture.detectChanges();

    expect(fileControl.valid).toBeTrue();
    expect(fileControl.value).toEqual({
      fileName: 'minutes.pdf',
      fileUrl: '/objects/minutes.pdf',
      fileSize: file.size,
      mimeType: 'application/pdf',
    });
    expect(component.showError()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('File attached successfully!');
  });

  it('returns the standalone file control to the invalid required state after upload then delete', () => {
    const field = createField({ validations: [requiredValidation] });
    const group = createGroup(null, [Validators.required]);
    const fileControl = group.get('attachment') as FormControl;
    const file = new File(['minutes'], 'minutes.pdf', { type: 'application/pdf' });

    mockSuccessfulUpload();
    setup(field, group);

    component.prepareFilesList(createFileList(file));
    fixture.detectChanges();
    component.deleteFile();
    fixture.detectChanges();

    expect(fileControl.value).toBeNull();
    expect(fileControl.invalid).toBeTrue();
    expect(fileControl.touched).toBeTrue();
    expect(fileControl.dirty).toBeTrue();
    expect(component.showError()).toBeTrue();
  });

  it('keeps an optional standalone file field valid when empty', () => {
    const field = createField();
    const group = createGroup(null);

    setup(field, group);
    group.markAllAsTouched();
    fixture.detectChanges();

    expect(group.valid).toBeTrue();
    expect(component.showError()).toBeFalse();
  });

  describe('appearance customization', () => {
    describe('default state (no appearance config)', () => {
      let defaultField: FieldConfig;

      beforeEach(() => {
        defaultField = createField();
        setup(defaultField, createGroup(null));
      });

      it('fileColorClass defaults to btn-cf-primary (CityFinance orange)', () => {
        expect(component.fileColorClass()).toBe('btn-cf-primary');
      });

      it('default does not apply a Bootstrap color class', () => {
        expect(component.fileColorClass()).not.toContain('btn-primary');
        expect(component.fileColorClass()).not.toContain('btn-success');
        expect(component.fileIconColorClass()).not.toBe('text-primary');
      });

      it('fileIconClass defaults to the standard dropzone icon', () => {
        expect(component.fileIconClass()).toBe('bi bi-file-earmark-arrow-up-fill');
      });

      it('fileIconColorClass defaults to text-cfPrimary', () => {
        expect(component.fileIconColorClass()).toBe('text-cfPrimary');
      });

      it('fileVariantClass is empty', () => {
        expect(component.fileVariantClass()).toBe('');
      });
    });

    it('renders btn-cf-primary on the upload button when no appearance is set', () => {
      setup(createField({ fileViewType: 'button' }), createGroup(null));
      expect(fixture.nativeElement.querySelector('button.btn-cf-primary')).toBeTruthy();
    });

    it('preserves the original bi-upload icon on the button when no appearance.icon is set', () => {
      setup(createField({ fileViewType: 'button' }), createGroup(null));
      const icon = fixture.nativeElement.querySelector('button i') as HTMLElement | null;
      expect(icon?.className).toContain('bi-upload');
    });

    // Explicit color: primary
    it('appearance.color=primary gives btn-primary and text-primary', () => {
      setup(createField({ appearance: { color: 'primary' } }), createGroup(null));
      expect(component.fileColorClass()).toBe('btn-primary');
      expect(component.fileIconColorClass()).toBe('text-primary');
    });

    it('applies btn-primary to the upload button when color is primary', () => {
      setup(createField({ fileViewType: 'button', appearance: { color: 'primary' } }), createGroup(null));
      expect(fixture.nativeElement.querySelector('button.btn-primary')).toBeTruthy();
    });

    // Explicit color: success
    it('appearance.color=success gives btn-success and text-success', () => {
      setup(createField({ appearance: { color: 'success' } }), createGroup(null));
      expect(component.fileColorClass()).toBe('btn-success');
      expect(component.fileIconColorClass()).toBe('text-success');
    });

    it('applies btn-success to the upload button when color is success', () => {
      setup(createField({ fileViewType: 'button', appearance: { color: 'success' } }), createGroup(null));
      expect(fixture.nativeElement.querySelector('button.btn-success')).toBeTruthy();
    });

    // Explicit color: warning
    it('appearance.color=warning gives btn-warning and text-warning', () => {
      setup(createField({ appearance: { color: 'warning' } }), createGroup(null));
      expect(component.fileColorClass()).toBe('btn-warning');
      expect(component.fileIconColorClass()).toBe('text-warning');
    });

    it('applies btn-warning to the upload button when color is warning', () => {
      setup(createField({ fileViewType: 'button', appearance: { color: 'warning' } }), createGroup(null));
      expect(fixture.nativeElement.querySelector('button.btn-warning')).toBeTruthy();
    });

    // Explicit color: danger
    it('appearance.color=danger gives btn-danger and text-danger', () => {
      setup(createField({ appearance: { color: 'danger' } }), createGroup(null));
      expect(component.fileColorClass()).toBe('btn-danger');
      expect(component.fileIconColorClass()).toBe('text-danger');
    });

    it('applies btn-danger to the upload button when color is danger', () => {
      setup(createField({ fileViewType: 'button', appearance: { color: 'danger' } }), createGroup(null));
      expect(fixture.nativeElement.querySelector('button.btn-danger')).toBeTruthy();
    });

    // Explicit color: secondary
    it('appearance.color=secondary gives btn-secondary and text-secondary', () => {
      setup(createField({ appearance: { color: 'secondary' } }), createGroup(null));
      expect(component.fileColorClass()).toBe('btn-secondary');
      expect(component.fileIconColorClass()).toBe('text-secondary');
    });

    it('applies the icon color class to the dropzone icon', () => {
      setup(createField({ appearance: { color: 'primary' } }), createGroup(null));
      const icon = fixture.nativeElement.querySelector('.file-dropzone i') as HTMLElement | null;
      expect(icon?.className).toContain('text-primary');
    });

    it('fileIconClass reflects the configured icon', () => {
      setup(createField({ appearance: { icon: 'bi-cloud-arrow-up-fill' } }), createGroup(null));
      expect(component.fileIconClass()).toBe('bi bi-cloud-arrow-up-fill');
    });

    it('applies the configured icon to the dropzone', () => {
      setup(
        createField({ appearance: { color: 'success', icon: 'bi-cloud-arrow-up-fill' } }),
        createGroup(null),
      );
      const icon = fixture.nativeElement.querySelector('.file-dropzone i') as HTMLElement | null;
      expect(icon?.className).toContain('bi-cloud-arrow-up-fill');
    });

    it('applies the configured icon to the button when appearance.icon is set', () => {
      setup(
        createField({ fileViewType: 'button', appearance: { color: 'primary', icon: 'bi-cloud-upload' } }),
        createGroup(null),
      );
      const icon = fixture.nativeElement.querySelector('button i') as HTMLElement | null;
      expect(icon?.className).toContain('bi-cloud-upload');
    });

    it('fileVariantClass returns the soft class string', () => {
      setup(createField({ appearance: { color: 'success', variant: 'soft' } }), createGroup(null));
      expect(component.fileVariantClass()).toBe('file-color-success file-variant-soft');
    });

    it('applies soft variant classes to the dropzone container', () => {
      setup(createField({ appearance: { color: 'danger', variant: 'soft' } }), createGroup(null));
      const dropzone = fixture.nativeElement.querySelector('.file-dropzone') as HTMLElement | null;
      expect(dropzone?.classList).toContain('file-variant-soft');
      expect(dropzone?.classList).toContain('file-color-danger');
    });

    it('fileColorClass returns btn-outline-{color} for outlined variant', () => {
      setup(createField({ appearance: { color: 'warning', variant: 'outlined' } }), createGroup(null));
      expect(component.fileColorClass()).toBe('btn-outline-warning');
    });

    it('fileVariantClass returns the outlined class string', () => {
      setup(createField({ appearance: { color: 'warning', variant: 'outlined' } }), createGroup(null));
      expect(component.fileVariantClass()).toBe('file-color-warning file-variant-outlined');
    });

    it('applies outlined variant classes to the dropzone container', () => {
      setup(createField({ appearance: { color: 'primary', variant: 'outlined' } }), createGroup(null));
      const dropzone = fixture.nativeElement.querySelector('.file-dropzone') as HTMLElement | null;
      expect(dropzone?.classList).toContain('file-variant-outlined');
      expect(dropzone?.classList).toContain('file-color-primary');
    });

    // fileDropzoneClass: drives the dropzone container classes
    it('fileDropzoneClass returns file-dropzone-cityfinance when no appearance color', () => {
      setup(createField(), createGroup(null));
      expect(component.fileDropzoneClass()).toBe('file-dropzone-cityfinance');
    });

    it('fileDropzoneClass returns file-color-primary file-variant-default for primary with no variant', () => {
      setup(createField({ appearance: { color: 'primary' } }), createGroup(null));
      expect(component.fileDropzoneClass()).toBe('file-color-primary file-variant-default');
    });

    it('fileDropzoneClass returns file-color-success file-variant-soft for success soft', () => {
      setup(createField({ appearance: { color: 'success', variant: 'soft' } }), createGroup(null));
      expect(component.fileDropzoneClass()).toBe('file-color-success file-variant-soft');
    });

    it('fileDropzoneClass returns file-color-warning file-variant-outlined for warning outlined', () => {
      setup(createField({ appearance: { color: 'warning', variant: 'outlined' } }), createGroup(null));
      expect(component.fileDropzoneClass()).toBe('file-color-warning file-variant-outlined');
    });

    it('dropzone has file-dropzone-cityfinance and not file-color-* when no appearance color', () => {
      setup(createField(), createGroup(null));
      const dropzone = fixture.nativeElement.querySelector('.file-dropzone') as HTMLElement | null;
      expect(dropzone?.classList).toContain('file-dropzone-cityfinance');
      expect(dropzone?.classList).not.toContain('file-color-primary');
      expect(dropzone?.classList).not.toContain('file-color-success');
    });

    it('dropzone has file-color-primary and file-variant-default but not file-dropzone-cityfinance', () => {
      setup(createField({ appearance: { color: 'primary' } }), createGroup(null));
      const dropzone = fixture.nativeElement.querySelector('.file-dropzone') as HTMLElement | null;
      expect(dropzone?.classList).toContain('file-color-primary');
      expect(dropzone?.classList).toContain('file-variant-default');
      expect(dropzone?.classList).not.toContain('file-dropzone-cityfinance');
    });

    // fileVariantClass still returns empty for default variant (unchanged signal behavior)
    it('fileVariantClass is empty for default variant with a color (unchanged behavior)', () => {
      setup(createField({ appearance: { color: 'primary', variant: 'default' } }), createGroup(null));
      expect(component.fileVariantClass()).toBe('');
    });

    it('upload behavior is unaffected by appearance configuration', () => {
      const field = createField({
        validations: [requiredValidation],
        appearance: { color: 'primary', variant: 'soft' },
      });
      const group = createGroup(null, [Validators.required]);
      const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });

      mockSuccessfulUpload('/objects/doc.pdf');
      setup(field, group);
      component.prepareFilesList(createFileList(file));
      fixture.detectChanges();

      expect(group.get('attachment')?.valid).toBeTrue();
      expect(component.showError()).toBeFalse();
    });
  });

  describe('data-cy selectors', () => {
    it('dropzone mode: main dropzone has field.key + -test selector', () => {
      setup(createField({ key: 'devolutionExcelFile', fileViewType: 'dropzone' }), createGroup(null));
      const dropzone = fixture.nativeElement.querySelector('[data-cy="devolutionExcelFile-test"]') as HTMLElement | null;
      expect(dropzone).toBeTruthy();
      expect(dropzone?.classList).toContain('file-dropzone');
    });

    it('button mode: upload button has field.key + -test selector', () => {
      setup(createField({ key: 'devolutionExcelFile', fileViewType: 'button' }), createGroup(null));
      const button = fixture.nativeElement.querySelector('[data-cy="devolutionExcelFile-test"]') as HTMLElement | null;
      expect(button).toBeTruthy();
      expect(button?.tagName.toLowerCase()).toBe('button');
    });

    it('hidden file input has field.key + -file-input-test selector', () => {
      setup(createField({ key: 'devolutionExcelFile' }), createGroup(null));
      const input = fixture.nativeElement.querySelector('[data-cy="devolutionExcelFile-file-input-test"]') as HTMLInputElement | null;
      expect(input).toBeTruthy();
      expect(input?.type).toBe('file');
    });

    it('error block has field.key + -error-test selector when error is shown', () => {
      // Use the default key ('attachment') so it matches the control name in createGroup.
      const field = createField({ validations: [requiredValidation] });
      const group = createGroup(null, [Validators.required]);

      setup(field, group);
      group.markAllAsTouched();
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('[data-cy="attachment-error-test"]') as HTMLElement | null;
      expect(errorEl).toBeTruthy();
      expect(errorEl?.getAttribute('role')).toBe('alert');
    });

    it('does not set data-cy when field.key is empty string', () => {
      const field = createField({ key: '' });
      setup(field, createGroup(null));

      expect(fixture.nativeElement.querySelector('[data-cy]')).toBeNull();
    });
  });

  describe('fileRequirementText', () => {
    it('shows accepted formats and max file size when both are configured', () => {
      setup(
        createField({ allowedFileTypes: ['xlsx', 'xls'], maxFileSize: 20 }),
        createGroup(null),
      );
      expect(component.fileRequirementText()).toBe(
        'Accepted formats: .xlsx, .xls · Max file size: 20 MB',
      );
      const el: HTMLElement | null = fixture.nativeElement.querySelector('.file-dropzone small:last-child');
      expect(el?.textContent?.trim()).toBe('Accepted formats: .xlsx, .xls · Max file size: 20 MB');
    });

    it('shows only accepted formats when only allowedFileTypes is configured', () => {
      setup(createField({ allowedFileTypes: ['pdf'] }), createGroup(null));
      expect(component.fileRequirementText()).toBe('Accepted formats: .pdf');
    });

    it('shows only max file size when only maxFileSize is configured', () => {
      setup(createField({ allowedFileTypes: [], maxFileSize: 10 }), createGroup(null));
      expect(component.fileRequirementText()).toBe('Max file size: 10 MB');
    });

    it('returns empty string and renders no requirement line when neither is configured', () => {
      setup(createField({ allowedFileTypes: [] }), createGroup(null));
      expect(component.fileRequirementText()).toBe('');
      const smalls = fixture.nativeElement.querySelectorAll('.file-dropzone small');
      const texts = Array.from(smalls).map((el) => (el as HTMLElement).textContent?.trim());
      expect(texts).not.toContain('Accepted formats:');
      expect(texts).not.toContain('Max file size:');
    });
  });

  describe('hideLabel', () => {
    it('shows the label when hideLabel is not set', () => {
      const field = createField({ label: 'Upload Document' });
      const group = createGroup(null);

      setup(field, group);

      expect(component.showStandaloneLabel()).toBeTrue();
      expect(fixture.nativeElement.querySelector('label')).toBeTruthy();
      expect(
        (fixture.nativeElement.querySelector('label') as HTMLElement).textContent?.trim(),
      ).toContain('Upload Document');
    });

    it('hides the label when hideLabel is true', () => {
      const field = createField({ label: 'Upload Document', hideLabel: true });
      const group = createGroup(null);

      setup(field, group);

      expect(component.showStandaloneLabel()).toBeFalse();
      expect(fixture.nativeElement.querySelector('label')).toBeNull();
    });

    it('shows the label when hideLabel is explicitly false', () => {
      const field = createField({ label: 'Upload Document', hideLabel: false });
      const group = createGroup(null);

      setup(field, group);

      expect(component.showStandaloneLabel()).toBeTrue();
    });
  });
});
