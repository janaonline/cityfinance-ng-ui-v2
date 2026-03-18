import { HttpEventType } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { S3FileURLResponse } from '../../../../core/models/s3Responses/fileURLResponse';
import { ToStorageUrlPipe } from '../../../../core/pipes/to-storage-url.pipe';
import { UtilityService } from '../../../../core/services/utility.service';
import { MaterialModule } from '../../../../material.module';
import { FieldConfig, LegacyFileValue, UploadedFileValue } from '../../field.interface';
import { FileIconComponent } from '../file-icon/file-icon.component';
import { DndDirective } from './dnd.directive';
import { FileService } from './file.service';

type FileParentFieldConfig = Pick<FieldConfig, 'readonly' | 'validations'>;
type UploadableFileExtension = 'pdf' | 'xlsx' | 'xls' | 'docx' | 'doc' | 'txt';
type FileMimeTypeMap = Readonly<Record<UploadableFileExtension, string>>;

@Component({
  selector: 'app-file',
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
export class FileComponent implements OnInit, OnDestroy {
  private static nextFileInputId = 0;

  @Input() parentField?: FileParentFieldConfig;
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;

  readonly showUploadedFileMessage = input(false);
  readonly fileInputId = `file-drop-ref-${FileComponent.nextFileInputId++}`;
  readonly fileTypes: FileMimeTypeMap = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
  };

  isUploading = false;
  uploadProgress = signal(0);

  s3Subscribe!: Subscription;
  currentFile: File | null = null;
  allowedFileTypeStr: string = '';
  maxFileSize: number = 20;
  uploadFolderName: string = `ulb/year/audited/ulbCode`;
  readonly: boolean | undefined = false;

  validations: FieldConfig['validations'] = [];

  constructor(
    private fileService: FileService,
    private utilityService: UtilityService,
  ) {}

  ngOnInit() {
    this.allowedFileTypeStr =
      this.field.allowedFileTypes
        ?.map((extension) => this.getMimeTypeForExtension(extension))
        ?.filter((mimeType): mimeType is string => !!mimeType)
        ?.join(',') || '';
    this.maxFileSize = this.field.maxFileSize || this.maxFileSize;
    this.uploadFolderName = this.field.folderPath || this.uploadFolderName;
    this.readonly = this.parentField?.readonly || this.field?.readonly;
    this.validations = this.parentField?.validations || this.field?.validations || [];
  }

  ngOnDestroy(): void {
    this.s3Subscribe?.unsubscribe();
    this.resetUploadState();
  }

  get standaloneFileControl(): FormControl<UploadedFileValue | null> | null {
    const control = this.group.get(this.field.key);
    return control instanceof FormControl
      ? (control as FormControl<UploadedFileValue | null>)
      : null;
  }

  get legacyFileGroup(): FormGroup | null {
    if (this.standaloneFileControl) {
      return null;
    }

    const control = this.group.get('file');
    return control instanceof FormGroup ? control : null;
  }

  get uploadedFile(): LegacyFileValue | null {
    if (this.legacyFileGroup) {
      const fileValue = this.legacyFileGroup.getRawValue() as LegacyFileValue;
      return this.hasUploadedFileValue(fileValue) ? fileValue : null;
    }

    const fileValue = this.normalizeStandaloneValue(this.standaloneFileControl?.value ?? null);
    if (!fileValue) {
      return null;
    }

    const fileSize = Number(fileValue.fileSize);

    return {
      name: fileValue.fileName,
      url: fileValue.fileUrl,
      size: fileValue.fileSize === null ? null : this.formatBytes(fileSize),
      ...(fileValue.mimeType ? { mimeType: fileValue.mimeType } : {}),
    };
  }

  get showStandaloneLabel(): boolean {
    return !!this.standaloneFileControl && !!this.field?.label;
  }

  get isButtonView(): boolean {
    return this.field.fileViewType === 'button';
  }

  get uploadPromptLabel(): string {
    return this.showStandaloneLabel ? 'Upload file' : 'Upload consolidated PDF';
  }

  get hasUploadedFile(): boolean {
    return !!this.uploadedFile;
  }

  get showButtonUploadedState(): boolean {
    return this.hasUploadedFile && !this.showUploadProgress;
  }

  get showUploadProgress(): boolean {
    return this.isUploading && !!this.currentFile;
  }

  get currentFileSize(): string | null {
    return this.currentFile ? this.formatBytes(this.currentFile.size) : null;
  }

  get previewUrl(): string | null {
    if (!this.uploadedFile?.url || this.field.uploading || this.isUploading) {
      return null;
    }

    return this.uploadedFile.url;
  }

  get shouldShowUploadedFileMessage(): boolean {
    return !!this.uploadedFile && this.showUploadedFileMessage();
  }

  get fileNameControl(): AbstractControl | null {
    return this.legacyFileGroup?.get('name') ?? this.standaloneFileControl;
  }

  get showError(): boolean {
    const control = this.fileNameControl;
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get errorMessage(): string {
    return (
      this.validations?.find((validation) => validation.name === 'required')?.message ||
      'This field is required.'
    );
  }

  @ViewChild('fileDropRef', { static: false }) fileDropRef!: ElementRef<HTMLInputElement>;
  resetFileInput() {
    if (this.fileDropRef?.nativeElement) {
      this.fileDropRef.nativeElement.value = '';
    }
  }

  openFileBrowser(): void {
    this.resetFileInput();
    this.fileDropRef?.nativeElement.click();
  }

  /**
   * on file drop handler
   */
  onFileDropped($event: FileList) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.prepareFilesList(target.files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile() {
    this.resetFileInput();
    this.s3Subscribe?.unsubscribe();
    this.currentFile = null;
    this.resetUploadState();

    if (this.legacyFileGroup) {
      this.legacyFileGroup.reset();
      this.legacyFileGroup.markAllAsTouched();
      this.legacyFileGroup.markAsDirty();
      this.legacyFileGroup.updateValueAndValidity();
      return;
    }

    this.standaloneFileControl?.setValue(null);
    this.standaloneFileControl?.markAsTouched();
    this.standaloneFileControl?.markAsDirty();
    this.standaloneFileControl?.updateValueAndValidity();
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: FileList | null) {
    if (!files?.length || !files[0]) return;

    this.s3Subscribe?.unsubscribe();
    this.resetUploadState();

    if (!this.isValidFile(files[0])) {
      return;
    }
    this.currentFile = files[0];

    // this.uploadFilesSimulator(0);
    this.uploadFileToS3();
  }

  isValidFile(file: File): boolean {
    if (!file) return false;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedFileTypes = this.field.allowedFileTypes?.map((type) => type.toLowerCase());
    if (allowedFileTypes?.length && (!fileExtension || !allowedFileTypes.includes(fileExtension))) {
      Swal.fire(
        'Error',
        `Allowed file extensions: ${this.field.allowedFileTypes?.join(', ')}`,
        'error',
      );
      return false;
    }

    if (file.size / 1024 / 1024 > this.maxFileSize) {
      Swal.fire('File Limit Error', `Maximum ${this.maxFileSize} mb file can be allowed.`, 'error');
      return false;
    }

    const isfileValid = this.fileService.checkSpcialCharInFileName(file);
    if (isfileValid == false) {
      Swal.fire(
        'Error',
        'File name has special characters ~`!#$%^&*+=[]\\\';,/{}|":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n',
        'error',
      );
      return false;
    }

    return true;
  }

  uploadFileToS3() {
    // if (reset) return control.patchValue({ uploading: false, name: '', url: '' });
    if (!this.currentFile) return;
    const file = this.currentFile;

    // control.patchValue({ uploading: true });
    this.field.uploading = true;
    this.s3Subscribe = this.fileService
      .newGetURLForFileUpload(file.name, file.type, this.uploadFolderName)
      .subscribe({
        next: (s3Response: S3FileURLResponse) => {
          const { url, path } = s3Response.data[0];
          this.startUpload();
          this.s3Subscribe = this.fileService.newUploadFileToS3(file, url).subscribe({
            next: (res) => {
              if (res.type === HttpEventType.UploadProgress) {
                this.updateUploadProgress(res.loaded, res.total);
                return;
              }

              if (res.type !== HttpEventType.Response) {
                return;
              }

              this.currentFile = null;
              this.resetUploadState();
              this.patchUploadedFileValue({
                fileName: file.name,
                fileUrl: path,
                fileSize: file.size,
                ...(file.type ? { mimeType: file.type } : {}),
              });
            },
            error: () => {
              this.handleUploadFailure();
            },
          });
        },
        error: () => {
          this.handleUploadFailure();
        },
      });
    return;
  }

  private getMimeTypeForExtension(extension: string): string | undefined {
    const normalizedExtension = extension.toLowerCase();
    if (!this.isSupportedFileExtension(normalizedExtension)) {
      return undefined;
    }

    return this.fileTypes[normalizedExtension];
  }

  private isSupportedFileExtension(
    extension: string | undefined,
  ): extension is UploadableFileExtension {
    return !!extension && extension in this.fileTypes;
  }

  private patchUploadedFileValue(fileValue: Exclude<UploadedFileValue, null>): void {
    if (this.legacyFileGroup) {
      this.legacyFileGroup.patchValue({
        name: fileValue.fileName,
        url: fileValue.fileUrl,
        size: this.formatBytes(fileValue.fileSize ?? 0),
      });
      this.legacyFileGroup.get('name')?.markAsTouched();
      this.legacyFileGroup.markAsDirty();
      this.legacyFileGroup.updateValueAndValidity();
      this.uploadSuccessful();
      return;
    }

    this.standaloneFileControl?.setValue(fileValue);
    this.standaloneFileControl?.markAsTouched();
    this.standaloneFileControl?.markAsDirty();
    this.standaloneFileControl?.updateValueAndValidity();
    this.uploadSuccessful();
  }

  private uploadSuccessful() {
    this.utilityService.triggerSnackbar('File attached successfully!');
  }

  private startUpload(): void {
    this.isUploading = true;
    this.uploadProgress.set(0);
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
    this.isUploading = false;
    this.uploadProgress.set(0);
    this.field.uploading = false;
  }

  private handleUploadFailure(): void {
    this.currentFile = null;
    this.resetUploadState();
    console.error('Failed to upload to file!');
    this.utilityService.triggerSnackbar('Failed to upload file!', 'snackbar-danger');
  }

  private normalizeStandaloneValue(value: unknown): UploadedFileValue {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const fileName =
      this.getNonEmptyString((value as Record<string, unknown>)['fileName']) ??
      this.getNonEmptyString((value as Record<string, unknown>)['name']);
    const fileUrl =
      this.getNonEmptyString((value as Record<string, unknown>)['fileUrl']) ??
      this.getNonEmptyString((value as Record<string, unknown>)['url']);
    const fileSize = this.normalizeFileSize(
      (value as Record<string, unknown>)['fileSize'] ?? (value as Record<string, unknown>)['size'],
    );
    const mimeType = this.getNonEmptyString((value as Record<string, unknown>)['mimeType']);

    if (!fileName && !fileUrl && fileSize === null && !mimeType) {
      return null;
    }

    return {
      fileName: fileName ?? this.getFileNameFromUrl(fileUrl),
      fileUrl: fileUrl ?? '',
      fileSize,
      ...(mimeType ? { mimeType } : {}),
    };
  }

  private hasUploadedFileValue(fileValue: LegacyFileValue | null): boolean {
    return !!fileValue?.name || !!fileValue?.url;
  }

  private getNonEmptyString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private normalizeFileSize(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private getFileNameFromUrl(fileUrl: string | null): string {
    if (!fileUrl) {
      return '';
    }

    const segments = fileUrl.split('/');
    return segments[segments.length - 1] ?? '';
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals: number = 0) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
