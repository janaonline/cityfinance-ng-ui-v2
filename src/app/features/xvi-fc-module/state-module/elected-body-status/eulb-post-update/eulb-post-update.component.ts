import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, merge, takeUntil } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../../shared/components/pre-loader/pre-loader.component';
import { resolveDateConstraint } from '../../../../../shared/dynamic-form/date-constraint-resolver';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import { UploadedFileValue } from '../../../../../shared/dynamic-form/field.interface';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { POST_SUBMISSION_UPDATE_STATUS } from '../elected-body-status.component';
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
import { FormStatusValue } from '../../../shared/form-progress/form-progress.component';

type EulbPostUpdateEditableFieldKey = 'electedBodyStatus' | 'dateOfConstitution' | 'dateOfExpiry' | 'remarks';
type UpdateValidationState = 'NOT_VALIDATED' | 'VALID' | 'INVALID' | 'STALE';

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

/**
 * Creates a reactive FormGroup for editing a single row's editable fields.
 * @param payload - Current field values, typically from `changedRows` or `rowToValidatePayload`.
 * @returns A strongly-typed FormGroup with non-nullable controls for each editable column.
 */
function createEditForm(payload: EulbPostSubmissionUpdateValidateRowPayload): EulbPostUpdateEditForm {
  const editableStatus = payload.electedBodyStatus === 'Exempt' ? '' : payload.electedBodyStatus;

  return new FormGroup({
    electedBodyStatus: new FormControl<EulbBodyStatus | ''>(editableStatus, { nonNullable: true }),
    dateOfConstitution: new FormControl(payload.dateOfConstitution ?? '', { nonNullable: true }),
    dateOfExpiry: new FormControl(payload.dateOfExpiry ?? '', { nonNullable: true }),
    remarks: new FormControl(payload.remarks, { nonNullable: true }),
  });
}

/** Type guard: returns true when `value` is a valid `EulbRowValidationStatus`. */
function isPostUpdateValidationStatus(value: unknown): value is EulbRowValidationStatus {
  return value === 'VALID' || value === 'INVALID';
}

/** Type guard: returns true when `value` is a valid `EulbBodyStatus` union member. */
function isEulbBodyStatus(value: unknown): value is EulbBodyStatus {
  return value === 'Constituted' || value === 'Not Constituted' || value === 'Exempt';
}

/** Type guard: returns true when `value` is one of the two user-selectable elected body statuses (excludes 'Exempt'). */
function isPostUpdateElectedBodyStatus(value: unknown): value is EulbPostSubmissionUpdateElectedBodyStatus {
  return value === 'Constituted' || value === 'Not Constituted';
}

/** Type guard: returns true when `value` is a recognized editable column key. */
function isEditableFieldKey(value: unknown): value is EulbPostUpdateEditableFieldKey {
  return (
    value === 'electedBodyStatus' || value === 'dateOfConstitution' || value === 'dateOfExpiry' || value === 'remarks'
  );
}

/**
 * Converts a form date string to the API payload representation.
 * @param value - HTML date-input string (e.g. "2024-06-15") or empty string.
 * @returns Trimmed date string, or null if the input was blank.
 */
function toDatePayloadValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * Converts an API date string to the `<input type="date">` format (YYYY-MM-DD, max 10 chars).
 * @param value - ISO date string from the API, or null.
 * @returns The first 10 characters of the date string, or an empty string for null/empty input.
 */
function toDateInputValue(value: string | null): string {
  if (!value) return '';
  return value.length >= 10 ? value.slice(0, 10) : value;
}

/**
 * Maps a server-returned row to the payload shape used by validate and changed-rows tracking.
 * @param row - The row as returned by the API.
 * @returns A `EulbPostSubmissionUpdateValidateRowPayload` representing the row's current server state.
 */
function rowToValidatePayload(row: EulbPostSubmissionUpdateRow): EulbPostSubmissionUpdateValidateRowPayload {
  return {
    rowId: row._id,
    electedBodyStatus: row.electedBodyStatus,
    dateOfConstitution: toDateInputValue(row.dateOfConstitution) || null,
    dateOfExpiry: toDateInputValue(row.dateOfExpiry) || null,
    remarks: row.remarks ?? '',
  };
}

/**
 * Returns true when all editable fields of `payload` match the server-side row data.
 * Used to decide whether to track the row as changed or revert it to the unchanged set.
 * @param payload - The locally-edited payload to compare.
 * @param row - The original server row to compare against.
 */
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

/**
 * Derives per-row display state: whether the row is locally modified and which cells have errors.
 * @param row - The row data (may already carry server-assigned validation errors).
 * @param changedRows - The current map of locally-changed row payloads.
 * @returns A view model with `isModified`, `cellHasError`, and `cellErrorText` flags.
 */
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

/**
 * Returns true when a dropdown option represents the 'Exempt' status.
 * Handles both primitive string values and record objects with common label/value keys.
 * @param option - An option value from a field's `options` array.
 */
function shouldFilterExemptOption(option: unknown): boolean {
  if (option === 'Exempt') return true;
  if (!isRecord(option)) return false;

  const possibleValues = [option['id'], option['value'], option['label'], option['name']];
  return possibleValues.some((value) => value === 'Exempt');
}

/**
 * Removes 'Exempt' entries from a field's options list.
 * The post-update flow only allows Constituted / Not Constituted — users cannot set Exempt.
 * @param options - The original options array from the field config, or undefined.
 * @returns A new array with Exempt entries removed, or undefined if the input was undefined.
 */
function filterExemptOptions(options: readonly unknown[] | undefined): unknown[] | undefined {
  if (!options) return undefined;
  return options.filter((option) => !shouldFilterExemptOption(option));
}

/**
 * Selects only the editable column configs from the server-supplied row-edit fields,
 * and strips the 'Exempt' option from the electedBodyStatus field.
 * @param fields - Full set of conditional field configs from `metadata.rowEditFields`.
 * @returns Only configs whose `key` is an `EulbPostUpdateEditableFieldKey`, with options filtered.
 */
function filterPostUpdateRowEditFields(fields: readonly ConditionalFieldConfig[]): ConditionalFieldConfig[] {
  return fields
    .filter((field) => isEditableFieldKey(field.key))
    .map((field) =>
      field.key === 'electedBodyStatus' ? { ...field, options: filterExemptOptions(field.options) } : { ...field },
    );
}

const PROOF_OF_ELECTION_FIELD: ConditionalFieldConfig = {
  formFieldType: 'file',
  label: 'Proof of Election',
  key: 'proofOfElection',
  allowedFileTypes: ['pdf'],
  maxFileSize: 20,
  folderPath: 'state/2026-27/elected-body/post-update',
  value: { fileName: '', fileUrl: '', fileSize: null, mimeType: '' },
  validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
  appearance: { color: 'success', variant: 'soft' },
};

@Component({
  selector: 'app-eulb-post-update',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTooltipModule,
    DatePipe,
    MatButton,
    PreLoaderComponent,
    DynamicFormComponent,
  ],
  templateUrl: './eulb-post-update.component.html',
  styleUrl: './eulb-post-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EulbPostUpdateComponent implements OnInit {
  private readonly service = inject(EulbStatusService);
  private readonly utilityService = inject(UtilityService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly router = inject(Router);
  protected readonly activatedRoute = inject(ActivatedRoute);

  readonly isLoadingMeta = signal(false);
  readonly isLoadingRows = signal(false);
  readonly isValidating = signal(false);
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
  readonly allowedStatus = signal(POST_SUBMISSION_UPDATE_STATUS);

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

  readonly isFormViewAllowed = computed(() => {
    const metadata = this.metadata();
    if (metadata === null) return false;

    const formStatus = metadata.formStatus as FormStatusValue;
    return formStatus ? !this.allowedStatus().includes(formStatus) : false;
  });

  readonly electedBodyStatusOptions = ELECTED_BODY_STATUS_FILTER_OPTIONS;
  readonly validationStatusOptions = VALIDATION_STATUS_OPTIONS;

  readonly proofOfElectionField = PROOF_OF_ELECTION_FIELD;
  readonly proofOfElectionForm = new FormGroup({});

  private redirectTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Sets up a redirect effect: if `isFormViewAllowed` becomes true (form not in an updatable
   * status), navigates back to the elected-body form after a short grace period so the user
   * can read any status message before being redirected.
   */
  constructor() {
    effect(() => {
      if (this.isFormViewAllowed()) {
        clearTimeout(this.redirectTimeout ?? undefined);
        this.redirectTimeout = setTimeout(() => this.goToElectedBodyForm(), 2500);
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.redirectTimeout !== null) clearTimeout(this.redirectTimeout);
    });
  }

  private readonly loadedRowsById = new Map<string, EulbPostSubmissionUpdateRow>();
  private readonly validationRowsById = new Map<string, EulbPostSubmissionUpdateValidateRow>();
  private readonly editFormTeardown$ = new Subject<void>();
  private loadRequestId = 0;
  private validateRequestId = 0;
  private submitRequestId = 0;

  /**
   * Reads the logged-in user's state ID from localStorage.
   * Returns an empty string on parse errors or when running without localStorage (SSR).
   */
  private get stateId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  /** Returns the currently selected year ID from the module service. */
  private get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  /** Loads metadata, starts filter reactivity, and wires the proof-of-election form control. */
  ngOnInit(): void {
    this.loadMetadata();
    this.setupFilterSubscription();
    this.initProofOfElectionForm();
  }

  /**
   * Creates and registers the proof-of-election file control with `DynamicFormComponent`.
   * Subscribes to value changes to keep the `updateDocument` signal in sync,
   * which `canSubmitUpdate` and `submitUpdate` depend on.
   */
  private initProofOfElectionForm(): void {
    const control = this.dynamicService.createContorl(this.proofOfElectionField, false, false);
    this.proofOfElectionForm.addControl('proofOfElection', control);

    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((raw: unknown) => {
      const value = raw as UploadedFileValue;
      if (value?.fileName && value.fileUrl) {
        this.updateDocument.set({
          fileName: value.fileName,
          fileUrl: value.fileUrl,
          fileSize: typeof value.fileSize === 'number' ? value.fileSize : 0,
          mimeType: value.mimeType,
        });
      } else {
        this.updateDocument.set(null);
      }
    });
  }

  /**
   * Fetches post-submission update metadata for the current state and year.
   * On success, auto-loads rows when the user has view permission.
   * On missing IDs, shows a snackbar and sets an inline error message.
   */
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

  /**
   * Fetches a paginated, filtered page of eligible ULB rows from the API.
   * Guards against stale responses with a request-ID counter so only the latest call writes state.
   * Merges server data with any locally-changed and validated rows before updating the signal.
   */
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

  /**
   * Navigates to the requested page and reloads rows; no-ops when the page is out of bounds.
   * @param page - 1-based page number.
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadRows();
  }

  /**
   * Opens the inline edit form for the given row.
   * Pre-fills from `changedRows` if the row has already been locally modified.
   * @param row - The row to begin editing.
   */
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

  /**
   * Closes the inline edit form for `rowId`.
   * No-ops when a different row is currently being edited.
   * @param rowId - The `_id` of the row to stop editing.
   */
  finishEdit(rowId: string): void {
    if (this.editingRowId() !== rowId) return;
    this.resetEditFormSubscriptions();
    this.editingRowId.set(null);
  }

  /**
   * Discards any local changes for the row and reverts it to the last server-loaded state.
   * Also closes the edit form if this row was being edited.
   * @param rowId - The `_id` of the row to reset.
   */
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

  /**
   * Submits all locally-changed rows along with the uploaded proof-of-election document.
   * Guards against duplicate in-flight requests using a request-ID counter.
   * On success, clears local state and reloads metadata.
   * On error, applies any per-row errors returned by the API and shows the document error inline.
   */
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

  /**
   * Sends all locally-changed rows to the validation endpoint and applies the results back to the table.
   * Sets `validationState` to VALID or INVALID based on the API response,
   * which gates the Submit button via `canSubmitUpdate`.
   */
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

  /**
   * Returns the Bootstrap badge CSS class for a row's validation status.
   * @param status - The validation status of the row.
   */
  getValidationStatusBadgeClass(status: EulbRowValidationStatus): string {
    return status === 'VALID' ? 'text-bg-success' : 'text-bg-danger';
  }

  /**
   * Returns the human-readable label for a row's validation status.
   * @param status - The validation status of the row.
   */
  getValidationStatusLabel(status: EulbRowValidationStatus): string {
    return status === 'VALID' ? 'Valid' : 'Invalid';
  }

  /**
   * Returns true when the given field key is included in the server-supplied editable field configs.
   * @param field - Column key to check.
   */
  isFieldEditable(field: EulbPostUpdateEditableFieldKey): boolean {
    return this.editableFieldKeys().has(field);
  }

  /**
   * Returns true when the row has been locally edited but not yet submitted.
   * @param rowId - The `_id` of the row to check.
   */
  isRowModified(rowId: string): boolean {
    return this.changedRows().has(rowId);
  }

  /**
   * Resolves the minimum allowed date for an edit-form date field, in HTML `YYYY-MM-DD` format.
   * Checks `field.minDate` first, then falls back to a `minDate` validation entry.
   * @param fieldKey - The key of the date field to look up.
   * @returns A `YYYY-MM-DD` string, or null if no minimum is configured.
   */
  getEditDateMin(fieldKey: string): string | null {
    const field = this.getRowEditFieldConfig(fieldKey);
    if (!field) return null;
    if (field.minDate != null) return this.toHtmlDate(field.minDate);
    const val = field.validations?.find((v) => v.name === 'minDate')?.validator;
    return val != null ? this.toHtmlDate(val) : null;
  }

  /**
   * Resolves the maximum allowed date for an edit-form date field, in HTML `YYYY-MM-DD` format.
   * Checks `field.maxDate` first, then falls back to a `maxDate` validation entry.
   * @param fieldKey - The key of the date field to look up.
   * @returns A `YYYY-MM-DD` string, or null if no maximum is configured.
   */
  getEditDateMax(fieldKey: string): string | null {
    const field = this.getRowEditFieldConfig(fieldKey);
    if (!field) return null;
    if (field.maxDate != null) return this.toHtmlDate(field.maxDate);
    const val = field.validations?.find((v) => v.name === 'maxDate')?.validator;
    return val != null ? this.toHtmlDate(val) : null;
  }

  /**
   * Returns true when the edit form's control for `field` is currently enabled.
   * Fields may be disabled by `enabledWhen` conditions evaluated in `bindEnabledWhenToEditForm`.
   * @param field - The form control key to check.
   */
  isEditFieldEnabled(field: string): boolean {
    return !this.editForm.get(field)?.disabled;
  }

  /**
   * Returns the user-facing reason string shown as a tooltip when an edit field is disabled.
   * @param field - The form control key whose disabled reason to retrieve.
   */
  getEditFieldDisabledReason(field: string): string {
    return this.getRowEditFieldConfig(field)?.disabledReason ?? '';
  }

  /**
   * Returns the Bootstrap badge CSS class corresponding to the current overall validation state.
   * VALID → success, INVALID → danger, STALE → warning, NOT_VALIDATED → secondary.
   */
  getUpdateValidationStateBadgeClass(): string {
    const s = this.validationState();
    if (s === 'VALID') return 'text-bg-success';
    if (s === 'INVALID') return 'text-bg-danger';
    if (s === 'STALE') return 'text-bg-warning';
    return 'text-bg-secondary';
  }

  /**
   * Returns the human-readable label for the current overall validation state shown in the summary bar.
   */
  getUpdateValidationStateLabel(): string {
    const s = this.validationState();
    if (s === 'VALID') return 'Valid';
    if (s === 'INVALID') return 'Invalid';
    if (s === 'STALE') return 'Stale — re-validate needed';
    return 'Not validated';
  }

  /**
   * Opens the inline edit form for a row and focuses the given field — but only when
   * that field currently has a validation error. Used to let users click an error cell
   * and jump straight into editing.
   * @param row - The row containing the errored field.
   * @param field - The field key to focus after the form renders.
   */
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

  /**
   * Returns a human-readable explanation of why the Submit button is disabled.
   * Returns an empty string when submission is allowed.
   */
  getSubmitDisabledReason(): string {
    if (this.changedRowCount() === 0) return 'No changed rows to submit.';
    if (!this.updateDocument()) return 'Upload the combined PDF first.';
    if (this.validationState() !== 'VALID') return 'Validate changes before submitting.';
    return '';
  }

  /**
   * Called on every edit-form value change to keep `changedRows` and the rows signal in sync.
   * If the edited values match the original server data the row is removed from `changedRows`
   * (so unchanged rows are not sent to the API).
   * @param rowId - The `_id` of the row currently being edited.
   */
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

  /**
   * Reads the raw edit-form values and maps them to the validate/submit payload shape.
   * Falls back to the loaded row's status when the form value is not a valid `EulbBodyStatus`.
   * @param loadedRow - The original server-loaded row, used for the `rowId` and fallback status.
   * @returns A `EulbPostSubmissionUpdateValidateRowPayload` ready to send to the API.
   */
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

  /**
   * Returns true when the current metadata confirms both `canUpdate` and `canSubmitUpdate` permissions.
   * Extracted to avoid repeating the same null-check across `submitUpdate` and `canSubmitUpdate`.
   */
  private hasSubmitPermission(): boolean {
    const meta = this.metadata();
    return !!meta && meta.canUpdate === true && meta.permissions.canSubmitUpdate === true;
  }

  /**
   * Merges server-returned validation results into local state and refreshes the visible rows.
   * Clears stale validation entries for changed rows before writing the fresh results.
   * @param data - The validation response payload containing per-row results and a summary status.
   */
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

  /**
   * Processes an API submit error: extracts per-row field errors, an optional document error,
   * and a top-level message, then surfaces each through the appropriate UI channel.
   * @param error - The raw HTTP error object from the Angular HTTP client.
   */
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

  /**
   * Writes per-row field errors returned by the submit API into `validationRowsById`
   * and sets `validationState` to INVALID so the user must re-validate before retrying.
   * @param rowErrors - Field-level errors per row as returned by the submit endpoint.
   */
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

  /**
   * Safely parses `error.data.rowErrors` from an HTTP error response body.
   * Returns an empty array when the shape doesn't match, rather than throwing.
   * @param error - The raw HTTP error object.
   * @returns An array of parsed row errors, or an empty array on any shape mismatch.
   */
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

  /**
   * Parses a single field-error object from the submit response into a typed error entry.
   * Returns an empty array when the object doesn't have a `message` string.
   * @param error - An item from the `errors` array inside a rowError object.
   */
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

  /**
   * Extracts the first document-level error message from the API error body,
   * displayed below the proof-of-election upload field.
   * @param error - The raw HTTP error object.
   * @returns The first document error message string, or null if none is present.
   */
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

  /**
   * Extracts the top-level `message` string from an API error body for the snackbar.
   * @param error - The raw HTTP error object.
   * @returns The error message string, or null if not present.
   */
  private extractErrorMessage(error: unknown): string | null {
    const body = this.extractErrorBody(error);
    const message = body?.['message'];
    return typeof message === 'string' ? message : null;
  }

  /**
   * Unwraps the HTTP error's nested `.error` property when present, otherwise returns the error as-is.
   * Angular's HTTP client nests the parsed JSON body under `error.error` for non-2xx responses.
   * @param error - The raw HTTP error object.
   * @returns The parsed API response body as a record, or null for non-object errors.
   */
  private extractErrorBody(error: unknown): Record<string, unknown> | null {
    if (!isRecord(error)) return null;
    const nested = error['error'];
    if (isRecord(nested)) return nested;
    return error;
  }

  /**
   * Resets all mutable submission-related state after a successful submit:
   * changed rows, validation results, the uploaded document, and the proof-of-election form control.
   */
  private clearPostSubmitState(): void {
    this.changedRows.set(new Map());
    this.validationRowsById.clear();
    this.updateDocument.set(null);
    this.documentErrorMessage.set(null);
    this.validationState.set('NOT_VALIDATED');
    this.editingRowId.set(null);
    this.proofOfElectionForm.patchValue({ proofOfElection: null });
  }

  /**
   * Returns a copy of `row` with locally-edited or validated field values applied on top.
   * Priority order: changed payload → validated row → original server value.
   * @param row - The base server-loaded row to overlay.
   * @returns A new row object with any local edits and validation results merged in.
   */
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

  /**
   * Caches the latest-loaded rows by `_id` so edits and resets can reference the original data.
   * @param rows - The rows returned by the current page request.
   */
  private storeLoadedRows(rows: readonly EulbPostSubmissionUpdateRow[]): void {
    for (const row of rows) {
      this.loadedRowsById.set(row._id, row);
    }
  }

  /**
   * Emits on `editFormTeardown$` to complete all subscriptions tied to the current edit form.
   * Must be called before replacing `editForm` to prevent memory leaks.
   */
  private resetEditFormSubscriptions(): void {
    this.editFormTeardown$.next();
  }

  /**
   * Transitions `validationState` to STALE when the user modifies rows after a completed validation.
   * Reverts to NOT_VALIDATED instead when all local changes are cleared.
   */
  private markValidationStaleAfterLocalChange(): void {
    if (this.changedRows().size === 0) {
      this.validationState.set('NOT_VALIDATED');
      return;
    }

    if (this.validationState() === 'VALID' || this.validationState() === 'INVALID') {
      this.validationState.set('STALE');
    }
  }

  /**
   * Looks up the field config for a given column key within `pageRowEditFields`.
   * @param fieldKey - The column key to look up.
   * @returns The matching `ConditionalFieldConfig`, or undefined if the key isn't editable.
   */
  private getRowEditFieldConfig(fieldKey: string): ConditionalFieldConfig | undefined {
    return this.pageRowEditFields().find((f) => f.key === fieldKey);
  }

  /**
   * Converts a field config date constraint value (string, Date, or dynamic expression)
   * to the `YYYY-MM-DD` format required by `<input type="date">`.
   * @param value - A date constraint from a field's `minDate`/`maxDate` or validation entry.
   * @returns A `YYYY-MM-DD` string, or null when the value is empty or cannot be resolved.
   */
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

  /**
   * Wires `enabledWhen` conditions from the server-supplied field configs to the edit form.
   * Builds a dependency map from controller fields to dependent fields, then applies enable/disable
   * state immediately and whenever a controller field's value changes.
   * @param form - The edit FormGroup to wire conditions against.
   */
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

  /**
   * Evaluates each dependent field's `enabledWhen` condition against the current form values
   * and enables or disables the corresponding control accordingly.
   * Clears validators and resets error/touched state on disabled controls.
   * @param form - The edit FormGroup containing the controls to enable/disable.
   * @param deps - Map from controller key to the list of fields that depend on it.
   */
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

  /**
   * Subscribes to filter form changes and reloads the first page of rows on any change.
   * Debounces the free-text search by 400 ms to avoid flooding the API.
   */
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

  /** Navigates to the elected-body-status sibling route. */
  goToElectedBodyForm(): void {
    void this.router.navigate(['elected-body-status'], { relativeTo: this.activatedRoute.parent });
  }
}
