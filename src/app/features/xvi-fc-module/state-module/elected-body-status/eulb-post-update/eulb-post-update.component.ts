import { CommonModule, DatePipe } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  merge,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { S3FileURLResponse } from '../../../../../core/models/s3Responses/fileURLResponse';
import { ToStorageUrlPipe } from '../../../../../core/pipes/to-storage-url.pipe';
import { UtilityService } from '../../../../../core/services/utility.service';
import { FileService } from '../../../../../shared/dynamic-form/components/file/file.service';
import { resolveDateConstraint } from '../../../../../shared/dynamic-form/date-constraint-resolver';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import {
  EulbBodyStatus,
  EulbPostSubmissionUpdateDocument,
  EulbPostSubmissionUpdateElectedBodyStatus,
  EulbPostSubmissionUpdateMetadata,
  EulbPostSubmissionUpdateRow,
  EulbPostSubmissionUpdateRowsQuery,
  EulbPostSubmissionUpdateSubmitRowError,
  EulbPostSubmissionUpdateValidateData,
  EulbPostSubmissionUpdateValidateRow,
  EulbPostSubmissionUpdateValidateRowPayload,
  EulbRowValidationStatus,
} from '../eulb-status.models';
import { EulbStatusService } from '../eulb-status.service';
import { isRecord } from '../eulb-status.utils';

type EulbPostUpdateEditableFieldKey = 'electedBodyStatus' | 'dateOfConstitution' | 'dateOfExpiry' | 'remarks';
type UpdateValidationState = 'NOT_VALIDATED' | 'VALID' | 'INVALID' | 'STALE';

type UploadTarget = Readonly<{
  uploadUrl: string;
  storagePath: string;
}>;

type EulbPostUpdateEditForm = FormGroup<{
  electedBodyStatus: FormControl<EulbBodyStatus | ''>;
  dateOfConstitution: FormControl<string>;
  dateOfExpiry: FormControl<string>;
  remarks: FormControl<string>;
}>;

interface EulbPostUpdateRowViewModel {
  readonly row: EulbPostSubmissionUpdateRow;
  readonly isModified: boolean;
  readonly cellHasError: Partial<Record<string, boolean>>;
  readonly cellErrorText: Partial<Record<string, string>>;
}

// const POST_UPDATE_EDITABLE_FIELDS: readonly EulbPostUpdateEditableFieldKey[] = [
//   'electedBodyStatus',
//   'dateOfConstitution',
//   'dateOfExpiry',
//   'remarks',
// ];

const ELECTED_BODY_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  readonly value: EulbPostSubmissionUpdateElectedBodyStatus;
  readonly label: string;
}> = [
  { value: 'Constituted', label: 'Constituted' },
  { value: 'Not Constituted', label: 'Not Constituted' },
];

const VALIDATION_STATUS_OPTIONS: ReadonlyArray<{
  readonly value: EulbRowValidationStatus;
  readonly label: string;
}> = [
  { value: 'VALID', label: 'Valid' },
  { value: 'INVALID', label: 'Invalid' },
];

function createEditForm(payload: EulbPostSubmissionUpdateValidateRowPayload): EulbPostUpdateEditForm {
  const editableStatus = payload.electedBodyStatus === 'Exempt' ? '' : payload.electedBodyStatus;

  return new FormGroup({
    electedBodyStatus: new FormControl<EulbBodyStatus | ''>(editableStatus, { nonNullable: true }),
    dateOfConstitution: new FormControl(payload.dateOfConstitution ?? '', { nonNullable: true }),
    dateOfExpiry: new FormControl(payload.dateOfExpiry ?? '', { nonNullable: true }),
    remarks: new FormControl(payload.remarks, { nonNullable: true }),
  });
}

function isPostUpdateValidationStatus(value: unknown): value is EulbRowValidationStatus {
  return value === 'VALID' || value === 'INVALID';
}

function isEulbBodyStatus(value: unknown): value is EulbBodyStatus {
  return value === 'Constituted' || value === 'Not Constituted' || value === 'Exempt';
}

function isPostUpdateElectedBodyStatus(value: unknown): value is EulbPostSubmissionUpdateElectedBodyStatus {
  return value === 'Constituted' || value === 'Not Constituted';
}

function isEditableFieldKey(value: unknown): value is EulbPostUpdateEditableFieldKey {
  return (
    value === 'electedBodyStatus' || value === 'dateOfConstitution' || value === 'dateOfExpiry' || value === 'remarks'
  );
}

function toDatePayloadValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toDateInputValue(value: string | null): string {
  if (!value) return '';
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function rowToValidatePayload(row: EulbPostSubmissionUpdateRow): EulbPostSubmissionUpdateValidateRowPayload {
  return {
    rowId: row._id,
    electedBodyStatus: row.electedBodyStatus,
    dateOfConstitution: toDateInputValue(row.dateOfConstitution) || null,
    dateOfExpiry: toDateInputValue(row.dateOfExpiry) || null,
    remarks: row.remarks ?? '',
  };
}

function payloadMatchesRow(
  payload: EulbPostSubmissionUpdateValidateRowPayload,
  row: EulbPostSubmissionUpdateRow,
): boolean {
  const original = rowToValidatePayload(row);
  return (
    payload.electedBodyStatus === original.electedBodyStatus &&
    payload.dateOfConstitution === original.dateOfConstitution &&
    payload.dateOfExpiry === original.dateOfExpiry &&
    payload.remarks === original.remarks
  );
}

function buildPostUpdateRowViewModel(
  row: EulbPostSubmissionUpdateRow,
  changedRows: ReadonlyMap<string, EulbPostSubmissionUpdateValidateRowPayload>,
): EulbPostUpdateRowViewModel {
  const cellHasError: Record<string, boolean> = {};
  const cellErrorText: Record<string, string> = {};
  for (const err of row.errors ?? []) {
    if (!err.field) continue;
    cellHasError[err.field] = true;
    cellErrorText[err.field] = cellErrorText[err.field] ? `${cellErrorText[err.field]}\n${err.message}` : err.message;
  }
  return { row, isModified: changedRows.has(row._id), cellHasError, cellErrorText };
}

function shouldFilterExemptOption(option: unknown): boolean {
  if (option === 'Exempt') return true;
  if (!isRecord(option)) return false;

  const possibleValues = [option['id'], option['value'], option['label'], option['name']];
  return possibleValues.some((value) => value === 'Exempt');
}

function filterExemptOptions(options: readonly unknown[] | undefined): unknown[] | undefined {
  if (!options) return undefined;
  return options.filter((option) => !shouldFilterExemptOption(option));
}

function filterPostUpdateRowEditFields(fields: readonly ConditionalFieldConfig[]): ConditionalFieldConfig[] {
  return fields
    .filter((field) => isEditableFieldKey(field.key))
    .map((field) =>
      field.key === 'electedBodyStatus' ? { ...field, options: filterExemptOptions(field.options) } : { ...field },
    );
}

@Component({
  selector: 'app-eulb-post-update',
  imports: [CommonModule, ReactiveFormsModule, MatTooltipModule, DatePipe, ToStorageUrlPipe],
  templateUrl: './eulb-post-update.component.html',
  styleUrl: './eulb-post-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EulbPostUpdateComponent implements OnInit {
  private readonly service = inject(EulbStatusService);
  private readonly fileService = inject(FileService);
  private readonly utilityService = inject(UtilityService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);

  readonly isLoadingMeta = signal(false);
  readonly isLoadingRows = signal(false);
  readonly isValidating = signal(false);
  readonly isUploadingDocument = signal(false);
  readonly uploadProgress = signal(0);
  readonly isSubmitting = signal(false);
  readonly metadata = signal<EulbPostSubmissionUpdateMetadata | null>(null);
  readonly rows = signal<EulbPostSubmissionUpdateRow[]>([]);
  readonly changedRows = signal<ReadonlyMap<string, EulbPostSubmissionUpdateValidateRowPayload>>(new Map());
  readonly updateDocument = signal<EulbPostSubmissionUpdateDocument | null>(null);
  readonly validationState = signal<UpdateValidationState>('NOT_VALIDATED');
  readonly metadataErrorMessage = signal<string | null>(null);
  readonly rowsErrorMessage = signal<string | null>(null);
  readonly documentErrorMessage = signal<string | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 20;
  readonly editingRowId = signal<string | null>(null);

  readonly filterForm = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    electedBodyStatus: new FormControl('', { nonNullable: true }),
    validationStatus: new FormControl('', { nonNullable: true }),
  });

  editForm: EulbPostUpdateEditForm = createEditForm({
    rowId: '',
    electedBodyStatus: 'Constituted',
    dateOfConstitution: null,
    dateOfExpiry: null,
    remarks: '',
  });

  readonly canView = computed(() => {
    const meta = this.metadata();
    return !!meta?.canUpdate && !!meta.permissions.canView;
  });

  readonly pageRowEditFields = computed(() => filterPostUpdateRowEditFields(this.metadata()?.rowEditFields ?? []));

  readonly editableFieldKeys = computed<ReadonlySet<EulbPostUpdateEditableFieldKey>>(
    () =>
      new Set(
        this.pageRowEditFields()
          .map((field) => field.key)
          .filter(isEditableFieldKey),
      ),
  );

  readonly canEditRows = computed(() => {
    const meta = this.metadata();
    return this.canView() && !!meta?.permissions.canSubmitUpdate && this.editableFieldKeys().size > 0;
  });

  readonly eligibleRowCount = computed(() => this.metadata()?.summary.eligibleRowCount ?? 0);
  readonly changedRowCount = computed(() => this.changedRows().size);
  readonly documentSizeLabel = computed(() => {
    const fileSize = this.updateDocument()?.fileSize;
    return typeof fileSize === 'number' ? this.utilityService.formatBytes(fileSize) : '';
  });
  readonly canSubmitUpdate = computed(
    () =>
      this.hasSubmitPermission() &&
      this.changedRowCount() > 0 &&
      !!this.updateDocument() &&
      this.validationState() === 'VALID' &&
      !this.isSubmitting(),
  );
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  readonly startIndex = computed(() => (this.page() - 1) * this.limit + 1);
  readonly endIndex = computed(() => Math.min(this.page() * this.limit, this.total()));
  readonly rowViewModels = computed(() =>
    this.rows().map((row) => buildPostUpdateRowViewModel(row, this.changedRows())),
  );

  readonly electedBodyStatusOptions = ELECTED_BODY_STATUS_FILTER_OPTIONS;
  readonly validationStatusOptions = VALIDATION_STATUS_OPTIONS;

  private readonly loadedRowsById = new Map<string, EulbPostSubmissionUpdateRow>();
  private readonly validationRowsById = new Map<string, EulbPostSubmissionUpdateValidateRow>();
  private readonly editFormTeardown$ = new Subject<void>();
  private loadRequestId = 0;
  private validateRequestId = 0;
  private submitRequestId = 0;
  private uploadRequestId = 0;

  private get stateId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  private get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  ngOnInit(): void {
    this.loadMetadata();
    this.setupFilterSubscription();
  }

  loadMetadata(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.metadataErrorMessage.set('State or year information is missing.');
      this.utilityService.triggerSnackbar(
        'Unable to load the form. State or year information is missing.',
        'snackbar-danger',
      );
      return;
    }

    this.metadataErrorMessage.set(null);
    this.rowsErrorMessage.set(null);
    this.isLoadingMeta.set(true);

    this.service
      .getPostSubmissionUpdateMetadata(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (meta) => {
          this.metadata.set(meta);
          this.isLoadingMeta.set(false);
          if (meta.canUpdate && meta.permissions.canView) {
            this.loadRows();
          } else {
            this.rows.set([]);
            this.total.set(0);
          }
        },
        error: () => {
          this.isLoadingMeta.set(false);
          this.metadataErrorMessage.set('Failed to load post-submission update data.');
          this.utilityService.triggerSnackbar('Failed to load post-submission update data.', 'snackbar-danger');
        },
      });
  }

  loadRows(): void {
    if (!this.canView()) return;

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) {
      this.rowsErrorMessage.set('State or year information is missing.');
      this.utilityService.triggerSnackbar(
        'Unable to load eligible rows. State or year information is missing.',
        'snackbar-danger',
      );
      return;
    }

    const requestId = ++this.loadRequestId;
    this.rowsErrorMessage.set(null);
    this.isLoadingRows.set(true);

    const { search, electedBodyStatus, validationStatus } = this.filterForm.getRawValue();
    const query: EulbPostSubmissionUpdateRowsQuery = {
      page: this.page(),
      limit: this.limit,
      search: search || undefined,
      electedBodyStatus: isPostUpdateElectedBodyStatus(electedBodyStatus) ? electedBodyStatus : undefined,
      validationStatus: isPostUpdateValidationStatus(validationStatus) ? validationStatus : undefined,
    };

    this.service
      .getPostSubmissionUpdateRows(stateId, yearId, query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (requestId !== this.loadRequestId) return;
          this.storeLoadedRows(data.rows);
          this.rows.set(data.rows.map((row) => this.overlayRowWithLocalState(row)));
          this.total.set(data.total);
          this.isLoadingRows.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) return;
          this.rowsErrorMessage.set('Failed to load eligible rows.');
          this.utilityService.triggerSnackbar('Failed to load eligible rows.', 'snackbar-danger');
          this.isLoadingRows.set(false);
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadRows();
  }

  startEdit(row: EulbPostSubmissionUpdateRow): void {
    if (!this.canEditRows()) return;
    const basePayload = this.changedRows().get(row._id) ?? rowToValidatePayload(row);

    this.resetEditFormSubscriptions();
    this.editingRowId.set(row._id);
    this.editForm = createEditForm(basePayload);
    this.editForm.valueChanges
      .pipe(takeUntil(this.editFormTeardown$), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateChangedRowFromEdit(row._id));
    this.bindEnabledWhenToEditForm(this.editForm);
  }

  finishEdit(rowId: string): void {
    if (this.editingRowId() !== rowId) return;
    this.resetEditFormSubscriptions();
    this.editingRowId.set(null);
  }

  resetRow(rowId: string): void {
    const loadedRow = this.loadedRowsById.get(rowId);
    if (!loadedRow) return;

    const changedRows = new Map(this.changedRows());
    changedRows.delete(rowId);
    this.changedRows.set(changedRows);
    this.validationRowsById.delete(rowId);

    if (this.editingRowId() === rowId) {
      this.resetEditFormSubscriptions();
      this.editingRowId.set(null);
    }

    this.rows.update((rows) => rows.map((row) => (row._id === rowId ? loadedRow : row)));
    this.markValidationStaleAfterLocalChange();
  }

  onDocumentSelected(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    const file = input.files?.item(0);
    input.value = '';
    if (!file) return;

    if (!this.isPdfFile(file)) {
      this.documentErrorMessage.set('Only PDF files are accepted.');
      this.utilityService.triggerSnackbar('Only PDF files are accepted.', 'snackbar-danger');
      return;
    }

    this.uploadDocument(file);
  }

  removeDocument(): void {
    this.uploadRequestId++;
    this.updateDocument.set(null);
    this.documentErrorMessage.set(null);
    this.isUploadingDocument.set(false);
    this.uploadProgress.set(0);
  }

  submitUpdate(): void {
    if (this.isSubmitting()) return;

    if (!this.hasSubmitPermission()) return;

    const changedRows = [...this.changedRows().values()];
    if (!changedRows.length) {
      this.utilityService.triggerSnackbar('No changed rows to submit.', 'snackbar-warn');
      return;
    }

    const document = this.updateDocument();
    if (!document) {
      this.documentErrorMessage.set('Please upload the combined PDF before submitting.');
      this.utilityService.triggerSnackbar('Please upload the combined PDF before submitting.', 'snackbar-warn');
      return;
    }

    if (this.validationState() !== 'VALID') {
      this.utilityService.triggerSnackbar('Please validate changes before submitting.', 'snackbar-warn');
      return;
    }

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) {
      this.utilityService.triggerSnackbar(
        'Unable to submit changes. State or year information is missing.',
        'snackbar-danger',
      );
      return;
    }

    const requestId = ++this.submitRequestId;
    this.isSubmitting.set(true);
    this.documentErrorMessage.set(null);

    this.service
      .submitPostSubmissionUpdate(stateId, yearId, { rows: changedRows, document })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (requestId !== this.submitRequestId) return;
          this.isSubmitting.set(false);
          this.clearPostSubmitState();
          this.utilityService.triggerSnackbar(
            response.message ?? 'Elected Urban Local Bodies update submitted successfully.',
            'snackbar-success',
          );
          this.loadMetadata();
        },
        error: (error: unknown) => {
          if (requestId !== this.submitRequestId) return;
          this.isSubmitting.set(false);
          this.handleSubmitError(error);
        },
      });
  }

  validateChanges(): void {
    const changedRows = [...this.changedRows().values()];
    if (!changedRows.length) {
      this.utilityService.triggerSnackbar('No changed rows to validate.', 'snackbar-warn');
      return;
    }

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) {
      this.utilityService.triggerSnackbar(
        'Unable to validate changes. State or year information is missing.',
        'snackbar-danger',
      );
      return;
    }

    const requestId = ++this.validateRequestId;
    this.isValidating.set(true);

    this.service
      .validatePostSubmissionUpdateRows(stateId, yearId, { rows: changedRows })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (requestId !== this.validateRequestId) return;
          this.applyValidationData(response.data);
          this.isValidating.set(false);

          if (response.data.validationStatus === 'INVALID' || response.data.errorRowCount > 0) {
            this.validationState.set('INVALID');
            this.utilityService.triggerSnackbar(
              response.message ?? 'Validation complete. Some changed rows have errors.',
              'snackbar-danger',
            );
            return;
          }

          this.validationState.set('VALID');
          this.utilityService.triggerSnackbar(response.message ?? 'All changed rows are valid.', 'snackbar-success');
        },
        error: () => {
          if (requestId !== this.validateRequestId) return;
          this.isValidating.set(false);
          this.utilityService.triggerSnackbar('Failed to validate changed rows.', 'snackbar-danger');
        },
      });
  }

  getValidationStatusBadgeClass(status: EulbRowValidationStatus): string {
    return status === 'VALID' ? 'text-bg-success' : 'text-bg-danger';
  }

  getValidationStatusLabel(status: EulbRowValidationStatus): string {
    return status === 'VALID' ? 'Valid' : 'Invalid';
  }

  isFieldEditable(field: EulbPostUpdateEditableFieldKey): boolean {
    return this.editableFieldKeys().has(field);
  }

  isRowModified(rowId: string): boolean {
    return this.changedRows().has(rowId);
  }

  getEditDateMin(fieldKey: string): string | null {
    const field = this.getRowEditFieldConfig(fieldKey);
    if (!field) return null;
    if (field.minDate != null) return this.toHtmlDate(field.minDate);
    const val = field.validations?.find((v) => v.name === 'minDate')?.validator;
    return val != null ? this.toHtmlDate(val) : null;
  }

  getEditDateMax(fieldKey: string): string | null {
    const field = this.getRowEditFieldConfig(fieldKey);
    if (!field) return null;
    if (field.maxDate != null) return this.toHtmlDate(field.maxDate);
    const val = field.validations?.find((v) => v.name === 'maxDate')?.validator;
    return val != null ? this.toHtmlDate(val) : null;
  }

  isEditFieldEnabled(field: string): boolean {
    return !this.editForm.get(field)?.disabled;
  }

  getEditFieldDisabledReason(field: string): string {
    return this.getRowEditFieldConfig(field)?.disabledReason ?? '';
  }

  getUpdateValidationStateBadgeClass(): string {
    const s = this.validationState();
    if (s === 'VALID') return 'text-bg-success';
    if (s === 'INVALID') return 'text-bg-danger';
    if (s === 'STALE') return 'text-bg-warning';
    return 'text-bg-secondary';
  }

  getUpdateValidationStateLabel(): string {
    const s = this.validationState();
    if (s === 'VALID') return 'Valid';
    if (s === 'INVALID') return 'Invalid';
    if (s === 'STALE') return 'Stale — re-validate needed';
    return 'Not validated';
  }

  startEditAtField(row: EulbPostSubmissionUpdateRow, field: string): void {
    if (!this.canEditRows()) return;
    if (this.editingRowId() !== null) return;
    const hasError = row.errors?.some((err) => err.field === field) ?? false;
    if (!hasError) return;
    this.startEdit(row);
    setTimeout(() => {
      const el = this.elementRef.nativeElement.querySelector(`[data-eulb-post-edit-field="${field}"]`);
      if (el instanceof HTMLElement) el.focus();
    }, 50);
  }

  getSubmitDisabledReason(): string {
    if (this.changedRowCount() === 0) return 'No changed rows to submit.';
    if (!this.updateDocument()) return 'Upload the combined PDF first.';
    if (this.validationState() !== 'VALID') return 'Validate changes before submitting.';
    return '';
  }

  private updateChangedRowFromEdit(rowId: string): void {
    const loadedRow = this.loadedRowsById.get(rowId);
    if (!loadedRow) return;

    const payload = this.buildPayloadFromEditForm(loadedRow);
    const changedRows = new Map(this.changedRows());

    if (payloadMatchesRow(payload, loadedRow)) {
      changedRows.delete(rowId);
    } else {
      changedRows.set(rowId, payload);
    }

    this.changedRows.set(changedRows);
    this.validationRowsById.delete(rowId);
    this.rows.update((rows) => rows.map((row) => (row._id === rowId ? this.overlayRowWithLocalState(loadedRow) : row)));
    this.markValidationStaleAfterLocalChange();
  }

  private buildPayloadFromEditForm(loadedRow: EulbPostSubmissionUpdateRow): EulbPostSubmissionUpdateValidateRowPayload {
    const raw = this.editForm.getRawValue();
    const status = isEulbBodyStatus(raw.electedBodyStatus) ? raw.electedBodyStatus : loadedRow.electedBodyStatus;

    return {
      rowId: loadedRow._id,
      electedBodyStatus: status,
      dateOfConstitution: toDatePayloadValue(raw.dateOfConstitution),
      dateOfExpiry: toDatePayloadValue(raw.dateOfExpiry),
      remarks: raw.remarks,
    };
  }

  private uploadDocument(file: File): void {
    const requestId = ++this.uploadRequestId;
    this.documentErrorMessage.set(null);
    this.isUploadingDocument.set(true);
    this.uploadProgress.set(0);

    this.fileService
      .newGetURLForFileUpload(file.name, file.type, this.documentUploadFolder())
      .pipe(
        map((response) => this.resolveUploadTarget(response)),
        switchMap((target) =>
          this.fileService.newUploadFileToS3(file, target.uploadUrl).pipe(
            tap((event: HttpEvent<unknown>) => this.handleUploadEvent(event)),
            filter((event: HttpEvent<unknown>) => event.type === HttpEventType.Response),
            map(() => this.createDocumentValue(file, target.storagePath)),
          ),
        ),
        finalize(() => {
          if (requestId !== this.uploadRequestId) return;
          this.isUploadingDocument.set(false);
          this.uploadProgress.set(0);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (document) => {
          if (requestId !== this.uploadRequestId) return;
          this.updateDocument.set(document);
          this.utilityService.triggerSnackbar('File attached successfully!', 'snackbar-success');
        },
        error: () => {
          if (requestId !== this.uploadRequestId) return;
          this.documentErrorMessage.set('Failed to upload file.');
          this.utilityService.triggerSnackbar('Failed to upload file!', 'snackbar-danger');
        },
      });
  }

  private resolveUploadTarget(response: S3FileURLResponse): UploadTarget {
    const uploadTarget = response.data?.[0];
    const uploadUrl = this.utilityService.getNonEmptyString(uploadTarget?.url);
    const storagePath = this.utilityService.getNonEmptyString(uploadTarget?.path);

    if (!uploadUrl || !storagePath) {
      throw new Error('Upload URL response is missing upload url or storage path.');
    }

    return { uploadUrl, storagePath };
  }

  private createDocumentValue(file: File, storagePath: string): EulbPostSubmissionUpdateDocument {
    return {
      fileName: file.name,
      fileUrl: storagePath,
      fileSize: file.size,
      ...(file.type ? { mimeType: file.type } : {}),
      s3Key: storagePath,
    };
  }

  private handleUploadEvent(event: HttpEvent<unknown>): void {
    if (event.type !== HttpEventType.UploadProgress) return;
    const total = event.total;

    if (typeof total === 'number' && total > 0) {
      this.uploadProgress.set(Math.min(100, Math.round((event.loaded / total) * 100)));
      return;
    }

    if (event.loaded > 0 && this.uploadProgress() === 0) {
      this.uploadProgress.set(1);
    }
  }

  private isPdfFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  private documentUploadFolder(): string {
    return `state/eulb-post-submission-update/${this.stateId}/${this.yearId}`;
  }

  private hasSubmitPermission(): boolean {
    const meta = this.metadata();
    return !!meta && meta.canUpdate === true && meta.permissions.canSubmitUpdate === true;
  }

  private applyValidationData(data: EulbPostSubmissionUpdateValidateData): void {
    const changedRowIds = new Set(this.changedRows().keys());

    for (const rowId of changedRowIds) {
      this.validationRowsById.delete(rowId);
    }

    for (const row of data.rows) {
      this.validationRowsById.set(row.rowId, row);
    }

    this.rows.update((rows) =>
      rows.map((row) =>
        changedRowIds.has(row._id) || this.validationRowsById.has(row._id)
          ? this.overlayRowWithLocalState(this.loadedRowsById.get(row._id) ?? row)
          : row,
      ),
    );
  }

  private handleSubmitError(error: unknown): void {
    const rowErrors = this.extractSubmitRowErrors(error);
    if (rowErrors.length) {
      this.applySubmitRowErrors(rowErrors);
    }

    const documentMessage = this.extractDocumentErrorMessage(error);
    if (documentMessage) {
      this.documentErrorMessage.set(documentMessage);
    }

    const message = this.extractErrorMessage(error) ?? documentMessage ?? 'Failed to submit update.';
    this.utilityService.triggerSnackbar(message, 'snackbar-danger');
  }

  private applySubmitRowErrors(rowErrors: readonly EulbPostSubmissionUpdateSubmitRowError[]): void {
    for (const rowError of rowErrors) {
      const baseRow = this.loadedRowsById.get(rowError.rowId) ?? this.rows().find((row) => row._id === rowError.rowId);
      if (!baseRow) continue;

      this.validationRowsById.set(rowError.rowId, {
        rowId: rowError.rowId,
        rowNumber: rowError.rowNumber,
        censusCode: rowError.censusCode,
        ulbName: rowError.ulbName,
        electedBodyStatus: baseRow.electedBodyStatus,
        dateOfConstitution: baseRow.dateOfConstitution,
        dateOfExpiry: baseRow.dateOfExpiry,
        remarks: baseRow.remarks ?? '',
        validationStatus: 'INVALID',
        errors: rowError.errors,
      });
    }

    this.validationState.set('INVALID');
    this.rows.update((rows) =>
      rows.map((row) => (this.validationRowsById.has(row._id) ? this.overlayRowWithLocalState(row) : row)),
    );
  }

  private extractSubmitRowErrors(error: unknown): EulbPostSubmissionUpdateSubmitRowError[] {
    const body = this.extractErrorBody(error);
    if (!body) return [];

    const data = body['data'];
    if (!isRecord(data)) return [];

    const rowErrors = data['rowErrors'];
    if (!Array.isArray(rowErrors)) return [];

    const parsed: EulbPostSubmissionUpdateSubmitRowError[] = [];
    for (const rowError of rowErrors) {
      if (!isRecord(rowError)) continue;

      const rowId = rowError['rowId'];
      const rowNumber = rowError['rowNumber'];
      const censusCode = rowError['censusCode'];
      const ulbName = rowError['ulbName'];
      const errors = rowError['errors'];

      if (
        typeof rowId !== 'string' ||
        typeof rowNumber !== 'number' ||
        typeof censusCode !== 'string' ||
        typeof ulbName !== 'string' ||
        !Array.isArray(errors)
      ) {
        continue;
      }

      parsed.push({
        rowId,
        rowNumber,
        censusCode,
        ulbName,
        errors: errors.flatMap((fieldError: unknown) => this.parsePostUpdateRowError(fieldError)),
      });
    }

    return parsed;
  }

  private parsePostUpdateRowError(error: unknown): EulbPostSubmissionUpdateSubmitRowError['errors'] {
    if (!isRecord(error)) return [];
    const message = error['message'];
    if (typeof message !== 'string') return [];

    return [
      {
        field: typeof error['field'] === 'string' ? error['field'] : undefined,
        code: typeof error['code'] === 'string' ? error['code'] : undefined,
        message,
        value: error['value'],
      },
    ];
  }

  private extractDocumentErrorMessage(error: unknown): string | null {
    const body = this.extractErrorBody(error);
    const errors = body?.['errors'];
    if (!isRecord(errors)) return null;

    const documentErrors = errors['document'];
    if (!Array.isArray(documentErrors)) return null;

    for (const documentError of documentErrors) {
      if (isRecord(documentError) && typeof documentError['message'] === 'string') {
        return documentError['message'];
      }
    }

    return null;
  }

  private extractErrorMessage(error: unknown): string | null {
    const body = this.extractErrorBody(error);
    const message = body?.['message'];
    return typeof message === 'string' ? message : null;
  }

  private extractErrorBody(error: unknown): Record<string, unknown> | null {
    if (!isRecord(error)) return null;
    const nested = error['error'];
    if (isRecord(nested)) return nested;
    return error;
  }

  private clearPostSubmitState(): void {
    this.changedRows.set(new Map());
    this.validationRowsById.clear();
    this.updateDocument.set(null);
    this.documentErrorMessage.set(null);
    this.validationState.set('NOT_VALIDATED');
    this.editingRowId.set(null);
  }

  private overlayRowWithLocalState(row: EulbPostSubmissionUpdateRow): EulbPostSubmissionUpdateRow {
    const changedPayload = this.changedRows().get(row._id);
    const validatedRow = this.validationRowsById.get(row._id);

    return {
      ...row,
      electedBodyStatus: changedPayload?.electedBodyStatus ?? validatedRow?.electedBodyStatus ?? row.electedBodyStatus,
      dateOfConstitution:
        changedPayload?.dateOfConstitution ?? validatedRow?.dateOfConstitution ?? row.dateOfConstitution,
      dateOfExpiry: changedPayload?.dateOfExpiry ?? validatedRow?.dateOfExpiry ?? row.dateOfExpiry,
      remarks: changedPayload?.remarks ?? validatedRow?.remarks ?? row.remarks,
      validationStatus: validatedRow?.validationStatus ?? row.validationStatus,
      errors: validatedRow?.errors ?? row.errors,
    };
  }

  private storeLoadedRows(rows: readonly EulbPostSubmissionUpdateRow[]): void {
    for (const row of rows) {
      this.loadedRowsById.set(row._id, row);
    }
  }

  private resetEditFormSubscriptions(): void {
    this.editFormTeardown$.next();
  }

  private markValidationStaleAfterLocalChange(): void {
    if (this.changedRows().size === 0) {
      this.validationState.set('NOT_VALIDATED');
      return;
    }

    if (this.validationState() === 'VALID' || this.validationState() === 'INVALID') {
      this.validationState.set('STALE');
    }
  }

  private getRowEditFieldConfig(fieldKey: string): ConditionalFieldConfig | undefined {
    return this.pageRowEditFields().find((f) => f.key === fieldKey);
  }

  private toHtmlDate(value: unknown): string | null {
    if (value === null || value === undefined || value === '') return null;
    try {
      const resolved = resolveDateConstraint(value);
      if (!resolved || isNaN(resolved.getTime())) return null;
      const y = resolved.getFullYear();
      const m = String(resolved.getMonth() + 1).padStart(2, '0');
      const d = String(resolved.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch {
      return null;
    }
  }

  private bindEnabledWhenToEditForm(form: FormGroup): void {
    const deps = new Map<string, ConditionalFieldConfig[]>();
    for (const field of this.pageRowEditFields()) {
      if (!field.enabledWhen?.conditions?.length || !field.key) continue;
      for (const condition of field.enabledWhen.conditions) {
        const list = deps.get(condition.key) ?? [];
        if (!list.some((f) => f.key === field.key)) list.push(field);
        deps.set(condition.key, list);
      }
    }
    if (!deps.size) return;

    this.applyEnabledWhen(form, deps);

    for (const controllerKey of deps.keys()) {
      const ctrl = form.get(controllerKey);
      if (!ctrl) continue;
      ctrl.valueChanges.pipe(takeUntil(this.editFormTeardown$), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.applyEnabledWhen(form, deps);
      });
    }
  }

  private applyEnabledWhen(form: FormGroup, deps: Map<string, ConditionalFieldConfig[]>): void {
    const allDependents = [...new Set([...deps.values()].flat())];

    for (const field of allDependents) {
      if (!field.key) continue;
      const control = form.get(field.key);
      if (!control) continue;

      const shouldEnable = this.visibilityService.evaluateConditions(field.enabledWhen, (key) => form.get(key)?.value);

      if (shouldEnable) {
        if (this.canEditRows()) {
          control.enable({ emitEvent: false });
        }
        const validators = this.dynamicService.bindValidations(field.validations, field);
        control.setValidators(validators);
        control.updateValueAndValidity({ emitEvent: false });
      } else {
        if (field.clearValueWhenDisabled) {
          control.setValue('', { emitEvent: false });
        }
        control.clearValidators();
        control.setErrors(null);
        control.markAsUntouched();
        control.markAsPristine();
        control.disable({ emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
      }
    }

    this.cdr.markForCheck();
  }

  private setupFilterSubscription(): void {
    const { search, electedBodyStatus, validationStatus } = this.filterForm.controls;

    merge(
      search.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      electedBodyStatus.valueChanges,
      validationStatus.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.canView()) return;
        this.page.set(1);
        this.loadRows();
      });
  }
}
