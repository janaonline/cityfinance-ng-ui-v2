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
      'newGetURLForFileUpload',
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

    await TestBed.configureTestingModule({
      imports: [FileComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
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
    fileService.newGetURLForFileUpload.and.returnValue(
      of({
        success: true,
        message: 'ok',
        data: [
          {
            file_name: 'minutes.pdf',
            mime_type: 'application/pdf',
            host: '',
            url: 'https://upload.example.com',
            path: storagePath,
            file_url: storagePath,
            file_alias: storagePath,
          },
        ],
      }),
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
});
