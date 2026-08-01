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
import { PDFDocument } from 'pdf-lib';
import { filter, finalize, from, map, startWith, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { SignedUrlDirective } from '../../../../core/directives/storage-url.directive';
import { UtilityService } from '../../../../core/services/utility.service';
import { MaterialModule } from '../../../../material.module';
import { FileIconComponent, SupportedFileExtension } from '../../../components/file-icon/file-icon.component';
import { FieldAppearanceColor, FieldConfig } from '../../field.interface';
import { DndDirective } from './dnd.directive';
import { UploadedFileMetadata, normalizeUploadedFileMetadata } from './file-metadata.types';
import { FileService, S3UrlResult } from './file.service';

type FileParentFieldConfig = Pick<FieldConfig, 'readonly' | 'validations'>;
type StandaloneFileControl = FormControl<UploadedFileMetadata | null>;
// type SupportedFileExtension = 'pdf' | 'xlsx' | 'xls' | 'docx' | 'doc' | 'txt';
type FileMimeTypeMap = Readonly<Record<SupportedFileExtension, string>>;
type ValidationSnapshot = Readonly<{
  invalid: boolean;
  dirty: boolean;
  touched: boolean;
  errors: Record<string, unknown> | null;
  disabled: boolean;
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

/**
 * Refactored file-upload component to preserve standalone usage for direct dynamic-form imports
 * and alignment with Angular v20, while continuing to support the legacy nested file-group
 * contract used by `<app-year-wise>` upload flows.
 * It also maintains compatibility with the two persisted file-value shapes currently used across the application:
 * - canonical `UploadedFileMetadata` (`{ originalName, path, mimeType, sizeKb, pageCount }`)
 *   in standalone reactive controls
 * - `{ name, url, size }` in legacy nested groups.
 */
@Component({
  selector: 'app-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MaterialModule, DndDirective, MatProgressBarModule, SignedUrlDirective, FileIconComponent],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent implements OnInit {
  /**
   * Generates a unique id for the hidden file input.
   * This keeps each component instance correctly linked in the DOM.
   */
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
  readonly field = input.required<FieldConfig>();
  readonly group = input.required<FormGroup>();

  readonly showUploadedFileMessage = input(false);
  readonly selectedFile = signal<File | null>(null);
  readonly isUploading = signal(false);
  readonly uploadProgress = signal(0);
  /** Blob object URL for the locally-selected file; valid until revoked. Never stored in form value. */
  readonly localPreviewUrl = signal<string | null>(null);

  /**
   * Stores the current value of the active form control.
   * The component copies control changes into a signal.
   * This keeps template state predictable under `OnPush`.
   * It also supports both standalone and legacy control shapes.
   */
  private readonly validationSnapshot = signal<ValidationSnapshot>({
    invalid: false,
    dirty: false,
    touched: false,
    errors: null,
    disabled: false,
  });

  /** Optional parent config that can override readonly and validation settings. */
  readonly parentField = input<FileParentFieldConfig | undefined>(undefined);

  /** Reference to the hidden file input used by both button and dropzone upload flows. */
  readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInputRef');

  /** Stable DOM id used for the hidden input and related accessibility attributes. */
  readonly fileInputId = `file-drop-ref-${FileComponent.nextFileInputId++}`;

  /**
   * Resolves the standalone form control used by newer file fields.
   * The full `UploadedFileMetadata` is stored in a single control based on field().key.
   */
  readonly standaloneFileControl = computed<StandaloneFileControl | null>(() => {
    const control = this.group().get(this.field().key);
    return control instanceof FormControl ? (control as StandaloneFileControl) : null;
  });

  /**
   * Resolves the legacy nested file group used by older year-wise upload flows,
   * File metadata is stored in `group.get('file')` through separate `name`, `url`, and `size` controls.
   */
  readonly legacyFileGroup = computed<FormGroup | null>(() => {
    if (this.standaloneFileControl()) {
      return null;
    }

    const control = this.group().get('file');
    return control instanceof FormGroup ? control : null;
  });

  /** Returns a single source control across both standalone and legacy forms. */
  readonly fileValueControl = computed<AbstractControl | null>(
    () => this.standaloneFileControl() ?? this.legacyFileGroup(),
  );

  /** Validation control: `name` in legacy mode, or the root file control in standalone mode. */
  readonly validationControl = computed<AbstractControl | null>(
    () => this.legacyFileGroup()?.get('name') ?? this.standaloneFileControl(),
  );

  readonly validations = computed(() => this.parentField()?.validations ?? this.field().validations ?? []);

  readonly isReadonly = computed(
    () => (this.parentField()?.readonly ?? this.field().readonly ?? false) || this.validationSnapshot().disabled,
  );

  /** Button UI: dropzone or button */
  readonly isButtonView = computed(() => this.field().fileViewType === 'button');

  /** Helper text shown in the dropzone listing accepted formats and max file size. Empty string when neither is configured. */
  readonly fileRequirementText = computed(() => {
    const parts: string[] = [];

    const allowedFileTypes = this.field().allowedFileTypes ?? [];
    if (allowedFileTypes.length) {
      parts.push(`Accepted formats: ${allowedFileTypes.map((type) => `.${type}`).join(', ')}`);
    }

    const maxFileSize = this.field().maxFileSize;
    if (maxFileSize) {
      parts.push(`Max file size: ${maxFileSize} MB`);
    }

    return parts.join(' · ');
  });

  /**
   * Converts configured file extensions into a comma-separated MIME string for the native input
   * `accept` attribute.
   */
  readonly allowedFileTypeStr = computed(() => {
    const allowedFileTypes = this.field().allowedFileTypes ?? [];
    return allowedFileTypes
      .map((extension) => this.getMimeTypeForExtension(extension))
      .filter((mimeType): mimeType is string => mimeType !== undefined)
      .join(',');
  });

  readonly maxFileSize = computed(() => this.field().maxFileSize ?? DEFAULT_MAX_FILE_SIZE_MB);

  readonly uploadFolderName = computed(() => this.field().folderPath ?? DEFAULT_UPLOAD_FOLDER);

  /** Shows the label only for standalone file fields to avoid duplicate labels in legacy flows. */
  readonly showStandaloneLabel = computed(
    () =>
      !this.field().hideLabel &&
      !!this.standaloneFileControl() &&
      !!this.utilityService.getNonEmptyString(this.field().label),
  );

  private static readonly iconColorMap: Record<FieldAppearanceColor, string> = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    secondary: 'text-secondary',
  };

  /** Bootstrap icon class (bi + icon name). Defaults to the standard upload icon. */
  readonly fileIconClass = computed((): string => {
    const icon = this.field().appearance?.icon ?? 'bi-file-earmark-arrow-up-fill';
    return `bi ${icon}`;
  });

  /**
   * Text color class applied to the dropzone icon.
   * Defaults to text-cfPrimary (preserves original appearance when no color is configured).
   */
  readonly fileIconColorClass = computed((): string => {
    const color = this.field().appearance?.color;
    if (!color) return 'text-cfPrimary';
    return FileComponent.iconColorMap[color] ?? 'text-primary';
  });

  /**
   * Bootstrap button class for the upload button.
   * Defaults to btn-success (preserves original appearance when no color is configured).
   * Uses btn-outline-{color} when variant is 'outlined'.
   */
  readonly fileColorClass = computed((): string => {
    const appearance = this.field().appearance;
    if (!appearance?.color) return 'btn-cf-primary';
    const prefix = appearance.variant === 'outlined' ? 'btn-outline-' : 'btn-';
    return `${prefix}${appearance.color}`;
  });

  /**
   * Extra CSS classes applied to the dropzone container for soft/outlined variants.
   * Returns an empty string for the default variant or when no appearance color is configured.
   */
  readonly fileVariantClass = computed((): string => {
    const appearance = this.field().appearance;
    const color = appearance?.color;
    const variant = appearance?.variant ?? 'default';
    if (!color || variant === 'default') return '';
    return `file-color-${color} file-variant-${variant}`;
  });

  /**
   * Full appearance class for the dropzone container.
   * When no color is configured, returns 'file-dropzone-cityfinance' (CityFinance orange style).
   * When a Bootstrap color is configured, returns 'file-color-{color} file-variant-{variant}'.
   */
  readonly fileDropzoneClass = computed((): string => {
    const appearance = this.field().appearance;
    const color = appearance?.color;
    if (!color) return 'file-dropzone-cityfinance';
    const variant = appearance?.variant ?? 'default';
    return `file-color-${color} file-variant-${variant}`;
  });

  /** Final label text, including optional field numbering. (year-wise component) */
  readonly fieldLabel = computed(() => {
    const field = this.field();
    return `${field.position ? `${field.position}. ` : ''}${field.label}`;
  });

  /** Upload button label based on the current field flow. */
  readonly uploadPromptLabel = computed(() => (this.showStandaloneLabel() ? 'Upload file' : 'Upload consolidated PDF'));

  /** Normalized uploaded file data for the template across standalone and legacy formats. */
  readonly uploadedFile = computed<UploadedFileViewModel | null>(() => {
    if (this.standaloneFileControl()) {
      const standaloneValue = normalizeUploadedFileMetadata(this.fileValueSnapshot());
      if (!standaloneValue) {
        return null;
      }

      return {
        name: standaloneValue.originalName,
        url: standaloneValue.path,
        sizeLabel: standaloneValue.sizeKb > 0 ? this.utilityService.formatBytes(standaloneValue.sizeKb * 1024) : null,
        mimeType: standaloneValue.mimeType || null,
      };
    }

    return this.normalizeLegacyValue(this.fileValueSnapshot());
  });

  readonly hasUploadedFile = computed(() => !!this.uploadedFile());

  /**
   * The stored file location used for the view link while no upload is in progress. May be an
   * absolute backend-signed URL or a raw storage path — the template's `appSignedUrl` directive
   * links absolute HTTPS URLs directly and resolves raw paths into signed URLs on click.
   */
  readonly previewUrl = computed(() => {
    if (this.isUploading()) {
      return null;
    }

    return this.utilityService.getNonEmptyString(this.uploadedFile()?.url);
  });

  /** Formatted size label for the transient file currently being uploaded. */
  readonly currentFileSize = computed(() => {
    const file = this.selectedFile();
    return file ? this.utilityService.formatBytes(file.size) : null;
  });

  /** Blocks file selection when the field is readonly or uploading. */
  readonly canSelectFile = computed(() => !this.isReadonly() && !this.isUploading());

  /** Blocks file removal while readonly or uploading. */
  readonly canRemoveFile = computed(() => !this.isReadonly() && !this.isUploading() && this.hasUploadedFile());

  /** True while file is being uploaded and progress should be displayed. */
  readonly showUploadProgress = computed(() => this.isUploading() && !!this.selectedFile());

  /** isButtonView(): Shows uploaded state in `button` mode when upload is complete. */
  readonly showButtonUploadedState = computed(() => this.hasUploadedFile() && !this.showUploadProgress());

  /** Unified file state for rendering uploaded or in-progress files in the template. */
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

  /** Controls the success banner shown after upload. */
  readonly shouldShowUploadedFileMessage = computed(() => !!this.uploadedFile() && this.showUploadedFileMessage());

  /** Shows validation errors only when the control is invalid and touched or dirty. */
  readonly showError = computed(() => {
    const validationSnapshot = this.validationSnapshot();
    return validationSnapshot.invalid && (validationSnapshot.dirty || validationSnapshot.touched);
  });

  /** Active error message from field config, matched against current control errors. */
  readonly errorMessage = computed(() => {
    const errors = this.validationSnapshot().errors;
    if (errors) {
      const matched = this.validations().find((v) => Object.prototype.hasOwnProperty.call(errors, v.name));
      if (matched) return matched.message;
    }
    return this.validations().find((v) => v.name === REQUIRED_VALIDATION_NAME)?.message ?? 'This field is required.';
  });

  /** Screen-reader status text for upload progress, success confirmation, and validation feedback. */
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

  /**
   * Subscribes to the active form control's value and validation event streams so the internal
   * signals stay synchronized with reactive-form state changes under `OnPush`.
   */
  public ngOnInit(): void {
    this.bindFileValueState();
    this.bindValidationState();
    this.destroyRef.onDestroy(() => this.revokeLocalPreview());
  }

  /** Clears the file input so selecting the same file triggers change again. */
  public resetFileInput(): void {
    const fileInput = this.fileInputRef()?.nativeElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /** Opens the file picker when interaction is allowed. */
  public openFileBrowser(): void {
    if (!this.canSelectFile()) {
      return;
    }

    this.resetFileInput();
    this.fileInputRef()?.nativeElement.click();
  }

  /**
   * Enables keyboard activation for the custom dropzone so Enter and Space trigger the same native
   * file picker flow as a mouse click.
   * @param event - Keyboard event emitted by the dropzone host element
   */
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

  /**
   * Handles files emitted by the drag-and-drop directive and forwards them into the shared upload
   * preparation path.
   * @param files - Files dropped onto the dropzone host
   */
  public onFileDropped(files: FileList): void {
    this.prepareFilesList(files);
  }

  /**
   * Handles file selections made through the hidden native file input.
   * @param event - Native change event raised by the file input element
   */
  public fileBrowseHandler(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.prepareFilesList(target.files);
  }

  /**
   * Removes the currently uploaded file from the form and restores the empty state. Standalone and
   * legacy form contracts are both updated so required validation, touched state, and dirty state
   * remain consistent after deletion.
   */
  public deleteFile(): void {
    if (!this.canRemoveFile()) {
      return;
    }

    this.resetFileInput();
    this.resetUploadState();
    this.revokeLocalPreview();

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

  /**
   * Normalizes a `FileList` from drag/drop or browsing, enforces interaction guards, validates the
   * first file, and starts the upload flow when appropriate.
   * @param files - File list produced by the native input or drag-and-drop interaction
   */
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

  /**
   * Applies synchronous client-side file validation before an upload is attempted.
   * @param file - Candidate file selected by the user
   * @returns `true` when the file passes extension, size, and file-name checks; otherwise `false`
   */
  public isValidFile(file: File): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedFileTypes = this.field().allowedFileTypes?.map((type) => type.toLowerCase()) ?? [];

    if (allowedFileTypes.length > 0 && (!fileExtension || !allowedFileTypes.includes(fileExtension))) {
      Swal.fire('Error', `Allowed file extensions: ${this.field().allowedFileTypes?.join(', ')}`, 'error');
      return false;
    }

    if (file.size / 1024 / 1024 > this.maxFileSize()) {
      Swal.fire('File Limit Error', `Maximum ${this.maxFileSize()} mb file can be allowed.`, 'error');
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

  /**
   * Binds the active file value control to the internal value snapshot signal. This is the bridge
   * that keeps template-derived state in sync across standalone and legacy control shapes.
   */
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

  /**
   * Binds validation-related form control events to the internal validation snapshot so submit-time
   * touched/dirty transitions are reflected immediately in `showError()`.
   */
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

  /**
   * Executes the end-to-end upload pipeline: request a pre-signed URL, upload the file, patch the
   * form with the persisted file metadata, and always clear transient upload state on completion.
   * @param file - File that has already passed client-side validation
   */
  private uploadFile(file: File): void {
    this.startUpload(file);

    this.fileService
      .getSignedUrls([{ fileName: file.name, folder: this.uploadFolderName(), mimeType: file.type, expiresIn: 3600 }])
      .pipe(
        map((response) => this.resolveUploadTarget(response)),
        switchMap((uploadTarget) =>
          this.fileService.newUploadFileToS3(file, uploadTarget.uploadUrl).pipe(
            tap((event) => this.handleUploadEvent(event)),
            filter((event) => event.type === HttpEventType.Response),
            switchMap(() =>
              from(this.resolvePageCount(file)).pipe(
                map((pageCount) => this.createUploadedFileMetadata(file, uploadTarget.storagePath, pageCount)),
              ),
            ),
          ),
        ),
        finalize(() => this.resetUploadState()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (uploadedFileMetadata) => {
          this.patchUploadedFileMetadata(uploadedFileMetadata);
          this.uploadSuccessful();
        },
        error: (error: unknown) => {
          this.handleUploadFailure(error);
        },
      });
  }

  /**
   * Initializes transient upload state before any backend requests begin.
   * @param file - File currently being uploaded
   */
  private startUpload(file: File): void {
    this.revokeLocalPreview();
    this.localPreviewUrl.set(URL.createObjectURL(file));
    this.selectedFile.set(file);
    this.isUploading.set(true);
    this.uploadProgress.set(0);
  }

  /**
   * Processes upload stream events and forwards progress events to the progress calculator.
   * @param event - HTTP event emitted during the upload request
   */
  private handleUploadEvent(event: HttpEvent<unknown>): void {
    if (event.type !== HttpEventType.UploadProgress) {
      return;
    }

    this.updateUploadProgress(event.loaded, event.total);
  }

  /**
   * Converts raw upload byte counts into a bounded percentage suitable for progress-bar rendering.
   * @param loaded - Number of bytes uploaded so far
   * @param total - Total number of bytes expected for the upload, when provided by the backend
   */
  private updateUploadProgress(loaded: number, total?: number): void {
    if (typeof total === 'number' && total > 0) {
      this.uploadProgress.set(Math.min(100, Math.round((loaded / total) * 100)));
      return;
    }

    if (loaded > 0 && this.uploadProgress() === 0) {
      this.uploadProgress.set(1);
    }
  }

  /**
   * Clears transient upload-only UI state. This does not modify the persisted form value and is
   * therefore safe to call after both success and failure.
   */
  private resetUploadState(): void {
    this.selectedFile.set(null);
    this.isUploading.set(false);
    this.uploadProgress.set(0);
  }

  /**
   * Handles upload failures by logging the error and surfacing a shared snackbar message.
   * @param error - Error raised by either the URL request or the upload request
   */
  private handleUploadFailure(error: unknown): void {
    this.revokeLocalPreview();
    console.error('Failed to upload file.', error);
    this.utilityService.triggerSnackbar('Failed to upload file!', 'snackbar-danger');
  }

  private revokeLocalPreview(): void {
    const url = this.localPreviewUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.localPreviewUrl.set(null);
    }
  }

  /**
   * Extracts the upload URL and persisted storage path from the backend response and guards against
   * incomplete payloads before the actual upload request is made.
   * @param results - Unwrapped signed-URL results returned by the pre-signed URL endpoint
   * @returns Upload target information needed for the subsequent PUT request and form patching
   */
  private resolveUploadTarget(results: S3UrlResult[]): UploadTarget {
    const uploadTarget = results?.[0];
    const uploadUrl = this.utilityService.getNonEmptyString(uploadTarget?.url);
    const storagePath = this.utilityService.getNonEmptyString(uploadTarget?.path);

    if (!uploadUrl || !storagePath) {
      throw new Error('Upload URL response is missing upload url or storage path.');
    }

    return { uploadUrl, storagePath };
  }

  /**
   * Builds the normalized standalone file value stored in the reactive form after a successful
   * upload.
   * @param file - Original file selected by the user
   * @param storagePath - Persisted storage path returned by the backend
   * @param pageCount - Page count resolved for PDF uploads, or `null` when not applicable/unreadable
   * @returns Uploaded file value in the standalone control shape
   */
  private createUploadedFileMetadata(file: File, storagePath: string, pageCount: number | null): UploadedFileMetadata {
    return {
      originalName: file.name,
      path: storagePath,
      mimeType: file.type,
      sizeKb: file.size / 1024,
      pageCount,
    };
  }

  /**
   * Resolves the page count for PDF uploads so it can be persisted alongside the file metadata.
   * Non-PDF files, or PDFs that fail to parse, resolve to `null`.
   * @param file - File selected for upload
   */
  private async resolvePageCount(file: File): Promise<number | null> {
    if (file.type !== 'application/pdf') {
      return null;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error('Failed to resolve PDF page count.', error);
      return null;
    }
  }

  /**
   * Writes a successful upload result back into the owning form using the appropriate storage shape
   * for the current form contract.
   * @param fileValue - Normalized uploaded file metadata to persist in the form
   */
  private patchUploadedFileMetadata(fileValue: UploadedFileMetadata): void {
    const legacyFileGroup = this.legacyFileGroup();
    if (legacyFileGroup) {
      legacyFileGroup.patchValue({
        name: fileValue.originalName,
        url: fileValue.path,
        size: this.utilityService.formatBytes(fileValue.sizeKb * 1024),
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

  /**
   * Displays the shared success snackbar after the form has been updated with the uploaded file.
   */
  private uploadSuccessful(): void {
    this.utilityService.triggerSnackbar('File attached successfully!');
  }

  /**
   * Reads the current value from either a standalone control or a legacy nested form group.
   * @param control - Active reactive form control supplying the file value
   * @returns Raw control value suitable for normalization into a template-facing view model
   */
  private readControlValue(control: AbstractControl | null): unknown {
    if (!control) {
      return null;
    }

    return control instanceof FormGroup ? control.getRawValue() : control.value;
  }

  /**
   * Creates a lightweight snapshot of validation state for the currently active validation control.
   * @param control - Reactive form control responsible for validation display
   * @returns Minimal validation state consumed by `showError()`
   */
  private createValidationSnapshot(control: AbstractControl | null): ValidationSnapshot {
    if (!control) {
      return { invalid: false, dirty: false, touched: false, errors: null, disabled: false };
    }

    return {
      invalid: control.invalid,
      dirty: control.dirty,
      touched: control.touched,
      errors: control.errors as Record<string, unknown> | null,
      disabled: control.disabled,
    };
  }

  /**
   * Resolves the MIME type string used in the native `accept` attribute for a supported extension.
   * @param extension - File extension configured on the field definition
   * @returns Matching MIME type when supported; otherwise `undefined`
   */
  private getMimeTypeForExtension(extension: string): string | undefined {
    const normalizedExtension = extension.toLowerCase();
    return this.isSupportedFileExtension(normalizedExtension) ? this.fileMimeTypes[normalizedExtension] : undefined;
  }

  /**
   * Type guard that limits file-extension lookups to the supported set used by this component.
   * @param extension - Candidate extension value
   * @returns `true` when the extension is supported by the component
   */
  private isSupportedFileExtension(extension: string | undefined): extension is SupportedFileExtension {
    return !!extension && extension in this.fileMimeTypes;
  }

  /**
   * Normalizes the legacy nested file-group value into the same view model consumed by the template.
   * @param value - Raw legacy file-group value
   * @returns Uploaded file view model or `null` when the legacy value is effectively empty
   */
  private normalizeLegacyValue(value: unknown): UploadedFileViewModel | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const rawValue = value as Record<string, unknown>;
    const fileName =
      this.utilityService.getNonEmptyString(rawValue['name']) ??
      this.utilityService.getNonEmptyString(rawValue['fileName']);
    const fileUrl =
      this.utilityService.getNonEmptyString(rawValue['url']) ??
      this.utilityService.getNonEmptyString(rawValue['fileUrl']);

    if (!fileName && !fileUrl) {
      return null;
    }

    return {
      name: fileName ?? this.utilityService.getFileNameFromUrl(fileUrl),
      url: fileUrl ?? '',
      sizeLabel: this.normalizeFileSizeLabel(rawValue['size'] ?? rawValue['fileSize']),
      mimeType: this.utilityService.getNonEmptyString(rawValue['mimeType']),
    };
  }

  /**
   * Normalizes file size values coming from current payloads, legacy payloads, or patched data.
   * Numeric strings are accepted to remain defensive against mixed backend contracts.
   * @param value - Candidate file size value
   * @returns File size in bytes or `null` when the value cannot be interpreted safely
   */
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

  /**
   * Produces a display label for file size values that may already be formatted in legacy payloads.
   * @param value - Candidate file size value or label
   * @returns Formatted byte label, preserved legacy label, or `null`
   */
  private normalizeFileSizeLabel(value: unknown): string | null {
    const normalizedFileSize = this.normalizeFileSize(value);
    if (normalizedFileSize !== null) {
      return this.utilityService.formatBytes(normalizedFileSize);
    }

    return this.utilityService.getNonEmptyString(value);
  }
}
