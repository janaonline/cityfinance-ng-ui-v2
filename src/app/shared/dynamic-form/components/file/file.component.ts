import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { filter, finalize, map, startWith, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { S3FileURLResponse } from '../../../../core/models/s3Responses/fileURLResponse';
import { ToStorageUrlPipe } from '../../../../core/pipes/to-storage-url.pipe';
import { UtilityService } from '../../../../core/services/utility.service';
import { MaterialModule } from '../../../../material.module';
import {
  FileIconComponent,
  SupportedFileExtension,
} from '../../../components/file-icon/file-icon.component';
import { FieldConfig, LegacyFileValue, UploadedFileValue } from '../../field.interface';
import { DndDirective } from './dnd.directive';
import { FileService } from './file.service';

type FileParentFieldConfig = Pick<FieldConfig, 'readonly' | 'validations'>;
type StandaloneFileControl = FormControl<UploadedFileValue | LegacyFileValue>;
// type SupportedFileExtension = 'pdf' | 'xlsx' | 'xls' | 'docx' | 'doc' | 'txt';
type FileMimeTypeMap = Readonly<Record<SupportedFileExtension, string>>;
type NormalizedStandaloneFileValue = Exclude<UploadedFileValue, null>;
type ValidationSnapshot = Readonly<{
  invalid: boolean;
  dirty: boolean;
  touched: boolean;
}>;
type UploadTarget = Readonly<{
  uploadUrl: string;
  storagePath: string;
}>;
type UploadedFileViewModel = Readonly<{
  name: string;
  url: string;
  sizeLabel: string | null;
  mimeType: string | null;
}>;
type DisplayFileState = Readonly<{
  title: 'Selected file' | 'Uploaded file';
  name: string;
  sizeLabel: string | null;
  previewUrl: string | null;
  isUploading: boolean;
  progress: number | null;
}>;

const DEFAULT_MAX_FILE_SIZE_MB = 20;
const DEFAULT_UPLOAD_FOLDER = 'ulb/year/audited/ulbCode';
const REQUIRED_VALIDATION_NAME = 'required';

@Component({
  selector: 'app-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MaterialModule,
    DndDirective,
    MatProgressBarModule,
    ToStorageUrlPipe,
    FileIconComponent,
  ],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent implements OnInit {
  private static nextFileInputId = 0;

  private readonly destroyRef = inject(DestroyRef);
  private readonly fileService = inject(FileService);
  private readonly utilityService = inject(UtilityService);
  private readonly fileMimeTypes: FileMimeTypeMap = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
  };
  private readonly fileValueSnapshot = signal<unknown>(null);
  private readonly validationSnapshot = signal<ValidationSnapshot>({
    invalid: false,
    dirty: false,
    touched: false,
  });

  readonly parentField = input<FileParentFieldConfig | undefined>(undefined);
  readonly field = input.required<FieldConfig>();
  readonly group = input.required<FormGroup>();
  readonly showUploadedFileMessage = input(false);
  readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInputRef');
  readonly fileInputId = `file-drop-ref-${FileComponent.nextFileInputId++}`;
  readonly selectedFile = signal<File | null>(null);
  readonly isUploading = signal(false);
  readonly uploadProgress = signal(0);

  readonly standaloneFileControl = computed<StandaloneFileControl | null>(() => {
    const control = this.group().get(this.field().key);
    return control instanceof FormControl ? (control as StandaloneFileControl) : null;
  });

  // xvifc-data-collection form (year-wise upload section)
  readonly legacyFileGroup = computed<FormGroup | null>(() => {
    if (this.standaloneFileControl()) {
      return null;
    }

    const control = this.group().get('file');
    return control instanceof FormGroup ? control : null;
  });

  readonly fileValueControl = computed<AbstractControl | null>(
    () => this.standaloneFileControl() ?? this.legacyFileGroup(),
  );

  readonly validationControl = computed<AbstractControl | null>(
    () => this.legacyFileGroup()?.get('name') ?? this.standaloneFileControl(),
  );

  readonly validations = computed(
    () => this.parentField()?.validations ?? this.field().validations ?? [],
  );

  readonly isReadonly = computed(
    () => this.parentField()?.readonly ?? this.field().readonly ?? false,
  );

  readonly isButtonView = computed(() => this.field().fileViewType === 'button');

  readonly allowedFileTypeStr = computed(() => {
    const allowedFileTypes = this.field().allowedFileTypes ?? [];
    return allowedFileTypes
      .map((extension) => this.getMimeTypeForExtension(extension))
      .filter((mimeType): mimeType is string => mimeType !== undefined)
      .join(',');
  });

  readonly maxFileSize = computed(() => this.field().maxFileSize ?? DEFAULT_MAX_FILE_SIZE_MB);

  readonly uploadFolderName = computed(() => this.field().folderPath ?? DEFAULT_UPLOAD_FOLDER);

  readonly showStandaloneLabel = computed(
    () => !!this.standaloneFileControl() && !!this.getNonEmptyString(this.field().label),
  );

  readonly fieldLabel = computed(() => {
    const field = this.field();
    return `${field.position ? `${field.position}. ` : ''}${field.label}`;
  });

  readonly uploadPromptLabel = computed(() =>
    this.showStandaloneLabel() ? 'Upload file' : 'Upload consolidated PDF',
  );

  readonly uploadedFile = computed<UploadedFileViewModel | null>(() => {
    if (this.standaloneFileControl()) {
      const standaloneValue = this.normalizeStandaloneValue(this.fileValueSnapshot());
      if (!standaloneValue) {
        return null;
      }

      return {
        name: standaloneValue.fileName,
        url: standaloneValue.fileUrl,
        sizeLabel:
          standaloneValue.fileSize === null ? null : this.formatBytes(standaloneValue.fileSize),
        mimeType: standaloneValue.mimeType ?? null,
      };
    }

    return this.normalizeLegacyValue(this.fileValueSnapshot());
  });

  readonly hasUploadedFile = computed(() => !!this.uploadedFile());

  readonly previewUrl = computed(() => {
    if (this.isUploading()) {
      return null;
    }

    return this.getNonEmptyString(this.uploadedFile()?.url);
  });

  readonly currentFileSize = computed(() => {
    const file = this.selectedFile();
    return file ? this.formatBytes(file.size) : null;
  });

  readonly canSelectFile = computed(() => !this.isReadonly() && !this.isUploading());

  readonly canRemoveFile = computed(
    () => !this.isReadonly() && !this.isUploading() && this.hasUploadedFile(),
  );

  readonly showUploadProgress = computed(() => this.isUploading() && !!this.selectedFile());

  readonly showButtonUploadedState = computed(
    () => this.hasUploadedFile() && !this.showUploadProgress(),
  );

  readonly displayFile = computed<DisplayFileState | null>(() => {
    const selectedFile = this.selectedFile();
    if (this.isUploading() && selectedFile) {
      return {
        title: 'Selected file',
        name: selectedFile.name,
        sizeLabel: this.currentFileSize(),
        previewUrl: null,
        isUploading: true,
        progress: this.uploadProgress(),
      };
    }

    const uploadedFile = this.uploadedFile();
    if (!uploadedFile) {
      return null;
    }

    return {
      title: 'Uploaded file',
      name: uploadedFile.name,
      sizeLabel: uploadedFile.sizeLabel,
      previewUrl: this.previewUrl(),
      isUploading: false,
      progress: null,
    };
  });

  readonly shouldShowUploadedFileMessage = computed(
    () => !!this.uploadedFile() && this.showUploadedFileMessage(),
  );

  readonly showError = computed(() => {
    const validationSnapshot = this.validationSnapshot();
    return validationSnapshot.invalid && (validationSnapshot.dirty || validationSnapshot.touched);
  });

  readonly errorMessage = computed(
    () =>
      this.validations().find((validation) => validation.name === REQUIRED_VALIDATION_NAME)
        ?.message ?? 'This field is required.',
  );

  readonly liveRegionMessage = computed(() => {
    const displayFile = this.displayFile();
    if (displayFile?.isUploading) {
      return `Uploading ${displayFile.name}. ${displayFile.progress ?? 0} percent complete.`;
    }

    if (this.shouldShowUploadedFileMessage()) {
      return 'File uploaded successfully.';
    }

    if (this.showError()) {
      return this.errorMessage();
    }

    return '';
  });

  public ngOnInit(): void {
    this.bindFileValueState();
    this.bindValidationState();
  }

  public resetFileInput(): void {
    const fileInput = this.fileInputRef()?.nativeElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  public openFileBrowser(): void {
    if (!this.canSelectFile()) {
      return;
    }

    this.resetFileInput();
    this.fileInputRef()?.nativeElement.click();
  }

  public onDropzoneKeydown(event: KeyboardEvent): void {
    if (!this.canSelectFile()) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
      return;
    }

    event.preventDefault();
    this.openFileBrowser();
  }

  public onFileDropped(files: FileList): void {
    this.prepareFilesList(files);
  }

  public fileBrowseHandler(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.prepareFilesList(target.files);
  }

  public deleteFile(): void {
    if (!this.canRemoveFile()) {
      return;
    }

    this.resetFileInput();
    this.resetUploadState();

    const legacyFileGroup = this.legacyFileGroup();
    if (legacyFileGroup) {
      legacyFileGroup.reset();
      legacyFileGroup.markAllAsTouched();
      legacyFileGroup.markAsDirty();
      legacyFileGroup.updateValueAndValidity();
      return;
    }

    const standaloneControl = this.standaloneFileControl();
    standaloneControl?.setValue(null);
    standaloneControl?.markAsTouched();
    standaloneControl?.markAsDirty();
    standaloneControl?.updateValueAndValidity();
  }

  public prepareFilesList(files: FileList | null): void {
    if (!this.canSelectFile()) {
      return;
    }

    const file = files?.item(0);
    if (!file) {
      return;
    }

    if (!this.isValidFile(file)) {
      this.resetFileInput();
      return;
    }

    this.uploadFile(file);
  }

  public isValidFile(file: File): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedFileTypes = this.field().allowedFileTypes?.map((type) => type.toLowerCase()) ?? [];

    if (
      allowedFileTypes.length > 0 &&
      (!fileExtension || !allowedFileTypes.includes(fileExtension))
    ) {
      Swal.fire(
        'Error',
        `Allowed file extensions: ${this.field().allowedFileTypes?.join(', ')}`,
        'error',
      );
      return false;
    }

    if (file.size / 1024 / 1024 > this.maxFileSize()) {
      Swal.fire(
        'File Limit Error',
        `Maximum ${this.maxFileSize()} mb file can be allowed.`,
        'error',
      );
      return false;
    }

    const hasValidFileName = this.fileService.checkSpcialCharInFileName(file);
    if (!hasValidFileName) {
      Swal.fire(
        'Error',
        'File name has special characters ~`!#$%^&*+=[]\\\';,/{}|":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n',
        'error',
      );
      return false;
    }

    return true;
  }

  private bindFileValueState(): void {
    const source = this.fileValueControl();
    this.fileValueSnapshot.set(this.readControlValue(source));

    if (!source) {
      return;
    }

    source.events
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fileValueSnapshot.set(this.readControlValue(source)));
  }

  private bindValidationState(): void {
    const control = this.validationControl();
    this.validationSnapshot.set(this.createValidationSnapshot(control));

    if (!control) {
      return;
    }

    control.events
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.validationSnapshot.set(this.createValidationSnapshot(control)));
  }

  private uploadFile(file: File): void {
    this.startUpload(file);

    this.fileService
      .newGetURLForFileUpload(file.name, file.type, this.uploadFolderName())
      .pipe(
        map((response) => this.resolveUploadTarget(response)),
        switchMap((uploadTarget) =>
          this.fileService.newUploadFileToS3(file, uploadTarget.uploadUrl).pipe(
            tap((event) => this.handleUploadEvent(event)),
            filter((event) => event.type === HttpEventType.Response),
            map(() => this.createUploadedFileValue(file, uploadTarget.storagePath)),
          ),
        ),
        finalize(() => this.resetUploadState()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (uploadedFileValue) => {
          this.patchUploadedFileValue(uploadedFileValue);
          this.uploadSuccessful();
        },
        error: (error: unknown) => {
          this.handleUploadFailure(error);
        },
      });
  }

  private startUpload(file: File): void {
    this.selectedFile.set(file);
    this.isUploading.set(true);
    this.uploadProgress.set(0);
  }

  private handleUploadEvent(event: HttpEvent<unknown>): void {
    if (event.type !== HttpEventType.UploadProgress) {
      return;
    }

    this.updateUploadProgress(event.loaded, event.total);
  }

  private updateUploadProgress(loaded: number, total?: number): void {
    if (typeof total === 'number' && total > 0) {
      this.uploadProgress.set(Math.min(100, Math.round((loaded / total) * 100)));
      return;
    }

    if (loaded > 0 && this.uploadProgress() === 0) {
      this.uploadProgress.set(1);
    }
  }

  private resetUploadState(): void {
    this.selectedFile.set(null);
    this.isUploading.set(false);
    this.uploadProgress.set(0);
  }

  private handleUploadFailure(error: unknown): void {
    console.error('Failed to upload file.', error);
    this.utilityService.triggerSnackbar('Failed to upload file!', 'snackbar-danger');
  }

  private resolveUploadTarget(response: S3FileURLResponse): UploadTarget {
    const uploadTarget = response.data?.[0];
    const uploadUrl = this.getNonEmptyString(uploadTarget?.url);
    const storagePath = this.getNonEmptyString(uploadTarget?.path);

    if (!uploadUrl || !storagePath) {
      throw new Error('Upload URL response is missing upload url or storage path.');
    }

    return { uploadUrl, storagePath };
  }

  private createUploadedFileValue(
    file: File,
    storagePath: string,
  ): Exclude<UploadedFileValue, null> {
    return {
      fileName: file.name,
      fileUrl: storagePath,
      fileSize: file.size,
      ...(file.type ? { mimeType: file.type } : {}),
    };
  }

  private patchUploadedFileValue(fileValue: Exclude<UploadedFileValue, null>): void {
    const legacyFileGroup = this.legacyFileGroup();
    if (legacyFileGroup) {
      legacyFileGroup.patchValue({
        name: fileValue.fileName,
        url: fileValue.fileUrl,
        size: fileValue.fileSize === null ? null : this.formatBytes(fileValue.fileSize),
      });
      legacyFileGroup.get('name')?.markAsTouched();
      legacyFileGroup.markAsDirty();
      legacyFileGroup.updateValueAndValidity();
      return;
    }

    const standaloneControl = this.standaloneFileControl();
    standaloneControl?.setValue(fileValue);
    standaloneControl?.markAsTouched();
    standaloneControl?.markAsDirty();
    standaloneControl?.updateValueAndValidity();
  }

  private uploadSuccessful(): void {
    this.utilityService.triggerSnackbar('File attached successfully!');
  }

  private readControlValue(control: AbstractControl | null): unknown {
    if (!control) {
      return null;
    }

    return control instanceof FormGroup ? control.getRawValue() : control.value;
  }

  private createValidationSnapshot(control: AbstractControl | null): ValidationSnapshot {
    if (!control) {
      return {
        invalid: false,
        dirty: false,
        touched: false,
      };
    }

    return {
      invalid: control.invalid,
      dirty: control.dirty,
      touched: control.touched,
    };
  }

  private getMimeTypeForExtension(extension: string): string | undefined {
    const normalizedExtension = extension.toLowerCase();
    return this.isSupportedFileExtension(normalizedExtension)
      ? this.fileMimeTypes[normalizedExtension]
      : undefined;
  }

  private isSupportedFileExtension(
    extension: string | undefined,
  ): extension is SupportedFileExtension {
    return !!extension && extension in this.fileMimeTypes;
  }

  private normalizeStandaloneValue(value: unknown): NormalizedStandaloneFileValue | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const rawValue = value as Record<string, unknown>;
    const fileName =
      this.getNonEmptyString(rawValue['fileName']) ?? this.getNonEmptyString(rawValue['name']);
    const fileUrl =
      this.getNonEmptyString(rawValue['fileUrl']) ?? this.getNonEmptyString(rawValue['url']);

    if (!fileName && !fileUrl) {
      return null;
    }

    const fileSize = this.normalizeFileSize(rawValue['fileSize'] ?? rawValue['size']);
    const mimeType = this.getNonEmptyString(rawValue['mimeType']);

    return {
      fileName: fileName ?? this.getFileNameFromUrl(fileUrl),
      fileUrl: fileUrl ?? '',
      fileSize,
      ...(mimeType ? { mimeType } : {}),
    };
  }

  private normalizeLegacyValue(value: unknown): UploadedFileViewModel | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const rawValue = value as Record<string, unknown>;
    const fileName =
      this.getNonEmptyString(rawValue['name']) ?? this.getNonEmptyString(rawValue['fileName']);
    const fileUrl =
      this.getNonEmptyString(rawValue['url']) ?? this.getNonEmptyString(rawValue['fileUrl']);

    if (!fileName && !fileUrl) {
      return null;
    }

    return {
      name: fileName ?? this.getFileNameFromUrl(fileUrl),
      url: fileUrl ?? '',
      sizeLabel: this.normalizeFileSizeLabel(rawValue['size'] ?? rawValue['fileSize']),
      mimeType: this.getNonEmptyString(rawValue['mimeType']),
    };
  }

  private getNonEmptyString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private normalizeFileSize(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return value;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return null;
    }

    const numericValue = Number(normalizedValue);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
  }

  private normalizeFileSizeLabel(value: unknown): string | null {
    const normalizedFileSize = this.normalizeFileSize(value);
    if (normalizedFileSize !== null) {
      return this.formatBytes(normalizedFileSize);
    }

    return this.getNonEmptyString(value);
  }

  private getFileNameFromUrl(fileUrl: string | null | undefined): string {
    if (!fileUrl) {
      return '';
    }

    const pathSegment = fileUrl.split(/[?#]/)[0];
    const segments = pathSegment.split('/');
    return segments[segments.length - 1] ?? '';
  }

  private formatBytes(bytes: number, decimals: number = 0): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals > 0 ? decimals : 0;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
